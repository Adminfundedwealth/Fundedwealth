# FUNDEDWEALTH OWNERSHIP CLEANUP REPORT

**Date:** 2026-06-23  
**Scope:** Remove all Terminal and Admin ownership from fundedwealth.com website codebase  

---

## FILES REMOVED (92 files + 3 directories)

### Terminal DB Schemas (19 files)
- `lib/db/src/schema/trading_orders.ts`
- `lib/db/src/schema/positions.ts`
- `lib/db/src/schema/executions.ts`
- `lib/db/src/schema/trade_logs.ts`
- `lib/db/src/schema/order_brackets.ts`
- `lib/db/src/schema/order_modifications.ts`
- `lib/db/src/schema/position_modifications.ts`
- `lib/db/src/schema/execution_audits.ts`
- `lib/db/src/schema/market-snapshots.ts`
- `lib/db/src/schema/market_ticks.ts`
- `lib/db/src/schema/market_ohlc.ts`
- `lib/db/src/schema/options_snapshots.ts`
- `lib/db/src/schema/options_contracts.ts`
- `lib/db/src/schema/expiry_calendar.ts`
- `lib/db/src/schema/oi_analytics.ts`
- `lib/db/src/schema/heatmap_data.ts`
- `lib/db/src/schema/fii_dii_flow.ts`
- `lib/db/src/schema/market_breadth.ts`
- `lib/db/src/schema/greeks_cache.ts`

### Terminal API Routes (3 files)
- `artifacts/api-server/src/routes/market-data.ts`
- `artifacts/api-server/src/routes/instruments.ts`
- `artifacts/api-server/src/routes/trades.ts`

### Terminal Services/Libs (11 files)
- `artifacts/api-server/src/lib/market-data-service.ts`
- `artifacts/api-server/src/lib/angel-auth-service.ts`
- `artifacts/api-server/src/lib/dhan-instrument-service.ts`
- `artifacts/api-server/src/lib/greeks-calculator.ts`
- `artifacts/api-server/src/lib/heatmap-service.ts`
- `artifacts/api-server/src/lib/oi-analytics-service.ts`
- `artifacts/api-server/src/lib/options-data-service.ts`
- `artifacts/api-server/src/lib/breadth-service.ts`
- `artifacts/api-server/src/lib/fii-dii-service.ts`
- `artifacts/api-server/src/lib/expiry-service.ts`
- `artifacts/api-server/src/lib/risk-scoring-engine.ts`

### Broker Providers (entire directory, 6 files)
- `artifacts/api-server/src/lib/providers/angel.ts`
- `artifacts/api-server/src/lib/providers/dhan.ts`
- `artifacts/api-server/src/lib/providers/MarketDataProvider.ts`
- `artifacts/api-server/src/lib/providers/mock.ts`
- `artifacts/api-server/src/lib/providers/shoonya.ts`
- `artifacts/api-server/src/lib/providers/upstox.ts`

### Terminal Middleware (1 file)
- `artifacts/api-server/src/middlewares/terminalFreeze.ts`

### Terminal Frontend (5 files + 1 directory)
- `artifacts/fundedwealth/src/contexts/TradingContext.tsx`
- `artifacts/fundedwealth/src/lib/market-data-engine.ts`
- `artifacts/fundedwealth/src/lib/market-data-service.ts`
- `artifacts/fundedwealth/src/lib/tradeJournal.ts`
- `artifacts/fundedwealth/src/components/TradeJournalSection.tsx`
- `artifacts/fundedwealth/market-data-service/` (directory)

### Admin Routes (5 files)
- `artifacts/api-server/src/routes/admin.ts`
- `artifacts/api-server/src/routes/admin-kyc.ts`
- `artifacts/api-server/src/routes/fingerprint-admin.ts`
- `artifacts/api-server/src/routes/payment-fingerprints-admin.ts`
- `artifacts/api-server/src/routes/velocity-admin.ts`
- `artifacts/api-server/src/routes/fraud-enforcement.ts`

### Admin Services (2 files)
- `artifacts/api-server/src/lib/fraud-enforcement-service.ts`
- `artifacts/api-server/src/lib/rbac-service.ts`

