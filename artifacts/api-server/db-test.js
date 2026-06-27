const { Client } = require('pg');
(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    const start = Date.now();
    await client.connect();
    console.log('CONNECT OK', Date.now() - start);
    const result = await client.query('SELECT NOW()');
    console.log('QUERY OK', result.rows);
  } catch (e) {
    console.error('DB FAIL');
    console.error(e.code);
    console.error(e.message);
  } finally {
    await client.end().catch(() => {});
  }
})();
