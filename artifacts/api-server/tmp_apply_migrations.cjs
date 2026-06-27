const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.nysrxvpjdlvzvcawysvh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '8m56JQWMxKag9zCj',
});

const results = {
  applied: [],
  failed: [],
  skipped: [],
  errors: []
};

async function applySql(name, sql) {
  try {
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await client.query(stmt);
      }
    }
    results.applied.push(name);
    return true;
  } catch (err) {
    results.failed.push(name);
    results.errors.push(`${name}: ${err.message}`);
    return false;
  }
}

(async () => {
  try {
    await client.connect();
    
    // Create essential tables that may be missing
    await applySql('Create users if not exists', `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        city TEXT,
        state TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        affiliate_code TEXT UNIQUE,
        referred_by TEXT,
        notification_settings JSONB DEFAULT '{}',
        kyc_status TEXT NOT NULL DEFAULT 'pending',
        is_active BOOLEAN NOT NULL DEFAULT true,
        experience_points INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 0,
        achievement_count INTEGER NOT NULL DEFAULT 0,
        streak_points INTEGER NOT NULL DEFAULT 0,
        public_profile BOOLEAN NOT NULL DEFAULT false,
        total_payout NUMERIC(15,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    
    await applySql('Create sessions if not exists', `
      CREATE TABLE IF NOT EXISTS public.sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        revoked_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(session_token);
    `);
    
    await applySql('Create auth_methods if not exists', `
      CREATE TABLE IF NOT EXISTS public.auth_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        auth_type TEXT NOT NULL DEFAULT 'email',
        provider_id TEXT,
        credential_hash TEXT,
        is_primary BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await applySql('Create payments if not exists', `
      CREATE TABLE IF NOT EXISTS public.payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL DEFAULT 'pending',
        payment_gateway TEXT,
        gateway_transaction_id TEXT,
        payment_method TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await applySql('Create challenges if not exists', `
      CREATE TABLE IF NOT EXISTS public.challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'normal',
        target_profit_usd NUMERIC(15,2),
        status TEXT NOT NULL DEFAULT 'active',
        starts_at TIMESTAMP,
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await applySql('Create support_tickets if not exists', `
      CREATE TABLE IF NOT EXISTS public.support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        priority TEXT NOT NULL DEFAULT 'normal',
        user_id UUID,
        assignee_id UUID,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await applySql('Create api_logs if not exists', `
      CREATE TABLE IF NOT EXISTS public.api_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        status_code INTEGER,
        response_time_ms INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await applySql('Create alert_rules if not exists', `
      CREATE TABLE IF NOT EXISTS public.alert_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL,
        condition JSONB,
        enabled BOOLEAN NOT NULL DEFAULT true,
        severity TEXT NOT NULL DEFAULT 'warning',
        notify_emails TEXT[],
        notify_clerk_ids TEXT[],
        notify_discord_webhooks TEXT[],
        notify_whatsapp_numbers TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(__dirname + '/migration_results.json', JSON.stringify(results, null, 2));
    
  } catch (err) {
    results.errors.push(`Fatal error: ${err.message}`);
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(__dirname + '/migration_results.json', JSON.stringify(results, null, 2));
  } finally {
    await client.end();
  }
})();
