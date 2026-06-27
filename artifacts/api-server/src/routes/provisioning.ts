/**
 * Provisioning Management Routes
 *
 * Provides admin visibility and retry capability for provisioning_logs.
 * OWNERSHIP: Main Site writes 'pending', Terminal updates to 'completed'/'failed'.
 * Admin can trigger retry for failed provisioning.
 *
 * Routes:
 *   GET  /api/provisioning/status    — list provisioning logs (admin)
 *   POST /api/provisioning/retry/:id — retry a failed provisioning (admin)
 */

import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "../middlewares/supabaseAuth";
import { db, orders } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";
import { AdminEventService } from "../lib/admin-event-service";
import { logger } from "../lib/logger";

const router = Router();

// All provisioning management routes require admin
router.use(requireAdminAuth);

/**
 * GET /api/provisioning/status
 * Returns provisioning logs with order details.
 * Query: status (pending|completed|failed|all), limit, offset
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || "all";
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const statusFilter = status !== "all" ? sql`AND pl.status = ${status}` : sql``;

    const result = await db.execute(sql`
      SELECT 
        pl.id,
        pl.order_id,
        pl.plan,
        pl.payment_method,
        pl.payment_ref,
        pl.source,
        pl.status,
        pl.error_message,
        pl.trader_id,
        pl.challenge_account_id,
        pl.trading_account_id,
        pl.started_at,
        pl.completed_at,
        pl.created_at,
        o.user_id,
        o.amount,
        o.account_size,
        o.plan_type
      FROM provisioning_logs pl
      JOIN orders o ON o.id = pl.order_id
      WHERE 1=1 ${statusFilter}
      ORDER BY pl.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [countResult] = await db.execute(sql`
      SELECT COUNT(*) as total FROM provisioning_logs pl WHERE 1=1 ${statusFilter}
    `) as unknown as [{ total: number }];

    res.json({
      logs: result.rows,
      total: Number((countResult as { total: number })?.total || 0),
      limit,
      offset,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch provisioning status");
    res.status(500).json({ error: "Failed to fetch provisioning logs" });
  }
});

/**
 * POST /api/provisioning/retry/:id
 * Retry a failed provisioning by resetting its status to 'pending'.
 * Terminal will pick it up on next poll cycle.
 */
router.post("/retry/:id", async (req: Request, res: Response) => {
  try {
    const provId = req.params.id as string;

    // Verify the provisioning log exists and is in failed state
    const [existing] = await db.execute(sql`
      SELECT id, order_id, status, error_message
      FROM provisioning_logs
      WHERE id = ${provId}::uuid
      LIMIT 1
    `) as unknown as [{ id: string; order_id: string; status: string; error_message: string | null }];

    if (!existing) {
      return res.status(404).json({ error: "Provisioning log not found" });
    }

    if (existing.status !== "failed") {
      return res.status(400).json({
        error: `Cannot retry provisioning with status '${existing.status}'. Only 'failed' entries can be retried.`,
      });
    }

    // Reset to pending — Terminal will pick it up
    await db.execute(sql`
      UPDATE provisioning_logs
      SET status = 'pending', error_message = NULL, started_at = now()
      WHERE id = ${provId}::uuid
    `);

    logger.info({ provId, orderId: existing.order_id }, "[Provisioning] Retry triggered — reset to pending");

    res.json({
      success: true,
      message: "Provisioning reset to pending. Terminal will process it on next cycle.",
    });
  } catch (err) {
    logger.error({ err }, "Failed to retry provisioning");
    res.status(500).json({ error: "Failed to retry provisioning" });
  }
});

export default router;
