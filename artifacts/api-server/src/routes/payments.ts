import { Router, type Request, type Response } from "express";
import multer from "multer";
import { getAuth } from "../middlewares/supabaseAuth";
import { createHmac, createHash, randomUUID } from "crypto";
import rateLimit from "express-rate-limit";
import { db, users, orders, referrals, notifications, manualPayments, webhookLogs } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { paymentConfirmationEmail, sendEmail } from "../lib/email";
import { broadcastNotificationToUser } from "../lib/supabase";
import { MonitoringService } from "../lib/monitoring-service";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import { VelocityService } from "../lib/velocity-service";
import { requireTurnstile } from "../lib/turnstile-service";
import { requireActiveAccount } from "../middlewares/accountStatusMiddleware";
import { AdminEventService } from "../lib/admin-event-service";

const router = Router();

// Multer setup for file uploads (proof)
const ALLOWED_PROOF_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(), // SECURITY: Use memory storage → upload to Supabase Storage (not local disk)
  limits: { fileSize: MAX_PROOF_FILE_SIZE },
  fileFilter: (_req: any, file: { mimetype: string }, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (ALLOWED_PROOF_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPEG, PNG, WebP, PDF"));
    }
  },
});

// Manual bank transfer endpoint
router.post("/manual-bank-transfer", upload.single("proof"), requireActiveAccount, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const { reference, amount, planType, billing, referralCode, couponCode } = req.body || {};
    const proofFile = req.file;

    const user = await getOrCreateUser(auth?.userId, billing || null);
    if (!user) {
      return res.status(400).json({ success: false, message: "Valid billing email is required to submit bank transfer." });
    }
    const refStr = typeof reference === "string" ? reference.trim() : "";
    if (!refStr || refStr.length < 6) {
      return res.status(400).json({ success: false, message: "Invalid reference number." });
    }
    if (!amount || typeof amount !== "number" || amount < 1 || amount > 1000000) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    if (!proofFile) {
      return res.status(400).json({ success: false, message: "Proof of payment is required." });
    }
    const validPlanTypes: PlanType[] = ["flash", "instant", "1step", "2step"];
    if (!planType || !validPlanTypes.includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid plan type." });
    }

    // Store as pending for admin review
    const [order] = await db.insert(orders).values({
      userId: user.id,
      amount,
      accountSize: resolveAccountSize(planType as PlanType, typeof req.body.sizeIndex === "number" ? req.body.sizeIndex : 0) || 0,
      planType,
      status: "pending_review",
      paymentMethod: "bank_manual",
      utrReference: refStr,
    }).returning();

    // Notify admin panel of new manual payment requiring review
    AdminEventService.notifyManualReviewRequired({
      orderId: order.id,
      userId: user.id,
      amount,
      paymentMethod: "bank_manual",
      reference: refStr,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      orderId: order.id,
      message: "Bank transfer submitted for review. Admin will verify and activate your account soon.",
    });
  } catch (err) {
    req.log?.error?.({ err }, "manual_bank_transfer_failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


const OXAPAY_MERCHANT_API_KEY = process.env.OXAPAY_MERCHANT_API_KEY || "";
const OXAPAY_API_URL = "https://api.oxapay.com/merchants/request";
const OXAPAY_INQUIRY_URL = "https://api.oxapay.com/merchants/inquiry";

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Please try again in 15 minutes." },
});

const CURRENCY_MAP: Record<string, string> = {
  "oxapay-usdt-trc20": "USDT",
  "oxapay-usdt-bep20": "USDT",
  "oxapay-usdt-erc20": "USDT",
  "oxapay-btc": "BTC",
  "oxapay-eth": "ETH",
  "oxapay-ltc": "LTC",
};

const NETWORK_MAP: Record<string, string> = {
  "oxapay-usdt-trc20": "TRC20",
  "oxapay-usdt-bep20": "BEP20",
  "oxapay-usdt-erc20": "ERC20",
  "oxapay-btc": "BTC",
  "oxapay-eth": "ETH",
  "oxapay-ltc": "LTC",
};

type PlanType = "flash" | "instant" | "1step" | "2step";

interface PlanSize {
  size: string;
  accountSize: number; // Actual challenge account size in INR (e.g. 500000)
  fee: number;
}

const SERVER_PLANS: Record<PlanType, { label: string; sizes: PlanSize[] }> = {
  flash: {
    label: "Flash Challenge",
    sizes: [
      { size: "₹50,000", accountSize: 50000, fee: 1999 },
      { size: "₹1,00,000", accountSize: 100000, fee: 3499 },
      { size: "₹2,50,000", accountSize: 250000, fee: 7499 },
      { size: "₹5,00,000", accountSize: 500000, fee: 11499 },
      { size: "₹10,00,000", accountSize: 1000000, fee: 19499 },
    ],
  },
  instant: {
    label: "Instant Funding",
    sizes: [
      { size: "₹1,00,000", accountSize: 100000, fee: 4999 },
      { size: "₹5,00,000", accountSize: 500000, fee: 11999 },
      { size: "₹10,00,000", accountSize: 1000000, fee: 21999 },
    ],
  },
  "1step": {
    label: "1-Step Evaluation",
    sizes: [
      { size: "₹1,00,000", accountSize: 100000, fee: 2999 },
      { size: "₹5,00,000", accountSize: 500000, fee: 11999 },
      { size: "₹10,00,000", accountSize: 1000000, fee: 21999 },
      { size: "₹25,00,000", accountSize: 2500000, fee: 48499 },
    ],
  },
  "2step": {
    label: "2-Step Evaluation",
    sizes: [
      { size: "₹5,00,000", accountSize: 500000, fee: 11999 },
      { size: "₹10,00,000", accountSize: 1000000, fee: 21999 },
      { size: "₹25,00,000", accountSize: 2500000, fee: 48499 },
    ],
  },
};

