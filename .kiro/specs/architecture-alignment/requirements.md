# Requirements Document

## Introduction

The FundedWealth platform currently operates as a monolith where trading logic, challenge evaluation, payment handling, and admin workflows are all entangled in a single API server. This feature defines the architectural alignment that separates the platform into three distinct, clearly bounded domains:

1. **FundedWealth.com** (main site) — user-facing: registration, login, challenge purchase, payment collection, KYC submission, user dashboard, certificates, payout requests, and terminal launch.
2. **Admin.FundedWealth.com** (admin panel) — internal operations: payment approval, account provisioning, challenge assignment, KYC review, payout management.
3. **Terminal.FundedWealth.com** (trading terminal) — trading execution: trading accounts, positions, orders, risk rules, challenge evaluation, and live trading logic.

The alignment also fixes critical bugs in the current codebase: `virtual_balance` being set to the fee paid instead of the account size, missing admin notifications on payment, an unverified UPI UTR flow, a broken manual bank transfer notification, and missing referral code persistence on orders.

---

## Glossary

- **Main_Site**: The FundedWealth.com React SPA and its backing API routes — responsible for user-facing operations only.
- **Admin_Panel**: The Admin.FundedWealth.com application — responsible for internal operations and human review workflows.
- **Terminal**: The Terminal.FundedWealth.com application — responsible for all live and simulated trading operations.
- **API_Server**: The shared Express/Node.js backend that currently serves all three domains; will be refactored into domain-scoped route groups.
- **Provisioning_Service**: The server-side component responsible for creating a trading account record after a payment is approved.
- **SSO_Service**: The server-side component responsible for generating and validating short-lived single-sign-on tokens for Terminal handoff.
- **Challenge_Engine**: The component that evaluates trading performance against challenge rules and advances account phases.
- **Order**: A record in the `orders` table representing a challenge purchase attempt.
- **Trading_Account**: A record in the `trading_accounts` table representing a funded or evaluation trading account.
- **SSO_Token**: A short-lived, single-use JWT stored in the `sso_tokens` table used to authenticate a user into the Terminal without re-entering credentials.
- **Admin_Event**: An internal notification (row in `admin_events` table) sent from the Main_Site API to notify the Admin_Panel of actions requiring human review.
- **Pending_Provisioning**: A Trading_Account status indicating payment is confirmed but the account has not yet been sized and activated by an admin.
- **Account_Size**: The virtual capital amount assigned to a trading account (e.g. ₹10,00,000), distinct from the fee paid to purchase the challenge.
- **Fee_Paid**: The INR amount charged to the user to enter a challenge (e.g. ₹3,599).
- **UTR**: Unique Transaction Reference — a 10–12 digit identifier issued by the UPI payment network for each transaction.
- **Idempotency_Key**: A unique string stored in `webhook_logs` to prevent duplicate event processing.
- **Supabase_Auth**: The Supabase-hosted authentication service used for email/password and Google OAuth login on the Main_Site.
- **Custom_Auth_System**: The parallel authentication routes in `routes/auth.ts` (email, password, session, 2FA) with no frontend consumers.
- **Referral_Code**: An affiliate code submitted at checkout that links a purchase to a referrer for commission tracking.
- **KYC**: Know Your Customer — identity verification required before a user can request a payout.
- **Drizzle_ORM**: The TypeScript ORM used to interact with the PostgreSQL database.

---

## Requirements

### Requirement 1: Domain Boundary — Main Site Scope

**User Story:** As a platform architect, I want the Main_Site to own only user-facing concerns, so that trading logic, challenge evaluation, and admin workflows are not mixed into the user-facing codebase.

#### Acceptance Criteria

1. THE Main_Site SHALL handle user registration, login, Google OAuth, forgot-password, and Turnstile CAPTCHA verification.
2. THE Main_Site SHALL handle challenge purchase (plan selection, billing details, payment collection) for Razorpay, OxaPay, UPI QR, and manual bank transfer methods.
3. THE Main_Site SHALL handle KYC form submission, payout requests, certificate display, affiliate dashboard, and the user trading dashboard.
4. THE Main_Site SHALL provide a "Launch Terminal" button that generates an SSO_Token and redirects the user to Terminal.FundedWealth.com with that token.
5. THE Main_Site SHALL NOT contain trading position data, order book data, live P&L calculation, or risk rule evaluation logic.
6. THE Main_Site SHALL NOT contain the Challenge_Engine or any phase-advancement logic.
7. THE Main_Site SHALL NOT contain routes from `routes/auth.ts` (the Custom_Auth_System) — these routes SHALL be removed from all active route registrations.
8. THE Main_Site SHALL NOT expose admin-only endpoints (user management, account provisioning, KYC review, payout approval) without the admin role guard.
9. WHEN a user requests data about their trading account, THE Main_Site SHALL retrieve only the read-only account summary fields (account_code, phase, status, virtual_balance, profit_target, max_drawdown) from the database.
10. THE Main_Site SHALL NOT write to `trading_accounts.virtual_balance`, `trading_accounts.total_pnl`, `trading_accounts.daily_drawdown`, or `trading_accounts.phase` — those columns are owned by the Terminal and Admin_Panel.

