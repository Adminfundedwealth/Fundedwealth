# FundedWealth — AWS Deployment Guide

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         USERS (Browser)                             │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────┐
│           AWS Amplify (Frontend — Static SPA)         │
│                                                      │
│  • Vite-built React app                              │
│  • Global CDN (CloudFront)                           │
│  • Custom domain: fundedwealth.in                    │
│  • SPA rewrite rules (all routes → index.html)       │
│  • Environment: VITE_* variables                     │
└─────────────────────────────┬────────────────────────┘
                              │ /api/* requests
                              ▼
┌──────────────────────────────────────────────────────┐
│        AWS App Runner (Backend — Node.js API)         │
│                                                      │
│  • Express 5 server (port 9000)                      │
│  • Auto-scaling (1–10 instances)                     │
│  • Health check: GET /api/health                     │
│  • Region: ap-south-1 (Mumbai)                       │
│  • Environment: DATABASE_URL, CLERK_*, RAZORPAY_*    │
└─────────────────────────────┬────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────┐
│         Supabase (Database + Auth + Storage)          │
│                                                      │
│  • PostgreSQL database (connection pooler)           │
│  • Row-Level Security (RLS)                          │
│  • Auth (Supabase Auth — if migrating from Clerk)    │
│  • Storage (trade journal screenshots)               │
│  • Region: ap-south-1                                │
└──────────────────────────────────────────────────────┘
```

---

## Step 1: Supabase Setup

1. Go to https://supabase.com → create project in **ap-south-1** region
2. Copy these values from Settings → API:
   - Project URL → `SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Copy the connection string from Settings → Database:
   - Use the **Connection Pooler** URL (port 6543) → `DATABASE_URL`
4. Run database migrations:
   ```bash
   cd lib/db
   DATABASE_URL="postgresql://..." pnpm run push
   ```

---

## Step 2: Deploy Backend on AWS App Runner

### Option A: Source-based deployment (recommended)

1. Go to AWS Console → App Runner → Create service
2. Source: **Source code repository**
   - Connect GitHub: `cryptoaman9152-debug/fundedwealth`
   - Branch: `main`
3. Build settings: **Use configuration file** → `apprunner.yaml`
4. Service settings:
   - Port: `9000`
   - Health check path: `/api/health`
   - CPU: 1 vCPU
   - Memory: 2 GB
   - Min instances: 1
   - Max instances: 5
5. Environment variables (add ALL backend variables from `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | `9000` |
| `NODE_ENV` | ✅ | `production` |
| `DATABASE_URL` | ✅ | Supabase connection pooler URL |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `CLERK_SECRET_KEY` | ✅ | Clerk backend secret |
| `CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | Razorpay webhook secret |
| `CORS_ORIGIN` | ✅ | Amplify frontend URL |
| `GEMINI_API_KEY` | ⚠️ | For AI blog generation |
| `DHAN_API_KEY` | ⚠️ | For market data feed |
| `SENTRY_DSN` | ⚠️ | Error monitoring |
| `OXAPAY_API_KEY` | ⚠️ | Crypto payments |

### Option B: Docker-based deployment

```bash
# Build the image
docker build -f Dockerfile.apprunner -t fundedwealth-api .

# Push to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com
docker tag fundedwealth-api:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/fundedwealth-api:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/fundedwealth-api:latest
```

Then create App Runner service pointing to this ECR image.

---

## Step 3: Deploy Frontend on AWS Amplify

1. Go to AWS Console → Amplify → Create app
2. Connect repository: `cryptoaman9152-debug/fundedwealth`
3. Branch: `main`
4. Build settings: **Amplify will auto-detect `amplify.yml`** at repo root
5. Environment variables (Amplify Console → App settings → Environment variables):

| Variable | Required | Value |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | `pk_live_...` |
| `VITE_API_URL` | ✅ | App Runner service URL (e.g. `https://xxxxx.ap-south-1.awsapprunner.com`) |
| `VITE_RAZORPAY_KEY_ID` | ✅ | `rzp_live_...` |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `VITE_SENTRY_DSN` | ⚠️ | Sentry DSN |
| `VITE_BUILD_TIME` | auto | Set by build script |

6. Custom domain: Add `fundedwealth.in` → Amplify manages SSL certificate
7. Rewrites: Already configured in `amplify.yml` — all non-file paths → `/index.html`

---

## Step 4: Connect Frontend → Backend

After both services are deployed:

1. Copy the App Runner service URL (e.g. `https://abc123.ap-south-1.awsapprunner.com`)
2. Set it as `VITE_API_URL` in Amplify environment variables
3. Set `CORS_ORIGIN` in App Runner to your Amplify domain (e.g. `https://fundedwealth.in`)
4. Redeploy Amplify to pick up the new env var

---

## Step 5: Verify Deployment

### Frontend
```
curl -I https://fundedwealth.in
# Should return 200 with security headers
```

### Backend
```
curl https://your-api.ap-south-1.awsapprunner.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Database
```bash
# From your local machine with DATABASE_URL set
cd lib/db
pnpm run push
```

---

## Build & Start Commands Summary

### Frontend (Amplify)
| Phase | Command |
|---|---|
| Install | `corepack enable && corepack prepare pnpm@11.1.1 --activate && pnpm install --no-frozen-lockfile` |
| Build | `pnpm --filter @workspace/fundedwealth build` |
| Output | `artifacts/fundedwealth/dist` |

### Backend (App Runner)
| Phase | Command |
|---|---|
| Install | `corepack enable && corepack prepare pnpm@11.1.1 --activate && pnpm install --no-frozen-lockfile` |
| Build | `pnpm --filter @workspace/api-server run build` |
| Start | `node --enable-source-maps ./artifacts/api-server/dist/index.mjs` |
| Port | `9000` (env: `PORT`) |
| Health | `GET /api/health` |

---

## Monitoring & Operations

### Health Check
App Runner automatically monitors `GET /api/health` every 30 seconds.

### Logs
- **Frontend:** Amplify Console → Build logs
- **Backend:** App Runner → Logs (CloudWatch)
- **Database:** Supabase Dashboard → Logs

### Scaling
- **Frontend:** Amplify CDN handles unlimited traffic automatically
- **Backend:** App Runner auto-scales 1–10 instances based on concurrent requests
- **Database:** Supabase handles connection pooling (default 200 connections)

### Rollback
- **Frontend:** Amplify → Deployments → Redeploy any previous build
- **Backend:** App Runner → Deployments → Redeploy previous revision

---

## Cost Estimate (ap-south-1, Mumbai)

| Service | Estimated Monthly Cost |
|---|---|
| Amplify Hosting | Free tier (5 GB bandwidth, 1000 build minutes) |
| App Runner (1 vCPU, 2 GB) | ~$25–50/month |
| Supabase (Free tier) | $0 (up to 500 MB, 50K auth users) |
| Supabase (Pro) | $25/month (8 GB, unlimited auth) |
| **Total** | **~$25–75/month** |

---

## Troubleshooting

### "pnpm: command not found" in App Runner
Ensure `corepack enable` and `corepack prepare pnpm@11.1.1 --activate` are in pre-build.

### CORS errors in browser
Set `CORS_ORIGIN` in App Runner to match your exact Amplify domain (including `https://`).

### Database connection refused
Use the Supabase **connection pooler** URL (port 6543), not the direct connection (port 5432).

### Amplify build fails with "out of memory"
Increase the build image size: Amplify Console → Build settings → Advanced → Build image: `Large (7 GB)`.

### Clerk auth fails in production
Ensure `VITE_CLERK_PUBLISHABLE_KEY` uses the **live** key (`pk_live_*`), not test (`pk_test_*`).
