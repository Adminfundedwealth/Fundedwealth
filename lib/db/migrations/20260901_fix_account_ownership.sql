-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Fix account ownership — re-link terminal_traders.external_id
-- Date: 2026-09-01
--
-- Problem 1 (from 20260802_fix_pending_clerk_ids.sql):
--   public.users.clerk_id contains 'supabase_pending_<timestamp>' or
--   'provisioned_<uuid>' placeholders for users who registered via
--   POST /api/auth/register but whose frontend never fired POST /api/users/me.
--   This causes GET /api/accounts/my to miss on the primary clerk_id lookup.
--   Fix: update clerk_id to the real auth.users.id matched by email.
--
-- Problem 2 (new):
--   terminal_traders.external_id was set to the Supabase auth.users.id (JWT sub)
--   in some early provisions, instead of the public.users.id (UUID).
--   The GET /api/accounts/my handler looks up terminal_traders WHERE external_id
--   = public.users.id, so these traders are never found, returning empty accounts.
--   Fix: update external_id to the correct public.users.id, matched by email.
--
-- SAFETY:
--   - Read-only audit SELECTs are commented out above each fix — run them first.
--   - Both UPDATEs are idempotent; re-running is safe.
--   - Neither update touches challenge_accounts, trading_accounts, or orders.
--   - No accounts are created, modified, or deleted.
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- FIX 1: public.users.clerk_id placeholder → real auth UUID
-- ────────────────────────────────────────────────────────────

-- AUDIT (run first to see affected rows):
-- SELECT
--   u.id, u.email, u.clerk_id AS placeholder_clerk_id, a.id AS real_auth_id
-- FROM public.users u
-- JOIN auth.users a ON lower(a.email) = lower(u.email)
-- WHERE u.clerk_id LIKE 'supabase_pending_%'
--    OR u.clerk_id LIKE 'provisioned_%'
-- ORDER BY u.created_at DESC;

UPDATE public.users u
SET
  clerk_id   = a.id::text,
  updated_at = NOW()
FROM auth.users a
WHERE lower(a.email) = lower(u.email)
  AND (
    u.clerk_id LIKE 'supabase_pending_%'
    OR u.clerk_id LIKE 'provisioned_%'
  );

-- VERIFY (should return 0 rows):
-- SELECT id, email, clerk_id FROM public.users
-- WHERE clerk_id LIKE 'supabase_pending_%' OR clerk_id LIKE 'provisioned_%';


-- ────────────────────────────────────────────────────────────
-- FIX 2: terminal_traders.external_id mismatch → public.users.id
-- ────────────────────────────────────────────────────────────
-- This re-links traders whose external_id is an auth UUID (or any stale
-- value) to the canonical public.users.id, using email as the join key.
-- Case-insensitive email match is safe — both tables enforce email uniqueness.

-- AUDIT (run first):
-- SELECT
--   tt.id             AS trader_id,
--   tt.email          AS trader_email,
--   tt.external_id    AS current_external_id,
--   u.id              AS correct_users_id,
--   u.clerk_id        AS users_clerk_id,
--   CASE
--     WHEN tt.external_id = u.id::text THEN 'OK — already correct'
--     ELSE 'MISMATCH — will be fixed'
--   END AS status
-- FROM terminal_traders tt
-- JOIN public.users u ON lower(u.email) = lower(tt.email)
-- ORDER BY status DESC;

UPDATE terminal_traders tt
SET
  external_id = u.id::text,
  updated_at  = NOW()
FROM public.users u
WHERE lower(u.email) = lower(tt.email)
  AND tt.external_id != u.id::text;

-- VERIFY (should return 0 mismatch rows):
-- SELECT tt.id, tt.email, tt.external_id, u.id AS users_id
-- FROM terminal_traders tt
-- JOIN public.users u ON lower(u.email) = lower(tt.email)
-- WHERE tt.external_id != u.id::text;


-- ────────────────────────────────────────────────────────────
-- SUMMARY CHECK — accounts visible after the fix
-- ────────────────────────────────────────────────────────────
-- SELECT
--   u.email,
--   tt.id         AS trader_id,
--   tt.external_id,
--   COUNT(ta.id)  AS trading_accounts,
--   COUNT(ca.id) FILTER (WHERE ca.status = 'active') AS active_challenges
-- FROM public.users u
-- JOIN terminal_traders tt ON tt.external_id = u.id::text
-- LEFT JOIN trading_accounts ta ON ta.trader_id = tt.id AND ta.status != 'inactive'
-- LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
-- GROUP BY u.email, tt.id, tt.external_id
-- ORDER BY u.email;
