import fs from 'fs';
import path from 'path';
import pg from 'pg';

const migrationPath = path.resolve('./migrations/20260518_terminal_tables.sql');
if (!fs.existsSync(migrationPath)) {
  console.error('Migration file not found:', migrationPath);
  process.exit(1);
}
const sql = fs.readFileSync(migrationPath, 'utf8');

// load .env from artifacts/api-server
const envPath = path.resolve('../../artifacts/api-server/.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath);
  process.exit(1);
}
const raw = fs.readFileSync(envPath,'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
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
    console.log('Applying migration file:', migrationPath);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch {}
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
