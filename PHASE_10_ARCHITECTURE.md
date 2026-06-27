# Phase 10: Growth + Trust + Public Reputation Architecture

**Objective**: Build public trust, increase retention & acquisition through transparency, social proof, and gamification

**Date**: May 18, 2026

---

## 🎯 Strategic Goals

1. **Public Trust**: Transparent payout verification + certificate authentication
2. **Social Proof**: Public achievements, leaderboards, reviews
3. **Acquisition**: Referral automation, affiliate marketing engine
4. **Retention**: Gamification (badges, ranks), email campaigns
5. **Community**: Discord & Telegram integrations
6. **Transparency**: Blog, trading guides, economic updates

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Public Profiles │ Leaderboards │ Payouts │ Reviews     │
│  Badges/Ranks   │ Blog          │ Certs   │ SEO         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API Gateway (Express)                  │
├─────────────────────────────────────────────────────────┤
│ NEW PHASE 10 ROUTES:                                     │
│ GET  /api/public/payouts              (Verify payouts)   │
│ GET  /api/public/certificates/:id     (QR verify)        │
│ GET  /api/public/traders/:id          (Public profile)   │
│ GET  /api/leaderboards/traders        (Top traders)      │
│ GET  /api/leaderboards/affiliates     (Top affiliates)   │
│ GET  /api/traders/:id/reviews         (Trader reviews)   │
│ GET  /api/traders/:id/achievements    (Badges/ranks)     │
│ GET  /api/affiliates/:id/stats        (Affiliate growth) │
│ GET  /api/analytics/:period           (Retention/churn)  │
│ POST /api/reviews                     (Submit review)    │
│ POST /api/referrals                   (Track referral)   │
│ GET  /api/blog                        (Blog posts)       │
│ POST /api/community/webhook/:platform (Discord/Telegram)│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                    │
├─────────────────────────────────────────────────────────┤
│ ✅ PublicPayoutService      - Payout verification      │
│ ✅ CertificateService       - QR & auth verification   │
│ ✅ AchievementService       - Badges & ranks system    │
│ ✅ LeaderboardService       - Trader/affiliate rankings │
│ ✅ ReviewService            - Verified trader reviews   │
│ ✅ AffiliateGrowthService   - Commission & tracking    │
│ ✅ SEOService               - Blog & guides             │
│ ✅ EmailAutomationService   - Campaigns & triggers     │
│ ✅ ReferralService          - Tracking & fraud check   │
│ ✅ CommunityService         - Discord/Telegram sync    │
│ ✅ AnalyticsService         - Retention/conversion     │
│ ✅ ReputationService        - Score calculation        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
├─────────────────────────────────────────────────────────┤
│ NEW SCHEMAS:                                             │
│ • public_payouts              - Anonymized payout logs  │
│ • certificates                - Certificate QR codes    │
│ • trader_achievements         - Badges & milestones    │
│ • leaderboards                - Rankings (real-time)    │
│ • trader_reviews              - Verified reviews        │
│ • affiliate_metrics            - Growth tracking        │
│ • referral_tracking            - Referral attribution   │
│ • blog_posts                  - SEO content            │
│ • email_campaigns              - Automation triggers    │
│ • community_integrations      - Discord/Telegram       │
│ • analytics_snapshots          - Retention metrics     │
│ • reputation_scores            - Trust scoring        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│  (New tables for Phase 10)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### 1. Public Payouts System

**Schema**: `public_payouts`
```sql
-- Anonymized, public payout records
- id (UUID primary key)
- anonymous_id (e.g., "Trader-123") -- NOT user_id
- amount_usd (decimal)
- currency (USD, EUR, GBP)
- payout_date (timestamp)
- status (completed, pending, rejected)
- challenge_duration (14_days, 30_days, etc.)
- created_at (timestamp)
- index: (payout_date DESC)
```

**Data Flow**:
1. When payout is COMPLETED → Create public_payouts record
2. Hash user_id to create anonymous_id (one-way hash)
3. Store: anonymous_id, amount, date, status
4. DO NOT store: user name, email, personal info
5. Expose via `/api/public/payouts?limit=100&period=7days`

---

### 2. Certificates System

**Schema**: `certificates`
```sql
-- QR-encoded achievement certificates
- id (UUID)
- user_id (FK users)
- certificate_type (payout, challenge_passed, milestone)
- challenge_id (FK challenges)
- amount_usd (decimal)
- issued_date (timestamp)
- qr_code (text - encoded data)
- signature (HMAC-SHA256 signed)
- verified_at (timestamp nullable)
- verification_count (int default 0)
- created_at (timestamp)
```

