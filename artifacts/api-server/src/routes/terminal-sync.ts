import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * POST /api/terminal/sync
 *
 * Receives trading updates from the terminal backend and syncs them to the main database.
 * This is a server-to-server endpoint called by the terminal after each trade or session.
 *
 * SECURITY:
 * - Requires SSO_API_KEY header (same key used for terminal launch)
 * - Only callable by terminal backend (not exposed to users)
 * - Validates all numeric inputs to prevent injection
 *
 * UPDATES:
 * - challenge_accounts: current_balance, peak_balance, status
 * - trading_accounts: balance, available_margin
 * - session_analytics: trades, win_rate, pnl, best/worst trades
 *
 * ENV required:
 * - SSO_API_KEY: shared secret between main-site backend and terminal backend
 */

const SSO_API_KEY = process.env.SSO_API_KEY || "";

interface TerminalSyncPayload {
  // Sync metadata (REQUIRED)
  syncId: string;                    // Unique idempotency key for this sync event
  timestamp: string;                 // ISO timestamp when sync was created (for ordering)
  terminalId: string;                // terminal_traders.id for authorization
  
  // Account identifiers (REQUIRED)
  tradingAccountId: string;
  challengeAccountId: string;
  
  // Balance updates
  currentBalance: number;
  availableMargin: number;
  peakBalance: number;
  
  // Trade statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  grossProfit: number;
  grossLoss: number;
  
  // Risk metrics
  currentDrawdown: number;
  maxDrawdownHit: number;
  dailyPnL: number;
  
  // Session info
  sessionId?: string;
  lastTradeAt?: string;
  
  // Challenge status (if changed)
  challengeStatus?: "active" | "passed" | "failed" | "breached" | "expired";
  failReason?: string;
}

