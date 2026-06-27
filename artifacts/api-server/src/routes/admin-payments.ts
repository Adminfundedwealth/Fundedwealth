/**
 * Admin Payment Management Routes
 * 
 * Three sections:
 * - Challenge Payments: /api/admin-payments/challenges
 * - Championship Payments: /api/admin-payments/championship
 * - Impact Donations: /api/admin-payments/donations
 */

import { Router } from "express";
import { getAuth, requireAdminAuth } from "../middlewares/supabaseAuth";
import { db, users, orders, championshipRegistrations, impactDonations } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { AuditService } from "../lib/audit-service";
import { adminSecurityMiddleware } from "../middlewares/securityMiddleware";

const router = Router();

const ADMIN_ROLES = ["super_admin", "admin", "finance"];

// Apply admin MFA enforcement to ALL admin-payments routes
router.use(requireAdminAuth);

async function requireAdmin(req: any, res: any): Promise<any | null> {
  // Already verified by requireAdminAuth middleware above
  return req.adminUser || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHALLENGE PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/challenges", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const status = (req.query.status as string) || "all";
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    let query = db
      .select()
      .from(orders)
      .where(eq(orders.paymentType, "challenge"))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    if (status !== "all") {
      query = db
        .select()
        .from(orders)
        .where(and(eq(orders.paymentType, "challenge"), eq(orders.status, status)))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const payments = await query;

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE status = 'confirmed')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')`,
        failed: sql<number>`COUNT(*) FILTER (WHERE status = 'failed')`,
        refunded: sql<number>`COUNT(*) FILTER (WHERE status = 'refunded')`,
        totalRevenue: sql<number>`COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0)`,
      })
      .from(orders)
      .where(eq(orders.paymentType, "challenge"));

    res.json({ payments, stats });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin: failed to fetch challenge payments");
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAMPIONSHIP PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/championship", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const entries = await db
      .select()
      .from(championshipRegistrations)
      .orderBy(desc(championshipRegistrations.createdAt))
      .limit(limit)
      .offset(offset);

    const payments = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentType, "championship"))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [stats] = await db
      .select({
        totalEntries: sql<number>`COUNT(*)`,
        paidEntries: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'paid')`,
        pendingEntries: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'pending')`,
        totalRevenue: sql<number>`COALESCE(SUM(profit_amount), 0)`,
      })
      .from(championshipRegistrations);

    res.json({ entries, payments, stats });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin: failed to fetch championship data");
    res.status(500).json({ error: "Failed to fetch championship data" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// IMPACT DONATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/donations", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const offset = parseInt(req.query.offset as string) || 0;
  const category = req.query.category as string | undefined;

  try {
    let donationsQuery;
    if (category && category !== "all") {
      donationsQuery = db
        .select()
        .from(impactDonations)
        .where(eq(impactDonations.category, category))
        .orderBy(desc(impactDonations.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      donationsQuery = db
        .select()
        .from(impactDonations)
        .orderBy(desc(impactDonations.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const donations = await donationsQuery;

    const [stats] = await db
      .select({
        totalDonations: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        totalMeals: sql<number>`COALESCE(SUM(meals_provided), 0)`,
        totalStudents: sql<number>`COALESCE(SUM(students_supported), 0)`,
        uniqueDonors: sql<number>`COUNT(DISTINCT donor_name)`,
      })
      .from(impactDonations)
      .where(eq(impactDonations.status, "completed"));

    // Top donors
    const topDonors = await db
      .select({
        donorName: impactDonations.donorName,
        totalAmount: sql<number>`SUM(amount)`,
        donationCount: sql<number>`COUNT(*)`,
      })
      .from(impactDonations)
      .where(eq(impactDonations.status, "completed"))
      .groupBy(impactDonations.donorName)
      .orderBy(sql`SUM(amount) DESC`)
      .limit(10);

    // By category
    const byCategory = await db
      .select({
        category: impactDonations.category,
        totalAmount: sql<number>`SUM(amount)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(impactDonations)
      .where(eq(impactDonations.status, "completed"))
      .groupBy(impactDonations.category)
      .orderBy(sql`SUM(amount) DESC`);

    // Monthly summary
    const monthlySummary = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
        totalAmount: sql<number>`SUM(amount)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(impactDonations)
      .where(eq(impactDonations.status, "completed"))
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM') DESC`)
      .limit(12);

    res.json({ donations, stats, topDonors, byCategory, monthlySummary });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin: failed to fetch donation data");
    res.status(500).json({ error: "Failed to fetch donation data" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REFUND (shared across all payment types)
// ═══════════════════════════════════════════════════════════════════════════════

router.post("/refund/:orderId", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "refunded") return res.status(400).json({ error: "Already refunded" });

    // Mark as refunded in DB (actual Razorpay refund should be done via Razorpay dashboard)
    await db
      .update(orders)
      .set({ status: "refunded", updatedAt: new Date(), metadata: JSON.stringify({ refundReason: reason, refundedBy: admin.id, refundedAt: new Date().toISOString() }) })
      .where(eq(orders.id, orderId));

    // SECURITY: Audit log for refund
    await AuditService.logAdminAction(req, "ADMIN_REFUND", "orders", orderId, {
      reason,
      originalStatus: order.status,
      amount: order.amount,
    });

    logger.info({ orderId, adminId: admin.id, reason }, "Admin: order marked as refunded");
    res.json({ success: true, message: "Order marked as refunded" });
  } catch (err: any) {
    logger.error({ err: err.message }, "Admin: refund failed");
    res.status(500).json({ error: "Refund failed" });
  }
});

export default router;
