# Deployment Checklist — FundedWealth (Production‑Ready)

This checklist contains exact GitHub secrets / env vars, required approvals, health checks, rollback commands, monitoring gate queries (Prometheus & Sentry), and a safe production deployment sequence. Do not run anything in production until you've tested the steps in staging.

---

## 1) Exact GitHub secrets and environment variables (names)

Add these secrets under **Settings → Secrets → Actions** or per‑Environment (`development`, `staging`, `production`) as appropriate.

- `DOCKER_REGISTRY_HOST` — registry host (e.g. `ghcr.io` or `registry.example.com`).
- `DOCKER_REGISTRY_USERNAME` — registry username (or `USER`).
- `DOCKER_REGISTRY_PASSWORD` — registry password / token.
- `KUBE_CONFIG_BASE64` — base64 encoded kubeconfig file for the target cluster (per environment).
- `DEPLOY_DISCORD_WEBHOOK` — Discord webhook URL for deploy notifications.
- `HEALTHCHECK_URL` — health check URL used by workflows (e.g. `https://api.prod.example.com/health`).
- `SENTRY_AUTH_TOKEN` — Sentry API auth token (scoped minimal: `event:read`/`project:read`).
- `SENTRY_ORG` — Sentry organization slug.
- `SENTRY_PROJECT` — Sentry project slug (or list per service).
- `PROMETHEUS_URL` — Prometheus HTTP API base URL (e.g. `https://prom.example.com`).
- `PROMETHEUS_BEARER` — (optional) Bearer token for Prometheus HTTP API if protected.
- `INFLUX_URL` (optional) — InfluxDB write URL for time-series metrics.
- `INFLUX_TOKEN` (optional) — token for Influx writes.

Per‑environment guidance:
- Set the above as environment‑scoped secrets in GitHub (Environment: `development`, `staging`, `production`) so each environment uses its own kubeconfig and registry credentials.

---

## 2) Required approvals and branch protections

Configure the following in GitHub settings before allowing automatic production deployments:

- Branch protection for `main` and `staging`:
  - Require pull request reviews before merging (1+ approver for staging, 2+ for main/production).
  - Require status checks to pass: `CI` workflow (lint/test/typecheck/build).
  - Require deployment approvals for `production` environment (enable `Wait for approval` on environment with required approvers).

- GitHub Environments:
  - Create `development`, `staging`, `production` environments.
  - Add environment secrets for each environment and configure required reviewers for `production`.

---

## 3) Health checks (exact endpoints & commands)

Primary health endpoint (required): `HEALTHCHECK_URL` should return HTTP 200 and a JSON body indicating dependent statuses.

Example health endpoints to implement and verify:
- `GET /health` — overall status (DB, cache, required external services)
- `GET /health/db` — DB connectivity
- `GET /health/cache` — Redis connectivity

Workflow's post-deploy health-check logic (replicated locally):
```bash
# Poll health endpoint (60s total, 5s interval)
ENDPOINT="${HEALTHCHECK_URL}"
for i in {1..12}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT") || STATUS=0
  echo "health check status: $STATUS"
  if [ "$STATUS" = "200" ]; then echo "healthy"; exit 0; fi
  sleep 5
done
echo "Health check failed"; exit 1
```

Also run smoke checks (post‑deploy):
```bash
curl -fsS -H "Authorization: Bearer <test-token>" https://api.STAGING.example.com/api/orders | jq '.[0]'
curl -fsS https://api.STAGING.example.com/dashboard | head -n 10
```

---

## 4) Monitoring gates (Prometheus & Sentry) — exact queries and scripts

Set these gates as checks in the deploy pipeline (run after build, before promote to prod), and fail if thresholds exceeded.

Prometheus checks (HTTP API):

- API error rate (5m window) — fail if >= 2%:
  Prometheus query (numerator):
  ```text
  sum(rate(http_requests_total{job="api",status=~"5.."}[5m]))
  ```
  Prometheus query (denominator):
  ```text
  sum(rate(http_requests_total{job="api"}[5m]))
  ```
  Bash snippet to compute error rate (requires `jq`):
  ```bash
  PROM="$PROMETHEUS_URL"
  NUM=$(curl -s "$PROM/api/v1/query?query=$(printf "%s" 'sum(rate(http_requests_total{job="api",status=~"5.."}[5m]))' | jq -s -R -r @uri)" | jq -r '.data.result[0].value[1] // 0')
  DEN=$(curl -s "$PROM/api/v1/query?query=$(printf "%s" 'sum(rate(http_requests_total{job="api"}[5m]))' | jq -s -R -r @uri)" | jq -r '.data.result[0].value[1] // 0')
  ERR_RATE=0
  if (( $(echo "$DEN > 0" | bc -l) )); then ERR_RATE=$(echo "$NUM / $DEN" | bc -l); fi
  echo "error_rate=$ERR_RATE"
  if (( $(echo "$ERR_RATE >= 0.02" | bc -l) )); then echo "ERROR: high API error rate"; exit 1; fi
  ```

- DB 95th percentile latency (5m) — fail if > 500ms (tune to your SLA):
  Example metric name: `pg_query_duration_seconds_bucket` or app-specific `db_query_latency_ms`
  Query example (if you export `db_query_latency_ms` in prometheus):
  ```text
  histogram_quantile(0.95, sum(rate(db_query_latency_seconds_bucket[5m])) by (le))
  ```

