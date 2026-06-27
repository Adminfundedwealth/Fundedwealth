# DATABASE AUDIT — FundedWealth

**Date:** June 21, 2026  
**Method:** Schema inspection (Drizzle ORM) + health endpoint + drop scripts  
**Database:** PostgreSQL on Neon (via Drizzle ORM)  
**Health Status:** `databaseHealthy: true`

---

## Database Connectivity

Verified via `/api/health`:
```json
{
  "databaseHealthy": true,
  "openIncidents": 0,
  "recentErrors": 6,
  "recentPaymentFailures": 0
}
```

**Database is LIVE and responding to queries.**

---

## Active Tables (Queried by application)

### Core Business
| Table | Status | Purpose |
|-------|--------|---------|
| `users` | **ACTIVE** | User accounts, profiles, risk scoring, gamification |
| `orders` | **ACTIVE** | Payment orders (all methods) |
| `trading_accounts` | **ACTIVE** | Provisioned challenge accounts |
| `payouts` | **ACTIVE** | Payout requests and processing |
| `payout_timeline_events` | **ACTIVE** | Payout status history |
| `manual_payments` | **ACTIVE** | Manual bank transfer records |
| `webhook_logs` | **ACTIVE** | Payment webhook idempotency |

### Auth & Security
| Table | Status | Purpose |
|-------|--------|---------|
| `sessions` | **ACTIVE** | User sessions |
| `auth_methods` | **ACTIVE** | Email/password, OAuth methods |
| `permissions` | **ACTIVE** | RBAC permissions |
| `login_history` | **ACTIVE** | Login audit trail |
| `failed_attempts` | **ACTIVE** | Brute force protection |
| `two_factor_settings` | **ACTIVE** | 2FA configuration |

### KYC
| Table | Status | Purpose |
|-------|--------|---------|
| `kyc_submissions` | **ACTIVE** | KYC form submissions |
| `kyc_profiles` | **ACTIVE** | Verified identity data |
| `kyc_documents` | **ACTIVE** | Uploaded documents |
| `kyc_reviews` | **ACTIVE** | Admin review history |

### Fraud & Monitoring
| Table | Status | Purpose |
|-------|--------|---------|
| `fraud_events` | **ACTIVE** | Detected fraud signals |
| `device_history` | **ACTIVE** | FingerprintJS device tracking |
| `ip_history` | **ACTIVE** | IP usage patterns |
| `ip_lookups` | **ACTIVE** | IPQS results cache |
| `referral_fraud_logs` | **ACTIVE** | Referral abuse detection |
| `payment_fingerprints` | **ACTIVE** | Payment device correlation |
| `velocity_events` | **ACTIVE** | Rate-based fraud detection |
| `risk_profiles` | **ACTIVE** | User risk assessments |
| `security_incidents` | **ACTIVE** | Security events |
| `rate_limit_violations` | **ACTIVE** | Rate limit breaches |

### Community & Content
| Table | Status | Purpose |
|-------|--------|---------|
| `community_posts` | **ACTIVE** | Forum posts |
| `community_comments` | **ACTIVE** | Comments |
| `community_likes` | **ACTIVE** | Likes |
| `conversations` | **ACTIVE** | DM conversations |
| `messages` | **ACTIVE** | DM messages |
| `blog_posts` | **ACTIVE** | Blog content (currently empty) |
| `contact_submissions` | **ACTIVE** | Contact form entries |
| `championship_registrations` | **ACTIVE** | Trading championship signups |
| `impact_donations` | **ACTIVE** | CSR donations |

### Affiliate
| Table | Status | Purpose |
|-------|--------|---------|
| `referrals` | **ACTIVE** | Referral tracking |

### Observability
| Table | Status | Purpose |
|-------|--------|---------|
| `system_errors` | **ACTIVE** | Error logging |
| `system_incidents` | **ACTIVE** | Incident tracking |
| `api_logs` | **ACTIVE** | API request logging |
| `payment_failures` | **ACTIVE** | Failed payment logging |
| `notification_failures` | **ACTIVE** | Failed notification logging |
| `audit_logs` | **ACTIVE** | Audit trail |

---

## Frozen Tables (Terminal engine — schema exists, feature-flagged OFF)

| Table | Status | Purpose |
|-------|--------|---------|
| `trading_orders` | **FROZEN** | Simulated trade orders |
| `positions` | **FROZEN** | Open positions |
| `executions` | **FROZEN** | Trade execution records |
| `trade_logs` | **FROZEN** | Execution audit trail |
| `challenge_state` | **FROZEN** | Terminal challenge state |
| `market_snapshots` | **FROZEN** | Simulated market data |
| `market_ticks` | **FROZEN** | Tick-by-tick prices |
| `market_ohlc` | **FROZEN** | Candlestick data |
| `options_snapshots` | **FROZEN** | Options chain data |
| `options_contracts` | **FROZEN** | Options contracts |
| `discipline_scores` | **FROZEN** | AI discipline analysis |
| `behavior_patterns` | **FROZEN** | AI behavior analysis |
| `session_analytics` | **FROZEN** | Trading session stats |
| (+ 10 more market data tables) | **FROZEN** | |

**These tables hold ZERO production data. The terminal was a prototype that never went live.**

---

## Legacy Tables — DROPPED (0 rows confirmed)

These 11 tables had zero rows and have been identified for removal:

| Table | Status | Reason |
|-------|--------|--------|
| `challenge_accounts` | **DEAD** | 0 rows, no frontend consumers |
| `challenge_rules` | **DEAD** | 0 rows |
| `challenge_progress` | **DEAD** | 0 rows |
| `funded_accounts` | **DEAD** | 0 rows |
| `breach_events` | **DEAD** | 0 rows |
| `risk_events` | **DEAD** | 0 rows |
| `account_locks` | **DEAD** | 0 rows |
| `payout_eligibility` | **DEAD** | 0 rows |
| `payout_reviews` | **DEAD** | 0 rows |
| `account_states` | **DEAD** | 0 rows |
| `funding_events` | **DEAD** | 0 rows |

**Drop script exists at `scripts/db-cleanup/02_drop.sql` with safety checks. NOT yet executed.**

---

## Schema Issues

1. **`clerkId` column naming** — Column is `clerk_id` but system uses Supabase. The field stores Supabase user IDs now. Cosmetic but confusing.
2. **`trading_accounts.userId`** — Text type, not FK-referencing users.id (UUID). Application-level join only.
3. **`orders.userId`** — Text type, same issue as above.
4. **No automated trading data** — `trading_accounts` has `current_balance`, `profit_loss`, `daily_drawdown` columns that are SET ON CREATION and NEVER UPDATED automatically.

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Active core tables | ~45 | ✅ Live, queried |
| Frozen terminal tables | ~25 | ⚠️ Schema exists, no data flow |
| Dead legacy tables | 11 | ❌ 0 rows, pending drop |
| Total schema tables | ~80+ | |

**Database Verdict: LIVE and FUNCTIONAL for payment collection, user management, KYC, and admin. NOT functional for trade tracking or challenge evaluation.**
