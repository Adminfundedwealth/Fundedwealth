import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users, orders } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/accounts/my
 * Returns all accounts/provisioning records for the authenticated user.
 *
 * DATA CHAIN:
 *   auth.users.id → public.users.clerk_id → public.users.id
 *   → public.orders (user's purchases)
 *   → provisioning_logs (by order_id)
 *   → challenge_accounts / trading_accounts (terminal-owned, read-only)
 *
 * This endpoint reads from terminal-owned tables but NEVER writes to them.
 * Account lifecycle is fully owned by the terminal.
 *
 * DASHBOARD STATES:
 *   - provisioning_pending: order confirmed, provisioning_logs.status = 'pending'
 *   - provisioning_failed: provisioning_logs.status = 'failed'
 *   - active: challenge_accounts.status = 'active'
 *   - passed / breached / expired: from challenge_accounts.status
 */
router.get("/my", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // 1. Find user by Supabase auth ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Get user's confirmed/paid orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, String(user.id)))
      .orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return res.json({ success: true, accounts: [] });
    }

    // 3. Get provisioning_logs for these orders (raw SQL — terminal-owned table)
    const orderIds = userOrders.map(o => o.id);
    const provLogs = await db.execute(sql`
      SELECT 
        pl.id as provisioning_id,
        pl.order_id,
        pl.plan,
        pl.payment_method,
        pl.payment_ref,
        pl.status as provisioning_status,
        pl.error_message,
        pl.trader_id,
        pl.challenge_account_id,
        pl.trading_account_id,
        pl.started_at,
        pl.completed_at,
        pl.created_at
      FROM provisioning_logs pl
      WHERE pl.order_id = ANY(${orderIds})
      ORDER BY pl.created_at DESC
    `);

    // 4. For completed provisioning, fetch challenge_accounts details
    const challengeIds = (provLogs.rows as any[])
      .filter((pl: any) => pl.challenge_account_id)
      .map((pl: any) => pl.challenge_account_id);

    let challengeAccounts: any[] = [];
    if (challengeIds.length > 0) {
      const caResult = await db.execute(sql`
        SELECT 
          id,
          type,
          plan,
          initial_balance,
          current_balance,
          peak_balance,
          profit_target_pct,
          daily_loss_limit_pct,
          max_drawdown_pct,
          min_trading_days,
          status,
          started_at,
          expires_at,
          passed_at,
          failed_at,
          fail_reason,
          created_at,
          updated_at
        FROM challenge_accounts
        WHERE id = ANY(${challengeIds})
      `);
      challengeAccounts = caResult.rows as any[];
    }

    // 5. For completed provisioning, fetch trading_accounts details
    const tradingIds = (provLogs.rows as any[])
      .filter((pl: any) => pl.trading_account_id)
      .map((pl: any) => pl.trading_account_id);

    let tradingAccountRows: any[] = [];
    if (tradingIds.length > 0) {
      const taResult = await db.execute(sql`
        SELECT 
          id,
          account_code,
          broker_provider,
          balance,
          available_margin,
          status,
          created_at,
          updated_at
        FROM trading_accounts
        WHERE id = ANY(${tradingIds})
      `);
      tradingAccountRows = taResult.rows as any[];
    }

    // 6. Build account list — one entry per provisioning attempt (or per order if no provisioning yet)
    const challengeMap = new Map(challengeAccounts.map((ca: any) => [ca.id, ca]));
    const tradingMap = new Map(tradingAccountRows.map((ta: any) => [ta.id, ta]));
    const provByOrder = new Map<string, any[]>();
    for (const pl of provLogs.rows as any[]) {
      const existing = provByOrder.get(pl.order_id) || [];
      existing.push(pl);
      provByOrder.set(pl.order_id, existing);
    }

    const accounts: any[] = [];

    for (const order of userOrders) {
      // Skip orders that are not yet confirmed/paid
      if (!["confirmed", "paid"].includes(order.status)) continue;

      const provEntries = provByOrder.get(order.id) || [];

      if (provEntries.length === 0) {
        // Order confirmed but no provisioning_logs entry yet — show as pending
        accounts.push({
          id: `pending-${order.id}`,
          accountCode: null,
          planType: order.planType,
          phase: "pending",
          status: "provisioning_pending",
          currentBalance: order.accountSize || 0,
          startBalance: order.accountSize || 0,
          profitLoss: 0,
          profitTarget: Math.round((order.accountSize || 0) * 0.10),
          maxDrawdown: Math.round((order.accountSize || 0) * 0.06),
          dailyLossLimit: Math.round((order.accountSize || 0) * 0.03),
          dailyDrawdown: 0,
          profitSplit: 80,
          tradingDays: 0,
          scalingLevel: 1,
          isFunded: false,
          fundedAt: null,
          feePaid: order.amount || 0,
          couponUsed: null,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          expiresAt: null,
          orderId: order.id,
          provisioningStatus: "pending",
          canLaunch: false,
        });
        continue;
      }

      // Use the most recent provisioning entry for this order
      const prov = provEntries[0];

      if (prov.provisioning_status === "pending") {
        accounts.push({
          id: `pending-${order.id}`,
          accountCode: null,
          planType: order.planType,
          phase: "pending",
          status: "provisioning_pending",
          currentBalance: order.accountSize || 0,
          startBalance: order.accountSize || 0,
          profitLoss: 0,
          profitTarget: Math.round((order.accountSize || 0) * 0.10),
          maxDrawdown: Math.round((order.accountSize || 0) * 0.06),
          dailyLossLimit: Math.round((order.accountSize || 0) * 0.03),
          dailyDrawdown: 0,
          profitSplit: 80,
          tradingDays: 0,
          scalingLevel: 1,
          isFunded: false,
          fundedAt: null,
          feePaid: order.amount || 0,
          couponUsed: null,
          createdAt: order.createdAt,
          updatedAt: prov.started_at || order.updatedAt,
          expiresAt: null,
          orderId: order.id,
          provisioningStatus: "pending",
          canLaunch: false,
        });
      } else if (prov.provisioning_status === "failed") {
        accounts.push({
          id: `failed-${order.id}`,
          accountCode: null,
          planType: order.planType,
          phase: "failed",
          status: "provisioning_failed",
          currentBalance: 0,
          startBalance: order.accountSize || 0,
          profitLoss: 0,
          profitTarget: 0,
          maxDrawdown: 0,
          dailyLossLimit: 0,
          dailyDrawdown: 0,
          profitSplit: 80,
          tradingDays: 0,
          scalingLevel: 1,
          isFunded: false,
          fundedAt: null,
          feePaid: order.amount || 0,
          couponUsed: null,
          createdAt: order.createdAt,
          updatedAt: prov.completed_at || order.updatedAt,
          expiresAt: null,
          orderId: order.id,
          provisioningStatus: "failed",
          provisioningError: prov.error_message || "Provisioning failed. Contact support.",
          canLaunch: false,
        });
      } else if (prov.provisioning_status === "completed") {
        // Provisioning completed — use terminal-owned account data
        const challenge = challengeMap.get(prov.challenge_account_id);
        const trading = tradingMap.get(prov.trading_account_id);

        const accountCode = trading?.account_code || null;
        const initialBalance = challenge ? Number(challenge.initial_balance) : (order.accountSize || 0);
        const currentBalance = challenge ? Number(challenge.current_balance) : initialBalance;
        const challengeStatus = challenge?.status || "active";

        // Map terminal status to dashboard status
        let dashStatus = challengeStatus;
        if (challengeStatus === "active") dashStatus = "active";
        else if (challengeStatus === "passed") dashStatus = "passed";
        else if (challengeStatus === "failed" || challengeStatus === "breached") dashStatus = "breached";

        // Determine phase from challenge type
        let phase = "phase_1";
        if (challenge?.type?.includes("phase2")) phase = "phase_2";
        else if (challenge?.type?.includes("funded")) phase = "funded";

        const canLaunch = challengeStatus === "active" && trading?.status === "active";

        accounts.push({
          // Use the trading_account ID as the canonical account identifier for launch
          id: prov.trading_account_id || prov.challenge_account_id || `completed-${order.id}`,
          accountCode,
          planType: challenge?.plan || order.planType,
          phase,
          status: dashStatus,
          currentBalance,
          startBalance: initialBalance,
          profitLoss: currentBalance - initialBalance,
          profitTarget: challenge ? Math.round(initialBalance * Number(challenge.profit_target_pct) / 100) : Math.round(initialBalance * 0.10),
          maxDrawdown: challenge ? Math.round(initialBalance * Number(challenge.max_drawdown_pct) / 100) : Math.round(initialBalance * 0.06),
          dailyLossLimit: challenge ? Math.round(initialBalance * Number(challenge.daily_loss_limit_pct) / 100) : Math.round(initialBalance * 0.03),
          dailyDrawdown: 0,
          profitSplit: 80,
          tradingDays: challenge?.min_trading_days || 0,
          scalingLevel: 1,
          isFunded: phase === "funded",
          fundedAt: null,
          feePaid: order.amount || 0,
          couponUsed: null,
          createdAt: challenge?.created_at || order.createdAt,
          updatedAt: challenge?.updated_at || order.updatedAt,
          expiresAt: challenge?.expires_at || null,
          orderId: order.id,
          provisioningStatus: "completed",
          canLaunch,
        });
      }
    }

    return res.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    console.error("[Accounts] Failed to fetch user accounts:", error);
    return res.status(500).json({ success: false, message: "Failed to load accounts" });
  }
});

