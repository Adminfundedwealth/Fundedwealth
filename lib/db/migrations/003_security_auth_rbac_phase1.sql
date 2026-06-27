-- Phase 1: Authentication + Session Management + RBAC Foundations

-- Sessions table for session management
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_trusted BOOLEAN DEFAULT false NOT NULL,
  requires_mfa BOOLEAN DEFAULT false NOT NULL,
  mfa_verified BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT sessions_expires_at_future CHECK (expires_at > created_at)
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_token_idx ON sessions(session_token);
CREATE INDEX sessions_is_active_idx ON sessions(is_active);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

-- Auth methods table for multi-method authentication
CREATE TABLE IF NOT EXISTS auth_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  provider TEXT,
  identifier TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  password TEXT,
  metadata JSONB,
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX auth_methods_user_id_idx ON auth_methods(user_id);
CREATE INDEX auth_methods_method_idx ON auth_methods(method);
CREATE INDEX auth_methods_identifier_idx ON auth_methods(identifier);
CREATE INDEX auth_methods_is_primary_idx ON auth_methods(is_primary);

-- Permissions table for RBAC
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(role, permission)
);

CREATE INDEX permissions_role_idx ON permissions(role);
CREATE INDEX permissions_permission_idx ON permissions(permission);

-- Login history for tracking login attempts
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  auth_method TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  device_fingerprint TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  mfa_required BOOLEAN DEFAULT false NOT NULL,
  mfa_verified BOOLEAN DEFAULT false NOT NULL,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX login_history_user_id_idx ON login_history(user_id);
CREATE INDEX login_history_email_idx ON login_history(email);
CREATE INDEX login_history_ip_address_idx ON login_history(ip_address);
CREATE INDEX login_history_success_idx ON login_history(success);
CREATE INDEX login_history_created_at_idx ON login_history(created_at);

-- Failed attempts tracking for brute force detection
CREATE TABLE IF NOT EXISTS failed_attempts (
  id SERIAL PRIMARY KEY,
  email TEXT,
  ip_address TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  count INTEGER DEFAULT 1 NOT NULL,
  last_attempt_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  locked_until TIMESTAMPTZ,
  reason TEXT,
  user_agent TEXT,
  country TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX failed_attempts_email_idx ON failed_attempts(email);
CREATE INDEX failed_attempts_ip_address_idx ON failed_attempts(ip_address);
CREATE INDEX failed_attempts_attempt_type_idx ON failed_attempts(attempt_type);
CREATE INDEX failed_attempts_locked_until_idx ON failed_attempts(locked_until);

-- Security incidents tracking
CREATE TABLE IF NOT EXISTS security_incidents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'MEDIUM' NOT NULL,
  status TEXT DEFAULT 'OPEN' NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  device_fingerprint TEXT,
  country TEXT,
  action_taken TEXT,
  is_automatic BOOLEAN DEFAULT true NOT NULL,
  requires_manual_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX security_incidents_user_id_idx ON security_incidents(user_id);
CREATE INDEX security_incidents_incident_type_idx ON security_incidents(incident_type);
CREATE INDEX security_incidents_severity_idx ON security_incidents(severity);
CREATE INDEX security_incidents_status_idx ON security_incidents(status);
CREATE INDEX security_incidents_created_at_idx ON security_incidents(created_at);

-- Rate limit violations
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  method TEXT NOT NULL,
  request_count INTEGER NOT NULL,
  limit_per_window INTEGER NOT NULL,
  window_ms INTEGER NOT NULL,
  action_taken TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX rate_limit_violations_user_id_idx ON rate_limit_violations(user_id);
CREATE INDEX rate_limit_violations_ip_address_idx ON rate_limit_violations(ip_address);
CREATE INDEX rate_limit_violations_endpoint_idx ON rate_limit_violations(endpoint);
CREATE INDEX rate_limit_violations_created_at_idx ON rate_limit_violations(created_at);

-- Webhook logs for payment security
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  webhook_id TEXT UNIQUE,
  idempotency_key TEXT UNIQUE,
  signature TEXT NOT NULL,
  is_signature_valid BOOLEAN NOT NULL,
  payload JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  last_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX webhook_logs_provider_idx ON webhook_logs(provider);
CREATE INDEX webhook_logs_event_type_idx ON webhook_logs(event_type);
CREATE INDEX webhook_logs_webhook_id_idx ON webhook_logs(webhook_id);
CREATE INDEX webhook_logs_idempotency_key_idx ON webhook_logs(idempotency_key);
CREATE INDEX webhook_logs_status_idx ON webhook_logs(status);
CREATE INDEX webhook_logs_user_id_idx ON webhook_logs(user_id);
CREATE INDEX webhook_logs_created_at_idx ON webhook_logs(created_at);

-- Two-factor settings and OTP codes
CREATE TABLE IF NOT EXISTS two_factor_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false NOT NULL,
  method TEXT,
  totp_secret TEXT,
  backup_codes JSONB,
  phone_number TEXT,
  is_phone_verified BOOLEAN DEFAULT false NOT NULL,
  is_mandatory BOOLEAN DEFAULT false NOT NULL,
  force_enable_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX two_factor_settings_user_id_idx ON two_factor_settings(user_id);
CREATE INDEX two_factor_settings_enabled_idx ON two_factor_settings(enabled);

CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 3 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  CONSTRAINT otp_expires_at_future CHECK (expires_at > created_at)
);

