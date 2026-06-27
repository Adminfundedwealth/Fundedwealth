# Workspace

## Overview

pnpm workspace monorepo using TypeScript. FundedWealth — India's #1 Prop Trading Firm landing page + dashboard.

**Mobile responsiveness pass (390px viewport):**
- Hero h1 (`home.tsx` L726): `text-[22px] [@media(min-width:420px)]:text-[26px] sm:text-5xl ...`, each title in own `<span className="block">` so long gradient line ("90% of Your Profits.") wraps to its own line on mobile.
- Championship hero (`championship.tsx` L107): `text-[26px] [@media(min-width:420px)]:text-3xl sm:text-5xl ...` + `break-words` so "Champions." doesn't clip.
- Leaderboard Hall of Fame cards (`leaderboard.tsx` L79-86): `p-3 sm:p-5`, name `text-xs sm:text-sm truncate`, value `text-sm sm:text-lg break-words`. Trader table uses `grid-cols-[40px_1fr_90px]` and `px-3 sm:px-6`.
- Trade terminal header (`trade.tsx` L594-618): full 4-stat strip is `hidden sm:flex`; mobile-only compact Equity + Day P&L block with `truncate`. Chart toolbar (L677) shows `symMeta.sym` only (no full label) on mobile, smaller padding/gaps, `overflow-hidden` on row.
- Tailwind has no `xs` breakpoint by default — use arbitrary `[@media(min-width:420px)]:` for sub-sm targeting.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (Google OAuth + email) — `@clerk/react` on client, `@clerk/express` on server
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## FundedWealth App (`artifacts/fundedwealth`)

