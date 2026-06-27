# Phase 2 Environment Configuration

---

## Frontend Variables (build-time, Vite)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk auth (frontend) | `pk_live_xxxxx` |
| `VITE_API_URL` | ✅ Yes | Backend API base URL | `https://api.fundedwealth.in` |
| `VITE_API_BASE_URL` | ✅ Yes | Same as above (legacy) | `https://api.fundedwealth.in` |
| `VITE_API_TIMEOUT` | Optional | API request timeout (ms) | `30000` |
| `VITE_SUPABASE_URL` | Optional | Screenshot uploads | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase auth | `eyJxxx` |
| `VITE_CLERK_PROXY_URL` | Optional | Custom Clerk proxy | — |

---

## Backend Variables (runtime, Express API server)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk backend verification | `sk_live_xxxxx` |
| `PORT` | ✅ Yes | Server listen port | `9000` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `OXAPAY_API_KEY` | Optional | Crypto payment gateway | — |
| `OXAPAY_MERCHANT_ID` | Optional | OxaPay merchant | — |
| `EASEBUZZ_KEY` | Optional | Easebuzz payment key | — |
| `EASEBUZZ_SALT` | Optional | Easebuzz verification salt | — |
| `EASEBUZZ_ENV` | Optional | `test` or `prod` | `prod` |

---

## Database

| Item | Value |
|------|-------|
| Engine | PostgreSQL 15+ |
| ORM | Drizzle ORM |
| Schema path | `lib/db/src/schema/` |
| Migration command | `npx drizzle-kit push` |
| Required tables | ~25 (users, trading_accounts, challenge_accounts, positions, trading_orders, trade_logs, breach_events, challenge_progress, payout_eligibility, funded_accounts, account_states, etc.) |

---

## Recommended Hosting

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| Frontend | Hostinger (static) | Vercel, Netlify |
| Backend API | Railway | Render, Fly.io, VPS |
| Database | Neon PostgreSQL | Supabase, Railway Postgres |
| Auth | Clerk (SaaS) | — |
| Payments | Easebuzz + OxaPay | — |

---

## Minimum to get Phase 2 running:

1. `DATABASE_URL` — provision PostgreSQL (Neon free tier works)
2. `CLERK_SECRET_KEY` — from Clerk dashboard
3. `PORT=9000` — for the Express server
4. Run `npx drizzle-kit push` to create tables
5. Start server: `node dist/index.js` (after `tsc` build)
