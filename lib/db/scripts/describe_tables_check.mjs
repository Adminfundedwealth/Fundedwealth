import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '../../../artifacts/api-server/.env');
const raw = fs.readFileSync(envPath, 'utf8');
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  let value = trimmed.slice(idx+1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = process.env[key] ?? value;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    async function cols(table) {
      const r = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [table]);
      console.log(`\n${table} columns:`);
      if (r.rows.length === 0) console.log('  (table not found)');
      for (const row of r.rows) console.log(` - ${row.column_name}: ${row.data_type}`);
    }
    await cols('auth_methods');
    await cols('api_logs');
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
