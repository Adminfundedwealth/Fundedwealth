# KYC System - Quick Reference Guide

## 🚀 30-Second Overview

A production-grade KYC verification system with:
- ✅ User multi-step form (`/kyc`)
- ✅ Admin review dashboard (`/admin`)
- ✅ 10 REST APIs
- ✅ 3 database tables
- ✅ Risk scoring & fraud detection
- ✅ Email notifications
- ✅ Complete audit trail

**Status**: BLOCKS PAYOUTS until KYC = APPROVED

---

## 🔗 Key Routes

### User Routes
```
POST   /api/kyc/start              - Start KYC
GET    /api/kyc/status             - Get status
PATCH  /api/kyc/profile            - Update info
POST   /api/kyc/upload             - Upload doc
PATCH  /api/kyc/submit             - Submit review
```

### Admin Routes
```
GET    /api/admin/kyc/pending                    - Queue
PATCH  /api/admin/kyc/:id/approve                - Approve
PATCH  /api/admin/kyc/:id/reject                 - Reject
PATCH  /api/admin/kyc/:id/request-resubmission   - Resubmit
GET    /api/admin/kyc/analytics/dashboard        - Analytics
```

---

## 📁 Key Files

### Database
```
lib/db/src/schema/
├── kyc-profiles.ts      # User profiles
├── kyc-documents.ts     # Documents
└── kyc-reviews.ts       # Admin actions
```

### Backend
```
artifacts/api-server/src/
├── routes/kyc-new.ts    # User APIs
├── routes/admin-kyc.ts  # Admin APIs
└── lib/fraud-detection.ts  # Risk scoring
```

### Frontend
```
artifacts/fundedwealth/src/
├── components/kyc/KYCFlow.tsx        # Main form
├── components/kyc/DocumentUpload.tsx # Upload
├── components/kyc/AdminKYCDashboard.tsx # Admin
└── pages/kyc.tsx                     # Page
```

### Types
```
lib/api-zod/src/kyc-types.ts  # All types
```

---

## 🔐 KYC Status Flow

```
NOT_STARTED
    ↓ (user opens /kyc)
PENDING
    ↓ (user submits)
UNDER_REVIEW
    ↓ (admin reviews)
    ├→ APPROVED (user can payout)
    ├→ REJECTED (shows reason)
    └→ RESUBMISSION_REQUIRED (user retries)
```

---

## 📊 Risk Scoring

```
Blurred docs          +15
Expired docs          +20
Low quality           +10
Face match fail       +25
Multiple accounts     +30
VPN detected          +20
Country mismatch      +15
---
Total: 0-100

LOW:    0-30
MEDIUM: 31-70
HIGH:   71-100
```

---

## 📝 Document Types

**Identity**
- PASSPORT
- PAN
- AADHAR
- DRIVING_LICENSE
- NATIONAL_ID

**Address**
- BANK_STATEMENT
- UTILITY_BILL

**Verification**
- SELFIE

---

## 🛡️ Security Checklist

- ✅ Clerk authentication required
- ✅ Admin role verification
- ✅ File size limit: 10MB
- ✅ File type validation: PNG/JPG/PDF
- ✅ Rate limit: 5 uploads/min
- ✅ Signed URLs with expiry
- ✅ Audit logging all actions
- ✅ User data isolation

---

## 📧 Email Events

```
KYC Submitted       → sendKycStatusEmail()
KYC Approved        → sendKycApprovedEmail()
KYC Rejected        → sendKycRejectedEmail()
Document Expiring   → (framework ready)
```

---

## 🧪 Quick Test

### User Flow
```bash
1. Visit http://localhost:5173/kyc
2. Fill personal details
3. Upload documents
4. Submit
5. Check email
```

### Admin Flow
```bash
1. Login as admin
2. Visit /admin → KYC tab
3. Click Review on submission
4. View documents
5. Click Approve/Reject
```

---

## 🔄 Common Tasks

### Check User KYC Status
```typescript
const response = await fetch('/api/kyc/status');
const { profile, documents } = await response.json();
console.log(profile.status); // APPROVED, PENDING, etc
```

### Approve KYC (Admin)
```typescript
await fetch('/api/admin/kyc/123/approve', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notes: 'All documents verified' })
});
```

