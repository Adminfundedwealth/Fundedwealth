# PHASE 4 — DATABASE CLEANUP AUDIT

**Generated:** 2026-06-23  
**Scope:** Full codebase + production database mapping  
**Action:** EVIDENCE ONLY — No code changes, no migrations, no deletions

---

## SUMMARY

| Category | Count |
|----------|-------|
| Active Tables | 67 |
| Frozen Tables (Terminal) | 22 |
| Legacy Tables (Already Dropped) | 11 |
| Views | 0 |
| Functions | 0 |
| Triggers | 0 |
| RLS Policies | 5 |
| Migrations | 24 |

---

## 1. TABLES

### 1A. ACTIVE CORE TABLES (KEEP)

| # | Table | Referenced by Code | Query | Insert | Update | Delete | API Route | Cron | FK Refs | RLS |
|---|-------|-------------------|-------|--------|--------|--------|-----------|------|---------|-----|
| 1 | `users` | YES | HIGH | YES | YES | NO | /auth, /users, /admin, ALL | NO | FK parent for 20+ tables | NO |
| 2 | `orders` | YES | YES | YES | YES | NO | /payments, /razorpay, /admin | NO | FK from manual_payments | NO |
| 3 | `trading_accounts` | YES | YES | YES | YES | NO | /accounts, /admin, /payments | NO | None | NO |
| 4 | `payouts` | YES | YES | YES | YES | NO | /payouts, /admin | NO | FK from payout_timeline_events | NO |
| 5 | `payout_timeline_events` | YES | YES | YES | NO | NO | /payouts | NO | FK to payouts | NO |
| 6 | `notifications` | YES | YES | YES | YES | NO | /notifications | YES (economic-calendar) | FK to users | NO |
| 7 | `blog_posts` | YES | YES | YES | YES | YES | /blog, /auto-blog | YES (blog-scheduler) | None | NO |
| 8 | `webhook_logs` | YES | YES | YES | YES | NO | /razorpay, /payments | NO | FK to users | NO |
| 9 | `audit_logs` | YES | YES | YES | NO | NO | /audit, /admin, /kyc | NO | FK to users | NO |
| 10 | `manual_payments` | YES | YES | YES | YES | NO | /payments, /admin | NO | FK to users, orders | NO |
| 11 | `referrals` | YES | YES | YES | YES | NO | /affiliate | NO | FK to users | NO |
| 12 | `affiliate_clicks` | YES | YES | YES | NO | NO | /affiliate | NO | None | NO |
| 13 | `affiliate_payouts` | YES | YES | YES | YES | NO | /affiliate, /admin | NO | FK to users | NO |
| 14 | `kyc_submissions` | YES | YES | YES | YES | YES | /kyc | NO | FK to users | NO |
| 15 | `kyc_profiles` | YES | YES | YES | YES | NO | /kyc, /admin/kyc | NO | FK to users | NO |
| 16 | `kyc_documents` | YES | YES | YES | YES | NO | /kyc, /admin/kyc | NO | FK to users, kyc_profiles | NO |
| 17 | `kyc_reviews` | YES | YES | YES | NO | NO | /admin/kyc | NO | FK to users | NO |
| 18 | `community_posts` | YES | YES | YES | YES | YES | /community | NO | None | NO |
| 19 | `community_comments` | YES | YES | YES | YES | YES | /community | NO | None | NO |
| 20 | `community_likes` | YES | YES | YES | NO | YES | /community | NO | None | NO |
| 21 | `contact_submissions` | YES | YES | YES | YES | NO | /contact, /admin | NO | None | NO |
| 22 | `championship_registrations` | YES | YES | YES | YES | NO | /championship | NO | None | NO |
| 23 | `impact_donations` | YES | YES | YES | NO | NO | /impact | NO | FK to users | NO |
| 24 | `trade_journal` | YES | YES | YES | YES | YES | /trade-journal | NO | None | NO |
| 25 | `economic_events` | YES | YES | YES | YES | NO | /economic-events | YES (economic-calendar) | None | NO |
| 26 | `fraud_events` | YES | YES | YES | YES | NO | /fraud, /admin/fraud | NO | FK to users | YES |
| 27 | `device_history` | YES | YES | YES | YES | NO | /fingerprint | NO | FK to users | YES |
| 28 | `ip_history` | YES | YES | YES | YES | NO | /ip-intelligence | NO | FK to users | YES |
| 29 | `ip_lookups` | YES | YES | YES | NO | NO | /ip-intelligence | NO | FK to users | NO |
| 30 | `referral_fraud_logs` | YES | YES | YES | NO | NO | /fraud, /admin/fraud | NO | FK to users | YES |
| 31 | `payment_fingerprints` | YES | YES | YES | NO | NO | /admin/payment-fingerprints | NO | FK to users | NO |
| 32 | `velocity_events` | YES | YES | YES | NO | NO | /admin/fraud (velocity) | NO | FK to users | NO |
| 33 | `risk_profiles` | YES | YES | YES | YES | NO | /fraud, /admin/fraud | NO | FK to users | YES |
| 34 | `security_incidents` | YES | YES | YES | YES | NO | /auth (security) | NO | FK to users | NO |
| 35 | `rate_limit_violations` | YES | YES | YES | NO | NO | middleware | NO | FK to users | NO |
| 36 | `system_errors` | YES | YES | YES | NO | NO | /monitor | NO | FK to users | NO |
| 37 | `system_incidents` | YES | YES | YES | YES | NO | /monitor, /incidents | NO | FK from incident_sla | NO |
| 38 | `api_logs` | YES | YES | YES | NO | NO | /monitor | NO | None | NO |
| 39 | `payment_failures` | YES | YES | YES | NO | NO | /monitor | NO | FK to users | NO |
| 40 | `notification_failures` | YES | YES | YES | NO | NO | /monitor | NO | FK to users | NO |
| 41 | `system_backups` | YES | YES | YES | NO | NO | /monitor | NO | FK from backup_recovery | NO |
| 42 | `backup_recovery` | YES | YES | YES | YES | NO | /monitor | NO | FK to system_backups | NO |
| 43 | `incident_sla` | YES | YES | YES | YES | NO | /monitor | NO | FK to system_incidents | NO |
| 44 | `alert_rules` | YES | YES | YES | YES | YES | /monitor | NO | None | NO |
| 45 | `sessions` | YES | YES | YES | YES | NO | /auth | NO | FK to users | NO |
| 46 | `auth_methods` | YES | YES | YES | NO | NO | /auth | NO | FK to users | NO |
| 47 | `permissions` | YES | YES | NO | NO | NO | rbac-service | NO | None | NO |
| 48 | `login_history` | YES | YES | YES | NO | NO | /auth (security) | NO | FK to users, sessions | NO |
| 49 | `failed_attempts` | YES | YES | YES | YES | NO | /auth (security) | NO | None | NO |
| 50 | `two_factor_settings` | YES | YES | YES | YES | NO | /auth | NO | FK to users | NO |
| 51 | `support_tickets` | YES | YES | YES | YES | NO | support-service | NO | None | NO |
| 52 | `support_messages` | YES | YES | YES | NO | NO | support-service | NO | FK to support_tickets | NO |
| 53 | `support_attachments` | YES | YES | YES | YES | NO | support-service | NO | FK to support_tickets | NO |
| 54 | `support_categories` | YES (schema) | NO | NO | NO | NO | (unused in queries) | NO | None | NO |
| 55 | `support_priorities` | YES (schema) | NO | NO | NO | NO | (unused in queries) | NO | None | NO |

