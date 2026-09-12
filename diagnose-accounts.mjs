/**
 * DIAGNOSTIC — Why are accounts not showing on the dashboard?
 *
 * Run:  node diagnose-accounts.mjs rohitkumar301@gmail.com
 * Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const email = process.argv[2];
if (!email) { console.error('Usage: node diagnose-accounts.mjs <email>'); process.exit(1); }

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  console.log(`\n=== Account Diagnostics for: ${email} ===\n`);

  // 1. Check auth.users (Supabase auth table)
  const { data: authUsers, error: authErr } = await db.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(u => u.email === email);
  console.log('1. auth.users (Supabase auth):');
  if (authErr) { console.log('   ERROR:', authErr.message); }
  else if (!authUser) { console.log('   ❌ NOT FOUND — user has never signed up or wrong email'); }
  else { console.log(`   ✅ Found: id=${authUser.id}  email=${authUser.email}  confirmed=${!!authUser.email_confirmed_at}`); }

  // 2. Check public.users
  const { data: dbUsers, error: dbErr } = await db.from('users').select('*').eq('email', email);
  console.log('\n2. public.users (DB):');
  if (dbErr) { console.log('   ERROR:', dbErr.message); }
  else if (!dbUsers?.length) { console.log('   ❌ NOT FOUND — no row in users table for this email'); }
  else {
    for (const u of dbUsers) {
      console.log(`   ✅ Found: id=${u.id}  clerk_id="${u.clerk_id}"  email=${u.email}`);
      if (authUser) {
        const linked = u.clerk_id === authUser.id;
        console.log(`   ${linked ? '✅' : '❌'} clerk_id matches auth.id: ${linked}`);
        if (!linked) {
          console.log(`   ⚠️  MISMATCH — DB clerk_id="${u.clerk_id}" but auth.id="${authUser.id}"`);
          console.log(`   → This is why accounts are not showing. The fix will auto-link on next request.`);
        }
      }
    }
  }

  const dbUser = dbUsers?.[0];
  if (!dbUser) { console.log('\n❌ Cannot continue — no DB user found.'); return; }

  // 3. Check terminal_traders
  const { data: traders, error: traderErr } = await db
    .from('terminal_traders')
    .select('id, external_id, email, status')
    .eq('external_id', dbUser.id);

  console.log('\n3. terminal_traders:');
  if (traderErr) { console.log('   ERROR:', traderErr.message); }
  else if (!traders?.length) {
    console.log(`   ❌ NOT FOUND — no terminal_trader row with external_id="${dbUser.id}"`);
    console.log(`   → This means accounts were provisioned under a DIFFERENT users.id`);
    // Try to find by email
    const { data: byEmail } = await db.from('terminal_traders').select('id, external_id, email, status').eq('email', email);
    if (byEmail?.length) {
      console.log(`   Found by email instead: external_id="${byEmail[0].external_id}"`);
      console.log(`   → users.id="${dbUser.id}" but terminal_traders.external_id="${byEmail[0].external_id}"`);
      console.log(`   → These DON'T match — this is the root cause.`);
    }
  } else {
    for (const t of traders) {
      console.log(`   ✅ Found: id=${t.id}  external_id=${t.external_id}  status=${t.status}`);
    }
  }

  // 4. Check trading_accounts
  const traderId = traders?.[0]?.id;
  if (traderId) {
    const { data: accounts, error: accErr } = await db
      .from('trading_accounts')
      .select('id, account_code, status, challenge_id')
      .eq('trader_id', traderId);

    console.log('\n4. trading_accounts:');
    if (accErr) { console.log('   ERROR:', accErr.message); }
    else if (!accounts?.length) { console.log('   ❌ No trading accounts found for this trader'); }
    else {
      for (const a of accounts) {
        console.log(`   ✅ ${a.account_code}  status=${a.status}  id=${a.id}`);
      }
    }
  }

  // 5. Check orders
  const { data: orders, error: ordErr } = await db
    .from('orders')
    .select('id, status, plan_type, account_size, created_at')
    .eq('user_id', dbUser.id)
    .order('created_at', { ascending: false });

  console.log('\n5. orders:');
  if (ordErr) { console.log('   ERROR:', ordErr.message); }
  else if (!orders?.length) { console.log('   ❌ No orders found'); }
  else {
    for (const o of orders) {
      console.log(`   ${o.status === 'confirmed' || o.status === 'paid' ? '✅' : '⚠️ '} id=${o.id}  status=${o.status}  plan=${o.plan_type}  size=${o.account_size}  created=${o.created_at?.slice(0,10)}`);
    }
  }

  console.log('\n=== DONE ===\n');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