Sentry checks (example using Sentry Issues API)

- Check number of new errors in last 5 minutes for `SENTRY_PROJECT`:
  ```bash
  # requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
  curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
    "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?statsPeriod=5m" | jq '. | length'
  # or use sentry-cli / Discover API for more precise event counts
  ```
  Fail if the number of new issues or event count > configured threshold (e.g., > 5 new issues in 5m).

Notes:
- Prometheus queries must match your instrumentation: adapt labels and metric names to your setup.
- If Prometheus is protected, use `PROMETHEUS_BEARER` and `Authorization: Bearer $PROMETHEUS_BEARER` header.

---

## 5) Rollback steps (exact commands)

1. Quick service selector rollback (fastest):

```bash
# Inspect existing color deployments
kubectl -n fundedwealth get deploy -l app=api-server -o custom-columns=NAME:.metadata.name,COLO R:.spec.template.metadata.labels.color

# Patch service selector back to the previous color (replace <old-color> with 'blue' or 'green')
kubectl -n fundedwealth patch svc api-server -p '{"spec":{"selector":{"app":"api-server","color":"<old-color>"}}}'
```

2. Rollback a deployment using kubectl rollout undo:
```bash
kubectl -n fundedwealth rollout undo deploy/api-server-green
# or
kubectl -n fundedwealth rollout undo deploy/api-server-blue
```

3. Re-deploy a previous image tag (if old deployment removed):
```bash
./scripts/deploy_blue_green.sh --image "registry.example.com/fundedwealth/api-server:<previous-tag>" --namespace fundedwealth --service api-server
```

4. Emergency: scale replicas to 0 (if needed, temporarily stop new pods):
```bash
kubectl -n fundedwealth scale deploy api-server-green --replicas=0 || true
kubectl -n fundedwealth scale deploy api-server-blue --replicas=0 || true
# then restore the desired deployment
```

Data loss warning: rolling back does not revert DB schema changes. If the deploy included migrations, create a safe rollback migration or follow your DB migration rollback policy.

---

## 6) Safe production deployment sequence (exact steps)

1) Pre-deploy (local / CI):
   - Merge feature branch into `dev` → CI runs tests. Validate build artifacts. Run unit & integration tests.
   - Push image to registry with tag `sha-<commit>`.

2) Deploy to Development (automated):
   - Workflow deploys to `dev` cluster/namespace using `KUBE_CONFIG_BASE64` for development environment. Validate `/health` and run smoke tests.

3) Staging verification (manual approval recommended):
   - Merge to `staging` or raise PR to promote. CI builds image and workflow deploys to `staging` cluster.
   - Run automated smoke tests and load tests (k6). Generate `summary-<VUS>.json` and examine errors, p95 latency.
   - Verify Prometheus and Sentry gates: run the monitoring gate scripts above. Wait for metrics to stabilize (5–10 minutes).
   - If tests pass and stakeholders approve, mark `staging` successful.

4) Production promotion (manual approval required):
   - Require at least one production approver in GitHub Environment for `production`.
   - Merge to `main` branch (protected); CI runs final build and `deploy.yml` triggers.
   - `deploy.yml` builds & pushes image, then runs `scripts/deploy_blue_green.sh` in the production cluster.
   - Workflow runs post-deploy health checks and monitoring gates (Prometheus + Sentry). If any gate fails, the job fails and Discord notification is sent.

5) Post-deploy verification (5–30 minutes):
   - Run end-to-end smoke tests and small load tests against production.
   - Monitor Prometheus dashboards and Sentry for error spikes.
   - If problems observed, follow rollback steps above.

6) Post-mortem / audit
   - If deploy failed or rollback occurred, capture logs, k6 summaries, Sentry events, and DB slow queries. Create an incident report and follow remediation.

---

## 7) Quick local test commands (staging simulation)

# Build and push a test image (local dev machine)
```bash
docker build -t registry.example.com/fundedwealth/api-server:manual-test .
docker push registry.example.com/fundedwealth/api-server:manual-test
```

# Use a staging kubeconfig (copy to local file `kubeconfig` first)
```bash
cp ~/.kube/staging-config kubeconfig
./scripts/deploy_blue_green.sh --image "registry.example.com/fundedwealth/api-server:manual-test" --namespace fundedwealth --service api-server
```

# Run health and smoke checks
```bash
curl -fS $HEALTHCHECK_URL
curl -fS -H "Authorization: Bearer <test-token>" https://staging-api.example.com/api/orders | jq .
```

---

## 8) Notes & best practices
- Keep kubeconfigs minimal-privilege and rotate credentials regularly.
- Use per-environment secrets in GitHub Environments instead of repository-level secrets when possible.
- Ensure the `HEALTHCHECK_URL` checks downstream dependencies (DB, cache) and uses a short response time.
- For DB migrations, adopt a zero-downtime migration strategy (backward-compatible migrations first), and avoid destructive schema changes during deploy.
- Consider adding a Prometheus/Sentry deploy gate action in `deploy.yml` to automate monitoring checks before finalizing production promotion.

---

If you want, I can now generate a short `gh` CLI script to create these GitHub secrets and environments locally (artifact-only), or add a deploy-gate job that queries Prometheus & Sentry and fails the workflow when thresholds are exceeded.
