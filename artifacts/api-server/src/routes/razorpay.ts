import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "../lib/logger";
import { db, users, orders, webhookLogs, championshipRegistrations, impactDonations } from "@workspace/db";
import { eq } from "drizzle-orm";
import { paymentConfirmationEmail } from "../lib/email";
import { MonitoringService } from "../lib/monitoring-service";
import { rateLimit } from "../lib/rate-limit";
import { AuditService } from "../lib/audit-service";
import { AdminEventService } from "../lib/admin-event-service";
import { validateBody } from "../lib/api-security";
import { z } from "zod";
import {
  resolveAccountSize as resolveAccountSizeRzp,
  type PlanType,
} from "@workspace/products";
import { provisionChallenge } from "../lib/provisioning-service";
import { getOrCreateUser, ensureSupabaseAuthIdentity } from "../lib/guest-account-service";

const router = Router();

// Local type definitions for Razorpay SDK responses (v2.9.6 has bad return types)
interface RzpOrder {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, string>;
  attempts: number;
  created_at: number;
}

interface RzpPayment {
  id: string;
  amount: number;
  status: string;
  currency: string;
  method: string;
  order_id?: string;
}

// Zod schemas for payment endpoints
const createOrderSchema = z.object({
  amount: z.number().positive().max(10000000),
  payment_type: z.enum(["challenge", "championship", "donation"]).default("challenge"),
  planType: z.enum(["flash", "instant", "1step", "2step"]).optional(),
  sizeIndex: z.number().int().min(0).max(10).optional(),
  couponCode: z.string().max(20).optional(),
  currency: z.string().max(5).default("INR"),
  receipt: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  planType: z.enum(["flash", "instant", "1step", "2step"]).optional(),
  sizeIndex: z.number().int().min(0).max(10).optional(),
  couponCode: z.string().max(20).optional(),
  amount: z.number().positive().optional(),
  payment_type: z.enum(["challenge", "championship", "donation"]).optional(),
  metadata: z.any().optional(),
  // Guest checkout (same flow as UPI/crypto): billing identifies/creates the
  // purchaser and password seeds their Supabase auth identity for auto-login.
  billing: z.any().optional(),
  password: z.string().optional(),
});

// Rate limiters for payment endpoints
const paymentCreateLimiter = rateLimit(10, 300); // 10 per 5 minutes
const paymentVerifyLimiter = rateLimit(15, 300); // 15 per 5 minutes

// Initialize Razorpay instance lazily so the API can still boot for health checks
let razorpay: Razorpay | null = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    logger.warn("Razorpay credentials not configured. Payment integration will not work.");
  }
} catch (error) {
  logger.warn({ err: error }, "Failed to initialize Razorpay client; continuing without payment integration");
}

// ---------------------------------------------------------------------------
// Plan definitions + provisioning trigger
//
// Plan/size/fee values and risk rules now come from the shared single source
// of truth (@workspace/products). Provisioning is delegated to the shared
// provisioning service so the website and Founder Emergency Provision create
// identical challenge_accounts, trading_accounts and risk settings.
// ---------------------------------------------------------------------------

async function triggerTerminalProvisioning(
  orderId: string,
  planType: PlanType,
  paymentMethod: string,
  paymentRef: string | null,
) {
  await provisionChallenge({ orderId, planType, paymentMethod, paymentRef, source: "website" });
}

/**
 * POST /api/razorpay/create-order
 * Create a Razorpay order.
 *
 * Body:
 *   amount       number   — INR amount (will be converted to paise)
 *   payment_type string   — "challenge" | "championship" | "donation"
 *   planType     string   — "flash" | "instant" | "1step" | "2step" (required for challenge)
 *   sizeIndex    number   — index into the plan's sizes array (required for challenge)
 *   couponCode   string?  — optional coupon
 *   currency     string?  — defaults to "INR"
 *   receipt      string?  — optional receipt label
 *   metadata     object?  — extra data (championship type, donation cause, etc.)
 */