**Files using active tables:**
- `artifacts/api-server/src/routes/*.ts` — All 42 route files
- `artifacts/api-server/src/lib/monitoring-service.ts`
- `artifacts/api-server/src/lib/economic-calendar.ts`
- `artifacts/api-server/src/lib/blog-scheduler.ts`
- `artifacts/api-server/src/lib/fraud-detection-service.ts`
- `artifacts/api-server/src/lib/fraud-enforcement-service.ts`
- `artifacts/api-server/src/lib/velocity-service.ts`
- `artifacts/api-server/src/lib/security-service.ts`
- `artifacts/api-server/src/lib/rbac-service.ts`
- `artifacts/api-server/src/lib/support-service.ts`
- `artifacts/api-server/src/lib/kyc-duplicate-service.ts`
- `artifacts/api-server/src/middlewares/supabaseAuth.ts`
- `artifacts/api-server/src/middlewares/securityMiddleware.ts`
- `artifacts/api-server/src/middlewares/monitoringMiddleware.ts`

---

### 1B. FROZEN TERMINAL TABLES (DEPRECATE — Behind TERMINAL_ENABLED=false)

These tables have code references but ALL code paths are gated behind `TERMINAL_ENABLED=true` (currently `false` in production). Routes return HTTP 410 Gone via `terminalGate()` middleware.

