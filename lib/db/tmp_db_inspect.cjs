const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:8m56JQWMxKag9zCj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
(async () => {
  await client.connect();
  const res = await client.query(
    `select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_name in ('users','auth_methods','api_logs','system_errors') order by table_name,column_name`
  );
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
})();
