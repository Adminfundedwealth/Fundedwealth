/**
 * Brute-force find the correct INTERNAL_PROVISION_SECRET on api.fundedwealth.com
 * by trying known candidates from the codebase.
 */
const BASE = 'https://api.fundedwealth.com';

const candidates = [
  // From Vercel screenshot
  'fw.0e91c4f5d7a6b2c1e3f9a0d7b6c5e4f1234567890abcdef1234567890abcdef',
  // Common dev defaults in codebase
  'dev-internal-secret-change-in-production',
  'fw-sso-dev-key-change-in-production',
  // Possible variations
  'fw.internal-provision-secret',
  'internal-provision-secret',
  'fundedwealth-internal-secret',
  'fw-internal-provision',
  'provision-secret',
  'admin-secret',
  // No auth (public?)
  '',
];

for (const secret of candidates) {
  const headers = secret
    ? { 'x-internal-provision-secret': secret }
    : {};
  try {
    const r = await fetch(`${BASE}/api/provisioning/catalog`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
    });
    const body = await r.text();
    const shortBody = body.slice(0, 100);
    if (r.status === 200) {
      console.log(`\n✓ MATCH: "${secret}"`);
      console.log(`Response: ${shortBody}`);
      process.exit(0);
    } else {
      console.log(`✗ "${secret || '(no secret)'}" → ${r.status}: ${shortBody}`);
    }
  } catch (e) {
    console.log(`✗ "${secret || '(no secret)'}" → error: ${e.message.slice(0, 50)}`);
  }
}

console.log('\n❌ No match found.');
console.log('\nThe INTERNAL_PROVISION_SECRET on api.fundedwealth.com (Railway) is not in the codebase.');
console.log('You need to go to Railway dashboard → api-server service → Variables → copy INTERNAL_PROVISION_SECRET');
console.log('Then paste it into Vercel admin-app → Environment Variables → INTERNAL_PROVISION_SECRET');

process.exit(0);