/**
 * Resolve the actual challenge account size from plan type and size index.
 * This is the VIRTUAL BALANCE the user trades with — NOT the fee they paid.
 */
function resolveAccountSize(planType: PlanType, sizeIndex: number): number | null {
  const plan = SERVER_PLANS[planType];
  if (!plan) return null;
  const size = plan.sizes[sizeIndex];
  if (!size) return null;
  return size.accountSize;
}

const VALID_COUPONS: Record<string, number> = {
  FLASH: 60,
  INSTANT: 55,
  FW: 65,
  FW70: 70,
  WELCOME: 10,
};

function computeServerTotal(
  planType: PlanType,
  sizeIndex: number,
  couponCode?: string
): { baseFee: number; total: number; finalTotal: number; discount: number } | null {
  const plan = SERVER_PLANS[planType];
  if (!plan) return null;
  const size = plan.sizes[sizeIndex];
  if (!size) return null;

  const baseFee = size.fee;
  const total = baseFee;

  let discount = 0;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      discount = VALID_COUPONS[code];
    }
  }

  const finalTotal = discount > 0 ? Math.round(total * (1 - discount / 100)) : total;

  return { baseFee, total, finalTotal, discount };
}

async function createReferralConversion(
  clerkUserId: string,
  referralCode: string | undefined,
  planType: string,
  sizeIndex: number,
  amount: number,
  email?: string
) {
  if (!referralCode) return;

  const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  const user = existingUser[0];
  if (!user) return;

  if (user.referredBy) {
    return;
  }

  const referrer = await db
    .select()
    .from(users)
    .where(eq(users.affiliateCode, referralCode))
    .limit(1);
  const referrerUser = referrer[0];
  if (!referrerUser || referrerUser.id === user.id) {
    return;
  }

  const existingReferral = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.referralCode, referralCode), eq(referrals.referredUserId, user.id)));
  if (existingReferral.length > 0) return;

  const commissionAmount = Math.round(amount * 0.1);
  await db.insert(referrals).values({
    referrerUserId: referrerUser.id,
    referredUserId: user.id,
    referralCode,
    referredEmail: email || user.email,
    planPurchased: `${planType}:${sizeIndex}`,
    purchaseAmount: amount,
    commissionAmount,
    status: "paid",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.update(users).set({ referredBy: referralCode, updatedAt: new Date() }).where(eq(users.id, user.id));

  const notificationContent = `Your referral code ${referralCode} converted a purchase worth ₹${amount}. Commission ₹${commissionAmount} is now recorded.`;
  await db.insert(notifications).values({
    userId: referrerUser.id,
    type: "referral",
    title: "Referral conversion recorded",
    message: notificationContent,
    isRead: false,
    createdAt: new Date(),
  });

  try {
    if (referrerUser.clerkId) {
      await broadcastNotificationToUser(referrerUser.clerkId, {
        title: "Referral conversion recorded",
        body: notificationContent,
      });
    }
  } catch (error) {
    console.error("Failed to broadcast referral notification:", error);
  }
}

interface BillingInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
}

async function normalizeEmail(email: string | undefined): Promise<string | null> {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

async function getOrCreateUser(authUserId: string | undefined | null, billing: BillingInfo | null) {
  const normalizedEmail = await normalizeEmail(billing?.email);
  if (authUserId) {
    const existing = await db.select().from(users).where(eq(users.clerkId, authUserId)).limit(1);
    if (existing[0]) return existing[0];
  }

  if (normalizedEmail) {
    const existingByEmail = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existingByEmail[0]) return existingByEmail[0];
  }

  if (!normalizedEmail) return null;

  const [newUser] = await db.insert(users).values({
    clerkId: `guest_${randomUUID()}`,
    email: normalizedEmail,
    firstName: billing?.firstName || billing?.name || "",
    lastName: billing?.lastName || "",
    phone: billing?.phone || "",
    city: billing?.city || "",
    state: billing?.state || "",
    role: "user",
  }).returning();

  return newUser;
}

// ---------------------------------------------------------------------------
// Terminal Provisioning Trigger
//
// After a payment is confirmed, main site inserts a pending row into the shared
// `provisioning_logs` table. The terminal picks this up and creates the actual
// challenge_accounts + trading_accounts records.
//
// This replaces the old createTradingAccountForPayment() function which
// incorrectly inserted rows into the terminal-owned `trading_accounts` table.
// ---------------------------------------------------------------------------
async function triggerTerminalProvisioning(
  orderId: string,
  planType: PlanType,
  paymentMethod: string,
  paymentRef: string | null,
) {
  await db.execute(sql`
    INSERT INTO provisioning_logs (order_id, plan, payment_method, payment_ref, source, status, started_at, created_at)
    VALUES (${orderId}, ${planType}, ${paymentMethod}, ${paymentRef}, 'website', 'pending', now(), now())
  `);
}