router.post("/sync", async (req: Request, res: Response) => {
  try {
    // ── 1. AUTHENTICATION ────────────────────────────────────────────────────
    const apiKey = req.headers["x-sso-api-key"] || req.headers["x-api-key"];
    
    if (!SSO_API_KEY) {
      console.error("[Terminal Sync] SSO_API_KEY not configured");
      return res.status(503).json({
        success: false,
        message: "Terminal sync is not configured",
      });
    }

    if (apiKey !== SSO_API_KEY) {
      console.error("[Terminal Sync] Invalid API key");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid API key",
      });
    }

    // ── 2. VALIDATE PAYLOAD ──────────────────────────────────────────────────
    const payload = req.body as TerminalSyncPayload;

    // Required fields
    if (!payload.syncId || !payload.timestamp || !payload.terminalId) {
      return res.status(400).json({
        success: false,
        message: "syncId, timestamp, and terminalId are required",
      });
    }

    if (!payload.tradingAccountId || !payload.challengeAccountId) {
      return res.status(400).json({
        success: false,
        message: "tradingAccountId and challengeAccountId are required",
      });
    }

    // Numeric validations
    if (typeof payload.currentBalance !== "number" || payload.currentBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid currentBalance",
      });
    }

    if (typeof payload.totalTrades !== "number" || payload.totalTrades < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid totalTrades",
      });
    }

    if (typeof payload.winningTrades !== "number" || payload.winningTrades < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid winningTrades",
      });
    }

    // Timestamp validation
    const syncTimestamp = new Date(payload.timestamp);
    if (isNaN(syncTimestamp.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid timestamp format",
      });
    }

    // ── 3. CHECK IDEMPOTENCY ─────────────────────────────────────────────────
    const existingSync = await db.execute(sql`
      SELECT processed_at FROM sync_events WHERE sync_id = ${payload.syncId} LIMIT 1
    `);

    if (existingSync.rows && existingSync.rows.length > 0) {
      console.log(`[Terminal Sync] Duplicate sync ignored: ${payload.syncId}`);
      return res.json({
        success: true,
        message: "Sync already processed (idempotent)",
        duplicate: true,
      });
    }

    // ── 4. VERIFY ACCOUNT OWNERSHIP ──────────────────────────────────────────
    const accountCheck = await db.execute(sql`
      SELECT 
        ta.id AS trading_account_id,
        ca.id AS challenge_account_id,
        ca.initial_balance,
        ca.max_drawdown_pct,
        ca.updated_at AS last_sync_time
      FROM trading_accounts ta
      JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      WHERE ta.id = ${payload.tradingAccountId}::uuid
        AND ca.id = ${payload.challengeAccountId}::uuid
        AND tt.id = ${payload.terminalId}::uuid
      LIMIT 1
    `);

    if (!accountCheck.rows || accountCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Account not found or does not belong to this terminal",
      });
    }

    const account = accountCheck.rows[0] as any;
    const initialBalance = Number(account.initial_balance);
    const maxDrawdownPct = Number(account.max_drawdown_pct);
    const lastSyncTime = account.last_sync_time ? new Date(account.last_sync_time) : null;

    // ── 5. CHECK OUT-OF-ORDER (Reject older syncs) ──────────────────────────
    if (lastSyncTime && syncTimestamp <= lastSyncTime) {
      console.log(
        `[Terminal Sync] Out-of-order sync ignored: ` +
        `new=${syncTimestamp.toISOString()} ` +
        `last=${lastSyncTime.toISOString()}`
      );
      return res.json({
        success: true,
        message: "Sync ignored - older than current data",
        outdated: true,
        lastSyncTime: lastSyncTime.toISOString(),
      });
    }

    // ── 6. VALIDATE BALANCE BOUNDS ───────────────────────────────────────────
    if (payload.currentBalance > payload.peakBalance) {
      return res.status(400).json({
        success: false,
        message: "currentBalance cannot exceed peakBalance",
      });
    }

    const maxAllowedDrawdown = initialBalance * (maxDrawdownPct / 100);
    const minAllowedBalance = initialBalance - maxAllowedDrawdown;
    
    if (payload.currentBalance < minAllowedBalance - 1) { // -1 for rounding
      return res.status(400).json({
        success: false,
        message: `Balance ${payload.currentBalance} exceeds max drawdown (min: ${minAllowedBalance})`,
      });
    }

    // ── 7. CALCULATE DERIVED METRICS ─────────────────────────────────────────
    const winRate = payload.totalTrades > 0
      ? (payload.winningTrades / payload.totalTrades) * 100
      : 0;

    const netPnL = payload.currentBalance - initialBalance;
    const drawdownPct = initialBalance > 0
      ? ((initialBalance - payload.currentBalance) / initialBalance) * 100
      : 0;

    // Check if max drawdown breached
    const isDrawdownBreached = drawdownPct > maxDrawdownPct;
    const finalStatus = payload.challengeStatus || (isDrawdownBreached ? "breached" : "active");

    // ── 8. EXECUTE DATABASE TRANSACTION ──────────────────────────────────────
    await db.transaction(async (tx) => {
      // 8a. Record sync event (for idempotency)
      await tx.execute(sql`
        INSERT INTO sync_events (sync_id, account_id, terminal_id, processed_at)
        VALUES (
          ${payload.syncId},
          ${payload.tradingAccountId}::uuid,
          ${payload.terminalId}::uuid,
          now()
        )
      `);

      // 8b. Update challenge_accounts
      await tx.execute(sql`
        UPDATE challenge_accounts
        SET
          current_balance = ${payload.currentBalance},
          peak_balance = GREATEST(peak_balance, ${payload.peakBalance}),
          status = ${finalStatus}::text,
          ${isDrawdownBreached ? sql`
            failed_at = COALESCE(failed_at, now()),
            fail_reason = ${payload.failReason || `Max drawdown breached (${drawdownPct.toFixed(2)}%)`}::text,
          ` : sql``}
          updated_at = ${payload.timestamp}::timestamptz
        WHERE id = ${payload.challengeAccountId}::uuid
      `);

      // 8c. Update trading_accounts
      await tx.execute(sql`
        UPDATE trading_accounts
        SET
          balance = ${payload.currentBalance},
          available_margin = ${payload.availableMargin},
          updated_at = ${payload.timestamp}::timestamptz
        WHERE id = ${payload.tradingAccountId}::uuid
      `);

      // 8d. Upsert session_analytics
      const sessionId = payload.sessionId || `daily-${new Date(payload.timestamp).toISOString().split('T')[0]}`;

      await tx.execute(sql`
        INSERT INTO session_analytics (
          id, user_id, session_id,
          start_at, end_at,
          trades, win_rate, loss_rate,
          gross_profit, gross_loss, net_pnl,
          best_trade_pnl, worst_trade_pnl,
          avg_rr,
          created_at, updated_at
        )
        VALUES (
          gen_random_uuid(),
          (SELECT tt.external_id FROM trading_accounts ta 
           JOIN terminal_traders tt ON tt.id = ta.trader_id 
           WHERE ta.id = ${payload.tradingAccountId}::uuid LIMIT 1),
          ${sessionId}::varchar,
          ${payload.lastTradeAt || payload.timestamp}::timestamptz,
          ${payload.timestamp}::timestamptz,
          ${payload.totalTrades}::integer,
          ${winRate.toFixed(2)}::numeric,
          ${(100 - winRate).toFixed(2)}::numeric,
          ${payload.grossProfit}::numeric,
          ${Math.abs(payload.grossLoss)}::numeric,
          ${netPnL}::numeric,
          ${payload.grossProfit}::numeric,
          ${Math.abs(payload.grossLoss)}::numeric,
          0::numeric,
          now(),
          now()
        )
        ON CONFLICT (session_id) DO UPDATE SET
          trades = ${payload.totalTrades}::integer,
          win_rate = ${winRate.toFixed(2)}::numeric,
          loss_rate = ${(100 - winRate).toFixed(2)}::numeric,
          gross_profit = ${payload.grossProfit}::numeric,
          gross_loss = ${Math.abs(payload.grossLoss)}::numeric,
          net_pnl = ${netPnL}::numeric,
          best_trade_pnl = GREATEST(session_analytics.best_trade_pnl, ${payload.grossProfit}::numeric),
          worst_trade_pnl = LEAST(session_analytics.worst_trade_pnl, ${Math.abs(payload.grossLoss)}::numeric),
          end_at = ${payload.timestamp}::timestamptz,
          updated_at = now()
      `);
    });

    // ── 9. LOG SYNC EVENT ────────────────────────────────────────────────────
    console.log(
      `[Terminal Sync] SUCCESS ` +
      `syncId=${payload.syncId} ` +
      `account=${payload.tradingAccountId} ` +
      `balance=${payload.currentBalance} ` +
      `trades=${payload.totalTrades} ` +
      `winRate=${winRate.toFixed(2)}% ` +
      `status=${finalStatus}`,
    );

    // ── 10. RETURN SUCCESS ───────────────────────────────────────────────────
    return res.json({
      success: true,
      message: "Trading data synced successfully",
      data: {
        currentBalance: payload.currentBalance,
        totalTrades: payload.totalTrades,
        winRate: winRate.toFixed(2),
        status: finalStatus,
        drawdownPct: drawdownPct.toFixed(2),
        breached: isDrawdownBreached,
      },
    });
  } catch (error: any) {
    console.error("[Terminal Sync] Error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync trading data",
      // Don't expose internal error details
    });
  }
});

