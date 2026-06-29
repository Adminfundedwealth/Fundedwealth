-- ============================================================================
-- Migration: Add payment_type and metadata columns to public.orders
-- Date: 2026-06-29
-- Purpose: Align live DB with Drizzle schema — fixes HTTP 500 on verify-utr
-- Target: Shared Supabase project nysrxvpjdlvzvcawysvh
--
-- ROOT CAUSE: Drizzle schema defines payment_type and metadata columns that
-- were never added to production. Every SELECT from orders includes these
-- columns, causing PostgreSQL error 42703 "column does not exist".
--
-- SAFETY: Uses IF NOT EXISTS pattern (ADD COLUMN IF NOT EXISTS requires PG 9.6+).
-- Safe to re-run.
-- ============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'challenge';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata TEXT;
