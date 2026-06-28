# FundedWealth — Step-by-Step AWS Deployment

---

## PREREQUISITES (Do these first)

### 1. Install AWS CLI
Download and install: https://awscli.amazonaws.com/AWSCLIV2.msi

After install, open CMD and verify:
```
aws --version
```

### 2. Configure AWS CLI
```
aws configure
```
Enter:
- AWS Access Key ID: (from your AWS IAM user)
- AWS Secret Access Key: (from your AWS IAM user)
- Default region: ap-south-1
- Default output format: json

### 3. Create an IAM User (if you don't have one)
1. Go to AWS Console → IAM → Users → Create User
2. Name: `fundedwealth-deploy`
3. Attach policies: `AdministratorAccess` (for setup; restrict later)
4. Create access key → Download credentials

---

## PART A: FRONTEND DEPLOYMENT (S3 + CloudFront)

### Step A1: Create S3 Bucket for Frontend

Open CMD/PowerShell and run:
```
aws s3 mb s3://fundedwealth-frontend --region ap-south-1
```

Block all public access (CloudFront will serve it):
```
aws s3api put-public-access-block --bucket fundedwealth-frontend --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### Step A2: Request SSL Certificate

CloudFront requires the certificate to be in **us-east-1** (Virginia):
```
aws acm request-certificate --domain-name fundedwealth.com --subject-alternative-names "*.fundedwealth.com" --validation-method DNS --region us-east-1
```

This will output a CertificateArn. Save it:
```
arn:aws:acm:us-east-1:XXXXXXXXXXXX:certificate/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

### Step A3: Validate the Certificate

1. Go to AWS Console → Certificate Manager → us-east-1 region
2. Click on your pending certificate
3. Click "Create records in Route 53" (if using Route 53)
   OR add the CNAME records to your DNS provider manually
4. Wait for status to change to "Issued" (takes 5-30 minutes)

### Step A4: Create CloudFront Origin Access Control (OAC)

```
aws cloudfront create-origin-access-control --origin-access-control-config "{\"Name\":\"fundedwealth-oac\",\"Description\":\"OAC for fundedwealth frontend\",\"SigningProtocol\":\"sigv4\",\"SigningBehavior\":\"always\",\"OriginAccessControlOriginType\":\"s3\"}"
```

Note the `Id` from the output.

### Step A5: Create CloudFront Distribution

Go to AWS Console → CloudFront → Create Distribution:

**Origin Settings:**
- Origin domain: `fundedwealth-frontend.s3.ap-south-1.amazonaws.com`
- Origin access: Origin Access Control → Select the OAC you created
- Name: `fundedwealth-frontend`

**Default Cache Behavior:**
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD
- Cache policy: CachingOptimized
- Compress objects automatically: Yes

**Settings:**
- Alternate domain names (CNAME): `fundedwealth.com`, `www.fundedwealth.com`
- Custom SSL certificate: Select your ACM cert from Step A3
- Default root object: `index.html`
- Price class: Use all edge locations (or Price Class 200 for cost savings)
- IPv6: On

**Error Pages (CRITICAL for SPA):**
After creation, go to Error Pages tab → Create Custom Error Response:
- HTTP Error Code: 403
- Response page path: `/index.html`
- HTTP response code: 200

Create another:
- HTTP Error Code: 404
- Response page path: `/index.html`
- HTTP response code: 200

Note your **Distribution ID** and **Distribution Domain Name** (e.g., `d1234abcdef.cloudfront.net`).

### Step A6: Update S3 Bucket Policy

Replace `YOUR_ACCOUNT_ID` and `YOUR_DISTRIBUTION_ID` below, then run:

```
aws s3api put-bucket-policy --bucket fundedwealth-frontend --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"AllowCloudFrontOAC\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudfront.amazonaws.com\"},\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::fundedwealth-frontend/*\",\"Condition\":{\"StringEquals\":{\"AWS:SourceArn\":\"arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID\"}}}]}"
```

### Step A7: Build & Deploy Frontend

From your project root (where `pnpm-workspace.yaml` is):

```cmd
cd "c:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth"

pnpm install --no-frozen-lockfile
pnpm --filter @workspace/fundedwealth build
```

Then sync to S3:
```cmd
:: Sync assets with long cache
aws s3 sync "artifacts\fundedwealth\dist\assets" s3://fundedwealth-frontend/assets --cache-control "public, max-age=31536000, immutable" --delete --region ap-south-1

:: Sync everything else with no-cache
aws s3 sync "artifacts\fundedwealth\dist" s3://fundedwealth-frontend --cache-control "no-cache, no-store, must-revalidate" --exclude "assets/*" --delete --region ap-south-1
```

