// The Railway container has a secret we need to find.
// Test if the currently DEPLOYED Railway container (fd7b13fa - Active)
// has the secret we set - by checking if the new Dockerfile deploy picked it up.

// The Dockerfile deploy (fd7b13fa) was built AFTER we set the new secret in Railway Variables.
// Railway injects Variables into the container at runtime, not build time.
// So the running container SHOULD have the new secret.

// But our tests show 401. Let me check if there's a config issue with how
// the secret is read in the code.

const BASE = 'https://api.fundedwealth.com';
const NEW_SECRET = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';

// Try the catalog endpoint (GET) - same allowInternalOrAdmin middleware
const r = await fetch(`${BASE}/api/provisioning/catalog`, {
  headers: { 'x-internal-provision-secret': NEW_SECRET },
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
const body = await r.text().catch(() => '');
console.log(`GET /api/provisioning/catalog: ${r.status}`);
console.log(`Body: ${body.slice(0, 200)}`);

// Also try with Authorization header as Bearer token (maybe requireAdminAuth accepts it)
const r2 = await fetch(`${BASE}/api/provisioning/catalog`, {
  headers: {
    'Authorization': `Bearer ${NEW_SECRET}`,
    'x-internal-provision-secret': NEW_SECRET,
  },
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
console.log(`\nWith Authorization header too: ${r2.status}`);

// Try health check to confirm the server is responding
const r3 = await fetch(`${BASE}/api/health`, {
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
const b3 = await r3.text().catch(() => '');
console.log(`\nGET /api/health: ${r3.status} — ${b3.slice(0, 80)}`);

process.exit(0);
