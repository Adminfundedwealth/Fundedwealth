// Test the POST /api/provisioning/emergency endpoint end-to-end
const BASE = 'https://api.fundedwealth.com';
const SECRET = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';

const r = await fetch(`${BASE}/api/provisioning/emergency`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-provision-secret': SECRET,
  },
  body: JSON.stringify({
    planType: 'flash',
    sizeIndex: 0,
    email: 'test-provision-check@fundedwealth.com',
    note: 'admin_test_check',
  }),
  signal: AbortSignal.timeout(15000),
}).catch(e => ({ status: 0, text: async () => e.message }));

const body = await r.text().catch(() => '');
console.log(`POST /api/provisioning/emergency: ${r.status}`);
console.log(`Body: ${body.slice(0, 300)}`);

if (r.status === 200) console.log('\n✅ Provisioning endpoint WORKS');
else if (r.status === 401) console.log('\n❌ Still 401 - secret still not matching');
else if (r.status === 404) console.log('\n❌ User not found - expected for test email, endpoint is working though');
else console.log(`\n⚠ Status ${r.status}`);

process.exit(0);
