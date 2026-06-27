# FundedWealth API Codebase Structure

## Quick Reference

**Repository Root**: `artifacts/api-server/`  
**Source Directory**: `artifacts/api-server/src/`  
**Database**: `@workspace/db` (monorepo package)  
**API Types**: `@workspace/api-zod` (monorepo package)

---

## 1. API Server Entry Point

### Main Files
- **Entry Point**: [artifacts/api-server/src/index.ts](artifacts/api-server/src/index.ts)
  - Loads environment variables via `dotenv/config`
  - Initializes observability system
  - Imports Express app
  - Starts HTTP server on `process.env.PORT`
  - Initializes market data service
  - Optional WebSocket server via `ws` module

- **Express App Setup**: [artifacts/api-server/src/app.ts](artifacts/api-server/src/app.ts)
  - Configures Express middleware stack
  - Sets security headers (CORS, CSP, X-Frame-Options, etc.)
  - Implements Clerk authentication
  - Sets up monitoring and observability
  - Registers route handlers

### How to Start the Server

**Development Mode**:
```bash
npm run dev
# Runs: cross-env NODE_ENV=development pnpm run build && pnpm run start
```

**Production Mode**:
```bash
npm run start
# Runs: node --enable-source-maps ./dist/index.mjs
```

**Build Only**:
```bash
npm run build
# Runs: node ./build.mjs (esbuild)
```

**Type Check**:
```bash
npm run typecheck
```

**Environment Variables Required**:
- `PORT` - Server port (required, must be positive integer)
- `CLERK_PUBLISHABLE_KEY` - Clerk authentication key
- `CLERK_SECRET_KEY` - Clerk secret
- `OXAPAY_MERCHANT_API_KEY` - OxaPay payment gateway
- `EASEBUZZ_KEY` - Easebuzz payment gateway
- `EASEBUZZ_SALT` - Easebuzz salt
- `EASEBUZZ_ENV` - Easebuzz environment (test/prod)
- `ADMIN_SETUP_SECRET` - Secret for first admin setup
- `DATABASE_URL` - Database connection string (for Drizzle ORM)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key

---

## 2. Authentication Routes

**File**: [artifacts/api-server/src/routes/auth.ts](artifacts/api-server/src/routes/auth.ts)  
**Base Path**: `/api/auth/`

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description | Input |
|--------|----------|-------------|-------|
| POST | `/register` | Register new user with email/password | `{ email, password, firstName, lastName, phone }` |
| POST | `/login` | Login with email/password (rate limited) | `{ email, password, ipAddress?, userAgent? }` |

**Login Response Includes**:
- `token` - Session token
- `user` - User object with role
- `requiresMfa` - Boolean if 2FA required
- `requiresMfaReason` - Reason for MFA (e.g., "impossible_travel")

### Protected Endpoints (Auth Required)

| Method | Endpoint | Description | Input |
|--------|----------|-------------|-------|
| POST | `/logout` | Logout current session | None |
| POST | `/logout-all` | Revoke all user sessions | None |
| POST | `/2fa/setup` | Initiate 2FA setup (sends OTP email) | None |
| POST | `/2fa/verify` | Verify 2FA setup with OTP | `{ otp }` |
| GET | `/sessions` | Get active sessions | Query: `limit?`, `offset?` |

### Features
- **Password Hashing**: Uses `scrypt` with salt (crypto module)
- **Rate Limiting**: Login endpoint has rate limiter (15 min window, 10 attempts)
- **Brute Force Protection**: IP-based account lockout via `SecurityService.isIpLocked()`
- **Login History**: Records all login attempts with success/failure reason
- **2FA**: Email-based OTP for setup
- **Impossible Travel Detection**: Compares login IPs for geographic impossibility

---

## 3. Two-Factor Authentication (2FA) Endpoints

**File**: [artifacts/api-server/src/routes/auth.ts](artifacts/api-server/src/routes/auth.ts)

### 2FA Setup Flow
1. POST `/api/auth/2fa/setup` → Sends OTP to email
2. POST `/api/auth/2fa/verify` → Verifies OTP and enables 2FA

### Database Table
- `twoFactorSettings` table with:
  - `userId` (FK to users)
  - `enabled` (boolean)
  - `isMandatory` (boolean - mandatory for admins)
  - `createdAt`, `updatedAt`

