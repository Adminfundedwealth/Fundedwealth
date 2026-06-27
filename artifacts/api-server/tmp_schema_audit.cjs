const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'db.nysrxvpjdlvzvcawysvh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '8m56JQWMxKag9zCj',
});

const results = {
  tables_found: [],
  tables_missing: [],
  columns_missing_by_table: {},
  issues: []
};

const REQUIRED_TABLES = [
  'users', 'auth_methods', 'sessions', 'two_factor_settings', 'login_history',
  'support_tickets', 'support_attachments', 'payments', 'challenges',
  'challenge_accounts', 'kyc_submissions', 'payouts', 'api_logs',
  'system_errors', 'system_incidents', 'alert_rules'
];

(async () => {
  try {
    await client.connect();
    
    // Get all tables
    const tableRes = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const existingTables = new Set(tableRes.rows.map(r => r.table_name));
    results.tables_found = Array.from(existingTables).sort();
    
    // Check for missing tables
    for (const table of REQUIRED_TABLES) {
      if (!existingTables.has(table)) {
        results.tables_missing.push(table);
      }
    }
    
    // Check users table columns
    const usersRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    const usersColumns = new Set(usersRes.rows.map(r => r.column_name));
    
    const requiredUserColumns = [
      'id', 'email', 'first_name', 'last_name', 'role', 'clerk_id',
      'phone', 'city', 'state', 'avatar_url', 'affiliate_code', 'referred_by',
      'notification_settings', 'kyc_status', 'is_active', 'experience_points',
      'current_level', 'achievement_count', 'streak_points', 'public_profile',
      'total_payout', 'created_at', 'updated_at'
    ];
    
    const missingUserColumns = requiredUserColumns.filter(col => !usersColumns.has(col));
    if (missingUserColumns.length > 0) {
      results.columns_missing_by_table.users = missingUserColumns;
      results.issues.push(`Users table missing columns: ${missingUserColumns.join(', ')}`);
    }
    
    // Check sessions table
    const sessionsRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'sessions'
      ORDER BY ordinal_position
    `);
    const sessionsColumns = new Set(sessionsRes.rows.map(r => r.column_name));
    
    const userIdColType = await client.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'user_id'
    `);
    
    if (userIdColType.rows.length > 0) {
      const colType = userIdColType.rows[0].data_type;
      if (colType === 'uuid') {
        results.issues.push(`✓ Sessions.user_id is UUID (correct)`);
      } else {
        results.issues.push(`✗ Sessions.user_id is ${colType} (should be UUID)`);
      }
    }
    
    // Check payments table
    if (existingTables.has('payments')) {
      const payRes = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payments'
        ORDER BY ordinal_position
      `);
      const payColumns = new Set(payRes.rows.map(r => r.column_name));
      const missingPayCols = ['user_id', 'amount', 'currency', 'status', 'payment_gateway', 'gateway_transaction_id'].filter(c => !payColumns.has(c));
      if (missingPayCols.length > 0) {
        results.columns_missing_by_table.payments = missingPayCols;
      }
    }
    
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync('/tmp/schema_audit.json', JSON.stringify(results, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
    results.issues.push(`Error: ${err.message}`);
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await client.end();
  }
})();