---

### Requirement 2: Correct Account Provisioning Workflow

**User Story:** As a trader, I want my trading account to be created with the correct account size after my payment is verified, so that I can evaluate my trading on the capital I signed up for.

#### Acceptance Criteria

1. WHEN a payment is confirmed (Razorpay webhook `payment.captured`, OxaPay webhook `status=Paid`, or UTR manual verification), THE Provisioning_Service SHALL create an Order record with `status = pending_provisioning`.
2. WHEN an Order record has `status = pending_provisioning`, THE Provisioning_Service SHALL set `trading_accounts.virtual_balance` to the `orders.account_size` value, NOT the `orders.amount` (fee paid) value.
3. THE orders table SHALL contain an `account_size` column (integer, not null) representing the virtual capital to be assigned to the trading account.
4. THE orders table SHALL contain a `referral_code` column (text, nullable) to persist the Referral_Code submitted at checkout.
5. WHEN an Order is created during checkout, THE Main_Site API SHALL populate `orders.account_size` from the server-side plan configuration (e.g. ₹10,00,000 for the 2-step ₹10L plan), not from the fee paid.
6. WHEN an Order is created during checkout, THE Main_Site API SHALL populate `orders.referral_code` from the `referralCode` field in the request body.
7. WHEN a payment is confirmed for a Razorpay order, THE Provisioning_Service SHALL set the new Trading_Account `status = pending_provisioning` and SHALL NOT set `status = active` automatically.
8. WHEN a payment is confirmed for an OxaPay order, THE Provisioning_Service SHALL set the new Trading_Account `status = pending_provisioning` and SHALL NOT set `status = active` automatically.
9. WHEN a UTR manual payment is submitted, THE Provisioning_Service SHALL set the new Trading_Account `status = pending_provisioning` and SHALL NOT set `status = active` automatically.
10. WHEN an admin approves an Order in the Admin_Panel, THE Admin_Panel API SHALL update the Trading_Account `status` from `pending_provisioning` to `active` and SHALL set `virtual_balance` to `orders.account_size`.
11. WHEN a Trading_Account `status` is updated to `active` by an admin, THE API_Server SHALL send a confirmation notification to the user containing their account code, account size, plan type, and phase.
12. THE `trading_accounts` table SHALL contain a `pending_provisioning` status value in addition to the existing `active`, `breached`, `passed`, and `evaluation` values.

---

### Requirement 3: Admin Handoff — Payment Received Notification

**User Story:** As an admin, I want to be notified immediately when a payment is received, so that I can review and provision the account without delay.

#### Acceptance Criteria

1. WHEN a Razorpay `payment.captured` webhook is processed successfully, THE API_Server SHALL insert an Admin_Event record with `event_type = payment_received`, `order_id`, `user_id`, `amount`, and `payment_method = razorpay`.
2. WHEN an OxaPay `status=Paid` webhook is processed successfully, THE API_Server SHALL insert an Admin_Event record with `event_type = payment_received`, `order_id`, `user_id`, `amount`, and `payment_method = crypto`.
3. WHEN a UPI UTR submission creates an Order record, THE API_Server SHALL insert an Admin_Event record with `event_type = payment_received`, `order_id`, `user_id`, `amount`, and `payment_method = upi_manual`.
4. WHEN a manual bank transfer submission creates an Order record, THE API_Server SHALL insert an Admin_Event record with `event_type = payment_received`, `order_id`, `user_id`, `amount`, and `payment_method = bank_manual`.
5. THE `admin_events` table SHALL contain columns: `id`, `event_type`, `order_id` (nullable), `user_id`, `amount` (nullable), `payment_method` (nullable), `metadata` (jsonb), `is_read` (boolean, default false), `created_at`.
6. WHEN a KYC submission is created by a user, THE API_Server SHALL insert an Admin_Event record with `event_type = kyc_submitted`, `user_id`, and `submission_id`.
7. WHEN a payout request is created by a user, THE API_Server SHALL insert an Admin_Event record with `event_type = payout_requested`, `user_id`, `amount`, and `payout_id`.
8. THE Admin_Panel SHALL expose a `GET /api/admin/events` endpoint that returns unread Admin_Event records, ordered by `created_at` descending, paginated at 50 per page.
9. WHEN an Admin_Event is acknowledged by an admin, THE Admin_Panel API SHALL set `admin_events.is_read = true` for that record.
10. IF an Admin_Event insert fails due to a database error, THEN THE API_Server SHALL log the failure and SHALL NOT roll back the parent transaction (the payment or KYC record must be preserved even if notification fails).

