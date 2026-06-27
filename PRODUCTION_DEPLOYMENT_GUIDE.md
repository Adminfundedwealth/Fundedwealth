# FundedWealth — Production Deployment Guide

**Version:** 1.0  
**Last Updated:** May 31, 2026  
**Audience:** Non-developer can execute these steps

---

## Overview

This guide deploys 3 components:
1. **Database** — PostgreSQL on Neon (free tier)
2. **Backend API** — Express server on Railway (free tier)
3. **Frontend** — Static files on Hostinger

**Total time:** 30-45 minutes  
**Cost:** Free (Neon + Railway free tiers) + Hostinger (existing plan)

---

## STEP 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Account
1. Go to **https://neon.tech**
2. Click "Sign Up" (use GitHub or Google)
3. Verify email

### 1.2 Create Project
1. Click "New Project"
2. **Project name:** `fundedwealth`
3. **Region:** `Asia Pacific (Singapore)` (closest to India)
4. **PostgreSQL version:** 16
5. Click "Create Project"

### 1.3 Copy Connection String
1. After creation, you'll see a connection string like:
```
postgresql://neondb_owner:AbCdEf123@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
2. **COPY THIS ENTIRE STRING** — you'll need it in Steps 2 and 3
3. Save it somewhere safe (it contains your password)

### 1.4 Run Migrations

Open a terminal on your computer and run:

```bash
cd "c:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth\lib\db"

set DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

npx drizzle-kit push
```

**Expected output:**
```
[✓] Changes applied
```

If it asks "Do you want to apply?", type `yes` and press Enter.

### 1.5 Verify Tables Created
1. Go back to Neon dashboard
2. Click "Tables" in the left sidebar
3. You should see 80+ tables (users, trading_accounts, challenge_accounts, positions, etc.)

**If you see tables → Database is ready ✅**

---

## STEP 2: Backend API Deployment (Railway)

### 2.1 Create Account
1. Go to **https://railway.app**
2. Click "Login" → Sign in with GitHub
3. Verify account

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo" OR "Empty Project"

### Option A: Deploy from GitHub (Recommended)
1. Connect your GitHub account
2. Select the `fundedwealth` repository
3. Railway will auto-detect the project

### Option B: Deploy via CLI
1. Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

2. Create project:
```bash
cd "c:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth\artifacts\api-server"
railway init
railway up
```

### 2.3 Configure Environment Variables

In Railway dashboard → Your project → Variables tab, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (paste the Neon connection string from Step 1.3) |
| `CLERK_SECRET_KEY` | (from Step 3 below) |
| `PORT` | `9000` |
| `NODE_ENV` | `production` |

### 2.4 Configure Build Settings

In Railway → Settings:
- **Root Directory:** `artifacts/api-server`
- **Build Command:** `pnpm run build`
- **Start Command:** `pnpm run start`

OR if deploying standalone:
- **Build Command:** `node build.mjs`
- **Start Command:** `node --enable-source-maps ./dist/index.mjs`

### 2.5 Deploy
1. Click "Deploy" (or push to GitHub if connected)
2. Wait for build to complete (1-2 minutes)
3. Railway will assign a public URL like:
```
https://fundedwealth-api-production.up.railway.app
```
4. **COPY THIS URL** — you'll need it in Step 5

### 2.6 Verify API is Running
Open in browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/health
```

**Expected response:**
```json
{ "status": "ok" }
```

**If you see this → Backend is running ✅**

---

## STEP 3: Clerk Production Setup

### 3.1 Access Clerk Dashboard
1. Go to **https://dashboard.clerk.com**
2. Log in to your account

### 3.2 Switch to Production
1. In the top-left, click your application name
2. Click "Production" (not Development)
3. If no production instance exists, click "Create Production Instance"

### 3.3 Get Keys
1. Go to **API Keys** in the left sidebar
2. Copy:
   - **Publishable Key:** starts with `pk_live_...`
   - **Secret Key:** starts with `sk_live_...`

### 3.4 Set Secret Key on Railway
1. Go to Railway dashboard → Variables
2. Set `CLERK_SECRET_KEY` = `sk_live_YOUR_KEY_HERE`
3. Redeploy (Railway auto-redeploys on variable change)

