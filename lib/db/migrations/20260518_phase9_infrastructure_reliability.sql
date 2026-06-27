-- Create tables for backup metadata and notification failure tracking to support production reliability and disaster recovery

CREATE TABLE IF NOT EXISTS notification_failures (
  id SERIAL PRIMARY KEY,
  notification_id TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  channel TEXT,
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'FAILED',
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notification_failures_status_idx ON notification_failures (status);
CREATE INDEX IF NOT EXISTS notification_failures_provider_idx ON notification_failures (provider);
CREATE INDEX IF NOT EXISTS notification_failures_created_at_idx ON notification_failures (created_at);

CREATE TABLE IF NOT EXISTS system_backups (
  id SERIAL PRIMARY KEY,
  backup_type TEXT NOT NULL DEFAULT 'FULL',
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  bytes_transferred INTEGER,
  storage_location TEXT,
  metadata JSONB,
  successful BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS system_backups_status_idx ON system_backups (status);
CREATE INDEX IF NOT EXISTS system_backups_backup_type_idx ON system_backups (backup_type);
CREATE INDEX IF NOT EXISTS system_backups_completed_at_idx ON system_backups (completed_at);

CREATE TABLE IF NOT EXISTS backup_recovery (
  id SERIAL PRIMARY KEY,
  backup_id INTEGER REFERENCES system_backups(id) ON DELETE CASCADE,
  recovery_type TEXT NOT NULL DEFAULT 'FULL',
  status TEXT NOT NULL DEFAULT 'PENDING',
  scheduled_for TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  target_environment TEXT,
  recovery_method TEXT,
  items_recovered INTEGER,
  items_failed INTEGER,
  success_rate TEXT,
  metadata JSONB,
  successful BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS backup_recovery_status_idx ON backup_recovery (status);
CREATE INDEX IF NOT EXISTS backup_recovery_backup_id_idx ON backup_recovery (backup_id);
CREATE INDEX IF NOT EXISTS backup_recovery_scheduled_for_idx ON backup_recovery (scheduled_for);
CREATE INDEX IF NOT EXISTS backup_recovery_completed_at_idx ON backup_recovery (completed_at);

CREATE TABLE IF NOT EXISTS incident_sla (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER REFERENCES system_incidents(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  sla_type TEXT NOT NULL,
  target_response_hours NUMERIC(10, 2),
  target_resolution_hours NUMERIC(10, 2),
  response_deadline TIMESTAMPTZ,
  resolution_deadline TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  response_breached TEXT DEFAULT 'NO',
  resolution_breached TEXT DEFAULT 'NO',
  response_time_hours NUMERIC(10, 2),
  resolution_time_hours NUMERIC(10, 2),
  compliance_percentage NUMERIC(5, 2),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS incident_sla_incident_id_idx ON incident_sla (incident_id);
CREATE INDEX IF NOT EXISTS incident_sla_severity_idx ON incident_sla (severity);
CREATE INDEX IF NOT EXISTS incident_sla_response_breached_idx ON incident_sla (response_breached);
CREATE INDEX IF NOT EXISTS incident_sla_resolution_breached_idx ON incident_sla (resolution_breached);
CREATE INDEX IF NOT EXISTS incident_sla_created_at_idx ON incident_sla (created_at);
