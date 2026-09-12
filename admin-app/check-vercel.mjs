const r = await fetch('https://admin.fundedwealth.com/api/founder/emergency-provision', {
  signal: AbortSignal.timeout(8000),
}).catch(e => ({ status: 0, text: async () => e.message }));
const body = await r.text().catch(() => '');
console.log(`Status: ${r.status}`);
console.log(`Body: ${body.slice(0, 100)}`);
process.exit(0);
