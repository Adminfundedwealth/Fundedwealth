const BASE = 'https://api.fundedwealth.com';
const NEW_SECRET = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';

async function probe(url, headers = {}) {
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
      signal: AbortSignal.timeout(12000),
    });
    const body = await r.text();
    return { status: r.status, body: body.slice(0, 400) };
  } catch (e) {
    return { status: 0, body: e.message };
  }
}

console.log('Waiting for Railway redeploy...\n');

// Poll every 5 seconds for up to 2 minutes
for (let i = 0; i < 24; i++) {
  const r = await probe(`${BASE}/api/provisioning/catalog`, {
    'x-internal-provision-secret': NEW_SECRET,
  });
  const ts = new Date().toISOString().substring(11, 19);
  if (r.status === 200) {
    console.log(`\n[${ts}] ✅ SUCCESS! Catalog loaded:`);
    console.log(r.body);
    process.exit(0);
  } else {
    console.log(`[${ts}] ${r.status} — ${r.body.slice(0, 60)} (retry ${i+1}/24)`);
    await new Promise(res => setTimeout(res, 5000));
  }
}

console.log('\n❌ Railway still not redeployed after 2 minutes.');
console.log('Go to Railway → fundedwealth-api → Deployments → click "Deploy" manually.');
process.exit(1);
