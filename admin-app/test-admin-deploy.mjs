// Check if the new admin-app Vercel deploy is live (catalog now embedded locally)
// The GET endpoint returns 401 without auth — that's fine, it means the route exists
// If it returned a different error it would mean the old code is still serving

const r = await fetch('https://admin.fundedwealth.com/api/founder/emergency-provision', {
  signal: AbortSignal.timeout(10000),
}).catch(e => ({ status: 0, text: async () => e.message }));

const body = await r.text().catch(() => '');
console.log(`Status: ${r.status}`);
console.log(`Body: ${body.slice(0, 200)}`);

// 401 = new code deployed (auth check runs after catalog loads)
// 500 with "Failed to load production catalog" = old code still running
if (r.status === 401) {
  console.log('\n✅ New Vercel deploy is LIVE - catalog is embedded locally, auth check passed');
} else if (body.includes('Failed to load production catalog')) {
  console.log('\n⏳ Old code still serving - Vercel deploy not finished yet');
} else {
  console.log('\n? Unexpected response - Vercel may still be deploying');
}
process.exit(0);
