# OLD PROJECT AUDIT — FundedWealth

**Audit Date:** June 18, 2026  
**Auditor:** Automated code audit (read-only)  
**Project Path:** `C:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth`

---

## 1. Purpose of Project

FundedWealth is a **prop trading firm platform targeting India**. It allows traders to purchase evaluation challenges (Flash/Instant/1-Step/2-Step plans ranging ₹999–₹37,999), pass simulated trading evaluations, and receive funded trading accounts with a 80/20 profit split.

**Key features:**
- Marketing landing page with aggressive India SEO (react-helmet-async, JSON-LD, hreflang en-IN/hi-IN)
- Simulated trading terminal (TradingView charts + sine-wave simulated prices, NOT connected to real markets)
- User dashboard (accounts, payouts, leaderboard, analytics, KYC)
- Admin panel (traders, payments, risk, KYC, blog CMS)
- Affiliate/referral system (10% commission)
- AI chatbot (Gemini) + AI blog generator
- Championship events, Impact/donation initiative
- i18n (English + Hindi)

**Tech stack:** pnpm monorepo, TypeScript, React (Vite), Express 5, PostgreSQL + Drizzle ORM, Supabase (auth + realtime + DB hosting)

---

## 2. Database Tables Used

The project defines **80+ database tables** via Drizzle ORM in `lib/db/src/schema/`. Major table groups:

### Core Business
| Table | Purpose |
|-------|---------|
| `users` | User profiles (with risk scores, KYC status, payout bank details) |
| `trading_accounts` | Challenge/funded accounts (plan, phase, balance, drawdown, P&L) |
| `orders` | Payment orders (amount, plan, status, UTR reference) |
| `payouts` | Payout records |
| `notifications` | In-app notifications |

### Trading Engine
| Table | Purpose |
|-------|---------|
| `positions`, `executions`, `trading_orders`, `trade_logs` | Trade execution records |
| `challenges`, `challenge-accounts`, `challenge-progress`, `challenge_state` | Challenge lifecycle |
| `breach-events`, `risk-events`, `account-locks` | Rule violation tracking |
| `funded-accounts`, `account-states`, `funding-events` | Funded account management |
| `order_brackets`, `order_modifications`, `position_modifications` | Order management |

### Market Data
| Table | Purpose |
|-------|---------|
| `market_ticks`, `market_ohlc`, `market-snapshots` | Price data |
| `options_contracts`, `options_snapshots`, `expiry_calendar` | Options data |
| `oi_analytics`, `heatmap_data`, `fii_dii_flow`, `market_breadth`, `greeks_cache` | Analytics |
| `economic-events` | Economic calendar |

### Security & Fraud
| Table | Purpose |
|-------|---------|
| `fraud-events`, `risk-profiles`, `behavior-patterns` | Fraud detection |
| `device-history`, `ip-history`, `ip-lookups` | Fingerprinting |
| `velocity-events`, `payment-fingerprints`, `referral-fraud-logs` | Payment fraud |
| `sessions`, `login-history`, `failed-attempts`, `security-incidents` | Auth security |

### KYC & Compliance
| Table | Purpose |
|-------|---------|
| `kyc-submissions`, `kyc-profiles`, `kyc-documents`, `kyc-reviews` | KYC workflow |

### Content & Community
| Table | Purpose |
|-------|---------|
| `blog-posts`, `community-posts`, `community-comments`, `community-likes` | Content |
| `conversations`, `messages` | Messaging |
| `contact-submissions`, `championship-registrations` | Forms |

### Observability
| Table | Purpose |
|-------|---------|
| `api-logs`, `audit-logs`, `system-errors`, `system-incidents` | Monitoring |
| `webhook-logs`, `notification-failures`, `payment-failures` | Error tracking |

---

## 3. Supabase Dependencies

### Frontend (`artifacts/fundedwealth/package.json`)
- `@supabase/supabase-js` ^2.33.0

### Frontend Usage
- **`src/lib/supabase.ts`** — Creates Supabase client using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **`src/contexts/SupabaseAuthContext.tsx`** — All authentication flows (sign in, sign up, Google OAuth, password reset)

### Backend Usage (`artifacts/api-server/src/lib/supabase.ts`)
- Creates admin client using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Used for **realtime broadcast** notifications to users (channels)
- Database access is via **Drizzle ORM** with `DATABASE_URL` (Supabase PostgreSQL connection pooler)

### Supabase Services Consumed
1. **Supabase Auth** — Primary authentication (email/password + Google OAuth via PKCE)
2. **Supabase PostgreSQL** — Database (accessed via Drizzle ORM connection string)
3. **Supabase Realtime** — Broadcasting notifications/payout updates to user channels

### Environment Variables (Supabase)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

---

## 4. Auth Flow

**Provider:** Supabase Auth (migrated from Clerk — code still references "Clerk" in comments/replit.md but actual implementation is Supabase)

### Sign Up
1. User submits email + password (+ name, phone)
2. `supabase.auth.signUp()` with user metadata
3. Email verification required (redirect to `/auth/callback`)
4. On verification: session established, user synced to `users` table via `/api/users/me`

### Sign In
1. Email/password → `supabase.auth.signInWithPassword()`
2. Google OAuth → `supabase.auth.signInWithOAuth({ provider: "google" })` with PKCE flow
3. Post-login: checks `/api/auth/account-status` — force-signs-out suspended/banned users

