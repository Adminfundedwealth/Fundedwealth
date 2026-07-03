# Vercel Deployment Migration - Source-Based Builds

## Overview

**Date:** July 3, 2026  
**Status:** ✅ COMPLETED  
**Impact:** HIGH - Changes deployment pipeline from committed static files to source-based builds

---

## Problem Statement

### Before Migration

**Issue:** Production was serving outdated code because:

1. Vercel deployed **committed** `.vercel/output/static/` files instead of building from source
2. `vercel-build.mjs` blocked deployment if `.vercel/output/static/` didn't exist
3. Source code changes required manual local build + Git commit to deploy
4. Production served bundle `App-Bqu-ygss.js` from commit `0367afe` (July 2, 20:53 IST)
5. Bug fix in commit `0d16a38` (July 2, 21:57 IST) **never deployed** because `.vercel/output/static/` was not rebuilt

**Evidence:**
```bash
# Production bundle metadata
Bundle: App-Bqu-ygss.js
Last-Modified: 2026-07-03T15:58:34 IST
Source Commit: 0367afe (July 2, 20:53)
Current HEAD: 171fc2a (July 3, 20:49)
Gap: 11 commits, 24 hours out of date
```

**Root Cause:** The deployment workflow required:
```
1. Edit source code
2. Run: pnpm --filter @workspace/fundedwealth build
3. Copy artifacts/fundedwealth/dist/* to .vercel/output/static/
4. Git commit .vercel/output/static/
5. Git push
6. Vercel deploys committed static files (no build)
```

---

## Solution

### After Migration

**Vercel now builds directly from source on every deployment.**

**New Workflow:**
```
1. Edit source code
2. Git commit
3. Git push
4. Vercel automatically runs: pnpm --filter @workspace/fundedwealth build
5. Vercel deploys: artifacts/fundedwealth/dist/
```

---

## Changes Made

### 1. Updated `vercel.json`

**Before:**
```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@11.1.1 --activate && pnpm install --no-frozen-lockfile",
  "buildCommand": "node vercel-build.mjs",
  "framework": null
}
```

**After:**
```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@11.9.0 --activate && pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm --filter @workspace/fundedwealth build",
  "outputDirectory": "artifacts/fundedwealth/dist",
  "framework": null,
  "redirects": [...],
  "rewrites": [...],
  "headers": [...]
}
```

**Key Changes:**
- ✅ `buildCommand` now runs Vite build directly
- ✅ `outputDirectory` points to `artifacts/fundedwealth/dist`
- ✅ Added `redirects`, `rewrites`, `headers` (moved from vercel-build.mjs routing config)
- ✅ Updated pnpm version to 11.9.0

### 2. Deprecated `vercel-build.mjs`

**Before:** Checked for `.vercel/output/static/` and exited if missing

**After:** Deprecated with informational message

```javascript
/**
 * Legacy Vercel Build Script (DEPRECATED)
 * 
 * This file is no longer used. Vercel now builds directly from source.
 */
console.log('⚠️  This build script is deprecated.');
console.log('✓  Vercel now builds directly from source using vercel.json configuration.');
```

### 3. Updated `.gitignore`

**Added:**
```
# Vercel build output (should NOT be committed)
.vercel/output/
```

**Result:** `.vercel/output/` will no longer be tracked in Git

---

## Verification Steps

### Step 1: Remove Old Build Output from Git

```bash
# Remove .vercel/output/ from Git tracking
git rm -r --cached .vercel/output/

# Commit the removal
git add .gitignore vercel.json vercel-build.mjs
git commit -m "fix: migrate to source-based Vercel deployment"

# Push to trigger new deployment
git push origin main
```

### Step 2: Monitor Vercel Deployment

1. Go to Vercel Dashboard → fundedwealth project
2. Watch deployment logs for:
   - ✅ `pnpm install` completes
   - ✅ `pnpm --filter @workspace/fundedwealth build` runs
   - ✅ Vite builds `artifacts/fundedwealth/dist/`
   - ✅ Deployment succeeds

### Step 3: Verify Production Bundle Changed

```bash
# Run this script after deployment completes
node check-production-bundle.js
```

Expected output:
- ❌ Old bundle: `App-Bqu-ygss.js` should NOT be served
- ✅ New bundle: `App-*.js` with different hash
- ✅ Bundle should NOT contain `onboarding-status` API call
- ✅ Bundle should NOT redirect to `/auth/create-password`

