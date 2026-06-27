# Deployment Guide — FundedWealth

This guide describes the CI/CD pipelines, environments, deployment strategy (blue-green), rollback, CDN config, monitoring gates, and notifications.

1) GitHub Actions workflows (added)
- `.github/workflows/ci.yml` — runs lint, typecheck, tests, security audit, build on PRs and pushes.
- `.github/workflows/deploy.yml` — builds Docker image, pushes to registry, performs blue-green deploy to Kubernetes using `scripts/deploy_blue_green.sh` and notifies Discord.

2) Environments
- Branch mapping:
  - `dev` -> Development environment
  - `staging` -> Staging environment
  - `main` -> Production environment
- Each environment should have separate Kubernetes clusters / namespaces and separate secrets (kubeconfig, registry creds, feature flags, DB credentials).
- GitHub Environments: configure `development`, `staging`, `production` with required reviewers and secrets.

3) Deployment flow (blue-green)
- On push to `dev|staging|main`, workflow builds Docker image and pushes to configured registry.
- `deploy.yml` calls `scripts/deploy_blue_green.sh` with the new image. The script:
  - Creates a new deployment named `api-server-green` or `api-server-blue` with label `color: green|blue`.
  - Waits for readiness, then patches the `Service` selector to the new color for zero-downtime switch.
  - Deletes the previous color deployment.
- Rollback: use `kubectl rollout undo deploy/<deployment-name>` or re-run the script to deploy the previous image tag. For immediate rollback, patch the `Service` selector back to the previous color.

4) Zero-downtime & health checks
- The deployment uses readiness probes (`/health`) to avoid routing traffic to unready pods.
- `deploy.yml` includes a post-deploy health check that will fail the job if `/health` does not return `200` within the timeout.

5) CDN & Static assets
- Build pipeline should emit static assets to a build output (e.g., `build/` or `dist/`).
- Recommended CDN flow:
  - Upload static assets (JS/CSS/images) to an object store (S3 or equivalent) and serve via CDN (CloudFront, Cloudflare) with long cache TTLs and cache-busting filenames.
  - Set `Cache-Control: public, max-age=31536000, immutable` for hashed assets and shorter TTL for index.html.
  - Invalidate CDN on deploy for non-hashed assets only.

6) Monitoring & fail-deploy gates
- `ci.yml` gates: tests and lint must pass.
- `deploy.yml` gates: post-deploy health check must pass.
- Additional fail-deploy checks (recommended):
  - Query error rate in monitoring (Prometheus/Sentry) for the last 5 minutes; fail if too high.
  - Run automated smoke tests against key endpoints.

7) Notifications
- Discord: `deploy.yml` posts to `DEPLOY_DISCORD_WEBHOOK` on success/failure.
- Email: configure GitHub Actions to send email via SMTP or use service (SES) to notify on failure/success using a custom action.

8) Rollback support
- To rollback to previous deployment color:
  - Patch service selector back: `kubectl -n <ns> patch svc api-server -p '{"spec":{"selector":{"app":"api-server","color":"blue"}}}'`
  - Optionally re-deploy previous image tag.

9) Secrets & environment variables
- Required secrets per environment (store in GitHub Secrets / Environments):
  - `DOCKER_REGISTRY_HOST`, `DOCKER_REGISTRY_USERNAME`, `DOCKER_REGISTRY_PASSWORD`
  - `KUBE_CONFIG_BASE64` (base64-encoded kubeconfig for cluster)
  - `DEPLOY_DISCORD_WEBHOOK`
  - `HEALTHCHECK_URL`

10) Access & permissions
- CI runners need permissions to push images to your registry and to deploy to Kubernetes (kubeconfig with deploy rights). Use minimal-privilege service accounts for production.

11) Next steps / hardening
- Add GitHub branch protection rules and required status checks (CI) for `main` and `staging`.
- Add audit logs and role separation for deployment approvals for `production` environment.
- Add canary/traffic-shifting (Istio/Argo Rollouts) for gradual rollouts.
