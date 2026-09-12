/**
 * Admin Password Reset Script
 * Resets a Supabase Auth user's password directly via the service-role Admin API.
 * Does NOT send any email or use the password reset flow.
 *
 * Usage: node reset-user-password.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env manually (no dotenv dependency needed) ─────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
// Find .env by walking up from script location — prefer root-level .env with real secrets
let envPath = resolve(__dirname, '.env');
const searchDirs = [__dirname, resolve(__dirname, '../..'), resolve(__dirname, '../../..')];
for (const dir of searchDirs) {
  const candidate = resolve(dir, '.env');
  try {
    const raw = readFileSync(candidate, 'utf8');
    // Only accept this file if it has a non-empty SUPABASE_SERVICE_ROLE_KEY
    if (/^SUPABASE_SERVICE_ROLE_KEY=.+/m.test(raw)) {
      envPath = candidate;
      break;
    }
  } catch { /* try next */ }
}
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = envVars['SUPABASE_URL'];
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const SUPABASE_ANON_KEY = envVars['SUPABASE_ANON_KEY'] || envVars['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET_EMAIL = 'priyampatel1703@gmail.com';

// Generate a secure temporary password: 16 chars, mixed case + digits + symbols
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^';
  const bytes = randomBytes(16);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

const tempPassword = generateTempPassword();

// ── Clients ───────────────────────────────────────────────────────────────────
// Admin client (service role — bypasses RLS, can manage users)
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client for verifying login works
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('──────────────────────────────────────────────');
  console.log('  FundedWealth — Admin Password Reset Tool');
  console.log('──────────────────────────────────────────────');
  console.log(`Target email : ${TARGET_EMAIL}`);
  console.log('');

  // ── Step 1: Look up user by email ─────────────────────────────────────────
  console.log('Step 1/3  Looking up user in Supabase Auth...');
  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) {
    console.error('❌  Could not list users:', listError.message);
    process.exit(1);
  }

  const user = listData.users.find(u => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());
  if (!user) {
    console.error(`❌  No Supabase Auth user found for email: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log(`  ✅  Found user  ID: ${user.id}`);
  console.log(`       Email        : ${user.email}`);
  console.log(`       Created      : ${user.created_at}`);
  console.log(`       Last sign in : ${user.last_sign_in_at || 'never'}`);
  console.log('');

  // ── Step 2: Update password via Admin API ─────────────────────────────────
  console.log('Step 2/3  Updating password via Admin API (no email sent)...');
  const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
    user.id,
    { password: tempPassword }
  );

  if (updateError) {
    console.error('❌  Password update failed:', updateError.message);
    process.exit(1);
  }

  console.log(`  ✅  Password updated successfully for user ID: ${updateData.user?.id}`);
  console.log('');

  // ── Step 3: Verify login works with new password ──────────────────────────
  console.log('Step 3/3  Verifying login with new password...');
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: TARGET_EMAIL,
    password: tempPassword,
  });

  if (signInError) {
    console.error('❌  Login verification failed:', signInError.message);
    console.error('    The password was updated but sign-in check did not pass.');
    console.error(`    Possible cause: ${signInError.status} — ${signInError.code}`);
    process.exit(1);
  }

  console.log(`  ✅  Login verified!  Session token issued.`);
  console.log(`       User ID     : ${signInData.user?.id}`);
  console.log(`       Email       : ${signInData.user?.email}`);
  console.log('');

  // Sign out the test session so we don't leave a dangling session
  await anonClient.auth.signOut();

  // ── Result ────────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════');
  console.log('  ✅  ALL STEPS PASSED');
  console.log('══════════════════════════════════════════════');
  console.log(`  Email             : ${TARGET_EMAIL}`);
  console.log(`  Temporary password: ${tempPassword}`);
  console.log('');
  console.log('  ⚠️  Share this password securely and ask the');
  console.log('      user to change it immediately after login.');
  console.log('══════════════════════════════════════════════');
}

main().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
