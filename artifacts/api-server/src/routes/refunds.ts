/**
 * Refund Operations API — Support-First Refund System
 *
 * Canonical backend for the refund lifecycle.
 * Uses public.refund_requests as single source of truth.
 *
 * Routes:
 *   POST   /api/refunds/cases                      Support: create refund case
 *   GET    /api/refunds/cases                      Admin/Finance: list + search
 *   GET    /api/refunds/cases/:id                  Admin/Finance: full case detail
 *   PATCH  /api/refunds/cases/:id/review           Admin: PENDING → UNDER_REVIEW
 *   PATCH  /api/refunds/cases/:id/request-info     Admin: → MORE_INFORMATION_REQUIRED
 *   PATCH  /api/refunds/cases/:id/approve          Finance: → APPROVED
 *   PATCH  /api/refunds/cases/:id/reject           Finance: → REJECTED (reason required)
 *   PATCH  /api/refunds/cases/:id/process          Finance: → PROCESSING + gateway ref
 *   PATCH  /api/refunds/cases/:id/complete         Finance: → REFUNDED
 *   PATCH  /api/refunds/cases/:id/fail             Finance: → FAILED
 *   PATCH  /api/refunds/cases/:id/cancel           Admin: → CANCELLED
 *   GET    /api/refunds/cases/:id/trading-evidence Admin: read-only trading data
 *   GET    /api/refunds/orders/:orderId/check      Support: check active case exists
 */

import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "../middlewares/supabaseAuth";
import { db, users, orders, refundRequests } from "@workspace/db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { AuditService, type AuditAction } from "../lib/audit-service";
import { supabaseAdmin } from "../lib/supabase";
import {
  refundCaseCreatedEmail,
  refundMoreInfoEmail,
  refundApprovedEmail,
  refundRejectedEmail,
  refundProcessingEmail,
  refundCompletedEmail,
  refundFailedEmail,
} from "../lib/refund-email-service";

const router = Router();
router.use(requireAdminAuth);

// ─── Role helpers ─────────────────────────────────────────────────────────────
const SUPPORT_ROLES = ["super_admin", "admin", "finance", "support"] as const;
const FINANCE_ROLES = ["super_admin", "admin", "finance"] as const;