### Notes
- 2FA is optional for regular users
- 2FA is mandatory for admin users
- OTP delivery via email service
- Currently email-based OTP (no TOTP/SMS in current implementation)

---

## 4. RBAC & Permissions Endpoints

**File**: [artifacts/api-server/src/lib/rbac-service.ts](artifacts/api-server/src/lib/rbac-service.ts)  
**Database**: `permissions` table with `(role, permission)` mapping

### RBAC Service Methods
```typescript
RBACService.hasPermission(userId: number, permission: string): Promise<boolean>
RBACService.hasAnyPermission(userId: number, permissions: string[]): Promise<boolean>
RBACService.hasAllPermissions(userId: number, permissions: string[]): Promise<boolean>
RBACService.getRolePermissions(role: string): Promise<string[]>
```

### User Roles
- `user` - Regular user
- `admin` - Administrator
- `super_admin` - Super administrator
- `support` - Support staff
- `compliance` - Compliance officer
- `finance` - Finance staff

### Middleware
**Middleware**: [artifacts/api-server/src/middlewares/securityMiddleware.ts](artifacts/api-server/src/middlewares/securityMiddleware.ts)

- `authMiddleware` - Validates session token
- `rbacMiddleware` - Checks specific permission
- `sessionActivityMiddleware` - Tracks session activity

### Permissions are Checked On:
- Admin endpoints (auto-check)
- Protected routes requiring specific permissions
- Support/compliance operations

---

## 5. Support Ticket Endpoints

**File**: [artifacts/api-server/src/routes/support.ts](artifacts/api-server/src/routes/support.ts)  
**Base Path**: `/api/support/`

### Public/Authenticated Endpoints

| Method | Endpoint | Description | Input | Auth Required |
|--------|----------|-------------|-------|---|
| POST | `/tickets/attachments/presign` | Get presigned URL for file upload | `{ filename, contentType, size }` | No |
| POST | `/tickets` | Create support ticket | `{ subject, body, attachments? }` | No (optional) |
| POST | `/tickets/:id/reply` | Add reply to ticket | `{ body, isInternal? }` | Yes |
| GET | `/tickets/:id` | Get ticket details | - | Yes |
| GET | `/tickets` | List all tickets | - | Admin only |
| PATCH | `/tickets/attachments/:attachmentId/scan-status` | Update attachment scan status | `{ scanStatus }` | Admin only |

### Ticket Object Structure
```typescript
{
  id: number;
  userId?: number;
  subject: string;
  body: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  attachments: Array<{
    filename: string;
    contentType: string;
    storageKey: string;
    size: number;
    expiresAt?: Date;
    scanStatus?: "PENDING" | "CLEAN" | "INFECTED";
  }>;
  messages: Array<{
    id: number;
    body: string;
    isInternal: boolean;
    author: { name: string };
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### File Upload Flow
1. POST `/tickets/attachments/presign` → Get AWS S3 presigned URL
2. Client uploads file to S3 directly
3. POST `/tickets` → Include `storageKey` from upload response
4. Backend validates and stores attachment references

### Features
- **Rate Limiting**: 5 uploads per minute per IP
- **File Scanning**: Virus scan status tracking
- **Internal Notes**: Admin-only notes on tickets
- **User Isolation**: Users can only see their own tickets (unless admin)

---

## 6. Payment Endpoints

**File**: [artifacts/api-server/src/routes/payments.ts](artifacts/api-server/src/routes/payments.ts)  
**Base Path**: `/api/payments/`

### Payment Gateways Supported
1. **OxaPay** - Crypto payments (USDT, BTC, ETH, LTC on various networks)
2. **Easebuzz** - Indian payment gateway

### Cryptocurrency Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-crypto-payment` | Create OxaPay payment request |
| GET | `/payment-status/:trackId` | Check payment status |
| POST | `/oxapay-webhook` | Webhook for OxaPay notifications |

**Create Crypto Payment Input**:
```typescript
{
  amount: number;
  currency: "USDT" | "BTC" | "ETH" | "LTC";
  network: "TRC20" | "BEP20" | "ERC20";
  planType: "flash" | "instant" | "1step" | "2step";
  planSize: string; // e.g., "₹1,00,000"
  couponCode?: string;
  callbackUrl?: string;
}
```