| # | Table | Referenced by Code | API Route (Frozen) | Service Files | Classification |
|---|-------|-------------------|-------------------|---------------|----------------|
| 1 | `trading_orders` | YES | /orders, /orders (advanced) | execution-service, advanced-execution-service | DEPRECATE |
| 2 | `positions` | YES | /positions, /positions (management) | execution-service, advanced-execution-service | DEPRECATE |
| 3 | `executions` | YES | /orders, /execution | execution-service, advanced-execution-service | DEPRECATE |
| 4 | `trade_logs` | YES | /trades | execution-service, advanced-execution-service | DEPRECATE |
| 5 | `challenge_state` | YES | /orders | execution-service, advanced-execution-service | DEPRECATE |
| 6 | `order_brackets` | YES | (none direct) | advanced-execution-service | DEPRECATE |
| 7 | `order_modifications` | YES | (none direct) | advanced-execution-service | DEPRECATE |
| 8 | `position_modifications` | YES | (none direct) | advanced-execution-service | DEPRECATE |
| 9 | `execution_audits` | YES | (none direct) | execution-service, advanced-execution-service | DEPRECATE |
| 10 | `market_snapshots` | YES | /market (frozen) | market-data-service | DEPRECATE |
| 11 | `market_ticks` | YES (schema only) | /market (frozen) | market-data-service (schema import) | DEPRECATE |
| 12 | `market_ohlc` | YES (schema only) | /market (frozen) | market-data-service (schema import) | DEPRECATE |
| 13 | `options_snapshots` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 14 | `options_contracts` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 15 | `expiry_calendar` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 16 | `oi_analytics` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 17 | `heatmap_data` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 18 | `fii_dii_flow` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 19 | `market_breadth` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 20 | `greeks_cache` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 21 | `discipline_scores` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 22 | `behavior_patterns` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 23 | `session_analytics` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |
| 24 | `ai_trade_insights` | YES (schema only) | (none) | (schema only) | SAFE TO DELETE |

**Files using frozen terminal tables:**
- `artifacts/api-server/src/routes/orders.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/positions.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/advanced-orders.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/position-management.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/execution.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/market-data.ts` (frozen via terminalGate)
- `artifacts/api-server/src/routes/trades.ts` (ACTIVE — reads trade_logs for dashboard)
- `artifacts/api-server/src/lib/execution-service.ts` (gated by TERMINAL_ENABLED)
- `artifacts/api-server/src/lib/advanced-execution-service.ts` (gated by TERMINAL_ENABLED)
- `artifacts/api-server/src/lib/market-data-service.ts` (gated by TERMINAL_ENABLED)

---

### 1C. GAMIFICATION TABLES (VERIFY MANUALLY)

| # | Table | Referenced by Code | Query | Insert | Update | Delete | Classification |
|---|-------|-------------------|-------|--------|--------|--------|----------------|
| 1 | `badges` | YES (schema) | NO | NO | NO | NO | VERIFY — No active queries found |
| 2 | `user_badges` | YES (schema) | NO | NO | NO | NO | VERIFY — No active queries found |
| 3 | `achievement_definitions` | YES (schema) | NO | NO | NO | NO | VERIFY — No active queries found |
| 4 | `user_achievements` | YES (schema) | NO | NO | NO | NO | VERIFY — No active queries found |
| 5 | `certificates` | YES | YES (admin) | NO | NO | NO | KEEP — Admin reads |
| 6 | `streaks` | YES (schema) | NO | NO | NO | NO | VERIFY — No active queries found |

