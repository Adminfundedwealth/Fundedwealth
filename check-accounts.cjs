const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const EMAIL = 'amanks7880@gmail.com';

async function main() {
  const u = await pool.query("SELECT id, email, clerk_id FROM users WHERE email = $1", [EMAIL]);
  console.log('USER:', JSON.stringify(u.rows));

  if (!u.rows.length) { console.log('NOT FOUND'); return; }
  const uid = u.rows[0].id;

  const o = await pool.query("SELECT id, status, plan_type, account_size, payment_method FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [uid]);
  console.log('ORDERS:', JSON.stringify(o.rows));

  const a = await pool.query("SELECT id, status, plan_type, account_size FROM challenge_accounts WHERE user_id = $1 ORDER BY created_at DESC", [uid]);
  console.log('ACCOUNTS:', JSON.stringify(a.rows));
}

main().catch(e => console.error(e.message)).finally(() => pool.end());
