# Security System Phase 1 - Deployment & Implementation Guide

## Prerequisites

### Dependencies to Install
```bash
npm install bcrypt
npm install zod
npm install @clerk/express  # Already installed
npm install express-rate-limit  # Already installed
npm install drizzle-orm
npm install postgres  # For database access
```

### Environment Variables Required

```bash
# Session Management
SESSION_TIMEOUT_MS=604800000          # 7 days (milliseconds)
SESSION_COOKIE_SECURE=true            # HTTPS only
SESSION_COOKIE_HTTP_ONLY=true         # No JS access

# Password Security
BCRYPT_ROUNDS=12                      # Cost factor for hashing

# OTP
OTP_TIMEOUT_MS=600000                 # 10 minutes
OTP_MAX_ATTEMPTS=3

# 2FA
TWO_FA_MANDATORY_ADMIN=true           # Force 2FA for admins
TWO_FA_MANDATORY_FINANCE=false        # Optional for finance
TWO_FA_OPTIONAL_USER=true             # Users can enable

# Threat Detection
BRUTE_FORCE_MAX_ATTEMPTS=5            # Failed attempts before lockout
BRUTE_FORCE_WINDOW_MS=600000          # 10 minutes
BRUTE_FORCE_LOCKOUT_MS=900000         # 15 minutes lockout

# Impossible Travel
IMPOSSIBLE_TRAVEL_MIN_MINUTES=60      # Geographic threshold

# Email/SMS Providers (for OTP and 2FA)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Database
DATABASE_URL=your-supabase-url
```

## Deployment Steps

### Step 1: Database Migration

Apply the security schema migration:

```bash
# Option A: Using Drizzle migrations
npm run db:migrate -- 003_security_auth_rbac_phase1

# Option B: Direct SQL execution
psql $DATABASE_URL -f lib/db/migrations/003_security_auth_rbac_phase1.sql

# Option C: Using Supabase console
# Copy contents of migration file and execute in SQL editor
```

### Step 2: Verify Database Schema

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'auth_methods', 'permissions', 'login_history', 
                   'failed_attempts', 'security_incidents', 'rate_limit_violations', 
                   'webhook_logs', 'two_factor_settings', 'otp_codes');

-- Check permissions populated
SELECT COUNT(*) FROM permissions;  -- Should be 60+
```

### Step 3: Create Default Admin User

```sql
-- Create admin account with 2FA mandatory
INSERT INTO users (clerk_id, email, first_name, last_name, role, is_active)
VALUES ('admin_' || now()::text, 'admin@fundedwealth.com', 'Admin', 'User', 'super_admin', true)
RETURNING id;

-- Use returned ID for next step
-- Set up 2FA as mandatory for this admin
UPDATE two_factor_settings
SET is_mandatory = true, force_enable_at = now()
WHERE user_id = <admin_id>;
```

### Step 4: Update Backend Configuration

1. Add environment variables to `.env`:
```bash
# Copy the environment variables from section above
```

2. Verify middleware is loaded in `app.ts`:
```typescript
import {
  sessionActivityMiddleware,
  threatDetectionMiddleware,
} from "./middlewares/securityMiddleware";

// Should see these lines in app.ts
app.use(threatDetectionMiddleware);
app.use(sessionActivityMiddleware);
```

3. Verify auth routes are mounted:
```typescript
// In routes/index.ts
router.use("/auth", authRouter);
```

### Step 5: Frontend Integration

Update frontend auth module:

```typescript
// src/services/auth.ts

export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.requiresMfa) {
    // Redirect to 2FA verification
    return { requiresMfa: true, ...data };
  }
  
  // Store session token
  localStorage.setItem('sessionToken', data.sessionToken);
  return data;
}

export async function setupMfa() {
  const response = await fetch('/api/auth/2fa/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
    }
  });
  return response.json();
}

export async function verifyMfa(code: string) {
  const response = await fetch('/api/auth/2fa/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
    },
    body: JSON.stringify({ code })
  });
  return response.json();
}
```

### Step 6: Build & Test

```bash
# Type check backend
cd artifacts/api-server
npm run typecheck

# Type check frontend
cd artifacts/fundedwealth
npm run typecheck

# Run security tests (Phase 5)
npm run test -- security.test.ts

# Build backend
npm run build

