// Test if routing through fundedwealth.com (Vercel proxy) works
// This is how it worked before - fundedwealth.com rewrites /api/* to Railway

const SECRET = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';

// Test 1: Direct to api.fundedwealth.com
const r1 = await fetch('https://api.fundedwealth.com/api/provisioning/emergency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-internal-provision-secret': SECRET },
  body: JSON.stringify({ planType: 'flash', sizeIndex: 0, email: 'test@test.com' }),
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
console.log(`Direct api.fundedwealth.com: ${r1.status} — ${(await r1.text()).slice(0, 100)}`);

// Test 2: Via fundedwealth.com Vercel proxy (old working path)
const r2 = await fetch('https://www.fundedwealth.com/api/provisioning/emergency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-internal-provision-secret': SECRET },
  body: JSON.stringify({ planType: 'flash', sizeIndex: 0, email: 'test@test.com' }),
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
console.log(`Via fundedwealth.com proxy: ${r2.status} — ${(await r2.text()).slice(0, 100)}`);

// Test 3: Check fundedwealth.com vercel.json rewrite target
const r3 = await fetch('https://www.fundedwealth.com/api/health', {
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
console.log(`fundedwealth.com/api/health: ${r3.status} — ${(await r3.text()).slice(0, 100)}`);

process.exit(0);