---

### Requirement 4: Admin Handoff — KYC Review and Payout Management

**User Story:** As an admin, I want a clear workflow for reviewing KYC submissions and processing payouts, so that user verification and profit withdrawals are handled consistently.

#### Acceptance Criteria

1. THE Admin_Panel API SHALL expose a `GET /api/admin/kyc?status=pending` endpoint that returns KYC submissions with user details, ordered by submission date.
2. WHEN an admin approves a KYC submission, THE Admin_Panel API SHALL update `kyc_submissions.status = approved`, update `users.kyc_status = approved`, and send a KYC approval email to the user.
3. WHEN an admin rejects a KYC submission, THE Admin_Panel API SHALL update `kyc_submissions.status = rejected`, update `users.kyc_status = rejected`, record a `rejection_reason`, and send a KYC rejection email to the user.
4. THE Admin_Panel API SHALL expose a `GET /api/admin/payouts?status=REQUESTED` endpoint returning payout records with user details and payment method information.
5. WHEN an admin approves a payout, THE Admin_Panel API SHALL update `payouts.current_status = APPROVED` and send an approval notification to the user.
6. WHEN an admin marks a payout as paid, THE Admin_Panel API SHALL update `payouts.current_status = PAID`, record `payouts.processed_at`, and increment `users.total_payout` by the payout amount.
7. WHEN an admin rejects a payout, THE Admin_Panel API SHALL update `payouts.current_status = REJECTED`, record a rejection reason, and send a rejection notification to the user.
8. WHILE a user's `kyc_status` is not `approved`, THE API_Server SHALL reject payout requests with HTTP 403 and error code `KYC_REQUIRED`.
9. THE Admin_Panel API SHALL log all KYC and payout decisions to the `audit_logs` table with `admin_id`, `action`, `entity`, `entity_id`, and `details`.

---

### Requirement 5: Terminal Handoff — SSO Token Generation and Launch

**User Story:** As a trader, I want to click "Launch Terminal" in my dashboard and be automatically signed in to the trading terminal, so that I do not have to re-enter credentials for a separate subdomain.

#### Acceptance Criteria

1. WHEN a logged-in user clicks "Launch Terminal" in the Main_Site dashboard, THE Main_Site SHALL call `POST /api/sso/generate-token` with the user's Supabase JWT.
2. WHEN `POST /api/sso/generate-token` is called with a valid JWT, THE SSO_Service SHALL generate a cryptographically random 32-byte token, store it in the `sso_tokens` table with `user_id`, `token_hash` (SHA-256 of the raw token), `expires_at` (10 minutes from generation), `is_used = false`, and return the raw token to the caller.
3. THE `sso_tokens` table SHALL contain columns: `id`, `user_id`, `token_hash` (text, unique), `expires_at` (timestamp with timezone), `is_used` (boolean, default false), `created_at`.
4. WHEN the Main_Site receives the SSO_Token, THE Main_Site SHALL redirect the user to `https://terminal.fundedwealth.com/auth/sso?token=<raw_token>`.
5. WHEN Terminal receives the SSO request, THE Terminal SHALL call `POST /api/sso/validate-token` on the API_Server with the raw token.
6. WHEN `POST /api/sso/validate-token` is called, THE SSO_Service SHALL look up the token by its SHA-256 hash, verify `is_used = false` and `expires_at > now()`, then set `is_used = true` and return the user's `id`, `clerkId`, `email`, `role`, and active Trading_Account codes.
7. IF the token is expired or already used, THEN THE SSO_Service SHALL return HTTP 401 with error code `SSO_TOKEN_INVALID`.
8. IF the user has no active Trading_Account (status = active), THEN THE SSO_Service SHALL still validate the token successfully and return an empty accounts list — Terminal will display a "no active account" state.
9. THE SSO_Service SHALL delete `sso_tokens` records older than 1 hour via a scheduled cleanup (or on-demand during validation).
10. THE Main_Site SHALL NOT pass the user's Supabase JWT or session cookie directly to the Terminal — only the short-lived SSO_Token SHALL cross the domain boundary.