router.post("/create-order", paymentCreateLimiter, validateBody(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const { amount, payment_type = "challenge", planType, sizeIndex, couponCode, currency = "INR", receipt, metadata } = req.body;

    if (!razorpay && process.env.NODE_ENV !== "production") {
      logger.warn("Razorpay credentials missing; returning local development fallback order");
      return res.json({
        success: true,
        order: {
          id: `local-dev-${payment_type}-${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: currency.toUpperCase(),
          receipt: receipt || `FW-${payment_type.toUpperCase()}-${Date.now()}`,
          status: "created",
        },
        devFallback: true,
      });
    }

    // Soft auth check — block banned/suspended users but don't require auth
    // (Razorpay order creation doesn't write to DB, just creates an order on Razorpay side)
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
            message: "Account restricted. Contact support.",
            code: "ACCOUNT_RESTRICTED",
          });
        }
      }
    }

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ success: false, message: "Amount is required and must be a number" });
    }

    const validPaymentTypes = ["challenge", "championship", "donation"];
    const paymentType = validPaymentTypes.includes(payment_type) ? payment_type : "challenge";

    // Validate challenge-specific fields
    if (paymentType === "challenge") {
      if (!planType || !["flash", "instant", "1step", "2step"].includes(planType)) {
        return res.status(400).json({ success: false, message: "Valid planType is required (flash | instant | 1step | 2step)" });
      }
      if (sizeIndex === undefined || typeof sizeIndex !== "number") {
        return res.status(400).json({ success: false, message: "sizeIndex is required" });
      }
    }

    // Convert to paise
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({ success: false, message: "Minimum amount is 1 INR" });
    }

    if (amountInPaise > 1000000000) {
      return res.status(400).json({ success: false, message: "Maximum amount is 10,000,000 INR" });
    }

    if (!razorpay && process.env.NODE_ENV !== "production") {
      logger.warn("Razorpay credentials missing; returning local development fallback order");
      return res.json({
        success: true,
        order: {
          id: `local-dev-${paymentType}-${Date.now()}`,
          amount: amountInPaise,
          currency: currency.toUpperCase(),
          receipt: receipt || `FW-${paymentType.toUpperCase()}-${Date.now()}`,
          status: "created",
        },
        devFallback: true,
      });
    }

    // Validate Razorpay credentials at request time
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.error("Razorpay credentials not configured — cannot create order");
      return res.status(503).json({ success: false, message: "Payment service not configured. Contact support." });
    }

    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment service not configured." });
    }

    const order = (await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `FW-${paymentType.toUpperCase()}-${Date.now()}`,
      payment_capture: true,
      notes: {
        clerkUserId: auth?.userId ?? "guest",
        payment_type: paymentType,
        planType: planType || "",
        sizeIndex: String(sizeIndex ?? ""),
        couponCode: couponCode || "",
        amountINR: String(amount),
        metadata: metadata ? JSON.stringify(metadata) : "",
      },
    })) as RzpOrder;

    logger.info({ orderId: order.id, amount: order.amount, paymentType, userId: auth?.userId ?? "guest" }, "Razorpay order created");

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
    });

  } catch (error: any) {
    logger.error({ error: error?.message, statusCode: error?.statusCode, description: error?.error?.description, stack: error?.stack }, "Failed to create Razorpay order");
    if (error.error?.description) {
      return res.status(400).json({ success: false, message: error.error.description });
    }
    return res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
});

/**
 * POST /api/razorpay/verify-payment
 * 1. Verify HMAC-SHA256 signature
 * 2. Cross-check payment status with Razorpay API
 * 3. INSERT order record → INSERT trading account → send confirmation email
 *
 * Body:
 *   razorpay_order_id   string
 *   razorpay_payment_id string
 *   razorpay_signature  string
 *   planType            string   — echoed from checkout (also stored in order notes)
 *   sizeIndex           number
 *   couponCode          string?
 *   amount              number   — INR, used for mismatch check
 */
router.post("/verify-payment", paymentVerifyLimiter, validateBody(verifyPaymentSchema), async (req: Request, res: Response) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment service not configured." });
    }

    const auth = getAuth(req);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      sizeIndex,
      couponCode,
      amount,
      payment_type,
      metadata,
      billing,
      password,
    } = req.body;

    const paymentType = (payment_type && ["challenge", "championship", "donation"].includes(payment_type))
      ? payment_type
      : "challenge";

    // ── 1. Validate required fields ────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification parameters" });
    }

    if (!planType || !["flash", "instant", "1step", "2step"].includes(planType)) {
      if (paymentType === "challenge") {
        return res.status(400).json({ success: false, message: "Valid planType is required" });
      }
    }

    if (sizeIndex === undefined) {
      if (paymentType === "challenge") {
        return res.status(400).json({ success: false, message: "sizeIndex is required" });
      }
    }

    // ── 2. Verify HMAC-SHA256 signature ────────────────────────────────────
    const signaturePayload = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(signaturePayload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      logger.warn(
        { orderId: razorpay_order_id, paymentId: razorpay_payment_id, userId: auth?.userId ?? "guest" },
        "Razorpay signature verification failed",
      );
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ── 3. Cross-check payment status with Razorpay API ───────────────────
    let rzpPayment: RzpPayment | null = null;
    try {
      rzpPayment = (await razorpay.payments.fetch(razorpay_payment_id)) as RzpPayment;
    } catch (apiErr: unknown) {
      // Signature already verified — log the API failure but proceed.
      // Provisioning still runs because signature is cryptographically valid.
      const errMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      logger.warn(
        { error: errMsg, orderId: razorpay_order_id },
        "Razorpay API fetch failed after valid signature — proceeding with provisioning",
      );
      rzpPayment = null;
    }

    if (rzpPayment) {
      if (rzpPayment.status !== "captured" && rzpPayment.status !== "authorized") {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${rzpPayment.status}`,
        });
      }

      if (amount && rzpPayment.amount !== Math.round(amount * 100)) {
        logger.warn(
          { paymentAmount: rzpPayment.amount, expectedAmount: amount, orderId: razorpay_order_id },
          "Razorpay amount mismatch",
        );
        return res.status(400).json({ success: false, message: "Payment amount does not match order" });
      }
    }

    // ── 4. Idempotency guard — skip if already provisioned ─────────────────
    // Check whether an order with this razorpay_payment_id already exists.
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.utrReference, razorpay_payment_id))
      .limit(1);

    if (existingOrder.length > 0) {
      logger.info(
        { paymentId: razorpay_payment_id, orderId: existingOrder[0].id },
        "Razorpay payment already provisioned — returning cached result",
      );
      return res.json({
        success: true,
        alreadyProvisioned: true,
        message: "Payment already verified and account provisioned.",
        orderId: existingOrder[0].id,
      });
    }

    // ── 5. Resolve purchaser — SAME guest checkout flow as UPI/crypto ───────
    // Reuses the shared getOrCreateUser() so an authenticated user, a returning
    // customer (matched by billing email), or a brand-new guest all resolve to a
    // single public.users row. No "please register first" — no login required.
    let dbUser = await getOrCreateUser(auth?.userId, billing || null);

    if (!dbUser) {
      return res.status(400).json({
        success: false,
        message: "Billing details with a valid email are required to complete checkout.",
      });
    }

    // Block provisioning for restricted/suspended/banned accounts
    if (dbUser.accountStatus && ["restricted", "suspended", "banned"].includes(dbUser.accountStatus)) {
      logger.warn({ userId: dbUser.id, accountStatus: dbUser.accountStatus }, "Razorpay provisioning blocked — account restricted");
      return res.status(403).json({
        success: false,
        message: "Account restricted. Payment received but provisioning blocked. Contact support.",
        code: "ACCOUNT_RESTRICTED",
      });
    }

    // Guest purchaser: ensure a Supabase Auth identity exists (seeded with the
    // password they chose at checkout) so the client can auto-login afterwards.
    // Reuses the shared ensureSupabaseAuthIdentity() — no second auth flow.
    let tempPasswordForStorage: string | null = null;
    const isGuest = !auth?.userId || (dbUser.clerkId?.startsWith("guest_") ?? false);
    if (isGuest) {
      const identity = await ensureSupabaseAuthIdentity({
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        phone: dbUser.phone,
        password: typeof password === "string" ? password : null,
      });
      if (identity.authUserId && identity.authUserId !== dbUser.clerkId) {
        await db.update(users)
          .set({ clerkId: identity.authUserId, updatedAt: new Date() })
          .where(eq(users.id, dbUser.id));
        dbUser = { ...dbUser, clerkId: identity.authUserId };
      }
      // Capture temp password for storage
      tempPasswordForStorage = identity.tempPassword;
    }

    // ── 6. Determine INR amount for account sizing ──────────────────────────
    // Prefer the verified Razorpay amount (paise → INR), fall back to body amount.
    const amountINR: number = rzpPayment
      ? rzpPayment.amount / 100
      : (typeof amount === "number" ? amount : 0);

    if (amountINR <= 0) {
      return res.status(400).json({ success: false, message: "Could not determine payment amount" });
    }

    // ── 7. Route by payment type ──────────────────────────────────────────
    if (paymentType === "challenge") {
      const accountSize = resolveAccountSizeRzp(planType as PlanType, typeof sizeIndex === "number" ? sizeIndex : 0);
      if (!accountSize) {
        logger.error({ planType, sizeIndex }, "Could not resolve account size for Razorpay provisioning");
        return res.status(400).json({ success: false, message: "Invalid plan/size combination" });
      }

      // Prepare metadata with temp password if generated
      const orderMetadata: Record<string, any> = {};
      if (tempPasswordForStorage) {
        orderMetadata.tempPassword = tempPasswordForStorage;
      }

      const [dbOrder] = await db.insert(orders).values({
        userId: dbUser.id,
        amount: amountINR,
        accountSize,
        planType,
        paymentType: "challenge",
        status: "confirmed",
        paymentMethod: "razorpay",
        utrReference: razorpay_payment_id,
        metadata: Object.keys(orderMetadata).length > 0 ? JSON.stringify(orderMetadata) : null,
      }).returning();

      await triggerTerminalProvisioning(dbOrder.id, planType as PlanType, "razorpay", razorpay_payment_id);

      // Notify admin panel of confirmed payment
      AdminEventService.notifyPaymentReceived({
        orderId: dbOrder.id,
        userId: dbUser.id,
        amount: amountINR,
        paymentMethod: "razorpay",
        planType,
        accountSize,
      }).catch(() => {});

      const userName = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Trader";
      paymentConfirmationEmail(userName, dbUser.email, razorpay_payment_id, String(amountINR), `${planType} Plan - Razorpay`).catch((emailErr) =>
        logger.error({ error: emailErr.message, userId: dbUser.id }, "Razorpay confirmation email failed"));

      // Audit log
      AuditService.log({
        adminId: dbUser.id as any,
        action: "PAYMENT_VERIFIED",
        entity: "orders",
        entityId: dbOrder.id,
        details: { paymentId: razorpay_payment_id, amount: amountINR, planType, method: "razorpay" },
      }).catch(() => {});

      return res.json({
        success: true,
        message: "Payment verified. Your account is being provisioned.",
        orderId: dbOrder.id,
        provisioningStatus: "pending",
        loginEmail: dbUser.email,
        payment: { id: razorpay_payment_id, order_id: razorpay_order_id, amount: amountINR, currency: rzpPayment?.currency || "INR", status: rzpPayment?.status || "verified", method: rzpPayment?.method || "razorpay" },
      });

    } else if (paymentType === "championship") {
      let meta: any = {};
      try { meta = typeof metadata === "object" ? metadata : JSON.parse(metadata || "{}"); } catch {}

      const [dbOrder] = await db.insert(orders).values({
        userId: dbUser.id,
        amount: amountINR,
        planType: "championship",
        paymentType: "championship",
        status: "confirmed",
        paymentMethod: "razorpay",
        utrReference: razorpay_payment_id,
        metadata: JSON.stringify(meta),
      }).returning();

      await db.insert(championshipRegistrations).values({
        name: meta.name || [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Trader",
        email: meta.email || dbUser.email,
        mobile: meta.mobile || "",
        clerkId: dbUser.clerkId,
        challengeType: meta.challengeType || "monthly",
        status: "registered",
        paymentId: dbOrder.id,
        paymentStatus: "paid",
      });

      return res.json({
        success: true,
        message: "Championship registration confirmed.",
        orderId: dbOrder.id,
        payment: { id: razorpay_payment_id, order_id: razorpay_order_id, amount: amountINR, currency: rzpPayment?.currency || "INR", status: rzpPayment?.status || "verified", method: rzpPayment?.method || "razorpay" },
      });

    } else if (paymentType === "donation") {
      let meta: any = {};
      try { meta = typeof metadata === "object" ? metadata : JSON.parse(metadata || "{}"); } catch {}

      const [dbOrder] = await db.insert(orders).values({
        userId: dbUser.id,
        amount: amountINR,
        planType: "donation",
        paymentType: "donation",
        status: "confirmed",
        paymentMethod: "razorpay",
        utrReference: razorpay_payment_id,
        metadata: JSON.stringify(meta),
      }).returning();

      const mealsProvided = Math.floor(amountINR / 25);
      const studentsSupported = Math.floor(amountINR / 500);

      await db.insert(impactDonations).values({
        userId: dbUser.id,
        donorName: meta.donorName || [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Anonymous",
        donorCity: meta.donorCity || null,
        amount: amountINR,
        category: meta.category || "general",
        mealsProvided,
        studentsSupported,
        transactionId: razorpay_payment_id,
        paymentId: dbOrder.id,
        status: "completed",
      });

      return res.json({
        success: true,
        message: "Donation received. Thank you for your contribution!",
        orderId: dbOrder.id,
        payment: { id: razorpay_payment_id, order_id: razorpay_order_id, amount: amountINR, currency: rzpPayment?.currency || "INR", status: rzpPayment?.status || "verified", method: rzpPayment?.method || "razorpay" },
      });

    } else {
      return res.status(400).json({ success: false, message: "Invalid payment_type" });
    }

  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to verify/provision Razorpay payment");
    return res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
});

