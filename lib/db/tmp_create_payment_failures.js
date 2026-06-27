import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', 'artifacts', 'api-server', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbLine = envContent.split(/\r?\n/).find((line) => line.trim().startsWith('DATABASE_URL='));
if (!dbLine) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}
const databaseUrl = dbLine.replace(/^DATABASE_URL="?/, '').replace(/"?$/, '');

const sql = `
CREATE TABLE IF NOT EXISTS payment_failures (
  id serial PRIMARY KEY,
  payment_id text,
  user_id integer,
  payment_method text,
  provider text,
  status text NOT NULL DEFAULT 'FAILED',
  failure_reason text,
  amount numeric(12,2),
  currency text NOT NULL DEFAULT 'INR',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_failures_user_id_idx ON payment_failures(user_id);
CREATE INDEX IF NOT EXISTS payment_failures_status_idx ON payment_failures(status);
CREATE INDEX IF NOT EXISTS payment_failures_provider_idx ON payment_failures(provider);
CREATE INDEX IF NOT EXISTS payment_failures_created_at_idx ON payment_failures(created_at);
`;

const pool = new pg.Pool({ connectionString: databaseUrl });

(async () => {
  const client = await pool.connect();
  try {
    console.log('Applying SQL to create payment_failures...');
    await client.query(sql);
    console.log('payment_failures table ensured.');
  } catch (err) {
    console.error('Error applying SQL:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
