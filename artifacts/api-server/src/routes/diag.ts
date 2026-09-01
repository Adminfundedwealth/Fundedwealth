/**
 * DIAGNOSTIC ROUTES — account ownership audit + safe repair.
 *
 * GET  /api/diag/accounts?email=xxx&key=fw-diag-2026
 *   Read-only per-user ownership report.
 *
 * POST /api/diag/fix-ownership?key=fw-diag-2026
 *   Safe idempotent repair that re-links:
 *   1. public.users.clerk_id placeholder → real auth.users.id (by email)
 *   2. terminal_traders.external_id → correct public.users.id (by email)
 *   Returns counts of rows fixed. No accounts are created or deleted.
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();
const DIAG_KEY = "fw-diag-2026";

router.get("/accounts", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });

  const email = String(req.query.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) return res.status(400).json({ error: "email required" });

  try {
    // 1. users
    const userRes = await db.execute(sql`
      SELECT id, email, clerk_id, account_status FROM users WHERE email = ${email} LIMIT 3
    `);
    const users = userRes.rows as any[];

    const report: any = { email, users: [], activeChallengeSummary: [] };

    for (const u of users) {
      const row: any = {
        userId: u.id,
        email: u.email,
        clerkId: u.clerk_id,
        clerkIsPlaceholder: u.clerk_id?.startsWith("provisioned_") || u.clerk_id?.startsWith("guest_"),
        accountStatus: u.account_status,
      };

      // terminal_traders by users.id
      const tt1 = await db.execute(sql`SELECT id, external_id, email, status FROM terminal_traders WHERE external_id = ${String(u.id)} LIMIT 5`);
      row.traderByUsersId = (tt1.rows as any[]).map(t => ({ id: t.id, external_id: t.external_id, status: t.status }));

      // terminal_traders by email
      const tt2 = await db.execute(sql`SELECT id, external_id, email, status FROM terminal_traders WHERE email = ${email} LIMIT 5`);
      row.traderByEmail = (tt2.rows as any[]).map(t => ({ id: t.id, external_id: t.external_id, email: t.email, status: t.status }));

      row.mismatch = row.traderByUsersId.length === 0 && row.traderByEmail.length > 0
        ? `users.id=${u.id} vs terminal_traders.external_id=${row.traderByEmail[0]?.external_id}`
        : null;

      // trading_accounts for all found traders
      const allTraderIds = [...row.traderByUsersId, ...row.traderByEmail].map((t: any) => t.id).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i);
      row.tradingAccounts = [];
      for (const traderId of allTraderIds) {
        const taRes = await db.execute(sql`
          SELECT ta.id, ta.account_code, ta.status AS ta_status, ca.plan, ca.type, ca.status AS challenge_status, ca.initial_balance, ca.current_balance
          FROM trading_accounts ta
          LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
          WHERE ta.trader_id = ${traderId}::uuid AND ta.status != 'inactive'
        `);
        row.tradingAccounts.push(...(taRes.rows as any[]));
      }

      report.users.push(row);
    }

    // All active challenges (admin view)
    const allActive = await db.execute(sql`
      SELECT ca.id, ca.plan, ca.status, tt.email AS trader_email, tt.external_id,
             u.id AS user_id, u.email AS user_email,
             CASE WHEN u.id IS NULL THEN 'UNLINKED' ELSE 'linked' END AS link_status
      FROM challenge_accounts ca
      JOIN trading_accounts ta ON ta.challenge_id = ca.id
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN users u ON u.id::text = tt.external_id::text
      WHERE ca.status = 'active'
      ORDER BY ca.created_at DESC LIMIT 30
    `);
    report.activeChallengeSummary = (allActive.rows as any[]).map(r => ({
      challengeId: r.id,
      plan: r.plan,
      traderEmail: r.trader_email,
      linkedUserEmail: r.user_email,
      externalId: r.external_id,
      linkStatus: r.link_status,
    }));

    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/diag/fix-ownership?key=fw-diag-2026
 *
 * Safe, idempotent ownership repair. Fixes two root causes of "No Active Accounts":
 *
 * Fix 1 — public.users.clerk_id placeholder → real auth.users.id
 *   Matches rows where clerk_id starts with 'supabase_pending_' or 'provisioned_'
 *   and updates to the real auth.users.id via email join.
 *   (auth.users table is accessible via Supabase service role; if not accessible
 *    from this context, fix1Count will be 0 with a note.)
 *
 * Fix 2 — terminal_traders.external_id mismatch → correct public.users.id
 *   Joins terminal_traders to public.users by lower(email) and updates any
 *   external_id that does not already equal the public.users.id.
 *
 * No accounts are created, modified, or deleted.
 */
router.post("/fix-ownership", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });

  const report: any = {
    fix1_clerk_id_placeholders: { fixed: 0, skipped: false, note: "" },
    fix2_external_id_mismatch: { fixed: 0 },
    timestamp: new Date().toISOString(),
  };

  // Fix 1: public.users.clerk_id placeholder → real auth.users.id
  // This requires access to auth.users which is only available via service role.
  try {
    const fix1 = await db.execute(sql`
      UPDATE public.users u
      SET
        clerk_id   = a.id::text,
        updated_at = NOW()
      FROM auth.users a
      WHERE lower(a.email) = lower(u.email)
        AND (
          u.clerk_id LIKE 'supabase_pending_%'
          OR u.clerk_id LIKE 'provisioned_%'
        )
    `);
    report.fix1_clerk_id_placeholders.fixed = (fix1 as any).rowCount ?? 0;
  } catch (err: any) {
    // auth.users is only accessible via service role — in pooler/anon mode this will fail.
    // That's expected; the fix still runs partially via Fix 2.
    report.fix1_clerk_id_placeholders.skipped = true;
    report.fix1_clerk_id_placeholders.note = `auth.users not accessible (service role required): ${err?.message}`;
  }

  // Fix 2: terminal_traders.external_id → correct public.users.id via email
  try {
    const fix2 = await db.execute(sql`
      UPDATE terminal_traders tt
      SET
        external_id = u.id::text,
        updated_at  = NOW()
      FROM public.users u
      WHERE lower(u.email) = lower(tt.email)
        AND tt.external_id != u.id::text
    `);
    report.fix2_external_id_mismatch.fixed = (fix2 as any).rowCount ?? 0;
  } catch (err: any) {
    return res.status(500).json({ error: `Fix 2 failed: ${err?.message}`, partial: report });
  }

  // Post-fix summary: count of still-unlinked traders (should be 0 after fix)
  try {
    const unlinked = await db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM terminal_traders tt
      LEFT JOIN public.users u ON lower(u.email) = lower(tt.email)
      WHERE u.id IS NULL
    `);
    report.remaining_unlinked_traders = (unlinked.rows[0] as any)?.count ?? "unknown";
  } catch { /* non-critical */ }

  // Count of active accounts now visible via the canonical path
  try {
    const visible = await db.execute(sql`
      SELECT COUNT(ta.id)::int AS count
      FROM terminal_traders tt
      JOIN public.users u ON u.id::text = tt.external_id
      JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
      JOIN challenge_accounts ca ON ca.id = ta.challenge_id AND ca.status = 'active'
    `);
    report.active_accounts_now_visible = (visible.rows[0] as any)?.count ?? "unknown";
  } catch { /* non-critical */ }

  return res.json({ success: true, ...report });
});

export default router;
