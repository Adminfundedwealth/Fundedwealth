# Security Remediation Phase 1 — Deployment Instructions

## 1. Webhook Secret Rotation (REQUIRED BEFORE DEPLOY)

The current `RAZORPAY_WEBHOOK_SECRET` is weak (11 characters, human-readable).
Replace it with a cryptographically random 32+ byte hex string.

### Steps:

```bash
# Generate a new secret (run on your local machine or EC2):
openssl rand -hex 32
```

This produces a 64-character hex string (32 bytes of entropy).

### Update in two places:

1. **Razorpay Dashboard:**
   - Go to: https://dashboard.razorpay.com → Settings → Webhooks
   - Edit your webhook endpoint (`https://api.fundedwealth.com/api/razorpay/webhook`)
   - Replace the existing secret with the new generated value
   - Save

2. **EC2 Production Environment:**
   ```bash
   # SSH into EC2
   ssh -i <your-key.pem> <user>@<ec2-host>
   
   # Edit the production .env
   sudo nano /opt/fundedwealth/.env
   
   # Replace the line:
   # RAZORPAY_WEBHOOK_SECRET=<old-weak-value>
   # With:
   RAZORPAY_WEBHOOK_SECRET=<your-new-64-char-hex-string>
   
   # Restart the API server
   pm2 reload fundedwealth-api --update-env
   ```

3. **Verify the webhook is working:**
   - Make a test payment (₹1 if possible)
   - Check PM2 logs: `pm2 logs fundedwealth-api --lines 50`
   - Confirm no "REJECTED — signature mismatch" messages

### Important Notes:
- Do NOT commit the new secret to source code or git
- Do NOT store it in `aws/.env.ec2.template`
- The secret must ONLY exist in the production `.env` file on EC2 and in the Razorpay Dashboard
- After rotation, old webhook deliveries (if any are queued) will fail signature verification — this is expected and safe

---

## 2. Admin Setup Secret Rotation (REQUIRED)

The `ADMIN_SETUP_SECRET` value is exposed in the local workspace `.env` file.

```bash
# Generate replacement:
openssl rand -base64 32
```

Update ONLY in `/opt/fundedwealth/.env` on EC2. This endpoint is a one-time-use bootstrap — if an admin already exists, the endpoint is a no-op regardless of secret value.

---

## 3. Secrets Requiring Rotation

The following secrets are exposed in local workspace files and should be rotated in production:

| Secret | Source File | Service | Rotation Method |
|--------|------------|---------|-----------------|
| `RAZORPAY_KEY_SECRET` | `artifacts/api-server/.env` | Razorpay | Dashboard → Settings → API Keys → Regenerate |
| `RAZORPAY_WEBHOOK_SECRET` | `artifacts/api-server/.env` | Razorpay | Dashboard → Webhooks → Edit → New Secret |
| `DATABASE_URL` (password: `8m56JQWMxKag9zCj`) | `artifacts/api-server/.env`, `lib/db/.env` | Supabase Postgres | Supabase Dashboard → Database → Connection Pooling → Reset Password |
| `SUPABASE_SERVICE_ROLE_KEY` | `artifacts/api-server/.env` | Supabase | Supabase Dashboard → Settings → API → Regenerate service_role key |
| `CLERK_SECRET_KEY` | `artifacts/api-server/.env` | Clerk (legacy) | Clerk Dashboard → API Keys → Rotate (if still in use) |
| `ANGEL_API_KEY` + credentials | `artifacts/api-server/.env` | Angel One | Angel One SmartAPI portal → App Settings → Regenerate |
| `ANGEL_TOTP_SECRET` | `artifacts/api-server/.env` | Angel One | Re-link TOTP in Angel One account |
| `DHAN_ACCESS_TOKEN` | `artifacts/api-server/.env` | Dhan | Dhan developer portal → Generate new token |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | `artifacts/api-server/.env` | Google AI | Google Cloud Console → Credentials → Delete + Create new |
| `OXAPAY_MERCHANT_API_KEY` | `artifacts/api-server/.env` | OxaPay | OxaPay merchant dashboard → API Settings → Regenerate |
| `RESEND_API_KEY` | `artifacts/api-server/.env` | Resend | Resend dashboard → API Keys → Revoke + Create new |
| `ADMIN_SETUP_SECRET` | `artifacts/api-server/.env` | Internal | Generate new: `openssl rand -base64 32` |

### Priority Order:
1. **CRITICAL (rotate immediately):** `RAZORPAY_KEY_SECRET`, `DATABASE_URL` password, `SUPABASE_SERVICE_ROLE_KEY`
2. **HIGH (rotate within 24h):** `RAZORPAY_WEBHOOK_SECRET`, `ANGEL_*` credentials, `DHAN_ACCESS_TOKEN`
3. **MEDIUM (rotate within 1 week):** `OXAPAY_MERCHANT_API_KEY`, `AI_INTEGRATIONS_GEMINI_API_KEY`, `RESEND_API_KEY`
4. **LOW:** `CLERK_SECRET_KEY` (only if Clerk is still active), `ADMIN_SETUP_SECRET` (endpoint is no-op if admin exists)

---

## 4. CORS Fix Deployment Notes

The CORS bypass has been fixed in the working tree:

**File:** `artifacts/api-server/src/app.ts`  
**Change:** The `else` branch in the CORS origin callback now rejects unauthorized origins:
```typescript
callback(new Error(`Origin ${origin} not allowed by CORS`));
```

This change is included in the current uncommitted changes and will take effect on next deployment. After deploying:
- Verify from a different origin (e.g., browser DevTools from any non-allowed domain) that requests are blocked
- Check PM2 logs for any CORS errors from legitimate traffic

---

## 5. Security Fixes Included in This Deployment

| Fix | File | Description |
|-----|------|-------------|
| Order ownership check | `orders.ts:42-45` | Order must belong to authenticated user |
| Position ownership check | `orders.ts:65` | Position must belong to user before closing |
| CORS rejection | `app.ts:53` | Unauthorized origins are rejected |
| Incidents auth gate | `index.ts:68-80` | Admin-only access on `/api/incidents` |
| Payment proof MIME validation | `payments.ts:14-29` | Only JPEG/PNG/WebP/PDF allowed, 10MB max |
| Payment proof error handler | `payments.ts:1128-1141` | Returns 400 for invalid uploads |

---

## 6. Post-Deployment Verification Checklist

- [ ] New `RAZORPAY_WEBHOOK_SECRET` set in EC2 `.env` AND Razorpay Dashboard
- [ ] Database password rotated in Supabase AND updated in EC2 `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` regenerated AND updated in EC2 `.env`
- [ ] PM2 reloaded: `pm2 reload fundedwealth-api --update-env`
- [ ] Test a real payment flow end-to-end
- [ ] Verify webhook signature validation in logs
- [ ] Verify CORS blocks requests from unauthorized origins
- [ ] Verify `/api/incidents` returns 401 without auth
- [ ] Delete local `.env` files from workspace after confirming production works
