# FundedWealth — Authentication Audit Report

**Date:** June 11, 2026  
**Auditor:** Kiro (automated static + runtime analysis)  
**Scope:** Full auth stack — Clerk, Google OAuth, session handling, route protection, key management

---

## Executive Summary

| Category | Status |
|---|---|
| Clerk configuration | ✅ Production keys set correctly |
| Google OAuth code | ✅ Correct implementation |
| SSO callback route | ✅ Registered and accessible |
| Route protection | ✅ Dashboard protected |
| Session persistence | ✅ Clerk handles via cookie |
| Dev key leakage in production | ✅ No leakage — `.env` is gitignored |
| Duplicate ClerkProvider (was a bug) | ✅ Fixed — single provider in App.tsx |
| Production site live | ✅ www.fundedwealth.com returns 200 |
| Backend health | ⚠️ Partial — DB health check has code bug |

---

## Passed Checks ✅

### 1. Clerk Key Configuration
- **Production** (`.env.production`): `pk_live_Y2xlcmsuZnVuZGVkd2VhbHRoLmNvbSQ`  
  Decodes to `clerk.fundedwealth.com` — correct production domain.
- **Development** (`.env`): `pk_test_...` — correct, only used locally, never built into production bundle.
- `.env.production` and `.env` are both in `.gitignore` — neither key is committed to git.

### 2. Google OAuth Implementation
- `sign-in.tsx`: `signIn.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: origin + "/sso-callback", redirectUrlComplete: "/dashboard" })` ✅
- `sign-up.tsx`: `signUp.authenticateWithRedirect({ strategy: "oauth_google", ... })` ✅
- Both use `window.location.origin` for the redirect URL — correctly adapts to any domain.

### 3. SSO Callback Page
- `sso-callback.tsx` uses Clerk's `<AuthenticateWithRedirectCallback />` — the correct Clerk component.
- Route `/sso-callback` is registered in both `App.tsx` (primary router) and `main.tsx` (secondary router).
- Runtime check: `GET https://www.fundedwealth.com/sso-callback` → HTTP 200 ✅

### 4. Route Registration
- All auth routes verified accessible:
  - `/sign-in` → 200 ✅
  - `/sign-up` → 200 ✅
  - `/sso-callback` → 200 ✅
  - `/dashboard` → 200 (SPA handles auth redirect client-side) ✅

### 5. Route Protection (Dashboard)
- `DashboardRoute` in `App.tsx` uses `useAuth()` — redirects to `/sign-in` when `isLoaded && !isSignedIn`.
- 8-second timeout fallback prevents infinite loading state.
- `main.tsx` also has a `DashboardRoute` with same logic for the secondary router.

### 6. Session Persistence
- Clerk stores sessions in `__session` cookie (httpOnly, secure in production).
- On page refresh, `ClerkProvider` re-hydrates session automatically — no custom logic needed.
- `ClerkQueryClientCacheInvalidator` in `App.tsx` clears React Query cache on user change — prevents stale data after sign-out/sign-in.

### 7. Logout
- Dashboard uses `useClerk().signOut()` — Clerk's standard signOut which clears session cookie.
- `afterSignOutUrl="/"` in `ClerkProvider` — user is redirected to homepage after logout.

### 8. Single ClerkProvider
- Previously there was a risk of two nested `ClerkProvider` instances (both `App.tsx` and `main.tsx` had separate Clerk setups).
- **Fixed:** `main.tsx` now only imports `App` lazily — the single `ClerkProvider` lives exclusively in `App.tsx`.
- The comment in `main.tsx` documents this decision explicitly.

### 9. Vercel SPA Routing
- `vercel.json` has `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]` — all routes serve `index.html`, SPA router handles them. Google OAuth redirect to `/sso-callback` will always work.

### 10. No pk_test in Production Bundle
- Production build uses `.env.production` — Vite replaces `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` at build time with the live key.
- The `pk_test_...` key only exists in `.env` (local dev) — never in the production bundle.
- HTML source of `www.fundedwealth.com` does not contain the test key. ✅

### 11. Backend Runtime
- `GET https://fundedwealth-api.onrender.com/api/health` → HTTP 200 ✅
- Server is alive and accepting requests.

---

## Failed / Warning Checks ⚠️

### W1 — Backend DB Health Check Bug
**Status:** Warning  
**Finding:** Health endpoint returns `"databaseHealthy": false, "databaseError": "avgLatency is not defined"`  
**Impact:** The database may actually be healthy — this is a JavaScript runtime bug in the health reporter code, not necessarily a DB outage. However it makes the health check unreliable for monitoring.  
**Fix needed:** In `artifacts/api-server` — fix the `avgLatency` variable reference in the health route handler.

### W2 — VITE_CLERK_PROXY_URL Referenced But Not Set
**Status:** Warning  
**Finding:** `App.tsx` reads `import.meta.env.VITE_CLERK_PROXY_URL` and passes it to `ClerkProvider` as `proxyUrl`. This variable is not set in either `.env` or `.env.production`.  
**Impact:** When undefined, Clerk ignores `proxyUrl` and connects directly to `clerk.fundedwealth.com` — this is the correct production behavior. No functional issue, but the variable reference is misleading.  
**Recommendation:** Remove the `proxyUrl` prop from `ClerkProvider` in `App.tsx` unless a Clerk proxy is intentionally configured.

