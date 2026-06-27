# Support Workflow — Beta (FundedWealth)

Objective: Provide a tight operational support process for beta users with clear triage, escalation, and SLAs.

Intake:
- Primary channel: support@fundedwealth.example (inbox or ticketing system).
- Secondary: in-app contact form (webhook → `contact_submissions` table) and phone for high-priority financial issues.

Ticket fields (required):
- User ID / email
- Category: bug | payment | payout | KYC | fraud | complaint | feature-request
- Priority: P0 | P1 | P2 | P3
- Description + steps to reproduce
- Attachments / screenshots

Triage rules:
- P0 (system outage, inability to trade, mass payment failures): page Engineering + Finance, start incident runbook.
- P1 (single user cannot access account, failed KYC blocking payout): assign to Support owner + escalate to Finance within 1 hour.
- P2 (minor bug, complaint): respond within 4 hours, resolve or provide ETA within 24 hours.

Escalation matrix:
- Support Tier 1: first response, basic troubleshooting, gather logs, escalate to Tier 2 if unresolved in 1 hour.
- Support Tier 2 (Engineering on-call): reproduce, attach logs, propose temporary mitigation.
- Finance: payout reviews and approval.
- Compliance: fraud/KYC escalations.

Response tracking & SLAs:
- First response targets: P0 = 15m, P1 = 1h, P2 = 4h, P3 = 24h.
- Resolution targets: P0 = ASAP (hours), P1 = 24h, P2 = 72h, P3 = 7d.
- Document response time and resolution in ticket. Use `monitor/incidents` for incident tracking.

Templates:
- Acknowledge (automated): "Thanks — we've received your report and an agent will respond within X hours."
- Escalation note (to Engineering): include support ticket link, user id, steps to reproduce, recent API logs, and any payment IDs.

Operational notes:
- Keep a daily support summary (open tickets, new tickets, average response time) and share in the morning standup.
- For payouts: require manual review for the first 100 payouts during beta.