/**
 * GET /api/razorpay/order/:orderId
 * Fetch Razorpay order details (for status polling from frontend).
 */
router.get("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    if (!razorpay) {
      return res.json({
        success: true,
        order: {
          id: orderId,
          amount: 0,
          amount_paid: 0,
          amount_due: 0,
          currency: "INR",
          receipt: orderId,
          status: "created",
          attempts: 0,
          notes: {},
          created_at: Date.now(),
        },
      });
    }

    const order = (await razorpay.orders.fetch(orderId as string)) as RzpOrder;

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        amount_paid: order.amount_paid,
        amount_due: order.amount_due,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        attempts: order.attempts,
        notes: order.notes,
        created_at: order.created_at,
      },
    });

  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to fetch Razorpay order");
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
});

/**
 * GET /api/razorpay/payment-methods
 * Return supported INR payment methods for display in checkout UI.
 */
router.get("/payment-methods", async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    methods: [
      { id: "upi", name: "UPI", description: "Google Pay, PhonePe, Paytm, BHIM", icon: "📱", supported: true },
      { id: "card", name: "Credit/Debit Card", description: "Visa, Mastercard, RuPay, Amex", icon: "💳", supported: true },
      { id: "netbanking", name: "Net Banking", description: "All major Indian banks", icon: "🏦", supported: true },
      { id: "wallet", name: "Wallet", description: "Paytm Wallet, MobiKwik, Freecharge", icon: "👛", supported: true },
      { id: "emi", name: "EMI", description: "Credit Card EMI", icon: "📅", supported: true },
    ],
  });
});

