import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users, payouts, payoutTimelineEvents, notifications } from "@workspace/db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { broadcastNotificationToUser, broadcastPayoutUpdateToUser } from "../lib/supabase";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import { requireActiveAccount } from "../middlewares/accountStatusMiddleware";
import { PaymentFingerprintService } from "../lib/payment-fingerprint-service";
import { VelocityService } from "../lib/velocity-service";
import { AdminEventService } from "../lib/admin-event-service";

const router = Router();

const PAYOUT_STATUSES = [
  "REQUESTED",
  "UNDER_REVIEW",
  "PROCESSING",
  "APPROVED",
  "PAID",
  "REJECTED",
] as const;

const PENDING_STATUSES = ["REQUESTED", "UNDER_REVIEW", "PROCESSING"] as const;
const NOTIFY_STATUSES = new Set(["APPROVED", "PAID", "REJECTED"] as const);

type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

function isPayoutStatus(value: unknown): value is PayoutStatus {
  return typeof value === "string" && (PAYOUT_STATUSES as readonly string[]).includes(value);
}

function notificationTitle(status: PayoutStatus) {
  switch (status) {
    case "APPROVED":
      return "Payout approved";
    case "PAID":
      return "Payout paid";
    case "REJECTED":
      return "Payout rejected";
    default:
      return "Payout update";
  }
}

function notificationMessage(status: PayoutStatus, amount: number) {
  switch (status) {
    case "APPROVED":
      return `✅ Your payout of ₹${amount} has been approved.`;
    case "PAID":
      return `💰 Your payout of ₹${amount} has been paid.`;
    case "REJECTED":
      return `❌ Your payout request for ₹${amount} was rejected.`;
    default:
      return `Your payout status changed to ${status}.`;
  }
}

async function getAuthenticatedUser(req: any, res: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  return user;
}

async function createTimelineEvent(tx: typeof db, payoutId: number, status: PayoutStatus, note: string, actor = "system") {
  await tx.insert(payoutTimelineEvents).values({
    payoutId,
    status,
    note,
    actor,
  });
}

async function createPayoutNotification(user: any, payout: any, status: PayoutStatus, note?: string) {
  const title = notificationTitle(status);
  const message = notificationMessage(status, payout.amount);
  const [created] = await db.insert(notifications).values({
    userId: user.id,
    type: `PAYOUT_${status}`,
    title,
    message,
    category: "Payout",
    metadata: JSON.stringify({ payoutId: payout.id, status, note: note || null }),
    deliveryChannels: "in_app",
    expiresAt: null,
    isRead: false,
  }).returning();

  broadcastNotificationToUser(user.clerkId, {
    ...created,
    metadata: created.metadata ? JSON.parse(created.metadata) : {},
  });
}

router.get("/", async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const userPayouts = await db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, user.id))
    .orderBy(desc(payouts.createdAt));

  res.json(userPayouts);
});

router.get("/stats", async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const [stats] = await db
    .select({
      totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${payouts.currentStatus} = 'PAID' THEN ${payouts.amount} ELSE 0 END), 0)`,
      pendingCount: sql<number>`COUNT(CASE WHEN ${payouts.currentStatus} IN ('REQUESTED','UNDER_REVIEW','PROCESSING') THEN 1 END)`,
      approvedOrPaid: sql<number>`COUNT(CASE WHEN ${payouts.currentStatus} IN ('APPROVED','PAID') THEN 1 END)`,
      totalCount: sql<number>`COUNT(*)`,
      averageProcessingTime: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${payouts.processedAt} - ${payouts.createdAt}))), 0)`,
    })
    .from(payouts)
    .where(eq(payouts.userId, user.id));

  const approvalRate = stats.totalCount ? Number((stats.approvedOrPaid / stats.totalCount).toFixed(4)) : 0;

  res.json({
    total_paid: Number(stats.totalPaid || 0),
    average_processing_time: Number(stats.averageProcessingTime || 0),
    pending_count: Number(stats.pendingCount || 0),
    approval_rate: approvalRate,
  });
});