### Easebuzz Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-easebuzz-payment` | Create Easebuzz payment request |
| POST | `/easebuzz-success` | Success callback from Easebuzz |
| POST | `/easebuzz-failure` | Failure callback from Easebuzz |
| POST | `/verify-utr` | Verify UTR for bank transfers |

**Payment Plans**:
```typescript
{
  flash: { // Flash Challenge
    "₹1,00,000": ₹999,
    "₹2,50,000": ₹1,999,
    "₹5,00,000": ₹3,999,
    "₹10,00,000": ₹7,499,
    "₹25,00,000": ₹14,999,
  },
  instant: { // Instant Funding
    "₹5,00,000": ₹8,999,
    "₹10,00,000": ₹16,999,
    "₹25,00,000": ₹37,999,
  },
  "1step": { // 1-Step Evaluation
    "₹5,00,000": ₹4,999,
    "₹10,00,000": ₹8,999,
    "₹25,00,000": ₹19,999,
  },
  "2step": { // 2-Step Evaluation
    "₹5,00,000": ₹3,599,
    "₹10,00,000": ₹6,599,
    "₹25,00,000": ₹14,549,
  }
}
```

**Valid Coupons**:
- `FLASH` → 60% discount
- `INSTANT` → 55% discount
- `FW` → 65% discount
- `FW70` → 70% discount
- `WELCOME` → 10% discount

### Features
- **Rate Limiting**: 10 payment attempts per 15 minutes
- **Multiple Currencies**: USDT, BTC, ETH, LTC
- **Multiple Networks**: TRC20, BEP20, ERC20
- **Coupon Support**: Percentage-based discounts
- **Payment Status Tracking**: Track payment by trackId
- **Webhook Integration**: Handles payment callbacks
- **UTR Verification**: Manual bank transfer verification

---

## 7. Challenge Account Creation Endpoints

**File**: [artifacts/api-server/src/routes/challenge.ts](artifacts/api-server/src/routes/challenge.ts)  
**Base Path**: `/api/challenge/`

### Challenge Information Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/types` | List all challenge types |
| GET | `/rules/:ruleId` | Get specific challenge rule |
| GET | `/account` | Get user's active challenge account |
| GET | `/progress` | Get today's challenge progress |
| GET | `/health` | Get challenge health score (0-100) |

### Pre-Trade Validation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/check` | Check if order would breach rules |

**Check Input**:
```typescript
{
  orderType: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  orderValue: number;
}
```

**Check Response**:
```typescript
{
  wouldBreach: boolean;
  violations: string[]; // List of broken rules
  remainingLossBudget: number;
  remainingProfitTarget: number;
}
```

### Breach & History Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/breaches` | Get all breaches for current challenge |
| GET | `/breaches/:date` | Get breaches for specific date (YYYY-MM-DD) |
| GET | `/history` | Get trading history |

### Payout Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/eligibility` | Check payout eligibility |
| POST | `/apply-payout` | Apply for payout |
| GET | `/payout-report` | Get payout report |

### Challenge Account Structure
```typescript
{
  id: string;
  userId: string;
  accountValue: number;
  realizedPnL: number;
  profitTargetRemaining: number;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PAUSED";
  phase: number; // 1 or 2 (for 2-step evaluation)
  rules: {
    maxDailyLoss: number;
    maxTradingHours: string[]; // e.g., ["09:15", "15:30"]
    allowedSymbols?: string[];
    minProfitTarget?: number;
    evaluationDays?: number;
  };
  createdAt: Date;
  startDate: Date;
  targetEndDate: Date;
}
```

### Challenge Progress Structure
```typescript
{
  date: string; // YYYY-MM-DD
  trades: number;
  realizedPnL: number;
  unrealizedPnL: number;
  maxOpenProfit: number;
  maxOpenLoss: number;
  healthScore: number; // 0-100, based on rule compliance
  breachCount: number;
}
```

---

## 8. KYC (Know Your Customer) Endpoints

### User KYC Routes

**File**: [artifacts/api-server/src/routes/kyc-new.ts](artifacts/api-server/src/routes/kyc-new.ts)  
**Base Path**: `/api/kyc/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/start` | Initialize KYC profile | Yes |
| GET | `/status` | Get profile status | Yes |
| PATCH | `/profile` | Update profile info | Yes |
| POST | `/documents/upload` | Upload document | Yes |
| PATCH | `/submit` | Submit for review | Yes |

