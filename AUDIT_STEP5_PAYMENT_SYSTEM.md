# STEP 5: PAYMENT SYSTEM AUDIT

## PAYMENT METHODS IMPLEMENTED

### 1. **Manual Bank Transfer** ✅ ACTIVE
**Component**: `ManualPaymentForm.tsx`
**Page**: `/payment` route
**Flow**:
- Account Name: AMAN KUMAR SINGH (from env)
- Bank: Slice Small Finance Bank
- Account: 033311501069826
- IFSC: NESF0000333
- UPI: s8257683769651514@slc (from env)

**Features**:
- ✅ UPI QR Code Generation (QRCode library)
- ✅ Dynamic QR with amount & order ID
- ✅ UPI ID copy-to-clipboard
- ✅ Bank account details display
- ✅ Bank transfer form with proof upload
- ✅ 15-minute payment timer
- ✅ File upload validation (image/PDF required)
- ✅ UTR/Reference tracking

**API Endpoint**: `POST /api/payments/submit-manual-payment`
**Backend Handler**: `payments.ts` - `POST /manual-bank-transfer`

**Configuration Vars (ENV)**:
```
REACT_APP_MANUAL_PAYMENT_UPI_ID
REACT_APP_MANUAL_PAYMENT_ACCOUNT_NAME
REACT_APP_MANUAL_PAYMENT_BANK_NAME
REACT_APP_MANUAL_PAYMENT_ACCOUNT_NO
REACT_APP_MANUAL_PAYMENT_IFSC
```

---

### 2. **Crypto Payment (OxaPay)** ✅ ACTIVE
**Component**: `OxapayPaymentForm.tsx`
**Page**: `/payment` route
**Supported Methods**:
- USDT (TRC20)
- USDT (Ethereum)
- Other crypto methods via CURRENCY_MAP

**Flow**:
1. User clicks "Pay with Crypto"
2. Calls `POST /api/payments/create-crypto-payment`
3. OxaPay API generates payment link
4. User redirected to OxaPay
5. Form polls status via `/api/payments/payment-status/{trackId}`
6. Status checks: Waiting → Confirming → Paid

**Features**:
- ✅ Dynamic payment link generation
- ✅ Track ID polling (30 attempts, 4-second intervals)
- ✅ Real-time status updates
- ✅ Fallback to manual payment on failure
- ✅ Error handling and user feedback

**API Endpoints**:
- `POST /api/payments/create-crypto-payment` - Create invoice
- `GET /api/payments/payment-status/{trackId}` - Poll status

**Configuration Vars (ENV)**:
```
OXAPAY_MERCHANT_API_KEY
OXAPAY_API_URL = "https://api.oxapay.com/merchants/request"
OXAPAY_INQUIRY_URL = "https://api.oxapay.com/merchants/inquiry"
```

---

### 3. **Easebuzz Integration** ⚠️ CONFIGURED (Status Unknown)
**Backend Support**: Yes (`payments.ts`)
**Frontend**: Not explicitly used
**Keys**:
```
EASEBUZZ_KEY
EASEBUZZ_SALT
EASEBUZZ_ENV (test/prod)
EASEBUZZ_BASE_URL
```

**Note**: Easebuzz setup exists in backend but frontend doesn't have dedicated form component visible in payment.tsx. May be abstracted elsewhere or legacy.

---

## PAYMENT FLOW DIAGRAM

```
User on /payment
    ↓
[Choose Payment Method]
    ├→ OxaPay (Crypto)
    │   ├→ Click "Pay with Crypto"
    │   ├→ POST /create-crypto-payment
    │   ├→ Receive payLink & trackId
    │   ├→ Redirect to OxaPay
    │   ├→ Poll /payment-status/{trackId}
    │   ├→ On success: "Payment confirmed!"
    │   └→ On failure: Fallback to manual
    │
    └→ Manual Payment
        ├→ Select UPI or Bank
        ├→ UPI Path:
        │   ├→ Display QR Code
        │   ├→ Show UPI ID (copyable)
        │   ├→ Enter UTR reference
        │   └→ Upload proof
        ├→ Bank Path:
        │   ├→ Display account details
        │   ├→ Enter reference number
        │   └→ Upload proof
        └→ POST /submit-manual-payment
            ├→ FormData with proof file
            ├→ Backend validation
            ├→ Status: pending_review
            └→ Redirect: /dashboard?payment=submitted
```

