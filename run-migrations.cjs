const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Connected to DB!');
    
    // Test basic query
    const test = await client.query('SELECT 1 as ok');
    console.log('DB test:', test.rows[0]);
    
    // Migration 1: KYC columns
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS document_front_url TEXT`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS document_back_url TEXT`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS document_hash TEXT`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING'`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN NOT NULL DEFAULT TRUE`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS mime_type TEXT`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS file_size INTEGER`);
    await client.query(`ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW()`);
    await client.query(`ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS review_notes TEXT`);
    console.log('Migration 1 (KYC) done');
    
    // Migration 2: provisioning_logs nullable order_id
    await client.query(`ALTER TABLE provisioning_logs DROP CONSTRAINT IF EXISTS provisioning_logs_order_id_fkey`);
    await client.query(`ALTER TABLE provisioning_logs ALTER COLUMN order_id DROP NOT NULL`);
    console.log('Migration 2 (provisioning_logs) done');
    
    // Count all active accounts
    const accounts = await client.query(`
      SELECT 
        count(*) FILTER (WHERE ta.status = 'active') as active_trading_accounts,
        count(*) FILTER (WHERE ca.status = 'active') as active_challenge_accounts,
        count(DISTINCT tt.external_id) as traders_with_accounts
      FROM trading_accounts ta
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id
      WHERE ta.status != 'inactive'
    `);
    console.log('Active accounts summary:', accounts.rows[0]);
    
    // List all active users with accounts
    const users = await client.query(`
      SELECT 
        u.email,
        u.first_name,
        ta.account_code,
        ta.status as ta_status,
        ca.status as ca_status,
        ca.plan,
        ca.initial_balance
      FROM trading_accounts ta
      JOIN terminal_traders tt ON tt.id = ta.trader_id
      JOIN users u ON u.id::text = tt.external_id::text
      LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
      WHERE ta.status != 'inactive'
      ORDER BY ta.created_at DESC
    `);
    console.log('All active accounts:');
    users.rows.forEach(r => console.log(` - ${r.email} | ${r.account_code} | ${r.plan} | ₹${r.initial_balance} | ca:${r.ca_status} ta:${r.ta_status}`));
    
  } catch(err) {
    console.error('ERROR:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
