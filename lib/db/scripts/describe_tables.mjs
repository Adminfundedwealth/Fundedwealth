import fs from 'fs';
import path from 'path';
import pg from 'pg';

const envPath = path.resolve('../../artifacts/api-server/.env');
const raw = fs.readFileSync(envPath,'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('='); if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  let value = trimmed.slice(idx+1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1,-1);
  env[key] = value;
}
if (!env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
(async () => {
  const client = await pool.connect();
  try {
    for (const t of ['orders','trading_accounts','payouts','trading_orders']) {
      const res = await client.query("select column_name, data_type, udt_name from information_schema.columns where table_name=$1 order by ordinal_position", [t]);
      console.log('\n== table', t, '==');
      console.table(res.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
})();
