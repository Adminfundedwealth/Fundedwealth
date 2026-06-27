const { Client } = require('pg');

async function test(label, config) {
  const client = new Client({ ...config, ssl: { rejectUnauthorized: false } });
  const start = Date.now();
  try {
    await client.connect();
    console.log(label + ' CONNECT OK ms=' + (Date.now() - start));
    const result = await client.query('SELECT NOW()');
    console.log(label + ' QUERY OK ms=' + (Date.now() - start) + ' now=' + result.rows[0].now);
  } catch (e) {
    console.error(label + ' FAIL ms=' + (Date.now() - start));
    console.error('  CODE:', e.code);
    console.error('  MSG:', e.message);
  } finally {
    await client.end().catch(() => {});
  }
}

(async () => {
  // Test 1: Transaction pooler port 6543 (current DATABASE_URL)
  await test('POOLER_6543', {
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nysrxvpjdlvzvcawysvh',
    password: '8m56JQWMxKag9zCj',
    connectionTimeoutMillis: 8000,
  });

  // Test 2: Session pooler port 5432 (same pooler host)
  await test('SESSION_5432', {
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.nysrxvpjdlvzvcawysvh',
    password: '8m56JQWMxKag9zCj',
    connectionTimeoutMillis: 8000,
  });

  // Test 3: Direct DB host port 5432
  await test('DIRECT_5432', {
    host: 'db.nysrxvpjdlvzvcawysvh.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '8m56JQWMxKag9zCj',
    connectionTimeoutMillis: 8000,
  });
})();