### Step A8: Invalidate CloudFront Cache

```
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Step A9: Point DNS to CloudFront

Add these DNS records at your domain registrar:

| Record | Type | Value |
|--------|------|-------|
| `fundedwealth.com` | CNAME (or ALIAS/A if root) | `d1234abcdef.cloudfront.net` |
| `www.fundedwealth.com` | CNAME | `d1234abcdef.cloudfront.net` |

If using Route 53, use Alias records pointing to CloudFront.

**Frontend is now LIVE at https://fundedwealth.com** 🎉

---

## PART B: BACKEND DEPLOYMENT (EC2)

### Step B1: Create Security Group

```
aws ec2 create-security-group --group-name fundedwealth-api-sg --description "FundedWealth API Server" --region ap-south-1
```

Note the **GroupId** (e.g., `sg-0abc123def456`).

Add rules:
```
aws ec2 authorize-security-group-ingress --group-id sg-XXXX --protocol tcp --port 22 --cidr 0.0.0.0/0 --region ap-south-1
aws ec2 authorize-security-group-ingress --group-id sg-XXXX --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ap-south-1
aws ec2 authorize-security-group-ingress --group-id sg-XXXX --protocol tcp --port 443 --cidr 0.0.0.0/0 --region ap-south-1
```

### Step B2: Create Key Pair

```
aws ec2 create-key-pair --key-name fundedwealth-key --key-type rsa --key-format pem --query "KeyMaterial" --output text --region ap-south-1 > fundedwealth-key.pem
```

**IMPORTANT**: Keep this `.pem` file safe. You need it to SSH into the server.

On Windows, you may need to fix permissions:
```
icacls fundedwealth-key.pem /inheritance:r /grant:r "%username%:R"
```

### Step B3: Launch EC2 Instance

```
aws ec2 run-instances --image-id ami-0dee22c13ea7a9a67 --instance-type t3.medium --key-name fundedwealth-key --security-group-ids sg-XXXX --region ap-south-1 --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=fundedwealth-api}]" --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":30,\"VolumeType\":\"gp3\"}}]"
```

Note the **InstanceId** from output.

If the above AMI doesn't work (AMIs change by region), find Ubuntu 24.04 AMI:
```
aws ec2 describe-images --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" --owners 099720109477 --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" --output text --region ap-south-1
```

### Step B4: Allocate & Associate Elastic IP

```
aws ec2 allocate-address --domain vpc --region ap-south-1
```

Note the **AllocationId** and **PublicIp**.

Associate it with your instance:
```
aws ec2 associate-address --instance-id i-XXXXXXXXXXXX --allocation-id eipalloc-XXXXXXXXXXXX --region ap-south-1
```

### Step B5: Point DNS for API

Add this DNS record:

| Record | Type | Value |
|--------|------|-------|
| `api.fundedwealth.com` | A | Your Elastic IP (e.g., `13.232.XX.XX`) |

### Step B6: SSH into EC2

```
ssh -i fundedwealth-key.pem ubuntu@YOUR_ELASTIC_IP
```

If on Windows without SSH, use PuTTY (convert .pem to .ppk with PuTTYgen).

### Step B7: Setup the Server (run on EC2)

Copy-paste this entire block into the SSH terminal:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm@9

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Install Git
sudo apt install -y git

# Create app directory
sudo mkdir -p /opt/fundedwealth
sudo chown ubuntu:ubuntu /opt/fundedwealth

# Create log directory
sudo mkdir -p /var/log/fundedwealth
sudo chown ubuntu:ubuntu /var/log/fundedwealth

echo "✅ Server setup complete!"
```

### Step B8: Clone & Build (run on EC2)

```bash
cd /opt/fundedwealth
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Install dependencies
pnpm install --no-frozen-lockfile

# Build workspace packages
pnpm --filter @workspace/db run build
pnpm --filter @workspace/api-zod run build
pnpm --filter @workspace/api-server run build
```

### Step B9: Create Environment File (run on EC2)

```bash
nano /opt/fundedwealth/.env
```

Paste this content (fill in your real values):

```
NODE_ENV=production
PORT=8080

# Supabase
DATABASE_URL=postgresql://postgres.nysrxvpjdlvzvcawysvh:YOUR_DB_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://nysrxvpjdlvzvcawysvh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Razorpay
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET

# AWS S3
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_S3_BUCKET=fundedwealth-uploads
AWS_S3_REGION=ap-south-1

# Frontend URL (for CORS)
FRONTEND_URL=https://www.fundedwealth.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`.

### Step B10: Start with PM2 (run on EC2)

