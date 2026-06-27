# FundedWealth KYC System Documentation

## Overview

A production-grade KYC (Know Your Customer) + Identity Verification + Compliance System built for FundedWealth using Express.js backend, React frontend, Supabase database, and TypeScript.

### Key Features

✅ **Multi-level Verification**
- Level 0: No verification
- Level 1: Basic identity verified
- Level 2: Address verified
- Level 3: Full verification
- Level 4: Enhanced review (high-risk)

✅ **Complete User Flow**
1. Personal details collection
2. Identity document upload (Passport, PAN, Aadhar, Driving License, National ID)
3. Address verification (Bank statement, Utility bill)
4. Selfie/Liveness verification
5. Review & submission
6. Approval/Rejection/Resubmission

✅ **Admin Review System**
- Pending KYC queue with filters
- Document verification
- Approve/Reject/Resubmit actions
- Risk scoring
- Audit trails

✅ **Security & Compliance**
- Encrypted document storage
- Signed URLs for access
- Row-level security (RLS)
- Rate limiting
- Audit logging
- Fraud detection

✅ **Notifications**
- Email notifications (Resend)
- In-app notifications
- KYC status updates
- Document expiry alerts

---

## Architecture

### Database Schema

#### `kyc_profiles`
Core KYC profile table storing user verification information.

```sql
CREATE TABLE kyc_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  address_city TEXT,
  address_state TEXT,
  address_postal_code TEXT,
  
  -- Status & Verification
  status TEXT DEFAULT 'NOT_STARTED',
  verification_level INTEGER DEFAULT 0,
  
  -- Risk Assessment
  risk_score DECIMAL(5,2) DEFAULT 0,
  risk_level TEXT DEFAULT 'LOW',
  risk_flags TEXT DEFAULT '[]',
  
  -- Timeline
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Admin Review
  reviewed_by INTEGER,
  review_notes TEXT,
  rejection_reason TEXT,
  resubmission_count INTEGER DEFAULT 0,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `kyc_documents`
Individual document tracking with version control.

```sql
CREATE TABLE kyc_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kyc_profile_id INTEGER NOT NULL,
  
  -- Document Details
  document_type TEXT NOT NULL,
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  
  -- File Metadata
  mime_type TEXT,
  file_size INTEGER,
  file_resolution TEXT,
  
  -- Verification Status
  verification_status TEXT DEFAULT 'PENDING',
  verification_notes TEXT,
  
  -- Document Validity
  expiry_date TIMESTAMP,
  is_expired BOOLEAN DEFAULT FALSE,
  
  -- Quality Checks
  is_blurred BOOLEAN DEFAULT FALSE,
  is_legible BOOLEAN DEFAULT TRUE,
  quality_score INTEGER,
  
  -- Face Recognition
  face_detected BOOLEAN DEFAULT FALSE,
  face_match BOOLEAN DEFAULT FALSE,
  face_match_score INTEGER,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Timeline
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `kyc_reviews`
Admin review history and actions.

```sql
CREATE TABLE kyc_reviews (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Action Details
  action TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  
  -- Risk Assessment
  risk_score INTEGER,
  risk_level TEXT,
  risk_factors TEXT DEFAULT '[]',
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `audit_logs`
Immutable audit trail for compliance.

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Routes

### User KYC Routes

#### `POST /api/kyc/start`
Initialize KYC profile for user.

**Response:**
```json
{
  "profile": { /* kyc_profile object */ },
  "message": "KYC profile created"
}
```

#### `GET /api/kyc/status`
Get user's KYC status and documents.

**Response:**
```json
{
  "profile": { /* kyc_profile object */ },
  "documents": [ /* kyc_document array */ ],
  "user": { "id": 1, "email": "user@example.com", "kycStatus": "pending" }
}
```

#### `PATCH /api/kyc/profile`
Update personal information.

**Body:**
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "country": "IN",
  "phone": "+91 98765 43210",
  "address": "123 Main St",
  "addressCity": "Mumbai",
  "addressState": "Maharashtra",
  "addressPostalCode": "400001"
}
```

