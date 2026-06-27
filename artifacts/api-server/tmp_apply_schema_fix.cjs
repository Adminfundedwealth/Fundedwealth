const fs = require('fs');
const path = require('path');

// Use node-postgres from api-server node_modules
const { Client } = require('../../node_modules/.pnpm/pg@8.20.0/node_modules/pg');

const client = new Client({
  // Use the direct database host instead of pooler to avoid SNI issues
  host: 'db.nysrxvpjdlvzvcawysvh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '8m56JQWMxKag9zCj',
});

(async () => {
  await client.connect();
  try {
    const sqlContent = fs.readFileSync(path.resolve(__dirname, '../../tmp_fix_schema.sql'), 'utf8');
    const statements = sqlContent.split(';').filter(s => s.trim());
    
    console.log(`Applying ${statements.length} SQL statements...`);
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        await client.query(trimmed);
        console.log(`✓ ${trimmed.substring(0, 60)}...`);
      } catch (err) {
        console.log(`✗ ${trimmed.substring(0, 60)}...\n  Error: ${err.message}`);
      }
    }
    console.log('Schema fix complete!');
  } finally {
    await client.end();
  }
})();
