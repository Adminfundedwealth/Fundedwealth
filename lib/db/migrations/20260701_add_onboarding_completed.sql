-- Add onboarding_completed flag to public.users.
-- Gates the one-time /auth/create-password page: once true, the token is inert.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