// ---------------------------------------------------------------------------
// Razorpay Webhook — POST /api/razorpay/webhook
//
// Razorpay sends async payment events here. This endpoint is the source of
// truth for payment state — more reliable than the client-side verify-payment
// call because it fires even when the user closes the browser mid-payment.
//
// Security model:
//   1. Signature: HMAC-SHA256 of raw request body with RAZORPAY_WEBHOOK_SECRET
//   2. Idempotency: webhookId = X-Razorpay-Event-Id header, stored UNIQUE in
//      webhook_logs table. Duplicate delivery → 200 immediately, no re-process.
//   3. All events (success, failure, refund) are logged to webhook_logs before
//      any business logic runs.
//
// Configure in Razorpay Dashboard → Settings → Webhooks:
//   URL: https://<your-api>/api/razorpay/webhook
//   Secret: <value of RAZORPAY_WEBHOOK_SECRET>
//   Events: payment.captured, payment.failed, refund.created, order.paid
// ---------------------------------------------------------------------------

// Extend Express Request type locally to access rawBody set by app.ts verify cb
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// ── Startup guard — fail fast if webhook secret is not configured ─────────────
// An absent RAZORPAY_WEBHOOK_SECRET means any HTTP client can POST fake payment
// events and trigger account provisioning. Hard-failing here prevents accidental
// deployment without the secret rather than silently accepting spoofed requests.
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!RAZORPAY_WEBHOOK_SECRET) {
  // Log a hard error at module load time. In production the process will still
  // start (so other routes keep working), but the webhook endpoint will reject
  // every request with 503 until the env var is set and the server restarted.
  logger.error(
    "RAZORPAY_WEBHOOK_SECRET is not set. " +
    "The /api/razorpay/webhook endpoint will reject ALL requests until this is configured. " +
    "Set this variable in your environment and restart the server.",
  );
}

