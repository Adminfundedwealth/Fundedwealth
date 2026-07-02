# 🧪 Testing Instructions - FUNDedwealth Post-Purchase Flow

## ⚠️ CRITICAL: Read This First

**STATUS: 🔴 NOT TESTED - DO NOT DEPLOY**

This implementation has NOT been tested. All claims of "production ready" were premature.

---

## 🔧 PRE-TEST SETUP (REQUIRED)

### Step 1: Fix Security Issue (DONE)
✅ Fixed security vulnerability in `GET /api/accounts/order/:orderId`
- Added authentication check
- Added 10-minute time window for guest checkout
- Prevents unauthorized credential access

### Step 2: Install Dependencies
```bash
cd c:\Users\jitro\fundedwealth\artifacts\fundedwealth
npm install
```

Expected output: `jspdf@2.5.2` should be installed

### Step 3: TypeScript Type Check
```bash
npm run typecheck
```

Expected: No errors. If errors exist, they must be fixed before testing.

### Step 4: Build Frontend
```bash
npm run build
```

Expected: Build succeeds with no errors.

### Step 5: Start Development Server
```bash
npm run dev
```

Expected: Server starts on http://localhost:5173 (or configured port)

### Step 6: Verify Backend is Running
Check that API server is running on configured port (usually 9000).

---

## 📋 TEST SEQUENCE

**Complete tests in this exact order. If any test fails, STOP and fix before proceeding.**

---

## TEST 1: Purchase Success Page Opens

### Setup:
- Have a test account ready
- Have test payment credentials (Razorpay test mode)

### Steps:
1. Go to `/checkout`
2. Select any plan (e.g., 1-Step ₹50,000)
3. Fill in billing details
4. Choose Razorpay payment
5. Complete test payment
6. **Observe redirect**

### Expected Result:
- Browser navigates to `/purchase-success?orderId=...`
- Page loads without errors
- Credentials are visible

### Evidence to Capture:
```
📸 evidence/1-success-page/
├── browser-url.png (showing /purchase-success?orderId=...)
├── page-content.png (showing credentials)
├── console.png (showing no errors)
├── network-tab.png (showing API call to /api/accounts/order/:orderId)
└── api-response.json (response body)
```

### Pass Criteria:
- ✅ URL contains `orderId` parameter
- ✅ Page displays without blank screen
- ✅ No console errors
- ✅ API returns HTTP 200
- ✅ Credentials visible on page

### If FAIL:
- Check browser console for errors
- Check network tab for failed requests
- Verify orderId is valid UUID format
- Check backend logs

---

## TEST 2: Credentials Display Correctly

### Setup:
- Must have completed TEST 1
- Have access to database

### Steps:
1. On success page, verify visible fields:
   - Account Code (format: `FW-XXXXXXXXXX`)
   - Login Email
   - Temporary Password (not blank or "undefined")
   - Server name
   - Challenge Type
   - Account Size (₹XX,XXX format)

2. Run database query:
```sql
SELECT id, metadata, created_at 
FROM orders 
WHERE id = 'ORDER_ID_FROM_URL';
```

3. Extract metadata JSON and verify it contains:
```json
{
  "loginEmail": "user@example.com",
  "tempPassword": "generated_password_here",
  "accountCode": "FW-ABC123XYZ"
}
```

### Expected Result:
- All fields populated with real data
- No "null", "undefined", or placeholder text
- Account code matches pattern
- Email matches user's email

### Evidence to Capture:
```
📸 evidence/2-credentials/
├── credentials-visible.png (all fields shown)
├── database-query.png (orders table metadata)
├── metadata-json.txt (extracted JSON)
└── comparison.txt (page display vs database values)
```

### Pass Criteria:
- ✅ Account Code: `FW-[A-Z0-9]{10}`
- ✅ Email: valid email format
- ✅ Password: not null/undefined
- ✅ Database metadata matches page display
- ✅ No missing fields

### If FAIL:
- Check provisioning_logs for provisioning status
- Verify provisionChallenge() completed successfully
- Check order.metadata is not NULL

---

## TEST 3: Copy Credentials Works

### Setup:
- Must have completed TEST 2
- Have Notepad or text editor open

### Steps:
1. Click "Copy" button next to **Account Code**
2. Button should show "Copied!"
3. Paste in Notepad (Ctrl+V)
4. Verify exact match with displayed value

