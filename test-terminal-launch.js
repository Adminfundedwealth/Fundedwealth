const https = require('https');

async function testTerminalLaunch() {
  console.log('Step 1: Getting auth token from Supabase...');
  
  try {
    const signInData = JSON.stringify({
      email: 'testuser@fundedwealth.in',
      password: 'Test@1234'
    });

    const signInResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'yysxblmzwyqqtvpkufxz.supabase.co',
        path: '/auth/v1/token?grant_type=password',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': signInData.length,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5c3hibG16d3lxcXR2cGt1ZnhaIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzAxMTAsImV4cCI6MTc2MzYwNjExMH0.EQiZdWvVV3HuqQ0xq88JgY56K7Yw8bHzKDRWzn3F5QE'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          status: res.statusCode,
          data: JSON.parse(data)
        }));
      });
      req.on('error', reject);
      req.write(signInData);
      req.end();
    });

    if (signInResponse.status !== 200 || !signInResponse.data.access_token) {
      console.error('Auth failed:', signInResponse);
      return;
    }

    console.log('✓ Got auth token');

    const token = signInResponse.data.access_token;
    console.log('Step 2: Testing terminal-launch endpoint...');

    const launchData = JSON.stringify({ accountId: 'test-id' });
    const launchResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'fundedwealth-api-production.up.railway.app',
        path: '/api/terminal-launch',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': launchData.length,
          'Authorization': 'Bearer ' + token,
          'Origin': 'https://www.fundedwealth.com'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          data: body
        }));
      });
      req.on('error', reject);
      req.write(launchData);
      req.end();
    });

    console.log('\n=== Terminal Launch Response ===');
    console.log('Status:', launchResponse.status);
    console.log('Headers:', JSON.stringify(launchResponse.headers, null, 2));
    console.log('Body:', launchResponse.data);

    if (launchResponse.status === 200) {
      const responseData = JSON.parse(launchResponse.data);
      console.log('\n✓ SUCCESS! Launch URL:', responseData.launchUrl);
    } else if (launchResponse.status === 400) {
      console.log('\n✗ Validation Error (400)');
    } else if (launchResponse.status === 401) {
      console.log('\n✗ Unauthorized (401) - Auth token was rejected');
    } else {
      console.log('\n✗ Unexpected status:', launchResponse.status);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

testTerminalLaunch();