# Build frontend
npm run build
```

### Step 7: Testing Checklist

- [ ] User registration works
- [ ] User login succeeds with valid credentials
- [ ] Login fails with invalid password
- [ ] Brute force lockout triggers after 5 attempts
- [ ] Session token is valid and can access protected endpoints
- [ ] Invalid session token returns 401
- [ ] 2FA setup flow works
- [ ] OTP verification works
- [ ] Session revocation works
- [ ] Logout all devices revokes all sessions
- [ ] Admin users have 2FA requirement
- [ ] RBAC permissions are correctly enforced
- [ ] Threat detection creates incidents
- [ ] Security headers are present in responses

## Monitoring & Logging

### Key Logs to Monitor

```bash
# Login attempts
SELECT * FROM login_history ORDER BY created_at DESC LIMIT 50;

# Security incidents
SELECT * FROM security_incidents WHERE status = 'OPEN';

# Failed attempts
SELECT * FROM failed_attempts WHERE locked_until > now();

# Active sessions
SELECT * FROM sessions WHERE is_active = true ORDER BY last_activity_at DESC;

# Rate limit violations
SELECT * FROM rate_limit_violations ORDER BY created_at DESC LIMIT 100;
```

### Alerts to Configure

1. **Brute Force Attack**: >10 failed attempts in 1 hour from single IP
2. **Account Takeover**: Impossible travel detected
3. **Admin Actions**: All admin endpoint calls
4. **Failed 2FA**: >3 failed 2FA attempts in 1 hour
5. **Multiple Concurrent Sessions**: User logged in from 5+ locations simultaneously

## Troubleshooting

### Common Issues

1. **Session token not persisting**
   - Check: `SESSION_COOKIE_SECURE` matches protocol (http/https)
   - Check: Cookie domain configuration
   - Check: CORS allows credentials

2. **2FA not working**
   - Check: Email provider configuration
   - Check: OTP_TIMEOUT_MS is correct
   - Check: Database connection for OTP codes table

3. **RBAC permissions denied**
   - Check: Permissions table is populated
   - Check: User role matches permission role
   - Check: Permission names match exactly (case-sensitive)

4. **Brute force lockout too aggressive**
   - Adjust: `BRUTE_FORCE_MAX_ATTEMPTS`
   - Adjust: `BRUTE_FORCE_WINDOW_MS`
   - Adjust: `BRUTE_FORCE_LOCKOUT_MS`

## Migration to Production

### Pre-Production Checklist

- [ ] All environment variables set
- [ ] Database backups configured
- [ ] SSL/HTTPS certificates valid
- [ ] Email provider account created and tested
- [ ] Admin user created with 2FA
- [ ] Security headers verified
- [ ] CORS properly configured
- [ ] Rate limiting ready (Redis for Phase 2)
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Backup and disaster recovery tested
- [ ] Penetration testing scheduled (Phase 5)

### Gradual Rollout Strategy

1. **Week 1**: Deploy to staging
   - Test all auth flows
   - Verify RBAC enforcement
   - Monitor for errors

2. **Week 2**: Deploy to 10% of production traffic
   - Monitor performance
   - Check for edge cases
   - Verify logging

3. **Week 3**: Deploy to 50% of production traffic
   - Full production testing
   - Performance benchmarking
   - Incident response drills

4. **Week 4**: Full production deployment
   - 100% traffic migration
   - Monitor for 2 weeks
   - Document lessons learned

## Rollback Plan

If critical issues are discovered:

```bash
# Revert to previous version
git revert <commit-hash>

# Restore database to backup point
pg_restore --dbname=$DATABASE_URL backup.dump

# Notify affected users
# Send password reset requests
```

## Next Phase Preparation

### Phase 2 (Rate Limiting + Advanced RBAC)

Prepare Redis:
```bash
# For rate limiting storage
redis-cli ping  # Verify connection
```

Define rate limit rules:
```
- Login: 5 requests/minute per IP
- OTP verification: 3 requests/minute per email
- KYC upload: 10 requests/day per user
- Payout request: 3 requests/day per user
- General API: 100 requests/minute per user
```

### Phase 3 (Audit Logs + Fraud Prevention)

Plan immutable audit log storage:
- Consider blockchain or WORM storage
- Design purge/archive strategy
- Plan retention timeline (7 years minimum for compliance)

## Support & Escalation

### For Authentication Issues
1. Check `login_history` table for details
2. Verify user exists in database
3. Check 2FA requirements
4. Review security incidents

### For Permission Issues
1. Check user role
2. Verify permission exists in `permissions` table
3. Check RBAC middleware log
4. Review audit logs

### Escalation Contact
- Security Lead: security@fundedwealth.com
- On-Call Engineer: Check on-call schedule
- CTO: For critical breaches