5. Repeat for **Email** field
6. Repeat for **Password** field
7. Click "Copy All Credentials"
8. Paste in Notepad
9. Verify all three values are present

### Expected Result:
- Button changes to "Copied!" temporarily
- Clipboard contains exact value
- No extra spaces or characters
- "Copy All" includes all three values separated by newlines

### Evidence to Capture:
```
📸 evidence/3-copy/
├── copy-button-clicked.png (showing "Copied!" state)
├── notepad-account-code.png (pasted value)
├── notepad-email.png
├── notepad-password.png
├── notepad-all-credentials.png (all three values)
└── console.png (navigator.clipboard calls)
```

### Pass Criteria:
- ✅ All copy buttons work
- ✅ Copied values match displayed values
- ✅ No clipboard errors in console
- ✅ "Copy All" includes all fields

### If FAIL:
- Check if HTTPS is enabled (clipboard API requires secure context)
- Check browser permissions for clipboard
- Verify navigator.clipboard.writeText() is supported

---

## TEST 4: PDF Download Works

### Setup:
- Must have completed TEST 2
- Have PDF reader installed (Adobe, browser)

### Steps:
1. Click "Download PDF" button
2. Wait for download (should be immediate)
3. Check Downloads folder for file
4. Open PDF
5. Verify all content is present and readable

### Expected Result:
- File downloads with name: `FundedWealth_Credentials_FW-XXXXX.pdf`
- PDF opens without errors
- Contains all credentials
- Contains instructions section
- Text is readable (not garbled)

### Evidence to Capture:
```
📸 evidence/4-pdf/
├── download-button.png
├── downloads-folder.png (showing PDF file)
├── pdf-page1.png (opened PDF showing credentials)
├── pdf-page2.png (if multi-page)
├── pdf-filename.txt (exact filename)
└── pdf-file-size.txt (file size in KB)
```

### Pass Criteria:
- ✅ PDF downloads successfully
- ✅ Filename contains account code
- ✅ PDF opens without corruption
- ✅ All credentials visible in PDF
- ✅ Instructions section present
- ✅ Generated date/time shown

### If FAIL:
- Verify jsPDF is installed: `ls node_modules/jspdf`
- Check console for jsPDF errors
- Verify import statement works
- Try manual PDF generation test

---

## TEST 5: Dashboard Shows Only Real Accounts

### Setup:
- Login to dashboard
- Navigate to Accounts tab

### Steps:
1. View accounts list
2. Count number of accounts shown
3. Run database query:
```sql
SELECT ta.id, ta.account_code, ca.plan, ta.status
FROM trading_accounts ta
JOIN terminal_traders tt ON tt.id = ta.trader_id
JOIN challenge_accounts ca ON ca.id = ta.challenge_id
WHERE tt.external_id = (
  SELECT id FROM users WHERE clerk_id = 'AUTH_USER_CLERK_ID'
);
```
4. Compare counts

### Expected Result:
- Dashboard shows SAME number as database
- No "pending-XXX" or "failed-XXX" fake IDs
- No demo accounts with placeholder data
- Empty state if no accounts purchased

### Evidence to Capture:
```
📸 evidence/5-dashboard/
├── accounts-tab.png (full view)
├── database-query.png (SQL results)
├── account-count-comparison.txt (dashboard vs database)
├── no-fake-cards.png (no placeholders visible)
└── api-response-my-accounts.json (from /api/accounts/my)
```

### Pass Criteria:
- ✅ Account count matches database
- ✅ All accounts have real trading_account_id (UUID format)
- ✅ No "Provisioning..." fake states
- ✅ No demo/test accounts
- ✅ API returns only real accounts

### If FAIL:
- Check /api/accounts/my response
- Verify trader chain query is correct
- Check for hardcoded fake data in dashboard.tsx

---

## TEST 6: Flash Account Shows "FLASH" Not "Phase 1"

### Setup:
- Purchase a Flash (instant) plan
- Or modify existing account to planType="flash"

### Steps:
1. View Flash account on dashboard
2. Check badge text
3. Check success page (if just purchased)
4. Run database query:
```sql
SELECT ca.plan, ca.type 
FROM challenge_accounts ca
WHERE ca.id = 'CHALLENGE_ID';
```

