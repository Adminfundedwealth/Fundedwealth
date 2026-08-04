/**
 * Admin → Main Site Webhook Receiver
 *
 * Receives outgoing webhooks dispatched by the Admin OS after KYC review
 * actions and syncs the result into the main-site kyc_profiles table so the
 * user-facing KYC page always shows the correct status without polling.
 *
 * Security: Bearer token validated against ADMIN_WEBHOOK_SECRET env var.
 * All inbound payloads are validated before any DB write is performed.
 *
 * Route: POST /api/webhooks/admin
 * Registered in: src/routes/index.ts → router.use('/webhooks', adminWebhookRouter)
 */

import { Router, type Request, type Response } from "express";
import { db, users, kycProfiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// ── Supported KYC event → profile status mapping ─────────────────────────────
const KYC_EVENT_STATUS_MAP: Record<string, string> = {
  "kyc.approved":         "APPROVED",
  "kyc.rejected":         "REJECTED",
  "kyc.resubmit":         "RESUBMISSION_REQUIRED",
  "kyc.additional_docs":  "ADDITIONAL_DOCS_REQUIRED",
};

// ── Auth helper ───────────────────────────────────────────────────────────────
function verifyBearerToken(req: Request): boolean {
  const secret = process.env.ADMIN_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("[AdminWebhook] ADMIN_WEBHOOK_SECRET not configured — rejecting all inbound webhooks");
    return false;
  }
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  // Constant-time comparison to prevent timing attacks
  if (token.length !== secret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < secret.length; i++) {
    mismatch |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * POST /api/webhooks/admin
 *
 * Expected body shape (matches OutgoingWebhookPayload from admin-app):
 * {
 *   event: string,          // e.g. "kyc.approved"
 *   timestamp: string,      // ISO 8601
 *   source: "admin",
 *   data: {
 *     user_id: string,      // main-site users.id (UUID)
 *     submission_id: string,
 *     reason?: string,      // for resubmit / additional_docs / reject
 *     reasons?: string[],   // for reject (legacy array form)
 *   }
 * }
 */
router.post("/admin", async (req: Request, res: Response) => {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  if (!verifyBearerToken(req)) {
    logger.warn({ ip: req.ip }, "[AdminWebhook] Rejected — invalid or missing Bearer token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { event, data, source } = req.body ?? {};

  // Basic payload validation
  if (!event || typeof event !== "string" || source !== "admin") {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  logger.info({ event, userId: data?.user_id }, "[AdminWebhook] Received");

  // ── 2. Route by event type ────────────────────────────────────────────────
  const newKycStatus = KYC_EVENT_STATUS_MAP[event];

  if (newKycStatus) {
    await handleKycStatusUpdate(req, res, event, newKycStatus, data);
    return;
  }

  // Unknown event — acknowledge without processing
  logger.info({ event }, "[AdminWebhook] Unhandled event type — acknowledged");
  return res.json({ received: true, handled: false });
});

// ── KYC status sync ───────────────────────────────────────────────────────────

async function handleKycStatusUpdate(
  req: Request,
  res: Response,
  event: string,
  newStatus: string,
  data: any,
) {
  const userId: string = data?.user_id;
  const reason: string = data?.reason ?? (Array.isArray(data?.reasons) ? data.reasons.join("; ") : "") ?? "";

  if (!userId) {
    return res.status(400).json({ error: "Missing user_id in webhook data" });
  }

  try {
    // Resolve main-site user from the UUID sent by admin OS
    const [user] = await db
      .select({ id: users.id, kycStatus: users.kycStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      // User not found — may belong to a different env. Log and acknowledge.
      logger.warn({ userId, event }, "[AdminWebhook] User not found — ignoring");
      return res.json({ received: true, handled: false, reason: "user_not_found" });
    }

    // ── Update kyc_profiles ───────────────────────────────────────────────
    const profileUpdateFields: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === "APPROVED") {
      profileUpdateFields.approvedAt = new Date();
      profileUpdateFields.rejectionReason = null;
      profileUpdateFields.reviewNotes = null;
    } else if (newStatus === "REJECTED") {
      profileUpdateFields.rejectedAt = new Date();
      profileUpdateFields.rejectionReason = reason || null;
    } else if (newStatus === "RESUBMISSION_REQUIRED") {
      profileUpdateFields.rejectionReason = reason || null;
      profileUpdateFields.reviewNotes = null;
    } else if (newStatus === "ADDITIONAL_DOCS_REQUIRED") {
      profileUpdateFields.reviewNotes = reason || null;
    }

    await db
      .update(kycProfiles)
      .set(profileUpdateFields)
      .where(eq(kycProfiles.userId, user.id));

    // ── Sync users.kycStatus ──────────────────────────────────────────────
    const userKycStatusMap: Record<string, string> = {
      APPROVED:                  "verified",
      REJECTED:                  "rejected",
      RESUBMISSION_REQUIRED:     "resubmission_required",
      ADDITIONAL_DOCS_REQUIRED:  "additional_docs_required",
    };
    const userKycStatus = userKycStatusMap[newStatus];
    if (userKycStatus) {
      await db
        .update(users)
        .set({ kycStatus: userKycStatus, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    logger.info(
      { userId, event, newStatus },
      "[AdminWebhook] KYC status synced to main-site DB",
    );

    return res.json({ received: true, handled: true, newStatus });
  } catch (err) {
    logger.error({ err, userId, event }, "[AdminWebhook] Failed to sync KYC status");
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default router;
