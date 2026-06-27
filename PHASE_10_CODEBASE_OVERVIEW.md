# FundedWealth Codebase Overview - Phase 10 Foundation

**Date**: May 18, 2026  
**Purpose**: Document existing architecture that Phase 10 will build upon

---

## 1. DATABASE SCHEMA (lib/db/src/schema)

### Core User Management
- **users**: Primary user table with Clerk integration (clerkId), profile fields, KYC status, gamification data
  - Fields: id, clerkId, email, firstName, lastName, phone, city, state, avatarUrl, role, affiliateCode, referredBy, kycStatus, experiencePoints, currentLevel, achievementCount, totalPayout
  - Roles: user, admin
  - Notifications settings stored as JSON
  
- **sessions**: Session management (used with auth)
- **login-history**: Login tracking and audit
- **device-history**: Device-based security tracking
- **auth-methods**: Multiple authentication methods support

### Trading Core
- **trading-accounts**: Main account holder for each user's trading challenge
  - Tracks: planType, accountSize, accountCode, status, phase, currentBalance, profitLoss, dailyDrawdown, maxDrawdown, profitTarget, profitSplit (80%), scalingLevel, fundingStatus
  
- **challenge-accounts**: Phase 6 challenge system accounts (UUID-based, separate from trading-accounts)
  - Tracks: accountName, accountSize, initialBalance, currentBalance, currentEquity, realizedPnL, unrealizedPnL
  
- **trading_orders**: Individual trade orders placed
  - Fields: userId, symbol, side, qty, type (market/limit), price, stopLoss, takeProfit, status
  
- **positions**: Active and closed trading positions
  - Tracks: userId, orderId, symbol, side, qty, entryPrice, exitPrice, pnl, slTriggered, tpTriggered, scaleInCount, scaleOutCount
  
- **executions**: Order execution records
  - Links: orderId, userId, symbol, side, qty, price
  
- **trade_logs**: Historical trade records for journal/analytics
  
- **trade-journal**: Trading journal entries for pattern tracking

- **order_brackets**: Bracket order management (one order, multiple exit legs)
- **order_modifications**: Modification history for tracking SL/TP changes
- **position_modifications**: Position modification audit trail
- **advanced-orders**: GTT, OCO, Trailing stop, Bracket orders

### Funding & Payouts
- **orders**: Payment/purchase orders (for plans, memberships)
  - Fields: userId, amount, planType, paymentMethod, utrReference, status
  
- **payouts**: Payout requests and processing
  - Fields: userId, amount, method (UPI default), currentStatus (REQUESTED→UNDER_REVIEW→PROCESSING→APPROVED→PAID/REJECTED), transactionId, isVerified
  - Statuses: REQUESTED, UNDER_REVIEW, PROCESSING, APPROVED, PAID, REJECTED
  
- **payout-timeline-events**: Detailed payout audit trail with timeline
- **payout-eligibility**: Eligibility calculation engine
- **payout-reviews**: Admin review tracking
- **payment-failures**: Failed payment tracking

- **funded-accounts**: Tracks when accounts get funded status
- **funding-events**: Historical funding events log

### Affiliate System
- **referrals** (aka affiliateReferrals): Multi-level referral structure
  - Fields: referrerUserId, referredUserId, referralCode, commissionAmount, status, planPurchased, purchaseAmount, level
  
- **affiliate-clicks**: Click tracking for referral links
  - Fields: referralCode, ipHash, country, device, clickedAt
  
- **affiliate-payouts**: Affiliate commission payouts (separate from user payouts)
  - Fields: userId, amount, method (UPI), status, processedAt

### KYC & Verification
- **kyc-profiles**: Complete KYC profile data (one-to-one with users)
  - Fields: fullName, dateOfBirth, country, phone, address fields, status (NOT_STARTED→PENDING→UNDER_REVIEW→APPROVED/REJECTED/EXPIRED/RESUBMISSION_REQUIRED)
  - Verification level (0-4), riskScore, riskLevel
  
- **kyc-documents**: Uploaded KYC documents
- **kyc-submissions**: KYC submission history and retries
- **kyc-reviews**: Admin KYC review records

### Security & Compliance
- **security-incidents**: Security events and incidents
- **breach-events**: Data breach tracking
- **fraud-events**: Fraud detection event logs
- **referral-fraud-logs**: Specific referral fraud detection
- **risk-profiles**: User risk assessment profiles
- **two-factor-settings**: 2FA configuration per user
- **rate-limit-violations**: Rate limiting violations
- **ip-history**: IP address changes for account security

