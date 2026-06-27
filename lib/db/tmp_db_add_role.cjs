const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:8m56JQWMxKag9zCj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
(async () => {
  await client.connect();
  try {
    await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';`);
    const res = await client.query(`SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position;`);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('failed', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
