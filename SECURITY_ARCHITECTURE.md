# FundedWealth Production-Grade Security Architecture

## PHASE 1: Authentication + RLS + Validation ✅ COMPLETE

### Authentication System

**Supported Methods:**
- Email/Password (with strong password requirements)
- OAuth (Google, GitHub - via Clerk)
- OTP (One-Time Password via email)
- 2FA (TOTP, SMS - extensible)
- Magic Links (passwordless)

**Session Management:**
- Secure HTTP-only cookies with session tokens
- Session expiration: 7 days default, configurable
- Session rotation on sensitive operations
- Device fingerprinting and tracking
- Concurrent session detection
- Force logout all devices capability

**Password Security:**
- Minimum 12 characters
- Must include uppercase, lowercase, number, special character
- Bcrypt hashing with salt factor 12
- Password history tracking (optional)

**2FA Implementation:**
- TOTP (Time-based One-Time Password) support
- SMS OTP support (via third-party)
- Email OTP support
- Backup codes for account recovery
- Mandatory for admins, optional for users
- MFA required for impossible travel scenarios

### Threat Detection

**Impossible Travel Detection:**
- Detects login from two different countries within impossible timeframe
- Automatically triggers 2FA requirement
- Creates security incident for review

**Concurrent Session Detection:**
- Identifies suspicious concurrent sessions from different IPs
- Logs incidents for analysis
- Supports legitimate simultaneous access

**Brute Force Prevention:**
- Tracks failed login attempts per IP and email
- Auto-lockout after 5 failed attempts within 10 minutes
- 15-minute lockout period
- Detailed logging of attempts and patterns

### Role-Based Access Control (RBAC)

**Six-Tier Role Hierarchy:**

1. **User** (default)
   - View own profile, payouts, certificates
   - Submit KYC, request payouts
   - Manage referrals, enable 2FA

2. **Support**
   - View user profiles and support tickets
   - Add support notes, respond to disputes
   - View KYC, payouts, trading accounts

3. **Finance**
   - Approve/reject payout requests
   - View payment gateway logs
   - Generate financial reports
   - Manage bank accounts

4. **Compliance**
   - Review and approve/reject KYC
   - View AML checks and fraud events
   - Manage compliance policies

5. **Admin**
   - All support + finance + compliance actions
   - Manage users, permissions
   - View audit logs, security incidents
   - Mandatory 2FA, IP logging

6. **Super Admin**
   - Manage admins and roles
   - System configuration and database
   - Encryption key management
   - Crisis mode and security incident triggers

**Permission Architecture:**
- Database-driven permissions (fully flexible)
- 60+ granular permissions across all entities
- Permission inheritance via role
- Dynamic permission checking on every protected endpoint

### Database Security

**Row-Level Security (RLS) - Phase 1 Foundation:**
- Users can only access their own records
- Admin restricted access with audit logging
- Policy enforcement at database level (Supabase)

**RLS Policies (To be implemented in Phase 2):**
```
- users: Users access own records + admins all
- payouts: Users access own + finance/compliance team
- kyc: Users access own + compliance team
- orders: Users access own + finance/admin
- affiliate: Users access own + admin
- payments: Finance team only + admins
```

### Input Validation

**Validation Service Features:**
- Email format validation (RFC 5322 compliant)
- Password strength validation
- Phone number validation (E.164 format)
- URL validation
- File size validation (10MB for documents)
- File type validation for KYC documents
- Numeric ID validation
- Payload size limits (10MB default)
- XSS prevention (input sanitization)

**Type Safety:**
- Zod schemas for runtime validation
- TypeScript interfaces for compile-time safety
- Request body validation middleware

### Database Schema (New Tables)

```
sessions
├── Session tokens, expiration, MFA state
├── Device fingerprinting
├── IP tracking and country
└── Activity timestamps

auth_methods
├── Email/password, OAuth, OTP, Magic Link
├── Verification state
├── Last used timestamp
└── OAuth tokens storage

permissions
├── Role-to-permission mapping
├── 60+ granular permissions
├── Admin, Finance, Compliance actions
└── User self-service permissions

login_history
├── All login attempts (success + failures)
├── IP, country, device info
├── MFA state
└── Failure reasons

failed_attempts
├── Brute force detection
├── Auto-lockout logic
├── Per-IP and per-email tracking
└── Lockout expiration

security_incidents
├── Auto-triggered threat detections
├── Brute force, impossible travel, concurrent sessions
├── Manual review capability
├── Resolution tracking

rate_limit_violations
├── Endpoint-specific violations
├── Per-user and per-IP tracking
├── Severe violation incident creation
└── Analytics

webhook_logs
├── Payment webhook tracking
├── Signature validation
├── Idempotency key deduplication
├── Retry logic
└── Status tracking

two_factor_settings
├── TOTP secret storage
├── Backup codes
├── Verification state
└── Mandatory flag for admins

otp_codes
├── 6-digit OTP generation
├── Time-limited (10 minutes default)
├── Purpose-specific (login, password reset, etc)
├── Attempt tracking
└── Max attempts enforcement
```

