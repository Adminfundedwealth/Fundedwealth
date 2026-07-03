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

    // 2. Resolve the user's terminal trader identity.
    //    terminal_traders.external_id = users.id is the AUTHORITATIVE ownership link
    //    for every provisioned account. It is populated identically by website
    //    checkout AND Founder/manual emergency provisioning, so anchoring discovery
    //    here makes both paths produce the EXACT SAME dashboard result.
    const traderRes = await db.execute(sql`
      SELECT id FROM terminal_traders WHERE external_id = ${String(user.id)} LIMIT 1
    `);
    const traderId = (traderRes.rows as any[])[0]?.id ?? null;

    // 3. Pull every LIVE account for this trader straight from the terminal-owned
    //    tables, joined challenge ⇄ trading. Discovery is anchored on trader_id
    //    (NOT order_id), so manually/emergency provisioned accounts surface exactly
    //    like website-purchased ones.
    let liveRows: any[] = [];
    if (traderId) {
      const liveRes = await db.execute(sql`
        SELECT
          ta.id               AS trading_account_id,
          ta.account_code     AS account_code,
          ta.broker_provider  AS broker_provider,
          ta.broker_client_id AS broker_client_id,
          ta.balance          AS ta_balance,
          ta.available_margin AS available_margin,
          ta.status           AS trading_status,
          ca.id               AS challenge_account_id,
          ca.type             AS challenge_type,
          ca.plan             AS plan,
          ca.initial_balance  AS initial_balance,
          ca.current_balance  AS current_balance,
          ca.profit_target_pct    AS profit_target_pct,
          ca.daily_loss_limit_pct AS daily_loss_limit_pct,
          ca.max_drawdown_pct     AS max_drawdown_pct,
          ca.min_trading_days     AS min_trading_days,
          ca.status           AS challenge_status,
          ca.started_at       AS started_at,
          ca.expires_at       AS expires_at,
          ca.created_at       AS created_at,
          ca.updated_at       AS updated_at
        FROM trading_accounts ta
        LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
        WHERE ta.trader_id = ${traderId}::uuid
        ORDER BY ca.created_at DESC NULLS LAST
      `);
      liveRows = liveRes.rows as any[];
    }

    // 4. Load the user's orders + provisioning logs to (a) attach purchase/fee context
    //    to each live account and (b) surface pending/failed provisioning attempts that
    //    don't yet have a live account.
    let userOrders: any[] = [];
    let provLogRows: any[] = [];
    const orderById = new Map<string, any>();
    const tradingToOrder = new Map<string, string>();

    // Order/provisioning context is SUPPLEMENTARY (fee, orderId, pending/failed states).
    // It must never blank out the live accounts, so any failure here is non-fatal.
    try {
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, String(user.id)))
        .orderBy(desc(orders.createdAt));

      for (const o of userOrders) orderById.set(String(o.id), o);
      const orderIds = userOrders.map(o => String(o.id));

      if (orderIds.length > 0) {
        const idList = sql.join(orderIds.map((id) => sql`${id}`), sql`, `);
        const provLogs = await db.execute(sql`
          SELECT id, order_id, status, error_message, trading_account_id, challenge_account_id, started_at, completed_at, created_at
          FROM provisioning_logs
          WHERE order_id::text IN (${idList})
          ORDER BY created_at DESC
        `);
        provLogRows = provLogs.rows as any[];
      }

      // Map trading_account_id → order_id so a live account can show its purchase fee.
      for (const pl of provLogRows) {
        if (pl.trading_account_id) tradingToOrder.set(String(pl.trading_account_id), String(pl.order_id));
      }
    } catch (ctxErr) {
      console.error("[Accounts] Order/provisioning context lookup failed (non-fatal):", ctxErr);
    }

    const accounts: any[] = [];
    const accountedOrderIds = new Set<string>();

    // 5. Map every LIVE account to the dashboard shape (provisioningStatus: "completed").
    for (const row of liveRows) {
      const linkedOrderId = tradingToOrder.get(String(row.trading_account_id)) || null;
      const order = linkedOrderId ? orderById.get(linkedOrderId) : null;
      if (order) accountedOrderIds.add(String(order.id));

      // Extract login credentials stored in order metadata at provisioning time
      let orderMeta: Record<string, any> = {};
      try {
        if (order?.metadata) orderMeta = JSON.parse(order.metadata);
      } catch { /* ignore */ }
      const loginEmail = orderMeta.loginEmail || null;
      const tempPassword = orderMeta.tempPassword || null;

      const initialBalance = row.initial_balance != null
        ? Number(row.initial_balance)
        : (row.ta_balance != null ? Number(row.ta_balance) : (order?.accountSize || 0));
      const currentBalance = row.current_balance != null ? Number(row.current_balance) : initialBalance;
      const challengeStatus = row.challenge_status || "active";

      let dashStatus = challengeStatus;
      if (challengeStatus === "active") dashStatus = "active";
      else if (challengeStatus === "passed") dashStatus = "passed";
      else if (challengeStatus === "failed" || challengeStatus === "breached") dashStatus = "breached";

      // Map challenge_accounts.type to human-readable phase based on the actual product rules
      let phase = "challenge"; // default
      const typeStr = String(row.challenge_type || "").toLowerCase();
      
      // Flash and 1-Step are single-phase challenges
      if (typeStr.includes("flash")) {
        phase = "flash_funding";
      } else if (typeStr.includes("instant") || typeStr.includes("funded")) {
        phase = "funded";
      } else if (typeStr.includes("1step")) {
        phase = "challenge"; // 1-step evaluation
      } else if (typeStr.includes("phase2") || typeStr.includes("2step_evaluation_phase2")) {
        phase = "phase_2";
      } else if (typeStr.includes("phase1") || typeStr.includes("evaluation")) {
        phase = "phase_1";
      }

      const canLaunch = challengeStatus === "active" && row.trading_status === "active";

      // NEW: Fetch real trading statistics from session_analytics
      let totalTrades = 0;
      let winRate = 0;
      let tradingDaysCount = 0;

      try {
        const statsRes = await db.execute(sql`
          SELECT 
            COALESCE(SUM(trades), 0) AS total_trades,
            COALESCE(AVG(win_rate), 0) AS avg_win_rate,
            COUNT(DISTINCT DATE(start_at)) AS trading_days
          FROM session_analytics
          WHERE user_id = (
            SELECT tt.external_id 
            FROM trading_accounts ta
            JOIN terminal_traders tt ON tt.id = ta.trader_id
            WHERE ta.id = ${row.trading_account_id}::uuid
            LIMIT 1
          )
        `);
        
        if (statsRes.rows && statsRes.rows.length > 0) {
          const stats = statsRes.rows[0] as any;
          totalTrades = Number(stats.total_trades) || 0;
          winRate = Number(stats.avg_win_rate) || 0;
          tradingDaysCount = Number(stats.trading_days) || 0;
        }
      } catch (statsErr) {
        console.error("[Accounts] Failed to fetch trading stats (non-fatal):", statsErr);
        // Continue with 0 values if stats fetch fails
      }

      accounts.push({
        // trading_account ID is the canonical identifier used by the launch flow.
        id: row.trading_account_id || row.challenge_account_id,
        accountCode: row.account_code || null,
        brokerProvider: row.broker_provider || null,
        brokerLogin: row.broker_client_id || row.account_code || null,
        planType: row.plan || order?.planType || null,
        phase,
        status: dashStatus,
        currentBalance,
        startBalance: initialBalance,
        profitLoss: currentBalance - initialBalance,
        profitTarget: row.profit_target_pct != null ? Math.round(initialBalance * Number(row.profit_target_pct) / 100) : Math.round(initialBalance * 0.10),
        maxDrawdown: row.max_drawdown_pct != null ? Math.round(initialBalance * Number(row.max_drawdown_pct) / 100) : Math.round(initialBalance * 0.06),
        dailyLossLimit: row.daily_loss_limit_pct != null ? Math.round(initialBalance * Number(row.daily_loss_limit_pct) / 100) : Math.round(initialBalance * 0.03),
        dailyDrawdown: 0,
        profitSplit: 80,
        tradingDays: tradingDaysCount,  // NEW: Real trading days from analytics
        winRate: Math.round(winRate * 10) / 10,  // NEW: Real win rate from analytics
        totalTrades,  // NEW: Real trade count from analytics
        scalingLevel: 1,
        isFunded: phase === "funded",
        fundedAt: null,
        feePaid: order?.amount || 0,
        couponUsed: null,
        createdAt: row.created_at || order?.createdAt || null,
        updatedAt: row.updated_at || order?.updatedAt || null,
        expiresAt: row.expires_at || null,
        orderId: linkedOrderId,
        provisioningStatus: "completed",
        canLaunch,
        // Credentials stored in order metadata at provisioning time
        loginEmail,
        tempPassword,
      });
    }

    // 6. Surface paid/confirmed orders that DON'T yet have a live account
    //    (provisioning pending or failed) so the user still sees progress.
    const provByOrder = new Map<string, any>();
    for (const pl of provLogRows) {
      const key = String(pl.order_id);
      if (!provByOrder.has(key)) provByOrder.set(key, pl); // first row = most recent
    }

    for (const order of userOrders) {
      if (!["confirmed", "paid"].includes(order.status)) continue;
      if (accountedOrderIds.has(String(order.id))) continue; // already represented by a live account

      const prov = provByOrder.get(String(order.id));
      if (prov?.status === "completed") continue; // safety: completed but account row missing

      if (prov?.status === "failed") {
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
      } else {
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
          updatedAt: prov?.started_at || order.updatedAt,
          expiresAt: null,
          orderId: order.id,
          provisioningStatus: "pending",
          canLaunch: false,
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

    // 2. Resolve the account via the TRADER CHAIN and verify ownership.
    //    trading_accounts.trader_id → terminal_traders.external_id = users.id.
    //    Works for website AND manual/emergency provisions (no order dependency).
    const ownRes = await db.execute(sql`
      SELECT
        ta.id  AS trading_account_id,
        ca.id  AS challenge_account_id,
        tt.id  AS trader_id
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE (ta.id = ${accountId}::uuid OR ca.id = ${accountId}::uuid)
        AND tt.external_id = ${String(user.id)}
      LIMIT 1
    `);

    if (!ownRes.rows || ownRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const prov = ownRes.rows[0] as any;

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

    // 5. Find the order that created this account to get credentials
    let orderCreds: any = {};
    try {
      const orderSearch = await db.execute(sql`
        SELECT o.id, o.metadata
        FROM orders o
        JOIN provisioning_logs pl ON pl.order_id = o.id
        WHERE pl.trading_account_id = ${prov.trading_account_id}::uuid
        LIMIT 1
      `);
      if (orderSearch.rows && orderSearch.rows.length > 0) {
        const ord = orderSearch.rows[0] as any;
        if (ord.metadata) {
          try {
            orderCreds = JSON.parse(ord.metadata);
          } catch { /* ignore */ }
        }
      }
    } catch { /* non-fatal */ }

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
        // Credentials from order.metadata
        loginEmail: orderCreds.loginEmail || user.email,
        tempPassword: orderCreds.tempPassword || null,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("[Accounts] Failed to fetch account:", error);
    return res.status(500).json({ success: false, message: "Failed to load account" });
  }
});

