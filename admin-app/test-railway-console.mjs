// Test exactly what the running container sees
const BASE = 'https://api.fundedwealth.com';
const SECRET = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';

// Try different paths to see what's blocking
const tests = [
  ['GET', '/api/provisioning/catalog', null],
  ['GET', '/api/provisioning/status', null],
  ['GET', '/api/health', null],
  ['GET', '/', null],
];

for (const [method, path, body] of tests) {
  try {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-provision-secret': SECRET,
      },
      signal: AbortSignal.timeout(6000),
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${BASE}${path}`, opts);
    const text = await r.text();
    console.log(`${method} ${path}: ${r.status} — ${text.slice(0, 100)}`);
  } catch (e) {
    console.log(`${method} ${path}: TIMEOUT/ERROR — ${e.message}`);
  }
}
process.exit(0);