**QR Data Format**:
```json
{
  "cert_id": "cert-xyz",
  "trader_anonymous_id": "Trader-456",
  "challenge_duration": "30_days",
  "payout_amount": 5000,
  "issued_date": "2026-05-18",
  "signature": "hmac_xyz",
  "verify_url": "https://fundedwealth.com/verify/cert-xyz"
}
```

---

### 3. Trader Achievements System

**Schema**: `trader_achievements`
```sql
-- Badges, ranks, milestones
- id (UUID)
- user_id (FK users)
- achievement_type (badge, rank, milestone)
- badge_code (FIRST_PAYOUT, 5_PAYOUTS, $50K_TOTAL, etc.)
- rank_level (1-5: Bronze, Silver, Gold, Platinum, Diamond)
- milestone_description (e.g., "$100K+ total funded")
- unlocked_at (timestamp)
- points (int - for gamification)
- created_at (timestamp)

ACHIEVEMENT_TYPES:
- First Payout Badge
- 5 Successful Payouts
- 10 Successful Payouts
- $25K Total Funded
- $50K Total Funded
- $100K+ Total Funded
- 90%+ Consistency
- Zero Violations
- Community Helper (reviews)
```

---

### 4. Leaderboards System

**Schema**: `leaderboards` (real-time snapshots)
```sql
-- Cached rankings, updated hourly
- id (UUID)
- leaderboard_type (traders_earnings, traders_consistency, affiliates_commissions)
- period (month, quarter, alltime)
- rank (1, 2, 3, ...)
- anonymous_id (e.g., "Trader-123")
- metric_value (earnings, consistency %, commission)
- updated_at (timestamp)
- index: (leaderboard_type, period, rank)
```

---

### 5. Reviews System

**Schema**: `trader_reviews`
```sql
-- Verified trader reviews
- id (UUID)
- reviewer_id (FK users - verified trader)
- reviewer_anonymous_id (e.g., "Trader-789")
- reviewee_user_id (FK users - who is reviewed)
- rating (1-5 stars)
- review_text (text)
- verified_payout (boolean - does reviewer have confirmed payout?)
- verified_at (timestamp)
- helpful_count (int - community rating)
- status (approved, pending_moderation, rejected)
- created_at (timestamp)
- index: (reviewee_user_id, status, created_at DESC)
```

---

### 6. Affiliate Growth System

**Schema**: `affiliate_metrics`
```sql
-- Enhanced affiliate tracking
- id (UUID)
- affiliate_id (FK users)
- period (day, week, month)
- clicks (int)
- conversions (int)
- conversion_rate (decimal %)
- commission_total (decimal USD)
- referral_count (int active traders)
- avg_trader_lifetime_value (decimal)
- updated_at (timestamp)

affiliate_leaderboard: Ranks by commission in period
```

---

### 7. Referral Tracking System

**Schema**: `referral_tracking`
```sql
-- Detailed referral attribution & fraud check
- id (UUID)
- affiliate_id (FK users)
- referred_user_id (FK users)
- referral_code (text unique)
- referral_link (text)
- click_date (timestamp)
- signup_date (timestamp nullable)
- first_deposit_date (timestamp nullable)
- first_deposit_amount (decimal)
- commission_earned (decimal)
- commission_status (pending, approved, paid)
- fraud_score (0-100 - multi-account check)
- created_at (timestamp)
- index: (affiliate_id, commission_status, created_at DESC)
```

---

### 8. Email Automation System

**Schema**: `email_campaigns`
```sql
-- Email automation triggers & templates
- id (UUID)
- campaign_name (welcome, challenge_update, payout_ready, retention)
- trigger_event (signup, challenge_started, payout_processed, 7days_inactive)
- email_template_id (FK templates)
- user_id (FK users nullable - specific user)
- user_segment (all_users, traders_only, new_traders, at_risk)
- scheduled_at (timestamp nullable)
- sent_at (timestamp nullable)
- open_count (int)
- click_count (int)
- status (draft, scheduled, sent, failed)
- created_at (timestamp)

email_templates:
- id (UUID)
- template_name (welcome_new_trader, challenge_started, payout_approved)
- subject (text)
- body_html (text)
- cta_button (text - call to action)
- version (1, 2, 3 - for A/B testing)
```

---

### 9. Blog & SEO System

**Schema**: `blog_posts`
```sql
-- SEO content for organic acquisition
- id (UUID)
- title (text - SEO optimized)
- slug (text unique - URL-friendly)
- excerpt (text - meta description)
- content_html (text - rich content)
- author_id (FK users - admin)
- category (trading_guides, prop_comparison, market_updates, news)
- tags (text array - trading, prop_firms, options, etc.)
- published_at (timestamp)
- view_count (int)
- seo_keywords (text array)
- meta_description (text)
- canonical_url (text)
- created_at (timestamp)
- updated_at (timestamp)
- index: (published_at DESC, category)

PLANNED CONTENT:
1. "How to Pass Your Prop Trading Challenge" (beginner guide)
2. "Prop Firm Comparison: FundedWealth vs Others"
3. "Options Trading on Prop Firm Accounts" (advanced)
4. "Trading Psychology: How to Handle Pressure"
5. "Economic Calendar Integration for Traders"
6. "Advanced Order Types: Brackets, OCO, GTT"
7. "Risk Management Strategies"
8. "Common Mistakes Funded Traders Make"
```

