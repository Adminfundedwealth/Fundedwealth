# Database Outage Audit

**Date:** 2026-06-15
**Status:** ❌ Database connection DEAD

## Evidence

### /api/health
```json
{"status":"ok","databaseHealthy":false}
```

### /api/monitor/db-health
```json
{"healthy":false,"error":"Failed query: SELECT 1\nparams: "}
```

### Supabase Project Status
- REST API at `nysrxvpjdlvzvcawysvh.supabase.co`: ✅ REACHABLE (returns auth errors = project alive)
- PostgreSQL via `DATABASE_URL`: ❌ DEAD (`SELECT 1` fails)

## Root Cause Analysis

The `SELECT 1` failure with no specific error message means the `pg.Pool` cannot establish a TCP connection to the database host.

## Most Likely Cause: Supabase Free Tier Database Paused

Supabase free-tier projects **automatically pause the database after 1 week of inactivity**. When paused:
- REST API still responds (it's a separate service)
- Auth still works
- But PostgreSQL connections are refused
- `SELECT 1` fails with no error detail

## Verification Steps (YOU must do)

### 1. Check Supabase Dashboard
Go to: https://supabase.com → Your Project → Settings → General
- If you see "Project is paused" → Click "Restore project"
- If restored, wait 2 minutes, then test: `curl https://fundedwealth-api-mwj6.onrender.com/api/monitor/db-health`

### 2. Verify DATABASE_URL on Render
- Render Dashboard → fundedwealth-api-mwj6 → Environment
- `DATABASE_URL` should be: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
- Port MUST be `6543` (connection pooler), NOT `5432` (direct)
- If using direct connection (port 5432), Supabase may block it from non-whitelisted IPs

### 3. Test Connection Manually
From Supabase SQL Editor: `SELECT 1;`
- If this works → DATABASE_URL on Render is wrong or expired
- If this fails → project is paused or quota exceeded

## Connection Configuration

**File:** `lib/db/src/index.ts`
```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000,
  max: 10,
  query_timeout: 30000,
});
```

## Action Required

1. Open Supabase Dashboard → check if project is paused → restore
2. Verify DATABASE_URL uses pooler port 6543
3. After restore, restart Render service

## After Fix Expected Result
```json
{"healthy":true,"error":null}
```
