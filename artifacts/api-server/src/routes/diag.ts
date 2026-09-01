/**
 * DIAGNOSTIC ROUTES — account ownership audit, safe repair, and gap analysis.
 *
 * GET  /api/diag/accounts?email=xxx&key=fw-diag-2026
 *   Full per-user ownership trace: users row, terminal_traders link, trading accounts.
 *
 * GET  /api/diag/clerk?key=fw-diag-2026
 *   Sample of clerk_id values to detect placeholder / UUID type.
 *
 * GET  /api/diag/summary?key=fw-diag-2026
 *   Global counts: active challenges, unlinked traders, plan breakdown, ta_status breakdown.
 *
 * GET  /api/diag/unlinked?key=fw-diag-2026
 *   List every terminal_traders row that has NO matching public.users row.
 *   These are the accounts users CANNOT see on the dashboard.
 *
 * POST /api/diag/fix-ownership?key=fw-diag-2026
 *   Safe idempotent repair: re-links terminal_traders.external_id → users.id by email.
 *   Returns rows fixed + remaining counts.
 *
 * ALL endpoints: read-only except fix-ownership which only updates external_id.
 * No accounts are created, modified, or deleted by any of these routes.
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();
const DIAG_KEY = "fw-diag-2026";

// ─── GET /api/diag/clerk ──────────────────────────────────────────────────────
// Reveals clerk_id shape (real UUID vs placeholder) and external_id match rate.
router.get("/clerk", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });
  try {
    const r = await db.execute(sql`
      SELECT
        u.email,
        u.clerk_id,
        u.clerk_id LIKE 'provisioned_%'  AS is_provisioned_placeholder,
        u.clerk_id LIKE 'guest_%'        AS is_guest_placeholder,
        (u.clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') AS looks_like_uuid,
        tt.id IS NOT NULL                AS has_trader,
        tt.external_id,
        (tt.external_id::text = u.id::text) AS external_id_matches_user_id
      FROM users u
      LEFT JOIN terminal_traders tt ON lower(tt.email) = lower(u.email)
      WHERE u.clerk_id IS NOT NULL
      ORDER BY u.created_at DESC
      LIMIT 40
    `);
    const [totalRow]       = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM users`)).rows as any[];
    const [placeholderRow] = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM users WHERE clerk_id LIKE 'provisioned_%' OR clerk_id LIKE 'guest_%' OR clerk_id LIKE 'supabase_pending_%'`)).rows as any[];
    const [uuidRow]        = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM users WHERE clerk_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`)).rows as any[];
    const [mismatchRow]    = (await db.execute(sql`
      SELECT COUNT(*)::int AS c
      FROM terminal_traders tt
      JOIN users u ON lower(u.email) = lower(tt.email)
      WHERE tt.external_id != u.id::text
    `)).rows as any[];
    return res.json({
      summary: {
        totalUsers: totalRow?.c,
        placeholderClerkIds: placeholderRow?.c,
        realUuidClerkIds: uuidRow?.c,
        externalIdMismatches: mismatchRow?.c,
      },
      sample: r.rows,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/diag/summary ────────────────────────────────────────────────────
// Global account health dashboard.
router.get("/summary", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });
  try {
    const [totalActive] = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM challenge_accounts WHERE status = 'active'`)).rows as any[];
    const [totalTraders] = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM terminal_traders`)).rows as any[];
    const [linkedTraders] = (await db.execute(sql`
      SELECT COUNT(*)::int AS c FROM terminal_traders tt
      JOIN users u ON lower(u.email) = lower(tt.email)
    `)).rows as any[];
    const [unlinkedTraders] = (await db.execute(sql`
      SELECT COUNT(*)::int AS c FROM terminal_traders tt
      LEFT JOIN users u ON lower(u.email) = lower(tt.email)
      WHERE u.id IS NULL
    `)).rows as any[];
    const [extIdMismatch] = (await db.execute(sql`
      SELECT COUNT(*)::int AS c
      FROM terminal_traders tt
      JOIN users u ON lower(u.email) = lower(tt.email)
      WHERE tt.external_id != u.id::text
    `)).rows as any[];
    const [visibleAccounts] = (await db.execute(sql`
      SELECT COUNT(*)::int AS c
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      JOIN users u ON u.id::text = tt.external_id
      WHERE ta.status != 'inactive'
    `)).rows as any[];

    // Plan breakdown for active challenges
    const planBreakdown = await db.execute(sql`
      SELECT ca.plan, COUNT(*)::int AS count
      FROM challenge_accounts ca
      WHERE ca.status = 'active'
      GROUP BY ca.plan ORDER BY count DESC
    `);

    // ta_status breakdown for all trading accounts
    const taStatusBreakdown = await db.execute(sql`
      SELECT ta.status, COUNT(*)::int AS count
      FROM trading_accounts ta
      GROUP BY ta.status ORDER BY count DESC
    `);

    // challenge_status breakdown
    const caStatusBreakdown = await db.execute(sql`
      SELECT status, COUNT(*)::int AS count
      FROM challenge_accounts
      GROUP BY status ORDER BY count DESC
    `);

    return res.json({
      challenges: {
        totalActive: totalActive?.c,
        planBreakdown: planBreakdown.rows,
        statusBreakdown: caStatusBreakdown.rows,
      },
      traders: {
        total: totalTraders?.c,
        linked: linkedTraders?.c,
        unlinked: unlinkedTraders?.c,
        externalIdMismatch: extIdMismatch?.c,
      },
      tradingAccounts: {
        visibleViaCanonicalPath: visibleAccounts?.c,
        statusBreakdown: taStatusBreakdown.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/diag/unlinked ───────────────────────────────────────────────────
// Shows every trader row with NO matching public.users row — these users' accounts
// are INVISIBLE on the dashboard regardless of the ownership resolver.
router.get("/unlinked", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });
  try {
    // Traders with no users row at all (by email)
    const unlinked = await db.execute(sql`
      SELECT
        tt.id          AS trader_id,
        tt.email       AS trader_email,
        tt.external_id,
        tt.status      AS trader_status,
        tt.created_at,
        COUNT(ta.id)::int            AS trading_account_count,
        COUNT(ca.id) FILTER (WHERE ca.status = 'active')::int  AS active_challenge_count
      FROM terminal_traders tt
      LEFT JOIN users u ON lower(u.email) = lower(tt.email)
      LEFT JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE u.id IS NULL
      GROUP BY tt.id, tt.email, tt.external_id, tt.status, tt.created_at
      ORDER BY active_challenge_count DESC, tt.created_at DESC
    `);

    // External_id mismatches (users exists but external_id is wrong)
    const mismatched = await db.execute(sql`
      SELECT
        tt.id          AS trader_id,
        tt.email       AS trader_email,
        tt.external_id AS stored_external_id,
        u.id           AS correct_users_id,
        u.clerk_id,
        tt.status      AS trader_status,
        COUNT(ta.id)::int           AS trading_account_count,
        COUNT(ca.id) FILTER (WHERE ca.status = 'active')::int AS active_challenge_count
      FROM terminal_traders tt
      JOIN users u ON lower(u.email) = lower(tt.email)
      LEFT JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE tt.external_id != u.id::text
      GROUP BY tt.id, tt.email, tt.external_id, u.id, u.clerk_id, tt.status
      ORDER BY active_challenge_count DESC
    `);

    return res.json({
      noUsersRow: {
        count: (unlinked.rows as any[]).length,
        traders: unlinked.rows,
      },
      externalIdMismatch: {
        count: (mismatched.rows as any[]).length,
        traders: mismatched.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/diag/accounts ───────────────────────────────────────────────────
// Full per-user ownership trace.
router.get("/accounts", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });

  const email = String(req.query.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) return res.status(400).json({ error: "email required" });

  try {
    // 1. users row
    const userRes = await db.execute(sql`
      SELECT id, email, clerk_id, account_status FROM users WHERE lower(email) = ${email} LIMIT 5
    `);
    const userRows = userRes.rows as any[];

    // 2. terminal_traders directly by email (bypass users table)
    const ttDirectRes = await db.execute(sql`
      SELECT tt.id AS trader_id, tt.external_id, tt.email AS trader_email, tt.status,
             ta.id AS ta_id, ta.account_code, ta.status AS ta_status,
             ca.id AS ca_id, ca.plan, ca.type, ca.status AS challenge_status, ca.initial_balance
      FROM terminal_traders tt
      LEFT JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE lower(tt.email) = ${email}
      LIMIT 10
    `);

    const report: any = {
      email,
      usersTableCount: userRows.length,
      users: userRows.map((u: any) => ({
        id: u.id,
        email: u.email,
        clerkIdPreview: u.clerk_id ? u.clerk_id.substring(0, 36) : 'NULL',
        isPlaceholder: !!(u.clerk_id?.startsWith('provisioned_') || u.clerk_id?.startsWith('guest_') || u.clerk_id?.startsWith('supabase_pending_')),
        looksLikeSupabaseUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(u.clerk_id || ''),
        accountStatus: u.account_status,
      })),
      terminalTraderDirectByEmail: (ttDirectRes.rows as any[]).map((r: any) => ({
        traderId: r.trader_id,
        externalId: r.external_id,
        accountCode: r.account_code,
        challengePlan: r.plan,
        challengeType: r.type,
        challengeStatus: r.challenge_status,
        taStatus: r.ta_status,
        initialBalance: r.initial_balance,
        tradingAccountId: r.ta_id,
      })),
    };

    // Per-user ownership trace (Path A, B, C)
    for (const u of userRows) {
      // Path A: external_id = users.id
      const ttA = await db.execute(sql`
        SELECT tt.id, tt.external_id, tt.email, tt.status
        FROM terminal_traders tt WHERE tt.external_id = ${String(u.id)} LIMIT 5
      `);
      // Path B: external_id = clerk_id (auth UUID stored directly)
      const ttB = u.clerk_id && u.clerk_id !== u.id ? await db.execute(sql`
        SELECT tt.id, tt.external_id, tt.email, tt.status
        FROM terminal_traders tt WHERE tt.external_id = ${u.clerk_id} LIMIT 5
      `) : { rows: [] };
      // Path C: email
      const ttC = await db.execute(sql`
        SELECT tt.id, tt.external_id, tt.email, tt.status
        FROM terminal_traders tt WHERE lower(tt.email) = lower(${u.email}) LIMIT 5
      `);

      const pathAHit = (ttA.rows as any[]).length > 0;
      const pathBHit = (ttB.rows as any[]).length > 0;
      const pathCHit = (ttC.rows as any[]).length > 0;

      const key = `ownershipTrace_${u.email}`;
      (report as any)[key] = {
        pathA_byUsersId:   { hits: (ttA.rows as any[]).length, rows: (ttA.rows as any[]).map((t:any)=>({ id:t.id, external_id:t.external_id })) },
        pathB_byClerkId:   { hits: (ttB.rows as any[]).length, rows: (ttB.rows as any[]).map((t:any)=>({ id:t.id, external_id:t.external_id })) },
        pathC_byEmail:     { hits: (ttC.rows as any[]).length, rows: (ttC.rows as any[]).map((t:any)=>({ id:t.id, external_id:t.external_id })) },
        resolves: pathAHit ? 'PATH_A' : pathBHit ? 'PATH_B' : pathCHit ? 'PATH_C' : 'NONE',
        mismatch: !pathAHit && pathCHit
          ? `external_id=${(ttC.rows[0] as any).external_id} != users.id=${u.id}`
          : null,
      };

      // Trading accounts found via each path
      const allTraderIds = [...(ttA.rows as any[]), ...(ttB.rows as any[]), ...(ttC.rows as any[])]
        .map((t: any) => t.id)
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i);

      (report as any)[key].tradingAccounts = [];
      for (const traderId of allTraderIds) {
        const taRes = await db.execute(sql`
          SELECT ta.id, ta.account_code, ta.status AS ta_status,
                 ca.plan, ca.type, ca.status AS challenge_status,
                 ca.initial_balance, ca.current_balance
          FROM trading_accounts ta
          LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
          WHERE ta.trader_id = ${traderId}::uuid
          ORDER BY ta.created_at DESC
        `);
        (report as any)[key].tradingAccounts.push(...(taRes.rows as any[]).map((r: any) => ({
          accountCode: r.account_code,
          taStatus: r.ta_status,
          challengeStatus: r.challenge_status,
          plan: r.plan,
          type: r.type,
          balance: r.current_balance ?? r.initial_balance,
        })));
      }
    }

    // Active challenges for this email (raw SQL join, no ownership filter)
    const activeChallenges = await db.execute(sql`
      SELECT ca.id, ca.plan, ca.type, ca.status AS challenge_status,
             ca.initial_balance,
             ta.status AS ta_status, ta.account_code,
             tt.email AS trader_email, tt.external_id,
             u.id AS user_id, u.email AS user_email,
             u.clerk_id,
             CASE WHEN u.id IS NULL THEN 'NO_USER_ROW'
                  WHEN tt.external_id = u.id::text THEN 'PATH_A_OK'
                  ELSE 'EXTERNAL_ID_MISMATCH'
             END AS link_status
      FROM challenge_accounts ca
      JOIN trading_accounts ta ON ta.challenge_id = ca.id
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN users u ON lower(u.email) = lower(tt.email)
      WHERE lower(tt.email) = ${email}
      ORDER BY ca.created_at DESC
      LIMIT 20
    `);
    report.allChallengesForEmail = (activeChallenges.rows as any[]).map((r: any) => ({
      challengeId: r.id,
      plan: r.plan,
      type: r.type,
      challengeStatus: r.challenge_status,
      taStatus: r.ta_status,
      accountCode: r.account_code,
      externalId: r.external_id,
      linkedUserId: r.user_id,
      linkStatus: r.link_status,
      clerkIsPlaceholder: !!(r.clerk_id?.startsWith('provisioned_') || r.clerk_id?.startsWith('guest_')),
    }));

    report.globalActiveChallengeCount = ((await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM challenge_accounts WHERE status = 'active'`
    )).rows[0] as any)?.c;

    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/diag/activeChallengeSummary ──────────────────────────────────────
// Admin-style view: all active challenges with link status (no pagination limit).
router.get("/active-challenges", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });
  const limit = Math.min(parseInt(String(req.query.limit || "100")), 200);
  const offset = parseInt(String(req.query.offset || "0"));
  try {
    const rows = await db.execute(sql`
      SELECT
        ca.id            AS challenge_id,
        ca.plan,
        ca.type,
        ca.status        AS challenge_status,
        ca.initial_balance,
        ca.created_at,
        ta.id            AS trading_account_id,
        ta.account_code,
        ta.status        AS ta_status,
        tt.id            AS trader_id,
        tt.email         AS trader_email,
        tt.external_id,
        u.id             AS user_id,
        u.email          AS user_email,
        u.clerk_id,
        CASE
          WHEN u.id IS NULL THEN 'NO_USER_ROW'
          WHEN tt.external_id = u.id::text THEN 'PATH_A_OK'
          ELSE 'EXTERNAL_ID_MISMATCH'
        END AS link_status
      FROM challenge_accounts ca
      JOIN trading_accounts ta ON ta.challenge_id = ca.id
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      LEFT JOIN users u ON lower(u.email) = lower(tt.email)
      WHERE ca.status = 'active'
      ORDER BY ca.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = (await db.execute(sql`SELECT COUNT(*)::int AS c FROM challenge_accounts WHERE status='active'`)).rows as any[];

    const grouped: Record<string, number> = {};
    for (const r of rows.rows as any[]) {
      const k = (r as any).link_status;
      grouped[k] = (grouped[k] || 0) + 1;
    }

    return res.json({
      total: total?.c,
      showing: (rows.rows as any[]).length,
      linkStatusCounts: grouped,
      rows: (rows.rows as any[]).map((r: any) => ({
        challengeId: r.challenge_id,
        plan: r.plan,
        type: r.type,
        challengeStatus: r.challenge_status,
        taStatus: r.ta_status,
        accountCode: r.account_code,
        traderEmail: r.trader_email,
        externalId: r.external_id,
        linkedUserId: r.user_id,
        linkedUserEmail: r.user_email,
        clerkIsPlaceholder: !!(r.clerk_id?.startsWith('provisioned_') || r.clerk_id?.startsWith('guest_')),
        linkStatus: r.link_status,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/diag/fix-ownership ────────────────────────────────────────────
// Safe idempotent ownership repair.
router.post("/fix-ownership", async (req, res) => {
  if (req.query.key !== DIAG_KEY) return res.status(403).json({ error: "forbidden" });

  const report: any = {
    fix1_clerk_id_placeholders: { fixed: 0, skipped: false, note: "" },
    fix2_external_id_mismatch: { fixed: 0 },
    timestamp: new Date().toISOString(),
  };

  // Fix 1: clerk_id placeholder → real auth UUID (requires auth.users access)
  try {
    const fix1 = await db.execute(sql`
      UPDATE public.users u
      SET clerk_id   = a.id::text,
          updated_at = NOW()
      FROM auth.users a
      WHERE lower(a.email) = lower(u.email)
        AND (u.clerk_id LIKE 'supabase_pending_%' OR u.clerk_id LIKE 'provisioned_%')
    `);
    report.fix1_clerk_id_placeholders.fixed = (fix1 as any).rowCount ?? 0;
  } catch (err: any) {
    report.fix1_clerk_id_placeholders.skipped = true;
    report.fix1_clerk_id_placeholders.note = `auth.users inaccessible (needs service role): ${err?.message}`;
  }

  // Fix 2: terminal_traders.external_id → correct public.users.id via email
  try {
    const fix2 = await db.execute(sql`
      UPDATE terminal_traders tt
      SET external_id = u.id::text,
          updated_at  = NOW()
      FROM public.users u
      WHERE lower(u.email) = lower(tt.email)
        AND tt.external_id != u.id::text
    `);
    report.fix2_external_id_mismatch.fixed = (fix2 as any).rowCount ?? 0;
  } catch (err: any) {
    return res.status(500).json({ error: `Fix 2 failed: ${err?.message}`, partial: report });
  }

  // Post-fix counts
  try {
    const [unlinked] = (await db.execute(sql`
      SELECT COUNT(*)::int AS c FROM terminal_traders tt
      LEFT JOIN public.users u ON lower(u.email) = lower(tt.email)
      WHERE u.id IS NULL
    `)).rows as any[];
    report.remaining_unlinked_traders = unlinked?.c;
  } catch { /* non-critical */ }

  try {
    const [visible] = (await db.execute(sql`
      SELECT COUNT(ta.id)::int AS c
      FROM terminal_traders tt
      JOIN public.users u ON u.id::text = tt.external_id
      JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
      JOIN challenge_accounts ca ON ca.id = ta.challenge_id AND ca.status = 'active'
    `)).rows as any[];
    report.active_accounts_now_visible = visible?.c;
  } catch { /* non-critical */ }

  return res.json({ success: true, ...report });
});

export default router;
