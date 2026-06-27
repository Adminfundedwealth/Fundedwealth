const fetch = require('node-fetch');
const fs = require('fs');

async function run() {
  const base = 'http://localhost:8080';
  const report = { tests: [] };

  try {
    const health = await fetch(`${base}/health`).catch(e => ({ status: 0, error: e.message }));
    report.tests.push({ name: 'health', ok: health && health.status >= 200 && health.status < 500, status: health.status || 0 });

    // Register (dummy)
    const register = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test+${Date.now()}@example.com`, password: 'Password123!' })
    }).catch(e => ({ status: 0, error: e.message }));
    report.tests.push({ name: 'register', status: register.status || 0 });

    // Login (will only work if register returned 201 and created a user)
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test+${Date.now()}@example.com`, password: 'Password123!' })
    }).catch(e => ({ status: 0, error: e.message }));
    report.tests.push({ name: 'login', status: login.status || 0 });

  } catch (err) {
    report.error = err.message;
  }

  fs.writeFileSync('./tmp_runtime_verify_report.json', JSON.stringify(report, null, 2));
  console.log('Wrote tmp_runtime_verify_report.json');
}

run();
