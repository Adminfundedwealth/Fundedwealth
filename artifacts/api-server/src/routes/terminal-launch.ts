import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users, orders } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createHmac } from "crypto";

const router = Router();

const TERMINAL_API_URL = (process.env.TERMINAL_API_URL || "").replace(/\/$/, "");
const SSO_API_KEY = process.env.SSO_API_KEY || "";

export async function handleTerminalLaunch(req: Request, res: Response) {
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

    if (accountId.startsWith("pending-") || accountId.startsWith("failed-")) {
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
    let ownershipResult;
    try {
      ownershipResult = await db.execute(sql`
        SELECT
          tt.id  AS trader_id,
          ca.id  AS challenge_account_id,
          ta.id  AS trading_account_id,
          ca.status AS challenge_status,
          ca.plan AS plan,
          ca.initial_balance AS initial_balance,
          ta.account_code AS account_code,
          ta.status AS trading_status
        FROM trading_accounts ta
        JOIN terminal_traders tt ON tt.id = ta.trader_id
        LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
        WHERE (ta.id = ${accountId}::uuid OR ca.id = ${accountId}::uuid)
          AND tt.external_id = ${String(user.id)}
        LIMIT 1
      `);
    } catch (dbErr: any) {
      console.error("[Terminal Launch] DB ownership query failed:", dbErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to verify account ownership. Please try again.",
      });
    }

    if (!ownershipResult.rows || ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found or does not belong to this user.",
      });
    }

    const prov = ownershipResult.rows[0] as any;

    // ── 5. CHECK ACCOUNT STATE ───────────────────────────────────────────────
    if (prov.challenge_status && prov.challenge_status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Account is not active. Status: ${prov.challenge_status}`,
      });
    }

    // ── 6. FETCH CREDENTIALS FROM ORDER METADATA ────────────────────────────
    let storedActivationToken: string | null = null;
    let storedTerminalPassword: string | null = null;
    let storedLoginEmail: string = user.email;
    let storedAccountCode: string = prov.account_code || "";

    try {
      const orderResult = await db.execute(sql`
        SELECT o.metadata, o.id
        FROM orders o
        JOIN provisioning_logs pl ON pl.order_id::text = o.id::text
        WHERE pl.trading_account_id = ${prov.trading_account_id}::uuid
        ORDER BY o.created_at DESC
        LIMIT 1
      `);
      if (orderResult.rows && orderResult.rows.length > 0) {
        const ord = orderResult.rows[0] as any;
        if (ord.metadata) {
          try {
            const meta = JSON.parse(ord.metadata);
            storedActivationToken = meta.activationToken || null;
            storedTerminalPassword = meta.terminalPassword || meta.tempPassword || null;
            storedLoginEmail = meta.loginEmail || user.email;
            storedAccountCode = meta.accountCode || prov.account_code || "";
          } catch { /* ignore */ }
        }
      }
    } catch { /* non-fatal */ }

    // ── 7. CALL TERMINAL SSO IF CONFIGURED ──────────────────────────────────
    if (TERMINAL_API_URL && SSO_API_KEY) {
      try {
        const terminalPayload = {
          fwUserId: String(user.id),
          traderId: prov.trader_id,
          accountId: prov.trading_account_id,
          challengeId: prov.challenge_account_id,
          accountCode: storedAccountCode,
          plan: prov.plan,
          email: storedLoginEmail,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader",
          activationToken: storedActivationToken,
        };

        const terminalRes = await fetch(`${TERMINAL_API_URL}/auth/sso/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sso-api-key": SSO_API_KEY,
          },
          body: JSON.stringify(terminalPayload),
          signal: AbortSignal.timeout(8000),
        });

        if (terminalRes.ok) {
          const terminalData = await terminalRes.json() as { launchUrl?: string; url?: string; token?: string };
          const launchUrl = terminalData.launchUrl || terminalData.url ||
            (terminalData.token ? `${TERMINAL_API_URL}/auth/sso?token=${encodeURIComponent(terminalData.token)}` : null);

          if (launchUrl) {
            return res.json({ success: true, launchUrl });
          }
        }
        const errText = await terminalRes.text().catch(() => "");
        console.warn(`[Terminal Launch] Terminal SSO returned ${terminalRes.status}: ${errText} — falling back to local token`);
      } catch (fetchErr: any) {
        console.warn(`[Terminal Launch] Terminal SSO fetch failed: ${fetchErr.message} — falling back to local token`);
      }
    }

    // ── 8. LOCAL FALLBACK — generate token from stored activation token ──────
    const ssoToken = generateSSOToken(prov.trading_account_id, prov.trader_id, storedLoginEmail);
    const terminalBase = TERMINAL_API_URL || "";
    const launchUrl = terminalBase
      ? `${terminalBase}/auth/sso?token=${encodeURIComponent(ssoToken)}&account=${encodeURIComponent(storedAccountCode)}`
      : `/terminal?token=${encodeURIComponent(ssoToken)}&account=${encodeURIComponent(storedAccountCode)}`;

    return res.json({
      success: true,
      launchUrl,
      credentials: {
        email: storedLoginEmail,
        password: storedTerminalPassword,
        accountCode: storedAccountCode,
        activationToken: storedActivationToken,
      },
    });
  } catch (error: any) {
    console.error("[Terminal Launch] Unhandled error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate terminal session. Please try again.",
    });
  }
}

/**
 * Verify an activation token generated during provisioning.
 * Returns the parsed payload or null if invalid/expired.
 */
function verifyActivationToken(token: string): { accountId: string; email: string; expiresAt: number } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const secret = SSO_API_KEY || process.env.INTERNAL_PROVISION_SECRET || "fw-dev-secret";
    const expected = createHmac("sha256", secret).update(payloadB64).digest("hex");
    if (expected !== sig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate a fresh short-lived SSO token for terminal launch.
 * Used when TERMINAL_API_URL is configured but as a fallback.
 */
function generateSSOToken(tradingAccountId: string, traderId: string, email: string): string {
  const payload = JSON.stringify({
    accountId: tradingAccountId,
    traderId,
    email,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  const secret = SSO_API_KEY || process.env.INTERNAL_PROVISION_SECRET || "fw-dev-secret";
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${hmac}`;
}

/**
 * POST /api/terminal/launch
 *
 * Generates a terminal SSO launch URL.
 * Flow:
 *   1. Verify user owns the account via trader chain
 *   2. If TERMINAL_API_URL is configured → call terminal /auth/sso/generate
 *   3. If not → return local launch URL with embedded activation token
 */
router.post("/launch", handleTerminalLaunch);
router.post("/terminal-launch", handleTerminalLaunch);

export default router;
