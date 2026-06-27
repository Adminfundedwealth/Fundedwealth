-- ============================================================
-- FundedWealth: Supabase Auth Migration SQL
-- Run this in Supabase SQL Editor BEFORE deploying the new code
-- ============================================================

-- 1. Ensure email column has a unique index for auto-linking
-- (Users previously linked by Clerk ID now need email-based lookup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
ON users (email) WHERE email IS NOT NULL AND email != '';

-- 2. Add index on clerkId for fast lookups (already exists but ensure it)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);

-- 3. Verify existing admin user has proper role
-- Update this email to match your admin email
UPDATE users SET role = 'admin' 
WHERE email = 'fundedwealth.ind@gmail.com' AND role != 'admin';

-- 4. Optional: View current users for migration planning
-- SELECT id, email, clerk_id, role, created_at FROM users ORDER BY created_at DESC LIMIT 20;

-- ============================================================
-- IMPORTANT: Configure in Supabase Dashboard:
-- 1. Authentication → Providers → Enable Email
-- 2. Authentication → Providers → Enable Google (add OAuth creds)
-- 3. Authentication → URL Configuration → Set redirect URLs:
--    - https://www.fundedwealth.com/auth/callback
--    - https://fundedwealth.com/auth/callback
--    - http://localhost:5200/auth/callback
-- 4. Authentication → Email Templates → Customize if needed
-- ============================================================
