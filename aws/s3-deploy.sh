#!/bin/bash
# ============================================================
# FundedWealth Frontend - Deploy to S3 + CloudFront
# ============================================================

set -e

# Configuration
S3_BUCKET="fundedwealth-frontend"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DIST_ID:-}"
BUILD_DIR="./artifacts/fundedwealth/dist"
AWS_REGION="ap-south-1"  # Mumbai (closest to India)

echo "=========================================="
echo "FundedWealth Frontend - S3 + CloudFront Deploy"
echo "=========================================="

# 1. Build the frontend
echo ">> Building frontend..."
pnpm --filter @workspace/fundedwealth build

# 2. Verify build output exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "ERROR: Build directory not found at $BUILD_DIR"
    exit 1
fi

echo ">> Build successful. Deploying to S3..."

# 3. Sync static assets with long cache headers
aws s3 sync "$BUILD_DIR/assets" "s3://$S3_BUCKET/assets" \
    --region "$AWS_REGION" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# 4. Sync HTML and other root files with no-cache
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --region "$AWS_REGION" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --exclude "assets/*" \
    --delete

# 5. Invalidate CloudFront cache
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo ">> Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    echo ">> CloudFront invalidation initiated."
else
    echo ">> WARNING: CLOUDFRONT_DIST_ID not set. Skipping cache invalidation."
fi

echo ""
echo "=========================================="
echo "Deploy complete!"
echo "=========================================="