### Session Management
- Auto-refresh tokens, persisted in browser
- Backend validates JWT from `Authorization: Bearer <token>` header
- `getAuth(req)` middleware extracts userId from Supabase JWT

### Security Layers
- Account suspension/ban enforcement
- FingerprintJS device tracking
- Rate limiting on auth endpoints
- Cloudflare Turnstile CAPTCHA on sensitive actions

---

## 5. Payment Flow

### Payment Methods

#### A) UPI Manual (Primary method)
- User selects plan → checkout → sees QR code
- UPI IDs: `s8257683769651514@slc` and `fundedwealth.payments@hdfcbank`
- User pays externally, enters UTR (10-12 digits) → `POST /api/payments/verify-utr`
- Auto-provisions trading account on successful UTR submission
- 15-minute countdown timer on checkout

#### B) Bank Transfer Manual
- Bank: **Slice Small Finance Bank**
- Account holder: AMAN KUMAR SINGH
- Account No: 033311501069826
- IFSC: NESF0000333
- User submits reference + proof file → `POST /api/payments/manual-bank-transfer`
- Status: `pending_review` → Admin approves/rejects via dashboard

#### C) OxaPay Crypto
- Supports: USDT (TRC20/BEP20/ERC20), BTC, ETH, LTC
- `POST /api/payments/create-crypto-payment` → Redirects to OxaPay hosted checkout
- Webhook: `/api/payments/oxapay-webhook` (HMAC verified)
- Auto-provisions on "Paid" status

#### D) Razorpay (configured, unclear if active)
- ENV vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- RazorpayLogo component exists in checkout UI

#### E) Easebuzz (referenced in docs)
- Card/UPI/Net Banking via redirect
- Success/failure callback endpoints exist

### Fraud Protection on Payments
- IP intelligence (ProxyCheck.io — VPN/proxy/TOR detection)
- FingerprintJS device fingerprinting
- Velocity checks (rate limiting purchases)
- Duplicate UTR detection
- Cloudflare Turnstile CAPTCHA
- MonitoringService, FraudDetectionService, VelocityService imported in payment routes

---

## 6. Trading Related Code

### Simulated Trading Terminal (`/trade` and `/trade/:accountId`)
- **NOT connected to real markets** — prices generated via sine wave + random noise every 1.5s
- Instruments: NIFTY, BANKNIFTY, FINNIFTY, SENSEX, CRUDEOIL
- TradingView Advanced Chart widget (display only, from `s3.tradingview.com/tv.js`)
- Order types: MARKET, LIMIT, STOP with optional SL/TP
- Position management: Open Positions (live P&L, Close/Close All), Pending Orders, Trade History

### Rule Engine
- Max daily loss: 3%
- Max overall drawdown: 6%
- Profit target: 8%
- Max 10 lots per order
- Breach → disables trading + red banner + reset button

### Data Storage
- Per-account state in **localStorage** (`fw-trade-${accountId}`)
- `TradingContext` (React context) keyed by Clerk/Supabase user ID
- Database has extensive trading tables (positions, executions, etc.) but unclear if server-side trading engine is fully wired up

### Market Data Integration (configured but likely not live)
- `DHAN_API_KEY` and `DHAN_WS_URL=wss://ws.dhan.com/stream` in .env.example
- Database tables for market_ticks, market_ohlc, options data exist
- No evidence of live market data flowing into the simulated terminal

### AI Trade Features
- AI Trade Assistant: radial discipline score + insights
- Detects revenge trading, drawdown warnings, win-rate praise
- `ai-trade-insights` and `discipline-scores` DB tables

---

## 7. Can This Project Be Retired?

### Evidence Supporting Retirement

| Signal | Detail |
|--------|--------|
| **Pre-launch state** | Deployment guide is instructional ("follow these steps"), not describing running infra |
| **Simulated trading** | Trading terminal uses localStorage + sine waves, not real market execution |
| **Personal bank details** | UPI ID/bank account belongs to "AMAN KUMAR SINGH" at Slice bank — not a business account |
| **Stub services** | Email notifications are log-only stubs, Google Analytics has placeholder ID |
| **Over-engineered** | 80+ DB tables, fraud detection, load testing — likely AI-scaffolded beyond actual usage |
| **Legacy references** | Code still references Clerk (migrated to Supabase), mixed deployment targets (Replit/Hostinger/Railway/AWS) |
| **No CI evidence** | GitHub workflows exist but unclear if ever successfully run in production |

### Risks Before Retiring

| Risk | Mitigation |
|------|-----------|
| Active users with paid accounts | Check Supabase DB for real user/order records |
| Pending manual payments | Check `orders` table for status=`pending_review` |
| Affiliate commissions owed | Check affiliate referral records |
| Domain/SEO value | Decide if `fundedwealth.com` domain should redirect elsewhere |

### Recommendation

**This project can likely be retired** if:
1. The Supabase database has no real users or paid orders (or only test data)
2. No active domain is pointing to a live deployment
3. No outstanding financial obligations to users

**Before retiring, verify:**
- [ ] Query `users` table count in Supabase
- [ ] Query `orders` table for any `status = 'paid'` or `status = 'pending_review'`
- [ ] Check if `fundedwealth.com` resolves to a live site
- [ ] Confirm no affiliate payouts are outstanding

If all checks come back empty/test-only, this project is safe to archive or delete.

---

*End of audit. No code was modified.*
