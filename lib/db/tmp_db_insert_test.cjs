const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.nysrxvpjdlvzvcawysvh:8m56JQWMxKag9zCj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
(async () => {
  await client.connect();
  const email = `tmp-insert-${Date.now()}@example.com`;
  try {
    const res = await client.query(
      `insert into users (email, clerk_id, first_name, last_name, "role") values ($1, $2, $3, $4, 'user') returning id`,
      [email, `temp_${Date.now()}`, 'Test', 'User'],
    );
    console.log('inserted', res.rows[0]);
  } catch (err) {
    console.error('insert failed', err);
  } finally {
    await client.end();
  }
})();