### KYC Profile Input
```typescript
{
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  country: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  nationality?: string;
}
```

### Document Upload
```typescript
{
  documentType: "PASSPORT" | "AADHAR" | "PAN" | "DRIVER_LICENSE" | "UTILITY_BILL";
  file: File;
}
```

### KYC Profile Status
- `NOT_STARTED` - Profile created, no data
- `IN_PROGRESS` - User filling information
- `SUBMITTED` - Awaiting admin review
- `UNDER_REVIEW` - Admin reviewing
- `APPROVED` - KYC passed
- `REJECTED` - KYC failed
- `RESUBMIT` - User needs to resubmit

### KYC Risk Levels
- `LOW` - Low risk
- `MEDIUM` - Medium risk
- `HIGH` - High risk
- `CRITICAL` - Critical risk

### Admin KYC Routes

**File**: [artifacts/api-server/src/routes/admin-kyc.ts](artifacts/api-server/src/routes/admin-kyc.ts)  
**Base Path**: `/api/admin/kyc/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pending` | Get pending KYC submissions with filters |
| PATCH | `/:id/approve` | Approve KYC submission |
| PATCH | `/:id/reject` | Reject KYC submission |
| GET | `/:id/documents` | Get submission documents |
| POST | `/:id/request-clarification` | Request clarification from user |

**Pending Query Parameters**:
```
?status=PENDING&riskLevel=HIGH&country=IN&page=1&limit=20
```

**Features**:
- **Risk Scoring**: Automatic fraud risk calculation
- **Document Validation**: Verify document authenticity
- **Compliance Checks**: AML/sanctions screening
- **Email Notifications**: Notify users of approval/rejection
- **Audit Trail**: Track all KYC changes

---

## 9. Admin Endpoints

**File**: [artifacts/api-server/src/routes/admin.ts](artifacts/api-server/src/routes/admin.ts)  
**Base Path**: `/api/admin/`  
**Access**: Requires `admin`, `super_admin`, `support`, `compliance`, or `finance` role

### Admin Access Control
```typescript
const ADMIN_ROLES = ["super_admin", "admin", "support", "compliance", "finance"];

// First admin setup (requires ADMIN_SETUP_SECRET)
POST /api/admin/setup-first-admin
  Body: { setupSecret: string }
```

### Dashboard & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | System overview stats (user count, account count, etc.) |
| GET | `/analytics` | Detailed analytics dashboard |
| GET | `/audit` | Audit log queries |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users with pagination |
| PATCH | `/users/:id/role` | Update user role |

### Trading Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List trading accounts with filters |
| PATCH | `/accounts/:id/status` | Update account status |

### Payout Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payouts` | List payouts with filters |
| PATCH | `/payouts/:id` | Update payout status/details |

### Support Ticket Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/support` | List all support tickets |
| PATCH | `/support/:id` | Update ticket status |

### KYC Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kyc` | List KYC submissions |
| PATCH | `/kyc/:id` | Update KYC status |

### Certificate Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/certificates` | List certificates |
| POST | `/certificates` | Issue new certificate |
| PATCH | `/certificates/:id` | Update certificate |

### Challenge Rule Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/challenge-rules` | List challenge rules |
| POST | `/challenge-rules` | Create new challenge rule |
| PATCH | `/challenge-rules/:id` | Update challenge rule |

### Notification Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications/send` | Send notification to user/group |

**Send Notification Input**:
```typescript
{
  recipientId?: number;
  recipientRole?: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
}
```

---

## 10. Middleware Stack

**File**: [artifacts/api-server/src/middlewares/](artifacts/api-server/src/middlewares/)

### Order of Execution in App

1. **HTTP Logging** - `pinoHttp` - Logs all HTTP requests
2. **Clerk Proxy** - Routes to Clerk proxy if needed
3. **CORS** - Allows cross-origin requests
4. **Body Parser** - `express.json()` (10MB limit)
5. **Clerk Middleware** - Sets `req.auth` from Clerk token
6. **Observability** - Tracing/monitoring setup
7. **Monitoring Middleware** - Perf monitoring
8. **Threat Detection** - Detects malicious requests
9. **Session Activity** - Tracks session usage
10. **Security Headers** - Adds security headers
11. **Route Handlers** - Business logic
12. **Error Handler** - `monitoringErrorHandler`

### Key Middleware Files

