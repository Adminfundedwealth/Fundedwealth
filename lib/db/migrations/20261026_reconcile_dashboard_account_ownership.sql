-- Restore an unambiguous purchase -> account -> customer link for legacy data.
-- Accounts are linked only through provisioning records; ambiguous links are
-- intentionally left unchanged for manual review.

ALTER TABLE public.trading_accounts
  ADD COLUMN IF NOT EXISTS order_id TEXT;

CREATE INDEX IF NOT EXISTS trading_accounts_order_id_idx
  ON public.trading_accounts(order_id);

WITH candidate_order_links AS (
  SELECT DISTINCT
    COALESCE(pl.trading_account_id, ta.id)::text AS trading_account_id,
    pl.order_id
  FROM public.provisioning_logs pl
  LEFT JOIN public.trading_accounts ta
    ON ta.id::text = pl.trading_account_id::text
    OR ta.challenge_id::text = pl.challenge_account_id::text
  WHERE pl.order_id IS NOT NULL
    AND (pl.trading_account_id IS NOT NULL OR pl.challenge_account_id IS NOT NULL)
),
unambiguous_account_orders AS (
  SELECT
    trading_account_id,
    MIN(order_id) AS order_id
  FROM candidate_order_links
  WHERE trading_account_id IS NOT NULL
  GROUP BY trading_account_id
  HAVING COUNT(DISTINCT order_id) = 1
)
UPDATE public.trading_accounts ta
SET order_id = candidate.order_id
FROM unambiguous_account_orders candidate
WHERE ta.id::text = candidate.trading_account_id
  AND ta.order_id IS NULL;

-- Some legacy orders stored auth.users.id instead of public.users.id. Reassign
-- only when a paid/confirmed order maps by case-insensitive email to one profile.
WITH linked_orders AS (
  SELECT DISTINCT order_id
  FROM public.provisioning_logs
  WHERE order_id IS NOT NULL
    AND (trading_account_id IS NOT NULL OR challenge_account_id IS NOT NULL)

  UNION

  SELECT order_id
  FROM public.trading_accounts
  WHERE order_id IS NOT NULL
),
candidate_order_owners AS (
  SELECT
    o.id AS order_id,
    u.id AS user_id
  FROM public.orders o
  INNER JOIN linked_orders linked ON linked.order_id = o.id
  INNER JOIN auth.users auth_user ON auth_user.id::text = o.user_id::text
  INNER JOIN public.users u
    ON lower(trim(u.email)) = lower(trim(auth_user.email))
  WHERE lower(o.status) IN ('paid', 'confirmed')
    AND auth_user.email IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.users existing_owner
      WHERE existing_owner.id::text = o.user_id::text
    )
  GROUP BY o.id, u.id
),
unambiguous_order_owners AS (
  SELECT
    order_id,
    MIN(user_id::text) AS user_id
  FROM candidate_order_owners
  GROUP BY order_id
  HAVING COUNT(DISTINCT user_id) = 1
)
UPDATE public.orders o
SET user_id = owner.user_id
FROM unambiguous_order_owners owner
WHERE o.id = owner.order_id
  AND o.user_id::text <> owner.user_id;
