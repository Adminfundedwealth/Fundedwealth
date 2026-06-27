# KYC System - Testing & Validation Guide

## 🧪 Complete Testing Guide

This guide will help you thoroughly test the KYC system end-to-end.

---

## Phase 1: Database Testing

### 1.1 Verify Tables Exist

```bash
# Connect to Postgres
psql $DATABASE_URL

# Check tables exist
\dt kyc_*

# Expected output:
#  kyc_documents  | table
#  kyc_profiles   | table
#  kyc_reviews    | table
```

### 1.2 Check Schema

```sql
-- Verify kyc_profiles has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'kyc_profiles'
LIMIT 10;

-- Expected: user_id, status, risk_score, risk_level, etc.
```

### 1.3 Test Insert

```sql
-- Insert test profile (replace user_id with real user)
INSERT INTO kyc_profiles (
  user_id, full_name, date_of_birth, country, phone, 
  address, status, verification_level, is_active
) VALUES (
  123, 'Test User', '1990-01-01', 'US', '+1234567890',
  '123 Main St', 'NOT_STARTED', 0, true
);

-- Verify insert
SELECT * FROM kyc_profiles WHERE user_id = 123;

-- Clean up
DELETE FROM kyc_profiles WHERE user_id = 123;
```

---

## Phase 2: API Testing

### 2.1 Setup Test User

```bash
# Create test user via Clerk dashboard or your auth system
# Get auth token for testing
export CLERK_TOKEN="your_test_token_here"
```

### 2.2 Test User KYC Routes

```bash
# 1. START KYC
curl -X POST http://localhost:8080/api/kyc/start \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json"
# Expected: 200 OK with kyc_profiles record

# 2. GET STATUS
curl -X GET http://localhost:8080/api/kyc/status \
  -H "Authorization: Bearer $CLERK_TOKEN"
# Expected: 200 OK with profile, documents, user info

# 3. UPDATE PROFILE
curl -X PATCH http://localhost:8080/api/kyc/profile \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01",
    "country": "US",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
# Expected: 200 OK with updated profile

# 4. UPLOAD DOCUMENT (requires base64 file)
curl -X POST http://localhost:8080/api/kyc/upload \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "PASSPORT",
    "fileName": "passport.jpg",
    "mimeType": "image/jpeg",
    "fileBase64": "base64_encoded_image_here"
  }'
# Expected: 200 OK with document record and signed URL

# 5. SUBMIT FOR REVIEW
curl -X PATCH http://localhost:8080/api/kyc/submit \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json"
# Expected: 200 OK, status changes to PENDING, email sent
```

### 2.3 Test Admin Routes

```bash
# Set your user role to admin first:
# UPDATE users SET role = 'admin' WHERE clerk_id = 'your_id';

export ADMIN_TOKEN="your_admin_token"

# 1. GET PENDING QUEUE
curl -X GET 'http://localhost:8080/api/admin/kyc/pending?status=PENDING' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 200 OK with array of pending KYCs

# 2. APPROVE KYC
curl -X PATCH http://localhost:8080/api/admin/kyc/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Document verified successfully"
  }'
# Expected: 200 OK, status changes to APPROVED, email sent

# 3. REJECT KYC
curl -X PATCH http://localhost:8080/api/admin/kyc/1/reject \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "BLURRY_IMAGE",
    "notes": "Please resubmit clearer image"
  }'
# Expected: 200 OK, status changes to REJECTED, email sent

# 4. REQUEST RESUBMISSION
curl -X PATCH http://localhost:8080/api/admin/kyc/1/request-resubmission \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "POOR_QUALITY"
  }'
# Expected: 200 OK, status changes to RESUBMISSION_REQUIRED

# 5. GET ANALYTICS
curl -X GET http://localhost:8080/api/admin/kyc/analytics/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 200 OK with stats (total, pending, approved, etc)
```

### 2.4 Test Error Cases

