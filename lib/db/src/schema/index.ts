// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE CORE TABLES
// ═══════════════════════════════════════════════════════════════════════════════
export * from "./users";
export * from "./orders";
export * from "./trading-accounts";
export * from "./payouts";
export * from "./payout-timeline-events";
export * from "./manual-payments";
export * from "./notifications";
export * from "./webhook-logs";
export * from "./audit-logs";

// ── Affiliate ────────────────────────────────────────────────────────────────
export * from "./affiliate";

// ── KYC ──────────────────────────────────────────────────────────────────────
export * from "./kyc-submissions";
export * from "./kyc-profiles";
export * from "./kyc-documents";
export * from "./kyc-reviews";

// ── Community ────────────────────────────────────────────────────────────────
export * from "./community-posts";
export * from "./community-comments";
export * from "./community-likes";
export * from "./conversations";
export * from "./messages";

// ── Content & Marketing ──────────────────────────────────────────────────────
export * from "./blog-posts";
export * from "./contact-submissions";
export * from "./championship-registrations";
export * from "./impact-donations";
export * from "./gamification";

// ── Economic Calendar ────────────────────────────────────────────────────────
export * from "./economic-events";

// ── Fraud / Security / Monitoring ────────────────────────────────────────────
export * from "./fraud-events";
export * from "./device-history";
export * from "./ip-history";
export * from "./ip-lookups";
export * from "./referral-fraud-logs";
export * from "./payment-fingerprints";
export * from "./velocity-events";
export * from "./risk-profiles";
export * from "./security-incidents";
export * from "./rate-limit-violations";

// ── Observability ────────────────────────────────────────────────────────────
export * from "./system-errors";
export * from "./system-incidents";
export * from "./api-logs";
export * from "./payment-failures";
export * from "./notification-failures";
export * from "./system-backups";
export * from "./backup-recovery";
export * from "./incident-sla";
export * from "./alert-rules";

// ── Auth / Sessions ──────────────────────────────────────────────────────────
export * from "./sessions";
export * from "./auth-methods";
export * from "./login-history";
export * from "./failed-attempts";
export * from "./two-factor-settings";

// ── Integration (Main Site ↔ Terminal ↔ Admin) ───────────────────────────────
export * from "./provisioning-logs";
export * from "./admin-events";

// ── Support ──────────────────────────────────────────────────────────────────
export * from "./support-tickets";

// ── Analytics ────────────────────────────────────────────────────────────────
export * from "./behavior-patterns";
export * from "./session-analytics";
