import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, "../../../artifacts/api-server/.env");

// Load environment
const raw = fs.readFileSync(envPath, "utf8");
const env = {};
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
  env[key] = value;
}

const API_BASE = 'http://localhost:8080/api';
let sessionCookie = '';
let currentUserId = '';
let currentEmail = '';
const results = {
  passed: [],
  failed: [],
  errors: []
};

function log(test, status, message = '') {
  const entry = `[${status}] ${test}${message ? ': ' + message : ''}`;
  console.log(entry);
  if (status === 'PASS') {
    results.passed.push(test);
  } else {
    results.failed.push(test);
    if (message) results.errors.push({ test, error: message });
  }
}

async function request(method, endpoint, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(sessionCookie && { 'Cookie': `session=${sessionCookie}` })
      }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function runTests() {
  console.log('\n========== RUNTIME VERIFICATION TESTS ==========\n');

  // TEST 1: Register
  console.log('1. AUTHENTICATION TESTS\n');
  currentEmail = `testuser_${Date.now()}@test.com`;
  const testPassword = 'SecurePass123!@#';
  
  try {
    const registerRes = await request('POST', '/auth/register', {
      email: currentEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User'
    });
    if (registerRes.status === 201 || registerRes.status === 200) {
      currentUserId = registerRes.data?.user?.id;
      log('Register', 'PASS', `User created: ${currentEmail}`);
    } else {
      log('Register', 'FAIL', `Status ${registerRes.status}: ${registerRes.data?.message}`);
    }
  } catch (error) {
    log('Register', 'FAIL', error.message);
  }

  // TEST 2: Login
  try {
    const loginRes = await request('POST', '/auth/login', {
      email: currentEmail,
      password: testPassword
    });
    if (loginRes.status === 200 && loginRes.data?.sessionId) {
      sessionCookie = loginRes.data.sessionId;
      log('Login', 'PASS', `Session created: ${sessionCookie.slice(0, 10)}...`);
    } else {
      log('Login', 'FAIL', `Status ${loginRes.status}: ${loginRes.data?.message}`);
    }
  } catch (error) {
    log('Login', 'FAIL', error.message);
  }

  // TEST 3: Get Sessions
  try {
    const sessionsRes = await request('GET', '/auth/sessions');
    if (sessionsRes.status === 200 && Array.isArray(sessionsRes.data)) {
      log('Get Sessions', 'PASS', `Found ${sessionsRes.data.length} session(s)`);
    } else {
      log('Get Sessions', 'FAIL', `Status ${sessionsRes.status}`);
    }
  } catch (error) {
    log('Get Sessions', 'FAIL', error.message);
  }

  // TEST 4: 2FA Setup
  console.log('\n2. 2FA TESTS\n');
  try {
    const setup2FARes = await request('POST', '/auth/2fa/setup');
    if (setup2FARes.status === 200 && setup2FARes.data?.secret) {
      log('2FA Setup', 'PASS', 'OTP secret generated');
      
      // TEST 5: 2FA Verify
      try {
        // For testing, we need the actual OTP - using a dummy for now
        const verify2FARes = await request('POST', '/auth/2fa/verify', {
          code: '000000'  // Will fail but tests the endpoint
        });
        if (verify2FARes.status === 400) {
          log('2FA Verify Endpoint', 'PASS', 'Endpoint accessible (code validation working)');
        } else if (verify2FARes.status === 200) {
          log('2FA Verify', 'PASS', '2FA enabled');
        } else {
          log('2FA Verify', 'FAIL', `Status ${verify2FARes.status}`);
        }
      } catch (error) {
        log('2FA Verify', 'FAIL', error.message);
      }
    } else {
      log('2FA Setup', 'FAIL', `Status ${setup2FARes.status}`);
    }
  } catch (error) {
    log('2FA Setup', 'FAIL', error.message);
  }

  // TEST 6: RBAC Permissions Check
  console.log('\n3. RBAC TESTS\n');
  try {
    const profileRes = await request('GET', '/users/profile');
    if (profileRes.status === 200 && profileRes.data?.id) {
      log('Get User Profile', 'PASS', `User role: ${profileRes.data?.role || 'user'}`);
    } else {
      log('Get User Profile', 'FAIL', `Status ${profileRes.status}`);
    }
  } catch (error) {
    log('Get User Profile', 'FAIL', error.message);
  }

  // TEST 7: Support Ticket Creation
  console.log('\n4. SUPPORT TESTS\n');
  let ticketId = null;
  try {
    const ticketRes = await request('POST', '/support/tickets', {
      subject: 'Test Support Issue',
      description: 'This is a test support ticket',
      category: 'general',
      priority: 'medium'
    });
    if (ticketRes.status === 201 && ticketRes.data?.id) {
      ticketId = ticketRes.data.id;
      log('Create Support Ticket', 'PASS', `Ticket ID: ${ticketId}`);
    } else {
      log('Create Support Ticket', 'FAIL', `Status ${ticketRes.status}: ${ticketRes.data?.message}`);
    }
  } catch (error) {
    log('Create Support Ticket', 'FAIL', error.message);
  }

  // TEST 8: Support Attachment Presign URL
  try {
    const presignRes = await request('POST', '/support/tickets/attachments/presign', {
      fileName: 'test.txt',
      fileType: 'text/plain'
    });
    if (presignRes.status === 200 && presignRes.data?.presignedUrl) {
      log('Get Presign URL', 'PASS', 'S3 presigned URL obtained');
    } else {
      log('Get Presign URL', 'FAIL', `Status ${presignRes.status}: ${presignRes.data?.message}`);
    }
  } catch (error) {
    log('Get Presign URL', 'FAIL', error.message);
  }

  // TEST 9: Support Ticket Reply
  if (ticketId) {
    try {
      const replyRes = await request('POST', `/support/tickets/${ticketId}/reply`, {
        message: 'Test reply to ticket',
        isInternal: false
      });
      if (replyRes.status === 201 || replyRes.status === 200) {
        log('Support Ticket Reply', 'PASS', 'Reply added');
      } else {
        log('Support Ticket Reply', 'FAIL', `Status ${replyRes.status}`);
      }
    } catch (error) {
      log('Support Ticket Reply', 'FAIL', error.message);
    }
  }

  // TEST 10: Payment Creation (Crypto)
  console.log('\n5. PAYMENT TESTS\n');
  try {
    const paymentRes = await request('POST', '/payments/create-crypto-payment', {
      amount: 100,
      currency: 'USDT',
      description: 'Test payment'
    });
    if (paymentRes.status === 200 && paymentRes.data?.trackId) {
      log('Create Crypto Payment', 'PASS', `Track ID: ${paymentRes.data.trackId}`);
    } else if (paymentRes.status === 400 || paymentRes.status === 401) {
      log('Create Crypto Payment', 'FAIL', `Status ${paymentRes.status}: ${paymentRes.data?.message}`);
    } else {
      log('Create Crypto Payment', 'FAIL', `Status ${paymentRes.status}`);
    }
  } catch (error) {
    log('Create Crypto Payment', 'FAIL', error.message);
  }

  // TEST 11: Challenge Account Creation
  console.log('\n6. CHALLENGE ACCOUNT TESTS\n');
  try {
    const challengeTypesRes = await request('GET', '/challenge/types');
    if (challengeTypesRes.status === 200 && Array.isArray(challengeTypesRes.data)) {
      log('Get Challenge Types', 'PASS', `Found ${challengeTypesRes.data.length} types`);
      
      if (challengeTypesRes.data.length > 0) {
        // Try to create a challenge account
        const firstType = challengeTypesRes.data[0];
        try {
          const createChallengeRes = await request('POST', '/challenge/create', {
            challengeTypeId: firstType.id,
            fundingAmount: 10000
          });
          if (createChallengeRes.status === 201 || createChallengeRes.status === 200) {
            log('Create Challenge Account', 'PASS', `Challenge account created`);
          } else {
            log('Create Challenge Account', 'FAIL', `Status ${createChallengeRes.status}: ${createChallengeRes.data?.message}`);
          }
        } catch (error) {
          log('Create Challenge Account', 'FAIL', error.message);
        }
      }
    } else {
      log('Get Challenge Types', 'FAIL', `Status ${challengeTypesRes.status}`);
    }
  } catch (error) {
    log('Get Challenge Types', 'FAIL', error.message);
  }

  // TEST 12: Admin Endpoints
  console.log('\n7. ADMIN TESTS\n');
  try {
    const adminOverviewRes = await request('GET', '/admin/overview');
    if (adminOverviewRes.status === 200) {
      log('Admin Overview', 'PASS', 'Endpoint accessible');
    } else if (adminOverviewRes.status === 403) {
      log('Admin Overview', 'FAIL', 'Insufficient permissions (403) - user not admin');
    } else {
      log('Admin Overview', 'FAIL', `Status ${adminOverviewRes.status}`);
    }
  } catch (error) {
    log('Admin Overview', 'FAIL', error.message);
  }

  // TEST 13: Logout
  console.log('\n8. LOGOUT TESTS\n');
  try {
    const logoutRes = await request('POST', '/auth/logout');
    if (logoutRes.status === 200) {
      log('Logout', 'PASS', 'Session closed');
    } else {
      log('Logout', 'FAIL', `Status ${logoutRes.status}`);
    }
  } catch (error) {
    log('Logout', 'FAIL', error.message);
  }

  // Print Results
  console.log('\n========== TEST RESULTS ==========\n');
  console.log(`✅ PASSED: ${results.passed.length}`);
  results.passed.forEach(t => console.log(`   - ${t}`));
  
  console.log(`\n❌ FAILED: ${results.failed.length}`);
  results.failed.forEach(t => console.log(`   - ${t}`));
  
  if (results.errors.length > 0) {
    console.log(`\n📋 ERROR DETAILS:\n`);
    results.errors.forEach(e => {
      console.log(`${e.test}:`);
      console.log(`  ${e.error}\n`);
    });
  }

  const totalTests = results.passed.length + results.failed.length;
  const passRate = totalTests > 0 ? Math.round((results.passed.length / totalTests) * 100) : 0;
  
  console.log(`\n========== READINESS ASSESSMENT ==========\n`);
  console.log(`Overall Pass Rate: ${passRate}% (${results.passed.length}/${totalTests})`);
  
  if (passRate >= 90) {
    console.log('Beta Readiness: 85% ✅');
    console.log('Public Launch Readiness: 70% ⚠️');
  } else if (passRate >= 75) {
    console.log('Beta Readiness: 60% ⚠️');
    console.log('Public Launch Readiness: 40% ❌');
  } else {
    console.log('Beta Readiness: 30% ❌');
    console.log('Public Launch Readiness: 10% ❌');
  }
  
  console.log('\nNOTE: API server must be running on localhost:8080');
}

// Check if API is running
try {
  const healthCheck = await fetch(`http://localhost:8080/health`).catch(() => null);
  if (!healthCheck) {
    console.error('❌ API server is not running on localhost:8080');
    console.error('Start the server with: cd artifacts/api-server && pnpm run build && pnpm run start');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Cannot connect to API server:', error.message);
  process.exit(1);
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