---

### 10. Community Integrations System

**Schema**: `community_integrations`
```sql
-- Discord & Telegram sync
- id (UUID)
- platform (discord, telegram)
- platform_id (Discord server ID, Telegram chat ID)
- webhook_url (platform webhook URL)
- events_enabled (text array - payout, review, achievement, leaderboard)
- last_sync_at (timestamp)
- sync_status (active, paused, error)
- error_log (jsonb array)
- created_at (timestamp)

EVENTS TO PUBLISH:
- New payout verification (anonymized)
- New high review score
- New achievement/badge unlocked
- Leaderboard ranking change
- Top trader featured
```

---

### 11. Analytics System

**Schema**: `analytics_snapshots`
```sql
-- Retention, conversion, churn metrics
- id (UUID)
- period_date (date)
- metric_type (retention, conversion, churn, referral_rate)
- metric_value (decimal %)
- cohort (new_traders, active_traders, at_risk, paying_users)
- details (jsonb - additional breakdown)
- created_at (timestamp)

METRICS TO TRACK:
- Day 1 retention (% back after 1 day)
- Day 7 retention (% back after 7 days)
- Day 30 retention (% back after 30 days)
- Conversion rate (signups → first deposit)
- Payout completion rate (entered → completed payout)
- Churn rate (inactive > 30 days)
- Referral conversion (clicks → signups → deposits)
- Affiliate growth (new affiliates per week)
```

---

### 12. Reputation Scoring System

**Schema**: `reputation_scores`
```sql
-- Overall trader reputation
- id (UUID)
- user_id (FK users)
- reputation_score (0-100)
- component_scores (jsonb):
  - payouts_completed (0-25): based on successful payouts
  - consistency (0-25): based on win rate/rules compliance
  - reviews (0-20): based on community reviews
  - achievements (0-15): based on badges/milestones
  - community_contribution (0-15): reviews, help, engagement
- last_calculated_at (timestamp)
- updated_at (timestamp)
```

---

## 🔄 Data Flow Examples

### Example 1: Public Payout Verification

```
1. Trader completes payout → triggers payout.complete webhook
2. PayoutService confirms verification → calls PublicPayoutService
3. PublicPayoutService:
   - Hash user_id: "user-123" → "Trader-123"
   - Insert into public_payouts: {
       anonymous_id: "Trader-123",
       amount_usd: 5000,
       payout_date: 2026-05-18,
       status: "completed"
     }
4. Frontend calls GET /api/public/payouts?limit=20
5. Response: Recent 20 verified payouts (anonymized)
6. Display on public dashboard: "Trader-123 withdrew $5,000 on May 18"
```

### Example 2: Certificate Generation & Verification

```
1. Payout completed → CertificateService.generate()
2. Generate QR data:
   {
     cert_id: "cert-abc123",
     trader_anonymous_id: "Trader-123",
     amount: 5000,
     issued_date: "2026-05-18",
     signature: hmac_sha256(data, SECRET_KEY)
   }
3. Encode as QR code PNG
4. Store in certificates table
5. Trader shares QR on Twitter/LinkedIn
6. Viewer scans QR → /verify/cert-abc123
7. Frontend: calls GET /api/public/certificates/cert-abc123
8. Verify HMAC signature
9. Display: "✅ Verified: Trader withdrew $5,000 on May 18, 2026"
```

### Example 3: Achievement Badge System

```
1. Trader completes first payout
   → AchievementService.checkUnlock("FIRST_PAYOUT", user_id)
2. Insert into trader_achievements:
   {
     user_id: "user-123",
     badge_code: "FIRST_PAYOUT",
     badge_name: "🚀 First Withdrawal",
     unlocked_at: NOW,
     points: 10
   }
3. Trigger email: "Congratulations! You unlocked the First Withdrawal badge"
4. Publish to Discord: "🎉 Trader-123 unlocked First Withdrawal"
5. Update reputation_scores for user_id
6. Rerank leaderboards if needed
```

### Example 4: Referral Attribution & Fraud Check

