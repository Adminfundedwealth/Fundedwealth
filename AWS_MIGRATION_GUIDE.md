# FundedWealth AWS Migration Guide

## Migration Summary

| Component | Before | After |
|-----------|--------|-------|
| Frontend Hosting | Vercel | AWS S3 + CloudFront |
| Backend Hosting | Render | AWS EC2 |
| Database | Supabase PostgreSQL | Supabase PostgreSQL (KEPT) |
| Authentication | Clerk | Supabase Auth + Google OAuth |
| File Storage | N/A | AWS S3 |

---

## 1. AWS Resources Required

### Frontend (S3 + CloudFront)
- **S3 Bucket**: `fundedwealth-frontend` (Region: ap-south-1)
- **CloudFront Distribution**: With custom domain (fundedwealth.com, www.fundedwealth.com)
- **ACM Certificate**: For fundedwealth.com (must be in us-east-1 for CloudFront)
- **Route 53** (or DNS provider): Point A/AAAA records to CloudFront

### Backend (EC2)
- **EC2 Instance**: t3.medium or t3.small (ap-south-1, Mumbai)
- **Elastic IP**: For stable public IP
- **Security Group**: Allow ports 22, 80, 443
- **ACM Certificate** or Let's Encrypt for api.fundedwealth.com

### Storage (S3)
- **S3 Bucket**: `fundedwealth-uploads` (Region: ap-south-1)
  - Folders: `kyc/`, `profile/`, `community/`, `blog/`
- **IAM User**: With S3 write access for the API server

### IAM
- **Deploy User**: S3 + CloudFront access for CI/CD
- **API Server User**: S3 access for file uploads

---

## 2. Supabase Auth Setup

### 2.1 Enable Email/Password Auth
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure:
   - Confirm email: ON
   - Secure email change: ON
   - Double confirm email: OFF (optional)

### 2.2 Enable Google OAuth
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Set:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. In Google Cloud Console:
   - Authorized redirect URI: `https://nysrxvpjdlvzvcawysvh.supabase.co/auth/v1/callback`
   - Authorized origins: `https://fundedwealth.com`, `https://www.fundedwealth.com`

### 2.3 Configure Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://www.fundedwealth.com`
- **Redirect URLs**:
  - `https://www.fundedwealth.com/auth/callback`
  - `https://fundedwealth.com/auth/callback`
  - `http://localhost:5200/auth/callback` (dev)

### 2.4 User Migration (Clerk → Supabase)
Existing users with Clerk IDs in the `users` table need their `clerkId` column updated to Supabase user IDs after they re-register or login via Google.

**Strategy**: On first login, backend creates/links user by email match.

---

## 3. Deployment Commands

### 3.1 Frontend → S3 + CloudFront

```bash
# Build
pnpm --filter @workspace/fundedwealth build

# Deploy (from repo root)
bash ./aws/s3-deploy.sh
```

### 3.2 Backend → EC2

```bash
# First time setup (SSH into EC2)
bash ./aws/ec2-setup.sh

# Clone repo
cd /opt/fundedwealth
git clone <repo-url> .
cp ./aws/.env.ec2.template .env
# Edit .env with real values

# Build & start
pnpm install --no-frozen-lockfile
pnpm --filter @workspace/db run build
pnpm --filter @workspace/api-zod run build
pnpm --filter @workspace/api-server run build
pm2 start ./aws/ecosystem.config.cjs
pm2 save
pm2 startup

# Setup Nginx
sudo cp ./aws/nginx.conf /etc/nginx/sites-available/fundedwealth-api
sudo ln -s /etc/nginx/sites-available/fundedwealth-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d api.fundedwealth.com
```

### 3.3 CI/CD (GitHub Actions)
Push to `main` triggers:
1. Build check (typecheck + build)
2. Frontend deploy to S3 + CloudFront invalidation
3. Backend deploy via SSH to EC2

---

## 4. Environment Variables

### Frontend (build-time, via GitHub Secrets)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.fundedwealth.com` |
| `VITE_API_BASE_URL` | `https://api.fundedwealth.com` |
| `VITE_SUPABASE_URL` | `https://nysrxvpjdlvzvcawysvh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (your anon key) |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_Sy1K5V35MUlZoB` |

### Backend (EC2 .env)
See `aws/.env.ec2.template` for full list.

### GitHub Secrets (CI/CD)
| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | S3 + CloudFront deploy |
| `AWS_SECRET_ACCESS_KEY` | S3 + CloudFront deploy |
| `CLOUDFRONT_DISTRIBUTION_ID` | Cache invalidation |
| `EC2_HOST` | Backend deploy SSH |
| `EC2_USER` | Backend deploy SSH |
| `EC2_SSH_KEY` | Backend deploy SSH |
| `VITE_API_URL` | Frontend build |
| `VITE_API_BASE_URL` | Frontend build |
| `VITE_SUPABASE_URL` | Frontend build |
| `VITE_SUPABASE_ANON_KEY` | Frontend build |
| `VITE_RAZORPAY_KEY_ID` | Frontend build |

---

## 5. DNS Configuration

| Record | Type | Value |
|--------|------|-------|
| `fundedwealth.com` | A (Alias) | CloudFront distribution |
| `www.fundedwealth.com` | A (Alias) | CloudFront distribution |
| `api.fundedwealth.com` | A | EC2 Elastic IP |

---

## 6. Rollback Instructions

### If auth migration fails:
1. Revert git to the commit before migration
2. Re-add `@clerk/react` to frontend package.json
3. Re-add `@clerk/express` to backend package.json
4. Restore `VITE_CLERK_PUBLISHABLE_KEY` in .env
5. Restore `CLERK_SECRET_KEY` on backend
6. Redeploy

### If AWS fails — fall back to Vercel/Render:
1. Point DNS back to Vercel/Render
2. Frontend: Reconnect Vercel deployment
3. Backend: Render auto-deploys from main branch (render.yaml still present)

---

## 7. Post-Migration Checklist

- [ ] Supabase Email provider enabled
- [ ] Supabase Google OAuth configured
- [ ] Supabase redirect URLs set
- [ ] S3 bucket created with proper policy
- [ ] CloudFront distribution created with SPA error pages
- [ ] ACM certificates issued
- [ ] EC2 instance running with PM2 + Nginx
- [ ] DNS records updated
- [ ] GitHub Secrets configured
- [ ] Test: Sign Up with email
- [ ] Test: Sign In with email
- [ ] Test: Google OAuth login
- [ ] Test: Password reset
- [ ] Test: Dashboard loads
- [ ] Test: Razorpay checkout works
- [ ] Test: Blog loads
- [ ] Test: Community posts work
- [ ] Test: Admin panel works
- [ ] Test: KYC upload works
- [ ] Test: WebSocket connections
- [ ] Test: Logout clears session