### 3.5 Configure Clerk Domain (Optional but Recommended)
1. In Clerk dashboard → Domains
2. Add your domain: `fundedwealth.in` (or whatever you're using)
3. Follow Clerk's DNS verification steps

---

## STEP 4: Payment Gateway Setup (Optional)

### UPI/QR Payments
Already configured — uses your UPI ID `s8257683769651514@slc` (AMAN KUMAR SINGH). No additional setup needed.

### Razorpay (Card/UPI/Netbanking)
1. Go to **https://dashboard.razorpay.com** → Settings → API Keys
2. Generate your Live Key ID and Key Secret
3. Add to your server environment variables:
   - `RAZORPAY_KEY_ID` = your live key ID (starts with `rzp_live_`)
   - `RAZORPAY_KEY_SECRET` = your live key secret
4. **Configure a webhook:**
   - Go to Razorpay Dashboard → Settings → Webhooks → Add New Webhook
   - **URL:** `https://YOUR-API-URL/api/razorpay/webhook`
   - **Events to enable:** `payment.captured`, `payment.failed`, `refund.created`, `order.paid`
   - After saving, Razorpay will show you a **Webhook Secret** — copy it
5. Add the webhook secret to your server environment:
   - `RAZORPAY_WEBHOOK_SECRET` = the secret from step 4
   - ⚠️ **Without this the webhook endpoint returns 503 and rejects all Razorpay events**

### OxaPay (Crypto)
1. Go to **https://oxapay.com** dashboard
2. Get your API key
3. Add to Railway variables:
   - `OXAPAY_API_KEY` = your key
   - `OXAPAY_MERCHANT_ID` = your merchant ID

---

## STEP 5: Frontend Production Build

### 5.1 Update Environment Files

Open file: `artifacts/fundedwealth/.env.production`

Replace with your actual values:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_FROM_CLERK_DASHBOARD
VITE_API_URL=https://fundedwealth-api.onrender.com
```

Open file: `artifacts/fundedwealth/.env`

Replace the API URL:
```env
VITE_API_BASE_URL=https://fundedwealth-api.onrender.com
VITE_API_TIMEOUT=30000
```

### 5.2 Build

```bash
cd "c:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth\artifacts\fundedwealth"

# Remove .env.local (it overrides production values)
ren .env.local .env.local.bak

# Build
pnpm run build

# Restore .env.local for future development
ren .env.local.bak .env.local
```

### 5.3 Add .htaccess

Create file `dist/public/.htaccess` with this content:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 5.4 Create ZIP
```bash
# PowerShell:
Compress-Archive -Path "dist\public\*" -DestinationPath "C:\Users\rmsam\Desktop\fundedwealth-hostinger.zip" -Force
```

### 5.5 Verify No Localhost
```bash
# Should return nothing:
Select-String -Path "dist\public\assets\*.js" -Pattern "localhost" -SimpleMatch
```

---

## STEP 6: Hostinger Deployment

### 6.1 Upload
1. Log in to **Hostinger hPanel**
2. Go to **Files → File Manager**
3. Navigate to `public_html/`
4. **Delete all existing files** (backup first if needed)
5. Click "Upload" → select `fundedwealth-hostinger.zip`
6. After upload, right-click the ZIP → "Extract"
7. Verify files are directly in `public_html/` (not in a subfolder)

### 6.2 Verify Structure
```
public_html/
├── .htaccess
├── index.html
├── assets/
├── maps/
├── icons/
├── upi-logos/
├── logo.png
├── favicon.png
└── ... (other files)
```

---

## STEP 7: DNS Setup

### If using Hostinger domain:
1. Go to hPanel → Domains
2. Your domain should already point to Hostinger nameservers

### If using external domain (e.g., GoDaddy):
1. Point nameservers to Hostinger:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
2. OR add A record pointing to your Hostinger IP

### SSL Certificate:
1. Go to hPanel → SSL
2. Click "Setup" for your domain
3. Hostinger provides free Let's Encrypt SSL

---

## STEP 8: Verification (Smoke Tests)

### Frontend Tests
Open your domain in a browser and verify:

| Test | URL | Expected |
|------|-----|----------|
| Homepage loads | `https://yourdomain.com` | Hero section visible |
| Championship page | `https://yourdomain.com/championship` | Trophy man + prizes |
| Checkout page | `https://yourdomain.com/checkout` | Plan selector visible |
| Community page | `https://yourdomain.com/community` | Social media cards |
| Sign-in page | `https://yourdomain.com/sign-in` | Clerk login form |
| Trade terminal | `https://yourdomain.com/trade` | Chart + order panel |
| 404 handling | `https://yourdomain.com/random-page` | Shows homepage (SPA) |

### Backend Tests
Open in browser:

| Test | URL | Expected |
|------|-----|----------|
| Health check | `https://YOUR-API-URL/api/health` | `{"status":"ok"}` |
| Challenge types | `https://YOUR-API-URL/api/challenge/types` | JSON array (or 401) |

### Auth Test
1. Go to `https://yourdomain.com/sign-up`
2. Create a test account
3. Verify redirect to `/dashboard`
4. Verify dashboard loads with account data

### Trade Test
1. Go to `https://yourdomain.com/trade`
2. Verify chart loads
3. Verify prices update (simulated or live)
4. Place a test BUY order
5. Verify position appears

---

## ROLLBACK PROCEDURE

### If frontend breaks:
1. Go to Hostinger File Manager
2. Delete contents of `public_html/`
3. Upload previous working ZIP
4. Extract

### If backend breaks:
1. Go to Railway dashboard
2. Click "Deployments"
3. Find the previous working deployment
4. Click "Rollback"

### If database breaks:
1. Neon has automatic point-in-time recovery
2. Go to Neon dashboard → Branches
3. Create a new branch from a previous point in time
4. Update `DATABASE_URL` to point to the new branch

---

## ENVIRONMENT VARIABLES SUMMARY

### Railway (Backend)
```env
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=sk_live_xxx
PORT=9000
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx   # REQUIRED — copy from Razorpay Dashboard → Settings → Webhooks
OXAPAY_MERCHANT_API_KEY=xxx   (optional)
OXAPAY_API_KEY=xxx            (optional)
OXAPAY_MERCHANT_ID=xxx        (optional)
```

### Frontend Build (.env.production)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
VITE_API_URL=https://your-railway-url.up.railway.app
```

### Frontend Build (.env)
```env
VITE_API_BASE_URL=https://your-railway-url.up.railway.app
VITE_API_TIMEOUT=30000
```

---

## TROUBLESHOOTING

### "Blank white page on Hostinger"
- Check `.htaccess` exists in `public_html/`
- Check `index.html` exists in `public_html/`
- Check browser console for errors (F12)

### "API calls failing (network errors)"
- Verify Railway deployment is running (green status)
- Verify `VITE_API_URL` in build matches Railway URL
- Check Railway logs for errors

### "Login not working"
- Verify Clerk publishable key is LIVE (not test)
- Verify domain is added in Clerk dashboard
- Check browser console for Clerk errors

### "Database connection failed"
- Verify `DATABASE_URL` is correct in Railway variables
- Check Neon dashboard — is the project active?
- Try connecting with `psql` command to verify

### "Trades not saving"
- Verify backend is running (`/api/health` returns ok)
- Verify database has tables (check Neon dashboard)
- Check Railway logs for SQL errors

---

## POST-DEPLOYMENT CHECKLIST

- [ ] Database provisioned on Neon
- [ ] Migrations executed successfully
- [ ] API server deployed on Railway
- [ ] Health check returns OK
- [ ] Clerk live keys configured
- [ ] Razorpay live keys configured (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- [ ] Razorpay webhook configured in dashboard and `RAZORPAY_WEBHOOK_SECRET` set
- [ ] Frontend built with production URLs
- [ ] Frontend uploaded to Hostinger
- [ ] .htaccess in place
- [ ] SSL certificate active
- [ ] Homepage loads
- [ ] Sign-up works
- [ ] Dashboard loads after login
- [ ] Trade terminal renders
- [ ] Prices update (simulated or live)
- [ ] Order placement works
- [ ] No localhost in browser network tab

---

## COST SUMMARY

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Neon PostgreSQL | Free tier (0.5 GB) | $0 |
| Railway | Starter ($5 credit/month) | $0-5 |
| Hostinger | Your existing plan | Already paid |
| Clerk | Free tier (10K MAU) | $0 |
| **Total** | | **$0-5/month** |

---

## SUPPORT

If something goes wrong:
1. Check Railway logs (dashboard → Deployments → View Logs)
2. Check Neon dashboard for database status
3. Check browser console (F12) for frontend errors
4. Check Hostinger error logs (hPanel → Advanced → Error Logs)
