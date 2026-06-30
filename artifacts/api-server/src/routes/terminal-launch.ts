import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

/**
 * POST /api/terminal/launch
 *
 * Main-site backend route that securely generates a terminal SSO launch URL.
 * This is the bridge between the main site dashboard and terminal.fundedwealth.com.
 *
 * OWNERSHIP VERIFICATION CHAIN:
 *   authenticated user → public.users → public.orders (user_id match)
 *   → provisioning_logs (order_id) → terminal trading_account_id
 *
 * The frontend sends an accountId which is the terminal-owned trading_account_id
 * (or challenge_account_id) returned by GET /api/accounts/my for completed provisionings.
 *
 * Security:
 * - SSO_API_KEY is never exposed to the browser
 * - Account ownership verified through full provisioning chain, not direct table FK
 * - Terminal generate is server-to-server only
 * - Launch blocked for pending/failed provisioning or non-active accounts
 *
 * ENV required:
 * - TERMINAL_API_URL: e.g. "https://terminal.fundedwealth.com"
 * - SSO_API_KEY: shared secret between main-site backend and terminal backend
 */

const TERMINAL_API_URL = process.env.TERMINAL_API_URL || "https://terminal.fundedwealth.com";
const SSO_API_KEY = process.env.SSO_API_KEY || "";

router.post("/launch", async (req: Request, res: Response) => {
  try {
    // ── 1. AUTH ──────────────────────────────────────────────────────────────
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // ── 2. VALIDATE REQUEST ─────────────────────────────────────────────────
    const { accountId } = req.body;
    if (!accountId || typeof accountId !== "string") {
      return res.status(400).json({ success: false, message: "accountId is required" });
    }

    // Reject obviously fake IDs (pending-* or failed-* from dashboard)
    if (accountId.startsWith("pending-") || accountId.startsWith("failed-") || accountId.startsWith("completed-")) {
      return res.status(400).json({
        success: false,
        message: "This account is not ready for terminal launch.",
      });
    }

    // ── 3. RESOLVE USER ─────────────────────────────────────────────────────
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ── 4. VERIFY OWNERSHIP VIA TRADER CHAIN ────────────────────────────────
    // Authoritative ownership: trading_accounts.trader_id → terminal_traders.external_id = users.id.
    // This is identical for website checkout AND manual/emergency provisioning, and does
    // NOT depend on an order existing (manual provisions have no real order row).
    const ownershipResult = await db.execute(sql`
      SELECT
        tt.id  AS trader_id,
        ca.id  AS challenge_account_id,
        ta.id  AS trading_account_id,
        ca.status AS challenge_status
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE (ta.id = ${accountId}::uuid OR ca.id = ${accountId}::uuid)
        AND tt.external_id = ${String(user.id)}
      LIMIT 1
    `);

    if (!ownershipResult.rows || ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found or does not belong to this user.",
      });
    }

    const prov = ownershipResult.rows[0] as any;

    // ── 5. CHECK TERMINAL ACCOUNT STATE ─────────────────────────────────────
    // Fetch the challenge_accounts status to confirm it's launchable
    const accountStateResult = await db.execute(sql`
      SELECT 
        ca.status as challenge_status,
        ca.plan,
        ca.initial_balance,
        ta.account_code,
        ta.status as trading_status
      FROM challenge_accounts ca
      LEFT JOIN trading_accounts ta ON ta.id = ${prov.trading_account_id}::uuid
      WHERE ca.id = ${prov.challenge_account_id}::uuid
      LIMIT 1
    `);

    if (!accountStateResult.rows || accountStateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Terminal account records not found. Contact support.",
      });
    }

    const accountState = accountStateResult.rows[0] as any;

    // Only allow launch if challenge is active and trading account is active
    if (accountState.challenge_status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Account is not launchable. Challenge status: ${accountState.challenge_status}`,
      });
    }

    if (accountState.trading_status && accountState.trading_status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Trading account is not active. Status: ${accountState.trading_status}`,
      });
    }

    // ── 6. CHECK SSO CONFIG ─────────────────────────────────────────────────
    if (!SSO_API_KEY) {
      console.error("[Terminal Launch] SSO_API_KEY is not configured");
      return res.status(503).json({
        success: false,
        message: "Terminal launch is not configured. Please contact support.",
      });
    }

    // ── 7. CALL TERMINAL SSO GENERATE ───────────────────────────────────────
    // Build payload from terminal-owned identity, not main-site assumptions
    const terminalPayload = {
      fwUserId: String(user.id),
      traderId: prov.trader_id,                          // terminal_traders.id
      accountId: prov.trading_account_id,                // trading_accounts.id
      challengeId: prov.challenge_account_id,            // challenge_accounts.id
      accountCode: accountState.account_code || null,    // trading_accounts.account_code
      plan: accountState.plan,                           // challenge_accounts.plan
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader",
    };

    const terminalRes = await fetch(`${TERMINAL_API_URL}/auth/sso/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sso-api-key": SSO_API_KEY,
      },
      body: JSON.stringify(terminalPayload),
    });

    if (!terminalRes.ok) {
      const errBody = await terminalRes.text().catch(() => "");
      console.error(
        `[Terminal Launch] Terminal SSO generate failed: ${terminalRes.status} — ${errBody}`,
      );
      return res.status(502).json({
        success: false,
        message: "Failed to generate terminal session. Please try again.",
      });
    }

    const terminalData = (await terminalRes.json()) as { launchUrl?: string; url?: string; token?: string };

    // ── 8. RETURN LAUNCH URL ────────────────────────────────────────────────
    const launchUrl = terminalData.launchUrl || terminalData.url || null;
    const token = terminalData.token || null;

    if (!launchUrl && !token) {
      console.error("[Terminal Launch] Terminal response missing launchUrl/token:", terminalData);
      return res.status(502).json({
        success: false,
        message: "Terminal returned an invalid response. Please try again.",
      });
    }

    const finalLaunchUrl = launchUrl || `${TERMINAL_API_URL}/auth/sso?token=${encodeURIComponent(token!)}`;

    return res.json({
      success: true,
      launchUrl: finalLaunchUrl,
    });
  } catch (error: any) {
    console.error("[Terminal Launch] Error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to launch terminal. Please try again.",
    });
  }
});

export default router;
