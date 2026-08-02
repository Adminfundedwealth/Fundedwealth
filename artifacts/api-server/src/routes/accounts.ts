import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users, orders } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { decrypt, isEncrypted } from "../lib/encryption-service";

const router = Router();

const planRuleDefaults = {
  flash: { profitTargetPct: 0, dailyLossLimitPct: 2, maxDrawdownPct: 4 },
  instant: { profitTargetPct: 0, dailyLossLimitPct: 3, maxDrawdownPct: 5 },
  '1step': { profitTargetPct: 10, dailyLossLimitPct: 3, maxDrawdownPct: 6 },
  '2step': { profitTargetPct: 8, dailyLossLimitPct: 3, maxDrawdownPct: 8 },
} as const;

function getPlanRuleDefault(planType: string | null | undefined, field: keyof (typeof planRuleDefaults)['flash']) {
  const normalizedPlan = String(planType || "").toLowerCase();
  const defaults = planRuleDefaults[normalizedPlan as keyof typeof planRuleDefaults] || planRuleDefaults.flash;
  return defaults[field];
}

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
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    // Auto-link by email when the stored clerkId doesn't match the current Supabase auth UUID.
    // Covers ALL cases: no row, supabase_pending_*, guest_*, AND old Clerk IDs (user_xxxxx).
    // A valid Supabase UUID matches: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const isCurrentSupabaseId = user?.clerkId === auth.userId;
    const needsLink = !user || !isCurrentSupabaseId;
    if (needsLink && auth.email) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, auth.email)).limit(1);
      if (byEmail) {
        try {
          const updated = await db
            .update(users)
            .set({ clerkId: auth.userId, updatedAt: new Date() })
            .where(eq(users.id, byEmail.id))
            .returning();
          user = updated[0] ?? byEmail;
        } catch (linkErr: any) {
          console.warn("[Accounts/my] clerkId link failed (non-fatal):", {
            message: linkErr?.message || String(linkErr),
            userId: byEmail.id,
            authUserId: auth.userId,
          });
          user = byEmail;
        }
      }
    }

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
          ta.broker_credentials_encrypted AS broker_credentials_encrypted,
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
          AND ta.status != 'inactive'
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

    // 5a. Batch-fetch per-account stats — trade_logs (authoritative) with session_analytics fallback.
    const tradingAccountIds = liveRows
      .map(r => r.trading_account_id)
      .filter(Boolean);
    const batchStatsMap = new Map<string, { totalTrades: number; winRate: number; tradingDays: number }>();

    if (tradingAccountIds.length > 0 && traderId) {
      try {
        const idLiterals = sql.join(
          tradingAccountIds.map(id => sql`${id}::uuid`),
          sql`, `
        );
        // NOTE: trade_logs table may not exist in all environments.
        // Use session_analytics only (always present) to avoid parse-time errors.
        const batchStats = await db.execute(sql`
          SELECT
            ta.id AS trading_account_id,
            COALESCE(sa_agg.total_trades, 0)   AS total_trades,
            COALESCE(sa_agg.avg_win_rate, 0)   AS avg_win_rate,
            COALESCE(sa_agg.trading_days, 0)   AS trading_days
          FROM trading_accounts ta
          LEFT JOIN LATERAL (
            SELECT
              COALESCE(SUM(sa.trades), 0)::int       AS total_trades,
              COALESCE(AVG(sa.win_rate), 0)           AS avg_win_rate,
              COUNT(DISTINCT DATE(sa.start_at))::int  AS trading_days
            FROM terminal_traders tt
            JOIN session_analytics sa ON sa.user_id = tt.external_id
            WHERE tt.id = ta.trader_id
          ) sa_agg ON true
          WHERE ta.id IN (${idLiterals})
        `);
        for (const row of batchStats.rows as any[]) {
          batchStatsMap.set(String(row.trading_account_id), {
            totalTrades: Number(row.total_trades) || 0,
            winRate: Number(row.avg_win_rate) || 0,
            tradingDays: Number(row.trading_days) || 0,
          });
        }
      } catch (batchErr) {
        console.error("[Accounts] Batch stats fetch failed (non-fatal):", batchErr);
      }
    }
    for (const row of liveRows) {
      const linkedOrderId = tradingToOrder.get(String(row.trading_account_id)) || null;
      const order = linkedOrderId ? orderById.get(linkedOrderId) : null;
      if (order) accountedOrderIds.add(String(order.id));

      // Extract login credentials stored in order metadata at provisioning time
      let orderMeta: Record<string, any> = {};
      try {
        if (order?.metadata) orderMeta = JSON.parse(order.metadata);
      } catch { /* ignore */ }
      const loginEmail = orderMeta.loginEmail || user.email || null;
      const terminalPassword = orderMeta.terminalPassword || orderMeta.tempPassword || (() => {
        // Fallback: decrypt broker_credentials_encrypted from trading_accounts
        if (row.broker_credentials_encrypted) {
          try {
            const raw = row.broker_credentials_encrypted as string;
            const decrypted = isEncrypted(raw) ? decrypt(raw) : raw;
            // Try parse as JSON — handle both key variants; never return raw JSON blob
            try {
              const parsed = JSON.parse(decrypted);
              const pw = parsed?.temporary_password ?? parsed?.password ?? parsed?.tempPassword;
              // If we got a real string password back, use it; otherwise fall back to raw (plain-string creds)
              return (typeof pw === "string" && pw.length > 0) ? pw : (typeof parsed === "string" ? parsed : null);
            } catch { return decrypted; }
          } catch { return null; }
        }
        return null;
      })();
      const activationToken = orderMeta.activationToken || null;

      const initialBalance = row.initial_balance != null
        ? Number(row.initial_balance)
        : (row.ta_balance != null ? Number(row.ta_balance) : (order?.accountSize ?? 0));
      const currentBalance = row.current_balance != null ? Number(row.current_balance) : initialBalance;
      const challengeStatus = row.challenge_status || "active";

      let dashStatus = challengeStatus;
      if (challengeStatus === "active") dashStatus = "active";
      else if (challengeStatus === "passed") dashStatus = "passed";
      else if (challengeStatus === "failed" || challengeStatus === "breached") dashStatus = "breached";

      // Map challenge_accounts.plan (= purchased planType) to human-readable phase.
      // Use plan as primary identifier — it is the purchased product and never changes.
      // challenge_accounts.type only reflects DB storage constraint (funded/evaluation_phase1).
      let phase = "challenge"; // default fallback
      const planStr = String(row.plan || order?.planType || "").toLowerCase();
      const typeStr = String(row.challenge_type || "").toLowerCase();

      // Derive phase from the PURCHASED PLAN — never from challenge_accounts.type alone
      if (planStr === "flash") {
        phase = "flash_funding";
      } else if (planStr === "instant") {
        phase = "funded";
      } else if (planStr === "1step") {
        phase = "challenge"; // 1-step evaluation
      } else if (planStr === "2step") {
        // 2-step: check if they're on phase2 (type = evaluation_phase2)
        if (typeStr.includes("phase2")) {
          phase = "phase_2";
        } else {
          phase = "phase_1";
        }
      } else {
        // Fallback: derive from type string for legacy/manual accounts
        if (typeStr.includes("flash")) {
          phase = "flash_funding";
        } else if (typeStr.includes("instant") || typeStr.includes("funded")) {
          phase = "funded";
        } else if (typeStr.includes("phase2")) {
          phase = "phase_2";
        } else if (typeStr.includes("phase1") || typeStr.includes("evaluation")) {
          phase = "phase_1";
        }
      }

      const canLaunch = ["active", "funded", "passed"].includes(challengeStatus) && row.trading_status === "active";

      // Use pre-fetched batch stats (replaces N+1 per-account DB query)
      const batchedStats = batchStatsMap.get(String(row.trading_account_id));
      const totalTrades = batchedStats?.totalTrades != null ? batchedStats.totalTrades : 0;
      const winRate = batchedStats?.winRate != null ? batchedStats.winRate : 0;
      const tradingDaysCount = batchedStats?.tradingDays != null ? batchedStats.tradingDays : 0;

      const profitTargetPct = row.profit_target_pct !== null && row.profit_target_pct !== undefined
        ? Number(row.profit_target_pct)
        : getPlanRuleDefault(planStr, "profitTargetPct");
      const dailyLossLimitPct = row.daily_loss_limit_pct !== null && row.daily_loss_limit_pct !== undefined
        ? Number(row.daily_loss_limit_pct)
        : getPlanRuleDefault(planStr, "dailyLossLimitPct");
      const maxDrawdownPct = row.max_drawdown_pct !== null && row.max_drawdown_pct !== undefined
        ? Number(row.max_drawdown_pct)
        : getPlanRuleDefault(planStr, "maxDrawdownPct");

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
        profitTarget: Math.round(initialBalance * profitTargetPct / 100),
        maxDrawdown: Math.round(initialBalance * maxDrawdownPct / 100),
        dailyLossLimit: Math.round(initialBalance * dailyLossLimitPct / 100),
        dailyDrawdown: 0,
        profitSplit: 80,
        tradingDays: tradingDaysCount,  // NEW: Real trading days from analytics
        winRate: Math.round(winRate * 10) / 10,  // NEW: Real win rate from analytics
        totalTrades,  // NEW: Real trade count from analytics
        scalingLevel: 1,
        isFunded: phase === "funded",
        fundedAt: null,
        feePaid: order?.amount ?? 0,
        couponUsed: null,
        createdAt: row.created_at || order?.createdAt || null,
        updatedAt: row.updated_at || order?.updatedAt || null,
        expiresAt: row.expires_at || null,
        orderId: linkedOrderId,
        provisioningStatus: "completed",
        canLaunch,
        // Credentials stored in order metadata at provisioning time
        loginEmail,
        terminalPassword,
        activationToken,
        // Legacy field
        tempPassword: terminalPassword,
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
          startBalance: order.accountSize ?? 0,
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
          feePaid: order.amount ?? 0,
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
          currentBalance: order.accountSize ?? 0,
          startBalance: order.accountSize ?? 0,
          profitLoss: 0,
          profitTarget: Math.round((order.accountSize ?? 0) * 0.10),
          maxDrawdown: Math.round((order.accountSize ?? 0) * 0.06),
          dailyLossLimit: Math.round((order.accountSize ?? 0) * 0.03),
          dailyDrawdown: 0,
          profitSplit: 80,
          tradingDays: 0,
          scalingLevel: 1,
          isFunded: false,
          fundedAt: null,
          feePaid: order.amount ?? 0,
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

    const initialBalance = challenge ? Number(challenge.initial_balance) : (prov.account_size ?? 0);
    const currentBalance = challenge ? Number(challenge.current_balance) : initialBalance;
    const challengeStatus = challenge?.status || prov.status;

    // Derive phase from the purchased plan (challenge.plan) — never from type alone
    const acctPlan = String(challenge?.plan || prov.plan_type || prov.plan || "").toLowerCase();
    let acctPhase: string;
    if (acctPlan === "flash") {
      acctPhase = "flash_funding";
    } else if (acctPlan === "instant") {
      acctPhase = "funded";
    } else if (acctPlan === "1step") {
      acctPhase = "challenge";
    } else if (acctPlan === "2step") {
      acctPhase = challenge?.type?.includes("phase2") ? "phase_2" : "phase_1";
    } else {
      // Fallback for legacy/manual accounts
      acctPhase = challenge?.type?.includes("phase2") ? "phase_2"
        : challenge?.type?.includes("funded") ? "funded"
        : "phase_1";
    }

    return res.json({
      success: true,
      account: {
        id: prov.trading_account_id || prov.challenge_account_id || accountId,
        accountCode: trading?.account_code || null,
        planType: challenge?.plan || prov.plan_type || prov.plan,
        phase: acctPhase,
        status: challengeStatus,
        currentBalance,
        startBalance: initialBalance,
        profitLoss: currentBalance - initialBalance,
        profitTarget: challenge ? Math.round(initialBalance * Number(challenge.profit_target_pct) / 100) : 0,
        maxDrawdown: challenge ? Math.round(initialBalance * Number(challenge.max_drawdown_pct) / 100) : 0,
        dailyLossLimit: challenge ? Math.round(initialBalance * Number(challenge.daily_loss_limit_pct) / 100) : 0,
        dailyDrawdown: 0,
        profitSplit: 80,
        tradingDays: challenge?.min_trading_days != null ? challenge.min_trading_days : 0,
        scalingLevel: 1,
        isFunded: acctPlan === "flash" || acctPlan === "instant" || challenge?.type?.includes("funded") || false,
        fundedAt: null,
        feePaid: prov.amount != null ? prov.amount : 0,
        couponUsed: null,
        createdAt: challenge?.created_at || prov.created_at,
        updatedAt: challenge?.updated_at || prov.created_at,
        expiresAt: challenge?.expires_at || null,
        canLaunch: ["active", "funded", "passed"].includes(challengeStatus) && trading?.status === "active",
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

    const initialBalance = challenge ? Number(challenge.initial_balance) : (order.accountSize ?? 0);
    const currentBalance = challenge ? Number(challenge.current_balance) : initialBalance;

    // Derive phase from the purchased plan — never from challenge type alone
    const orderPlan = String(challenge?.plan || order.planType || "").toLowerCase();
    let orderPhase: string;
    if (orderPlan === "flash") {
      orderPhase = "flash_funding";
    } else if (orderPlan === "instant") {
      orderPhase = "funded";
    } else if (orderPlan === "1step") {
      orderPhase = "challenge";
    } else if (orderPlan === "2step") {
      orderPhase = challenge?.type?.includes("phase2") ? "phase_2" : "phase_1";
    } else {
      orderPhase = challenge?.type?.includes("phase2") ? "phase_2"
        : challenge?.type?.includes("funded") ? "funded"
        : "phase_1";
    }

    return res.json({
      success: true,
      account: {
        id: prov.trading_account_id || prov.challenge_account_id,
        accountCode: trading?.account_code || orderMeta.accountCode || "N/A",
        planType: challenge?.plan || order.planType,
        phase: orderPhase,
        status: challenge?.status || "active",
        currentBalance,
        startBalance: initialBalance,
        profitLoss: currentBalance - initialBalance,
        profitTarget: challenge ? Math.round(initialBalance * Number(challenge.profit_target_pct) / 100) : 0,
        maxDrawdown: challenge ? Math.round(initialBalance * Number(challenge.max_drawdown_pct) / 100) : 0,
        dailyLossLimit: challenge ? Math.round(initialBalance * Number(challenge.daily_loss_limit_pct) / 100) : 0,
        isFunded: orderPlan === "flash" || orderPlan === "instant" || challenge?.type?.includes("funded") || false,
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

/**
 * GET /api/accounts/:accountId/trades
 * Returns trade history for a specific account from trade_logs table.
 * Used by dashboard analytics to show real P&L data.
 */
router.get("/:accountId/trades", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { accountId } = req.params;

    // Verify ownership via trader chain
    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const ownerCheck = await db.execute(sql`
      SELECT ta.id
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      WHERE (ta.id = ${accountId}::uuid OR ta.challenge_id = ${accountId}::uuid)
        AND tt.external_id = ${String(user.id)}
      LIMIT 1
    `);
    if (!ownerCheck.rows || ownerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    const tradingAccountId = (ownerCheck.rows[0] as any).id;

    // Fetch from trade_logs — gracefully return empty if table doesn't exist
    const tradesResult = await db.execute(sql`
      SELECT
        trade_id,
        symbol,
        side,
        entry_price,
        exit_price,
        quantity,
        pnl,
        commission,
        entered_at,
        exited_at,
        created_at
      FROM trade_logs
      WHERE trading_account_id = ${tradingAccountId}::uuid
      ORDER BY exited_at DESC NULLS LAST
      LIMIT 200
    `).catch(() => ({ rows: [] }));

    return res.json({ success: true, trades: tradesResult.rows });
  } catch (err: any) {
    return res.json({ success: true, trades: [] });
  }
});

/**
 * GET /api/accounts/:accountId/analytics
 * Per-account analytics computed from trade_logs — single source of truth.
 * Returns: equity curve, daily/weekly/monthly PnL, win rate, profit factor,
 *          max drawdown, consistency score, avg win/loss.
 */
router.get("/:accountId/analytics", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const { accountId } = req.params;

    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const ownerCheck = await db.execute(sql`
      SELECT ta.id, ca.initial_balance, ca.current_balance, ca.peak_balance,
             ca.max_drawdown_pct, ca.profit_target_pct
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE (ta.id = ${accountId}::uuid OR ta.challenge_id = ${accountId}::uuid)
        AND tt.external_id = ${String(user.id)}
      LIMIT 1
    `);
    if (!ownerCheck.rows || ownerCheck.rows.length === 0)
      return res.status(404).json({ success: false, message: "Account not found" });

    const acct = ownerCheck.rows[0] as any;
    const tradingAccountId = acct.id;
    const initialBalance = Number(acct.initial_balance) || 0;

    const tradesRes = await db.execute(sql`
      SELECT pnl, exited_at, symbol, side
      FROM trade_logs
      WHERE trading_account_id = ${tradingAccountId}::uuid AND exited_at IS NOT NULL
      ORDER BY exited_at ASC
    `).catch(() => ({ rows: [] }));

    const trades = (tradesRes.rows as any[]).map(t => ({
      pnl: Number(t.pnl) || 0,
      exitedAt: String(t.exited_at),
      symbol: String(t.symbol || ""),
    }));

    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const netPnl = grossProfit - grossLoss;
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    // Max drawdown from running equity
    let runningEq = initialBalance, peak = initialBalance, maxDD = 0;
    for (const t of trades) {
      runningEq += t.pnl;
      peak = Math.max(peak, runningEq);
      maxDD = Math.max(maxDD, peak - runningEq);
    }
    const maxDDPct = initialBalance > 0 ? (maxDD / initialBalance) * 100 : 0;

    // Daily PnL
    const pnlByDay: Record<string, number> = {};
    for (const t of trades) {
      const d = t.exitedAt.slice(0, 10);
      pnlByDay[d] = (pnlByDay[d] || 0) + t.pnl;
    }
    const dailyVals = Object.values(pnlByDay);
    const meanDay = dailyVals.length ? dailyVals.reduce((s, v) => s + v, 0) / dailyVals.length : 0;
    const variance = dailyVals.length > 1
      ? dailyVals.reduce((s, v) => s + Math.pow(v - meanDay, 2), 0) / (dailyVals.length - 1) : 0;
    const consistencyScore = Math.min(100, Math.max(0,
      100 - (Math.sqrt(variance) > 0 && Math.abs(meanDay) > 0
        ? (Math.sqrt(variance) / Math.abs(meanDay)) * 20 : 0)
    ));

    // Equity curve
    let eqBal = initialBalance;
    const sortedDays = Object.keys(pnlByDay).sort();
    const equityCurve = sortedDays.map(date => {
      eqBal += pnlByDay[date];
      return { date, equity: Math.round(eqBal * 100) / 100, pnl: Math.round(pnlByDay[date] * 100) / 100 };
    });

    // Weekly PnL
    const pnlByWeek: Record<string, number> = {};
    for (const t of trades) {
      const d = new Date(t.exitedAt);
      const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
      const key = ws.toISOString().slice(0, 10);
      pnlByWeek[key] = (pnlByWeek[key] || 0) + t.pnl;
    }
    const weeklyPnl = Object.entries(pnlByWeek).sort(([a], [b]) => a.localeCompare(b))
      .map(([week, pnl]) => ({ week, pnl: Math.round(pnl * 100) / 100 }));

    // Monthly PnL
    const pnlByMonth: Record<string, number> = {};
    for (const t of trades) {
      const key = t.exitedAt.slice(0, 7);
      pnlByMonth[key] = (pnlByMonth[key] || 0) + t.pnl;
    }
    const monthlyPnl = Object.entries(pnlByMonth).sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnl]) => ({ month, pnl: Math.round(pnl * 100) / 100 }));

    return res.json({
      success: true,
      accountId: tradingAccountId,
      initialBalance,
      currentBalance: Number(acct.current_balance) || initialBalance,
      peakBalance: Number(acct.peak_balance) || Math.max(initialBalance, initialBalance + netPnl),
      netPnl: Math.round(netPnl * 100) / 100,
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      maxDrawdown: Math.round(maxDD * 100) / 100,
      maxDrawdownPct: Math.round(maxDDPct * 100) / 100,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      tradingDays: sortedDays.length,
      equityCurve,
      dailyPnl: sortedDays.map(date => ({ date, pnl: Math.round(pnlByDay[date] * 100) / 100 })),
      weeklyPnl,
      monthlyPnl,
    });
  } catch (err: any) {
    console.error("[Accounts] /analytics error:", err.message);
    return res.json({ success: true, equityCurve: [], dailyPnl: [], weeklyPnl: [], monthlyPnl: [] });
  }
});

export default router;