### Expected Result:
- Badge shows "FLASH" or "Funded"
- Badge does NOT show "Phase 1"
- Color: orange/gold (not amber like Phase 1)

### Evidence to Capture:
```
📸 evidence/6-flash/
├── dashboard-flash-badge.png (showing FLASH label)
├── success-page-flash.png (if applicable)
├── database-plan-type.png (SQL result showing plan="flash")
└── badge-color.txt (CSS class or style)
```

### Pass Criteria:
- ✅ Flash/Instant accounts show "FLASH" label
- ✅ NOT showing "Phase 1"
- ✅ Correct badge color
- ✅ Database plan type matches label

### If FAIL:
- Check phase detection logic in dashboard.tsx
- Verify planType is correctly passed from backend
- Check challenge_accounts.plan value

---

## TEST 7: Launch Terminal Works

### Setup:
- Must have valid account
- Terminal backend must be running
- SSO_API_KEY must be configured

### Steps:
1. On success page OR dashboard, click "Launch Terminal"
2. Open browser DevTools → Network tab
3. Click button
4. Observe network request to `/api/terminal/launch`
5. New tab should open with terminal

### Expected Result:
- HTTP 200 response
- Response contains `{ success: true, launchUrl: "https://..." }`
- New tab opens with terminal URL
- Terminal loads without login prompt (auto-logged in)

### Evidence to Capture:
```
📸 evidence/7-terminal/
├── launch-button-click.png
├── network-request.png (POST /api/terminal/launch)
├── response-200.png (showing HTTP 200)
├── response-body.json (showing launchUrl)
├── terminal-new-tab.png (terminal opened)
├── terminal-dashboard.png (showing logged-in state)
└── no-login-prompt.png (no password screen)
```

### Pass Criteria:
- ✅ HTTP 200 response
- ✅ launchUrl present in response
- ✅ Terminal opens in new tab
- ✅ Auto-login successful (no password prompt)
- ✅ Can see account in terminal

### If FAIL:
- Check TERMINAL_API_URL is set
- Check SSO_API_KEY is set
- Verify terminal backend is running
- Check terminal logs for SSO errors
- Verify ownership chain is correct

---

## TEST 8: No Duplicate Accounts

### Setup:
- Must have completed at least one purchase

### Steps:
1. View dashboard accounts
2. Count occurrences of each account code
3. Run database queries:
```sql
-- Check for duplicate trading accounts
SELECT account_code, COUNT(*) as count
FROM trading_accounts
WHERE trader_id = (
  SELECT id FROM terminal_traders 
  WHERE external_id = 'USER_ID'
)
GROUP BY account_code
HAVING COUNT(*) > 1;

-- Check for duplicate provisioning
SELECT order_id, COUNT(*) as count
FROM provisioning_logs
WHERE status = 'completed'
GROUP BY order_id
HAVING COUNT(*) > 1;
```

### Expected Result:
- Each account appears ONCE on dashboard
- Both queries return ZERO rows (no duplicates)

### Evidence to Capture:
```
📸 evidence/8-duplicates/
├── dashboard-accounts.png (showing each account once)
├── trading-accounts-query.png (showing no duplicates)
├── provisioning-logs-query.png (showing no duplicates)
└── account-count.txt (expected vs actual)
```

### Pass Criteria:
- ✅ Each account code appears once
- ✅ No duplicate trading_accounts entries
- ✅ No duplicate provisioning_logs entries
- ✅ orderId uniqueness preserved

### If FAIL:
- Check provisionChallenge() idempotency
- Verify webhook deduplication works
- Check for race conditions in provisioning

---

## TEST 9: API Authentication Works

### Test 9A: Authorized Access (Own Order)

```bash
# Get auth token
TOKEN="eyJ..." # Your JWT token

# Request own order
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:9000/api/accounts/order/YOUR_ORDER_ID"
```

Expected: HTTP 200, credentials returned

### Test 9B: Unauthorized Access (Another User's Order)

```bash
# Use same token, different orderId
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:9000/api/accounts/order/ANOTHER_USER_ORDER_ID"
```

Expected: HTTP 403, access denied

### Test 9C: Time-Window Access (Recent Order, No Auth)

```bash
# Try accessing order within 10 minutes of creation, no auth
curl -X GET \
  "http://localhost:9000/api/accounts/order/BRAND_NEW_ORDER_ID"
```

