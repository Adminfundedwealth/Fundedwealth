import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  // Find the user
  const userRes = await pool.query(
    "SELECT id, email, clerk_id FROM users WHERE email = 'amanks7880@gmail.com'"
  );
  console.log('USER:', JSON.stringify(userRes.rows, null, 2));

  if (userRes.rows.length === 0) {
    console.log('User not found in DB');
    await pool.end();
    process.exit(0);
  }

  const userId = userRes.rows[0].id;

  // Find orders
  const ordersRes = await pool.query(
    "SELECT id, status, plan_type, account_size, payment_method, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  console.log('ORDERS:', JSON.stringify(ordersRes.rows, null, 2));

  // Find challenge accounts
  const accountsRes = await pool.query(
    "SELECT id, status, account_size, plan_type, created_at FROM challenge_accounts WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  console.log('CHALLENGE ACCOUNTS:', JSON.stringify(accountsRes.rows, null, 2));

} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await pool.end();
}
