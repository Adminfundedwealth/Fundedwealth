const https = require('https');

const API_BASE = 'fundedwealth-api-production.up.railway.app';

function testEndpoint(name, method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: API_BASE,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': body.length } : {})
      }
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`${method} ${path}`);
    if (data) console.log('Data:', JSON.stringify(data, null, 2));

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', responseBody);
        resolve({ status: res.statusCode, body: responseBody });
      });
    });

    req.on('error', (e) => {
      console.error('Error:', e.message);
      reject(e);
    });

    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('FUNDEDWEALTH PAYMENT SYSTEM - PRODUCTION API TESTS');
  console.log('='.repeat(60));

  // Test 1: Razorpay Create Order (with correct amount)
  await testEndpoint(
    'Razorpay - Create Order',
    'POST',
    '/api/razorpay/create-order',
    {
      amount: 1999,
      payment_type: 'challenge',
      planType: 'flash',
      sizeIndex: 0,
      billing: { email: 'test@example.com', firstName: 'Test', lastName: 'User' }
    }
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: OxaPay - Create Crypto Payment (already confirmed working)
  await testEndpoint(
    'OxaPay - Create Crypto Payment',
    'POST',
    '/api/payments/create-crypto-payment',
    {
      paymentMethod: 'oxapay-usdt-trc20',
      planType: 'flash',
      sizeIndex: 0,
      billing: { email: 'test-crypto@example.com', firstName: 'Test', lastName: 'Crypto' },
      password: 'Test@1234'
    }
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: UPI Manual - Verify UTR (with correct pricing)
  await testEndpoint(
    'UPI - Verify UTR (correct amount)',
    'POST',
    '/api/payments/verify-utr',
    {
      utr: '999988887777',  // Fake UTR for testing
      amount: 1999,  // Correct amount for flash plan sizeIndex 0
      planType: 'flash',
      sizeIndex: 0,
      billing: { email: 'test-upi@example.com', firstName: 'Test', lastName: 'UPI' }
    }
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Check Razorpay Webhook Endpoint Exists
  await testEndpoint(
    'Razorpay - Webhook Endpoint (without signature - expect 403)',
    'POST',
    '/api/razorpay/webhook',
    { test: 'data' }
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 5: Check OxaPay Webhook Endpoint Exists
  await testEndpoint(
    'OxaPay - Webhook Endpoint (without HMAC - expect 403)',
    'POST',
    '/api/payments/oxapay-webhook',
    { trackId: 'test123', status: 'Paid' }
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log('ALL TESTS COMPLETED');
  console.log('='.repeat(60));
}

runTests().catch(console.error);
