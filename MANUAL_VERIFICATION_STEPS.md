# Manual Verification Steps for Complete Flow

## Overview
The automated Playwright test has verified the complete flow up to Razorpay order creation. To verify the remaining steps, follow these manual verification steps.

---

## 1. Verify Order Created in Database

**Connect to Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. Select `orders` table

**Find the test order:**
```sql
SELECT 
  id,
  user_id,
  order_id,
  status,
  amount,
  payment_method,
  created_at
FROM orders
WHERE user_id = '754044f0-4a5c-48ef-8b2b-09181e97dc2b'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results:**
- Should see an order with status `pending` or `created`
- Amount should be `2999` (for Flash account)
- Payment method should be `razorpay`
- Order ID should start with `order_` (Razorpay format)

---

## 2. Complete a Real Test Payment

**Option A: Using Razorpay Test Mode (Recommended)**

If you have Razorpay test keys configured:

1. Update `.env` to use test keys:
   ```
   RAZORPAY_KEY_ID=rzp_test_XXXXXX
   RAZORPAY_KEY_SECRET=your_test_secret
   ```

2. Restart the API server

3. Run the checkout flow again

4. Use Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

**Option B: Using Live Keys with Small Amount**

1. Complete a real payment with the smallest available amount
2. Request refund immediately after testing

---

## 3. Verify Payment Webhook

After completing payment:

1. Check backend logs for webhook received:
   ```bash
   # If running locally
   docker logs fundedwealth-api | grep "razorpay webhook"
   ```

2. Verify in database:
   ```sql
   SELECT 
     id,
     order_id,
     razorpay_payment_id,
     status,
     amount,
     created_at
   FROM payments
   WHERE order_id = 'order_XXXXX'  -- Use the order_id from step 1
   ORDER BY created_at DESC;
   ```

**Expected Results:**
- Payment record created
- Status should be `completed`
- `razorpay_payment_id` should be populated

---

## 4. Verify Account Provisioning

After successful payment:

1. Check `trading_accounts` table:
   ```sql
   SELECT 
     id,
     user_id,
     account_number,
     mt_login,
     mt_password,
     account_type,
     status,
     created_at
   FROM trading_accounts
   WHERE user_id = '754044f0-4a5c-48ef-8b2b-09181e97dc2b'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**Expected Results:**
- Trading account created
- `account_number` should be populated (e.g., `FW-2024-001234`)
- `mt_login` and `mt_password` should be populated
- Status should be `active`

2. Check `challenge_accounts` table:
   ```sql
   SELECT 
     id,
     trading_account_id,
     phase,
     initial_balance,
     current_balance,
     status
   FROM challenge_accounts
   WHERE trading_account_id = (
     SELECT id FROM trading_accounts 
     WHERE user_id = '754044f0-4a5c-48ef-8b2b-09181e97dc2b'
     ORDER BY created_at DESC
     LIMIT 1
   );
   ```

**Expected Results:**
- Challenge account created
- Phase should be `phase1` or `flash` depending on account type
- Initial balance matches the account size (e.g., 5000 for $5K account)

---

## 5. Verify Dashboard Shows Account

1. Log in to dashboard: http://localhost:5201/dashboard
2. Navigate to "My Accounts" section
3. Verify account card shows:
   - Account number
   - Account type (Flash, 1-Phase, 2-Phase)
   - Current balance
   - "Launch Terminal" button

---

## 6. Verify Terminal Launch

1. Click "Launch Terminal" button
2. Verify:
   - New tab opens
   - URL should be the terminal subdomain (e.g., `terminal.fundedwealth.com`)
   - SSO token passed in URL
   - Terminal loads successfully
   - User is automatically logged in

3. Check terminal trader record:
   ```sql
   SELECT 
     id,
     trading_account_id,
     username,
     email,
     status,
     created_at
   FROM terminal_traders
   WHERE trading_account_id = (
     SELECT id FROM trading_accounts 
     WHERE user_id = '754044f0-4a5c-48ef-8b2b-09181e97dc2b'
     ORDER BY created_at DESC
     LIMIT 1
   );
   ```