```bash
# Missing auth token
curl -X GET http://localhost:8080/api/kyc/status
# Expected: 401 Unauthorized

# Non-admin accessing admin route
curl -X GET http://localhost:8080/api/admin/kyc/pending \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden

# Invalid document type
curl -X POST http://localhost:8080/api/kyc/upload \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "INVALID_TYPE",
    "fileName": "test.jpg",
    "mimeType": "image/jpeg",
    "fileBase64": "..."
  }'
# Expected: 400 Bad Request

# File too large
# Send base64 > 10MB limit
# Expected: 413 Payload Too Large

# Exceeded rate limit (upload 6 times in < 1 minute)
# Expected: 429 Too Many Requests
```

---

## Phase 3: Frontend Testing

### 3.1 User KYC Flow

**Prerequisites:**
- Start dev server: `npm run dev`
- Be logged in

**Test Steps:**

```
1. Navigate to http://localhost:5173/kyc
   ✓ Page loads
   ✓ See "Start Your KYC" heading
   ✓ See 4 tabs: Personal, Documents, Selfie, Review

2. Click Personal tab
   ✓ Form fields visible: Name, DOB, Country, Phone, Address
   ✓ Form is empty (first time)
   ✓ Required field markers shown

3. Fill form with test data
   ✓ Full Name: "John Doe"
   ✓ DOB: "1990-01-15"
   ✓ Country: Select "United States"
   ✓ Phone: "+1 (555) 123-4567"
   ✓ Address: "123 Main St"
   ✓ City: "New York"
   ✓ State: "NY"
   ✓ Postal: "10001"

4. Click next or Documents tab
   ✓ Personal info saved
   ✓ Navigate to Documents tab
   ✓ See upload zones

5. Upload Identity Document
   ✓ Click "Choose File" or drag & drop
   ✓ Select image file (passport.jpg, etc)
   ✓ ✓ File shows in preview
   ✓ See file size and name
   ✓ Upload success message appears

6. Upload Address Proof
   ✓ Click second upload area
   ✓ Upload utility bill or bank statement
   ✓ Upload success message

7. Click Selfie tab
   ✓ Navigate to selfie section
   ✓ Upload selfie image
   ✓ Preview shows uploaded image

8. Click Review tab
   ✓ All collected data displayed
   ✓ Personal info matches what was entered
   ✓ Uploaded documents shown
   ✓ "Submit for Review" button visible

9. Click Submit
   ✓ Submission successful message
   ✓ Status changes to "Pending Review"
   ✓ Yellow alert badge shows
   ✓ Buttons disabled until admin reviews

10. Check email
    ✓ Receive KYC confirmation email
    ✓ Email has FundedWealth branding
    ✓ Status mentioned in email
```

### 3.2 Admin Dashboard Testing

**Prerequisites:**
- Be logged in as admin (role = 'admin')
- Have at least one pending KYC

**Test Steps:**

```
1. Navigate to http://localhost:5173/admin
   ✓ Page loads
   ✓ See admin tabs/menu

2. Find KYC Tab
   ✓ Click "KYC" tab
   ✓ Admin dashboard loads
   ✓ See analytics cards

3. Analytics Cards
   ✓ "Pending": Shows count > 0
   ✓ "High Risk": Shows count
   ✓ "Approved": Shows count
   ✓ "Approval Rate": Shows percentage

4. KYC Queue Table
   ✓ Table shows pending submissions
   ✓ See columns: Name, Email, Country, Risk, Status, Date
   ✓ Status badges colored (Yellow=PENDING, Red=REJECTED, Green=APPROVED)

5. Search & Filters
   ✓ Search by name: Type "John"
   ✓ ✓ Table filters to matching entries
   ✓ Search by email: Type email
   ✓ ✓ Filters correctly
   ✓ Status filter dropdown works
   ✓ Risk level filter works
   ✓ Country filter works

6. Click Review on Entry
   ✓ Modal opens
   ✓ See 3 tabs: Personal Info, Documents, Take Action

7. Personal Info Tab
   ✓ Shows collected data
   ✓ Full Name, DOB, Country
   ✓ Phone, Address
   ✓ Risk Score displayed (0-100)
   ✓ Risk Level badge

8. Documents Tab
   ✓ Lists uploaded documents
   ✓ See document types
   ✓ Upload date shown
   ✓ Verification status shown
   ✓ Can click to view document
   ✓ Document opens in new tab

9. Take Action Tab
   ✓ See approve, reject, resubmit options
   ✓ Approve: Can enter optional notes
   ✓ Reject: Required reason dropdown
   ✓ Reject: Optional notes field
   ✓ Resubmit: Required reason field

10. Approve Submission
    ✓ Click Approve
    ✓ Optional: Enter notes "Document verified"
    ✓ Click Confirm
    ✓ Success message appears
    ✓ Modal closes
    ✓ Entry status changes to APPROVED
    ✓ User receives approval email

11. Reject Submission (test with another entry)
    ✓ Click Reject
    ✓ Select reason: "BLURRY_IMAGE"
    ✓ Enter notes: "Please resubmit clearer photo"
    ✓ Click Confirm
    ✓ Entry status changes to REJECTED
    ✓ User receives rejection email with reason

12. Request Resubmission
    ✓ Click Resubmit
    ✓ Enter reason: "POOR_QUALITY"
    ✓ Click Confirm
    ✓ Entry status changes to RESUBMISSION_REQUIRED
    ✓ User receives email asking for resubmission
    ✓ User can reopen KYC form to resubmit

13. Analytics Update
    ✓ Approval count increased
    ✓ Pending count decreased
    ✓ Approval rate updated
```

