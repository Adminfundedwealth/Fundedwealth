# Migration README — Add Alert Targets (Discord / WhatsApp)

Summary
- Purpose: Add optional notification targets to `alert_rules` so alert rules can include Discord webhook URLs and WhatsApp destination numbers.
- Migration file: `lib/db/migrations/20260519_add_alert_targets.sql`
- Rollback file: `lib/db/migrations/20260519_remove_alert_targets_rollback.sql`

Changed / Created files (artifact-only)
- `lib/db/migrations/20260519_add_alert_targets.sql` — ALTER TABLE to add two JSONB columns.
- `lib/db/migrations/20260519_remove_alert_targets_rollback.sql` — rollback SQL that drops those columns inside a transaction.
- `lib/db/src/schema/alert-rules.ts` — Drizzle schema updated to include `notifyDiscordWebhooks` and `notifyWhatsAppNumbers` fields.
- `artifacts/api-server/src/lib/monitoring-service.ts` — monitoring service extended to read/dispatch to the new fields (Discord webhooks, WhatsApp webhook proxy).
- `artifacts/api-server/src/lib/payout-eligibility-engine.ts` — observability hook additions (no DB schema changes here).

Exact DB/schema changes
- Table: `alert_rules`
  - Added column: `notify_discord_webhooks` JSONB NULLABLE
  - Added column: `notify_whatsapp_numbers` JSONB NULLABLE

Notes about the schema changes
- Both columns are JSONB and optional (nullable). They are intended to store arrays, e.g.:
  - `notify_discord_webhooks`: `["https://discord.com/api/webhooks/....", ...]` or array of objects `{ url: "...", name: "..." }` depending on application usage.
  - `notify_whatsapp_numbers`: `[{ "number": "+1555..." }, "+1555...", ...]` or similar object/primitive forms.
- No indexes were added — queries load the full alert rule by `event_type`/`enabled` and evaluate `condition` in application code.

Rollback steps and considerations
- Rollback file: `lib/db/migrations/20260519_remove_alert_targets_rollback.sql` runs:
  - `ALTER TABLE IF EXISTS alert_rules DROP COLUMN IF EXISTS notify_discord_webhooks, DROP COLUMN IF EXISTS notify_whatsapp_numbers;` inside a transaction.
- Important: Dropping columns permanently deletes any data stored there. Backup before rollback if data must be preserved.
- Ensure application code no longer references these columns before running rollback. Deploy code rollback first, then run the rollback migration.

Production impact & risk assessment
- Add migration (safe): Adding nullable columns without defaults is a fast metadata-only operation in Postgres and is safe to run on large tables. Risk is low.
- Application compatibility (risk): If application code expects these columns (Drizzle schema updated), run the migration before deploying the new application version; otherwise, runtime errors occur.
- Rollback (high-risk): Dropping columns permanently removes data. Only run rollback if you are sure the data is not needed, or after backing up.
- Downtime: Neither add nor drop requires downtime for metadata-only operations, but coordinate deployment to avoid transient schema mismatches.

Mitigations
- Run migrations first in dev/staging, then deploy app changes that rely on the columns.
- Backup production DB before rollback:
  - `pg_dump "$DATABASE_URL" -Fc -f /tmp/prod_backup_before_remove_alert_targets.dump`
- Use `IF NOT EXISTS` / `IF EXISTS` clauses (already included) so migrations are idempotent and safe to re-run.

Exact local commands (copy/paste)

# 1) Set DATABASE_URL (PowerShell example)
```powershell
$env:DATABASE_URL = "postgresql://username:password@host:5432/dbname"
```

# 2) Preview current `alert_rules` columns
```powershell
psql $env:DATABASE_URL -c "SELECT column_name,data_type FROM information_schema.columns WHERE table_name='alert_rules' ORDER BY ordinal_position;"
```

# 3) View the migration SQL
```powershell
Get-Content lib/db/migrations/20260519_add_alert_targets.sql
```

# 4) Backup DB (recommended before rollback or production work)
```bash
pg_dump "$DATABASE_URL" -Fc -f /tmp/prod_backup_before_alert_targets.dump
```

# 5) Apply migration using psql
```powershell
psql $env:DATABASE_URL -f lib/db/migrations/20260519_add_alert_targets.sql
```

# Alternative: Apply inline inside a transaction
```powershell
psql $env:DATABASE_URL -c "BEGIN; ALTER TABLE IF EXISTS alert_rules ADD COLUMN IF NOT EXISTS notify_discord_webhooks JSONB; ALTER TABLE IF EXISTS alert_rules ADD COLUMN IF NOT EXISTS notify_whatsapp_numbers JSONB; COMMIT;"
```

# 6) Apply via drizzle-kit (if you manage migrations with Drizzle)
```powershell
npx drizzle-kit push:pg --connectionString="$env:DATABASE_URL"
```

# 7) Verify migration applied
```powershell
psql $env:DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='alert_rules' ORDER BY ordinal_position;"
```

# 8) Rollback (if you must remove columns) — run only after backing up and removing code references
```powershell
psql $env:DATABASE_URL -f lib/db/migrations/20260519_remove_alert_targets_rollback.sql
```

# 9) Verify rollback applied
```powershell
psql $env:DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='alert_rules' ORDER BY ordinal_position;"
```

# 10) Git artifact steps (local only) — prepare commit and PR
```bash
git checkout -b feat/db-add-alert-targets
git add lib/db/migrations/20260519_add_alert_targets.sql lib/db/migrations/20260519_remove_alert_targets_rollback.sql lib/db/src/schema/alert-rules.ts artifacts/api-server/src/lib/monitoring-service.ts artifacts/api-server/src/lib/payout-eligibility-engine.ts
git commit -m "db(migrations): add notify_discord_webhooks & notify_whatsapp_numbers to alert_rules; include rollback"
git push -u origin feat/db-add-alert-targets
# Open PR using GitHub UI or gh CLI
```

Testing recommendations
- Apply migration in a fresh dev database, then run application unit/integration tests that exercise alert rule creation and delivery.
- Seed a sample alert rule row with both fields populated and ensure `monitoring-service` dispatches correctly (Discord webhook can be tested with a mock webhook endpoint).

Questions / next artifacts I can produce (no commits or DB access):
- A short PR description file for your branch.
- A small test SQL snippet to insert a sample rule including both new fields.
- A README snippet explaining expected JSON shapes for the two new columns.

