import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, "../../../artifacts/api-server/.env");

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

(async () => {
  const client = await pool.connect();
  try {
    console.log('\n=== ALL PUBLIC TABLES ===\n');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`Total tables: ${tables.rows.length}`);
    tables.rows.forEach(r => console.log('  -', r.table_name));

    console.log('\n=== AUTH-RELATED TABLES ===\n');
    const authTables = ['sessions', 'auth_methods', 'permissions', 'login_history', 
                        'failed_attempts', 'security_incidents', 'rate_limit_violations',
                        'webhook_logs', 'two_factor_settings', 'otp_codes', 'roles', 
                        'user_roles', 'role_permissions'];
    
    for (const tbl of authTables) {
      const result = await client.query(`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tbl]);
      const exists = result.rows[0].count > 0 ? '✓' : '✗';
      console.log(`${exists} ${tbl}`);
    }

    console.log('\n=== PERMISSIONS TABLE CONTENTS ===\n');
    const perms = await client.query(`SELECT COUNT(*) FROM permissions`);
    console.log(`Total permissions: ${perms.rows[0].count}`);
    
    const samplePerms = await client.query(`
      SELECT DISTINCT role FROM permissions ORDER BY role
    `);
    console.log('Roles in permissions table:', samplePerms.rows.map(r => r.role).join(', '));

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
