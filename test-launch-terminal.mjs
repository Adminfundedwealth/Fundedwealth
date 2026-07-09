#!/usr/bin/env node

import crypto from 'crypto';

const API_BASE = 'http://127.0.0.1:9010/api';

async function testLaunchTerminal() {
  console.log('🔍 Testing Launch Terminal Flow\n');
  console.log('=================================\n');

  // Test data
  const accountId = 'test-account-123';
  const clerkId = 'user_test_123';
  const testToken = 'Bearer test-token-invalid';

  // STEP 1: Test if API is responding
  console.log('STEP 1: API Connectivity');
  try {
    const pingRes = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, planType: '1step', sizeIndex: 0 })
    });
    console.log(`✓ API responding: HTTP ${pingRes.status}`);
  } catch (e) {
    console.error(`✗ API not responding: ${e.message}`);
    process.exit(1);
  }

  // STEP 2: Test POST /api/terminal-launch WITHOUT authentication
  console.log('\nSTEP 2: POST /api/terminal-launch (no auth)');
  try {
    const res = await fetch(`${API_BASE}/terminal-launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });

    const data = await res.json();
    console.log(`HTTP ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    if (res.status === 200) {
      console.log('✓ Request accepted');
      if (data.launchUrl) {
        console.log(`✓ launchUrl returned: ${data.launchUrl.substring(0, 80)}...`);
      } else {
        console.log('✗ No launchUrl in response');
      }
    } else if (res.status === 400) {
      console.log(`✗ Bad request: ${data.message}`);
    } else if (res.status === 401) {
      console.log(`✗ Authentication required: ${data.message}`);
    }
  } catch (e) {
    console.error(`✗ Request failed: ${e.message}`);
  }

  // STEP 3: Test POST /api/terminal-launch WITH invalid token
  console.log('\nSTEP 3: POST /api/terminal-launch (invalid token)');
  try {
    const res = await fetch(`${API_BASE}/terminal-launch`, {
      method: 'POST',
      headers: {
        'Authorization': testToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accountId })
    });

    const data = await res.json();
    console.log(`HTTP ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    if (res.status === 200) {
      console.log('✓ Request accepted with invalid token (dev mode?)');
      if (data.launchUrl) {
        console.log(`✓ launchUrl returned: ${data.launchUrl.substring(0, 80)}...`);
      }
    } else if (res.status === 401) {
      console.log(`✗ Authentication required even with token`);
    }
  } catch (e) {
    console.error(`✗ Request failed: ${e.message}`);
  }

  // STEP 4: Check the handler code
  console.log('\nSTEP 4: Handler Analysis');
  console.log('File: artifacts/api-server/src/routes/terminal-launch.ts');
  console.log('Function: handleTerminalLaunch');
  console.log('\nExpected flow:');
  console.log('1. Extract accountId from request body');
  console.log('2. Validate authentication (getAuth middleware)');
  console.log('3. Query trading_accounts table for ownership');
  console.log('4. Generate SSO token with HMAC-SHA256');
  console.log('5. Build launch URL with embedded token');
  console.log('6. Return { success: true, launchUrl }');

  // STEP 5: Check what window.open() would do
  console.log('\nSTEP 5: Window.open() Simulation');
  console.log('Frontend code location: artifacts/fundedwealth/src/components/LaunchTerminal.tsx');
  console.log('Expected behavior:');
  console.log('  const response = await fetch("/api/terminal-launch", {...})');
  console.log('  const { launchUrl } = await response.json()');
  console.log('  window.open(launchUrl, "_blank")');
}

testLaunchTerminal();
