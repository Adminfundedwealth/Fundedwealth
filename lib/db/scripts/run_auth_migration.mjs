import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, "../../../artifacts/api-server/.env");
if (!fs.existsSync(envPath)) {
  throw new Error(`.env not found at ${envPath}`);
}
const raw = fs.readFileSync(envPath, "utf8");
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
  process.env[key] = process.env[key] ?? value;
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const sql = fs.readFileSync(path.resolve('..', 'migrations', '003_security_auth_rbac_phase1.sql'), 'utf8');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('APPLIED');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ERROR', error.stack || error.message || error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
