import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createHash, createHmac, randomUUID } from "crypto";
import { resolveTerminalLaunchUser } from "../lib/terminalLaunchAuth.js";

const router = Router();

const PRODUCTION_TERMINAL_URL = "https://terminal.fundedwealth.com";
const SSO_API_KEY = process.env.SSO_API_KEY || "";
const SSO_TOKEN_ALGORITHM = "HS256";
let lastReturnedTerminalJwt: string | null = null;

function getTerminalSSOSecret(): { secret: string; source: string } {
  // Try every variable name that could hold the shared SSO secret.
  // The terminal's sso.service.js reads: SSO_SHARED_SECRET || SSO_API_KEY
  // We must sign with whichever value the terminal will verify against.
  const candidates: Array<[string | undefined, string]> = [
    [process.env.SSO_SHARED_SECRET, "SSO_SHARED_SECRET"],
    [process.env.SSO_API_KEY,       "SSO_API_KEY"],
    [process.env.SSO_SECRET,        "SSO_SECRET"],
    [process.env.JWT_SECRET,        "JWT_SECRET"],
  ];
  for (const [val, name] of candidates) {
    if (val && val.trim().length > 0) {
      return { secret: val.trim(), source: name };
    }
  }
  return { secret: "fw-dev-secret", source: "fallback" };
}

function signTerminalJWT(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: SSO_TOKEN_ALGORITHM, typ: "JWT" };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

function verifyTerminalJWT(token: string): { payload: any; reason?: string; secretSource?: string } | null {
  console.info("[Terminal Launch] received JWT for verification", { jwt: token });

  if (lastReturnedTerminalJwt && token !== lastReturnedTerminalJwt) {
    let firstDiffIndex = -1;
    for (let i = 0; i < Math.max(token.length, lastReturnedTerminalJwt.length); i += 1) {
      if (token[i] !== lastReturnedTerminalJwt[i]) {
        firstDiffIndex = i;
        break;
      }
    }
    console.error("[Terminal Launch] JWT byte mismatch", {
      returnedJwt: lastReturnedTerminalJwt,
      receivedJwt: token,
      firstDiffIndex,
      returnedChar: firstDiffIndex >= 0 ? lastReturnedTerminalJwt[firstDiffIndex] ?? null : null,
      receivedChar: firstDiffIndex >= 0 ? token[firstDiffIndex] ?? null : null,
    });
  } else if (lastReturnedTerminalJwt && token === lastReturnedTerminalJwt) {
    console.info("[Terminal Launch] JWT byte comparison", { identical: true });
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { payload: null, reason: "invalid_format" };
  }

  const [headerB64, payloadB64, signature] = parts;
  const { secret, source } = getTerminalSSOSecret();
  const signingInput = `${headerB64}.${payloadB64}`;
  const expected = createHmac("sha256", secret).update(signingInput).digest("base64url");

  if (expected !== signature) {
    const verificationSecretHash = createHash("sha256").update(secret).digest("hex");
    const signingSecretHash = lastReturnedTerminalJwt
      ? createHash("sha256").update(secret).digest("hex")
      : verificationSecretHash;
    console.error("[Terminal Launch] JWT verification mismatch", {
      receivedJwt: token,
      secretSource: source,
      signingSecretHash,
      verificationSecretHash,
    });
    return { payload: null, reason: "signature_mismatch", secretSource: source };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && now >= payload.exp) {
      return { payload: null, reason: "token_expired", secretSource: source };
    }
    return { payload, secretSource: source };
  } catch (error: any) {
    return { payload: null, reason: error?.message || "invalid_payload", secretSource: source };
  }
}