- **Landing page**: Hero, Stats, Championship, Guarantee, Plans (Flash/Instant/1-Step/2-Step), FW Impact Initiative, Live Payouts, Terminal Mockup, Advantages, WhyChoose, Calculator, Education, FAQ, Affiliate, Mobile App CTA, Contact
- **Auth**: Clerk-powered `/sign-in` and `/sign-up` routes with Google OAuth + email
- **Checkout** at `/checkout`: 3-step flow. Step 3 redesigned as premium SharkFunded-style 2-column layout — left sidebar (logo, "VERIFIED MERCHANT" badge, amount, security features, order ref) + right panel with 3 category cards (UPI / Card / Crypto). UPI: 15-min countdown, QR via api.qrserver.com (upi://pay intent), copy buttons (UPI ID `fundedwealth.payments@hdfcbank` + amount), supported app pills (GPay/PhonePe/Paytm/BHIM), UTR input (10-12 digit) → `POST /api/payments/verify-utr` (auth-required, returns 202 pending — manual verification model). Card → Easebuzz redirect. Crypto → OxaPay redirect with sub-method selector.
- **Protected dashboard** at `/dashboard`: Home (with Trading Platform section: LIVE badge + "Launch Trading Terminal" CTA → `/trade/:accountId` for active accounts or `/trade` demo, login credentials, quick-start guide), Accounts (with 3-bar progress tracker: Profit Target, Trading Days, Drawdown), Payouts (stats grid + funded trader certificate download), Leaderboard, Analytics, KYC Verification, Affiliate (referral tracking, conversion rate, recent referrals, earnings chart), Settings (profile, appearance/dark-light toggle, language selector, notifications), Impact
- **KYC Verification**: Form-based (documentType/documentNumber/fullName/dateOfBirth/address) → `POST /api/kyc/submit`, status via `GET /api/kyc/status`
- **Notifications**: Bell icon with dropdown in dashboard header, polls `/api/notifications` every 30s, mark-all-read via `PATCH /api/notifications/read-all`
- **i18n**: English + Hindi via `react-i18next`, language switcher (EN/हि) in navbar and dashboard header, translations in `src/i18n/en.ts` and `hi.ts`, saved to `localStorage` key `fw-lang`
- **Trading data**: Stored in localStorage via `TradingContext` keyed by Clerk user ID
- **Gemini AI chatbot**: `src/components/ChatWidget.tsx` — with human support handoff (detects keywords like "real person"/"live chat", shows inline email+query form, submits to `/api/contact`)
- **Leaderboard** at `/leaderboard`: Hall of Fame cards, animated entries (framer-motion), stats bar (Prize Pool, Active Traders, Avg Win Rate, Monthly Payouts), period filtering, full trader table

## Routes

- `/` — Landing page (home)
- `/sign-in` — Clerk SignIn component (email + Google OAuth)
- `/sign-up` — Clerk SignUp component
- `/dashboard` — Protected, redirects to `/sign-in` if not authenticated
- `/login` — Redirects to `/sign-in`
- `/leaderboard` — Trader Leaderboard with Hall of Fame, rankings, filters
- `/scaling` — Scaling plan (₹1L → ₹50L in 6 levels)
- `/payouts` — Verified payout proofs wall
- `/blog` — Trading education hub with categories and search
- `/rules` — Trading rules, plan comparison table, allowed/prohibited
- `/faq` — Full FAQ page (~75 Q&As, 12 categories: About/Accounts/Assessment/Billing/Funded Account/Payouts/Platform/Rules/Scaling/Support/Tax & Compliance/Trading), search + category pills + accordion + "Still have questions?" CTA. Linked from navbar/footer/mobile menu and "Explore Full FAQ" button at end of home page FAQ section.
- `/success-stories` — Trader testimonials and success stories
- `/community` — Social/community links (WhatsApp, Telegram, Discord, etc.)
- `/admin` — Protected admin panel (overview, traders, payouts, risk, KYC, Blog CMS)
- `/trade`, `/trade/:accountId` — Full simulated prop trading terminal (premium dark fintech UI). Top navbar with Balance/Equity/Day P&L/Total P&L + Profit Target/Daily Loss progress + Market Open indicator + Live feed + account ID/phase. Left sidebar with Dashboard/Trade Terminal/Accounts/Analytics/Payouts/Leaderboard/AI Journal/Settings + live Watchlist (NIFTY/BANKNIFTY/FINNIFTY/SENSEX/CRUDEOIL with green/red ticks). Center: TradingView Advanced Chart widget (s3.tradingview.com/tv.js, dark theme, Asia/Kolkata, NSE:NIFTY etc.) with timeframe pills (1m/5m/15m/1h/1D) + symbol header with live price/change. Right Order Panel: Buy/Sell toggle, symbol select, qty stepper (lot-aware), MARKET/LIMIT/STOP type, optional SL/TP, margin + risk preview, gradient Buy (green) / Sell (red) buttons. Bottom tabs: Open Positions (live P&L, Close button, Close All), Pending Orders (auto-trigger LIMIT/STOP), Trade History (with reason: manual/sl/tp), Analytics (equity curve, daily P&L bars, Win-Loss + Long-Short donuts, Risk-Reward, Best/Worst trade, Discipline AI score). AI Trade Assistant card (under order panel): radial discipline score + insights detecting revenge trading / drawdown warnings / win-rate praise. Rule engine: max daily loss 3%, max overall 6%, profit target 8%, max 10 lots/order — breach disables trading + red banner + reset button. Simulated tick prices every 1.5s (sine + noise). Per-account state persisted to `localStorage` key `fw-trade-${accountId}`. Toast notifications on order fills. Mobile responsive: collapsible sidebar (hamburger) + slide-over order panel + chart fullscreen toggle.
- `/championship` — FW Championship page
- `/impact` — FW Impact Initiative page
- `/mission` — Mission page
- `/about` — About page
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/refund` — Refund Policy

## SEO (Aggressive Google India Optimization)

- **react-helmet-async**: Dynamic meta tags per page (title, description, keywords, OG, Twitter cards) with India-focused keywords
- **SEOHead component**: `src/components/SEOHead.tsx` — reusable meta tag component used on every page with geo.region=IN, max-snippet:-1, max-image-preview:large
- **Structured Data**: `src/components/StructuredData.tsx` — JSON-LD schemas: FinancialService (with aggregateRating, offers, price range), WebSite (with SearchAction), FAQPage (13 Q&As targeting Indian search queries), Service (with offer catalog), BreadcrumbList
- **index.html**: lang=en-IN, hreflang tags (en-IN, hi-IN, x-default), geo.region=IN, og:locale=en_IN with hi_IN alternate, Twitter @fundedwealth, revisit-after=1 day
- **Page-specific SEO**: Every public page has unique title/description/keywords targeting "best prop firm India", "cheapest prop firm India", "prop trading India", "funded trader India" etc.
- **sitemap.xml**: `public/sitemap.xml` — all public routes with lastmod dates, checkout excluded (noindex)
- **robots.txt**: `public/robots.txt` — blocks dashboard/admin/auth pages, allows Googlebot/Bingbot with crawl-delay
- **OG Image**: `public/opengraph.jpg` — with width/height dimensions for rich previews
- **Canonical URLs**: Set per page pointing to `https://fundedwealth.com`

## Backend API (`artifacts/api-server`)

- **Port**: 8080
- **Database**: PostgreSQL with Drizzle ORM
- **Auth Guard**: Clerk (`@clerk/express`) for admin routes
- **Tables**: users, trading_accounts, payouts, contact_submissions, championship_registrations, affiliate_referrals, affiliate_commissions, blog_posts, kyc_submissions, impact_donations

### API Routes
- `POST /api/users/me` — Upsert user profile (syncs Clerk user to DB)
- `GET/POST /api/trading-accounts` — Trading account CRUD
- `POST /api/admin/setup-first-admin` — One-time first admin setup (auth required, only works when no admin exists)
- `POST /api/contact` — Contact form submission (name, email, phone, subject, message) — rate limited (5/15min)
- `POST /api/championship/register` — Championship registration — rate limited (10/15min)
- `GET /api/championship/leaderboard` — Championship leaderboard
- `POST /api/affiliate/register` — Affiliate registration (creates user with affiliate code) — rate limited (10/15min)
- `POST /api/affiliate/track` — Track affiliate referral
- `GET /api/affiliate/stats` — Affiliate stats (auth required)
- `POST /api/payments/create-easebuzz-payment` — Create Easebuzz payment (planType, sizeIndex, couponCode, payMode, billing) → returns `paymentUrl` redirect
- `POST /api/payments/easebuzz-success` — Easebuzz success callback (redirects to dashboard)
- `POST /api/payments/easebuzz-failure` — Easebuzz failure callback (redirects to checkout)
- `POST /api/payments/create-crypto-payment` — Create OxaPay crypto payment (planType, sizeIndex, paymentMethod) → returns `payLink` redirect URL
- `POST /api/payments/oxapay-webhook` — OxaPay webhook callback (Waiting/Confirming/Paid/Failed/Expired)
- `GET /api/payments/payment-status/:trackId` — Check OxaPay payment status (auth required)
- `POST /api/impact/donate` — Impact donation (amount, category, donorName) — rate limited (20/15min)
- `GET /api/impact/stats` — Impact stats (totalDonations, meals, students)
- `GET /api/blog` — List blog posts
- `GET /api/payouts/public` — Public payout proofs
- `GET /api/admin/*` — Admin panel endpoints (admin role required)

### Frontend-Backend Integration
- **Contact form** (`home.tsx`): Sends to `/api/contact`, shows success message
- **Championship registration** (`championship.tsx`): Sends to `/api/championship/register`
- **Affiliate registration** (`home.tsx` AffiliateModal): Sends to `/api/affiliate/register`
- **Dashboard user sync** (`dashboard.tsx`): Auto-syncs Clerk user to DB on load
- **Dashboard donations** (`dashboard.tsx`): Sends to `/api/impact/donate` with category
- **Blog** (`blog.tsx`): Fetches from `/api/blog`, falls back to static content
- **Admin panel** (`admin.tsx`): Fetches from `/api/admin/overview`, `/api/admin/users`, `/api/admin/payouts`; shows access denied for non-admins

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Pre-Launch Features

- **Legal pages**: `/terms`, `/privacy`, `/refund` with full content — linked from footer and affiliate terms checkbox
- **Rate limiting**: `express-rate-limit` on contact (5/15min), championship & affiliate registration (10/15min), donations (20/15min)
- **Analytics**: Google Analytics placeholder in `index.html` — replace `GA_MEASUREMENT_ID` with real ID before launch
- **Easebuzz payment gateway**: Set `EASEBUZZ_KEY`, `EASEBUZZ_SALT`, and `EASEBUZZ_ENV` (test/prod) env vars. Supports UPI, Card, Net Banking, Wallets. Success/failure callbacks redirect to frontend. Hash verification on both request and response.
- **OxaPay crypto gateway**: Set `OXAPAY_MERCHANT_API_KEY` env var with your OxaPay merchant API key to enable crypto payments (USDT TRC20/BEP20/ERC20, BTC, ETH, LTC). Frontend redirects to OxaPay hosted checkout page. Webhook at `/api/payments/oxapay-webhook`.
- **AI Blog Generator**: `POST /api/auto-blog/generate` — Gemini AI auto-generates SEO-optimized blog articles about prop trading, Indian markets, trading tips, psychology. Admin panel has "AI Article Generator" UI (Blog CMS tab) — choose 1-5 articles, pick category or random mix, articles are auto-published. 65+ pre-built topic ideas across 5 categories. Uses Replit AI Integrations for Gemini (no API key needed, billed to credits).
- **Email notifications**: Log-only stubs in `artifacts/api-server/src/lib/email.ts` for contact confirmation, championship registration, affiliate welcome, donation thank-you, payment confirmation, challenge started, KYC status updates — connect Resend/SendGrid to enable delivery
- **Social media links**: Footer links point to `instagram.com/fundedwealth`, `x.com/fundedwealth`, `youtube.com/@fundedwealth` — update with real handles before launch
- **Admin setup**: `POST /api/admin/setup-first-admin` — one-time endpoint to promote the first signed-in user to admin (only works when no admin exists yet)
- **Sitemap**: Updated with `/terms`, `/privacy`, `/refund` pages

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