function hasRole(admin: any, roles: readonly string[]): boolean {
  return (roles as string[]).includes(admin?.role ?? "");
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const createCaseSchema = z.object({
  orderId:          z.string().min(1),
  userId:           z.string().uuid(),
  refundAmount:     z.number().positive(),
  reason:           z.string().min(5),
  paymentMethod:    z.string().optional(),
  paymentReference: z.string().optional(),
  supportTicketId:  z.string().optional(),
  supportNote:      z.string().optional(),
});

const requestInfoSchema = z.object({
  infoRequested: z.string().min(10),
});

const approveSchema = z.object({
  approveNote: z.string().optional(),
});

const REJECTION_REASONS = [
  "Refund policy window expired",
  "Trading activity already started",
  "Account not eligible under published policy",
  "Duplicate refund request",
  "Payment could not be verified",
  "Refund already processed",
  "Insufficient information",
  "Other",
] as const;

const rejectSchema = z.object({
  rejectionReason: z.enum(REJECTION_REASONS, {
    errorMap: () => ({ message: "A structured rejection reason is required" }),
  }),
  rejectionNote: z.string().optional(),
});

const processSchema = z.object({
  gatewayRefundId: z.string().optional(),
  refundMethod:    z.string().optional(),
  processNote:     z.string().optional(),
});

const completeSchema = z.object({
  gatewayRefundId: z.string().optional(),
  completionNote:  z.string().optional(),
});

const failSchema = z.object({
  failureNote: z.string().optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadUserAndOrder(orderId: string, userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`${users.id}::text = ${userId}`)
    .limit(1);
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return { user: user ?? null, order: order ?? null };
}

function displayName(u: any): string {
  return [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || "Trader";
}

async function logRefundAudit(
  req: Request,
  action: string,
  caseId: string,
  prev: string,
  next: string,
  extra: Record<string, unknown> = {},
) {
  await AuditService.logAdminAction(
    req,
    "ADMIN_REFUND" as AuditAction,
    "refund_requests",
    caseId,
    { refundAction: action, previousStatus: prev, newStatus: next, ...extra },
  );
}

function sendEmailSafe<T>(p: Promise<T>, label: string) {
  p.catch(e => logger.error({ e }, `[RefundRoute] ${label} email failed`));
}

// ─── POST /api/refunds/cases ──────────────────────────────────────────────────
// Support only. Creates a new refund case from a support conversation.

router.post("/cases", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, SUPPORT_ROLES)) {
    return res.status(403).json({ error: "Support role required to create refund cases" });
  }

  const parsed = createCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const d = parsed.data;

  try {
    const { user, order } = await loadUserAndOrder(d.orderId, d.userId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!user)  return res.status(404).json({ error: "User not found" });

    if (order.userId !== d.userId) {
      return res.status(400).json({ error: "Order does not belong to the specified user" });
    }

    // Duplicate protection — one active case per order
    const [existing] = await db
      .select({ id: refundRequests.id, status: refundRequests.status })
      .from(refundRequests)
      .where(
        and(
          eq(refundRequests.orderId, d.orderId),
          sql`${refundRequests.status} NOT IN ('REFUNDED','REJECTED','CANCELLED','FAILED')`,
        ),
      )
      .limit(1);

    if (existing) {
      return res.status(409).json({
        error: `An active refund case already exists for this order (ID: ${existing.id}, Status: ${existing.status}).`,
        existingCaseId: existing.id,
      });
    }

    const [refundCase] = await db
      .insert(refundRequests)
      .values({
        orderId:          d.orderId,
        userId:           d.userId as any,
        refundAmount:     String(d.refundAmount),
        reason:           d.reason,
        status:           "PENDING",
        paymentMethod:    d.paymentMethod   ?? order.paymentMethod ?? null,
        paymentReference: d.paymentReference ?? order.utrReference ?? null,
        supportTicketId:  d.supportTicketId ?? null,
        supportAgentId:   String(admin.id ?? ""),
        supportNote:      d.supportNote ?? null,
        requestedAt:      new Date(),
        metadata:         { source: "support_created", created_by_role: admin.role } as any,
      })
      .returning();

    await logRefundAudit(req, "REFUND_CASE_CREATED", refundCase.id, "NONE", "PENDING", {
      orderId: d.orderId,
      userId: d.userId,
    });

    sendEmailSafe(
      refundCaseCreatedEmail({
        customerName:  displayName(user),
        customerEmail: user.email,
        refundCaseId:  refundCase.id,
        orderId:       d.orderId,
        refundAmount:  d.refundAmount,
        reason:        d.reason,
      }),
      "case-created",
    );

    logger.info({ refundCaseId: refundCase.id, orderId: d.orderId }, "Refund case created");
    return res.status(201).json({ success: true, refundCase });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] create case failed");
    return res.status(500).json({ error: "Failed to create refund case" });
  }
});

// ─── GET /api/refunds/cases ───────────────────────────────────────────────────