/**
 * Verify Razorpay webhook signature.
 * Uses HMAC-SHA256 of the raw request body with RAZORPAY_WEBHOOK_SECRET.
 *
 * Returns:
 *   "ok"            — signature is valid, proceed
 *   "no_secret"     — RAZORPAY_WEBHOOK_SECRET env var is absent
 *   "invalid"       — signature present but does not match
 *   "missing_sig"   — X-Razorpay-Signature header was not sent
 *   "missing_body"  — raw body buffer was not captured
 */
type SigResult = "ok" | "no_secret" | "invalid" | "missing_sig" | "missing_body";

function verifyRazorpayWebhookSignature(rawBody: Buffer | undefined, signature: string | undefined): SigResult {
  if (!RAZORPAY_WEBHOOK_SECRET) return "no_secret";
  if (!rawBody) return "missing_body";
  if (!signature) return "missing_sig";

  const computed = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // timingSafeEqual prevents timing-oracle attacks
  const computedBuf = Buffer.from(computed, "hex");
  const signatureBuf = Buffer.from(signature, "hex");

  // Lengths must match before timingSafeEqual (different length → always invalid)
  if (computedBuf.length !== signatureBuf.length) return "invalid";

  return crypto.timingSafeEqual(computedBuf, signatureBuf) ? "ok" : "invalid";
}