### Notifications & Communication
- **notifications**: In-app notifications
  - Fields: userId, type, title, message, link, category, priority, deliveryChannels, isRead
  - Categories: system, payout, trade, marketing
  
- **notification-failures**: Failed notification delivery tracking
- **conversations**: Chat/support conversations
- **messages**: Individual messages in conversations
- **contact-submissions**: Contact form submissions

### Challenge & Gamification
- **challenge-progress**: Daily snapshots of challenge progress (Phase 6)
  - Tracks: dayStartBalance, dayEndBalance, dailyPnL, dailyDD, tradesExecuted, winRate, profitTargetProgress, status, healthScore
  
- **challenge-rules**: Rules for challenges (profit targets, drawdown limits, etc.)
- **challenge_state**: Current state of challenge
- **account-states**: Account state transitions and history
- **discipline-scores**: Discipline scoring system
- **gamification**: Gamification data (achievements, badges, points)

### Market Data & Analytics
- **market-snapshots**: Market snapshot history
- **economic-events**: Economic calendar events
- **market_breadth**: Market breadth data (FII/DII, breadth indicators)
- **oi_analytics**: Open Interest analytics
- **fii_dii_flow**: FII/DII flow tracking
- **heatmap_data**: Heatmap data for market visualization
- **greeks_cache**: Options Greeks cache
- **options_contracts**: Options contract data
- **expiry_calendar**: Options expiry calendar
- **ai-trade-insights**: AI-generated trade insights

### Audit & Monitoring
- **audit-logs**: Comprehensive audit logging
- **api-logs**: API request/response logging
- **webhook-logs**: Webhook delivery tracking
- **system-errors**: System error tracking
- **system-incidents**: System incidents log
- **system-backups**: Database backup records
- **alert-rules**: Alert rule definitions
- **behavior-patterns**: User behavior pattern analysis

### Additional
- **blog-posts**: CMS blog posts
- **impact-donations**: Social impact/donation tracking
- **championship-registrations**: Championship registration data
- **sessions**: Session management
- **session-analytics**: Session analytics

---

## 2. API ROUTES (artifacts/api-server/src/routes)

### Authentication Routes (`/api/auth`)
- `POST /register` - Register with email/password
- `POST /login` - Login with credentials
- `POST /logout` - Logout and clear session
- `POST /verify-2fa` - Verify 2FA token
- `POST /enable-2fa` - Enable 2FA
- `POST /disable-2fa` - Disable 2FA
- `GET /status` - Get current auth status

### User Management (`/api/users`)
- `GET /me` - Get current user profile (Clerk-based)
- `POST /me` - Update user profile (auto-creates from Clerk webhook)
- `GET /leaderboard` - Top 20 traders by total payout

### Trading Accounts (`/api/accounts`)
- Get/list trading accounts
- Create new trading account
- Update account status
- Track account phases (evaluation, funded, scaling)

### Orders (`/api/orders`)
- `POST /` - Create new trading order
- `GET /` - List user's orders
- `PATCH /:id` - Update order (fill, close, etc.)
- Tracks: symbol, side (BUY/SELL), qty, type (MARKET/LIMIT/STOP), price, SL, TP

### Trades (`/api/trades`)
- `GET /` - List executed trades (trade logs)
- Historical trade data for analytics

### Positions (`/api/positions`)
- `GET /` - List open and closed positions
- Position management endpoints
- Track entry/exit prices, PnL

### Advanced Orders (`/api/orders/bracket`, `/api/orders/oco`, `/api/orders/gtt`, `/api/orders/trailing`)
- `POST /bracket` - Create bracket order (main + SL + TP legs)
- `POST /oco` - One-Cancels-Other order
- `POST /gtt` - Good-Till-Trigger order
- `POST /trailing` - Trailing stop order
- `PATCH /:id` - Modify advanced order
- `PATCH /:id/sl` - Modify stop loss
- `PATCH /:id/tp` - Modify take profit

### Execution (`/api/execution`)
- `POST /order` - Execute order
- `GET /status/:id` - Check execution status
- `PATCH /cancel/:id` - Cancel order
- `PATCH /modify/:id` - Modify order
- `POST /close/:id` - Close position
- `POST /partial-close/:id` - Partial close
- `POST /reverse/:id` - Reverse position

### Payouts (`/api/payouts`)
- `GET /` - List payout requests
- `GET /stats` - Payout statistics
- `POST /request` - Request payout
- `PATCH /:id/status` - Update payout status (admin)
- `GET /:id/timeline` - Get payout timeline events
- `GET /:id` - Get payout details
- `GET /public` - Public payout statistics