router.get("/cases", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, SUPPORT_ROLES)) return res.status(403).json({ error: "Insufficient permissions" });

  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const limit  = Math.min(100, parseInt(req.query.limit  as string) || 50);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const conditions: any[] = [];

    if (status && status !== "all") {
      conditions.push(eq(refundRequests.status, status.toUpperCase()));
    }

    if (search && search.length >= 3) {
      const s = `%${search}%`;
      const matchingUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(ilike(users.email, s));

      const searchParts: any[] = [
        ilike(refundRequests.orderId, s),
        ilike(refundRequests.id,      s),
      ];

      if (matchingUsers.length > 0) {
        const uids = matchingUsers.map(u => `'${u.id}'`).join(",");
        searchParts.push(sql`${refundRequests.userId}::text IN (${sql.raw(uids)})`);
      }

      conditions.push(or(...searchParts));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [casesResult, countResult, statusCountsResult] = await Promise.all([
      db
        .select()
        .from(refundRequests)
        .where(where)
        .orderBy(desc(refundRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(refundRequests)
        .where(where),
      db
        .select({ status: refundRequests.status, count: sql<number>`COUNT(*)::int` })
        .from(refundRequests)
        .groupBy(refundRequests.status),
    ]);

    // Enrich with user emails
    const uids = [...new Set(casesResult.map(c => String(c.userId)).filter(Boolean))];
    let userMap: Record<string, { email: string; firstName: string | null; lastName: string | null }> = {};
    if (uids.length > 0) {
      const uidList = uids.map(id => `'${id}'`).join(",");
      const usrs = await db
        .select({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(sql`${users.id}::text IN (${sql.raw(uidList)})`);
      userMap = Object.fromEntries(usrs.map(u => [String(u.id), u]));
    }

    const enriched = casesResult.map(c => ({
      ...c,
      user: userMap[String(c.userId)] ?? null,
    }));

    return res.json({
      cases: enriched,
      total: Number(countResult[0]?.count ?? 0),
      limit,
      offset,
      statusCounts: Object.fromEntries(
        statusCountsResult.map(s => [s.status, Number(s.count)]),
      ),
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] list cases failed");
    return res.status(500).json({ error: "Failed to list refund cases" });
  }
});

// ─── GET /api/refunds/cases/:id ───────────────────────────────────────────────

router.get("/cases/:id", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, SUPPORT_ROLES)) return res.status(403).json({ error: "Insufficient permissions" });

  try {
    const [refundCase] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!refundCase) return res.status(404).json({ error: "Refund case not found" });

    const { user, order } = await loadUserAndOrder(refundCase.orderId, String(refundCase.userId));

    // Policy checks
    const orderAgeMs  = order ? Date.now() - new Date(order.createdAt).getTime() : Infinity;
    const within48h   = orderAgeMs < 48 * 60 * 60 * 1000;

    const previousRefunds = await db
      .select({ id: refundRequests.id, status: refundRequests.status, createdAt: refundRequests.createdAt })
      .from(refundRequests)
      .where(
        and(
          eq(refundRequests.orderId, refundCase.orderId),
          sql`${refundRequests.id}::text != ${refundCase.id}`,
        ),
      );

    const hasPreviousRefund = previousRefunds.some(r =>
      ["APPROVED", "PROCESSING", "REFUNDED"].includes(r.status),
    );

    return res.json({
      refundCase,
      customer: user
        ? {
            id:            user.id,
            email:         user.email,
            name:          displayName(user),
            firstName:     user.firstName,
            lastName:      user.lastName,
            phone:         user.phone,
            role:          user.role,
            accountStatus: user.accountStatus,
          }
        : null,
      order: order
        ? {
            id:            order.id,
            createdAt:     order.createdAt,
            planType:      order.planType,
            paymentType:   order.paymentType,
            accountSize:   order.accountSize,
            amount:        order.amount,
            status:        order.status,
            paymentMethod: order.paymentMethod,
            utrReference:  order.utrReference,
            metadata:      order.metadata,
          }
        : null,
      eligibility: {
        withinPolicyWindow: within48h,
        hasPreviousRefund,
        orderStatus: order?.status ?? "unknown",
      },
      previousRefunds,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] get case failed");
    return res.status(500).json({ error: "Failed to load refund case" });
  }
});

// ─── PATCH .../review ─────────────────────────────────────────────────────────

router.patch("/cases/:id/review", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status !== "PENDING") {
      return res.status(400).json({ error: `Cannot start review: status is ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({ status: "UNDER_REVIEW", reviewedBy: String(admin.id ?? ""), reviewedAt: new Date(), updatedAt: new Date() })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_REVIEW_STARTED", existing.id, "PENDING", "UNDER_REVIEW");
    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] review failed");
    return res.status(500).json({ error: "Failed to update refund case" });
  }
});

// ─── PATCH .../request-info ───────────────────────────────────────────────────

router.patch("/cases/:id/request-info", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = requestInfoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!["PENDING", "UNDER_REVIEW"].includes(existing.status)) {
      return res.status(400).json({ error: `Cannot request info at status ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:    "MORE_INFORMATION_REQUIRED",
        metadata:  sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          infoRequested: parsed.data.infoRequested,
          requestedBy: String(admin.id ?? ""),
          requestedAt: new Date().toISOString(),
        })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_MORE_INFO_REQUESTED", existing.id, existing.status, "MORE_INFORMATION_REQUIRED", {
      infoRequested: parsed.data.infoRequested,
    });

    const { user, order } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user && order) {
      sendEmailSafe(
        refundMoreInfoEmail({
          customerName:  displayName(user),
          customerEmail: user.email,
          refundCaseId:  existing.id,
          orderId:       existing.orderId,
          infoRequested: parsed.data.infoRequested,
        }),
        "more-info",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] request-info failed");
    return res.status(500).json({ error: "Failed to update refund case" });
  }
});