---

### Requirement 6: UPI UTR Verification Hardening

**User Story:** As a platform operator, I want UTR submissions to undergo real verification, so that users cannot claim an account by entering any random 10-digit number.

#### Acceptance Criteria

1. WHEN a user submits a UTR, THE API_Server SHALL validate that the UTR string matches the regex `^\d{10,12}$` — any non-digit or out-of-range length SHALL return HTTP 400 with message "Invalid UTR format".
2. WHEN a user submits a UTR, THE API_Server SHALL check the `orders` table for an existing record with `utr_reference = <submitted_utr>` — a duplicate SHALL return HTTP 409 with message "UTR already claimed".
3. WHEN a UTR is submitted, THE API_Server SHALL create an Order with `status = pending_review` (NOT `status = paid`) and a Trading_Account with `status = pending_provisioning`.
4. WHEN a UTR order is created with `status = pending_review`, THE API_Server SHALL insert an Admin_Event with `event_type = payment_received` and `payment_method = upi_manual` to trigger admin review.
5. WHEN a UTR order is created with `status = pending_review`, THE API_Server SHALL return HTTP 202 to the frontend with `status = pending` so the user is shown a "pending admin review" message — not an instant success confirmation.
6. WHEN an admin verifies a UTR-based Order and marks it approved in the Admin_Panel, THE Admin_Panel API SHALL update `orders.status = confirmed` and `trading_accounts.status = active`.
7. THE Main_Site checkout UPI payment flow SHALL display a message stating "Payment is under review. Your account will be activated within 2 business hours after verification." upon receiving a `202 pending` response.

---

### Requirement 7: Manual Bank Transfer — Admin Notification

**User Story:** As an admin, I want to be notified immediately when a user submits a manual bank transfer proof, so that I can review and activate the account without manual checking.

#### Acceptance Criteria

1. WHEN a user submits a manual bank transfer with a proof file, THE API_Server SHALL create an Order record with `status = pending_review` and `payment_method = bank_manual`.
2. WHEN an Order with `payment_method = bank_manual` is created, THE API_Server SHALL insert an Admin_Event with `event_type = payment_received`, `order_id`, `user_id`, and `amount`.
3. WHEN an Order with `payment_method = bank_manual` is created, THE API_Server SHALL create a `manual_payments` record linking the `order_id`, `user_id`, `proof_url`, and `status = pending`.
4. THE API_Server SHALL validate that the proof file MIME type is one of `image/jpeg`, `image/png`, `image/webp`, or `application/pdf` — any other type SHALL return HTTP 400.
5. THE API_Server SHALL validate that the proof file size does not exceed 10 MB — files exceeding this limit SHALL return HTTP 400.
6. WHEN an admin approves a manual bank transfer Order, THE Admin_Panel API SHALL update `orders.status = confirmed`, `manual_payments.status = approved`, and `trading_accounts.status = active`.
7. WHEN an admin rejects a manual bank transfer Order, THE Admin_Panel API SHALL update `orders.status = rejected`, `manual_payments.status = rejected`, and send a rejection email to the user.

---

### Requirement 8: Data Model Changes

**User Story:** As a developer, I want the database schema to reflect the correct domain boundaries and support the provisioning workflow, so that all services can operate independently from a shared source of truth.

#### Acceptance Criteria

