# KYC System - Deployment & Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Supabase account
- Resend API key
- Clerk authentication configured

---

## Step 1: Database Setup

### Create Supabase Storage Bucket

```bash
# In Supabase Dashboard > Storage > Create New Bucket
Bucket Name: kyc-documents
Public: false
```

### Run Drizzle Migrations

```bash
cd fundedwealth/lib/db

# Push schema to database
npx drizzle-kit push:pg

# Or generate migration files
npx drizzle-kit generate:pg --schema=src/schema/kyc-*.ts
```

### Create Tables Manually (if needed)

If migrations don't work, create tables directly:

```sql
-- Create kyc_profiles table
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  address_city TEXT,
  address_state TEXT,
  address_postal_code TEXT,
  status TEXT DEFAULT 'NOT_STARTED' NOT NULL,
  verification_level INTEGER DEFAULT 0 NOT NULL,
  risk_score DECIMAL(5,2) DEFAULT 0 NOT NULL,
  risk_level TEXT DEFAULT 'LOW' NOT NULL,
  risk_flags TEXT DEFAULT '[]' NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  rejection_reason TEXT,
  resubmission_count INTEGER DEFAULT 0 NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kyc_profile_id INTEGER NOT NULL REFERENCES kyc_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  mime_type TEXT,
  file_size INTEGER,
  file_resolution TEXT,
  verification_status TEXT DEFAULT 'PENDING' NOT NULL,
  verification_notes TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN DEFAULT FALSE NOT NULL,
  is_blurred BOOLEAN DEFAULT FALSE NOT NULL,
  is_legible BOOLEAN DEFAULT TRUE NOT NULL,
  quality_score INTEGER,
  face_detected BOOLEAN DEFAULT FALSE,
  face_match BOOLEAN DEFAULT FALSE,
  face_match_score INTEGER,
  version INTEGER DEFAULT 1 NOT NULL,
  is_latest_version BOOLEAN DEFAULT TRUE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create kyc_reviews table
CREATE TABLE IF NOT EXISTS kyc_reviews (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  risk_score INTEGER,
  risk_level TEXT,
  risk_factors TEXT DEFAULT '[]' NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_kyc_profiles_user_id ON kyc_profiles(user_id);
CREATE INDEX idx_kyc_profiles_status ON kyc_profiles(status);
CREATE INDEX idx_kyc_profiles_risk_level ON kyc_profiles(risk_level);
CREATE INDEX idx_kyc_documents_kyc_profile_id ON kyc_documents(kyc_profile_id);
CREATE INDEX idx_kyc_documents_document_type ON kyc_documents(document_type);
CREATE INDEX idx_kyc_reviews_user_id ON kyc_reviews(user_id);
```

---

## Step 2: Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fundedwealth

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here

# Clerk
CLERK_SECRET_KEY=sk_test_...

# KYC Storage
KYC_DOCUMENTS_BUCKET=kyc-documents
KYC_MAX_FILE_SIZE=10485760  # 10MB in bytes

# Server
PORT=8080
NODE_ENV=production
```

### Frontend (.env.local)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PROXY_URL=/api/clerk

# API Base URL
VITE_API_BASE_URL=https://api.fundedwealth.com
```

---

## Step 3: Backend Setup

### Install Dependencies

```bash
cd artifacts/api-server
npm install
```

### Build & Test

```bash
# Build TypeScript
npm run build

# Test API endpoints
npm run test

# Start development server
npm run dev
```

### Verify Endpoints

```bash
# Test health check
curl http://localhost:8080/health

# Test KYC start (requires authentication)
curl -X POST http://localhost:8080/api/kyc/start \
  -H "Authorization: Bearer your_token"
```

---

## Step 4: Frontend Setup

### Install Dependencies

```bash
cd artifacts/fundedwealth
npm install
```

### Build & Test

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test with dev server
npm run dev
```

### Verify Pages

- User KYC Flow: `http://localhost:5173/kyc`
- Admin Dashboard: `http://localhost:5173/admin` (tab: KYC)

---

## Step 5: Security Configuration

### Supabase RLS Policies

```sql
-- Enable RLS on KYC tables
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC profile
CREATE POLICY "Users can view own KYC profile" ON kyc_profiles
  FOR SELECT
  USING (auth.uid() = (SELECT id FROM users WHERE user_id = auth.uid()));

-- Admins can view all KYC profiles
CREATE POLICY "Admins can view all KYC profiles" ON kyc_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Similar policies for kyc_documents and kyc_reviews
```

