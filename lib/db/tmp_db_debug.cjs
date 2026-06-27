const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:8m56JQWMxKag9zCj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
(async () => {
  await client.connect();
  const res1 = await client.query(`select current_schema(), current_schemas(true), current_setting('search_path')`);
  console.log('SCHEMA INFO', JSON.stringify(res1.rows, null, 2));
  const res2 = await client.query(`select table_schema,table_name,column_name,data_type from information_schema.columns where table_name='users' and table_schema not in ('information_schema','pg_catalog') order by table_schema,ordinal_position`);
  console.log('USERS TABLES', JSON.stringify(res2.rows, null, 2));
  const res3 = await client.query(`select table_schema,table_name,column_name,data_type from information_schema.columns where table_name='users' and column_name='role' order by table_schema,table_name`);
  console.log('ROLE COLUMNS', JSON.stringify(res3.rows, null, 2));
  try {
    const res4 = await client.query(`select * from users limit 0`);
    console.log('SELECT USERS OK', res4.fields.map((f) => f.name));
  } catch (err) {
    console.error('select users failed', err.message);
  }
  try {
    const res5 = await client.query(`explain insert into users (email, clerk_id, first_name, last_name, role) values ('x','y','a','b','user')`);
    console.log('EXPLAIN OK', JSON.stringify(res5.rows, null, 2));
  } catch (err) {
    console.error('explain insert failed', err.message);
  }
  await client.end();
})();
