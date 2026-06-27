const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres',
  password: '8m56JQWMxKag9zCj',
});

(async () => {
  await client.connect();
  try {
    // Get current columns in users table
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Current users table columns:');
    res.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    // List of columns expected by Drizzle schema
    const expectedCols = [
      'id', 'clerk_id', 'email', 'first_name', 'last_name', 'phone', 
      'city', 'state', 'avatar_url', 'role', 'affiliate_code', 'referred_by',
      'notification_settings', 'kyc_status', 'is_active', 'experience_points',
      'current_level', 'achievement_count', 'streak_points', 'public_profile',
      'total_payout', 'created_at', 'updated_at'
    ];
    
    const existingCols = new Set(res.rows.map(r => r.column_name));
    const missing = expectedCols.filter(col => !existingCols.has(col));
    
    console.log('\nMissing columns:', missing);

    // Add missing columns
    for (const col of missing) {
      try {
        let colDef = 'TEXT NOT NULL DEFAULT \'\'';
        if (col === 'id') colDef = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
        else if (col === 'is_active') colDef = 'BOOLEAN NOT NULL DEFAULT true';
        else if (col === 'kyc_status') colDef = 'TEXT NOT NULL DEFAULT \'pending\'';
        else if (col === 'notification_settings') colDef = 'JSONB NOT NULL DEFAULT \'{}\'';
        else if (col === 'experience_points' || col === 'current_level' || col === 'achievement_count' || col === 'streak_points') colDef = 'INTEGER NOT NULL DEFAULT 0';
        else if (col === 'total_payout') colDef = 'NUMERIC(15,2) NOT NULL DEFAULT 0';
        else if (col === 'public_profile') colDef = 'BOOLEAN NOT NULL DEFAULT false';
        else if (col === 'created_at' || col === 'updated_at') colDef = 'TIMESTAMP NOT NULL DEFAULT now()';
        
        await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "${col}" ${colDef}`);
        console.log(`✓ Added ${col}`);
      } catch (err) {
        console.log(`✗ Failed to add ${col}: ${err.message}`);
      }
    }
  } finally {
    await client.end();
  }
})();
