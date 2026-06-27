# Security Remediation — Phase 1

## 1. Code Changes Applied

### 1.1 Position Ownership Fix (`orders.ts`)

**File:** `artifacts/api-server/src/routes/orders.ts`  
**Line 65 (after fix):**

```typescript
if (pos.userId !== user.id) return res.status(403).json({ error: "Forbidden" });
```

Prevents authenticated users from closing positions belonging to other users via the `positionId` body parameter on `PATCH /api/orders/:id`.

### 1.2 CORS Fix (`app.ts`)

**File:** `artifacts/api-server/src/app.ts`  
**Status:** Applied in working directory. The `else` branch now rejects unauthorized origins:

```typescript
callback(new Error(`Origin ${origin} not allowed by CORS`));
```

### 1.3 Incidents Endpoint Auth (`index.ts`)

**File:** `artifacts/api-server/src/routes/index.ts`  
**Status:** Applied. `GET /api/incidents` now requires auth + admin role.

### 1.4 Payment Proof Upload Validation (`payments.ts`)

**File:** `artifacts/api-server/src/routes/payments.ts`  
**Status:** Applied. MIME validation (JPEG, PNG, WebP, PDF), 10MB size limit, and error handler all in place.

---

## 2. Webhook Secret Deployment Instructions

The current `RAZORPAY_WEBHOOK_SECRET` is weak (`Rozerpayx@1` — 11 characters, human-readable).  
Replace it with a cryptographically random 32-byte hex string.

### Steps to rotate:

1. **Generate a new secret** on your deployment machine:
   ```bash
   openssl rand -hex 32
   ```
   This produces a 64-character hex string (256 bits of entropy).

2. **Update Razorpay Dashboard:**
   - Go to: Razorpay Dashboard → Settings → Webhooks
   - Select your webhook endpoint (`https://api.fundedwealth.com/api/razorpay/webhook`)
   - Click "Edit" → replace the existing secret with the new value
   - Save

3. **Update your EC2 production environment:**
   ```bash
   # On EC2 at /opt/fundedwealth/.env
   RAZORPAY_WEBHOOK_SECRET=<paste-64-char-hex-here>
   ```

4. **Restart the API server:**
   ```bash
   pm2 reload fundedwealth-api --update-env
   ```

5. **Verify** by checking logs after the next Razorpay webhook delivery:
   ```bash
   pm2 logs fundedwealth-api | grep "Razorpay Webhook"
   ```
   You should see successful processing, not signature rejection.

### Important:
- Do NOT commit the new secret to any file in the repository
- Do NOT put the secret in `aws/.env.ec2.template`
- The secret should ONLY exist in the production `.env` file on the EC2 instance

---

## 3. Secrets Requiring Rotation

The following secrets are exposed in local workspace files and must be rotated before production deployment. **Do not rotate until you have confirmed the current production values match these — if they differ, rotation may not be necessary.**

| Secret | File | Current Value (EXPOSED) | Rotation Required |
|--------|------|------------------------|-------------------|
| Database password | `artifacts/api-server/.env` line 8, `lib/db/.env` line 1 | `[REDACTED]` | YES — reset in Supabase Dashboard → Database → Connection Pooling |
| Razorpay Key Secret | `artifacts/api-server/.env` line 58 | `[REDACTED]` | YES — regenerate in Razorpay Dashboard → Settings → API Keys |
| Razorpay Webhook Secret | `artifacts/api-server/.env` line 61 | `[REDACTED]` | YES — see Section 2 above |
| Supabase Service Role Key | `artifacts/api-server/.env` line 33 | `[REDACTED]` | YES — regenerate in Supabase Dashboard → Settings → API |
| Clerk Secret Key | `artifacts/api-server/.env` line 11 | `[REDACTED]` | LOW PRIORITY — this is a test key (`sk_test_`), only rotate if production uses it |
| Angel One API Key | `artifacts/api-server/.env` line 15 | `[REDACTED]` | YES — regenerate in Angel One SmartAPI portal |
| Angel One Password | `artifacts/api-server/.env` line 17 | `[REDACTED]` | YES — change in Angel One account settings |
| Angel One TOTP Secret | `artifacts/api-server/.env` line 18 | `[REDACTED]` | YES — regenerate TOTP in Angel One portal |
| Dhan API Key | `artifacts/api-server/.env` line 22 | `[REDACTED]` | YES — regenerate in Dhan developer portal |
| Dhan Access Token | `artifacts/api-server/.env` line 24 | `[REDACTED]` | YES — regenerate in Dhan portal |
| Gemini AI API Key | `artifacts/api-server/.env` line 36 | `AIzaSyDRKWZZuUTm8DslYqQb_rDTllFscuc7Yho` | YES — regenerate in Google AI Studio |
| OxaPay Merchant Key | `artifacts/api-server/.env` line 39 | `6NGOJO-GHZHZK-QTI57P-BVZBMK` | YES — regenerate in OxaPay merchant panel |
| Resend API Key | `artifacts/api-server/.env` line 52 | `re_UpPzeuw3_QGJ8nu9DXvpSD7VZkoov72Dr` | YES — regenerate in Resend dashboard |
| Admin Setup Secret | `artifacts/api-server/.env` line 63 | `fw_admin_setup_2026_xK9mPqR7vNcW` | YES — replace with `openssl rand -hex 32` output |

### Rotation priority:
1. **IMMEDIATE:** Database password, Razorpay secrets, Supabase service role key
2. **HIGH:** Broker credentials (Angel One, Dhan) — can execute real trades
3. **MEDIUM:** Gemini, OxaPay, Resend, Admin setup secret
4. **LOW:** Clerk test key (only if shared across environments)

### Post-rotation checklist:
- [ ] Update `/opt/fundedwealth/.env` on EC2 with new values
- [ ] Restart API: `pm2 reload fundedwealth-api --update-env`
- [ ] Verify health: `curl https://api.fundedwealth.com/api/health`
- [ ] Test a Razorpay payment in test mode
- [ ] Verify OxaPay webhook still processes
- [ ] Confirm database connectivity
- [ ] Delete local `.env` files from developer workstations

---

## 4. CORS Fix Deployment Reference

The CORS fix in `artifacts/api-server/src/app.ts` is already in the working directory. Once deployed:

- Production: Only `https://www.fundedwealth.com`, `https://fundedwealth.com`, and `https://d-fundedwealth.cloudfront.net` are allowed
- Development: Additionally allows `http://localhost:5200` and `http://localhost:5201` (only when `NODE_ENV !== "production"`)
- Requests without an `Origin` header (server-to-server, webhooks, curl) are still allowed

To verify after deployment:
```bash
# Should FAIL (return CORS error):
curl -H "Origin: https://evil.com" -I https://api.fundedwealth.com/api/health

# Should PASS:
curl -H "Origin: https://www.fundedwealth.com" -I https://api.fundedwealth.com/api/health
```

---

## 5. Files Modified in This Remediation

| File | Change |
|------|--------|
| `artifacts/api-server/src/routes/orders.ts` | Added `pos.userId !== user.id` ownership check |
| `artifacts/api-server/src/app.ts` | CORS rejection (applied earlier) |
| `artifacts/api-server/src/routes/index.ts` | Incidents auth guard (applied earlier) |
| `artifacts/api-server/src/routes/payments.ts` | Upload MIME/size validation (applied earlier) |
| `SECURITY_REMEDIATION.md` | This document |
