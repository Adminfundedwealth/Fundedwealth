# Database Cleanup — Legacy Challenge Engine

## Date: 2026-06-21

## Tables Being Removed (11)

| # | Table | Owner System | Rows | FK Parent |
|---|-------|-------------|------|-----------|
| 1 | `payout_reviews` | Challenge Engine | 0 | `payout_eligibility`, `challenge_accounts` |
| 2 | `payout_eligibility` | Challenge Engine | 0 | `challenge_accounts` |
| 3 | `account_states` | Challenge Engine | 0 | `challenge_accounts`, `funded_accounts` |
| 4 | `funding_events` | Challenge Engine | 0 | `challenge_accounts`, `funded_accounts` |
| 5 | `funded_accounts` | Challenge Engine | 0 | `challenge_accounts` |
| 6 | `breach_events` | Challenge Engine | 0 | `challenge_accounts` |
| 7 | `risk_events` | Challenge Engine | 0 | `challenge_accounts` |
| 8 | `account_locks` | Challenge Engine | 0 | `challenge_accounts` |
| 9 | `challenge_progress` | Challenge Engine | 0 | `challenge_accounts` |
| 10 | `challenge_accounts` | Challenge Engine | 0 | `challenge_rules` |
| 11 | `challenge_rules` | Challenge Engine | 0 | (none) |

## Tables NOT Touched (verified safe)

- `trading_accounts` — Active purchase flow
- `users` — Core auth
- `orders` — Payment orders
- `payouts` — Withdrawal system
- `payout_timeline_events` — Payout tracking
- `kyc_submissions`, `kyc_profiles`, `kyc_documents`, `kyc_reviews` — KYC
- `referrals` — Affiliate
- `community_posts`, `community_comments`, `community_likes` — Community
- `manual_payments` — Payment system
- `notifications` — Notification system
- `webhook_logs` — Payment webhooks

## Execution Order

```
1. Run 01_backup.sql    → Creates _backup_* copies of all 11 tables
2. Verify backups       → Run commented verification query in 01_backup.sql
3. Run 02_drop.sql      → Safety check (abort if any table has rows) + DROP
4. Verify drops         → Run commented verification query in 02_drop.sql
5. IF ROLLBACK NEEDED   → Run 03_rollback.sql to restore from backups
6. After 30 days stable → DROP TABLE _backup_* (cleanup backup tables)
```

## Safety Features

- `02_drop.sql` aborts automatically if ANY table has >0 rows
- `02_drop.sql` uses `DROP TABLE IF EXISTS CASCADE` for safety
- `02_drop.sql` also removes `challenge_account_id` and `rule_check_result` columns from `trading_orders`
- All operations are wrapped in `BEGIN/COMMIT` transactions
- Backup tables persist indefinitely until manually cleaned

## Rollback

Run `03_rollback.sql` to recreate all 11 tables with original schemas, indexes, and data from backup copies. Also re-adds the FK columns to `trading_orders`.

## Pre-Execution Checklist

- [ ] All challenge engine routes confirmed disabled (returning 410)
- [ ] TERMINAL_ENABLED=false confirmed in production env
- [ ] No frontend page calls any challenge/funded endpoint
- [ ] Backup verified with row count query
- [ ] Team notified of planned maintenance window