**Files referencing gamification tables:**
- `artifacts/api-server/src/routes/admin.ts` (certificates only — line 348)
- `lib/db/src/schema/gamification.ts` (schema definition)

**Note:** `badges`, `user_badges`, `achievement_definitions`, `user_achievements`, `streaks` have Drizzle schemas but ZERO active queries/inserts anywhere in the codebase. The frontend may render XP/badges from the `users` table columns (`experience_points`, `current_level`, `achievement_count`, `streak_points`) without querying these tables directly.

---

### 1D. CHAT/CONVERSATION TABLES (SAFE TO DELETE)

| # | Table | Referenced by Code | Query | Insert | Update | Delete | Classification |
|---|-------|-------------------|-------|--------|--------|--------|----------------|
| 1 | `conversations` | YES (schema only) | NO | NO | NO | NO | SAFE TO DELETE |
| 2 | `messages` | YES (schema only) | NO | NO | NO | NO | SAFE TO DELETE |

**Evidence:** The `/chat` route uses Gemini AI streaming with in-memory message history from the request body. It does NOT persist conversations to the database. These tables are orphaned schema artifacts.

---

### 1E. LEGACY TABLES (ALREADY DROPPED / Pending Drop)

Already moved to `lib/db/src/schema/_legacy/` and DROP script exists at `scripts/db-cleanup/02_drop.sql`:

| # | Table | Status |
|---|-------|--------|
| 1 | `challenge_accounts` | Pending drop (0 rows) |
| 2 | `challenge_rules` | Pending drop (0 rows) |
| 3 | `challenge_progress` | Pending drop (0 rows) |
| 4 | `funded_accounts` | Pending drop (0 rows) |
| 5 | `breach_events` | Pending drop (0 rows) |
| 6 | `risk_events` | Pending drop (0 rows) |
| 7 | `account_locks` | Pending drop (0 rows) |
| 8 | `payout_eligibility` | Pending drop (0 rows) |
| 9 | `payout_reviews` | Pending drop (0 rows) |
| 10 | `account_states` | Pending drop (0 rows) |
| 11 | `funding_events` | Pending drop (0 rows) |

---

## 2. VIEWS

**None found.** No `CREATE VIEW` statements in any migration or SQL file.

---

## 3. FUNCTIONS

**None found.** No `CREATE FUNCTION` or `CREATE OR REPLACE FUNCTION` in any migration or SQL file. All logic is handled in application code (Drizzle ORM queries).

---

## 4. TRIGGERS

**None found.** No `CREATE TRIGGER` in any migration or SQL file. All side effects are handled in application code.

---

## 5. RLS POLICIES

Defined in `lib/db/migrations/001_fraud_detection_system.sql`:

| # | Table | Policy Name | Type | Rule |
|---|-------|-------------|------|------|
| 1 | `fraud_events` | "Admins can view all fraud events" | SELECT | role = 'admin' |
| 2 | `risk_profiles` | "Admins can view all risk profiles" | SELECT | role = 'admin' |
| 3 | `device_history` | "Users can view their own device history" | SELECT | user_id = auth.uid() OR admin |
| 4 | `ip_history` | "Admins can view all ip history" | SELECT | role = 'admin' |
| 5 | `referral_fraud_logs` | "Admins can view all referral fraud logs" | SELECT | role = 'admin' |

**Note:** These RLS policies reference `auth.uid()` (Supabase auth). Since the backend uses the service role key (bypasses RLS), these policies only apply if direct Supabase client queries are made from the frontend — which currently does NOT happen for fraud tables. The frontend only uses the backend API.

**Classification:** KEEP (defense-in-depth, no harm)

---

## 6. MIGRATIONS