### 3.3 UI/UX Testing

```
✓ Dark purple theme consistent throughout
✓ Buttons are clickable and respond
✓ Form validation prevents invalid submissions
✓ Error messages are clear
✓ Success messages appear when actions complete
✓ Loading spinners show during async operations
✓ Page is responsive on mobile/tablet
✓ No console errors in DevTools
✓ Accessible: Can tab through form
✓ Accessible: Labels associated with inputs
```

---

## Phase 4: Security Testing

### 4.1 Authentication

```
✓ Unauthenticated user redirected to /sign-in
✓ Cannot access /kyc without login
✓ Cannot call APIs without token
✓ Expired token returns 401
✓ Invalid token returns 401
```

### 4.2 Authorization

```
✓ Regular user cannot access /admin
✓ Regular user cannot call admin APIs
✓ Non-admin gets 403 on /api/admin/* routes
✓ Admin role checks working
✓ Users can only see their own KYC
✓ User1 cannot see User2's KYC status
```

### 4.3 File Security

```
✓ File size >10MB rejected
✓ Invalid file type rejected (try .txt)
✓ Non-image files rejected
✓ Mime type validation works
✓ Signed URLs have expiry
✓ Deleted document no longer accessible
✓ Files encrypted in storage
```

### 4.4 Rate Limiting

```
bash
# Run in loop to hit rate limit
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/kyc/upload \
    -H "Authorization: Bearer $TOKEN" \
    -d '...'
  echo "Request $i"
done

# Expected: Requests 1-5 succeed, request 6 gets 429 Too Many Requests
```

---

## Phase 5: Integration Testing

### 5.1 Email Notifications

```
✓ Submission confirmation email received
✓ Email has FundedWealth branding
✓ Approval email received with details
✓ Rejection email received with reason
✓ Resubmission request email received
✓ All emails are from: no-reply@fundedwealth.com
✓ Unsubscribe option in email (if configured)
```

### 5.2 Payout Integration

```
✓ User with PENDING KYC cannot request payout
✓ Error message: "KYC approval required"
✓ User with APPROVED KYC can request payout
✓ User with REJECTED KYC cannot request payout
✓ User with RESUBMISSION_REQUIRED cannot request payout
```

### 5.3 Audit Logging

```sql
-- Check audit logs were created
SELECT * FROM audit_logs 
WHERE entity = 'kyc_profile' 
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Action, admin_id, user_id, ip_address, user_agent for each action
```

---

## Phase 6: Load Testing (Optional)

### 6.1 Concurrent Submissions

```bash
# Simulate 10 concurrent KYC submissions
for i in {1..10}; do
  curl -X PATCH http://localhost:8080/api/kyc/submit \
    -H "Authorization: Bearer $TOKEN$i" \
    -H "Content-Type: application/json" &
done
wait

# Expected: All succeed within reasonable time
```