// ---------------------------------------------------------------------------
// P0-5 FIX: pendingPayments Map removed.
//
// BEFORE: const pendingPayments = new Map<string, { ... }>()
//   - Process-local variable, wiped on every server restart.
//   - Any OxaPay webhook arriving after a restart silently skipped
//     provisioning because pendingPayments.get(trackId) returned undefined.
//
// AFTER: All payment state is read from the `orders` DB table.
//   - orders are inserted before the OxaPay API call returns a trackId.
//   - utrReference column stores the OxaPay trackId.
//   - On webhook: look up the order by utrReference=trackId → fully durable.
//   - Idempotency: webhook_logs table (already in schema) used to detect
//     duplicate deliveries before any provisioning runs.
// ---------------------------------------------------------------------------

router.post("/create-crypto-payment", paymentLimiter, requireActiveAccount, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const { paymentMethod, planType, sizeIndex, couponCode, referralCode, billing } = req.body;

    if (!paymentMethod || !planType || sizeIndex === undefined) {
      res.status(400).json({ error: "Missing required fields: paymentMethod, planType, sizeIndex" });
      return;
    }

    if (!OXAPAY_MERCHANT_API_KEY) {
      res.status(500).json({ error: "OxaPay merchant API key not configured" });
      return;
    }

    const oxaCurrency = CURRENCY_MAP[paymentMethod];
    const oxaNetwork = NETWORK_MAP[paymentMethod];

    if (!oxaCurrency || !oxaNetwork) {
      res.status(400).json({ error: "Invalid payment method" });
      return;
    }

    const pricing = computeServerTotal(planType as PlanType, sizeIndex, couponCode);
    if (!pricing) {
      res.status(400).json({ error: "Invalid plan or size selection" });
      return;
    }

    const user = await getOrCreateUser(auth?.userId, billing || null);
    if (!user) {
      res.status(400).json({ error: "Guest checkout requires a valid billing email." });
      return;
    }

    // IPQS VPN/Proxy detection for challenge purchase (non-blocking)
    const purchaseIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // Get real device fingerprint from frontend (FingerprintJS visitorId)
    const purchaseFingerprint =
      (req.headers["x-device-fingerprint"] as string) ||
      req.body.deviceFingerprint ||
      req.headers["user-agent"] ||
      "unknown";

    IPIntelligenceService.lookupAndStore(purchaseIp, user.id, "challenge_purchase").catch((err) => {
      console.error("[IPQS] Challenge purchase lookup failed:", err);
    });

    // Run fraud detection in background
    FraudDetectionService.detectAndScore({
      userId: user.id,
      ipAddress: purchaseIp,
      deviceFingerprint: purchaseFingerprint,
      country: "unknown",
      trigger: "challenge_purchase",
    }).catch((err) => {
      console.error("[FraudDetection] Challenge purchase scoring failed:", err);
    });

    // Track challenge purchase velocity + check farming
    const velocityCheck = await VelocityService.recordAndCheck(
      "challenge_purchase", user.id, purchaseIp, purchaseFingerprint
    );
    if (velocityCheck.velocityRisk >= 40) {
      return res.status(429).json({
        error: "Too many purchases in a short time. Please try again later.",
        code: "VELOCITY_LIMIT",
      });
    }

    // Check challenge farming (repeated failures + new purchase)
    VelocityService.checkChallengeFarming(user.id, purchaseFingerprint).catch(() => { });

    const orderId = `FW-${(auth?.userId ?? user.id.toString()).slice(-6)}-S${sizeIndex}-${Date.now()}`;
    const callbackUrl = process.env.OXAPAY_CALLBACK_URL || `${process.env.API_BASE_URL || ""}/api/payments/oxapay-webhook`;
    const returnUrl = process.env.OXAPAY_RETURN_URL || `${process.env.FRONTEND_URL || ""}/payment-pending`;

    const payload = {
      merchant: OXAPAY_MERCHANT_API_KEY,
      amount: pricing.finalTotal,
      currency: "INR",
      payCurrency: oxaCurrency,
      network: oxaNetwork,
      lifeTime: 30,
      feePaidByPayer: 0,
      underPaidCover: 2.5,
      callbackUrl,
      returnUrl,
      orderId,
      description: `FundedWealth ${SERVER_PLANS[planType as PlanType].label} - ${SERVER_PLANS[planType as PlanType].sizes[sizeIndex].size}`,
    };

    const response = await fetch(OXAPAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { result: number; trackId?: string; payLink?: string; expiredAt?: string; message?: string };

    if (data.result === 100) {
      const [order] = await db.insert(orders).values({
        userId: user.id,
        amount: pricing.finalTotal,
        accountSize: resolveAccountSize(planType as PlanType, sizeIndex) || 0,
        planType,
        status: "pending",
        paymentMethod: paymentMethod,
        utrReference: data.trackId,
      }).returning();

      // P0-5 FIX: State is now fully in the DB (order row above).
      // trackId = orders.utrReference — survives restarts, scales horizontally.
      console.log(`[OxaPay] Payment created: trackId=${data.trackId} orderId=${orderId} amount=₹${pricing.finalTotal} user=${user.clerkId} dbOrderId=${order.id}`);

      res.json({
        success: true,
        trackId: data.trackId,
        payLink: data.payLink,
        expiredAt: data.expiredAt,
        amount: pricing.finalTotal,
      });
    } else {
      console.error("OxaPay error:", JSON.stringify(data));
      res.status(400).json({
        error: "Payment creation failed",
        message: data.message || "Unknown error from OxaPay",
        details: process.env.NODE_ENV !== "production" ? data : undefined,
      });
    }
  } catch (error) {
    console.error("OxaPay payment creation error:", error);
    res.status(500).json({ error: "Internal server error creating payment" });
  }
});