### Storage Policies

```sql
-- Set bucket to private
UPDATE storage.buckets SET public = false WHERE name = 'kyc-documents';

-- Create policy for signed URLs
CREATE POLICY "Allow signed URLs" ON storage.objects
  USING (bucket_id = 'kyc-documents' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
```

---

## Step 6: Admin User Setup

### Create Admin User in Database

```sql
-- Update user role to admin
UPDATE users SET role = 'admin' WHERE clerk_id = 'user_123...';

-- Verify
SELECT id, email, role FROM users WHERE role = 'admin';
```

### Grant Admin Permissions

Admins can now:
- Access `/admin` page
- View KYC queue
- Approve/Reject submissions
- View analytics

---

## Step 7: Email Configuration

### Resend Setup

```bash
# Get API key from Resend dashboard
# https://resend.com/dashboard

# Configure in .env
RESEND_API_KEY=re_your_key_here
```

### Test Email

```bash
# Send test email
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "no-reply@fundedwealth.com",
    "to": "test@example.com",
    "subject": "KYC Test",
    "html": "Testing KYC emails"
  }'
```

---

## Step 8: Testing Checklist

### User Flow Testing

- [ ] User can access `/kyc`
- [ ] Personal details form accepts input
- [ ] Document upload works
  - [ ] Accepts PNG/JPG/PDF
  - [ ] Rejects invalid files
  - [ ] Shows file size error for >10MB
- [ ] Selfie step works
- [ ] Submit button is enabled
- [ ] KYC status updates to "PENDING"
- [ ] User receives approval email

### Admin Flow Testing

- [ ] Admin can access `/admin`
- [ ] Admin KYC tab shows pending submissions
- [ ] Filters work (status, risk, country)
- [ ] Can view submission details
- [ ] Can approve submission
- [ ] Can reject with reason
- [ ] Can request resubmission
- [ ] Analytics show correct counts
- [ ] Approval email is sent

### Security Testing

- [ ] Non-authenticated users get 401
- [ ] Non-admin users cannot access admin routes
- [ ] Users can only view their own KYC
- [ ] Documents are encrypted in storage
- [ ] Audit logs record all admin actions

---

## Step 9: Monitoring & Logging

### Enable Logging

```typescript
// In logger.ts
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: { colorize: true }
  } : undefined,
});

export { logger };
```

### Monitor Key Metrics

```bash
# Check logs in production
tail -f /var/log/fundedwealth/api.log

# Monitor specific endpoints
grep "kyc" /var/log/fundedwealth/api.log
```

---

## Step 10: Deployment

### Docker Setup (Optional)

```dockerfile
# Dockerfile for API server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8080
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
```

### Deploy to Production

```bash
# Backend
cd artifacts/api-server
npm run build
docker build -t fundedwealth-api .
docker push your-registry/fundedwealth-api:latest

# Frontend
cd artifacts/fundedwealth
npm run build
# Deploy to CDN/S3

# Run migrations
npx drizzle-kit push:pg --connectionString=$PROD_DATABASE_URL
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check migrations
npx drizzle-kit introspect:pg --connectionString=$DATABASE_URL
```

### Supabase Upload Issues

```bash
# Verify bucket exists
curl -X GET https://your-project.supabase.co/storage/v1/bucket \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Test upload manually
npm run test:kyc-upload
```

### Email Not Sending

```bash
# Check Resend API key
curl -X GET https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY"

# Check logs for errors
grep -i "email" /var/log/fundedwealth/api.log
```

---

## Post-Deployment

### Backup Strategy

```bash
# Daily database backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup Supabase storage
aws s3 sync s3://kyc-documents s3://backup-kyc-documents/
```

### Monitoring Setup

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure email alerts for failures
- [ ] Set up dashboards for KYC metrics
- [ ] Enable database query logging
- [ ] Set up storage quota alerts

### Documentation

- [ ] Document all custom configurations
- [ ] Create runbooks for common issues
- [ ] Document team access procedures
- [ ] Create disaster recovery plan

---

## Support

For issues during deployment:
1. Check logs: `tail -f /var/log/fundedwealth/api.log`
2. Review [KYC_SYSTEM_DOCUMENTATION.md](./KYC_SYSTEM_DOCUMENTATION.md)
3. Contact: devops@fundedwealth.com

---

**Last Updated:** May 17, 2026
**Version:** 1.0.0
