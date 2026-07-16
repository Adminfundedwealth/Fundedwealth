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

import { Router, type Request, type Response, type NextFunction } from "express";
import { requireAdminAuth } from "../middlewares/supabaseAuth";
import { db, orders } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";
import { AdminEventService } from "../lib/admin-event-service";
import { logger } from "../lib/logger";
import { provisionChallenge } from "../lib/provisioning-service";
import { PLAN_TYPES, PRODUCTS, resolveAccountSize, type PlanType } from "@workspace/products";

const router = Router();

/**
 * Allow EITHER an authenticated admin (Supabase JWT) OR a trusted internal
 * service call (the Admin panel) identified by a shared secret header.
 * Also accepts the Supabase service role key as a fallback for server-to-server calls.
 */
function allowInternalOrAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = (process.env.INTERNAL_PROVISION_SECRET || '').trim();
  const provided = (req.header("x-internal-provision-secret") || '').trim();
  // Debug log (remove after fix confirmed)
  logger.info({ secretLen: secret.length, providedLen: provided.length, match: provided === secret }, "[allowInternalOrAdmin]");
  // Match by shared secret
  if (secret && provided && provided === secret) return next();
  // Fallback: accept Supabase service role key (admin-app server-to-server)
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (supabaseServiceKey && provided && provided === supabaseServiceKey) return next();
  return requireAdminAuth(req, res, next);
}

/**
 * GET /api/provisioning/status
 * Returns provisioning logs with order details.
 * Query: status (pending|completed|failed|all), limit, offset
 */