**Expected Results:**
- Terminal trader record exists
- Username matches MT login
- Status is `active`

---

## 7. Verify Complete User Journey (End-to-End)

**Prerequisites:**
- Razorpay test mode configured OR willingness to complete real payment
- All services running (frontend, API, database)

**Steps:**

1. **Sign Up:**
   - Go to http://localhost:5201/sign-up
   - Create new account: `test-e2e-${Date.now()}@gmail.com`
   - Verify email in Supabase dashboard

2. **Complete Purchase:**
   - Go to http://localhost:5201/checkout
   - Select Flash account ($5K)
   - Fill billing details
   - Accept terms
   - Complete payment (Razorpay)

3. **Verify Purchase Success:**
   - Should redirect to `/purchase-success?orderId=XXX`
   - Page should show:
     - Order ID
     - Account credentials (MT login, password, server)
     - "Go to Dashboard" button

4. **Access Dashboard:**
   - Click "Go to Dashboard"
   - Verify account appears in "My Accounts"
   - Verify "Launch Terminal" button is visible

5. **Launch Terminal:**
   - Click "Launch Terminal"
   - Verify terminal loads in new tab
   - Verify auto-login works
   - Verify trading interface loads

---

## Expected Final State

After completing all steps, the database should contain:

```
users
└── user_id: 754044f0-4a5c-48ef-8b2b-09181e97dc2b
    ├── orders
    │   └── order_id: order_XXX (status: completed)
    ├── payments
    │   └── razorpay_payment_id: pay_XXX (status: completed)
    ├── trading_accounts
    │   ├── account_number: FW-2024-001234
    │   ├── mt_login: 123456
    │   ├── mt_password: SecurePass123
    │   └── status: active
    ├── challenge_accounts
    │   ├── phase: flash
    │   ├── initial_balance: 5000
    │   └── status: active
    └── terminal_traders
        ├── username: 123456
        └── status: active
```

---

## Troubleshooting

### Razorpay Modal Doesn't Open
- Check browser console for errors
- Verify `VITE_RAZORPAY_KEY_ID` is set correctly
- Verify Razorpay SDK loaded (check network tab for `checkout.js`)

### Payment Webhook Not Received
- Check Razorpay Dashboard → Webhooks
- Verify webhook URL is configured
- Check webhook secret matches `RAZORPAY_WEBHOOK_SECRET`
- Check API server logs for webhook errors

### Provisioning Doesn't Start
- Check `provisioning_logs` table for errors
- Verify RabbitMQ/Queue service is running
- Check provisioning service logs

### Terminal Launch Fails
- Verify terminal service is running
- Check SSO JWT secret matches between services
- Verify terminal trader record exists
- Check CORS configuration for terminal domain

---

## Automated Verification Script (Optional)

Create a script to verify database state after payment:

```bash
#!/bin/bash
# verify-payment.sh

USER_ID="754044f0-4a5c-48ef-8b2b-09181e97dc2b"

echo "=== Checking Orders ==="
psql $DATABASE_URL -c "SELECT id, status, amount FROM orders WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 1;"

echo "=== Checking Payments ==="
psql $DATABASE_URL -c "SELECT id, status, razorpay_payment_id FROM payments WHERE order_id = (SELECT order_id FROM orders WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 1);"

echo "=== Checking Trading Accounts ==="
psql $DATABASE_URL -c "SELECT account_number, mt_login, status FROM trading_accounts WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 1;"

echo "=== Checking Challenge Accounts ==="
psql $DATABASE_URL -c "SELECT phase, initial_balance, status FROM challenge_accounts WHERE trading_account_id = (SELECT id FROM trading_accounts WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 1);"
```

Run with:
```bash
chmod +x verify-payment.sh
./verify-payment.sh
```

---

**Last Updated:** July 4, 2026