CREATE INDEX otp_codes_user_id_idx ON otp_codes(user_id);
CREATE INDEX otp_codes_email_idx ON otp_codes(email);
CREATE INDEX otp_codes_code_idx ON otp_codes(code);
CREATE INDEX otp_codes_expires_at_idx ON otp_codes(expires_at);

-- Populate default permissions
INSERT INTO permissions (role, permission, description) VALUES
-- User permissions
('user', 'view_own_profile', 'View own profile information'),
('user', 'view_own_payouts', 'View own payout history'),
('user', 'request_payout', 'Request a payout'),
('user', 'submit_kyc', 'Submit KYC documents'),
('user', 'view_certificates', 'View trading certificates'),
('user', 'manage_referrals', 'Manage referral links and earnings'),
('user', 'view_own_trading', 'View own trading accounts'),
('user', 'update_password', 'Update password'),
('user', 'enable_2fa', 'Enable 2FA'),
('user', 'view_notifications', 'View notifications'),

-- Support permissions
('support', 'view_user_profile', 'View any user profile'),
('support', 'view_all_users', 'List all users'),
('support', 'view_kyc_submissions', 'View KYC submissions'),
('support', 'view_payouts', 'View payout requests'),
('support', 'view_trading_accounts', 'View trading accounts'),
('support', 'add_support_notes', 'Add support notes'),
('support', 'view_disputes', 'View support disputes'),
('support', 'respond_to_support_tickets', 'Respond to support tickets'),

-- Finance permissions
('finance', 'view_payout_requests', 'View pending payout requests'),
('finance', 'approve_payout', 'Approve payout requests'),
('finance', 'reject_payout', 'Reject payout requests'),
('finance', 'view_payment_gateway_logs', 'View payment gateway logs'),
('finance', 'view_payment_failures', 'View failed payments'),
('finance', 'generate_financial_reports', 'Generate financial reports'),
('finance', 'view_revenue_analytics', 'View revenue analytics'),
('finance', 'manage_bank_accounts', 'Manage bank accounts'),

-- Compliance permissions
('compliance', 'review_kyc_documents', 'Review KYC documents'),
('compliance', 'approve_kyc', 'Approve KYC submissions'),
('compliance', 'reject_kyc', 'Reject KYC submissions'),
('compliance', 'request_kyc_resubmission', 'Request KYC resubmission'),
('compliance', 'view_compliance_reports', 'View compliance reports'),
('compliance', 'manage_compliance_policies', 'Manage compliance policies'),
('compliance', 'view_aml_checks', 'View AML check results'),
('compliance', 'view_fraud_events', 'View fraud detection events'),

-- Admin permissions
('admin', 'manage_users', 'Manage user accounts'),
('admin', 'manage_permissions', 'Manage permissions'),
('admin', 'view_audit_logs', 'View audit logs'),
('admin', 'manage_system_settings', 'Manage system settings'),
('admin', 'view_admin_dashboard', 'View admin dashboard'),
('admin', 'manage_support_team', 'Manage support team'),
('admin', 'manage_finance_team', 'Manage finance team'),
('admin', 'manage_compliance_team', 'Manage compliance team'),
('admin', 'issue_certificates', 'Issue trading certificates'),
('admin', 'manage_affiliates', 'Manage affiliate program'),
('admin', 'view_security_incidents', 'View security incidents'),
('admin', 'manage_alerts', 'Manage system alerts'),
('admin', 'force_logout_user', 'Force logout user sessions'),
('admin', 'reset_user_2fa', 'Reset user 2FA'),
('admin', 'manage_rate_limits', 'Manage rate limits'),
('admin', 'view_rate_limit_violations', 'View rate limit violations'),

-- Super Admin permissions
('super_admin', 'manage_admins', 'Manage admin accounts'),
('super_admin', 'manage_roles', 'Manage roles'),
('super_admin', 'manage_permissions', 'Manage permissions'),
('super_admin', 'view_all_audit_logs', 'View all audit logs'),
('super_admin', 'manage_system_config', 'Manage system configuration'),
('super_admin', 'manage_database', 'Manage database'),
('super_admin', 'view_all_security_data', 'View all security data'),
('super_admin', 'manage_encryption_keys', 'Manage encryption keys'),
('super_admin', 'manage_backup_policy', 'Manage backup policy'),
('super_admin', 'trigger_security_incident', 'Trigger security incidents'),
('super_admin', 'manage_crisis_mode', 'Manage crisis mode'),
('super_admin', 'access_god_mode', 'Access God mode')
ON CONFLICT DO NOTHING;
