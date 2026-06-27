PHASE 12 — Controlled Beta Launch (FundedWealth)

Goal: Prepare FundedWealth for a controlled beta launch with staged ramp (10 → 50 → 100 users). No product feature work — focus on operational readiness, monitoring, feedback, support, and safe launch procedures.

Prereqs:
- Confirm deployments (staging/production) point to correct DB and secrets.
- Ensure backups and rollback process are tested.
- Have at least 2 staff on-call (Support + Engineering) for the first 72 hours.

Checklist (high-level):

1) Beta Access System (ops)
- Generate invite codes (use `scripts/generate_invite_codes.ts`) and import as needed.
- Maintain a simple CSV of invites and assigned emails.
- Establish a single waitlist ingestion point (spreadsheet/SaaS form) and an operator who reconciles signups to invites.

2) Admin Monitoring
- Ensure `GET /api/monitor` and `GET /api/monitor/errors` are reachable from admin network.
- Import alert-rule templates in `monitoring/alert_rules_templates.json` (email targets). Review notifyEmails.
- Verify payment failure monitoring (`/api/monitor/payments`) and test a synthetic payment failure.

3) Feedback collection
- Deploy a simple feedback form (link) and webhook to record entries into `contact_submissions` or a dedicated `feedback` table.
- Use `docs/feedback_system.md` for templates and triage categories.

4) Support workflow
- Use `docs/support_workflow.md` for ticket intake, triage, escalation and SLAs.
- Configure a single ticket inbox and standard tags: bug, complaint, feature-request, payment, KYC, fraud.

5) Analytics & Dashboard
- Populate the daily operational dashboard (see `docs/daily_operational_dashboard.md`) with queries for signup conversion, challenge purchase conversion, completion, payout %, and retention.
- Configure a lightweight dashboard (Grafana / Metabase / internal page) to hit the monitoring endpoints and analytic queries.

6) Incident Response
- Confirm incident routing (pager, Slack #ops, email). Use `runbooks/incident_response.md` for playbooks.
- Create Incident SLAs: P0 (15m), P1 (1h), P2 (4h) for detection→response times.

7) Operational Run
- Staged ramp: onboard 10 users (24–48h), observe, then 50 (48–72h), then 100.
- During ramp enable: extra logging, manual payout review, nightly sync meetings.

8) Go/no-go gates (for each ramp step)
- No increase until: open incidents = 0 (or mitigated), payment failures < threshold, support queue < 5 tickets, fraud flags reviewed.

Post-launch
- Hold daily standups with Support/Finance/Engineering for first 7 days.
- Capture all lessons in `PHASE_12_POSTMORTEM.md`.

Files added in this phase (operational artifacts):
- `scripts/generate_invite_codes.ts`
- `monitoring/alert_rules_templates.json`
- `docs/support_workflow.md`
- `docs/feedback_system.md`
- `docs/daily_operational_dashboard.md`
- `runbooks/incident_response.md`