1. THE `orders` table SHALL have an `account_size` integer column (not null, default 0) added via a non-destructive migration.
2. THE `orders` table SHALL have a `referral_code` text column (nullable) added via a non-destructive migration.
3. THE `orders` table SHALL have a `proof_url` text column (nullable) added via a non-destructive migration to replace the existing field used only in-memory.
4. THE `trading_accounts` table SHALL support `status = pending_provisioning` as a valid status value.
5. THE `trading_accounts` table SHALL have an `account_size` integer column (not null, default 0) representing the target virtual capital, separate from `virtual_balance` (the current balance).
6. THE database SHALL have a new `sso_tokens` table with columns: `id` (uuid, pk), `user_id` (integer, fk → users.id), `token_hash` (text, unique, not null), `expires_at` (timestamp with timezone, not null), `is_used` (boolean, default false, not null), `created_at` (timestamp with timezone, default now).
7. THE database SHALL have a new `admin_events` table with columns: `id` (serial, pk), `event_type` (text, not null), `order_id` (text, nullable, fk → orders.id), `user_id` (integer, not null, fk → users.id), `amount` (real, nullable), `payment_method` (text, nullable), `metadata` (jsonb, default {}), `is_read` (boolean, default false, not null), `created_at` (timestamp with timezone, default now).
8. THE `users` table SHALL retain the existing `clerkId` column semantics — the value stores the Supabase user UUID and the column name SHALL NOT be changed in this feature.
9. THE Drizzle_ORM schema files SHALL be updated to reflect all new columns and tables before any migration is run.
10. ALL new columns SHALL be added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` to be safe for re-execution.

---

### Requirement 9: Custom Auth System Removal

**User Story:** As a platform architect, I want the unused parallel authentication system removed from active route registrations, so that the codebase is not cluttered with dead code that could introduce security confusion.

#### Acceptance Criteria

1. THE API_Server SHALL NOT register the route module `routes/auth.ts` in `app.ts` or any active router configuration.
2. THE `routes/auth.ts` file SHALL be moved to a `routes/legacy/` directory and SHALL NOT be deleted — it SHALL be retained for reference during the migration period.
3. WHEN a request is made to any endpoint previously served by `routes/auth.ts` (e.g. `POST /api/auth/register`, `POST /api/auth/login`), THE API_Server SHALL return HTTP 404 with message "This endpoint has been retired. Use Supabase Auth.".
4. THE Main_Site SHALL NOT make any API calls to endpoints under `/api/auth/` — all authentication SHALL go through Supabase Auth directly.
5. THE API_Server SHALL continue to use `middlewares/supabaseAuth.ts` for JWT validation on all protected routes.

---

### Requirement 10: Trading Logic Isolation

**User Story:** As a platform architect, I want all live trading data, challenge evaluation, and position management to be owned by the Terminal, so that the Main_Site API does not process or store real-time trade data.

#### Acceptance Criteria

1. THE Main_Site API SHALL NOT expose endpoints that write to `trading_accounts.total_pnl`, `trading_accounts.daily_drawdown`, or `trading_accounts.virtual_balance` based on trade events.
2. THE `PATCH /:id/trade` route in `routes/trading-accounts.ts` SHALL be moved to the Terminal's API and SHALL be removed from the Main_Site API_Server route registration.
3. THE `POST /:id/check-rules` route in `routes/trading-accounts.ts` SHALL be moved to the Terminal's API and SHALL be removed from the Main_Site API_Server route registration.
4. THE Main_Site dashboard's `TradingContext` SHALL fetch read-only account summaries from `GET /api/trading-accounts` (already implemented) and SHALL NOT use any locally generated demo or mock trading data for display.
5. THE Main_Site dashboard SHALL display account phase, status, virtual_balance, profit_target, and max_drawdown fetched from the database — not computed from client-side state.
6. THE Challenge_Engine (phase advancement logic: phase_1 → phase_2 → funded) SHALL reside exclusively in the Terminal's API or a dedicated background worker, not in the Main_Site API_Server.
7. THE legacy retired endpoints in `routes/trading-accounts.ts` (`GET /status`, `GET /history`, `POST /provision`, `POST /payout/check`, `PATCH /:id/state`) SHALL remain returning HTTP 410 with their existing retirement messages.

---

### Requirement 11: Migration Strategy — Data Preservation

**User Story:** As a platform operator, I want the migration to preserve all existing data and maintain backward compatibility with active payment webhooks, so that no in-flight orders or user accounts are lost.

#### Acceptance Criteria

1. THE migration SHALL preserve all existing rows in `orders`, `trading_accounts`, `users`, `payouts`, `kyc_submissions`, and `webhook_logs` tables — no destructive `DROP COLUMN` or `TRUNCATE` operations SHALL be performed.
2. THE migration SHALL backfill `orders.account_size` for existing confirmed orders using the server-side plan configuration lookup (plan_type + amount → account_size), setting 0 for any row where the mapping cannot be determined.
3. WHEN the migration is run, THE Provisioning_Service SHALL identify existing Trading_Accounts where `virtual_balance = fee_paid` (i.e. the bug was in effect) and set a `needs_balance_correction` flag for admin review — it SHALL NOT auto-correct balances.
4. THE Razorpay webhook endpoint (`POST /api/razorpay/webhook`) SHALL remain at the same URL and continue to accept Razorpay events without any URL change during or after migration.
5. THE OxaPay webhook endpoint (`POST /api/payments/oxapay-webhook`) SHALL remain at the same URL and continue to accept OxaPay events without any URL change during or after migration.
6. THE migration SHALL be executable via a single Drizzle migration file and SHALL be idempotent (safe to run twice with `IF NOT EXISTS` guards).
7. WHEN a Razorpay or OxaPay webhook arrives during the migration window, THE API_Server SHALL process it using the existing idempotency guard in `webhook_logs` — no duplicate provisioning SHALL occur.
8. THE existing `webhook_logs` records SHALL NOT be modified or deleted by the migration.
9. THE existing `manual_payments` records SHALL NOT be deleted — if the `orders.proof_url` column is added, the `manual_payments` table SHALL continue to be the authoritative store for proof file paths.

---

### Requirement 12: Webhook Idempotency Preservation

**User Story:** As a platform operator, I want all payment webhooks to remain idempotent after the architectural changes, so that redelivery of the same event never creates duplicate orders or accounts.

#### Acceptance Criteria

1. THE Razorpay webhook handler SHALL continue to check `webhook_logs` for a duplicate `webhookId` (X-Razorpay-Event-Id header) before processing any event.
2. THE OxaPay webhook handler SHALL continue to check `webhook_logs` for a duplicate `idempotency_key` (composite of `oxapay:{trackId}:{status}`) before processing any event.
3. WHEN a webhook is identified as a duplicate by the idempotency check, THE API_Server SHALL return HTTP 200 and SHALL NOT create any new Order or Trading_Account records.
4. THE `webhook_logs` table unique constraint on `idempotency_key` SHALL be retained across all migrations.
5. WHEN a webhook log insert fails due to a unique constraint violation (race condition), THE API_Server SHALL treat the event as a duplicate and return HTTP 200 without processing.

---

### Requirement 13: Security — Role Enforcement

**User Story:** As a security engineer, I want all admin-only operations to be gated behind role checks, so that a regular user cannot provision accounts, approve payouts, or update KYC status.

#### Acceptance Criteria

1. WHEN a request is made to any `POST`, `PATCH`, or `DELETE` endpoint under `/api/admin/`, THE API_Server SHALL verify the authenticated user's `role` is one of `admin`, `super_admin`, `support`, `compliance`, or `finance` — any other role SHALL receive HTTP 403.
2. WHEN a request is made to `PATCH /api/payouts/:id/status`, THE API_Server SHALL verify the authenticated user's `role` is one of `admin`, `super_admin`, or `finance` — a regular `user` role SHALL receive HTTP 403.
3. WHEN a request is made to `POST /api/sso/generate-token`, THE API_Server SHALL verify the requesting user has a valid Supabase JWT — unauthenticated requests SHALL receive HTTP 401.
4. WHEN a request is made to `POST /api/sso/validate-token` from the Terminal, THE API_Server SHALL verify the request includes a valid `TERMINAL_API_KEY` in the `X-Terminal-API-Key` header — missing or invalid keys SHALL receive HTTP 401.
5. THE SSO_Token raw value SHALL NOT be logged to application logs or stored in plaintext in the database — only the SHA-256 hash SHALL be persisted.
6. THE Admin_Panel SHALL be deployed on a separate subdomain (`admin.fundedwealth.com`) and SHALL NOT share session cookies with the Main_Site — each domain manages its own authentication context.

---

### Requirement 14: Notification — Confirmation Email on Account Activation

**User Story:** As a trader, I want to receive an email when my account is activated by an admin, so that I know I can start trading without polling the dashboard.

#### Acceptance Criteria

1. WHEN an admin sets a Trading_Account `status` to `active`, THE API_Server SHALL send a transactional email to the account owner containing: the account code, the account size (from `orders.account_size`), the plan type, the phase, and a link to the dashboard.
2. WHEN a Trading_Account activation email fails to send, THE API_Server SHALL log the failure and SHALL NOT roll back the account activation — the account remains active.
3. THE confirmation email SHALL be distinct from the existing `paymentConfirmationEmail` — it SHALL be a new `accountActivationEmail` template that references the account size, not the fee paid.
4. WHEN the Razorpay `payment.captured` webhook provisions an account, THE API_Server SHALL send the existing `paymentConfirmationEmail` (fee receipt), and separately, WHEN an admin later activates the account, THE API_Server SHALL send the new `accountActivationEmail`.