### Affiliate System (`/api/affiliate`)
- `GET /stats` - Affiliate statistics (clicks, conversions, earnings)
- `GET /my-link` - Get personal referral link
- `GET /history` - Referral history and conversions
- `GET /clicks` - Click tracking data
- `GET /leaderboard` - Top affiliates
- `POST /claim` - Claim affiliate commission
- `GET /payout-history` - Affiliate payout history
- `POST /click` - Track affiliate click
- `POST /track` - Track referral conversion
- `POST /register` - Register as affiliate

### Payments (`/api/payments`)
- `POST /create-crypto-payment` - Create crypto payment (Oxapay)
- `POST /oxapay-webhook` - Webhook for payment confirmation

### KYC (`/api/kyc` and `/api/admin/kyc`)
- **User KYC** (`/api/kyc`):
  - `GET /status` - Get KYC submission status
  - `POST /submit` - Submit KYC profile
  
- **Admin KYC** (`/api/admin/kyc`):
  - `GET /pending` - List pending KYC submissions
  - `PATCH /:profileId/approve` - Approve KYC
  - `PATCH /:profileId/reject` - Reject KYC with reason
  - `PATCH /:profileId/request-resubmission` - Request resubmission
  - `GET /analytics/dashboard` - KYC analytics

### Fraud Detection (`/api/fraud`)
- `GET /risk-score/:userId` - Calculate user risk score
- `GET /events/:userId` - Get fraud events for user
- `GET /dashboard` - Fraud admin dashboard
- `POST /check` - Run fraud check
- `POST /detect-multi-account` - Detect multi-accounting
- `POST /detect-referral-fraud` - Detect referral abuse
- `PATCH /events/:eventId/resolve` - Resolve fraud event
- `PATCH /block-user/:userId` - Block suspicious user
- `GET /high-risk-users` - List high-risk users
- `POST /calculate-risk` - Calculate fraud risk score
- `POST /detect-copy-trading` - Detect copy trading patterns
- `POST /detect-hft` - Detect high-frequency trading abuse
- `POST /detect-martingale` - Detect martingale strategy abuse

### Challenge (`/api/challenge`)
- `GET /rules/:ruleId` - Get challenge rules
- `GET /types` - Get challenge types
- `GET /account` - Get challenge account
- `GET /progress` - Get progress snapshot
- `GET /health` - Get account health status
- `POST /check` - Check for rule breaches
- `GET /breaches` - List breaches
- `GET /breaches/:date` - Breaches for specific date
- `GET /history` - Challenge history
- `GET /eligibility` - Payout eligibility check
- `POST /apply-payout` - Apply for payout after challenge pass
- `GET /payout-report` - Challenge payout report

### Notifications (`/api/notifications`)
- `POST /` - Create notification
- `GET /` - List notifications
- `GET /unread-count` - Get unread count
- `PATCH /:id/read` - Mark as read
- `PATCH /read-all` - Mark all as read
- `DELETE /:id` - Delete notification
- `GET /preferences` - Get notification preferences
- `PATCH /preferences` - Update notification preferences

### Market Data (`/api/market`)
- `GET /quotes` - Get market quotes

### Economic Events (`/api/economic-events`)
- `GET /` - List economic events
- `POST /sync` - Sync event calendar (admin)
- `PATCH /:id` - Update event (admin)

### Admin (`/api/admin`)
- `GET /overview` - Admin dashboard overview
- `GET /analytics` - System analytics
- `GET /users` - List all users
- `PATCH /users/:id/role` - Change user role
- `GET /accounts` - List trading accounts
- `PATCH /accounts/:id/status` - Update account status
- `GET /payouts` - List all payouts
- `PATCH /payouts/:id` - Update payout status
- `GET /support` - Support tickets
- `PATCH /support/:id` - Update support ticket
- `GET /kyc` - KYC submissions (legacy)
- `PATCH /kyc/:id` - Update KYC (legacy)
- `GET /certificates` - Trading certificates
- `POST /certificates` - Create certificate
- `PATCH /certificates/:id` - Update certificate
- `GET /challenge-rules` - List challenge rules
- `POST /challenge-rules` - Create challenge rule
- `PATCH /challenge-rules/:id` - Update challenge rule
- `POST /notifications/send` - Send notification to users
- `GET /audit` - Audit log

