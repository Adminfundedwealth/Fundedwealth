# EC2 Backend Deployment Checklist

## Repository Facts

| Item | Value |
|------|-------|
| **Monorepo tool** | pnpm workspaces |
| **Backend package** | `artifacts/api-server` (name: `@workspace/api-server`) |
| **Build system** | esbuild (bundles all TS into single file) |
| **Build command** | `pnpm --filter @workspace/api-server run build` |
| **Build output** | `./artifacts/api-server/dist/index.mjs` |
| **Start command** | `node --enable-source-maps ./artifacts/api-server/dist/index.mjs` |
| **Port** | 8080 |
| **Health check** | `GET /api/health` |
| **Node version** | ≥ 20 |
| **Workspace deps** | `@workspace/db` and `@workspace/api-zod` (no build needed, raw TS bundled by esbuild) |

---

## Step 1 — SSH into your EC2 instance

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

---

## Step 2 — Install runtime dependencies

```bash
# System packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm 9
sudo npm install -g pnpm@9

# PM2
sudo npm install -g pm2

# Create directories
sudo mkdir -p /opt/fundedwealth /var/log/fundedwealth
sudo chown ubuntu:ubuntu /opt/fundedwealth /var/log/fundedwealth
```

---

## Step 3 — Clone repository

```bash
cd /opt/fundedwealth
git clone https://github.com/YOUR_USER/YOUR_REPO.git .
```

---

## Step 4 — Install and build

```bash
cd /opt/fundedwealth
pnpm install --no-frozen-lockfile
pnpm --filter @workspace/api-server run build
```

That's it. The esbuild script bundles `@workspace/db`, `@workspace/api-zod`, and all other workspace dependencies into a single `dist/index.mjs`. No separate workspace builds needed.

Verify the output exists:
```bash
ls -la /opt/fundedwealth/artifacts/api-server/dist/index.mjs
```

---

## Step 5 — Create `.env` file

```bash
cat > /opt/fundedwealth/.env << 'EOF'
NODE_ENV=production
PORT=8080

# ─── Supabase (Database + Auth) ──────────────────────────────
DATABASE_URL=postgresql://postgres.nysrxvpjdlvzvcawysvh:YOUR_DB_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://nysrxvpjdlvzvcawysvh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# ─── Razorpay ────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_Sy1K5V35MUlZoB
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET

# ─── AWS S3 (File uploads) ───────────────────────────────────
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET=fundedwealth-uploads
AWS_S3_REGION=ap-south-1

# ─── Sentry ──────────────────────────────────────────────────
SENTRY_DSN=https://233c24696e5513086d58cac5566f6aad@o4511513446252544.ingest.us.sentry.io/4511513473449984

# ─── OxaPay ──────────────────────────────────────────────────
OXAPAY_API_KEY=YOUR_OXAPAY_KEY
OXAPAY_MERCHANT_ID=YOUR_OXAPAY_MERCHANT_ID

# ─── Angel One ───────────────────────────────────────────────
ANGEL_ONE_API_KEY=YOUR_ANGEL_ONE_KEY
ANGEL_ONE_CLIENT_ID=YOUR_ANGEL_ONE_CLIENT_ID
ANGEL_ONE_PASSWORD=YOUR_ANGEL_ONE_PASSWORD
ANGEL_ONE_TOTP_SECRET=YOUR_ANGEL_ONE_TOTP

# ─── Google Gemini AI ─────────────────────────────────────────
GOOGLE_AI_API_KEY=YOUR_GEMINI_API_KEY

# ─── CORS ─────────────────────────────────────────────────────
FRONTEND_URL=https://www.fundedwealth.com
EOF
```

**Replace all `YOUR_*` values with your actual secrets.**

Get your secrets from:
- **DATABASE_URL**: Supabase Dashboard → Settings → Database → Connection string (use "Transaction" pooler, port 6543)
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → service_role key
- **RAZORPAY_KEY_SECRET / WEBHOOK_SECRET**: Razorpay Dashboard → Settings → API Keys / Webhooks
- **Others**: Copy from your existing Render environment variables

---

## Step 6 — Start with PM2

```bash
cd /opt/fundedwealth

# Load env and start
set -a; source .env; set +a

pm2 start ./artifacts/api-server/dist/index.mjs \
  --name fundedwealth-api \
  --node-args="--enable-source-maps" \
  -i max

# Verify it's running
pm2 status
pm2 logs fundedwealth-api --lines 30

# Save config and enable startup
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## Step 7 — Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/fundedwealth-api << 'EOF'
upstream fundedwealth_api {
    server 127.0.0.1:8080;
    keepalive 64;
}

server {
    listen 80;
    server_name api.fundedwealth.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://fundedwealth_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/fundedwealth-api /etc/nginx/sites-enabled/fundedwealth-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 8 — Point DNS

Add an A record:

```
api.fundedwealth.com  →  YOUR_EC2_ELASTIC_IP
```

Wait for DNS propagation (check with `dig api.fundedwealth.com`).

---

## Step 9 — Get SSL certificate

```bash
sudo certbot --nginx -d api.fundedwealth.com --non-interactive --agree-tos -m your@email.com
```

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 10 — Verify

```bash
# From EC2
curl http://localhost:8080/api/health

# From anywhere (after DNS + SSL)
curl https://api.fundedwealth.com/api/health
```

Expected response: `{"status":"ok"}` or similar JSON.

---

## Subsequent Deployments (code updates)

SSH in and run:
```bash
cd /opt/fundedwealth
git pull origin main
pnpm install --no-frozen-lockfile
pnpm --filter @workspace/api-server run build
pm2 reload fundedwealth-api
```

---

## Environment Variables — Complete List

| Variable | Required | Source |
|----------|----------|--------|
| `NODE_ENV` | Yes | Always `production` |
| `PORT` | Yes | Always `8080` |
| `DATABASE_URL` | Yes | Supabase Dashboard → Settings → Database |
| `SUPABASE_URL` | Yes | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Settings → API |
| `RAZORPAY_KEY_ID` | Yes | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay Dashboard → Webhooks |
| `AWS_ACCESS_KEY_ID` | Optional | For S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | Optional | For S3 uploads |
| `AWS_S3_BUCKET` | Optional | `fundedwealth-uploads` |
| `AWS_S3_REGION` | Optional | `ap-south-1` |
| `SENTRY_DSN` | Optional | Sentry project settings |
| `OXAPAY_API_KEY` | Optional | OxaPay dashboard |
| `OXAPAY_MERCHANT_ID` | Optional | OxaPay dashboard |
| `ANGEL_ONE_API_KEY` | Optional | Angel One developer portal |
| `ANGEL_ONE_CLIENT_ID` | Optional | Angel One developer portal |
| `ANGEL_ONE_PASSWORD` | Optional | Angel One developer portal |
| `ANGEL_ONE_TOTP_SECRET` | Optional | Angel One developer portal |
| `GOOGLE_AI_API_KEY` | Optional | Google AI Studio |
| `FRONTEND_URL` | Recommended | `https://www.fundedwealth.com` |

---

## Decommission Render

After confirming EC2 is working:
1. Update frontend `VITE_API_URL` / `VITE_API_BASE_URL` to `https://api.fundedwealth.com`
2. Rebuild and redeploy frontend
3. Test all features end-to-end
4. Delete the Render service
