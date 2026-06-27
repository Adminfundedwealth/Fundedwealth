# Incident Response Runbook — Critical Issue Handling

Scope: P0/P1 incidents (outage, data loss, mass payment failure, critical security/fraud event).

1) Detection
- Monitor alerting channels (email, Slack, PagerDuty). Alerts from `monitoring` API should create incidents automatically.

2) Triage
- Confirm scope (how many users, which services, extent of impact).
- Classify severity (P0/P1/P2) and create incident in `GET /api/monitor/incidents` if not auto-created.

3) Communication
- Post initial incident message to #ops with summary, impact, and owners.
- Notify Finance and Compliance if payouts or fraud are involved.
- Update stakeholders every 30 minutes for P0 until resolved.

4) Mitigation & Rollback
- If a code release caused the issue, coordinate with deploy owner to rollback to last known good release.
- If DB is implicated, run read-only mode and stop background jobs that mutate critical tables.

5) Recovery
- Validate system health via `GET /api/monitor/health` and `GET /api/monitor/db-health`.
- Run smoke tests (signups, login, fetch account) before lifting restrictions.

6) Post-incident
- Document timeline, root cause, mitigations, and corrective actions in `PHASE_12_POSTMORTEM.md`.
- Add alert rules or instrumentation missing that would improve time-to-detect.

Contacts (fill real contacts before launch):
- On-call Engineer: eng-oncall@example.com
- Support lead: support@example.com
- Finance lead: finance@example.com
- Compliance lead: compliance@example.com
