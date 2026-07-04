// Create a test account with confirmed email
// Run with: node create-test-account.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY';

// Service role key needed to bypass email confirmation
// If not available, we'll create account and provide manual confirmation instructions
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TEST_EMAIL = 'testuser@fundedwealth.in';
const TEST_PASSWORD = 'TestPassword123!@#';

async function createTestAccount() {
  console.log('Creating test account:', TEST_EMAIL);
  
  if (SUPABASE_SERVICE_ROLE_KEY) {
    // Use service role to create confirmed account
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm email
    });
    
    if (error) {
      console.error('Error creating account:', error.message);
      process.exit(1);
    }
    
    console.log('✓ Test account created with confirmed email');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    
  } else {
    // Use anon key - email will need manual confirmation
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) {
      console.error('Error creating account:', error.message);
      process.exit(1);
    }
    
    console.log('✓ Test account created (email confirmation required)');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('\n⚠ MANUAL STEP REQUIRED:');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Find user:', TEST_EMAIL);
    console.log('3. Click on user → Confirm Email');
    console.log('4. Or check the email inbox for confirmation link');
  }
  
  // Save credentials
  const fs = await import('fs');
  fs.writeFileSync(
    './e2e/test-results/confirmed-test-account.json',
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      createdAt: new Date().toISOString(),
    }, null, 2)
  );
  
  console.log('\n✓ Credentials saved to: ./e2e/test-results/confirmed-test-account.json');
}

createTestAccount().catch(console.error);
