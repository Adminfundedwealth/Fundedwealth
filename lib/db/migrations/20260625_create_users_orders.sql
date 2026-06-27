-- ============================================================================
-- Migration: Create public.users and public.orders tables
-- Date: 2026-06-25
-- Purpose: Phase 1 — Main-site core commerce tables
-- Target: Shared Supabase project nysrxvpjdlvzvcawysvh
-- 
-- SAFETY: Uses IF NOT EXISTS guards. Safe to re-run.
-- SCOPE: Does NOT touch any terminal-owned tables.
-- ============================================================================

-- ── public.users ─────────────────────────────────────────────────────────────
-- Customer identity / CRM profile table.
-- Links to auth.users via clerk_id column (stores Supabase auth.users.id UUID).
-- Used by: routes/users.ts, routes/payments.ts, routes/payouts.ts,
--          routes/affiliate.ts, middlewares/supabaseAuth.ts, and most other routes.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,
  notification_settings TEXT NOT NULL DEFAULT '{"emailAlerts":true,"whatsappAlerts":false,"inAppAlerts":true,"payoutAlerts":true,"tradeAlerts":true,"marketingAlerts":false}',
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Fraud enforcement
  risk_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'LOW',
  account_status TEXT DEFAULT 'active',
  -- Gamification
  experience_points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'Beginner',
  achievement_count INTEGER NOT NULL DEFAULT 0,
  streak_points INTEGER NOT NULL DEFAULT 0,
  public_profile BOOLEAN NOT NULL DEFAULT false,
  total_payout INTEGER NOT NULL DEFAULT 0,
  -- Withdrawal payment details
  upi_id TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  bank_name TEXT,
  preferred_payout_method TEXT DEFAULT 'UPI',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_affiliate_code_idx ON public.users(affiliate_code);


-- ── public.orders ────────────────────────────────────────────────────────────
-- Commercial purchase/order table.
-- Represents a challenge purchase attempt and its payment lifecycle.
-- Links to users via user_id (text representation of users.id UUID).
-- Used by: routes/payments.ts, routes/razorpay.ts, terminal provisioning linkage.

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  account_size INTEGER,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  utr_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_method_idx ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);
