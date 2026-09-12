// Test all known candidate secrets against the currently running Railway container
const BASE = 'https://api.fundedwealth.com';

const candidates = [
  'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5',
  'fw.0e91c4f5d7a6b2c1e3f9a0d7b6c5e4f1234567890abcdef1234567890abcdef',
  'dev-internal-secret-change-in-production',
  'fw-sso-dev-key-change-in-production',
];

for (const secret of candidates) {
  const r = await fetch(`${BASE}/api/provisioning/catalog`, {
    headers: { 'x-internal-provision-secret': secret },
    signal: AbortSignal.timeout(8000),
  }).catch(e => ({ status: 0, text: async () => e.message }));
  const body = await r.text().catch(() => '');
  const label = secret.slice(0, 20) + '...';
  if (r.status === 200) {
    console.log(`✅ MATCH: "${secret}"`);
    console.log(`Body: ${body.slice(0, 100)}`);
    process.exit(0);
  } else {
    console.log(`✗ [${label}] → ${r.status}`);
  }
}

// Try POST /api/provisioning/emergency with the new secret to see exact error
console.log('\nTrying POST emergency with new secret...');
const r2 = await fetch(`${BASE}/api/provisioning/emergency`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-provision-secret': 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5',
  },
  body: JSON.stringify({ planType: 'flash', sizeIndex: 0, email: 'test@test.com' }),
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
const body2 = await r2.text().catch(() => '');
console.log(`POST emergency: ${r2.status} — ${body2.slice(0, 150)}`);

process.exit(0);