Expected: HTTP 200 (allowed for guest checkout)

### Test 9D: Time-Window Expired (Old Order, No Auth)

```bash
# Try accessing order older than 10 minutes, no auth
curl -X GET \
  "http://localhost:9000/api/accounts/order/OLD_ORDER_ID"
```

Expected: HTTP 403 (time window expired)

### Evidence to Capture:
```
📸 evidence/9-auth/
├── test-9a-authorized.txt (curl command + response)
├── test-9b-unauthorized.txt (403 response)
├── test-9c-time-window.txt (200 response for recent order)
├── test-9d-expired.txt (403 for old order)
└── security-validation.txt (summary of all tests)
```

### Pass Criteria:
- ✅ Test 9A: HTTP 200
- ✅ Test 9B: HTTP 403
- ✅ Test 9C: HTTP 200 (if <10 min)
- ✅ Test 9D: HTTP 403 (if >10 min)

---

## TEST 10: Payment Gateways Unchanged

### Steps:
1. Run git diff:
```bash
cd c:\Users\jitro\fundedwealth
git diff HEAD -- artifacts/api-server/src/routes/razorpay.ts > evidence/10-gateways/razorpay-diff.txt
git diff HEAD -- artifacts/api-server/src/routes/payments.ts > evidence/10-gateways/payments-diff.txt
```

2. Review diffs
3. Verify ONLY these changes:
   - No webhook handler changes
   - No signature verification changes
   - No order creation logic changes
   - No provisioning trigger changes

### Expected Result:
- Razorpay: NO changes to backend file
- Payments (OxaPay): Only added `/order-by-track-id` endpoint
- Frontend: Only redirect URL changed

### Evidence to Capture:
```
📸 evidence/10-gateways/
├── razorpay-diff.txt (should be minimal or empty)
├── payments-diff.txt (only new endpoint)
├── use-payment-diff.txt (frontend redirect change)
└── gateway-unchanged.txt (confirmation statement)
```

### Pass Criteria:
- ✅ Razorpay signature verification unchanged
- ✅ OxaPay HMAC verification unchanged
- ✅ Order creation logic unchanged
- ✅ provisionChallenge() calls unchanged
- ✅ Only redirect logic modified

---

## 📊 FINAL VALIDATION

After completing all 10 tests, fill out:

```
TEST RESULTS SUMMARY
====================

Test 1 - Success Page Opens:          [ ] PASS  [ ] FAIL
Test 2 - Credentials Display:         [ ] PASS  [ ] FAIL
Test 3 - Copy Credentials:            [ ] PASS  [ ] FAIL
Test 4 - PDF Download:                [ ] PASS  [ ] FAIL
Test 5 - No Fake Cards:               [ ] PASS  [ ] FAIL
Test 6 - Flash Label:                 [ ] PASS  [ ] FAIL
Test 7 - Launch Terminal:             [ ] PASS  [ ] FAIL
Test 8 - No Duplicates:               [ ] PASS  [ ] FAIL
Test 9 - Authentication:              [ ] PASS  [ ] FAIL
Test 10 - Gateways Unchanged:         [ ] PASS  [ ] FAIL

TOTAL PASSED: __ / 10
TOTAL FAILED: __ / 10

DEPLOYMENT READY: [ ] YES  [ ] NO
```

---

## 🚫 DEPLOYMENT BLOCKERS

Cannot deploy if ANY of these are true:

- [ ] Any test shows FAIL
- [ ] Security issue not fixed
- [ ] TypeScript errors present
- [ ] Build fails
- [ ] Console shows errors during testing
- [ ] Missing evidence for any test

---

## 📧 REPORTING

After testing, create report with:

1. Test results summary (PASS/FAIL for each)
2. All evidence files organized by test number
3. Screenshots with timestamps visible
4. Database query results
5. API response logs
6. Any issues encountered
7. Recommendations for fixes

---

## ⏱️ ESTIMATED TIME

- Setup: 30 minutes
- Test 1-5: 1 hour
- Test 6-10: 1 hour  
- Documentation: 30 minutes
**Total: ~3 hours**

---

**Created:** July 1, 2026  
**Status:** READY FOR TESTING  
**Tester:** _______________  
**Date Tested:** _______________