### Monitoring (`/api/monitor`)
- `GET /errors` - System errors
- `GET /incidents` - System incidents
- `GET /health` - System health
- `GET /db-health` - Database health
- `GET /backup-events` - Backup events
- `POST /backup-events` - Create backup event
- `GET /notification-failures` - Failed notifications
- `POST /notification-failures` - Log notification failure
- `GET /payments` - Payment monitoring
- `GET /alerts` - Monitoring alerts
- `POST /alerts` - Create alert
- `PATCH /alerts/:id` - Update alert
- `DELETE /alerts/:id` - Delete alert
- `POST /incidents` - Log incident
- `PATCH /resolve` - Resolve incident
- `GET /backup-recovery` - Backup recovery info
- `POST /backup-recovery` - Request recovery
- `GET /incident-sla` - Incident SLA tracking
- `POST /incident-sla` - Create SLA
- `PATCH /incident-sla/:id` - Update SLA
- `GET /sla-metrics` - SLA metrics

### Blog (`/api/blog`)
- `GET /` - List blog posts
- `GET /:slug` - Get post by slug

### Auto-Blog (`/api/auto-blog`)
- `POST /generate` - Generate blog post (admin, AI-powered)
- `GET /topics` - Get topic suggestions

### Chat (`/api/chat`)
- Websocket-based chat system
- Support conversations

### Championship (`/api/championship`)
- `POST /register` - Register for championship
- `GET /leaderboard` - Championship leaderboard

### Trade Journal (`/api/trade-journal`)
- Trade journal endpoints

### Contact (`/api/contact`)
- `POST /` - Submit contact form

### Impact (`/api/impact`)
- `GET /stats` - Impact statistics
- `GET /leaderboard` - Top donors
- `POST /donate` - Make donation

### Audit (`/api/audit`)
- `GET /orders` - Order audit trail
- `GET /positions` - Position audit trail

### Health (`/api/health`)
- `GET /healthz` - Simple health check
- `GET /health` - Detailed health check

---

## 3. FRONTEND PAGES (artifacts/fundedwealth/src/pages)

### Authentication Pages
- **sign-in.tsx** - Clerk sign-in page
- **sign-up.tsx** - Clerk sign-up page
- **login.tsx** - Alternative login interface

### Main Pages
- **home.tsx** - Landing page
- **dashboard.tsx** - Main user dashboard with trading data, performance charts, journal, notifications
- **about.tsx** - About FundedWealth
- **mission.tsx** - Mission statement page
- **impact.tsx** - Social impact/charity page

### Trading & Accounts
- **trade.tsx** - Trading terminal/interface
- **payouts.tsx** - Payout request and history
- **leaderboard.tsx** - Top traders leaderboard
- **economic-calendar.tsx** - Economic events calendar

### Challenge & Gamification
- **championship.tsx** - Championship system
- **scaling.tsx** - Account scaling/progression information
- **rules.tsx** - Trading rules and policies

### Affiliate & Referral
- **referral.tsx** - Referral program landing page
- **checkout.tsx** - Checkout page for plan purchase

### Community & Content
- **blog.tsx** - Blog listing
- **success-stories.tsx** - User success stories
- **community.tsx** - Community page
- **faq.tsx** - FAQ section

### KYC & Verification
- **kyc.tsx** - KYC submission interface

### Admin
- **admin.tsx** - Admin dashboard

### Legal Pages
- **terms.tsx** - Terms and conditions
- **privacy.tsx** - Privacy policy
- **refund.tsx** - Refund policy

### Error Page
- **not-found.tsx** - 404 page

---

## 4. AUTHENTICATION SYSTEM

### Clerk Integration
- **Authentication Provider**: Clerk via `@clerk/react` and `@clerk/express`
- **Frontend**:
  - `ClerkProvider` wraps the entire app
  - `useAuth()` hook provides: `isSignedIn`, `isLoaded`, `userId`
  - `useClerk()` hook for clerk instance access
  - Pages: sign-in, sign-up pages use Clerk redirects
  
- **Backend**:
  - `getAuth(req)` from `@clerk/express` middleware
  - Checks `auth.userId` to get Clerk user ID
  - All protected routes require auth middleware
  
- **User Sync**:
  - `POST /api/users/me` auto-creates DB user from Clerk data
  - clerkId is stored in users table as reference
  - Auto-assigns admin role for specific emails (e.g., fundedwealth.ind@gmail.com)
  
- **Security Middleware**:
  - `authMiddleware` - Requires authentication
  - `rbacMiddleware` - Role-based access control
  - `sessionActivityMiddleware` - Track session activity

### Session Management
- Session table tracks active sessions
- Login history tracking (login-history schema)
- 2FA support available
- Device tracking for security

---

## 5. CORE SERVICES & UTILITIES (artifacts/api-server/src/lib)

### Security & Validation
- **security-service.ts** - Security operations, encryption, validation
- **validation-service.ts** - Input validation, normalization
- **rbac-service.ts** - Role-based access control
- **rate-limit.ts** - Rate limiting for endpoints