### Security Middleware Stack

1. **Threat Detection Middleware**
   - Brute force detection per IP
   - Blocks IPs with >5 attempts in 10 minutes

2. **Session Activity Middleware**
   - Updates last activity timestamp
   - Non-blocking (doesn't delay requests)

3. **Auth Middleware**
   - Session token validation
   - User lookup and permission loading
   - 2FA verification requirement
   - Graceful skipping of public endpoints

4. **RBAC Middleware**
   - Permission checking
   - Role-based endpoint protection
   - 403 Forbidden for insufficient permissions

5. **Admin Security Middleware**
   - Admin-only access verification
   - Mandatory 2FA check
   - Admin action logging
   - IP logging

### Security Headers

```
X-Frame-Options: DENY                    # Prevent clickjacking
X-Content-Type-Options: nosniff         # Prevent MIME sniffing
X-XSS-Protection: 1; mode=block         # Enable XSS protection
Strict-Transport-Security: max-age=...  # HSTS enforcement
Content-Security-Policy: ...            # CSP policy
Referrer-Policy: strict-origin-when-cross-origin
```

### Audit Trail (Foundation)

**Captured Events:**
- Login/logout attempts (success + failures)
- Permission denied events
- Session creation/revocation
- Security incidents (automatic)
- Admin actions (IP, timestamp, user)
- Rate limit violations

**Immutability:**
- Audit logs are append-only
- Timestamps in UTC
- Cannot be deleted (only archived)

## API Endpoints (Phase 1)

### Authentication Endpoints
```
POST /api/auth/register          # Register new user
POST /api/auth/login             # Email/password login
POST /api/auth/logout            # Logout (revoke session)
POST /api/auth/logout-all        # Force logout all devices
POST /api/auth/2fa/setup         # Initialize 2FA
POST /api/auth/2fa/verify        # Verify 2FA code
GET  /api/auth/sessions          # List active sessions
```

### Protected Endpoints (All require authentication)
- Session activity auto-tracking
- User role verification
- Permission checking
- Threat detection

## Security Assumptions & Constraints

**Assumptions:**
1. Attackers WILL try to abuse the system
2. Network traffic may be intercepted (HTTPS mandatory)
3. Databases may be breached (encryption needed)
4. Admin credentials may be compromised (mandatory 2FA)
5. Multiple users may share devices (device tracking)
6. Users may have multiple accounts (fraud detection)

**Implementation Constraints:**
- Performance: Minimal overhead from security checks
- Scalability: Rate limiting needs Redis (Phase 2)
- Compliance: GDPR, KYC/AML requirements
- UX: Security should not burden legitimate users
- Cost: Third-party integrations (2FA SMS, emails, etc)

## Next Phases

### Phase 2: Rate Limiting + Advanced RBAC
- Endpoint-specific rate limits with Redis
- Login: 5/min, OTP: 3/min
- KYC upload: 10/day, Payout: 3/day
- Dynamic rate limits based on user risk profile

### Phase 3: Audit Logs + Fraud Prevention
- Immutable audit logging for compliance
- Referral abuse detection
- Copy trading detection
- Account takeover prevention

### Phase 4: Monitoring + Incidents
- Real-time security monitoring dashboard
- Automatic incident creation and routing
- Alert system for anomalies
- Integration with admin panel

### Phase 5: Hardening + Testing
- Penetration testing
- Security audit
- Vulnerability scanning
- Rate limit header verification
- Error message sanitization
- Comprehensive security tests

## Deployment Checklist

- [ ] Database migration applied (003_security_auth_rbac_phase1.sql)
- [ ] Environment variables configured (BCRYPT_ROUNDS, SESSION_TIMEOUT, etc)
- [ ] HTTPS enforced in all environments
- [ ] CORS configured for frontend domain
- [ ] Session storage initialized
- [ ] Email/SMS providers configured
- [ ] Admin users created with 2FA enabled
- [ ] Audit logging tested
- [ ] Security headers verified
- [ ] Backend TypeScript compilation clean
- [ ] Frontend integration tested
- [ ] Rate limiting configured (Redis ready for Phase 2)

## Configuration

```env
# Authentication
SESSION_TIMEOUT_MS=604800000  # 7 days
OTP_TIMEOUT_MS=600000         # 10 minutes
BCRYPT_ROUNDS=12              # Password hashing

# 2FA
TWO_FA_MANDATORY_ADMIN=true
TWO_FA_MANDATORY_FINANCE=false

# Rate Limiting (Phase 2)
RATE_LIMIT_LOGIN=5            # per minute
RATE_LIMIT_OTP=3              # per minute
RATE_LIMIT_KYC=10             # per day
RATE_LIMIT_PAYOUT=3           # per day

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000    # 15 minutes
BREACH_NOTIFY_ADMINS=true
```