#### [securityMiddleware.ts](artifacts/api-server/src/middlewares/securityMiddleware.ts)
- `authMiddleware` - Validates session token from header/cookie
- `rbacMiddleware` - Checks specific permission
- `sessionActivityMiddleware` - Records user activity
- `threatDetectionMiddleware` - Detects suspicious patterns

#### [clerkAuth.ts](artifacts/api-server/src/middlewares/clerkAuth.ts)
- Clerk-specific authentication setup
- Manages Clerk tokens

#### [clerkProxyMiddleware.ts](artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts)
- Proxies requests to Clerk API
- Route: `/.well-known/clerk`

#### [monitoringMiddleware.ts](artifacts/api-server/src/middlewares/monitoringMiddleware.ts)
- Performance monitoring
- Error tracking
- Response time measurement
- `monitoringErrorHandler` - Global error handler

### Security Headers Applied
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 11. Core Services

Located in [artifacts/api-server/src/lib/](artifacts/api-server/src/lib/)

### Security Service
**File**: `security-service.ts`
- `isIpLocked(email, ip, action)` - Check if IP is brute-force locked
- `logLoginAttempt(details)` - Record login attempt
- `revokeSession(sessionId)` - Invalidate session
- `revokeAllUserSessions(userId)` - Logout all sessions
- `verifySessionToken(token)` - Validate token

### RBAC Service
**File**: `rbac-service.ts`
- `hasPermission(userId, permission)`
- `hasAnyPermission(userId, permissions[])`
- `hasAllPermissions(userId, permissions[])`
- `getRolePermissions(role)`

### Validation Service
**File**: `validation-service.ts`
- `validateEmail(email)` - Check email format
- `validatePassword(password)` - Check password strength
- `validateRegistration(data)` - Validate registration data
- `normalizeEmail(email)` - Lowercase and trim email

### Support Service
**File**: `support-service.ts`
- `createTicket(userId, subject, body, attachments)`
- `addMessage(ticketId, userId, name, body, isInternal)`
- `createAttachmentPresign({ filename, contentType, size })` - S3 presign URL
- `updateTicketStatus(ticketId, status)`

### Fraud Detection
**File**: `fraud-detection.ts`
- `calculateRiskScore(user, kyc)` - Calculate fraud risk
- Checks:
  - User age and KYC completeness
  - Geographic inconsistencies
  - Payment method risk
  - Account activity patterns

### Email Service
**File**: `email.ts`
- `sendEmail(to, subject, html)`
- `paymentConfirmationEmail(user, payment)`
- `sendKycStatusEmail(user, status)`
- `sendKycApprovedEmail(user)`
- `sendKycRejectedEmail(user, reason)`

### Rate Limiting
**File**: `rate-limit.ts`
- `loginLimiter` - Login attempts limiter
- `paymentLimiter` - Payment requests limiter
- `generalLimiter` - General API limiter
- `kycUploadRateLimit` - KYC upload limiter

### Other Key Services
- `market-data-service.ts` - Market data streaming
- `execution-service.ts` - Trade execution
- `breach-engine.ts` - Challenge rule validation
- `challenge-progress-engine.ts` - Track challenge progress
- `payout-eligibility-engine.ts` - Check payout eligibility
- `monitoring-service.ts` - System monitoring
- `logger.ts` - Pino logger instance
- `supabase.ts` - Supabase client

---

## 12. Test Files

Located in [artifacts/api-server/src/__tests__/](artifacts/api-server/src/__tests__/)

### Test Files
1. **security.test.ts** - Security system tests
   - ValidationService tests
   - Password validation
   - Email validation
   
2. **phase11.e2e.test.ts** - End-to-end tests
   - Full user workflows
   - API integration tests

3. **phase11.failures.test.ts** - Failure scenario tests
   - Error handling
   - Edge cases
   - Recovery scenarios