// ─── PATCH .../approve ────────────────────────────────────────────────────────

router.patch("/cases/:id/approve", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!["PENDING", "UNDER_REVIEW", "MORE_INFORMATION_REQUIRED"].includes(existing.status)) {
      return res.status(400).json({ error: `Cannot approve at status ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:     "APPROVED",
        reviewedBy: String(admin.id ?? ""),
        reviewedAt: new Date(),
        updatedAt:  new Date(),
        metadata:   sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          approveNote: parsed.data.approveNote ?? null,
          approvedBy: String(admin.id ?? ""),
          approvedAt: new Date().toISOString(),
        })}::jsonb`,
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_APPROVED", existing.id, existing.status, "APPROVED");

    const { user, order } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user && order) {
      sendEmailSafe(
        refundApprovedEmail({
          customerName:  displayName(user),
          customerEmail: user.email,
          refundCaseId:  existing.id,
          orderId:       existing.orderId,
          approvedAmount: Number(existing.refundAmount),
          paymentMethod:  existing.paymentMethod ?? order.paymentMethod ?? "original payment method",
        }),
        "approved",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] approve failed");
    return res.status(500).json({ error: "Failed to approve refund case" });
  }
});

// ─── PATCH .../reject — reason REQUIRED ──────────────────────────────────────

router.patch("/cases/:id/reject", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!["PENDING", "UNDER_REVIEW", "MORE_INFORMATION_REQUIRED"].includes(existing.status)) {
      return res.status(400).json({ error: `Cannot reject at status ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:          "REJECTED",
        reviewedBy:      String(admin.id ?? ""),
        reviewedAt:      new Date(),
        rejectionReason: parsed.data.rejectionReason,
        rejectionNote:   parsed.data.rejectionNote ?? null,
        updatedAt:       new Date(),
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_REJECTED", existing.id, existing.status, "REJECTED", {
      rejectionReason: parsed.data.rejectionReason,
    });

    const { user, order } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user && order) {
      sendEmailSafe(
        refundRejectedEmail({
          customerName:    displayName(user),
          customerEmail:   user.email,
          refundCaseId:    existing.id,
          orderId:         existing.orderId,
          rejectionReason: parsed.data.rejectionReason,
          adminNote:       parsed.data.rejectionNote,
        }),
        "rejected",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] reject failed");
    return res.status(500).json({ error: "Failed to reject refund case" });
  }
});

// ─── PATCH .../process ────────────────────────────────────────────────────────

router.patch("/cases/:id/process", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = processSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status !== "APPROVED") {
      return res.status(400).json({ error: `Must be APPROVED before PROCESSING. Current: ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:          "PROCESSING",
        processedAt:     new Date(),
        gatewayRefundId: parsed.data.gatewayRefundId ?? null,
        refundMethod:    parsed.data.refundMethod ?? existing.paymentMethod ?? null,
        updatedAt:       new Date(),
        metadata:        sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          processNote: parsed.data.processNote ?? null,
          processedBy: String(admin.id ?? ""),
          processedAt: new Date().toISOString(),
        })}::jsonb`,
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_PROCESSING", existing.id, "APPROVED", "PROCESSING", {
      gatewayRefundId: parsed.data.gatewayRefundId,
    });

    const { user, order } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user && order) {
      sendEmailSafe(
        refundProcessingEmail({
          customerName:    displayName(user),
          customerEmail:   user.email,
          refundCaseId:    existing.id,
          orderId:         existing.orderId,
          refundAmount:    Number(existing.refundAmount),
          paymentMethod:   parsed.data.refundMethod ?? existing.paymentMethod ?? order.paymentMethod ?? "original method",
          gatewayRefundId: parsed.data.gatewayRefundId,
        }),
        "processing",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] process failed");
    return res.status(500).json({ error: "Failed to update refund case" });
  }
});

// ─── PATCH .../complete ───────────────────────────────────────────────────────

router.patch("/cases/:id/complete", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status !== "PROCESSING") {
      return res.status(400).json({ error: `Must be PROCESSING before REFUNDED. Current: ${existing.status}` });
    }

    const completedAt = new Date();
    const finalGatewayId = parsed.data.gatewayRefundId ?? existing.gatewayRefundId ?? null;

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:          "REFUNDED",
        completedAt,
        gatewayRefundId: finalGatewayId,
        updatedAt:       new Date(),
        metadata:        sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          completionNote: parsed.data.completionNote ?? null,
          completedBy: String(admin.id ?? ""),
          completedAt: completedAt.toISOString(),
        })}::jsonb`,
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    // Mark order as refunded in orders table
    await db
      .update(orders)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(orders.id, existing.orderId));

    await logRefundAudit(req, "REFUND_COMPLETED", existing.id, "PROCESSING", "REFUNDED", {
      gatewayRefundId: finalGatewayId,
    });

    const { user, order } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user && order) {
      sendEmailSafe(
        refundCompletedEmail({
          customerName:    displayName(user),
          customerEmail:   user.email,
          refundCaseId:    existing.id,
          orderId:         existing.orderId,
          refundAmount:    Number(existing.refundAmount),
          paymentMethod:   existing.refundMethod ?? existing.paymentMethod ?? order.paymentMethod ?? "original method",
          gatewayRefundId: finalGatewayId ?? undefined,
          completedAt:     completedAt.toISOString(),
        }),
        "completed",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] complete failed");
    return res.status(500).json({ error: "Failed to complete refund case" });
  }
});