#### `POST /api/kyc/upload`
Upload document to Supabase Storage.

**Body:**
```json
{
  "documentType": "PASSPORT",
  "fileBase64": "data:image/png;base64,...",
  "fileName": "passport.png",
  "mimeType": "image/png"
}
```

**Response:**
```json
{
  "document": { /* kyc_document object */ },
  "fileUrl": "https://...",
  "message": "Document uploaded successfully"
}
```

#### `PATCH /api/kyc/submit`
Submit KYC for review.

**Response:**
```json
{
  "profile": { /* updated profile with status: PENDING */ },
  "message": "KYC submitted for review"
}
```

### Admin Routes

#### `GET /api/admin/kyc/pending`
Get pending KYC submissions with filters.

**Query Params:**
- `status`: PENDING, UNDER_REVIEW, APPROVED, REJECTED
- `riskLevel`: LOW, MEDIUM, HIGH
- `country`: Country code
- `page`: Page number (default 1)
- `limit`: Items per page (default 20)

**Response:**
```json
{
  "data": [
    {
      "profile": { /* kyc_profile */ },
      "user": { /* user info */ },
      "documents": [ /* kyc_document array */ ]
    }
  ],
  "pagination": { "page": 1, "limit": 20 }
}
```

#### `PATCH /api/admin/kyc/:profileId/approve`
Approve KYC profile.

**Body:**
```json
{
  "notes": "All documents verified successfully"
}
```

#### `PATCH /api/admin/kyc/:profileId/reject`
Reject KYC profile.

**Body:**
```json
{
  "reason": "BLURRY_IMAGE",
  "notes": "Please resubmit with clearer images"
}
```

#### `PATCH /api/admin/kyc/:profileId/request-resubmission`
Request resubmission.

**Body:**
```json
{
  "reason": "Document expiry date unclear"
}
```

#### `GET /api/admin/kyc/analytics/dashboard`
Get KYC analytics and statistics.

**Response:**
```json
{
  "total": 100,
  "pending": 25,
  "underReview": 10,
  "approved": 60,
  "rejected": 5,
  "resubmissionRequired": 3,
  "expired": 0,
  "highRisk": 8,
  "approvalRate": "75.50"
}
```

---

## Frontend Components

### `KYCFlow`
Multi-step form for users to complete KYC.

**Location:** `src/components/kyc/KYCFlow.tsx`

**Features:**
- Personal details form
- Document upload
- Selfie verification
- Review & submission
- Status tracking

### `DocumentUpload`
Reusable document upload component.

**Location:** `src/components/kyc/DocumentUpload.tsx`

**Props:**
- `documentType`: Type of document (PASSPORT, PAN, etc.)
- `title`: Display title
- `description`: Instructions
- `acceptedTypes`: List of accepted document types

### `AdminKYCDashboard`
Admin review interface.

**Location:** `src/components/kyc/AdminKYCDashboard.tsx`

**Features:**
- KYC queue with filters
- Risk scoring display
- Document viewer
- Approve/Reject/Resubmit actions
- Analytics dashboard

### `KYCStatus`
Quick status widget for dashboards.

**Location:** `src/components/kyc/KYCStatus.tsx`

**Features:**
- Status badge
- Progress indicator
- Quick action buttons

---

## Security Implementation

### Row-Level Security (RLS)