### 6.2 Stress Test

```bash
# Test with large file
dd if=/dev/zero bs=1M count=15 | base64 > large_file.txt

# Try upload (should fail at 10MB limit)
# Expected: 413 Payload Too Large
```

---

## Phase 7: Edge Cases

```
✓ Resubmit after rejection works
✓ Can upload multiple documents of same type (versions)
✓ Previous documents marked as not latest version
✓ Timezone handling (DOB in different timezones)
✓ Special characters in name/address
✓ International phone numbers
✓ Long address strings
✓ Null/undefined fields handled gracefully
✓ Concurrent requests don't conflict
```

---

## Phase 8: Cleanup & Verification

### 8.1 Database Cleanup

```sql
-- Delete test user KYC data
DELETE FROM kyc_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%test%'
);

-- Verify clean
SELECT COUNT(*) FROM kyc_profiles;
```

### 8.2 Storage Cleanup

```bash
# Remove test documents from Supabase bucket
# Via dashboard: Storage > kyc-documents > Delete test files
```

### 8.3 Email Cleanup

```bash
# Verify no test emails in production mailbox
# Check Resend dashboard for test emails
```

---

## ✅ Testing Checklist

### Backend APIs
- [ ] All 10 endpoints respond correctly
- [ ] Authentication required on all routes
- [ ] Authorization working for admin routes
- [ ] Rate limiting active on upload
- [ ] Error handling with proper status codes
- [ ] Logging all requests
- [ ] Database updates persist

### Frontend UI
- [ ] User KYC form all 4 steps work
- [ ] Document upload works (drag & drop, click)
- [ ] File validation (size, type)
- [ ] Admin dashboard loads
- [ ] Filters work correctly
- [ ] Review modal displays correctly
- [ ] Admin actions execute
- [ ] Responsive design works

### Security
- [ ] Authentication enforced
- [ ] Authorization enforced
- [ ] File security validated
- [ ] Rate limiting working
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] SQL injection prevented
- [ ] XSS prevention working

### Integration
- [ ] Emails sent on status changes
- [ ] Payout system checks KYC
- [ ] Audit logs created
- [ ] RLS policies enforce data isolation
- [ ] Signed URLs work
- [ ] Status updates propagate

### Performance
- [ ] Page loads < 2 seconds
- [ ] API responses < 500ms
- [ ] Large file upload handles timeout
- [ ] Database queries optimized
- [ ] No memory leaks

---

## 🐛 Debugging

### View Logs

```bash
# Backend logs
tail -f /var/log/fundedwealth/api.log | grep kyc

# Frontend console
Chrome DevTools > Console tab
```

### Database Debugging

```sql
-- Check recent KYC activity
SELECT * FROM kyc_profiles 
ORDER BY updated_at DESC 
LIMIT 5;

-- Check document versions
SELECT document_type, version, is_latest_version 
FROM kyc_documents 
ORDER BY created_at DESC;

-- Check admin actions
SELECT admin_id, action, reason 
FROM kyc_reviews 
ORDER BY created_at DESC;
```

### API Debugging

```bash
# Test with verbose curl
curl -v http://localhost:8080/api/kyc/status

# Check response headers
curl -i http://localhost:8080/api/kyc/status

# Pretty print JSON
curl -s http://localhost:8080/api/kyc/status | jq .
```

---

## 📊 Test Results Template

```markdown
## KYC System Test Results

**Date**: May 17, 2026
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

### Overall Status: ✅ PASS / ❌ FAIL

### Test Summary
- Backend APIs: 10/10 Pass
- Frontend UI: 5/5 Pass  
- Security: 8/8 Pass
- Integration: 4/4 Pass
- Load: 2/2 Pass
- Edge Cases: 7/7 Pass

### Issues Found
1. [Issue description and how to reproduce]
2. [Issue description]

### Notes
[Any additional observations]

### Sign Off
Approved for deployment: ✅ Yes / ❌ No
```

---

**Last Updated**: May 17, 2026
**Version**: 1.0.0