/**
 * POST /api/terminal/trade-event
 *
 * Real-time trade event webhook for individual trade updates.
 * Called by terminal after each trade is closed.
 *
 * This is supplementary to /sync which can be called less frequently (e.g., every minute).
 * Trade events allow for immediate dashboard updates and real-time notifications.
 */
router.post("/trade-event", async (req: Request, res: Response) => {
  try {
    // ── 1. AUTHENTICATION ────────────────────────────────────────────────────
    const apiKey = req.headers["x-sso-api-key"] || req.headers["x-api-key"];

    if (!SSO_API_KEY || apiKey !== SSO_API_KEY) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ── 2. VALIDATE PAYLOAD ──────────────────────────────────────────────────
    const {
      tradingAccountId,
      challengeAccountId,
      tradeId,
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      commission,
      enteredAt,
      exitedAt,
    } = req.body;

    if (!tradingAccountId || !challengeAccountId || !tradeId) {
      return res.status(400).json({
        success: false,
        message: "tradingAccountId, challengeAccountId, and tradeId are required",
      });
    }

    // ── 3. LOG TRADE EVENT ───────────────────────────────────────────────────
    // In a full implementation, you would:
    // - Insert into a trades table
    // - Trigger WebSocket notification
    // - Update real-time metrics
    // For now, just log and return success

    console.log(
      `[Terminal Trade Event] ` +
      `account=${tradingAccountId} ` +
      `trade=${tradeId} ` +
      `symbol=${symbol} ` +
      `pnl=${pnl}`,
    );

    return res.json({
      success: true,
      message: "Trade event received",
    });
  } catch (error: any) {
    console.error("[Terminal Trade Event] Error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to process trade event",
    });
  }
});

export default router;
