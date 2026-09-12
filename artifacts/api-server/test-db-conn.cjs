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
    connectionTimeoutMillis: 6000
  });
  try {
    const r = await pool.query('SELECT 1 as ok');
    console.log(`URL${i+1}: WORKS -> ${url}`);
  } catch(e) {
    console.log(`URL${i+1}: FAIL -> ${e.message.split('\n')[0]}`);
  } finally {
    await pool.end().catch(()=>{});
  }
}

(async () => {
  for (let i = 0; i < urls.length; i++) {
    await test(urls[i], i);
  }
})();
