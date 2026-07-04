// Direct auth test - inspect actual Supabase response
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY';

const credentials = JSON.parse(fs.readFileSync('./e2e/test-results/test-account.json', 'utf-8'));

console.log('Testing authentication for:', credentials.email);
console.log('User ID:', credentials.userId);
console.log('Created at:', credentials.createdAt);
console.log('\n--- Attempting Login ---\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase.auth.signInWithPassword({
  email: credentials.email,
  password: credentials.password,
});

console.log('=== AUTH RESPONSE ===\n');

if (error) {
  console.log('❌ ERROR OCCURRED');
  console.log('\nError Code:', error.code);
  console.log('Error Name:', error.name);
  console.log('Error Message:', error.message);
  console.log('HTTP Status:', error.status);
  console.log('\nFull Error Object:');
  console.log(JSON.stringify(error, null, 2));
  
  if (error.message.includes('Email not confirmed')) {
    console.log('\n🚫 BLOCKER: Email not confirmed');
    console.log('\nACTION REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/nysrxvpjdlvzvcawysvh/auth/users');
    console.log('2. Find user:', credentials.email);
    console.log('3. Click user row → Click "Confirm Email" button');
    console.log('4. Re-run this script to verify');
  } else if (error.message.includes('Invalid')) {
    console.log('\n🚫 BLOCKER: Invalid credentials');
    console.log('Password may be incorrect or user may not exist');
  } else {
    console.log('\n🚫 BLOCKER: Unknown auth error');
  }
  
  process.exit(1);
}

console.log('✅ SUCCESS');
console.log('\nSession Data:');
console.log('- Access Token:', data.session?.access_token ? `${data.session.access_token.substring(0, 30)}...` : 'null');
console.log('- Refresh Token:', data.session?.refresh_token ? `${data.session.refresh_token.substring(0, 30)}...` : 'null');
console.log('- Expires At:', data.session?.expires_at);
console.log('\nUser Data:');
console.log('- User ID:', data.user?.id);
console.log('- Email:', data.user?.email);
console.log('- Email Confirmed At:', data.user?.email_confirmed_at);
console.log('- Last Sign In:', data.user?.last_sign_in_at);

console.log('\n✓✓✓ Authentication successful - can proceed with Playwright tests');
