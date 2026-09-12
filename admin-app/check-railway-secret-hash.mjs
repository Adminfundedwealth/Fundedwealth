/**
 * Check what hash Railway's current INTERNAL_PROVISION_SECRET produces.
 * We hit a debug endpoint that returns the SHA256 hash (not the secret itself)
 * so we can compare without exposing the secret.
 *
 * Since we can't add a debug endpoint, instead we try ALL known variants
 * including the new one just saved, and also look at what "Unauthorized" could mean.
 */
import { createHash } from 'crypto';

const BASE = 'https://api.fundedwealth.com';

// The new secret we just set on both sides
const NEW = 'fw.bd13f7b2cb6196825c60062bb6a390cb9e9e275dd95964363d3fc61ae09462f5';
// The old one from Vercel screenshot before we changed it
const OLD_VERCEL = 'fw.0e91c4f5d7a6b2c1e3f9a0d7b6c5e4f1234567890abcdef1234567890abcdef';

async function try_secret(secret, label) {
  try {
    const r = await fetch(`${BASE}/api/provisioning/catalog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-provision-secret': secret,
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await r.text();
    console.log(`[${label}] ${r.status}: ${body.slice(0, 150)}`);
    return r.status === 200;
  } catch (e) {
    console.log(`[${label}] ERROR: ${e.message}`);
    return false;
  }
}

console.log('Checking which secret Railway is currently using...\n');

const ok1 = await try_secret(NEW, 'NEW secret (just saved)');
if (ok1) { console.log('\n✅ Railway has the new secret — all good!'); process.exit(0); }

const ok2 = await try_secret(OLD_VERCEL, 'OLD Vercel secret');
if (ok2) {
  console.log('\n⚠️  Railway still has the OLD Vercel secret.');
  console.log('Railway has NOT redeployed with the new INTERNAL_PROVISION_SECRET yet.');
  console.log('Go to Railway → fundedwealth-api → Deployments → Redeploy manually.');
  process.exit(1);
}

console.log('\n❌ Neither secret matched. Railway has a completely different secret.');
console.log('Go to Railway → fundedwealth-api → Variables → reveal INTERNAL_PROVISION_SECRET');
console.log('Copy that value → paste into Vercel admin-app INTERNAL_PROVISION_SECRET → redeploy both.');

process.exit(1);
