/**
 * Read-only diagnostic for amanku...@gmail.com
 * Uses Supabase REST API with anon key (no service role needed for these checks)
 * NO writes, NO deletes, NO modifications.
 */
"use strict";
const { Client } = require("./node_modules/.pnpm/node_modules/pg");

// Use the Railway backend DATABASE_URL (which has real env vars)
// We know the Supabase project: nysrxvpjdlvzvcawysvh
// Password: Supabasefunded@2026 (from fix-missing-creds.cjs in project)
const DB = "postgresql://postgres:Supabasefunded%402026@db.nysrxvpjdlvzvcawysvh.supabase.co:5432/postgres";

async function main() {
  console.log("Connecting...");
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log("Connected.\n");
  } catch(e) {
    console.error("Connection failed:", e.message);
    // Try pooler
    const client2 = new Client({ 
      connectionString: "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabasefunded%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
      ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000
    });
    await client2.connect();
    return runDiagnostic(client2);
  }
  return runDiagnostic(client);
}

async function runDiagnostic(client) {
  // Step 1: Find aman kumar's user record
  const userRes = await client.query(`
    SELECT id, email, clerk_id, account_status, created_at
    FROM users 
    WHERE email ILIKE '%amanku%' OR email ILIKE 'amanku%'
    ORDER BY created_at DESC LIMIT 5
  `);
  
  console.log("=== STEP 1: users table (amanku* email) ===");
  if (!userRes.rows.length) {
    console.log("NOT FOUND by amanku* — trying testko03@gmail.com");
    const r2 = await client.query(`SELECT id, email, clerk_id, account_status FROM users WHERE email ILIKE '%testko%' OR email ILIKE '%aman%kumar%' LIMIT 5`);
    userRes.rows = r2.rows;
  }
  
  for (const u of userRes.rows) {
    const clerkPreview = u.clerk_id ? u.clerk_id.substring(0, 30) + '...' : 'NULL';
    console.log(`  id=${u.id} | email=${u.email} | clerk_id=${clerkPreview} | status=${u.account_status}`);
    
    const isPlaceholder = u.clerk_id && (u.clerk_id.startsWith('provisioned_') || u.clerk_id.startsWith('guest_'));
    if (isPlaceholder) console.log(`  ⚠️  PLACEHOLDER clerk_id: ${u.clerk_id}`);

    // Step 2: terminal_traders by users.id
    const tt1 = await client.query(`SELECT id, external_id, email, status FROM terminal_traders WHERE external_id = $1`, [u.id]);
    console.log(`\n  STEP 2a: terminal_traders by users.id (${u.id}): ${tt1.rows.length} row(s)`);
    tt1.rows.forEach(t => console.log(`    trader_id=${t.id} | external_id=${t.external_id} | status=${t.status}`));

    // Step 3: terminal_traders by email
    const tt2 = await client.query(`SELECT id, external_id, email, status FROM terminal_traders WHERE email = $1`, [u.email]);
    console.log(`  STEP 2b: terminal_traders by email (${u.email}): ${tt2.rows.length} row(s)`);
    tt2.rows.forEach(t => console.log(`    trader_id=${t.id} | external_id=${t.external_id}`));

    if (tt1.rows.length === 0 && tt2.rows.length > 0) {
      console.log(`  🔴 MISMATCH: users.id="${u.id}" != terminal_traders.external_id="${tt2.rows[0].external_id}"`);
    } else if (tt1.rows.length === 0 && tt2.rows.length === 0) {
      console.log(`  🔴 NO terminal_traders record found at all`);
    } else {
      console.log(`  ✅ trader found by users.id`);
    }

    const allTraders = [...tt1.rows, ...tt2.rows].filter((t,i,a) => a.findIndex(x=>x.id===t.id)===i);
    for (const trader of allTraders) {
      // Step 3: trading_accounts
      const ta = await client.query(`
        SELECT id, account_code, status, challenge_id, balance 
        FROM trading_accounts WHERE trader_id = $1 AND status != 'inactive'
      `, [trader.id]);
      console.log(`\n  STEP 3: trading_accounts for trader ${trader.id}: ${ta.rows.length} row(s)`);
      for (const acc of ta.rows) {
        console.log(`    ta_id=${acc.id} | code=${acc.account_code} | status=${acc.status} | challenge_id=${acc.challenge_id}`);
        // Step 4: challenge_accounts
        if (acc.challenge_id) {
          const ca = await client.query(`SELECT id, plan, type, status, initial_balance, current_balance FROM challenge_accounts WHERE id = $1`, [acc.challenge_id]);
          if (ca.rows.length) {
            const c = ca.rows[0];
            console.log(`      challenge: plan=${c.plan} | type=${c.type} | status=${c.status} | balance=${c.current_balance}`);
          }
        }
      }
    }

    // Step 5: orders
    const orders = await client.query(`
      SELECT id, status, plan_type, account_size, created_at FROM orders 
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3
    `, [u.id]);
    console.log(`\n  STEP 4: orders for user: ${orders.rows.length} row(s)`);
    orders.rows.forEach(o => console.log(`    order=${o.id} | status=${o.status} | plan=${o.plan_type} | size=${o.account_size}`));
  }

  // Summary: all active challenge_accounts with their traders and if the trader has a matching user
  console.log("\n=== STEP 5: ALL active challenges (admin view) ===");
  const allActive = await client.query(`
    SELECT 
      ca.id AS challenge_id, ca.plan, ca.type, ca.status, ca.initial_balance,
      tt.id AS trader_id, tt.external_id, tt.email AS trader_email,
      u.id AS user_id, u.email AS user_email, u.clerk_id
    FROM challenge_accounts ca
    JOIN trading_accounts ta ON ta.challenge_id = ca.id
    JOIN terminal_traders tt ON tt.id = ta.trader_id
    LEFT JOIN users u ON u.id::text = tt.external_id::text
    WHERE ca.status = 'active'
    ORDER BY ca.created_at DESC
    LIMIT 20
  `);
  console.log(`Total active challenges: ${allActive.rows.length}`);
  allActive.rows.forEach((r, i) => {
    const linked = r.user_id ? '✅' : '🔴';
    console.log(`  [${i+1}] ${linked} plan=${r.plan} | trader_email=${r.trader_email} | user_email=${r.user_email || 'NOT LINKED'} | clerk_id_placeholder=${r.clerk_id?.startsWith('provisioned_') || r.clerk_id?.startsWith('guest_') ? 'YES' : 'no'}`);
  });

  await client.end();
  console.log("\n=== DIAGNOSTIC COMPLETE — no data modified ===");
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
