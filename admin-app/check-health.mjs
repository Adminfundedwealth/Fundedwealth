const r = await fetch('https://api.fundedwealth.com/api/health', { signal: AbortSignal.timeout(8000) }).catch(e => ({ status: 0, text: async () => e.message }));
const body = await r.text().catch(() => '');
console.log(`Health: ${r.status} — ${body.slice(0, 200)}`);

const r2 = await fetch('https://api.fundedwealth.com/api/provisioning/catalog', {
  headers: { 'x-internal-provision-secret': 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5' },
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
const body2 = await r2.text().catch(() => '');
console.log(`Catalog: ${r2.status} — ${body2.slice(0, 200)}`);
process.exit(0);
