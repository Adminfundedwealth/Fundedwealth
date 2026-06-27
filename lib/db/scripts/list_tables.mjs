import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '..', '..', 'artifacts', 'api-server', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath);
  process.exit(1);
}
const raw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  let value = trimmed.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

if (!env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: env.DATABASE_URL });

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
    const tables = res.rows.map(r => r.table_name);
    console.log('=== public tables ===');
    if (tables.length === 0) {
      console.log('(no tables found)');
    } else {
      console.log(tables.join('\n'));
    }
    console.log('=== count ===', tables.length);
    await client.release();
    await pool.end();
  } catch (err) {
    console.error('Error listing tables:', err.message || err);
    try { await pool.end(); } catch {};
    process.exit(1);
  }
})();
