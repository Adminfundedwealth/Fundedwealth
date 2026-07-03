/**
 * Legacy Vercel Build Script (DEPRECATED)
 * 
 * This file is no longer used. Vercel now builds directly from source.
 * 
 * Build configuration has been moved to vercel.json:
 * - buildCommand: pnpm --filter @workspace/fundedwealth build
 * - outputDirectory: artifacts/fundedwealth/dist
 * 
 * Routing, headers, and redirects are configured in vercel.json.
 */

console.log('⚠️  This build script is deprecated.');
console.log('✓  Vercel now builds directly from source using vercel.json configuration.');
console.log('✓  No manual .vercel/output/static commits required.');
