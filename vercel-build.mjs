/**
 * Vercel Build Script
 * Since the monorepo build requires all workspace deps,
 * we pre-build locally and commit the output.
 * This script just writes the routing config.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

// If dist already exists (prebuilt), just write config
const staticDir = '.vercel/output/static';
if (!existsSync(staticDir)) {
    console.error('ERROR: .vercel/output/static not found. Run local build first.');
    process.exit(1);
}

// Write routing config with /trade redirect
const config = {
    version: 3,
    routes: [
        { src: "^/trade$", status: 308, headers: { "Location": "https://terminal.fundedwealth.com" } },
        { src: "^/trade/(.*)$", status: 308, headers: { "Location": "https://terminal.fundedwealth.com" } },
        { src: "^/register$", status: 308, headers: { "Location": "/sign-up" } },
        { src: "/assets/(.*)", headers: { "Cache-Control": "public, max-age=31536000, immutable" }, continue: true },
        { src: "/(.*)", headers: { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "SAMEORIGIN", "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" }, continue: true },
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index.html" }
    ],
    overrides: {}
};
writeFileSync('.vercel/output/config.json', JSON.stringify(config, null, 2));
console.log('✓ config.json written with /trade redirect');
console.log('Done!');