/**
 * GET /api/accounts/order/:orderId
 * Returns account details by orderId - used by success page.
 * 
 * SECURITY: Requires authentication OR must be called within 10 minutes of order creation.
 * This prevents unauthorized access while allowing guest checkout success flow.
 */
router.get("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    // 1. Find order
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. SECURITY CHECK: Verify ownership OR recent order
    let authorized = false;

    // Option A: User is authenticated and owns the order
    if (auth?.userId) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, auth.userId))
        .limit(1);

      if (user && order.userId === user.id) {
        authorized = true;
      }
    }

    // Option B: Order is very recent (within 10 minutes) - allows guest checkout success flow
    if (!authorized) {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const TEN_MINUTES = 10 * 60 * 1000;
      
      if (orderAge < TEN_MINUTES) {
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Please login to view account details." 
      });
    }

    // 2. Find provisioning log for this order
    const provResult = await db.execute(sql`
      SELECT * FROM provisioning_logs WHERE order_id = ${orderId} AND status = 'completed' LIMIT 1
    `);

    if (!provResult.rows || provResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Account not provisioned yet. Please wait." 
      });
    }

    const prov = provResult.rows[0] as any;

    // 3. Get challenge and trading account details
    let challenge: any = null;
    let trading: any = null;

    if (prov.challenge_account_id) {
      const caResult = await db.execute(sql`
        SELECT * FROM challenge_accounts WHERE id = ${prov.challenge_account_id}::uuid LIMIT 1
      `);
      challenge = (caResult.rows as any[])[0] || null;
    }

    if (prov.trading_account_id) {
      const taResult = await db.execute(sql`
        SELECT * FROM trading_accounts WHERE id = ${prov.trading_account_id}::uuid LIMIT 1
      `);
      trading = (taResult.rows as any[])[0] || null;
    }

    // 4. Extract credentials from order metadata
    let orderMeta: any = {};
    try {
      if (order.metadata) {
        orderMeta = JSON.parse(order.metadata as string);
      }
    } catch { /* ignore */ }

    // 5. Get user details
    const userResult = await db.execute(sql`
      SELECT email, first_name, last_name FROM users WHERE id = ${order.userId}::uuid LIMIT 1
    `);
    const user = (userResult.rows as any[])[0] || null;

    const initialBalance = challenge ? Number(challenge.initial_balance) : (order.accountSize || 0);
    const currentBalance = challenge ? Number(challenge.current_balance) : initialBalance;

    return res.json({
      success: true,
      account: {
        id: prov.trading_account_id || prov.challenge_account_id,
        accountCode: trading?.account_code || orderMeta.accountCode || "N/A",
        planType: challenge?.plan || order.planType,
        phase: challenge?.type?.includes("phase2") ? "phase_2" : challenge?.type?.includes("funded") ? "funded" : "phase_1",
        status: challenge?.status || "active",
        currentBalance,
        startBalance: initialBalance,
        profitLoss: currentBalance - initialBalance,
        profitTarget: challenge ? Math.round(initialBalance * Number(challenge.profit_target_pct) / 100) : 0,
        maxDrawdown: challenge ? Math.round(initialBalance * Number(challenge.max_drawdown_pct) / 100) : 0,
        dailyLossLimit: challenge ? Math.round(initialBalance * Number(challenge.daily_loss_limit_pct) / 100) : 0,
        isFunded: challenge?.type?.includes("funded") || false,
        createdAt: challenge?.created_at || order.createdAt,
        // Credentials from order.metadata
        loginEmail: orderMeta.loginEmail || user?.email || "Check your email",
        tempPassword: orderMeta.tempPassword || "Use 'Forgot Password' to reset",
        email: user?.email,
      },
    });
  } catch (error: any) {
    console.error("[Accounts] Failed to fetch account by orderId:", error);
    return res.status(500).json({ success: false, message: "Failed to load account" });
  }
});

export default router;
