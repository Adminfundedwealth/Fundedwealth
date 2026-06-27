import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', 'artifacts', 'api-server', '.env');
const sqlPath = path.resolve(__dirname, 'migrations', '20260520_fix_users_api_logs.sql');

const envContent = fs.readFileSync(envPath, 'utf-8');
const dbLine = envContent.split(/\r?\n/).find((line) => line.trim().startsWith('DATABASE_URL='));
if (!dbLine) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}
const databaseUrl = dbLine.replace(/^DATABASE_URL=\"?/, '').replace(/\"?$/, '');
const sql = fs.readFileSync(sqlPath, 'utf-8');

const pool = new pg.Pool({ connectionString: databaseUrl });

const run = async () => {
  const client = await pool.connect();
  try {
    console.log('Applying migration', sqlPath);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    await client.query('ROLLBACK').catch(() => {});
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();