router.get("/status", requireAdminAuth, async (req: Request, res: Response) => {
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
router.post("/retry/:id", requireAdminAuth, async (req: Request, res: Response) => {
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

/**
 * POST /api/provisioning/emergency
 * Founder Emergency Provision — manually provision a challenge for a user
 * WITHOUT a payment, e.g. to recover a stuck order or to grant an account.
 *
 * This uses the EXACT same shared product catalog (@workspace/products) and the
 * shared provisioning service as the website checkout, so the resulting
 * challenge_accounts, trading_accounts and risk settings are identical to a
 * normal website purchase for the same plan + size.
 *
 * Body:
 *   userId?    string  — internal users.id (uuid)
 *   email?     string  — alternative way to identify the user
 *   orderId?   string  — optional existing order to attach + confirm
 *   planType   string  — flash | instant | 1step | 2step
 *   sizeIndex  number  — index into the plan's sizes (default 0)
 *   note?      string  — free-form reason, stored as payment_ref
 */
router.post("/emergency", allowInternalOrAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, email, orderId, planType, sizeIndex = 0, note } = req.body || {};

    if (!planType || !PLAN_TYPES.includes(planType as PlanType)) {
      return res.status(400).json({ success: false, error: "Valid planType is required (flash | instant | 1step | 2step)" });
    }
    if (typeof sizeIndex !== "number" || resolveAccountSize(planType as PlanType, sizeIndex) == null) {
      return res.status(400).json({ success: false, error: "Invalid sizeIndex for the selected plan" });
    }

    // Resolve the internal user id (directly, via email, or via the order)
    let resolvedUserId: string | null = typeof userId === "string" ? userId : null;

    if (!resolvedUserId && typeof email === "string" && email.trim()) {
      const userRows = await db.execute(sql`
        SELECT id FROM users WHERE email = ${email.trim().toLowerCase()} LIMIT 1
      `);
      resolvedUserId = (userRows.rows[0] as any)?.id ?? null;
    }

    if (!resolvedUserId && typeof orderId === "string") {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      resolvedUserId = order?.userId ?? null;
    }

    if (!resolvedUserId) {
      return res.status(404).json({ success: false, error: "Could not resolve a user from userId, email or orderId" });
    }

    const result = await provisionChallenge({
      planType: planType as PlanType,
      orderId: typeof orderId === "string" ? orderId : null,
      userId: resolvedUserId,
      sizeIndex,
      paymentMethod: "founder_emergency",
      paymentRef: typeof note === "string" && note.trim() ? note.trim() : "founder_emergency_provision",
      source: "founder_emergency",
    });

    logger.info({ ...result, planType, sizeIndex, source: "founder_emergency" }, "[Provisioning] Founder emergency provision completed");

    return res.json({
      success: true,
      message: "Emergency provision completed.",
      provisioning: {
        ...result,
        credentials: {
          loginEmail: result.terminalEmail,
          terminalPassword: result.terminalPassword,
          activationToken: result.activationToken,
          accountCode: result.accountCode,
        },
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed founder emergency provision");
    return res.status(500).json({ success: false, error: (err as Error).message || "Failed to provision" });
  }
});

/**
 * GET /api/provisioning/catalog
 * Returns the SINGLE-SOURCE-OF-TRUTH challenge catalog from @workspace/products.
 * Consumed by the Admin panel so it never duplicates product/size/risk values.
 */
router.get("/catalog", allowInternalOrAdmin, (_req: Request, res: Response) => {
  const products = PLAN_TYPES.map((key) => {
    const p = PRODUCTS[key];
    return {
      slug: p.key,
      displayLabel: p.displayLabel,
      serverLabel: p.serverLabel,
      leverage: p.leverage,
      profitSplit: p.profitSplit,
      duration: p.duration,
      maxLoss: p.maxLoss,
      dailyLoss: p.dailyLoss,
      profitTarget: p.profitTarget,
      minDays: p.minDays,
      rules: p.rules,
      sizes: p.sizes.map((s, index) => ({
        index,
        accountSize: s.accountSize,
        sizeLabel: s.sizeLabel,
        fee: s.fee,
        popular: s.popular ?? false,
      })),
    };
  });
  res.json({ products });
});

/**
 * DELETE /api/provisioning/account/:accountCode
 * Admin: Revoke/remove a specific trading account by its account code.
 * Sets trading_account status to 'inactive' and challenge_account status to 'breached'
 * so the user can no longer access or see the account.
 *
 * Auth: admin or internal secret
 */
router.delete("/account/:accountCode", allowInternalOrAdmin, async (req: Request, res: Response) => {
  try {
    const { accountCode } = req.params;
    const { reason } = req.body || {};

    if (!accountCode || typeof accountCode !== "string") {
      return res.status(400).json({ success: false, message: "accountCode is required" });
    }

    const code = accountCode.trim().toUpperCase();

    // 1. Find the trading_account by account_code
    const taResult = await db.execute(sql`
      SELECT ta.id AS trading_account_id, ta.challenge_id, ta.trader_id, ta.status
      FROM trading_accounts ta
      WHERE UPPER(ta.account_code) = ${code}
      LIMIT 1
    `);

    if (!taResult.rows || taResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Account ${code} not found` });
    }

    const ta = taResult.rows[0] as any;

    // 2. Revoke: set trading_account inactive + challenge_account breached
    await db.execute(sql`
      UPDATE trading_accounts
      SET status = 'inactive', updated_at = NOW()
      WHERE id = ${ta.trading_account_id}::uuid
    `);

    if (ta.challenge_id) {
      await db.execute(sql`
        UPDATE challenge_accounts
        SET status = 'breached', updated_at = NOW()
        WHERE id = ${ta.challenge_id}::uuid
      `);
    }

    // 3. Also cancel any linked pending orders for this account
    await db.execute(sql`
      UPDATE provisioning_logs
      SET status = 'revoked', updated_at = NOW()
      WHERE trading_account_id = ${ta.trading_account_id}::uuid
        AND status NOT IN ('revoked', 'failed')
    `);

    logger.info({ accountCode: code, reason: reason || "admin_revoke" }, "account_revoked_by_admin");

    return res.json({
      success: true,
      message: `Account ${code} has been revoked successfully.`,
      accountCode: code,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "admin_revoke_account_failed");
    return res.status(500).json({ success: false, message: "Failed to revoke account" });
  }
});

export default router;