```bash
cd /opt/fundedwealth

# Start the API server
pm2 start ./artifacts/api-server/dist/index.mjs \
  --name fundedwealth-api \
  --node-args="--enable-source-maps" \
  -i max \
  --env /opt/fundedwealth/.env

# Verify it's running
pm2 status
pm2 logs fundedwealth-api --lines 20

# Save PM2 config (auto-restart on reboot)
pm2 save
pm2 startup
```

If PM2 startup shows a command to run with `sudo`, copy-paste and run that command.

### Step B11: Configure Nginx (run on EC2)

```bash
sudo nano /etc/nginx/sites-available/fundedwealth-api
```

Paste:
```nginx
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
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Save, then enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/fundedwealth-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step B12: Get SSL Certificate (run on EC2)

```bash
sudo certbot --nginx -d api.fundedwealth.com
```

Follow the prompts:
- Enter email: your email
- Agree to terms: Y
- Share email: N
- Redirect HTTP to HTTPS: 2 (Redirect)

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

**Backend is now LIVE at https://api.fundedwealth.com** 🎉

---

## PART C: VERIFY EVERYTHING WORKS

### Test Backend Health
Open in browser: `https://api.fundedwealth.com/api/health`

Should return: `{"status":"ok"}`

### Test Frontend
Open: `https://fundedwealth.com`

Should load the site.

### Test Auth Flow
1. Go to `https://fundedwealth.com/sign-up`
2. Create an account
3. Check email for verification
4. Sign in at `https://fundedwealth.com/sign-in`
5. Test Google login

---

## PART D: SETUP GITHUB ACTIONS (Auto-Deploy)

### D1: Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and Variables → Actions → New Repository Secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront dist ID |
| `EC2_HOST` | Your Elastic IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of `fundedwealth-key.pem` |
| `VITE_API_URL` | `https://api.fundedwealth.com` |
| `VITE_API_BASE_URL` | `https://api.fundedwealth.com` |
| `VITE_SUPABASE_URL` | `https://nysrxvpjdlvzvcawysvh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXXXXXXXXXX` |

### D2: Push to Deploy

After adding secrets, every push to `main` will:
1. Build and typecheck
2. Deploy frontend to S3 + invalidate CloudFront
3. SSH to EC2, pull code, rebuild, and reload PM2

---

## PART E: CREATE S3 UPLOADS BUCKET

```
aws s3 mb s3://fundedwealth-uploads --region ap-south-1

aws s3api put-bucket-cors --bucket fundedwealth-uploads --cors-configuration "{\"CORSRules\":[{\"AllowedHeaders\":[\"*\"],\"AllowedMethods\":[\"GET\",\"PUT\",\"POST\"],\"AllowedOrigins\":[\"https://www.fundedwealth.com\",\"https://fundedwealth.com\"],\"ExposeHeaders\":[\"ETag\"],\"MaxAgeSeconds\":3600}]}"
```

---

## TROUBLESHOOTING

### Frontend shows blank page
- Check CloudFront error pages (403/404 → /index.html, 200)
- Clear CloudFront cache: `aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"`

### API returns 502 Bad Gateway
- SSH into EC2 and check PM2: `pm2 logs fundedwealth-api`
- Make sure port 8080 is what the app listens on
- Check Nginx: `sudo nginx -t`

### SSL certificate not working
- Make sure DNS propagated: `nslookup api.fundedwealth.com`
- Re-run certbot: `sudo certbot --nginx -d api.fundedwealth.com`

### CORS errors
- Update the `ALLOWED_ORIGINS` array in `artifacts/api-server/src/app.ts`
- Add your CloudFront domain to the list
- Rebuild and restart: `pm2 reload fundedwealth-api`

### Auth not working
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in EC2 `.env`
- Check Supabase Dashboard → Authentication → Logs

---

## COST ESTIMATE (Monthly)

| Resource | Cost |
|----------|------|
| EC2 t3.medium (Mumbai) | ~$30/month |
| Elastic IP | Free (when attached) |
| S3 (frontend ~50MB) | ~$0.02/month |
| CloudFront (India traffic) | ~$5-15/month |
| S3 (uploads) | ~$1-5/month |
| Route 53 (if used) | $0.50/month |
| **Total** | **~$35-50/month** |

To reduce costs: Use `t3.small` ($15/month) if traffic is low.

---

## QUICK REFERENCE

| Resource | URL/ID |
|----------|--------|
| Frontend | https://fundedwealth.com |
| API | https://api.fundedwealth.com |
| S3 Frontend | s3://fundedwealth-frontend |
| S3 Uploads | s3://fundedwealth-uploads |
| EC2 | (Your Elastic IP) |
| CloudFront | (Your distribution ID) |
| Supabase | https://nysrxvpjdlvzvcawysvh.supabase.co |