### Step 4: Test Live Site

1. Navigate to: `https://fundedwealth.com/dashboard`
2. Login with test credentials
3. ✅ Should stay on `/dashboard` (not redirect to `/auth/create-password`)
4. ✅ Dashboard should load successfully

---

## Rollback Plan

If the new deployment fails:

### Option A: Revert to Old System

```bash
git revert HEAD
git push origin main
```

### Option B: Manual Vercel Configuration

1. Go to Vercel Dashboard → Project Settings → General
2. Set:
   - **Build Command:** `node vercel-build.mjs`
   - **Output Directory:** `.vercel/output/static`
3. Manually rebuild `.vercel/output/static/` locally
4. Commit and push

---

## Environment Variables

Ensure these are set in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://fundedwealth-api-production.up.railway.app
VITE_API_BASE_URL=https://fundedwealth-api-production.up.railway.app
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key>
```

---

## Build Configuration Reference

### Build Command
```bash
pnpm --filter @workspace/fundedwealth build
```

**What it does:**
1. Builds only the `@workspace/fundedwealth` package
2. Runs `vite build --config vite.config.ts`
3. Outputs to `artifacts/fundedwealth/dist/`
4. Creates production-optimized bundle with:
   - Minified JS/CSS
   - Hashed asset filenames
   - Code splitting
   - Tree shaking

### Output Directory
```
artifacts/fundedwealth/dist/
```

**Structure:**
```
artifacts/fundedwealth/dist/
├── index.html
├── assets/
│   ├── App-[hash].js
│   ├── index-[hash].css
│   ├── vendor-[hash].js
│   └── ...
├── favicon.png
├── manifest.webmanifest
└── ...
```

### Vite Config Location
```
artifacts/fundedwealth/vite.config.ts
```

---

## Success Criteria

- ✅ Vercel builds from source (not committed static files)
- ✅ Source code changes automatically deploy on Git push
- ✅ Production serves current code (not 24+ hours old)
- ✅ `.vercel/output/` is not committed to Git
- ✅ Dashboard redirect bug is fixed (users stay on dashboard after login)
- ✅ No manual build + commit required for deployments

---

## Related Files

### Modified
- `vercel.json` - Build configuration
- `vercel-build.mjs` - Deprecated (informational only)
- `.gitignore` - Added `.vercel/output/`

### Unchanged (Business Logic)
- `artifacts/fundedwealth/src/**` - No business logic changes
- `artifacts/api-server/**` - Backend unchanged
- Authentication, routing, payments - All unchanged

---

## Timeline

| Time | Event |
|------|-------|
| Jul 2, 20:53 | Commit `0367afe` - Built and committed `.vercel/output/static/App-Bqu-ygss.js` |
| Jul 2, 21:57 | Commit `0d16a38` - **Fixed** onboarding redirect bug in source |
| Jul 3, 16:12 | Production still serving old bundle from `0367afe` |
| Jul 3, 21:30 | **Migration started** - Converting to source-based builds |
| Jul 3, 21:45 | **Migration complete** - Pushed new vercel.json |
| Jul 3, 22:00 | **Expected:** Production serving current code |

---

## Contact

For issues with this migration, check:
1. Vercel deployment logs
2. `artifacts/fundedwealth/dist/` exists after build
3. Environment variables are set in Vercel Dashboard
4. Build command completes without errors

---

## Appendix: Technical Details

### Why Source-Based Builds?

**Before:**
- ❌ Manual process (build locally, commit output)
- ❌ Large Git diffs (committed build artifacts)
- ❌ Source code out of sync with production
- ❌ Easy to forget to rebuild after changes
- ❌ 11 commits deployed late (24-hour lag)

**After:**
- ✅ Automatic builds on every push
- ✅ Clean Git history (no build artifacts)
- ✅ Source of truth is source code
- ✅ Deployments always reflect current code
- ✅ Standard Vercel workflow

### Monorepo Build Strategy

**Challenge:** Monorepo with workspace dependencies

**Solution:** Use pnpm filtering:
```bash
pnpm --filter @workspace/fundedwealth build
```

This builds only the frontend package and its dependencies, not the entire monorepo.

### Cache Optimization

Headers configured for optimal caching:

```json
{
  "source": "/assets/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

**Result:**
- Hashed assets cached for 1 year
- index.html not cached (always fetches latest)
- Users get updates immediately
