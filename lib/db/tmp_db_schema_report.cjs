const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:8m56JQWMxKag9zCj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
(async () => {
  await client.connect();
  const tables = ['users', 'auth_methods', 'two_factor_settings', 'sessions', 'login_history'];
  for (const table of tables) {
    const res = await client.query(
      'select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_name=$1 order by ordinal_position',
      [table],
    );
    console.log(`\nTABLE ${table}`);
    console.table(res.rows);
  }
  await client.end();
})();