function resolveTerminalApiUrl(): string {
  const configured = (process.env.TERMINAL_API_URL || process.env.TERMINAL_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");

  if (!configured) {
    return PRODUCTION_TERMINAL_URL;
  }

  const normalized = configured.toLowerCase();
  if (
    normalized.includes("localhost") ||
    normalized.includes("127.0.0.1") ||
    normalized.includes("staging") ||
    normalized.includes("dev") ||
    normalized.includes("test")
  ) {
    console.warn(`[Terminal Launch] Ignoring non-production terminal URL: ${configured}`);
    return PRODUCTION_TERMINAL_URL;
  }

  return configured;
}

export function buildTerminalLaunchUrl(terminalBase: string, ssoToken: string, accountCode: string): string {
  const normalizedBase = terminalBase.replace(/\/$/, "");
  return `${normalizedBase}/auth/sso?token=${encodeURIComponent(ssoToken)}&account=${encodeURIComponent(accountCode)}`;
}

const TERMINAL_API_URL = resolveTerminalApiUrl();

/**
 * Returns the shared SSO secret that the terminal uses for jwt.verify().
 * Priority matches terminal's sso.service.js: SSO_SHARED_SECRET || SSO_API_KEY
 * Read at request time — never cached at module load — so Railway env var
 * changes take effect without a full redeploy.
 */
function getSSOSecret(): string {
  return getTerminalSSOSecret().secret;
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
export async function handleTerminalLaunch(req: Request, res: Response) {
  try {
    // ── 1. AUTH ──────────────────────────────────────────────────────────────
    const devAuthOverrideUserId = process.env.NODE_ENV !== "production"
      ? (req.headers["x-dev-user-id"] as string | undefined)
      : undefined;
    const devAuthOverrideEmail = process.env.NODE_ENV !== "production"
      ? (req.headers["x-dev-email"] as string | undefined)
      : undefined;
    const auth = getAuth(req) ?? (devAuthOverrideUserId ? {
      userId: devAuthOverrideUserId,
      email: devAuthOverrideEmail,
    } : null);
    console.info("[Terminal Launch] request start", {
      authUserId: auth?.userId ?? null,
      authSource: getAuth(req) ? "middleware" : (devAuthOverrideUserId ? "dev-override" : "none"),
      accountId: req.body?.accountId ?? null,
      hasAuthHeader: Boolean(req.headers.authorization),
      hasDevAuthHeader: Boolean(devAuthOverrideUserId),
      bodyKeys: req.body ? Object.keys(req.body) : [],
    });
    if (!auth?.userId) {
      console.warn("[Terminal Launch] auth missing");
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // ── 2. VALIDATE REQUEST ─────────────────────────────────────────────────
    const { accountId } = req.body;
    if (!accountId || typeof accountId !== "string") {
      console.warn("[Terminal Launch] invalid accountId", { accountId });
      return res.status(400).json({ success: false, message: "accountId is required" });
    }
    if (accountId.startsWith("pending-") || accountId.startsWith("failed-")) {
      console.warn("[Terminal Launch] account not ready", { accountId });
      return res.status(400).json({
        success: false,
        message: "This account is not ready for terminal launch.",
      });
    }

    console.info("[Terminal Launch] auth ok", { authUserId: auth.userId, accountId });

    // ── 3. RESOLVE USER ─────────────────────────────────────────────────────
    let user;
    try {
      user = await resolveTerminalLaunchUser({
        authUserId: auth.userId,
        authEmail: auth.email,
        lookupByClerkId: async (clerkId: string) => {
          const [row] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);
          return row ?? null;
        },
        lookupByEmail: async (email: string) => {
          const [row] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          return row ?? null;
        },
        linkUserToAuth: async (userRow: any) => {
          await db
            .update(users)
            .set({ clerkId: auth.userId, updatedAt: new Date() })
            .where(eq(users.id, userRow.id));
        },
      });
    } catch (lookupErr: any) {
      console.error("[Terminal Launch] user lookup failed", {
        message: lookupErr?.message || String(lookupErr),
        stack: lookupErr?.stack || null,
        cause: lookupErr?.cause || null,
        authUserId: auth.userId,
        authEmail: auth.email,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to resolve your user profile for terminal launch.",
      });
    }

    if (!user) {
      console.warn("[Terminal Launch] user not found", { authUserId: auth.userId, authEmail: auth.email });
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.info("[Terminal Launch] user resolved", { userId: user.id, email: user.email });

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
      console.error("[Terminal Launch] DB query failed:", dbErr.message);
      return res.status(500).json({ success: false, message: "Failed to verify account ownership." });
    }

    if (!ownershipResult.rows || ownershipResult.rows.length === 0) {
      console.warn("[Terminal Launch] ownership check failed", { authUserId: auth.userId, accountId });
      return res.status(404).json({
        success: false,
        message: "Account not found or does not belong to this user.",
      });
    }

    const prov = ownershipResult.rows[0] as any;
    console.info("[Terminal Launch] ownership ok", { traderId: prov.trader_id, tradingAccountId: prov.trading_account_id, challengeAccountId: prov.challenge_account_id });

    // ── 5. CHECK ACCOUNT IS ACTIVE ────────────────────────────────────────────
    if (prov.challenge_status && prov.challenge_status !== "active") {
      console.warn("[Terminal Launch] account not active", { challengeStatus: prov.challenge_status, accountId });
      return res.status(400).json({
        success: false,
        message: `Account is not active. Current status: ${prov.challenge_status}`,
      });
    }

    console.info("[Terminal Launch] account state ok", { challengeStatus: prov.challenge_status, tradingStatus: prov.trading_status });

    // ── 6. FETCH CREDENTIALS FROM ORDER METADATA ────────────────────────────
    let storedActivationToken: string | null = null;
    let storedTerminalPassword: string | null = null;
    let storedLoginEmail: string = user.email;
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

    console.info("[Terminal Launch] credentials resolved", {
      loginEmail: storedLoginEmail,
      hasActivationToken: Boolean(storedActivationToken),
      hasTerminalPassword: Boolean(storedTerminalPassword),
      accountCode: storedAccountCode,
    });

    // ── 7. CALL TERMINAL SSO IF CONFIGURED ──────────────────────────────────
    // Read at request time so Railway env var changes take effect without redeploy.
    // Use SSO_SHARED_SECRET || SSO_API_KEY to match the terminal's own auth gate.
    const runtimeSSOApiKey = process.env.SSO_API_KEY || SSO_API_KEY;
    if (TERMINAL_API_URL && runtimeSSOApiKey) {
      try {
        console.info("[Terminal Launch] calling terminal SSO", {
          terminalApiUrl: TERMINAL_API_URL,
          tradingAccountId: prov.trading_account_id,
          traderId: prov.trader_id,
          accountCode: storedAccountCode,
        });

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
            "x-sso-api-key": runtimeSSOApiKey,
          },
          body: JSON.stringify(terminalPayload),
          signal: AbortSignal.timeout(8000),
        });

        if (terminalRes.ok) {
          const terminalData = await terminalRes.json() as { launchUrl?: string; url?: string; token?: string };
          const launchUrl = terminalData.launchUrl || terminalData.url ||
            (terminalData.token ? `${TERMINAL_API_URL}/auth/sso?token=${encodeURIComponent(terminalData.token)}` : null);

          console.info("[Terminal Launch] terminal SSO success", {
            status: terminalRes.status,
            launchUrlPresent: Boolean(launchUrl),
          });

          if (launchUrl) {
            const launchToken = terminalData.token ?? (launchUrl ? new URL(launchUrl).searchParams.get("token") : null);
            lastReturnedTerminalJwt = launchToken ?? null;
            console.info("[Terminal Launch] returning launchUrl JWT", {
              jwt: launchToken,
              launchUrl,
            });
            return res.json({ success: true, launchUrl });
          }
        }
        const errText = await terminalRes.text().catch(() => "");
        console.warn(`[Terminal Launch] Terminal SSO returned ${terminalRes.status}: ${errText} — falling back to local token`);
      } catch (fetchErr: any) {
        console.warn(`[Terminal Launch] Terminal SSO fetch failed: ${fetchErr.message} — falling back to local token`);
      }
    }

    // ── 8. LOCAL FALLBACK — generate token signed with shared SSO secret ──────
    const ssoToken = generateSSOToken(String(user.id), prov.trading_account_id, storedLoginEmail, prov.challenge_account_id, storedAccountCode);
    const terminalBase = TERMINAL_API_URL || PRODUCTION_TERMINAL_URL;
    const launchUrl = buildTerminalLaunchUrl(terminalBase, ssoToken, storedAccountCode);
    lastReturnedTerminalJwt = ssoToken;
    console.info("[Terminal Launch] returning local fallback launch url", { launchUrl, accountCode: storedAccountCode });
    console.info("[Terminal Launch] returning launchUrl JWT", { jwt: ssoToken, launchUrl });

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
    console.error("[Terminal Launch] Unhandled error", {
      message: error?.message || String(error),
      stack: error?.stack || null,
      cause: error?.cause || null,
    });
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
  const verified = verifyTerminalJWT(token);
  if (!verified?.payload) {
    console.warn("[Terminal Launch] activation token verification failed", {
      reason: verified?.reason || "unknown",
      secretSource: verified?.secretSource || "unknown",
      algorithm: SSO_TOKEN_ALGORITHM,
    });
    return null;
  }

  try {
    const payload = verified.payload as {
      accountId?: string;
      email?: string;
      expiresAt?: number;
      exp?: number;
    };
    if (!payload.accountId || !payload.email) return null;
    return {
      accountId: String(payload.accountId),
      email: String(payload.email),
      expiresAt: Number(payload.expiresAt ?? payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Generate a fresh short-lived SSO token for terminal launch.
 * Used when TERMINAL_API_URL is configured but as a fallback.
 */
/**
 * Generate a fresh short-lived SSO token for terminal launch (local fallback).
 *
 * Uses signTerminalJWT() (HS256, base64url) to produce a standard JWT that
 * jsonwebtoken.verify() on the terminal side accepts. Payload matches what
 * terminal's validateSSOToken() requires:
 *   - sub         = fwUserId  (required by validateSSOToken)
 *   - accountId   = tradingAccountId (required by validateSSOToken)
 *   - challengeId = challenge_account_id
 *   - accountCode = account_code (passed through so terminal can use it directly)
 *   - email, nonce
 *   - exp = now + 60s  (terminal's maxAge: '120s' check will pass)
 *
 * Signed with SSO_SHARED_SECRET || SSO_API_KEY — same priority as the
 * terminal's sso.service.js so secrets always align.
 */
function generateSSOToken(fwUserId: string, tradingAccountId: string, email: string, challengeId?: string | null, accountCode?: string): string {
  const { secret, source } = getTerminalSSOSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    sub: fwUserId,
    accountId: tradingAccountId,
    email,
    nonce: randomUUID(),
    iat: now,
    exp: now + 60,
  };
  if (challengeId) payload.challengeId = challengeId;
  if (accountCode) payload.accountCode = accountCode;
  console.info("[Terminal Launch] signing SSO token", {
    secretSource: source,
    algorithm: SSO_TOKEN_ALGORITHM,
    sub: fwUserId,
    accountId: tradingAccountId,
    challengeId: challengeId ?? null,
    accountCode: accountCode ?? null,
  });
  return signTerminalJWT(payload, secret);
}

/**
 * POST /api/terminal/launch
 * POST /api/terminal-launch  (alias)
 *
 * Generates a terminal SSO launch URL.
 * Flow:
 *   1. Verify user owns the account via trader chain
 *   2. If TERMINAL_API_URL is configured → call terminal /auth/sso/generate
 *   3. If not → return local launch URL with embedded activation token
 */
router.post("/launch", handleTerminalLaunch);
router.post("/terminal-launch", handleTerminalLaunch); // keep alias for compatibility

/**
 * GET /api/terminal/redirect?accountId=xxx
 *
 * Server-side redirect endpoint — generates a fresh SSO token and immediately
 * issues a 302 redirect to terminal.fundedwealth.com/auth/sso?token=...
 *
 * This avoids the JS async delay that causes token expiry before the browser
 * receives the URL. The browser follows the redirect instantly.
 */
router.get("/redirect", async (req: Request, res: Response) => {
  try {
    // Reuse the same launch logic but return a redirect instead of JSON
    const accountId = req.query.accountId as string;
    if (!accountId) {
      return res.redirect(`${PRODUCTION_TERMINAL_URL}/error?reason=Missing+accountId`);
    }
    // Attach accountId to body so handleTerminalLaunch can read it
    (req as any).body = { accountId };
    // Override res.json to intercept the launchUrl and redirect instead
    const originalJson = res.json.bind(res);
    (res as any).json = (data: any) => {
      if (data?.success && data?.launchUrl) {
        return res.redirect(302, data.launchUrl);
      }
      return originalJson(data);
    };
    return handleTerminalLaunch(req, res);
  } catch (err: any) {
    return res.redirect(`${PRODUCTION_TERMINAL_URL}/error?reason=${encodeURIComponent(err.message || "Unknown error")}`);
  }
});

export default router;
