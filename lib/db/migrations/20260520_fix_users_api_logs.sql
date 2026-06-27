-- Runtime fix: ensure the core users schema and API logging tables exist for the live database.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  user_id TEXT,
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS api_logs_path_idx ON api_logs (path);
CREATE INDEX IF NOT EXISTS api_logs_status_code_idx ON api_logs (status_code);
CREATE INDEX IF NOT EXISTS api_logs_created_at_idx ON api_logs (created_at);
CREATE INDEX IF NOT EXISTS api_logs_user_id_idx ON api_logs (user_id);

CREATE TABLE IF NOT EXISTS system_errors (
  id SERIAL PRIMARY KEY,
  error_type TEXT NOT NULL DEFAULT 'SYSTEM_ERROR',
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'ERROR',
  status_code INTEGER NOT NULL DEFAULT 500,
  user_id TEXT,
  user_email TEXT,
  service TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  metadata JSONB,
  seen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS system_errors_error_type_idx ON system_errors (error_type);
CREATE INDEX IF NOT EXISTS system_errors_severity_idx ON system_errors (severity);
CREATE INDEX IF NOT EXISTS system_errors_status_code_idx ON system_errors (status_code);
CREATE INDEX IF NOT EXISTS system_errors_created_at_idx ON system_errors (created_at);
CREATE INDEX IF NOT EXISTS system_errors_user_id_idx ON system_errors (user_id);

CREATE TABLE IF NOT EXISTS system_incidents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  incident_type TEXT NOT NULL DEFAULT 'SYSTEM',
  severity TEXT NOT NULL DEFAULT 'HIGH',
  status TEXT NOT NULL DEFAULT 'OPEN',
  linked_error_id INTEGER REFERENCES system_errors(id) ON DELETE SET NULL,
  assignee TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  detection_source TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);
CREATE INDEX IF NOT EXISTS system_incidents_status_idx ON system_incidents (status);
CREATE INDEX IF NOT EXISTS system_incidents_severity_idx ON system_incidents (severity);
CREATE INDEX IF NOT EXISTS system_incidents_incident_type_idx ON system_incidents (incident_type);
CREATE INDEX IF NOT EXISTS system_incidents_created_at_idx ON system_incidents (created_at);