| # | File | Tables Created/Modified | Status |
|---|------|------------------------|--------|
| 1 | `0000_many_invaders.sql` | Initial schema (core tables) | APPLIED |
| 2 | `0001_add_ip_lookups.sql` | ip_lookups | APPLIED |
| 3 | `0002_kyc_duplicate_protection.sql` | KYC dedup columns | APPLIED |
| 4 | `0003_fraud_enforcement.sql` | Fraud enforcement columns | APPLIED |
| 5 | `0004_payment_fingerprints.sql` | payment_fingerprints | APPLIED |
| 6 | `0005_velocity_tracking.sql` | velocity_events | APPLIED |
| 7 | `001_fraud_detection_system.sql` | fraud_events, risk_profiles, device_history, ip_history, referral_fraud_logs + RLS | APPLIED |
| 8 | `002_observability_monitoring_system.sql` | system_errors, system_incidents, api_logs, payment_failures, notification_failures, system_backups | APPLIED |
| 9 | `003_security_auth_rbac_phase1.sql` | sessions, auth_methods, permissions, login_history, failed_attempts, security_incidents, rate_limit_violations, webhook_logs, two_factor_settings, otp_codes | APPLIED |
| 10 | `20260518_terminal_tables.sql` | trading_orders, positions, executions, trade_logs, challenge_state, market_snapshots | APPLIED |
| 11 | `20260518_phase4_advanced_orders.sql` | order_brackets, order_modifications, position_modifications, execution_audits | APPLIED |
| 12 | `20260518_phase5_options.sql` | options tables, market ticks, ohlc, greeks, heatmap, fii_dii, breadth | APPLIED |
| 13 | `20260518_phase6_challenge_engine.sql` | Legacy challenge tables (NOW DROPPED) | DEPRECATED |
| 14 | `20260518_phase7_risk_engine.sql` | discipline_scores, behavior_patterns, session_analytics, ai_trade_insights | APPLIED |
| 15 | `20260518_phase8_account_lifecycle.sql` | Account lifecycle columns | APPLIED |
| 16 | `20260518_phase9_infrastructure_reliability.sql` | backup_recovery, incident_sla | APPLIED |
| 17 | `20260519_add_alert_targets.sql` | alert_rules extra columns | APPLIED |
| 18 | `20260519_create_support_tickets.sql` | support_tickets, support_messages, support_attachments, support_categories, support_priorities | APPLIED |
| 19 | `20260519_create_trading_orders_uuid.sql` | trading_orders UUID migration | APPLIED |
| 20 | `20260519_remove_alert_targets_rollback.sql` | Rollback script | REFERENCE |
| 21 | `20260519_support_attachment_signed_urls.sql` | support_attachments columns | APPLIED |
| 22 | `20260519_support_attachment_signed_urls_rollback.sql` | Rollback script | REFERENCE |
| 23 | `20260520_fix_users_api_logs.sql` | Fix columns | APPLIED |
| 24 | `README_add_alert_targets.md` | Documentation | N/A |

---

## 7. SCHEDULED JOBS / CRON

| # | Job | Table(s) Written | Frequency | File |
|---|-----|-----------------|-----------|------|
| 1 | Blog Scheduler | `blog_posts` | Daily 07:30 IST | `artifacts/api-server/src/lib/blog-scheduler.ts` |
| 2 | Economic Calendar Sync | `economic_events` | Every 6 hours | `artifacts/api-server/src/lib/economic-calendar.ts` |
| 3 | Economic Event Notifications | `notifications` | Every 5 minutes | `artifacts/api-server/src/lib/economic-calendar.ts` |
| 4 | Market Data Service | `market_snapshots` | Continuous (FROZEN) | `artifacts/api-server/src/lib/market-data-service.ts` |

---

## CLASSIFICATION SUMMARY

### ✅ ACTIVE DATABASE OBJECTS (KEEP) — 55 tables

All tables in section 1A plus `certificates` from gamification. These have active code paths, production data, and are required for the running application.

### ⚠️ DEPRECATE — 12 tables

Terminal execution engine tables (1B, items 1–12). Code exists but ALL paths are gated behind `TERMINAL_ENABLED=false`. If the terminal feature is permanently retired, these can be dropped.

| Table | Reason |
|-------|--------|
| `trading_orders` | Terminal only, frozen routes return 410 |
| `positions` | Terminal only, frozen routes return 410 |
| `executions` | Terminal only, frozen routes return 410 |
| `trade_logs` | Used by /trades for dashboard — **VERIFY before removing** |
| `challenge_state` | Terminal only |
| `order_brackets` | Terminal only |
| `order_modifications` | Terminal only |
| `position_modifications` | Terminal only |
| `execution_audits` | Terminal only |
| `market_snapshots` | Terminal only |
| `market_ticks` | Schema only, no active writes |
| `market_ohlc` | Schema only, no active writes |

