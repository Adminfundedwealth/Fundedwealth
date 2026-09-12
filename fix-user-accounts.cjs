/**
 * fix-user-accounts.cjs
 *
 * Diagnoses and repairs accounts not showing on dashboard.
 * Root cause: terminal_traders.external_id was set to an old Clerk ID string
 * instead of the public.users UUID, so the dashboard can't find accounts.
 *
 * Usage:
 *   $env:DATABASE_URL="postgresql://..."; node fix-user-accounts.cjs rohitkumar301@gmail.com
 *   $env:DATABASE_URL="postgresql://..."; node fix-user-accounts.cjs propfirmmarkets@gmail.com
 *
 * Or set DATABASE_URL in your shell env and run:
 *   node fix-user-accounts.cjs <email>
 *
 * DRY RUN by default — pass --fix to apply changes.
 */

const { Pool } = require('pg');

const EMAIL   = process.argv[2];
const DRY_RUN = !process.argv.includes('--fix');

if (!EMAIL) {
  console.error('Usage: node fix-user-accounts.cjs <email> [--fix]');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log(`\n=== Account Repair for: ${EMAIL} ===`);
  console.log(DRY_RUN ? '(DRY RUN — pass --fix to apply changes)\n' : '(LIVE FIX MODE)\n');

  // 1. Find user row
  const uRes = await pool.query(
    'SELECT id, email, clerk_id FROM users WHERE email = $1 LIMIT 1',
    [EMAIL]
  );
  if (!uRes.rows.length) {
    console.log('❌  No user found in public.users for', EMAIL);
    await pool.end(); return;
  }
  const user = uRes.rows[0];
  console.log('✅ public.users row:');
  console.log('   id       =', user.id);
  console.log('   clerk_id =', user.clerk_id);
  console.log('   email    =', user.email);

  // 2. Find terminal_trader by correct external_id (users.id)
  const ttByIdRes = await pool.query(
    'SELECT id, external_id, email, status FROM terminal_traders WHERE external_id = $1 LIMIT 1',
    [user.id]
  );

  // 3. Also try finding trader by email (may have old external_id)
  const ttByEmailRes = await pool.query(
    'SELECT id, external_id, email, status FROM terminal_traders WHERE email = $1 LIMIT 1',
    [EMAIL]
  );

  const ttById    = ttByIdRes.rows[0]  ?? null;
  const ttByEmail = ttByEmailRes.rows[0] ?? null;

  console.log('\n── terminal_traders ──');
  if (ttById) {
    console.log('✅ Found by external_id (users.id) — link is CORRECT');
    console.log('   trader id  =', ttById.id);
    console.log('   external_id=', ttById.external_id);
  } else {
    console.log('❌ NOT found by external_id =', user.id);
  }
  if (ttByEmail && (!ttById || ttByEmail.id !== ttById.id)) {
    console.log('⚠️  Found by email with DIFFERENT external_id:');
    console.log('   trader id  =', ttByEmail.id);
    console.log('   external_id=', ttByEmail.external_id, '  ← this is the stale/wrong ID');
  }

  // 4. Count accounts under each trader
  if (ttByEmail) {
    const accRes = await pool.query(
      "SELECT ta.id, ta.account_code, ta.status, ca.plan FROM trading_accounts ta LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id WHERE ta.trader_id = $1 AND ta.status != 'inactive'",
      [ttByEmail.id]
    );
    console.log(`\n── trading_accounts under trader ${ttByEmail.id} ──`);
    if (!accRes.rows.length) {
      console.log('   (none)');
    } else {
      accRes.rows.forEach(a =>
        console.log(`   ${a.account_code}  status=${a.status}  plan=${a.plan}`)
      );
    }
  }

  // 5. Check orders
  const ordRes = await pool.query(
    "SELECT id, status, plan_type, account_size FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [user.id]
  );
  console.log('\n── orders ──');
  if (!ordRes.rows.length) {
    console.log('   (none)');
  } else {
    ordRes.rows.forEach(o =>
      console.log(`   ${o.id}  status=${o.status}  plan=${o.plan_type}  size=${o.account_size}`)
    );
  }

  // 6. Decide what needs fixing
  const needsFix = ttByEmail && !ttById;
  console.log('\n── Diagnosis ──');
  if (!ttByEmail && !ttById) {
    console.log('❌ No terminal_trader exists at all for this user.');
    console.log('   Accounts were never provisioned, or were provisioned under a completely different user.');
    await pool.end(); return;
  }
  if (ttById && !ttByEmail) {
    console.log('✅ Link is correct. Accounts should show up.');
    console.log('   If still not showing, the issue is elsewhere (auth token, CORS, etc.)');
    await pool.end(); return;
  }
  if (ttById && ttByEmail && ttById.id === ttByEmail.id) {
    console.log('✅ Link is correct. Accounts should show up.');
    await pool.end(); return;
  }
  if (needsFix) {
    console.log('🔧 FIX NEEDED: terminal_traders.external_id =', ttByEmail.external_id);
    console.log('   Should be  : users.id =', user.id);
    console.log('   This is why accounts are not showing on the dashboard.');

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN — no changes made.');
      console.log('   Run with --fix to apply:');
      console.log(`   node fix-user-accounts.cjs ${EMAIL} --fix`);
    } else {
      // Check for uniqueness conflict before updating
      const conflictRes = await pool.query(
        'SELECT id FROM terminal_traders WHERE external_id = $1 AND id != $2 LIMIT 1',
        [user.id, ttByEmail.id]
      );
      if (conflictRes.rows.length) {
        console.log('⚠️  Cannot update — another terminal_trader already has external_id =', user.id);
        console.log('   Conflict trader id:', conflictRes.rows[0].id);
        console.log('   Manual DB investigation required.');
        await pool.end(); return;
      }

      await pool.query(
        'UPDATE terminal_traders SET external_id = $1, updated_at = NOW() WHERE id = $2',
        [user.id, ttByEmail.id]
      );
      console.log('\n✅ FIXED: terminal_traders.external_id updated to', user.id);
      console.log('   Trader ID:', ttByEmail.id);
      console.log('   User can now refresh dashboard to see their accounts.');
    }
  }

  await pool.end();
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  pool.end();
  process.exit(1);
});