function verifyOxapayHmac(body: any, receivedHmac: string): boolean {
  if (!OXAPAY_MERCHANT_API_KEY) return false;
  const sorted = Object.keys(body)
    .filter((k) => k !== "hmac")
    .sort()
    .reduce((acc: any, key) => { acc[key] = body[key]; return acc; }, {});
  const message = Object.values(sorted).join("");
  const computed = createHmac("sha512", OXAPAY_MERCHANT_API_KEY).update(message).digest("hex");
  return computed === receivedHmac;
}

router.post("/oxapay-webhook", async (req: Request, res: Response) => {
  try {
    const { trackId, status, orderId, amount, txID, hmac: receivedHmac } = req.body;

    // CRITICAL: HMAC validation is mandatory for all Oxapay webhooks
    if (!receivedHmac) {
      console.warn(`[OxaPay Webhook] REJECTED: Missing HMAC signature for trackId=${trackId}`);
      res.status(403).json({ error: "Invalid signature: missing HMAC" });
      return;
    }

    if (!verifyOxapayHmac(req.body, receivedHmac)) {
      console.warn(`[OxaPay Webhook] HMAC verification FAILED for trackId=${trackId}`);
      res.status(403).json({ error: "Invalid signature" });
      return;
    }

    console.log(`[OxaPay Webhook] trackId=${trackId} status=${status} orderId=${orderId} amount=${amount} txID=${txID || "N/A"}`);

    // ── P0-5 FIX: Idempotency via webhook_logs ─────────────────────────────
    // OxaPay may deliver the same event multiple times. A duplicate "Paid"
    // callback would create a second trading account without this guard.
    // Use trackId+status as the composite idempotency key.
    const idempotencyKey = `oxapay:${trackId}:${status}`;
    const existingLog = await db
      .select({ id: webhookLogs.id, status: webhookLogs.status })
      .from(webhookLogs)
      .where(eq(webhookLogs.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existingLog.length > 0) {
      console.log(`[OxaPay Webhook] Duplicate delivery for trackId=${trackId} status=${status} — skipping`);
      res.json({ status: "ok" });
      return;
    }

    // Write log entry (PENDING) before processing — also acts as duplicate lock
    const [logEntry] = await db.insert(webhookLogs).values({
      provider: "oxapay",
      eventType: status ?? "unknown",
      idempotencyKey,
      signature: receivedHmac,
      isSignatureValid: true,
      payload: req.body ?? {},
      status: "PENDING",
    }).returning().catch(() => [] as any[]);

    if (!logEntry) {
      // Unique constraint on idempotencyKey fired — race-condition duplicate
      console.log(`[OxaPay Webhook] Race-condition duplicate for trackId=${trackId} — skipping`);
      res.json({ status: "ok" });
      return;
    }

    // ── P0-5 FIX: Load order from DB instead of in-memory Map ─────────────
    // Before: relied on pendingPayments.get(trackId) — lost after restart
    // After:  query orders table where utrReference = trackId — always durable
    const [dbOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.utrReference, trackId))
      .limit(1);

    let processingError: string | null = null;

    switch (status) {
      case "Waiting":
        console.log(`[OxaPay] Payment ${trackId} waiting for funds...`);
        break;

      case "Confirming":
        console.log(`[OxaPay] Payment ${trackId} confirming on blockchain...`);
        // Update order status to reflect on-chain progress
        if (dbOrder) {
          await db.update(orders)
            .set({ status: "confirming", updatedAt: new Date() })
            .where(eq(orders.id, dbOrder.id))
            .catch(() => { });
        }
        break;

      case "Paid": {
        console.log(`[OxaPay] Payment ${trackId} CONFIRMED. TX: ${txID}`);

        if (!dbOrder) {
          // Order not found — this can happen if create-crypto-payment failed
          // after the OxaPay API call. Log and alert — needs manual recovery.
          processingError = `No order found in DB for trackId=${trackId}. Manual recovery required.`;
          console.error(`[OxaPay] CRITICAL: ${processingError}`);
          break;
        }

        // Already provisioned guard (e.g. from a previous Paid delivery)
        if (dbOrder.status === "confirmed") {
          console.log(`[OxaPay] Order ${dbOrder.id} already confirmed — skipping re-provisioning`);
          break;
        }

        try {
          // 1. Update order: confirmed + final txID
          await db.update(orders)
            .set({ status: "confirmed", utrReference: txID || trackId, updatedAt: new Date() })
            .where(eq(orders.id, dbOrder.id));

          // 2. Load the user from DB (clerkId stored on the user row)
          const [user] = await db.select().from(users).where(eq(users.id, dbOrder.userId)).limit(1);

          if (!user) {
            throw new Error(`User id=${dbOrder.userId} not found for order ${dbOrder.id}`);
          }

          // Block provisioning for restricted/suspended/banned accounts
          if (user.accountStatus && ["restricted", "suspended", "banned"].includes(user.accountStatus)) {
            processingError = `Account ${user.accountStatus} — provisioning blocked for user ${user.id}`;
            console.warn(`[OxaPay] ${processingError}`);
            break;
          }

          // 3. Trigger terminal provisioning
          await triggerTerminalProvisioning(
            dbOrder.id,
            dbOrder.planType as PlanType,
            "crypto",
            txID || trackId,
          );

          // 4. Notify admin panel of confirmed payment
          AdminEventService.notifyPaymentReceived({
            orderId: dbOrder.id,
            userId: user.id,
            amount: dbOrder.amount,
            paymentMethod: "crypto",
            planType: dbOrder.planType,
            accountSize: dbOrder.accountSize || undefined,
          }).catch(() => {});

          // 5. Referral conversion (best-effort)
          await createReferralConversion(
            user.clerkId,
            undefined, // referralCode not stored on order; future: add column
            dbOrder.planType,
            0,
            dbOrder.amount,
            user.email,
          ).catch((e) => console.warn("[OxaPay] Referral conversion failed:", e));

          // 6. Confirmation email (non-blocking)
          paymentConfirmationEmail(
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Trader",
            user.email,
            txID || trackId,
            String(dbOrder.amount),
            `${dbOrder.planType} Plan - Crypto Payment`,
          ).catch((e) => console.error("[EMAIL] OxaPay confirmation failed:", e));

          console.log(`[OxaPay] Provisioning complete for order ${dbOrder.id} user=${user.clerkId}`);
        } catch (err: unknown) {
          processingError = (err as Error).message;
          console.error(`[OxaPay] Provisioning failed for order ${dbOrder.id}:`, err);
          // Notify admin of provisioning failure
          AdminEventService.notifyProvisioningFailed({
            orderId: dbOrder.id,
            userId: dbOrder.userId,
            errorMessage: processingError,
          }).catch(() => {});
        }
        break;
      }

      case "Failed":
        console.log(`[OxaPay] Payment ${trackId} FAILED`);
        if (dbOrder) {
          await db.update(orders)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(orders.id, dbOrder.id))
            .catch(() => { });
        }
        break;

      case "Expired":
        console.log(`[OxaPay] Payment ${trackId} EXPIRED`);
        if (dbOrder) {
          await db.update(orders)
            .set({ status: "expired", updatedAt: new Date() })
            .where(eq(orders.id, dbOrder.id))
            .catch(() => { });
        }
        break;

      default:
        console.log(`[OxaPay] Unknown status ${status} for ${trackId}`);
    }

    // Mark webhook log as PROCESSED or FAILED
    await db.update(webhookLogs)
      .set({
        status: processingError ? "FAILED" : "PROCESSED",
        processedAt: processingError ? undefined : new Date(),
        errorMessage: processingError ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(webhookLogs.id, logEntry.id))
      .catch(() => { });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("OxaPay webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.get("/payment-status/:trackId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const trackId = req.params.trackId as string;

    if (!trackId) {
      res.status(400).json({ error: "trackId is required" });
      return;
    }

    // If the user is signed in, enforce ownership for this order.
    // If the user is not authenticated, allow a status lookup by trackId
    // because guest crypto checkout may return to the pending page without auth.
    if (auth?.userId) {
      const [dbOrder] = await db
        .select({ userId: orders.userId })
        .from(orders)
        .where(eq(orders.utrReference, trackId))
        .limit(1);

      if (dbOrder) {
        const [dbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, auth.userId))
          .limit(1);

        if (!dbUser || dbOrder.userId !== dbUser.id) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
      }
    }

    if (!OXAPAY_MERCHANT_API_KEY) {
      res.status(500).json({ error: "OxaPay merchant API key not configured" });
      return;
    }

    const response = await fetch(OXAPAY_INQUIRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: OXAPAY_MERCHANT_API_KEY,
        trackId,
      }),
    });

    const data = (await response.json()) as { result: number; trackId?: string; status?: string; amount?: number; txID?: string; message?: string; currency?: string; network?: string; date?: string };

    if (data.result === 100) {
      res.json({
        success: true,
        trackId: data.trackId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        network: data.network,
        date: data.date,
      });
    } else {
      res.status(400).json({
        error: "Could not fetch payment status",
        message: data.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("OxaPay status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Provisioning Status (public, no auth required) ──────────────────────────
// Used by payment-pending page to poll provisioning progress for both
// authenticated and guest (billing-email-only) checkout flows.
router.get("/provisioning-status/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;

    if (!orderId || orderId.length < 10) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    // 1. Verify order exists
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. Check provisioning_logs for this order
    const provResult = await db.execute(sql`
      SELECT
        status,
        error_message,
        trading_account_id,
        challenge_account_id,
        completed_at
      FROM provisioning_logs
      WHERE order_id = ${orderId}
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const prov = (provResult.rows as any[])[0];

    // No provisioning entry yet — order is paid but provisioning hasn't started
    if (!prov) {
      return res.json({ success: true, status: "pending" });
    }

    if (prov.status === "pending" || prov.status === "processing") {
      return res.json({ success: true, status: "pending" });
    }

    if (prov.status === "failed") {
      return res.json({
        success: true,
        status: "failed",
        error: prov.error_message || "Provisioning failed. Please contact support.",
      });
    }

    if (prov.status === "completed") {
      // Only return "completed" when trading_accounts record exists and is active.
      // If provisioning_logs says completed but account isn't usable yet, keep pending.
      if (!prov.trading_account_id) {
        return res.json({ success: true, status: "pending" });
      }

      const taResult = await db.execute(sql`
        SELECT id, status FROM trading_accounts
        WHERE id = ${prov.trading_account_id}::uuid
        LIMIT 1
      `);
      const ta = (taResult.rows as any[])[0];

      if (!ta || ta.status !== "active") {
        return res.json({ success: true, status: "pending" });
      }

      return res.json({
        success: true,
        status: "completed",
        accountId: ta.id,
        canLaunch: true,
      });
    }

    // Fallback for unknown status
    return res.json({ success: true, status: "pending" });
  } catch (err) {
    req.log?.error?.({ err }, "provisioning_status_check_failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-utr", paymentLimiter, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const { utr, amount, planType, sizeIndex, billing, referralCode, couponCode } = req.body || {};

    // Soft auth check: if user exists and is restricted, block.
    // Unlike other endpoints, we allow unauthenticated requests with valid billing info
    // because the UPI QR flow may have session timing issues.
    if (auth?.userId) {
      const [existingUser] = await db
        .select({ accountStatus: users.accountStatus })
        .from(users)
        .where(eq(users.clerkId, auth.userId))
        .limit(1);
      if (existingUser) {
        const status = existingUser.accountStatus || "active";
        if (["banned", "suspended", "restricted"].includes(status)) {
          return res.status(403).json({
            success: false,
            message: "Account restricted. Payment received but provisioning blocked. Contact support.",
            code: "ACCOUNT_RESTRICTED",
          });
        }
      }
    }

    const user = await getOrCreateUser(auth?.userId, billing || null);
    if (!user) {
      return res.status(400).json({ success: false, message: "Valid billing email is required to submit UTR." });
    }
    const utrStr = typeof utr === "string" ? utr.trim() : "";
    if (!utrStr || utrStr.length < 10 || utrStr.length > 12 || !/^\d+$/.test(utrStr)) {
      return res.status(400).json({ success: false, message: "Invalid UTR. Must be 10-12 digits." });
    }

    if (!amount || typeof amount !== "number" || amount < 1 || amount > 1000000) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const validPlanTypes: PlanType[] = ["flash", "instant", "1step", "2step"];
    if (!planType || !validPlanTypes.includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid plan type." });
    }

    // SECURITY: Server-side price validation — prevent underpayment attacks
    const expectedPricing = computeServerTotal(planType as PlanType, typeof sizeIndex === "number" ? sizeIndex : 0, couponCode);
    if (!expectedPricing) {
      return res.status(400).json({ success: false, message: "Invalid plan/size combination." });
    }
    if (amount < expectedPricing.finalTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount ₹${amount} is less than the required ₹${expectedPricing.finalTotal} for this plan.`,
      });
    }

    // ── Duplicate UTR check — prevent double-claiming ───────────────────────
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.utrReference, utrStr))
      .limit(1);

    if (existingOrder.length > 0) {
      const existing = existingOrder[0];
      if (existing.status === "paid" || existing.status === "confirmed") {
        // Already provisioned — return success (idempotent)
        return res.status(200).json({
          success: true,
          alreadyVerified: true,
          message: "This UTR has already been verified. Your account is being provisioned.",
          orderId: existing.id,
        });
      }
      // If pending/under_review — don't allow re-claim
      return res.status(409).json({
        success: false,
        message: "This UTR is already associated with a payment. If this is your payment, please wait for verification or contact support.",
      });
    }

    const utrMasked = `****${utrStr.slice(-4)}`;
    req.log.info({ utrMasked, amount, planType, userId: auth?.userId }, "manual_upi_utr_submitted");

    // Resolve actual challenge account size from plan + sizeIndex
    const accountSize = resolveAccountSize(planType as PlanType, typeof sizeIndex === "number" ? sizeIndex : 0);
    if (!accountSize) {
      return res.status(400).json({ success: false, message: "Could not resolve account size for plan/size selection." });
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        userId: user.id,
        amount,         // fee paid
        accountSize: Math.round(accountSize),  // actual challenge size
        planType,
        status: "paid",
        paymentMethod: "upi_manual",
        utrReference: utrStr,
      }).returning();

      return { order };
    });

    // Trigger terminal provisioning after order is durably committed
    await triggerTerminalProvisioning(
      result.order.id,
      planType as PlanType,
      "upi_manual",
      utrStr,
    );

    await sendEmail({
      to: user.email,
      subject: "FundedWealth - Payment Received! Account Being Provisioned",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0b0722; color: white; padding: 32px; border-radius: 24px;">
          <h1 style="color: #FF8A3D; margin-bottom: 16px;">FundedWealth - Payment Received!</h1>
          <p style="color: rgba(255,255,255,0.8);">Hi ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader"},</p>
          <p style="color: rgba(255,255,255,0.8);">Your UPI payment has been received and your trading account is being provisioned.</p>
          <ul style="color: rgba(255,255,255,0.9); line-height: 1.8; margin-top: 24px;">
            <li><strong>Order ID:</strong> ${result.order.id}</li>
            <li><strong>Amount paid:</strong> ₹${amount.toLocaleString("en-IN")}</li>
            <li><strong>Plan type:</strong> ${planType}</li>
            <li><strong>Status:</strong> Provisioning in progress</li>
          </ul>
          <p style="color: rgba(255,255,255,0.75); margin-top: 24px;">You'll receive another email once your account is fully activated. Check your dashboard for updates.</p>
        </div>
      `,
    }).catch((emailError) => {
      req.log.error({ emailError, userId: auth?.userId }, "utr_payment_received_email_failed");
    });

    // Notify admin panel of confirmed UPI payment
    AdminEventService.notifyPaymentReceived({
      orderId: result.order.id,
      userId: user.id,
      amount,
      paymentMethod: "upi_manual",
      planType,
      accountSize: Math.round(accountSize),
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      orderId: result.order.id,
      provisioningStatus: "pending",
      message: "Payment received. Your account is being provisioned.",
    });
  } catch (err) {
    req.log.error({ err }, "verify_utr_failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manual Payment Submission Endpoint
router.post("/submit-manual-payment", upload.single("proof"), requireActiveAccount, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { orderId, method, amount, utr, reference, upiId } = req.body;
    const proofFile = req.file;

    // Validate inputs
    if (!orderId || !method || !amount || !proofFile) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!["upi", "bank"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    if (method === "upi" && !utr) {
      return res.status(400).json({ success: false, message: "UTR is required for UPI payments" });
    }

    if (method === "bank" && !reference) {
      return res.status(400).json({ success: false, message: "Reference number is required for bank transfers" });
    }

    // Verify order exists and belongs to user
    const order = (await db.select().from(orders).where(eq(orders.id, String(orderId)))).at(0);
    if (!order || order.userId !== (await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1))[0]?.id) {
      return res.status(403).json({ success: false, message: "Order not found or access denied" });
    }

    // Get user
    const user = (await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1))[0];
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // SECURITY: Upload proof to Supabase Storage (not local disk)
    let proofUrl = "";
    const { supabaseAdmin } = await import("../lib/supabase");
    if (supabaseAdmin && proofFile.buffer) {
      const storagePath = `payment-proofs/${user.id}/${Date.now()}-${proofFile.originalname}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("payment-proofs")
        .upload(storagePath, proofFile.buffer, {
          contentType: proofFile.mimetype || "application/octet-stream",
        });

      if (uploadError) {
        return res.status(500).json({ success: false, message: "Failed to upload proof file" });
      }

      // Generate signed URL (1 year)
      const { data: signedData } = await supabaseAdmin.storage
        .from("payment-proofs")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

      proofUrl = signedData?.signedUrl || storagePath;
    } else {
      proofUrl = `memory://${proofFile.originalname}`;
    }

    // Store manual payment record
    const [manualPayment] = await db.insert(manualPayments).values({
      orderId: String(orderId),
      userId: user.id,
      paymentMethod: method,
      amount: String(parseFloat(amount)),
      currency: "INR",
      upiId: method === "upi" ? upiId : null,
      utr: method === "upi" ? utr : null,
      reference: method === "bank" ? reference : null,
      proofUrl,
      proofFileName: proofFile.originalname,
      status: "pending",
      metadata: {
        submittedAt: new Date().toISOString(),
        ipAddress: req.ip,
      },
    }).returning();

    // Update order status to pending_review
    await db.update(orders).set({ status: "pending_review" }).where(eq(orders.id, String(orderId)));

    req.log?.info?.({ paymentId: manualPayment.id, method, orderId }, "manual_payment_submitted");

    return res.status(200).json({
      success: true,
      paymentId: manualPayment.id,
      message: "Payment submitted for verification. Admin will review within 24 hours.",
      status: "under_review",
    });
  } catch (err) {
    req.log?.error?.({ err }, "submit_manual_payment_failed");
    return res.status(500).json({ success: false, message: "Server error submitting payment" });
  }
});