```sql
-- Users can view their own KYC profile
CREATE POLICY "Users can view own KYC profile" ON kyc_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all KYC profiles
CREATE POLICY "Admins can view all KYC profiles" ON kyc_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update
CREATE POLICY "Admins can update KYC profiles" ON kyc_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Fraud Detection

**Risk Scoring Algorithm:**
- Blurred documents: +15 points
- Expired documents: +20 points
- Low-quality documents: +10 points
- Face matching failure: +25 points
- Multiple accounts: +30 points
- VPN/Proxy detected: +20 points

**Risk Levels:**
- LOW: 0-30
- MEDIUM: 31-70
- HIGH: 71-100

### File Validation

**Accepted Formats:**
- PNG, JPEG, WebP, PDF
- Max file size: 10MB
- Minimum resolution: Recommended 1024x768

**Server-Side Checks:**
- MIME type validation
- File size verification
- Magic number detection
- Content scanning (in Phase 5)

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Database
DATABASE_URL=your_postgresql_url

# Storage
KYC_DOCUMENTS_BUCKET=kyc-documents
```

---

## Deployment

### Phase 1: Database Setup
```bash
# Run migrations
npx drizzle-kit push:pg

# Create storage bucket
npm run create:kyc-bucket
```

### Phase 2: Backend Deployment
```bash
# Build API server
cd artifacts/api-server
npm run build

# Deploy to production
npm run deploy
```

### Phase 3: Frontend Deployment
```bash
# Build React app
cd artifacts/fundedwealth
npm run build

# Deploy to CDN
npm run deploy
```

---

## Testing

### Manual Testing Checklist

#### User Flow
- [ ] User can start KYC
- [ ] Personal details are saved
- [ ] Documents upload successfully
- [ ] File validation works (reject invalid files)
- [ ] Selfie upload and face detection work
- [ ] KYC submission succeeds
- [ ] User receives email notification

#### Admin Flow
- [ ] Admin can see pending KYCs
- [ ] Filters work (status, risk, country)
- [ ] Can view documents
- [ ] Can approve KYC
- [ ] Can reject with reason
- [ ] Can request resubmission
- [ ] Analytics update correctly

#### Security
- [ ] Unauthenticated users cannot access /api/kyc
- [ ] Non-admins cannot access /api/admin/kyc
- [ ] Users can only see their own data
- [ ] Documents are signed-URL protected
- [ ] Audit logs record all admin actions

---

## Monitoring & Maintenance

### Key Metrics to Track
- Average KYC completion time
- Approval rate
- Rejection rate by reason
- High-risk submission percentage
- Document upload success rate
- Email delivery rate

### Scheduled Tasks
- Daily: Check for document expiry
- Weekly: Risk score recalculation
- Monthly: Audit log archival
- Quarterly: Compliance review

---

## Integration with Payout System

### Payout Blocking Logic

```typescript
// In payout API
if (user.kycStatus !== 'approved') {
  return res.status(403).json({
    error: "KYC approval required before withdrawal",
    kycStatus: user.kycStatus,
    message: "Complete your identity verification to request payouts"
  });
}
```

### Payout Unblock Flow
1. User completes KYC
2. Admin approves in review dashboard
3. `users.kycStatus` updated to "approved"
4. User can now request payouts
5. Expiry date set to 1 year from approval
6. Automatic expiry checks on scheduled job

---

## Roadmap

### Phase 1: Foundation ✅
- [x] Database schema
- [x] Backend APIs
- [x] Admin review system
- [x] User KYC flow
- [x] Email notifications

### Phase 2: AI & Verification (Q3 2026)
- [ ] Face matching with ML
- [ ] Document OCR
- [ ] Liveness detection
- [ ] Duplicate detection

### Phase 3: Advanced Features (Q4 2026)
- [ ] Enhanced risk scoring
- [ ] Biometric verification
- [ ] Video KYC
- [ ] Multi-language support

### Phase 4: Compliance (2027)
- [ ] AML/CTF integration
- [ ] Sanctions list checking
- [ ] PEP database integration
- [ ] Reporting automation

---

## Support & Issues

For issues or questions:
1. Check the [API Documentation](#api-routes)
2. Review [Security Implementation](#security-implementation)
3. Contact: support@fundedwealth.com

---

## License

Proprietary - FundedWealth Private Limited

---

**Last Updated:** May 17, 2026
**Version:** 1.0.0
