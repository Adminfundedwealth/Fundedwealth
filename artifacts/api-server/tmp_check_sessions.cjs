const { Client } = require('../../node_modules/.pnpm/pg@8.20.0/node_modules/pg');

const client = new Client({
  host: 'db.nysrxvpjdlvzvcawysvh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '8m56JQWMxKag9zCj',
});

(async () => {
  await client.connect();
  try {
    // Check sessions table schema
    const schemaRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'sessions'
      ORDER BY ordinal_position
    `);
    
    console.log('Sessions table schema:');
    schemaRes.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check a sample session record
    const sessionRes = await client.query('SELECT id, user_id, session_token FROM sessions LIMIT 1');
    console.log('\nSample session record:');
    if (sessionRes.rows.length > 0) {
      const row = sessionRes.rows[0];
      console.log(`  id: ${row.id} (type: ${typeof row.id})`);
      console.log(`  user_id: ${row.user_id} (type: ${typeof row.user_id})`);
      console.log(`  session_token: ${row.session_token}`);
    } else {
      console.log('  No sessions found');
    }
  } finally {
    await client.end();
  }
})();