### Admin Schema (1 file)
- `lib/db/src/schema/permissions.ts`

### Admin Frontend (3 files)
- `artifacts/fundedwealth/src/pages/admin.tsx`
- `artifacts/fundedwealth/src/components/FraudAdminPanel.tsx`
- `artifacts/fundedwealth/src/components/MonitoringAdminPanel.tsx`
- `artifacts/fundedwealth/src/components/kyc/AdminKYCDashboard.tsx`

### Terminal Migrations (6 files)
- `lib/db/migrations/20260518_terminal_tables.sql`
- `lib/db/migrations/20260518_phase4_advanced_orders.sql`
- `lib/db/migrations/20260518_phase5_options.sql`
- `lib/db/migrations/20260518_phase6_challenge_engine.sql`
- `lib/db/migrations/20260518_phase7_risk_engine.sql`
- `lib/db/migrations/20260519_create_trading_orders_uuid.sql`

### Legacy Schema Directory (13 files)
- `lib/db/src/schema/_legacy/` (entire directory removed)

### Terminal Test/Debug Files (18 files)
- `artifacts/api-server/angel-api-audit.cjs`
- `artifacts/api-server/angel-auth-test.cjs`
- `artifacts/api-server/angel-feed-test.cjs`
- `artifacts/api-server/angel-test.cjs`
- `artifacts/api-server/angel-ws-diag2.cjs`
- `artifacts/api-server/angel-ws-diagnostic.cjs`
- `artifacts/api-server/angel-ws-probe.cjs`
- `artifacts/api-server/angel-ws-probe2.cjs`
- `artifacts/api-server/angel-ws-probe3.cjs`
- `artifacts/api-server/broker-audit.cjs`
- `artifacts/api-server/dhan-audit.cjs`
- `artifacts/api-server/dhan-audit.js`
- `artifacts/api-server/dhan-auth-test.cjs`
- `artifacts/api-server/dhan-direct-test.cjs`
- `artifacts/api-server/dhan-token-test.cjs`
- `artifacts/api-server/shoonya-mstock-test.cjs`
- `artifacts/api-server/terminal-check.txt`
- `artifacts/api-server/terminal-hello.txt`

### Terminal Migration Script (1 file)
- `lib/db/scripts/apply_20260519_trading_orders.mjs`

### Terminal Documentation (32 files)
- `TERMINAL_DISTRACTION_AUDIT.md`
- `TERMINAL_GAP_ANALYSIS.md`
- `terminal_market_hours_logic.md`
- `terminal_navigation_refactor.md`
- `TERMINAL_PHASE2_REPORT.md`
- `TERMINAL_PHASE21_REPORT.md`
- `TERMINAL_PHASE21_VALIDATION_REPORT.md`
- `TERMINAL_READINESS_AUDIT.md`
- `TERMINAL_READINESS_REPORT.md`
- `TERMINAL_REAUDIT_REPORT.md`
- `TERMINAL_ROI_REPORT.md`
- `terminal_symbol_audit.md`
- `TERMINAL_THEME_REPORT.md`
- `TERMINAL_THEME_VISIBILITY_REPORT.md`
- `TERMINAL_UX_TEST_REPORT.md`
- `TERMINAL_V11_GAP_REPORT.md`
- `FINAL_TERMINAL_RELEASE_REPORT.md`
- `FINAL-OLD-TERMINAL-RETIREMENT-AUDIT.md`
- `OLD-TERMINAL-BACKGROUND-FREEZE-REPORT.md`
- `OLD-TERMINAL-FORENSIC-AUDIT.md`
- `OLD-TERMINAL-FREEZE-PLAN.md`
- `OLD-TERMINAL-FREEZE-REPORT.md`
- `OLD-TERMINAL-RUNTIME-VERIFICATION.md`
- `COMPETITOR_TERMINAL_REPORT.md`
- `CHART_AUDIT.md`
- `SYMBOL_MAPPING_AUDIT.md`
- `LIVE_FEED_VERIFICATION.md`
- `LIVE_MARKET_DATA_AUDIT.md`
- `MARKET_SESSION_AUDIT.md`
- `DHAN_429_ROOT_CAUSE.md`
- `DHAN_CONNECTIVITY_AUDIT_REPORT.md`
- `tmp_terminal_test.txt`

