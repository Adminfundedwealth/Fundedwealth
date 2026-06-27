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
    console.log('\n=== AUTH TABLES VERIFICATION ===\n');
    
    // Check auth_sessions
    const sessions = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'auth_sessions'
    `);
    console.log('auth_sessions exists:', sessions.rows.length > 0);
    if (sessions.rows.length > 0) {
      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'auth_sessions'
        ORDER BY ordinal_position
      `);
      console.log('  Columns:', cols.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));
    }

    // Check auth_storage
    const storage = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'auth_storage'
    `);
    console.log('auth_storage exists:', storage.rows.length > 0);
    if (storage.rows.length > 0) {
      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'auth_storage'
        ORDER BY ordinal_position
      `);
      console.log('  Columns:', cols.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));
    }

    // Check roles table
    const roles = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'roles'
    `);
    console.log('roles exists:', roles.rows.length > 0);
    if (roles.rows.length > 0) {
      const roleData = await client.query(`SELECT id, name, description FROM roles LIMIT 5`);
      console.log('  Sample roles:', roleData.rows);
    }

    // Check user_roles table
    const userRoles = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_roles'
    `);
    console.log('user_roles exists:', userRoles.rows.length > 0);

    // Check role_permissions table
    const rolePerms = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'role_permissions'
    `);
    console.log('role_permissions exists:', rolePerms.rows.length > 0);

    // Check login_history table
    const loginHist = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'login_history'
    `);
    console.log('login_history exists:', loginHist.rows.length > 0);
    if (loginHist.rows.length > 0) {
      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'login_history'
        ORDER BY ordinal_position
      `);
      console.log('  Columns:', cols.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));
    }

    // Check brute_force_attempts table
    const bruteForce = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'brute_force_attempts'
    `);
    console.log('brute_force_attempts exists:', bruteForce.rows.length > 0);

    console.log('\n=== RBAC INITIALIZATION CHECK ===\n');
    
    // Check default roles
    const defaultRoles = await client.query(`
      SELECT COUNT(*), array_agg(name) as names FROM roles
    `);
    console.log('Total roles:', defaultRoles.rows[0].count);
    console.log('Role names:', defaultRoles.rows[0].names);

    // Check role permissions
    const perms = await client.query(`
      SELECT COUNT(*) FROM role_permissions
    `);
    console.log('Total role permissions:', perms.rows[0].count);

    // Check indexes
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename IN ('auth_sessions', 'login_history', 'brute_force_attempts')
      ORDER BY tablename, indexname
    `);
    console.log('\nAuth-related indexes created:', indexes.rows.length);
    console.log(indexes.rows.map(r => r.indexname).join('\n'));

    console.log('\n✅ Auth/RBAC migration verification complete\n');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
