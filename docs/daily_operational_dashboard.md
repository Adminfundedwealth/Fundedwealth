# Daily Operational Dashboard — Metrics & Example Queries

Purpose: daily view for operations (Support, Finance, Ops) showing revenue, payouts, active traders, support queue and key conversion metrics.

Recommended stack: Metabase / Grafana / internal admin page that queries the DB and monitoring endpoints.

Suggested tiles and example SQL (adjust schema/names if different):

- Revenue (last 24h):
  SELECT COALESCE(SUM(amount),0) AS revenue_24h FROM payouts WHERE status = 'COMPLETED' AND created_at > now() - interval '24 hours';

- Payouts (count + value last 24h):
  SELECT COUNT(*) AS cnt, COALESCE(SUM(amount),0) AS total FROM payouts WHERE created_at > now() - interval '24 hours';

- Active traders (last 7d daily MAU):
  SELECT date_trunc('day', last_active_at) AS day, COUNT(DISTINCT user_id) AS active_users
  FROM trading_accounts
  WHERE last_active_at > now() - interval '7 days'
  GROUP BY 1 ORDER BY 1;

- Signup conversion (visitors → signups):
  -- Requires event tracking; example using `api_logs` and `users`
  SELECT
    (SELECT COUNT(*) FROM users WHERE created_at > now() - interval '7 days') AS signups_7d,
    (SELECT COUNT(*) FROM api_logs WHERE path ILIKE '/landing%' AND created_at > now() - interval '7 days') AS visits_7d;

- Challenge purchase conversion:
  SELECT
    COUNT(*) FILTER (WHERE event = 'challenge_purchase')::int AS purchases,
    COUNT(*) FILTER (WHERE event = 'challenge_view')::int AS views,
    ROUND(100.0 * COUNT(*) FILTER (WHERE event = 'challenge_purchase') / NULLIF(COUNT(*) FILTER (WHERE event = 'challenge_view'),0),2) AS pct_conversion
  FROM event_log WHERE created_at > now() - interval '7 days';

- Challenge completion rate:
  SELECT
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completions,
    COUNT(*)::int AS attempts,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'COMPLETED') / NULLIF(COUNT(*),0),2) AS pct_complete
  FROM challenges WHERE created_at > now() - interval '30 days';

- Payout % (payouts issued / payouts requested):
  SELECT
    100.0 * SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END)::float / NULLIF(SUM(1)::float,0) AS payout_pct
  FROM payouts WHERE created_at > now() - interval '30 days';

- Retention (cohort example):
  -- New users last 30 days and next 7/14/30 day return rates (approximate)

Operational widgets:
- Open incidents (from /api/monitor/incidents)
- Recent errors (from /api/monitor/errors?limit=50)
- Payment failures (from /api/monitor/payments)
- Support queue depth (ticketing system query)

Notes:
- Validate table/column names in your environment and adjust queries.
- For early beta, prefer manual review of payouts and flag suspicious accounts for compliance.