---

## ROUTES REMOVED

### API Routes (Backend)
| Route | Type |
|-------|------|
| `/api/instruments` | Terminal |
| `/api/market` | Terminal |
| `/api/trades` | Terminal |
| `/api/admin` | Admin |
| `/api/admin/kyc` | Admin |
| `/api/admin/fingerprints` | Admin |
| `/api/admin/fraud` | Admin |
| `/api/admin/payment-fingerprints` | Admin |
| `/api/incidents` | Admin |
| `/ws/market` | Terminal WebSocket |

### Frontend Routes
| Route | Type |
|-------|------|
| `/admin` | Admin |
| `/trade` | Terminal (redirect removed) |
| `/trade/:rest*` | Terminal (redirect removed) |

---

## APIs REMOVED

| Endpoint | Method | Category |
|----------|--------|----------|
| `/api/instruments/*` | ALL | Terminal - Broker instruments |
| `/api/market/*` | ALL | Terminal - Market data |
| `/api/trades/*` | ALL | Terminal - Trade analytics |
| `/api/admin/*` | ALL | Admin - Panel |
| `/api/admin/kyc/*` | ALL | Admin - KYC management |
| `/api/admin/fingerprints/*` | ALL | Admin - Device fingerprints |
| `/api/admin/fraud/*` | ALL | Admin - Fraud enforcement & velocity |
| `/api/admin/payment-fingerprints/*` | ALL | Admin - Payment fingerprints |
| `/api/incidents` | GET | Admin - Incident query |
| `/ws/market` | WebSocket | Terminal - Real-time market feed |

---

## TABLES MARKED FOR DROP (32 tables)

SQL file: `scripts/DROP_TERMINAL_ADMIN_TABLES.sql`

### Terminal Execution Engine (8)
- `trading_orders`
- `positions`
- `executions`
- `trade_logs`
- `order_brackets`
- `order_modifications`
- `position_modifications`
- `execution_audits`

### Market Data (11)
- `market_snapshots`
- `market_ticks`
- `market_ohlc`
- `options_snapshots`
- `options_contracts`
- `expiry_calendar`
- `oi_analytics`
- `heatmap_data`
- `fii_dii_flow`
- `market_breadth`
- `greeks_cache`

### Legacy Challenge Engine (12)
- `breach_events`
- `risk_events`
- `account_locks`
- `challenge_progress`
- `challenge_rules`
- `challenge_accounts`
- `payout_eligibility`
- `payout_reviews`
- `funded_accounts`
- `account_states`
- `funding_events`
- `challenges`

### Admin-Only (1)
- `permissions`

---

## CODE MODIFICATIONS

| File | Change |
|------|--------|
| `artifacts/api-server/src/routes/index.ts` | Removed all terminal/admin route imports and registrations |
| `artifacts/api-server/src/index.ts` | Removed terminal background services, WebSocket server, broker initialization |
| `artifacts/api-server/src/app.ts` | Removed WebSocket CORS skip |
| `artifacts/fundedwealth/src/App.tsx` | Removed admin page route, TradingContext import/usage, terminal redirects |
| `artifacts/fundedwealth/src/components/kyc/index.ts` | Removed AdminKYCDashboard export |
| `lib/db/src/schema/index.ts` | Removed all terminal schema exports, permissions, legacy references |

---

## WHAT REMAINS (Website Ownership)

- Home, Pricing/Checkout, Payments (Razorpay), Orders
- KYC (user-facing), Affiliates, Referrals
- Support (chat, contact), Notifications
- User Dashboard, Certificates/Payouts
- Blogs (auto-blog + manual), SEO
- Community, Championship, Leaderboard
- Economic Calendar, Trade Journal (user dashboard)
- Fraud detection (user-facing), Fingerprinting (user-facing)
- Auth, Sessions, Monitoring (operational)

---

**Cleanup complete. No code was recreated. No audits were run.**