```
1. Affiliate shares referral link: https://fundedwealth.com?ref=affiliate-abc
2. User clicks → creates referral_tracking:
   {
     affiliate_id: "affiliate-abc",
     click_date: NOW,
     fraud_score: TBD
   }
3. User signs up → update referral_tracking.signup_date
4. User deposits $5K → update referral_tracking.first_deposit_date, first_deposit_amount
5. ReferralService.checkFraud():
   - Same IP address as affiliate? → flag
   - Same email domain? → flag
   - Deposit same as affiliate's recent deposits? → flag
   - fraud_score > 80? → reject referral
6. If approved: Commission = first_deposit_amount * 0.25 (25% for FW)
7. Update affiliate_metrics for this period
8. Rerank affiliate leaderboard
```

---

## 🛠️ Implementation Strategy

### Phase 10 Implementation Order

**Week 1: Database & Core Services**
1. Create all 12 new schemas (Drizzle migrations)
2. Build PublicPayoutService
3. Build CertificateService (with QR generation)
4. Build AchievementService
5. Database indexing optimization

**Week 2: Leaderboards & Reviews**
6. Build LeaderboardService (real-time rankings)
7. Build ReviewService (moderation & rating)
8. Build AffiliateGrowthService
9. Build AnalyticsService

**Week 3: Growth & Automation**
10. Build EmailAutomationService
11. Build ReferralService (fraud detection)
12. Build CommunityService (Discord/Telegram)
13. Build SEOService (blog infrastructure)

**Week 4: API Routes & Frontend**
14. Implement all 15 new API routes
15. Create React components: public profiles, leaderboards, reviews
16. Integrate certificates (QR display)
17. Build blog pages
18. Deploy & monitor

---

## 🔐 Security & Privacy Considerations

### Privacy Protection
- ✅ **Never expose user_id publicly** - use one-way hash for anonymous_id
- ✅ **Payout anonymization** - no email, name, location visible
- ✅ **Review anonymity** - reviewers identified by anonymous_id
- ✅ **Certificate signature** - prevent tampering/forgery with HMAC

### Fraud Prevention
- ✅ **Referral fraud check** - multi-account, IP, email domain detection
- ✅ **Review moderation** - prevent fake reviews
- ✅ **Leaderboard integrity** - verify actual payouts/metrics
- ✅ **Achievement validation** - only award for real completion

### Rate Limiting
- ✅ Public endpoints: 100 req/min (no auth needed)
- ✅ Referral tracking: 1000 req/min (per affiliate)
- ✅ Review submission: 5 reviews/user/day

---

## 📈 Expected Outcomes

### Acquisition Impact
- **30-50% increase in organic traffic** (blog + SEO)
- **20-30% improvement in conversion rate** (social proof)
- **25-40% referral program growth** (automation + tracking)

### Retention Impact
- **15-25% improvement in day-7 retention** (gamification)
- **10-20% increase in payout completion** (transparency)
- **5-15% reduction in churn** (community engagement)

### Trust Metrics
- **80%+ certificate verification rate** (public trust)
- **4.5+ average review rating** (social proof)
- **50%+ trader participation in leaderboards** (engagement)

---

## 🚀 Go-Live Checklist

- [ ] All 12 schemas migrated to production
- [ ] All 12 services tested (unit + integration)
- [ ] All 15 API routes documented & tested
- [ ] Public payouts: First 100 real records verified
- [ ] Certificates: QR codes generate & verify correctly
- [ ] Leaderboards: Data accuracy spot-checked
- [ ] Email automation: Templates tested end-to-end
- [ ] Referral tracking: Fraud detection validated
- [ ] Blog: 5+ SEO-optimized articles live
- [ ] Community integrations: Discord/Telegram connected
- [ ] Analytics: Baseline metrics captured
- [ ] Frontend: All new pages render, responsive design
- [ ] Performance: <500ms API latency for public endpoints
- [ ] Monitoring: Alerts set up for all new metrics
- [ ] Documentation: API docs + user guides complete

---

## 📋 Success Criteria

✅ **Phase 10 Complete When**:

1. **Public Trust**
   - 100+ verified payouts visible publicly
   - 50+ certificates generated & verified
   - Zero certificate forgeries

2. **Social Proof**
   - 100+ trader reviews collected
   - Leaderboards ranked & updated daily
   - 50+ traders with achievement badges

3. **Growth**
   - Affiliate program tracking 95%+ of referrals
   - Email campaigns reaching 80%+ open rate
   - Blog driving 20%+ of organic traffic

4. **Engagement**
   - Discord/Telegram channels synced with payouts/achievements
   - Analytics dashboard showing all 12 key metrics
   - Community participating in reviews (50%+ review completion)

5. **Performance**
   - Public payouts API: <200ms response time
   - Leaderboards API: <100ms response time (cached)
   - All 15 new routes: <500ms p95 latency

---

**Phase 10 Architecture is ready for implementation.**

Next: Start with database migrations and core services.
