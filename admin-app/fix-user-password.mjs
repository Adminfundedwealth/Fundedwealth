/**
 * Directly find and update password for propfirmmarket@gmail.com in Supabase Auth
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';

// Read service role key from env or paste here
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const EMAIL = 'propfirmmarket@gmail.com';
const NEW_PASSWORD = 'FW@2026Temp!';

// Find the user
console.log(`Looking up ${EMAIL}...`);

// Search by email using listUsers with filter
let foundUser = null;
let page = 1;
while (true) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error('listUsers error:', error); break; }
  const match = data.users.find(u => u.email === EMAIL);
  if (match) { foundUser = match; break; }
  if (data.users.length < 1000) break;
  page++;
}

if (!foundUser) {
  console.log('User not found in Supabase Auth. Creating...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: NEW_PASSWORD,
    email_confirm: true,
  });
  if (error) console.error('Create failed:', error);
  else console.log(`Created: ${data.user.id} — password set to: ${NEW_PASSWORD}`);
} else {
  console.log(`Found: ${foundUser.id} | confirmed: ${foundUser.email_confirmed_at} | provider: ${foundUser.app_metadata?.provider}`);
  
  const { error } = await supabase.auth.admin.updateUserById(foundUser.id, {
    password: NEW_PASSWORD,
    email_confirm: true,
  });
  
  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log(`\n✅ Password updated successfully`);
    console.log(`Email: ${EMAIL}`);
    console.log(`New Password: ${NEW_PASSWORD}`);
    console.log(`\nUser can now login at fundedwealth.com/sign-in with these credentials.`);
  }
}

process.exit(0);