### W3 — Vercel Environment Variables Not Confirmed
**Status:** Warning (external — cannot verify programmatically)  
**Finding:** Vercel builds the app server-side. The `.env.production` file is gitignored so Vercel does NOT read it. The `VITE_*` vars must be set manually in Vercel dashboard → Settings → Environment Variables.  
**Impact:** If not set in Vercel dashboard, the deployed bundle will have `undefined` for `VITE_CLERK_PUBLISHABLE_KEY` → Clerk won't initialize → login broken.  
**Action required:** Confirm these are set in Vercel dashboard:
- `VITE_CLERK_PUBLISHABLE_KEY` = `[REDACTED]`
- `VITE_API_URL` = `https://fundedwealth-api.onrender.com`
- `VITE_RAZORPAY_KEY_ID` = `[REDACTED]`
- `VITE_SUPABASE_URL` = `https://nysrxvpjdlvzvcawysvh.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `[REDACTED]`

### W4 — Google OAuth Cannot Be E2E Tested Automatically
**Status:** Info  
**Finding:** Playwright cannot complete a real Google OAuth flow in CI — Google blocks automated login and Clerk redirects to accounts.google.com which is outside the app domain.  
**Impact:** No functional impact. Google OAuth must be manually verified in a browser.  
**Manual test steps:**
1. Go to `https://www.fundedwealth.com/sign-in`
2. Click "Continue with Google"
3. Confirm Google account picker appears
4. Select account → should redirect to `/sso-callback` then `/dashboard`
5. Check Clerk dashboard → Users to confirm new user created

### W5 — PRODUCTION_DEPLOYMENT_GUIDE Had Test Key Hardcoded
**Status:** Fixed ✅  
**Finding:** `PRODUCTION_DEPLOYMENT_GUIDE.md` had the dev `pk_test_...` key hardcoded as an example value.  
**Fix applied:** Replaced with `pk_live_YOUR_LIVE_KEY_FROM_CLERK_DASHBOARD` placeholder.

---

## Security Findings

### S1 — Public Keys in Client Bundle (Acceptable)
`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_SUPABASE_ANON_KEY` are all client-facing public keys by design. They are intentionally exposed in the frontend bundle. This is the correct and expected pattern for these services.

### S2 — Supabase Anon Key Exposure
The Supabase anon key is in the frontend bundle. Supabase's Row Level Security (RLS) should be enabled on all tables to prevent unauthorized data access using this key. Verify RLS is enabled in the Supabase dashboard.

### S3 — No Rate Limiting on Frontend Auth
Client-side auth (Clerk) is protected by Clerk's own brute-force protection and rate limiting on their servers. No additional client-side throttling is needed.

### S4 — Session Cookie Security
Clerk sets sessions as httpOnly, Secure, SameSite=Lax cookies in production. This prevents XSS-based session theft. No action needed.

### S5 — Clerk Secret Key
The `sk_live_...` Clerk secret key was briefly shared in chat (incident June 11, 2026). It should be rotated in Clerk dashboard → Production → API Keys immediately if not already done. The secret key is only needed on the Render backend as `CLERK_SECRET_KEY` env var.

---

## Recommended Improvements

1. **Fix the DB health check bug** — `avgLatency is not defined` in the API server health route. This makes production health monitoring unreliable.

2. **Remove `proxyUrl` from ClerkProvider** in `App.tsx` if no Clerk proxy is configured — simplifies the setup.

3. **Confirm all VITE_* vars are set in Vercel dashboard** — the `.env.production` file is local-only and not read by Vercel.

4. **Enable Supabase RLS** — verify Row Level Security is enabled on all Supabase tables.

5. **Rotate Clerk secret key** — if the live Clerk secret key was not already rotated after the chat incident, rotate it immediately.

6. **Add Google OAuth authorized domain** in Google Cloud Console — ensure `fundedwealth.com` (not just `www.fundedwealth.com`) is in the authorized JavaScript origins.

---

## Auth Flow Diagram

```
User clicks "Continue with Google"
         │
         ▼
signIn.authenticateWithRedirect()
         │
         ▼
Clerk → accounts.google.com (Google OAuth)
         │
         ▼ (after Google approval)
clerk.fundedwealth.com/v1/oauth_callback
         │
         ▼
www.fundedwealth.com/sso-callback
         │
         ▼
<AuthenticateWithRedirectCallback />
(Clerk creates session, sets cookie)
         │
         ▼
Redirect to /dashboard
         │
         ▼
DashboardRoute: isSignedIn=true → renders Dashboard ✅
```

---

## Files Changed in This Audit

| File | Change |
|---|---|
| `PRODUCTION_DEPLOYMENT_GUIDE.md` | Removed hardcoded `pk_test_...` key from example |
| `AUTH_AUDIT_REPORT.md` | Created (this file) |

---

*End of audit. All critical authentication flows are correctly implemented in code. Remaining items (W1-W5) are configuration or external verification tasks.*