router.post("/request", requireActiveAccount, async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const { amount, method } = req.body as { amount?: number; method?: string };
  if (!amount || amount <= 0) return res.status(400).json({ error: "Valid amount required" });

  // IPQS VPN/Proxy detection for payout request (critical — await result)
  const payoutIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  // Get real device fingerprint from frontend (FingerprintJS visitorId)
  const payoutFingerprint =
    (req.headers["x-device-fingerprint"] as string) ||
    req.body.deviceFingerprint ||
    req.headers["user-agent"] ||
    "unknown";

  const ipResult = await IPIntelligenceService.lookupAndStore(payoutIp, user.id, "payout_request");

  // Run full fraud scoring (awaited — payouts are high-risk)
  const riskProfile = await FraudDetectionService.detectAndScore({
    userId: user.id,
    ipAddress: payoutIp,
    deviceFingerprint: payoutFingerprint,
    country: ipResult.country || "unknown",
    trigger: "payout_request",
  }).catch(() => null);

  // Block payout if risk profile says so
  if (riskProfile?.payoutRestricted) {
    return res.status(403).json({
      error: "Payout request blocked due to security review. Contact support.",
      riskLevel: riskProfile.riskLevel,
    });
  }

  // Block payout if payment method is linked to restricted/suspended account
  const fpBlock = await PaymentFingerprintService.shouldBlockPayout(user.id);
  if (fpBlock.blocked) {
    return res.status(403).json({
      error: "Payout requires manual review. Payment method flagged.",
      code: "PAYMENT_METHOD_FLAGGED",
      reason: fpBlock.reason,
    });
  }

  // Track payout velocity + detect clusters
  const payoutVelocity = await VelocityService.recordAndCheck(
    "payout_request", user.id, payoutIp, payoutFingerprint
  );
  await VelocityService.checkPayoutCluster(user.id, payoutFingerprint, payoutIp);

  const payout = await db.transaction(async (tx) => {
    const [created] = await tx.insert(payouts).values({
      userId: user.id,
      amount,
      method: method || "UPI",
      currentStatus: "REQUESTED",
      updatedAt: new Date(),
    }).returning();

    await createTimelineEvent(tx as unknown as typeof db, created.id, "REQUESTED", "Payout request submitted", "user");
    return created;
  });

  // Notify admin panel of payout request
  AdminEventService.notifyPayoutRequested({
    userId: user.id,
    amount,
    payoutId: String(payout.id),
  }).catch(() => {});

  res.status(201).json(payout);
});

router.patch("/:id/status", async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  // P0-1 FIX: Only admins may change payout status.
  // A regular user self-approving or self-marking as PAID is a direct financial exploit.
  if (!["admin", "super_admin", "finance"].includes(user.role)) {
    return res.status(403).json({ error: "Admin access required to update payout status" });
  }

  const payoutId = parseInt(req.params.id, 10);
  if (!payoutId) return res.status(400).json({ error: "Invalid payout ID" });

  const { status, note, actor } = req.body as { status?: string; note?: string; actor?: string };
  if (!status || !isPayoutStatus(status)) {
    return res.status(400).json({ error: "Valid payout status is required" });
  }

  const [existingPayout] = await db.select().from(payouts).where(eq(payouts.id, payoutId));
  if (!existingPayout) {
    return res.status(404).json({ error: "Payout not found" });
  }

  const updatedPayout = await db.transaction(async (tx) => {
    const [updated] = await tx.update(payouts).set({
      currentStatus: status,
      updatedAt: new Date(),
      processedAt: status === "PAID" ? new Date() : existingPayout.processedAt,
    }).where(eq(payouts.id, payoutId)).returning();

    await createTimelineEvent(tx as unknown as typeof db, payoutId, status, note ?? `Status changed to ${status}`, actor || "system");

    return updated;
  });

  broadcastPayoutUpdateToUser(existingPayout.userId.toString(), {
    payoutId: updatedPayout.id,
    status: updatedPayout.currentStatus,
    amount: updatedPayout.amount,
    updatedAt: updatedPayout.updatedAt,
  });

  if (NOTIFY_STATUSES.has(status as "APPROVED" | "PAID" | "REJECTED")) {
    // Load the payout owner to notify them (not the admin making this request)
    const [payoutOwner] = await db.select().from(users).where(eq(users.id, existingPayout.userId));
    if (payoutOwner) {
      await createPayoutNotification(payoutOwner, updatedPayout, status as PayoutStatus, note);
    }
  }

  res.json(updatedPayout);
});

router.get("/public", async (_req, res) => {
  const recentPayouts = await db
    .select({
      id: payouts.id,
      amount: payouts.amount,
      method: payouts.method,
      isVerified: payouts.isVerified,
      processedAt: payouts.processedAt,
      createdAt: payouts.createdAt,
      firstName: users.firstName,
      city: users.city,
    })
    .from(payouts)
    .leftJoin(users, eq(payouts.userId, users.id))
    .where(eq(payouts.isVerified, true))
    .orderBy(desc(payouts.createdAt))
    .limit(20);

  res.json(recentPayouts);
});

router.get("/:id/timeline", async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const payoutId = parseInt(req.params.id, 10);
  if (!payoutId) return res.status(400).json({ error: "Invalid payout ID" });

  const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId));
  if (!payout || payout.userId !== user.id) {
    return res.status(404).json({ error: "Payout not found" });
  }

  const timeline = await db
    .select()
    .from(payoutTimelineEvents)
    .where(eq(payoutTimelineEvents.payoutId, payoutId))
    .orderBy(desc(payoutTimelineEvents.createdAt));

  res.json(timeline);
});

router.get("/:id", async (req, res) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return;

  const payoutId = parseInt(req.params.id, 10);
  if (!payoutId) return res.status(400).json({ error: "Invalid payout ID" });

  const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId));
  if (!payout || payout.userId !== user.id) {
    return res.status(404).json({ error: "Payout not found" });
  }

  res.json(payout);
});

export default router;