### Upload Document
```typescript
const data = new FormData();
data.append('documentType', 'PASSPORT');
data.append('file', fileInput.files[0]);

await fetch('/api/kyc/upload', {
  method: 'POST',
  body: data
});
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Upload fails | Check file size (<10MB), type (PNG/JPG/PDF) |
| Can't see queue | Check admin role: `SELECT role FROM users WHERE id=...` |
| Email not sent | Check RESEND_API_KEY env var |
| Documents not saving | Check Supabase bucket exists: `kyc-documents` |
| Can't submit | Ensure all required docs uploaded |

---

## 📊 Database Queries

### Get pending KYCs
```sql
SELECT * FROM kyc_profiles 
WHERE status = 'PENDING' 
ORDER BY submitted_at DESC;
```

### Get high-risk users
```sql
SELECT * FROM kyc_profiles 
WHERE risk_level = 'HIGH' 
ORDER BY risk_score DESC;
```

### Get admin actions
```sql
SELECT * FROM kyc_reviews 
WHERE action = 'APPROVED' 
ORDER BY created_at DESC;
```

### Get audit trail
```sql
SELECT * FROM audit_logs 
WHERE entity = 'kyc_profile' 
ORDER BY created_at DESC;
```

---

## 🎯 Integration: Block Payouts

In your payout API:

```typescript
// Check KYC status before allowing payout
const user = await db.select().from(users).where(eq(users.id, userId));

if (user.kycStatus !== 'approved') {
  return res.status(403).json({
    error: 'KYC approval required before withdrawal',
    message: 'Complete your identity verification to request payouts'
  });
}

// Allow payout
```

---

## 📈 Monitor These Metrics

- Pending KYCs (goal: <24hr review time)
- Approval rate (goal: >85%)
- High-risk count (goal: <5%)
- Resubmission rate (goal: <10%)
- Email delivery rate (goal: 99%)
- Upload success rate (goal: 99%)

---

## 🔧 Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Email
RESEND_API_KEY=re_...

# Server
PORT=8080
NODE_ENV=production
```

---

## 📚 Full Documentation

See:
- `KYC_SYSTEM_DOCUMENTATION.md` - Complete reference
- `KYC_DEPLOYMENT_GUIDE.md` - Setup & deploy
- `KYC_IMPLEMENTATION_SUMMARY.md` - What's included

---

## 👥 User Flows

### User Path to Approval
```
Sign up
  ↓
Access /kyc
  ↓
Fill personal details
  ↓
Upload identity doc
  ↓
Upload address proof
  ↓
Upload selfie
  ↓
Submit for review
  ↓
Wait for email
  ↓
[Admin approves]
  ↓
Receive approval email
  ↓
Can now request payouts
```

### Admin Review Path
```
See /admin → KYC tab
  ↓
Click pending submission
  ↓
View all documents
  ↓
Review personal info
  ↓
Check risk score
  ↓
Decide: Approve / Reject / Resubmit
  ↓
Write notes/reason
  ↓
Click action button
  ↓
User gets email
  ↓
Analytics update
```

---

## 🎨 UI Components Available

| Component | Path | Purpose |
|-----------|------|---------|
| KYCFlow | `components/kyc/KYCFlow.tsx` | Main user form |
| DocumentUpload | `components/kyc/DocumentUpload.tsx` | File upload |
| AdminKYCDashboard | `components/kyc/AdminKYCDashboard.tsx` | Admin panel |
| KYCStatus | `components/kyc/KYCStatus.tsx` | Quick status widget |

---

## 🚀 Deploy Checklist

- [ ] Run DB migrations: `npx drizzle-kit push:pg`
- [ ] Create Supabase bucket: `kyc-documents`
- [ ] Set all env variables
- [ ] Build backend: `npm run build`
- [ ] Build frontend: `npm run build`
- [ ] Test user flow
- [ ] Test admin flow
- [ ] Set up monitoring
- [ ] Enable email service
- [ ] Create admin user

---

## 🆘 Quick Help

**Forgot where KYC page is?**
→ `/kyc`

**How to test as admin?**
→ Set your user role to 'admin' in DB

**Where's the admin dashboard?**
→ `/admin` → Find "KYC" tab

**How to check user status?**
→ GET `/api/kyc/status`

**Need to approve someone?**
→ PATCH `/api/admin/kyc/{id}/approve`

**Want to reject?**
→ PATCH `/api/admin/kyc/{id}/reject`

**Check what's pending?**
→ GET `/api/admin/kyc/pending`

**See analytics?**
→ GET `/api/admin/kyc/analytics/dashboard`

---

**Last Updated**: May 17, 2026
**Version**: 1.0.0
**Status**: ✅ Ready for Production
