import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createHmac } from "crypto";

const router = Router();

const TERMINAL_API_URL = (process.env.TERMINAL_API_URL || "").replace(/\/$/, "");
const SSO_API_KEY = process.env.SSO_API_KEY || "";

/**
 * Returns the shared SSO secret that the terminal uses for jwt.verify().
 * Read at request time — never cached at module load — so Railway env var
 * changes take effect without a full redeploy.
 */
function getSSOSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.SSO_SECRET ||
    process.env.SSO_SHARED_SECRET ||
    SSO_API_KEY ||
    "fw-dev-secret"
  );
}

/**
 * Generate a standard HS256 JWT matching what terminal's auth.service.js
 * produces via: jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_EXPIRY })
 *
 * Claims match what terminal's verifySessionJWT extracts:
 *   userId      = decoded.sub
 *   accountId   = decoded.accountId
 *   challengeId = decoded.challengeId
 *   accountCode = decoded.accountCode
 */
function generateSSOToken(opts: {
  tradingAccountId: string;
  traderId: string;
  challengeAccountId: string | null;
  email: string;
  accountCode: string;
}): string {
  const secret = getSSOSecret();
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = 15 * 60; // 15 minutes

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: opts.traderId,
    accountId: opts.tradingAccountId,
    challengeId: opts.challengeAccountId,
    accountCode: opts.accountCode,
    brokerProvider: null,
    permissions: [],
    email: opts.email,
    iat: now,
    exp: now + expiresInSeconds,
  })).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * POST /api/terminal/launch
 *
 * Universal terminal launch endpoint for ALL challenge types.
 * Challenge-type differences (flash / instant / 1step / 2step) do not affect
 * this flow — only the rules inside challenge_accounts differ.
 *
 * Flow:
 *   1. Verify Supabase JWT
 *   2. Resolve user (with email-based auto-link for new sessions)
 *   3. Verify account ownership via trader chain
 *   4. Check account is active
 *   5. Fetch credentials from order metadata
 *   6. Generate HS256 JWT signed with JWT_SECRET (same secret terminal uses)
 *   7. Return launchUrl → browser opens terminal.fundedwealth.com → auto-login
 */
async function handleTerminalLaunch(req: Request, res: Response) {
  try {
    // ── 1. AUTH ──────────────────────────────────────────────────────────────
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // ── 2. VALIDATE REQUEST ──────────────────────────────────────────────────
    const { accountId } = req.body;
    if (!accountId || typeof accountId !== "string") {
      return res.status(400).json({ success: false, message: "accountId is required" });
    }
    if (accountId.startsWith("pending-") || accountId.startsWith("failed-")) {
      return res.status(400).json({ success: false, message: "Account is not ready for terminal launch." });
    }

    // ── 3. RESOLVE USER (with email fallback for new browser sessions) ────────
    let [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1);

    if (!user && auth.email) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, auth.email)).limit(1);
      if (byEmail) {
        [user] = await db
          .update(users)
          .set({ clerkId: auth.userId, updatedAt: new Date() })
          .where(eq(users.id, byEmail.id))
          .returning();
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ── 4. VERIFY OWNERSHIP VIA TRADER CHAIN ─────────────────────────────────
    // Works identically for Flash, Instant, 1-Step, 2-Step, and Funded accounts.
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
      console.error("[Terminal Launch] DB query failed:", dbErr.message);
      return res.status(500).json({ success: false, message: "Failed to verify account ownership." });
    }

    if (!ownershipResult.rows?.length) {
      return res.status(404).json({ success: false, message: "Account not found or does not belong to this user." });
    }

    const prov = ownershipResult.rows[0] as any;

    // ── 5. CHECK ACCOUNT IS ACTIVE ────────────────────────────────────────────
    if (prov.challenge_status && prov.challenge_status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Account is not active. Current status: ${prov.challenge_status}`,
      });
    }

    // ── 6. FETCH CREDENTIALS FROM ORDER METADATA ─────────────────────────────
    let storedLoginEmail: string = user.email;
    let storedTerminalPassword: string | null = null;
    let storedAccountCode: string = prov.account_code || "";

    try {
      const orderResult = await db.execute(sql`
        SELECT o.metadata
        FROM orders o
        JOIN provisioning_logs pl ON pl.order_id::text = o.id::text
        WHERE pl.trading_account_id = ${prov.trading_account_id}::uuid
        ORDER BY o.created_at DESC
        LIMIT 1
      `);
      if (orderResult.rows?.length) {
        const meta = (() => {
          try { return JSON.parse((orderResult.rows[0] as any).metadata || "{}"); } catch { return {}; }
        })();
        storedLoginEmail = meta.loginEmail || user.email;
        storedTerminalPassword = meta.terminalPassword || meta.tempPassword || null;
        storedAccountCode = meta.accountCode || prov.account_code || "";
      }
    } catch { /* non-fatal — use defaults */ }

    // ── 7. GENERATE SSO JWT ───────────────────────────────────────────────────
    // Secret is read at request time so Railway env var changes apply immediately
    // without requiring a full redeploy or process restart.
    const ssoToken = generateSSOToken({
      tradingAccountId: prov.trading_account_id,
      traderId: prov.trader_id,
      challengeAccountId: prov.challenge_account_id || null,
      email: storedLoginEmail,
      accountCode: storedAccountCode,
    });

    const terminalBase = TERMINAL_API_URL || "https://terminal.fundedwealth.com";
    const launchUrl = `${terminalBase}/auth/sso?token=${encodeURIComponent(ssoToken)}`;

    return res.json({
      success: true,
      launchUrl,
      // Credentials returned so dashboard can display them without a second API call
      credentials: {
        accountId: prov.trading_account_id,
        email: storedLoginEmail,
        password: storedTerminalPassword,
        accountCode: storedAccountCode,
        server: terminalBase,
        status: prov.challenge_status || "active",
      },
    });

  } catch (error: any) {
    console.error("[Terminal Launch] Unhandled error:", error.message || error);
    return res.status(500).json({ success: false, message: "Failed to generate terminal session. Please try again." });
  }
}

router.post("/launch", handleTerminalLaunch);
router.post("/terminal-launch", handleTerminalLaunch); // keep alias for compatibility

export default router;
