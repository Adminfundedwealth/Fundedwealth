/**
 * TEMPORARY DIAGNOSTIC ROUTE — Remove after debugging is complete
 * GET /api/diag/accounts?email=xxx&key=fw-diag-2026
 * Read-only. No writes.
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

export default router;