**⚠️ IMPORTANT:** `trade_logs` is queried by `/api/trades` route which is NOT frozen (serves dashboard analytics). Verify if this has production data before classifying as safe to delete.

### 🗑️ SAFE TO DELETE — 16 tables

| Table | Reason |
|-------|--------|
| `conversations` | Zero queries in entire codebase. Chat uses in-memory. |
| `messages` | Zero queries in entire codebase. Chat uses in-memory. |
| `options_snapshots` | Schema-only, zero code references outside schema file |
| `options_contracts` | Schema-only, zero code references outside schema file |
| `expiry_calendar` | Schema-only, zero code references outside schema file |
| `oi_analytics` | Schema-only, zero code references outside schema file |
| `heatmap_data` | Schema-only, zero code references outside schema file |
| `fii_dii_flow` | Schema-only, zero code references outside schema file |
| `market_breadth` | Schema-only, zero code references outside schema file |
| `greeks_cache` | Schema-only, zero code references outside schema file |
| `discipline_scores` | Schema-only, zero code references outside schema file |
| `behavior_patterns` | Schema-only, zero code references outside schema file |
| `session_analytics` | Schema-only, zero code references outside schema file |
| `ai_trade_insights` | Schema-only, zero code references outside schema file |
| `support_categories` | Schema-only, zero queries (supportTickets references categoryId but no join) |
| `support_priorities` | Schema-only, zero queries (supportTickets references priorityId but no join) |

### 🔍 VERIFY MANUALLY BEFORE DELETE — 5 tables

| Table | Reason |
|-------|--------|
| `badges` | Schema exists, zero queries found — may have production data seeded |
| `user_badges` | Schema exists, zero queries found — may have production data |
| `achievement_definitions` | Schema exists, zero queries found — may have production data seeded |
| `user_achievements` | Schema exists, zero queries found — may have production data |
| `streaks` | Schema exists, zero queries found — may have production data |

**Verification needed:** Run `SELECT COUNT(*) FROM badges; SELECT COUNT(*) FROM user_badges;` etc. in production to confirm 0 rows before classifying as safe to delete.

---

## CROSS-CHECK MATRIX

| Check | Done | Method |
|-------|------|--------|
| Frontend (artifacts/fundedwealth) | ✅ | Grep for table names, API calls |
| Backend routes (artifacts/api-server/src/routes) | ✅ | All 42 route files inspected |
| Backend services (artifacts/api-server/src/lib) | ✅ | All service files inspected |
| Drizzle schema (lib/db/src/schema) | ✅ | All 77 schema files cataloged |
| Migrations (lib/db/migrations) | ✅ | All 24 migration files inspected |
| Scheduled jobs | ✅ | blog-scheduler, economic-calendar, market-data-service |
| Legacy code (_legacy folder) | ✅ | Confirmed isolated, no active imports |
| Middleware | ✅ | supabaseAuth, security, monitoring checked |
| Foreign key relationships | ✅ | All FK references documented per table |
| RLS policies | ✅ | 5 policies on fraud tables documented |

---

## NOTES

1. **No OTP_CODES table in Drizzle schema** — Defined in SQL migration `003_security_auth_rbac_phase1.sql` but NOT in Drizzle schema exports. May exist in DB but is unused by application code. **VERIFY in production.**

2. **`/api/trades` route is NOT frozen** — It reads from `trade_logs` table for dashboard display. This table is categorized under terminal but has an active read path.

3. **Frontend never queries DB directly** — All data flows through the backend API. The frontend Supabase client is used exclusively for authentication (signIn, signUp, signOut, session management).

4. **RLS policies are defense-in-depth only** — Backend uses service role key which bypasses RLS. Policies protect against accidental direct-query exposure.

5. **Legacy `_legacy/` folder in routes and schema** — Contains disabled code for breach-engine, challenge-progress-engine, payout-eligibility-engine, account-lifecycle. These import from `@workspace/db` but are NEVER imported by any active file.