/**
 * GET /api/accounts/:accountId
 * Returns a single account by its terminal trading_account ID.
 * Used by launch-terminal flow to get account details before SSO handoff.
 *
 * Verifies ownership via: trading_accounts → provisioning_logs.order_id → orders.user_id
 */
router.get("/:accountId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { accountId } = req.params;

    // 1. Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Find provisioning_logs entry for this trading_account_id and verify ownership
    const provResult = await db.execute(sql`
      SELECT pl.*, o.user_id as order_user_id, o.plan_type, o.amount, o.account_size
      FROM provisioning_logs pl
      JOIN orders o ON o.id = pl.order_id
      WHERE (pl.trading_account_id = ${accountId}::uuid OR pl.challenge_account_id = ${accountId}::uuid)
        AND o.user_id = ${String(user.id)}
      LIMIT 1
    `);

    if (!provResult.rows || provResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const prov = provResult.rows[0] as any;

    // 3. Get challenge_accounts details
    let challenge: any = null;
    if (prov.challenge_account_id) {
      const caResult = await db.execute(sql`
        SELECT * FROM challenge_accounts WHERE id = ${prov.challenge_account_id}::uuid LIMIT 1
      `);
      challenge = (caResult.rows as any[])[0] || null;
    }

    // 4. Get trading_accounts details
    let trading: any = null;
    if (prov.trading_account_id) {
      const taResult = await db.execute(sql`
        SELECT * FROM trading_accounts WHERE id = ${prov.trading_account_id}::uuid LIMIT 1
      `);
      trading = (taResult.rows as any[])[0] || null;
    }

    const initialBalance = challenge ? Number(challenge.initial_balance) : (prov.account_size || 0);
    const currentBalance = challenge ? Number(challenge.current_balance) : initialBalance;
    const challengeStatus = challenge?.status || prov.status;

    return res.json({
      success: true,
      account: {
        id: prov.trading_account_id || prov.challenge_account_id || accountId,
        accountCode: trading?.account_code || null,
        planType: challenge?.plan || prov.plan_type || prov.plan,
        phase: challenge?.type?.includes("phase2") ? "phase_2" : challenge?.type?.includes("funded") ? "funded" : "phase_1",
        status: challengeStatus,
        currentBalance,
        startBalance: initialBalance,
        profitLoss: currentBalance - initialBalance,
        profitTarget: challenge ? Math.round(initialBalance * Number(challenge.profit_target_pct) / 100) : 0,
        maxDrawdown: challenge ? Math.round(initialBalance * Number(challenge.max_drawdown_pct) / 100) : 0,
        dailyLossLimit: challenge ? Math.round(initialBalance * Number(challenge.daily_loss_limit_pct) / 100) : 0,
        dailyDrawdown: 0,
        profitSplit: 80,
        tradingDays: challenge?.min_trading_days || 0,
        scalingLevel: 1,
        isFunded: challenge?.type?.includes("funded") || false,
        fundedAt: null,
        feePaid: prov.amount || 0,
        couponUsed: null,
        createdAt: challenge?.created_at || prov.created_at,
        updatedAt: challenge?.updated_at || prov.created_at,
        expiresAt: challenge?.expires_at || null,
        canLaunch: challengeStatus === "active" && trading?.status === "active",
      },
    });
  } catch (error: any) {
    console.error("[Accounts] Failed to fetch account:", error);
    return res.status(500).json({ success: false, message: "Failed to load account" });
  }
});

export default router;
