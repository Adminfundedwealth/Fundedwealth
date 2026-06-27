# Security Audit Validation Report — Playwright Results

**Date:** June 15, 2026  
**Target:** https://www.fundedwealth.com (frontend) + backend API  
**Tool:** Playwright 1.60.0  

---

## CRITICAL FINDING: Backend API Not Deployed

### Discovery Results

| Endpoint | Status | Server |
|----------|--------|--------|
| `https://api.fundedwealth.com/api/health` | 404 | **Vercel** (DNS points to Vercel, not EC2) |
| `https://api.fundedwealth.com/` | 404 | Vercel |
| `https://fundedwealth-api.onrender.com/api/health` | 503 | Render (service suspended/sleeping) |
| `https://www.fundedwealth.com/api/health` | 200 (SPA fallback) | CloudFront → S3 (serves index.html) |

### How the Frontend Resolves API URLs

1. **`src/lib/api.ts`** uses `const API_PREFIX = "/api"` — relative same-origin requests
2. **`src/hooks/usePayment.ts`** uses `import.meta.env.VITE_API_URL` in production → `https://api.fundedwealth.com`
3. **`.env.production`** sets `VITE_API_URL=https://api.fundedwealth.com`

### What the Live Bundle Actually Does

The deployed JS bundle at `https://www.fundedwealth.com/assets/index-Dk6Oo1bH.js`:
- Does NOT contain `api.fundedwealth.com` string
- Does NOT contain any hardcoded API URL
- Only network requests observed: Supabase JS chunk loading, no backend API calls

### Conclusion

**The backend API is not operational.** The frontend is a static SPA on CloudFront with no working backend connection:
- `api.fundedwealth.com` DNS points to Vercel (which has no deployment, returns 404)
- The Render backend (`fundedwealth-api.onrender.com`) is suspended (503)
- CloudFront serves index.html for ALL paths including `/api/*` (SPA fallback)
- The EC2 deployment described in `aws/` has not been activated or DNS has not been updated

All API-level security fixes exist in local code but have no production server to run on.

---

## VERIFIED FIXES (Frontend — via Playwright)

| # | Finding | Status | Evidence |
|---|---------|--------|----------|
| 1 | Secret exposure in client-side code | ✅ **PASS** | All 9 known secrets scanned against page source, localStorage, sessionStorage — none found |
| 2 | Protected route /dashboard redirects | ✅ **PASS** | `/dashboard` → redirects to `/sign-in` |
| 3 | Protected route /admin redirects | ✅ **PASS** | `/admin` → redirects to `/sign-in` |
| 4 | Frontend security headers (HSTS) | ✅ **PASS** | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| 5 | Frontend X-Frame-Options | ✅ **PASS** | `X-Frame-Options: SAMEORIGIN` |
| 6 | Frontend X-Content-Type-Options | ✅ **PASS** | `X-Content-Type-Options: nosniff` |

---

## FAILED VALIDATIONS

| # | Finding | Status | Evidence | Root Cause |
|---|---------|--------|----------|------------|
| 7 | API security headers | ❌ **FAIL** | `X-Content-Type-Options: undefined`, `X-Frame-Options: undefined` | API server returns 404 — not deployed |
| 8 | CORS enforcement | ⚠️ **CANNOT VERIFY** | API returns 404 for all requests | Backend offline |
| 9 | Incidents endpoint auth | ⚠️ **CANNOT VERIFY** | `/api/incidents` returns 404 | Backend offline |
| 10 | Admin routes auth | ⚠️ **CANNOT VERIFY** | All admin routes return 404 | Backend offline |
| 11 | Order ownership check | ⚠️ **CANNOT VERIFY** | `/api/orders/:id` returns 404 | Backend offline |
| 12 | Payment upload MIME validation | ⚠️ **CANNOT VERIFY** | Upload endpoint returns 404 | Backend offline |

---

## WARNINGS

| # | Finding | Status | Evidence |
|---|---------|--------|----------|
| W1 | Frontend CSP header missing | ⚠️ **WARNING** | `Content-Security-Policy: MISSING` from CloudFront response |
| W2 | Frontend Referrer-Policy missing | ⚠️ **WARNING** | `Referrer-Policy: MISSING` from CloudFront response |
| W3 | Frontend X-XSS-Protection missing | ⚠️ **WARNING** | Header not present (CloudFront doesn't add it) |
| W4 | Frontend Permissions-Policy missing | ⚠️ **WARNING** | Header not present from CloudFront |
| W5 | Razorpay preload warning | ⚠️ **WARNING** | Console: "resource checkout-static-next.razorpay.com was preloaded but not used" |

**Note:** The `.htaccess` file contains all these headers, but CloudFront (current deployment) doesn't serve `.htaccess` — those headers only apply to Apache-based hosting. CloudFront needs a **Response Headers Policy** configured in the AWS console.

---

## DETAILED EVIDENCE

### Test: Secret Exposure Scan
```
[Secret Check] MbfUd51SVu...: Not found
[Secret Check] sb_secret_...: Not found
[Secret Check] 8m56JQWMxK...: Not found
[Secret Check] YGQBBPXXZO...: Not found
[Secret Check] sk_test_i0...: Not found
[Secret Check] AIzaSyDRKW...: Not found
[Secret Check] 6NGOJO-GHZ...: Not found
[Secret Check] Rozerpayx@...: Not found
[Secret Check] fw_admin_s...: Not found
[Console Messages] Count: 113
[Console Errors] 1 errors found
  - Razorpay preload resource warning (non-critical)
```

### Test: Auth Redirects
```
[Auth Redirect] /dashboard → https://www.fundedwealth.com/sign-in  ✅
[Admin Access] /admin → https://www.fundedwealth.com/sign-in  ✅
```

### Test: Frontend Security Headers
```
[Headers] X-Frame-Options: SAMEORIGIN  ✅
[Headers] X-Content-Type-Options: nosniff  ✅
[Headers] Strict-Transport-Security: max-age=31536000; includeSubDomains; preload  ✅
[Headers] Referrer-Policy: MISSING  ⚠️
[Headers] Content-Security-Policy: MISSING  ⚠️
[Headers] X-XSS-Protection: MISSING  ⚠️
[Headers] Permissions-Policy: MISSING  ⚠️
```

### Test: API Server Status
```
GET https://api.fundedwealth.com/api/health → 404 Not Found
```
The backend API server is not running. All API-level validations cannot proceed.

---

## SECURITY STATUS

### Frontend: **PASS** (with warnings)
- No secrets exposed ✅
- Auth redirects working ✅
- Core security headers present ✅
- Missing: CSP, Referrer-Policy, Permissions-Policy via CloudFront

### Backend API: **CANNOT ASSESS — SERVER OFFLINE**
- `api.fundedwealth.com` returns 404 on all endpoints
- Security fixes exist in local code but are not deployed
- CORS, ownership, auth, upload fixes require deployment to validate

---

## NEXT STEPS TO ACHIEVE FULL VALIDATION

1. **Deploy the backend** to EC2 and verify `api.fundedwealth.com/api/health` returns 200
2. **Re-run this test suite** after deployment: `npx playwright test --config=e2e/security-validation/playwright.config.ts`
3. **Add CloudFront Response Headers Policy** with CSP, Referrer-Policy, Permissions-Policy, X-XSS-Protection
4. **Rotate all secrets** per `SECURITY_REMEDIATION_PHASE1.md` before going live
