// Test catalog endpoint with the real production secret from Vercel
const BASE = 'https://api.fundedwealth.com';
const SECRET = 'fw.0e91c4f5d7a6b2c1e3f9a0d7b6c5e4f1234567890abcdef1234567890abcdef';

async function probe(url, headers = {}) {
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
      signal: AbortSignal.timeout(10000),
    });
    const body = await r.text();
    return { status: r.status, body: body.slice(0, 300), ct: r.headers.get('content-type') };
  } catch (e) {
    return { status: 0, body: e.message.slice(0, 100) };
  }
}

console.log('Testing with real production secret...\n');

// Test catalog with real secret
let r = await probe(`${BASE}/api/provisioning/catalog`, {
  'x-internal-provision-secret': SECRET,
});
console.log(`Catalog with real secret: ${r.status}`);
console.log(`Body: ${r.body}\n`);

// Also try the old Railway URL to confirm it's dead
r = await probe('https://fundedwealth-api-production.up.railway.app/api/provisioning/catalog', {
  'x-internal-provision-secret': SECRET,
});
console.log(`Old Railway URL: ${r.status} ${r.body.slice(0, 80)}`);

process.exit(0);
