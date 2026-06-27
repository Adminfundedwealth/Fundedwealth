# FundedWealth — API Routing Audit

**Date:** 2026-06-15  
**Method:** Production bundle inspection + network trace + hosting analysis

---

## Evidence

### 1. Production API Base URL (from built bundle)

**File:** `https://www.fundedwealth.com/assets/api-CoHTITaf.js`

```javascript
const n="/api";
async function r(e,t){
  const o = await fetch(`${n}${e}`, {...t, credentials:"include", ...});
  ...
}
```

**Conclusion:** Frontend uses **relative `/api` prefix**. All requests go to `https://www.fundedwealth.com/api/*` (same origin).

---

### 2. Network Trace from /trade page (Playwright evidence from earlier run)

| Request | URL | Status | Content-Type |
|---|---|---|---|
| GET | `https://www.fundedwealth.com/api/positions` | 200 | `text/html` |
| GET | `https://www.fundedwealth.com/api/orders` | 200 | `text/html` |
| WS | `wss://www.fundedwealth.com/ws/market` | opened then closed | N/A |

**Note:** Both `/api/positions` and `/api/orders` returned `text/html` (the SPA index.html). This means the request hit the `.htaccess` SPA rewrite and returned the frontend, NOT the API.

---

### 3. Direct HTTP Verification

```
GET https://www.fundedwealth.com/api/positions
→ Status: 200
→ Content-Type: text/html; charset=utf-8
→ Body: <!DOCTYPE html><html lang="en-IN">...
```

This confirms `/api/*` is NOT being proxied to any backend.

---

### 4. Hosting Architecture

**Frontend:** Deployed to **Hostinger** via FTP (FTPS) to `/public_html/`  
**Source:** `.github/workflows/hostinger-deploy.yml`  
**Static hosting:** Apache with `.htaccess` SPA rewrite  
**Backend:** `fundedwealth-api.onrender.com` (Render Web Service)

---

### 5. The `.htaccess` Rewrite (the bug)

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**This catches ALL non-file routes** including `/api/*` and `/ws/*`, rewriting them to `index.html`. There is no exception for API routes.

---

## Answers

### A. Is frontend calling `fundedwealth-api.onrender.com`?
**NO.** The production bundle uses relative `/api` (same-origin). It does NOT have the Render URL baked in.

### B. Is frontend calling another backend URL?
**NO.** It calls `https://www.fundedwealth.com/api/*` which resolves to the same Hostinger server hosting the static files.

### C. Is there a proxy/rewrite?
**NO proxy exists.** The `.htaccess` rewrites `/api/*` to `index.html` (the SPA fallback). There is no `ProxyPass` or reverse proxy to the Render backend.

### D. Is WebSocket served by backend or frontend?
**Neither effectively.** `wss://www.fundedwealth.com/ws/market` connects (Hostinger may allow WS upgrade on some plans) but the backend process isn't there to handle it, so it immediately closes.

---

## How Did Payments Work Previously?

Based on your evidence that Razorpay/UTR endpoints worked before, there are two possibilities:

1. **The frontend was previously deployed with `VITE_API_URL` set to the Render backend URL** — so `usePayment.ts` called `https://fundedwealth-api.onrender.com/api/...` directly (cross-origin). My earlier fix changed it to use relative paths for the Vite dev proxy, which works locally but broke production.

2. **Hostinger previously had a reverse proxy configured** (via cPanel or a different `.htaccess`) that forwarded `/api/*` to Render.

---

## The Fix

### Option A: Restore `VITE_API_URL` in the production build (recommended — fastest)

Set `VITE_API_URL=https://fundedwealth-api.onrender.com` as an environment variable during the **frontend build** (in the GitHub Action or Hostinger build step).

Then update `src/lib/api.ts` and `src/hooks/usePayment.ts` to use `VITE_API_URL` in production:

```typescript
// api.ts
const API_PREFIX = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "/api";
```

### Option B: Add reverse proxy to `.htaccess` (if Hostinger supports mod_proxy)

```apache
# Proxy /api/ and /ws/ to Render backend
RewriteCond %{REQUEST_URI} ^/api/ [OR]
RewriteCond %{REQUEST_URI} ^/ws/
RewriteRule ^(.*)$ https://fundedwealth-api.onrender.com/$1 [P,L]

# SPA fallback (only for non-API, non-file routes)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/ws/
RewriteRule . /index.html [L]
```

**Note:** `mod_proxy` may not be available on shared Hostinger plans.

### Option C: Move frontend to Vercel (already configured)

Vercel's `vercel.json` has rewrite rules and can proxy `/api/*` to the Render backend via rewrites:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://fundedwealth-api.onrender.com/api/:path*" },
    { "source": "/ws/:path*", "destination": "https://fundedwealth-api.onrender.com/ws/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Why Previous Payments Worked

The `usePayment.ts` file previously used:
```typescript
const apiBase = import.meta.env.VITE_API_URL || "";
// → "https://fundedwealth-api.onrender.com"
fetch(`${apiBase}/api/razorpay/create-order`, ...)
```

After my optimization fix, it now uses:
```typescript
function getApiBase() {
  if (import.meta.env.DEV) return "";
  return import.meta.env.VITE_API_URL || "";
}
```

But the production `.env.production` sets `VITE_API_URL=https://fundedwealth-api.onrender.com`. If the build picks this up, it should still work. The issue is that `api.ts` (the general API module) uses hardcoded `/api` without the full URL.

---

## Summary

| Component | Status |
|---|---|
| Frontend hosting | Hostinger (static, no proxy) |
| Backend hosting | Render (`fundedwealth-api.onrender.com`) |
| API routing in `api.ts` | ❌ Relative `/api` — hits Hostinger, returns HTML |
| API routing in `usePayment.ts` | ✅ Uses `VITE_API_URL` (Render URL) — payments work |
| WebSocket routing | ❌ `wss://www.fundedwealth.com/ws/market` — no backend there |

**Payments work** because `usePayment.ts` uses the full Render URL.  
**Trading terminal doesn't work** because `api.ts` and the WebSocket use relative paths that hit Hostinger.

---

*Fix: Update `src/lib/api.ts` and `src/lib/market-data-service.ts` to use `VITE_API_URL` in production.*