// Get pending manual payments for admin
router.get("/admin/manual-payments/pending", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Check if user is admin
    const ADMIN_ROLES = ["super_admin", "admin", "finance"];
    const user = (await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1))[0];
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Get pending payments with user and order details
    const pendingPayments = await db.select().from(manualPayments)
      .where(eq(manualPayments.status, "pending"))
      .limit(50);

    const enriched = await Promise.all(
      pendingPayments.map(async (payment) => {
        const orderData = payment.orderId ? (await db.select().from(orders).where(eq(orders.id, payment.orderId))).at(0) : undefined;
        const userData = (await db.select().from(users).where(eq(users.id, payment.userId))).at(0);
        return {
          ...payment,
          order: orderData,
          user: userData ? { id: userData.id, email: userData.email, firstName: userData.firstName, lastName: userData.lastName } : null,
        };
      })
    );

    return res.json({ success: true, payments: enriched });
  } catch (err) {
    req.log?.error?.({ err }, "get_pending_payments_failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Approve manual payment
router.post("/admin/approve-payment/:paymentId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { paymentId } = req.params;

    // Check admin role
    const reviewer = (await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1))[0];
    if (!reviewer || !["super_admin", "admin", "finance"].includes(reviewer.role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const payment = (await db.select().from(manualPayments).where(eq(manualPayments.id, parseInt(paymentId as string)))).at(0);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Update payment status
    const [approvedPayment] = await db.update(manualPayments)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(manualPayments.id, parseInt(paymentId as string)))
      .returning();

    // Update order status
    if (payment.orderId) {
      await db.update(orders)
        .set({ status: "confirmed" })
        .where(eq(orders.id, payment.orderId));
    }

    // Get user and order details
    const user = (await db.select().from(users).where(eq(users.id, payment.userId))).at(0);
    const orderData = payment.orderId ? (await db.select().from(orders).where(eq(orders.id, payment.orderId))).at(0) : undefined;

    // Create trading account if it doesn't exist
    if (user && orderData) {
      // Trigger terminal provisioning instead of creating account locally
      await triggerTerminalProvisioning(
        orderData.id,
        orderData.planType as PlanType,
        "bank_manual",
        payment.reference || payment.utr || null,
      );

      // Send approval email
      sendEmail({
        to: user.email,
        subject: "FundedWealth - Payment Approved! Your Account is Ready ✓",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0b0722; color: white; padding: 32px; border-radius: 24px;">
            <h1 style="color: #10b981; margin-bottom: 16px;">✓ Payment Approved!</h1>
            <p style="color: rgba(255,255,255,0.8);">Hi ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader"},</p>
            <p style="color: rgba(255,255,255,0.8);">Your payment has been verified and approved by our admin team. Your trading account is now fully activated and ready to use.</p>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 20px; margin-top: 24px;">
              <h2 style="color: #10b981; margin-top: 0;">Account Details</h2>
              <ul style="color: rgba(255,255,255,0.9); line-height: 1.8; margin-bottom: 0;">
                <li><strong>Payment Amount:</strong> ₹${parseFloat(payment.amount.toString()).toFixed(2)}</li>
                <li><strong>Plan Type:</strong> ${orderData.planType}</li>
                <li><strong>Status:</strong> Active & Ready to Trade</li>
              </ul>
            </div>
            <p style="color: rgba(255,255,255,0.8); margin-top: 24px;">Log in to your dashboard to view your trading account details and begin trading.</p>
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 32px;">If you have any questions, reply to this email or contact our support team.</p>
          </div>
        `,
      }).catch((emailError) => {
        req.log?.error?.({ emailError, userId: user.id }, "approval_email_failed");
      });
    }

    req.log?.info?.({ paymentId, reviewedBy: reviewer.id }, "payment_approved");

    return res.json({
      success: true,
      message: "Payment approved successfully. User notification sent.",
      payment: approvedPayment,
    });
  } catch (err) {
    req.log?.error?.({ err }, "approve_payment_failed");
    return res.status(500).json({ success: false, message: "Server error approving payment" });
  }
});

// Reject manual payment
router.post("/admin/reject-payment/:paymentId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    // Check admin role
    const reviewer = (await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1))[0];
    if (!reviewer || !["super_admin", "admin", "finance"].includes(reviewer.role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const payment = (await db.select().from(manualPayments).where(eq(manualPayments.id, parseInt(paymentId as string)))).at(0);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Update payment status
    const [rejectedPayment] = await db.update(manualPayments)
      .set({
        status: "rejected",
        rejectionReason,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(manualPayments.id, parseInt(paymentId as string)))
      .returning();

    // Update order status to rejected
    if (payment.orderId) {
      await db.update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, payment.orderId));
    }

    // Send rejection email
    const user = (await db.select().from(users).where(eq(users.id, payment.userId))).at(0);
    if (user) {
      sendEmail({
        to: user.email,
        subject: "FundedWealth - Payment Verification Issue",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0b0722; color: white; padding: 32px; border-radius: 24px;">
            <h1 style="color: #ef4444; margin-bottom: 16px;">Payment Verification Issue</h1>
            <p style="color: rgba(255,255,255,0.8);">Hi ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader"},</p>
            <p style="color: rgba(255,255,255,0.8);">We reviewed your payment submission but encountered an issue:</p>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 20px; margin-top: 24px;">
              <p style="margin: 0; color: rgba(255,255,255,0.9);"><strong>Reason:</strong> ${rejectionReason}</p>
            </div>
            <p style="color: rgba(255,255,255,0.8); margin-top: 24px;">Please review the reason above and submit a new payment with the correct details. You can resubmit your payment immediately.</p>
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 32px;">If you believe this is an error, please contact our support team.</p>
          </div>
        `,
      }).catch((emailError) => {
        req.log?.error?.({ emailError, userId: user.id }, "rejection_email_failed");
      });
    }

    req.log?.info?.({ paymentId, reviewedBy: reviewer.id, reason: rejectionReason }, "payment_rejected");

    return res.json({
      success: true,
      message: "Payment rejected. User notification sent.",
      payment: rejectedPayment,
    });
  } catch (err) {
    req.log?.error?.({ err }, "reject_payment_failed");
    return res.status(500).json({ success: false, message: "Server error rejecting payment" });
  }
});

// Multer error handler — returns 400 for file validation failures
router.use((error: Error, req: Request, res: Response, next: (err?: Error) => void) => {
  if (error.name === "MulterError") {
    if (error.message.includes("File too large") || error.message.includes("LIMIT_FILE_SIZE")) {
      return res.status(400).json({ success: false, message: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${error.message}` });
  }
  if (error?.message?.includes("Invalid file type")) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

export default router;