### Test Setup
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@workspace/db";
```

**Running Tests**:
```bash
npm run test        # Run all tests
npm run test -- --ui  # UI mode
npm run test -- security.test.ts  # Specific file
```

**Test Dependencies**:
- `vitest` - Test runner
- `@workspace/db` - Test database
- Services under test imported directly

---

## 13. Database Schema

Located in `@workspace/db` monorepo package

### Core Tables
- `users` - User accounts with roles
- `authMethods` - Authentication methods (email/password)
- `sessions` - Active sessions
- `twoFactorSettings` - 2FA configuration
- `loginHistory` - Login attempt history
- `permissions` - Role-based permissions

### Support Tables
- `supportTickets` - Support tickets
- `supportAttachments` - Ticket attachments
- `supportMessages` - Ticket messages

### Payment Tables
- `payments` - Payment records
- `payouts` - Payout records

### Challenge Tables
- `challengeAccounts` - User challenge accounts
- `challengeRules` - Challenge rule definitions
- `challengeProgress` - Daily progress tracking
- `breachEvents` - Rule violations
- `payoutEligibility` - Payout status

### KYC Tables
- `kycProfiles` - User KYC information
- `kycDocuments` - Document uploads
- `kycReviews` - Admin reviews

### Other Tables
- `tradingAccounts` - Trading accounts
- `auditLogs` - Administrative actions
- `notifications` - User notifications
- `certificates` - Achievement certificates

---

## 14. API Types & Specifications

### API Zod Types
**Location**: [lib/api-zod/src/](lib/api-zod/src/)

Zod schemas for runtime validation:
- Generated from OpenAPI spec
- Used across API server and clients
- Type-safe request/response validation

### OpenAPI Specification
**Location**: [lib/api-spec/openapi.yaml](lib/api-spec/openapi.yaml)

- Machine-readable API specification
- Generated via Orval config
- Used for client generation

### API Client (React)
**Location**: [lib/api-client-react/](lib/api-client-react/)

- Auto-generated React client
- Hooks for all API endpoints
- Type-safe with Zod schemas

---

## 15. Key Dependencies

```json
{
  "@clerk/express": "^2.1.0",       // Authentication
  "express": "^5",                  // Web framework
  "drizzle-orm": "latest",          // ORM
  "@supabase/supabase-js": "^2.33", // Backend services
  "zod": "^3.23.2",                 // Schema validation
  "express-rate-limit": "^8.3.2",   // Rate limiting
  "pino": "^9",                     // Logging
  "prom-client": "^15.1.0",         // Prometheus metrics
  "ws": "^8.14.0",                  // WebSockets (optional)
  "@sentry/node": "^7.100.0",       // Error tracking
  "@google/genai": "^1.44.0"        // Gemini AI integration
}
```

---

## 16. Environment Configuration

### Required Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://user:pass@localhost/fundedwealth

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Payment Gateways
OXAPAY_MERCHANT_API_KEY=...
EASEBUZZ_KEY=...
EASEBUZZ_SALT=...
EASEBUZZ_ENV=test  # or prod

# Admin Setup
ADMIN_SETUP_SECRET=your-secret-key

# Email (implicit from Supabase or external service)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# Observability (optional)
SENTRY_DSN=...
```

---

## 17. Quick Start Guide

### 1. Install Dependencies
```bash
cd artifacts/api-server
pnpm install
```

### 2. Set Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with actual values
```

### 3. Build the Project
```bash
pnpm run build
```

### 4. Start the Server
```bash
pnpm run start
# Server runs on PORT (default 3000)
```

### 5. Test an Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ssw0rd123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9999999999"
  }'
```

---

## 18. API Response Formats

### Success Response
```json
{
  "data": { /* response data */ },
  "success": true,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": { /* validation errors */ }
}
```

### Pagination
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

---

## 19. Deployment Checklist

- [ ] Environment variables set on production
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Rate limiting thresholds adjusted
- [ ] CORS origins configured
- [ ] Admin user created via setup endpoint
- [ ] Email service configured
- [ ] Payment gateway credentials verified
- [ ] Monitoring/Sentry setup complete
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed

---

## 20. Troubleshooting

### Server Won't Start
- Check `PORT` environment variable
- Verify database connection (`DATABASE_URL`)
- Check Node version (should be 18+)

### Authentication Failing
- Verify Clerk keys are correct
- Check session token expiration
- Ensure `CLERK_PROXY_PATH` is properly configured

### Payment Processing Issues
- Verify payment gateway API keys
- Check webhook URLs are accessible
- Ensure environment is set to test/prod correctly

### Database Errors
- Run migrations: `pnpm run db:migrate`
- Check connection string format
- Verify database user permissions

---

**Last Updated**: May 20, 2026  
**API Server Version**: 0.0.0  
**Status**: Production Ready