router.post("/webhook", async (req: Request, res: Response) => {
  const razorpaySignature = req.headers["x-razorpay-signature"] as string | undefined;
  const webhookId = req.headers["x-razorpay-event-id"] as string | undefined;
  const rawBody = req.rawBody;

  // ── 1. Validate signature BEFORE sending 200 ─────────────────────────────
  // The signature check must happen first. Sending 200 unconditionally and then
  // checking the signature creates a window where Razorpay thinks the event was
  // accepted even though we rejected it — masking spoofed requests in Razorpay's
  // own delivery logs.
  //
  // We still respond 200 to Razorpay for genuine delivery failures (e.g. missing
  // body) to avoid unnecessary retries, but spoofed / unsigned requests get 403.
  const sigResult = verifyRazorpayWebhookSignature(rawBody, razorpaySignature);

  if (sigResult !== "ok") {
    // Map result to appropriate HTTP status
    const httpStatus = sigResult === "no_secret" ? 503 : 403;

    const logMsg: Record<SigResult, string> = {
      no_secret: "[Razorpay Webhook] REJECTED — RAZORPAY_WEBHOOK_SECRET not configured on server",
      missing_body: "[Razorpay Webhook] REJECTED — raw body not captured (verify middleware is set up)",
      missing_sig: "[Razorpay Webhook] REJECTED — X-Razorpay-Signature header missing",
      invalid: "[Razorpay Webhook] REJECTED — signature mismatch (possible spoofed request)",
      ok: "", // unreachable
    };

    logger.warn(
      { webhookId, sigResult, signaturePresent: !!razorpaySignature, rawBodyPresent: !!rawBody },
      logMsg[sigResult],
    );

    // Log the rejected attempt for audit trail, then return immediately
    await db.insert(webhookLogs).values({
      provider: "razorpay",
      eventType: req.body?.event ?? "unknown",
      webhookId: webhookId ?? null,
      idempotencyKey: webhookId ?? null,
      signature: razorpaySignature ?? "",
      isSignatureValid: false,
      payload: req.body ?? {},
      status: "FAILED",
      errorMessage: logMsg[sigResult],
    }).catch((e) => logger.error({ e }, "webhook_logs insert failed for rejected request"));

    return res.status(httpStatus).json({ error: logMsg[sigResult] });
  }

  // ── 0. Signature verified — acknowledge to Razorpay ──────────────────────
  // Only send 200 after the signature check passes. Razorpay retries on non-200,
  // so a genuine delivery will be retried if something fails above — that's fine.
  res.status(200).json({ received: true });

  const signatureHeader = razorpaySignature ?? "";

  // ── 2. Idempotency — check for duplicate delivery ────────────────────────
  if (webhookId) {
    const existing = await db
      .select({ id: webhookLogs.id, status: webhookLogs.status })
      .from(webhookLogs)
      .where(eq(webhookLogs.webhookId, webhookId))
      .limit(1)
      .catch(() => [] as any[]);

    if (existing.length > 0) {
      logger.info(
        { webhookId, existingStatus: existing[0].status },
        "[Razorpay Webhook] Duplicate delivery — skipping re-processing",
      );
      return;
    }
  }

  // ── 3. Write to webhook_logs (PENDING) before processing ─────────────────
  const [logEntry] = await db.insert(webhookLogs).values({
    provider: "razorpay",
    eventType: req.body?.event ?? "unknown",
    webhookId: webhookId ?? null,
    idempotencyKey: webhookId ?? null,
    signature: signatureHeader,
    isSignatureValid: true,
    payload: req.body ?? {},
    status: "PENDING",
  }).returning().catch((e) => {
    logger.error({ e }, "webhook_logs insert failed — may be a duplicate");
    return [] as any[];
  });

  if (!logEntry) {
    // Insert failed — likely a race-condition duplicate on webhookId unique constraint
    logger.warn({ webhookId }, "[Razorpay Webhook] Log insert failed — treating as duplicate");
    return;
  }

  // ── 4. Route by event type ────────────────────────────────────────────────
  const event = req.body?.event as string;
  const payload = req.body?.payload ?? {};

  try {
    switch (event) {

      // ── payment.captured / order.paid ─────────────────────────────────────
      // Fired when Razorpay captures a payment (auto-capture=1 means this fires
      // immediately after authorization). This is the canonical "money received"
      // event and the primary provisioning trigger for async flows.
      case "payment.captured":
      case "order.paid": {
        const payment = payload?.payment?.entity ?? payload?.order?.entity ?? {};
        const paymentId = payment.id as string;
        const orderNotes = payment.notes as Record<string, string> | undefined;

        if (!paymentId) {
          throw new Error(`Missing payment entity ID in ${event} payload`);
        }

        // Idempotency: skip if already provisioned from verify-payment or earlier webhook
        const alreadyProvisioned = await db
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.utrReference, paymentId))
          .limit(1);

        if (alreadyProvisioned.length > 0) {
          logger.info(
            { paymentId, orderId: alreadyProvisioned[0].id },
            "[Razorpay Webhook] payment.captured — already provisioned via verify-payment, skipping",
          );
          break;
        }

        // Resolve user from notes.clerkUserId (stored when order was created)
        const clerkUserId = orderNotes?.clerkUserId;
        if (!clerkUserId) {
          throw new Error(`notes.clerkUserId missing on payment ${paymentId} — cannot provision`);
        }

        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        if (!dbUser) {
          throw new Error(`User not found for clerkId=${clerkUserId}`);
        }

        // Block provisioning for restricted/suspended/banned accounts
        if (dbUser.accountStatus && ["restricted", "suspended", "banned"].includes(dbUser.accountStatus)) {
          logger.warn(
            { userId: dbUser.id, accountStatus: dbUser.accountStatus, paymentId },
            "[Razorpay Webhook] Provisioning blocked — account restricted",
          );
          break;
        }

        const paymentType = (orderNotes?.payment_type as string) || "challenge";
        const planType = (orderNotes?.planType as PlanType) ?? "1step";
        const amountINR = payment.amount ? payment.amount / 100 : Number(orderNotes?.amountINR ?? 0);
        const couponCode = orderNotes?.couponCode || undefined;
        const sizeIndexFromNotes = orderNotes?.sizeIndex !== undefined ? parseInt(orderNotes.sizeIndex, 10) : 0;
        const metadataStr = orderNotes?.metadata || "{}";

        if (amountINR <= 0) {
          throw new Error(`Could not determine INR amount for payment ${paymentId}`);
        }

        // ── ROUTE BY PAYMENT TYPE ──────────────────────────────────────────
        if (paymentType === "challenge") {
          // ── Challenge payment — existing logic unchanged ────────────────
          const accountSize = resolveAccountSizeRzp(planType, sizeIndexFromNotes);
          if (!accountSize) {
            throw new Error(`Could not resolve account size for planType=${planType} sizeIndex=${sizeIndexFromNotes}`);
          }

          const [dbOrder] = await db.insert(orders).values({
            userId: dbUser.id,
            amount: amountINR,
            accountSize: accountSize,
            planType,
            paymentType: "challenge",
            status: "confirmed",
            paymentMethod: "razorpay",
            utrReference: paymentId,
          }).returning();

          await triggerTerminalProvisioning(dbOrder.id, planType, "razorpay", paymentId);

          // Notify admin panel
          AdminEventService.notifyPaymentReceived({
            orderId: dbOrder.id,
            userId: dbUser.id,
            amount: amountINR,
            paymentMethod: "razorpay",
            planType,
            accountSize: accountSize,
          }).catch(() => {});

          const userName = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Trader";
          paymentConfirmationEmail(userName, dbUser.email, paymentId, String(amountINR), `${planType} Plan - Razorpay`).catch((e) => logger.error({ e, userId: dbUser.id }, "confirmation email failed"));

          logger.info({ event, paymentId, dbOrderId: dbOrder.id, paymentType: "challenge" }, "[Razorpay Webhook] Challenge provisioning triggered");

        } else if (paymentType === "championship") {
          // ── Championship payment ───────────────────────────────────────
          let meta: any = {};
          try { meta = JSON.parse(metadataStr); } catch {}

          const [dbOrder] = await db.insert(orders).values({
            userId: dbUser.id,
            amount: amountINR,
            planType: "championship",
            paymentType: "championship",
            status: "confirmed",
            paymentMethod: "razorpay",
            utrReference: paymentId,
            metadata: metadataStr,
          }).returning();

          // Create championship registration linked to payment
          await db.insert(championshipRegistrations).values({
            name: meta.name || [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Trader",
            email: meta.email || dbUser.email,
            mobile: meta.mobile || "",
            clerkId: dbUser.clerkId,
            challengeType: meta.challengeType || "monthly",
            status: "registered",
            paymentId: dbOrder.id,
            paymentStatus: "paid",
          });

          logger.info({ event, paymentId, dbOrderId: dbOrder.id, paymentType: "championship" }, "[Razorpay Webhook] Championship registration completed");

        } else if (paymentType === "donation") {
          // ── Impact Donation payment ────────────────────────────────────
          let meta: any = {};
          try { meta = JSON.parse(metadataStr); } catch {}

          const [dbOrder] = await db.insert(orders).values({
            userId: dbUser.id,
            amount: amountINR,
            planType: "donation",
            paymentType: "donation",
            status: "confirmed",
            paymentMethod: "razorpay",
            utrReference: paymentId,
            metadata: metadataStr,
          }).returning();

          // Create impact donation record linked to payment
          const mealsProvided = Math.floor(amountINR / 25);
          const studentsSupported = Math.floor(amountINR / 500);

          await db.insert(impactDonations).values({
            userId: dbUser.id,
            donorName: meta.donorName || [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || "Anonymous",
            donorCity: meta.donorCity || null,
            amount: amountINR,
            category: meta.category || "general",
            mealsProvided,
            studentsSupported,
            transactionId: paymentId,
            paymentId: dbOrder.id,
            status: "completed",
          });

          logger.info({ event, paymentId, dbOrderId: dbOrder.id, paymentType: "donation", amountINR }, "[Razorpay Webhook] Donation recorded");
        }

        break;
      }

      // ── payment.failed ────────────────────────────────────────────────────
      // Fired when a payment attempt fails (e.g. card declined, UPI timeout).
      // Update any pending order to failed and log to payment_failures.
      case "payment.failed": {
        const payment = payload?.payment?.entity ?? {};
        const paymentId = payment.id as string;
        const rzpOrderId = payment.order_id as string;

        logger.warn(
          { paymentId, rzpOrderId, errorCode: payment.error_code, errorDesc: payment.error_description },
          "[Razorpay Webhook] payment.failed",
        );

        // Mark any matching pending order as failed
        if (paymentId) {
          await db
            .update(orders)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(orders.utrReference, paymentId))
            .catch((e) => logger.error({ e }, "Failed to update order on payment.failed"));
        }

        await MonitoringService.logPaymentFailure({
          paymentId,
          provider: "Razorpay",
          status: "FAILED",
          failureReason: payment.error_description ?? payment.error_code ?? "Payment failed",
          amount: payment.amount ? payment.amount / 100 : undefined,
          currency: payment.currency ?? "INR",
          metadata: payload,
        });
        break;
      }

      // ── refund.created ────────────────────────────────────────────────────
      // Fired when a refund is initiated (via dashboard or API).
      // Mark the associated order as refunded and log for audit.
      case "refund.created":
      case "refund.processed": {
        const refund = payload?.refund?.entity ?? {};
        const paymentId = refund.payment_id as string;
        const refundId = refund.id as string;
        const refundAmt = refund.amount ? refund.amount / 100 : 0;

        logger.info(
          { refundId, paymentId, amount: refundAmt, status: refund.status },
          `[Razorpay Webhook] ${event}`,
        );

        // Mark the linked order as refunded
        if (paymentId) {
          await db
            .update(orders)
            .set({ status: "refunded", updatedAt: new Date() })
            .where(eq(orders.utrReference, paymentId))
            .catch((e) => logger.error({ e }, "Failed to update order on refund"));
        }

        // NOTE: Terminal-side account suspension is handled by terminal when it
        // detects order status = refunded via provisioning_logs linkage.
        // Main site does NOT directly mutate terminal-owned trading_accounts.

        await MonitoringService.logPaymentFailure({
          paymentId: refundId,
          provider: "Razorpay",
          status: "REFUNDED",
          failureReason: `Refund ${refundId} for payment ${paymentId}`,
          amount: refundAmt,
          currency: refund.currency ?? "INR",
          metadata: payload,
        });
        break;
      }

      // ── Unhandled events — log and move on ───────────────────────────────
      default: {
        logger.info({ event, webhookId }, "[Razorpay Webhook] Unhandled event type — logged only");
        break;
      }
    }

    // ── 5. Mark log entry PROCESSED ──────────────────────────────────────────
    await db
      .update(webhookLogs)
      .set({ status: "PROCESSED", processedAt: new Date(), updatedAt: new Date() })
      .where(eq(webhookLogs.id, logEntry.id))
      .catch((e) => logger.error({ e }, "Failed to mark webhook log as PROCESSED"));

  } catch (processingError: any) {
    // ── Processing failed — mark FAILED in log, don't crash the process ──────
    logger.error(
      { error: processingError.message, event, webhookId, logEntryId: logEntry.id },
      "[Razorpay Webhook] Processing error",
    );

    await db
      .update(webhookLogs)
      .set({
        status: "FAILED",
        errorMessage: processingError.message,
        retryCount: (logEntry.retryCount ?? 0) + 1,
        lastRetryAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(webhookLogs.id, logEntry.id))
      .catch((e) => logger.error({ e }, "Failed to mark webhook log as FAILED"));
  }
});

export default router;
