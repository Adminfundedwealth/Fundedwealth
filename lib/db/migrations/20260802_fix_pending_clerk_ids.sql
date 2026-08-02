-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Fix supabase_pending_* clerk_id rows
-- Date: 2026-08-02
-- 
-- Problem:
--   Users who registered via POST /api/auth/register get:
--     public.users.clerk_id = 'supabase_pending_<timestamp>'
--   This placeholder is NEVER updated to the real auth.users.id unless
--   the frontend fires POST /api/users/me after first login — which is
--   unreliable. Result: 100+ customers see zero accounts on dashboard
--   because GET /api/accounts/my looks up: WHERE clerk_id = auth.userId
--   and finds nothing.
--
-- Fix:
--   For every public.users row where clerk_id starts with 'supabase_pending_',
--   find the matching auth.users row by email and update clerk_id to the
--   real Supabase UUID.
--
--   Rows where no auth.users match exists are left untouched (user may not
--   have completed email verification yet).
-- ════════════════════════════════════════════════════════════════════════════

-- Step 1: Preview how many rows are affected (run SELECT first to verify)
-- SELECT 
--   u.id, u.email, u.clerk_id AS old_clerk_id, a.id AS new_clerk_id
-- FROM public.users u
-- JOIN auth.users a ON lower(a.email) = lower(u.email)
-- WHERE u.clerk_id LIKE 'supabase_pending_%'
-- ORDER BY u.created_at DESC;

-- Step 2: Apply the fix
UPDATE public.users u
SET 
  clerk_id   = a.id::text,
  updated_at = NOW()
FROM auth.users a
WHERE lower(a.email) = lower(u.email)
  AND u.clerk_id LIKE 'supabase_pending_%';

-- Step 3: Verify — should return 0 rows after migration
-- SELECT id, email, clerk_id FROM public.users WHERE clerk_id LIKE 'supabase_pending_%';