// ─── PATCH .../fail ───────────────────────────────────────────────────────────

router.patch("/cases/:id/fail", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  const parsed = failSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status !== "PROCESSING") {
      return res.status(400).json({ error: `Can only fail from PROCESSING. Current: ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:    "FAILED",
        updatedAt: new Date(),
        metadata:  sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          failureNote: parsed.data.failureNote ?? null,
          failedBy: String(admin.id ?? ""),
          failedAt: new Date().toISOString(),
        })}::jsonb`,
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_FAILED", existing.id, "PROCESSING", "FAILED");

    const { user } = await loadUserAndOrder(existing.orderId, String(existing.userId));
    if (user) {
      sendEmailSafe(
        refundFailedEmail({
          customerName:  displayName(user),
          customerEmail: user.email,
          refundCaseId:  existing.id,
          orderId:       existing.orderId,
          refundAmount:  Number(existing.refundAmount),
        }),
        "failed",
      );
    }

    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] fail failed");
    return res.status(500).json({ error: "Failed to update refund case" });
  }
});

// ─── PATCH .../cancel ─────────────────────────────────────────────────────────

router.patch("/cases/:id/cancel", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  try {
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (["REFUNDED", "PROCESSING", "CANCELLED"].includes(existing.status)) {
      return res.status(400).json({ error: `Cannot cancel at status ${existing.status}` });
    }

    const [updated] = await db
      .update(refundRequests)
      .set({
        status:    "CANCELLED",
        updatedAt: new Date(),
        metadata:  sql`COALESCE(${refundRequests.metadata}, '{}')::jsonb || ${JSON.stringify({
          cancelledBy: String(admin.id ?? ""),
          cancelledAt: new Date().toISOString(),
          cancelNote: req.body?.cancelNote ?? null,
        })}::jsonb`,
      })
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .returning();

    await logRefundAudit(req, "REFUND_CANCELLED", existing.id, existing.status, "CANCELLED");
    return res.json({ success: true, refundCase: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] cancel failed");
    return res.status(500).json({ error: "Failed to cancel refund case" });
  }
});

// ─── GET .../trading-evidence — READ ONLY ─────────────────────────────────────

