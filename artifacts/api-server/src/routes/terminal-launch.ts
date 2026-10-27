import { Router, type Request, type Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { resolveTerminalLaunchUser } from "../lib/terminalLaunchAuth.js";
import { resolveUserAccountOwnership } from "../lib/accountOwnershipCompat";
import { ensureTerminalAccountLink, loadVerifiedTerminalAccountSource } from "../lib/terminalAccountLink.js";

const router = Router();

const CHART_ORIGIN = "https://charts.fundedwealth.com";
const TERMINAL_API_URL = "https://new-terminal-production.up.railway.app";
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
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
 *   6. Request a short-lived terminal handoff for the existing account
 *   7. Return the handoff token for a POST to the chart terminal
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
      ownershipResult = await resolveUserAccountOwnership(db, String(user.id), accountId);
    } catch (dbErr: any) {
      console.error("[Terminal Launch] DB query failed:", dbErr.message);
      return res.status(500).json({ success: false, message: "Failed to verify account ownership." });
    }

    if (!ownershipResult || !ownershipResult.rows || ownershipResult.rows.length === 0) {
      console.warn("[Terminal Launch] ownership check failed", { authUserId: auth.userId, accountId });
      return res.status(404).json({
        success: false,
        message: "Account not found or does not belong to this user.",
      });
    }

    const prov = ownershipResult.rows[0] as any;
    console.info("[Terminal Launch] ownership ok", { traderId: prov.trader_id, tradingAccountId: prov.trading_account_id, challengeAccountId: prov.challenge_account_id });

    // ── 5. CHECK ACCOUNT IS ACTIVE ────────────────────────────────────────────
    if (prov.challenge_status !== "active" || prov.trading_status !== "active") {
      console.warn("[Terminal Launch] account not active", { challengeStatus: prov.challenge_status, accountId });
      return res.status(400).json({
        success: false,
        message: "This account is not active and cannot be launched.",
      });
    }

    console.info("[Terminal Launch] account state ok", { challengeStatus: prov.challenge_status, tradingStatus: prov.trading_status });

    const terminalAccountId = typeof prov.trading_account_id === "string"
      ? prov.trading_account_id.trim()
      : "";
    if (!terminalAccountId) {
      return res.status(409).json({
        success: false,
        message: "This account does not have a verified terminal account mapping.",
      });
    }

    const sharedKey = process.env.SSO_API_KEY || process.env.SSO_SHARED_SECRET;
    if (!sharedKey) {
      return res.status(503).json({
        success: false,
        message: "Terminal SSO is not configured. Contact support.",
      });
    }

    let linkedExternalAccountId = terminalAccountId;
    try {
      const source = await loadVerifiedTerminalAccountSource(db, String(user.id), terminalAccountId);
      await ensureTerminalAccountLink(source);
      linkedExternalAccountId = source.account.id;
    } catch (linkError: unknown) {
      const linkErrorStatus = typeof linkError === "object" && linkError !== null && "status" in linkError
        ? linkError.status
        : undefined;
      console.error("[Terminal Launch] terminal account mapping is not ready", {
        status: typeof linkErrorStatus === "number" && Number.isInteger(linkErrorStatus) ? linkErrorStatus : 500,
      });
      const status = linkErrorStatus === 409 ? 409 : 503;
      return res.status(status).json({
        success: false,
        message: status === 409
          ? "This account is not eligible for terminal launch until its account mapping and rules are verified."
          : "Terminal account linking is temporarily unavailable. Please try again later.",
      });
    }

    try {
      const terminalRes = await fetch(`${process.env.TERMINAL_API_URL || TERMINAL_API_URL}/auth/sso/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sso-api-key": sharedKey,
        },
        body: JSON.stringify({ accountId: linkedExternalAccountId }),
        signal: AbortSignal.timeout(8000),
      });

      if (!terminalRes.ok) {
        console.error("[Terminal Launch] Terminal SSO generation rejected", { status: terminalRes.status });
        return res.status(502).json({
          success: false,
          message: "Terminal SSO is temporarily unavailable. Please try again later.",
        });
      }

      const terminalData = await terminalRes.json() as { success?: boolean; token?: string };
      if (!terminalData.success || !terminalData.token) {
        console.error("[Terminal Launch] Terminal SSO returned an invalid handoff response");
        return res.status(502).json({
          success: false,
          message: "Terminal SSO returned an invalid handoff. Contact support.",
        });
      }

      return res.json({
        success: true,
        ssoToken: terminalData.token,
        terminalUrl: CHART_ORIGIN,
      });
    } catch {
      console.error("[Terminal Launch] Terminal SSO service unavailable");
      return res.status(502).json({
        success: false,
        message: "Terminal SSO is temporarily unavailable. Please try again later.",
      });
    }

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
 * POST /api/terminal/launch
 * POST /api/terminal-launch  (alias)
 *
 * Generates a terminal SSO handoff for the selected owned account.
 * Flow:
 *   1. Verify user owns the account via trader chain
 *   2. Call the active terminal service to create a short-lived handoff
 *   3. Return the token for a POST to charts.fundedwealth.com
 */
router.post("/launch", handleTerminalLaunch);
router.post("/terminal-launch", handleTerminalLaunch); // keep alias for compatibility

/**
 * GET /api/terminal/redirect?accountId=xxx
 *
 * Compatibility endpoint. The handoff remains in a POST body; it is never
 * appended to a browser URL.
 */
router.get("/redirect", async (req: Request, res: Response) => {
  try {
    const accountId = req.query.accountId as string;
    if (!accountId) {
      return res.status(400).send("accountId is required");
    }
    (req as any).body = { accountId };
    const originalJson = res.json.bind(res);
    (res as any).json = (data: any) => {
      if (data?.success && typeof data?.ssoToken === "string") {
        const token = escapeHtml(data.ssoToken);
        return res.status(200).type("html").send(
          `<!doctype html><html><body><form method="post" action="${CHART_ORIGIN}/auth/sso"><input type="hidden" name="token" value="${token}"></form><script>document.forms[0].submit()</script></body></html>`,
        );
      }
      return originalJson(data);
    };
    return handleTerminalLaunch(req, res);
  } catch {
    return res.status(500).send("Terminal SSO launch failed");
  }
});

export default router;