---

## QR CODE & ACCOUNT DISPLAY

### UPI QR Generation ✅
- **Format**: `upi://pay?pa={upiId}&pn=FundedWealth&am={amount}&tn=Payment for Order {orderId}&tr={timestamp}`
- **Library**: qrcode
- **Size**: 300x300px, High error correction
- **Dynamic**: Amount and Order ID encoded

### Account Details Display ✅
- Account name displayed in form
- Bank name shown
- Account number visible (not masked in current implementation)
- IFSC code provided
- Copy-to-clipboard buttons functional

**⚠️ Security Note**: Account number is visible in form. Consider masking for production (show only last 4 digits on display).

---

## PAYMENT FORM VALIDATION

### Manual Payment:
✅ UPI Reference (UTR) - min 6 chars
✅ Bank Reference - required
✅ Amount - 1 to 1,000,000
✅ Proof file - required
✅ Plan type - whitelist validation: flash, instant, 1step, 2step
✅ Timer expiry check - 15 minutes

### OxaPay:
✅ Payment method - from CURRENCY_MAP
✅ Plan type - validated
✅ Size index - validated
✅ Track ID polling with timeout

---

## BROKEN/INCOMPLETE FLOWS

### 1. **Order ID Not Pre-populated** ⚠️
**Issue**: `payment.tsx` line 36:
```tsx
orderId={orderId || 1} // TODO: Get from search params or payment session
```
- Default to 1, should fetch from session/URL params
- Not fetching actual user's order ID

**Impact**: Manual payment form may record against wrong order
**Fix Needed**: Extract orderId from URL params or payment context

### 2. **Account Number Security** ⚠️
- Account number fully visible in form UI
- Should mask: `****9826` instead of `033311501069826`
- UPI ID also fully visible (may be acceptable as it's public)

### 3. **Payment Status Polling** ⚠️
- Hardcoded 30 attempts, 4-second interval = 120 seconds max
- If network slow, payment may not be detected
- No user-facing timeout message before fallback

### 4. **Admin Review Process** ⚠️
- Manual payments go to `status: "pending_review"`
- No webhook or callback shown for admin approval
- Users may not know when payment is confirmed

---

## ACTIVE ROUTES

| Endpoint | Method | Component | Status |
|----------|--------|-----------|--------|
| `/payment` | GET | PaymentPage | ✅ Active |
| `/api/payments/submit-manual-payment` | POST | Backend | ✅ Active |
| `/api/payments/create-crypto-payment` | POST | Backend | ✅ Active |
| `/api/payments/payment-status/{trackId}` | GET | Backend | ✅ Active |
| `/api/payments/manual-bank-transfer` | POST | Backend | ✅ Active |

---

## ENVIRONMENT VARIABLES NEEDED

```bash
# Manual Payments
REACT_APP_MANUAL_PAYMENT_UPI_ID=s8257683769651514@slc
REACT_APP_MANUAL_PAYMENT_ACCOUNT_NAME=AMAN KUMAR SINGH
REACT_APP_MANUAL_PAYMENT_BANK_NAME=Slice Small Finance Bank
REACT_APP_MANUAL_PAYMENT_ACCOUNT_NO=033311501069826
REACT_APP_MANUAL_PAYMENT_IFSC=NESF0000333
PAYMENT_PROOF_UPLOAD_DIR=/tmp/payment-proofs

# OxaPay
OXAPAY_MERCHANT_API_KEY=your-key-here

# Easebuzz
EASEBUZZ_KEY=your-key
EASEBUZZ_SALT=your-salt
EASEBUZZ_ENV=test
```

---

## PAYMENT SYSTEM SUMMARY

| Feature | Status | Notes |
|---------|--------|-------|
| Manual Bank Transfer | ✅ Complete | Working, needs order ID fix |
| UPI QR Code | ✅ Complete | Dynamic, error corrected |
| OxaPay Integration | ✅ Complete | Polling works, timeout handling OK |
| Easebuzz | ⚠️ Configured | No frontend form |
| Payment Validation | ✅ Complete | Amount, reference, file checks |
| Admin Approval Flow | ⚠️ Partial | Status set, no webhook shown |
| Account Security | ⚠️ Needs Fix | Account number fully visible |

---

## NEXT STEP
- STEP 6: Generate cleanup report for dead/unused files
