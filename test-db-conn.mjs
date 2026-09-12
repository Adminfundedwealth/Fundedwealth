const { Pool } = require('pg');

const urls = [
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  "postgresql://postgres:Supabase%402026@db.nysrxvpjdlvzvcawysvh.supabase.co:5432/postgres"
];

async function test(url, i) {
  const pool = new Pool({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    const r = await pool.query('SELECT 1 as ok');
    console.log(`URL${i+1}: ✅ WORKS`);
  } catch(e) {
    console.log(`URL${i+1}: ❌ ${e.message.split('\n')[0]}`);
  } finally {
    await pool.end();
  }
}

Promise.all(urls.map((u,i) => test(u,i)));