router.get("/cases/:id/trading-evidence", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, FINANCE_ROLES)) return res.status(403).json({ error: "Finance role required" });

  try {
    const [refundCase] = await db
      .select({ orderId: refundRequests.orderId, userId: refundRequests.userId })
      .from(refundRequests)
      .where(sql`${refundRequests.id}::text = ${req.params.id}`)
      .limit(1);

    if (!refundCase) return res.status(404).json({ error: "Refund case not found" });

    if (!supabaseAdmin) {
      return res.json({ available: false, reason: "Trading evidence unavailable — no database connection" });
    }

    // Resolve trading_account and challenge_account linked to this order (READ ONLY)
    const { data: provLog } = await supabaseAdmin
      .from("provisioning_logs")
      .select("trading_account_id, challenge_account_id, status")
      .eq("order_id", refundCase.orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!provLog) {
      return res.json({ available: false, reason: "No provisioning record found for this order" });
    }

    // Trading account (READ ONLY)
    let tradingAccount: any = null;
    if (provLog.trading_account_id) {
      const { data: ta } = await supabaseAdmin
        .from("trading_accounts")
        .select("id, status, balance, equity, plan_type, account_size, created_at")
        .eq("id", provLog.trading_account_id)
        .single();
      tradingAccount = ta ?? null;
    }

    // Challenge account (READ ONLY)
    let challengeAccount: any = null;
    if (provLog.challenge_account_id) {
      const { data: ca } = await supabaseAdmin
        .from("challenge_accounts")
        .select("id, status, initial_balance, current_balance, profit_target_pct, daily_drawdown_limit_pct, max_drawdown_limit_pct, trading_days_completed, profit_pct, max_daily_drawdown_pct, max_drawdown_pct, started_at, completed_at")
        .eq("id", provLog.challenge_account_id)
        .single();
      challengeAccount = ca ?? null;
    }

    // Recent trades (READ ONLY) — last 20
    let recentTrades: any[] = [];
    if (tradingAccount?.id || challengeAccount?.id) {
      const accountId = tradingAccount?.id ?? challengeAccount?.id;
      const { data: trades } = await supabaseAdmin
        .from("trade_journal")
        .select("id, symbol, direction, lot_size, entry_price, exit_price, profit_loss, status, opened_at, closed_at")
        .eq("account_id", accountId)
        .order("opened_at", { ascending: false })
        .limit(20);
      recentTrades = trades ?? [];
    }

    const hasTradeActivity = recentTrades.length > 0 ||
      (challengeAccount?.trading_days_completed ?? 0) > 0;

    return res.json({
      available: true,
      provisioningStatus: provLog.status,
      tradingAccount,
      challengeAccount,
      recentTrades,
      summary: {
        hasTradeActivity,
        tradingDaysCompleted: challengeAccount?.trading_days_completed ?? 0,
        currentBalance:       tradingAccount?.balance ?? challengeAccount?.current_balance ?? null,
        accountStatus:        tradingAccount?.status ?? challengeAccount?.status ?? "unknown",
        profitPct:            challengeAccount?.profit_pct ?? null,
      },
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] trading-evidence failed");
    return res.json({ available: false, reason: "Trading evidence unavailable — error retrieving data" });
  }
});

// ─── GET /api/refunds/orders/:orderId/check ───────────────────────────────────
// Support: before creating a case, check if one already exists for this order.

router.get("/orders/:orderId/check", async (req: Request, res: Response) => {
  const admin = req.adminUser;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  if (!hasRole(admin, SUPPORT_ROLES)) return res.status(403).json({ error: "Insufficient permissions" });

  try {
    const cases = await db
      .select({ id: refundRequests.id, status: refundRequests.status, createdAt: refundRequests.createdAt })
      .from(refundRequests)
      .where(eq(refundRequests.orderId, req.params.orderId as string))
      .orderBy(desc(refundRequests.createdAt));

    const activeCase = cases.find(c =>
      !["REFUNDED", "REJECTED", "CANCELLED", "FAILED"].includes(c.status),
    );

    return res.json({
      hasActiveCase: !!activeCase,
      activeCase:    activeCase ?? null,
      allCases:      cases,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "[RefundRoute] order check failed");
    return res.status(500).json({ error: "Failed to check refund cases" });
  }
});

export default router;
