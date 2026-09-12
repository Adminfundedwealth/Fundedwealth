// Test if api.fundedwealth.com/api/provisioning/catalog works with the internal secret
const BASE = 'https://api.fundedwealth.com';

async function probe(url, headers = {}) {
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
      signal: AbortSignal.timeout(10000),
    });
    const body = await r.text();
    return { status: r.status, body: body.slice(0, 200), ct: r.headers.get('content-type') };
  } catch (e) {
    return { status: 0, body: e.message.slice(0, 100) };
  }
}

// Test the catalog endpoint with no auth
let r = await probe(`${BASE}/api/provisioning/catalog`);
console.log(`No auth: ${r.status} ${r.body.slice(0, 100)}`);

// Test with dev secret
r = await probe(`${BASE}/api/provisioning/catalog`, { 'x-internal-provision-secret': 'dev-internal-secret-change-in-production' });
console.log(`Dev secret: ${r.status} ${r.body.slice(0, 100)}`);

// Just health check
r = await probe(`${BASE}/api/health`);
console.log(`Health: ${r.status} ${r.body.slice(0, 100)}`);

r = await probe(`${BASE}/health`);
console.log(`Root health: ${r.status} ${r.body.slice(0, 100)}`);

process.exit(0);