### Trading & Execution
- **terminal-service.ts** - Trading terminal WebSocket handling
- **execution-service.ts** - Order execution engine
- **advanced-execution-service.ts** - Advanced order (bracket, OCO, GTT) handling
- **breach-engine.ts** - Rule breach detection for challenges
- **challenge-rule-validator.ts** - Challenge rule validation
- **challenge-progress-engine.ts** - Daily challenge progress calculation

### Fraud Detection
- **fraud-detection-service.ts** - Main fraud detection orchestration
- **fraud-detection.ts** - Fraud algorithms (multi-account, referral fraud, copy trading, HFT, martingale)
- **risk-scoring-engine.ts** - Risk score calculation

### Market Data
- **market-data-service.ts** - Market data fetching and caching
- **economic-calendar.ts** - Economic events data
- **expiry-service.ts** - Options expiry tracking
- **options-data-service.ts** - Options contract data
- **greeks-calculator.ts** - Options Greeks calculations
- **oi-analytics-service.ts** - Open Interest analytics
- **breadth-service.ts** - Market breadth analytics
- **fii-dii-service.ts** - FII/DII flow tracking
- **heatmap-service.ts** - Heatmap data generation

### Payout & Eligibility
- **payout-eligibility-engine.ts** - Determines if user can withdraw
- Checks: profit target met, drawdown within limits, challenge completion, compliance

### Monitoring & Alerts
- **monitoring-service.ts** - System health monitoring
- **performance-monitor.ts** - Performance tracking
- **logger.ts** - Structured logging

### Integration Services
- **email.ts** - Email sending service
- **supabase.ts** - Supabase/real-time notifications
- **support-knowledge.ts** - Support/knowledge base

### Providers (artifacts/api-server/src/lib/providers)
- Integration with external services (payment processors, market data providers)

---

## 6. KEY ARCHITECTURAL PATTERNS

### Data Flow
1. **Frontend** → Clerk auth → **Backend** → Validates with Clerk → DB operations
2. **Orders flow**: Create order → Execute → Create execution → Open position → Close → Log trade
3. **Payout flow**: Request → Admin review → Status update → Notification → Payment processing
4. **Challenge flow**: Account creation → Daily progress tracking → Rule breach checking → Eligibility determination

### Technology Stack
- **Frontend**: React + TypeScript, Vite, Wouter (routing), TanStack Query (data fetching), Framer Motion (animations), Recharts (charts)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk
- **Validation**: Zod schemas (drizzle-zod)
- **Real-time**: Supabase WebSockets, terminal-service WebSocket
- **UI Components**: Custom + shadcn/ui
- **i18n**: react-i18next

### Database Structure
- Uses PostgreSQL with Drizzle ORM
- Schemas exported from lib/db/src/schema/index.ts
- Zod validation schemas for type safety
- Timestamps always include timezone
- Foreign keys with cascade delete where appropriate

### Context & Hooks
- **TradingContext** - Trading data state management (from contexts/TradingContext)
- **useNotifications** - Notification management hook
- **useAuth** - Clerk auth hook
- **Query client** - TanStack Query for caching and fetching

---

## 7. WHAT PHASE 10 WILL BUILD UPON

Phase 10 should leverage:

1. **User Management**: All user/auth infrastructure already exists (Clerk integration, user table, sessions)

2. **Trading Infrastructure**: 
   - Order/position/execution system fully built
   - Challenge system with daily progress tracking
   - Rule breach detection engine
   - Advanced orders (bracket, OCO, GTT, trailing)

3. **Payout System**:
   - Complete payout request workflow
   - Timeline events for audit trail
   - Admin review system
   - Notification integration

4. **Affiliate System**:
   - Multi-level referral tracking
   - Click tracking and fraud detection
   - Commission calculation
   - Affiliate payouts

5. **KYC System**:
   - Multi-stage KYC profiles
   - Document uploading
   - Admin review workflow
   - Risk scoring

6. **Fraud Detection**:
   - Multi-account detection
   - Referral fraud detection
   - Copy trading detection
   - HFT abuse detection
   - Martingale strategy detection
   - Risk scoring engine

7. **Monitoring & Admin**:
   - System health monitoring
   - Error tracking
   - Audit logging
   - Incident management
   - SLA tracking

8. **Frontend Components**:
   - Dashboard with charts and notifications
   - Trading interface (basic)
   - Admin panels (basic)
   - Leaderboards
   - Settings pages

9. **API Client Library** (lib/api-client-react):
   - Hooks for common operations
   - Type-safe API calls

Phase 10 should focus on enhancements, new features, UI/UX improvements, and bug fixes built on this foundation.
