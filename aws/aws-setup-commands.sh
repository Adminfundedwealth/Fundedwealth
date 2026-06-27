#!/bin/bash
# ============================================================
# FundedWealth AWS Setup Commands
# Run these with AWS CLI configured (aws configure)
# Region: ap-south-1 (Mumbai)
# ============================================================

AWS_REGION="ap-south-1"
ACCOUNT_ID="YOUR_ACCOUNT_ID"

echo "================================================"
echo "Step 1: Create S3 Buckets"
echo "================================================"

# Frontend bucket
aws s3 mb s3://fundedwealth-frontend --region $AWS_REGION
aws s3api put-bucket-versioning --bucket fundedwealth-frontend --versioning-configuration Status=Enabled

# Uploads bucket
aws s3 mb s3://fundedwealth-uploads --region $AWS_REGION
aws s3api put-bucket-versioning --bucket fundedwealth-uploads --versioning-configuration Status=Enabled

# Set CORS on uploads bucket
aws s3api put-bucket-cors --bucket fundedwealth-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://www.fundedwealth.com", "https://fundedwealth.com", "http://localhost:5200"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo ""
echo "================================================"
echo "Step 2: Create CloudFront OAC"
echo "================================================"

aws cloudfront create-origin-access-control --origin-access-control-config '{
  "Name": "fundedwealth-frontend-oac",
  "Description": "OAC for FundedWealth frontend S3 bucket",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}'

echo ""
echo "================================================"
echo "Step 3: Request ACM Certificate (for CloudFront)"
echo "================================================"
echo "NOTE: Must be in us-east-1 for CloudFront!"

aws acm request-certificate \
  --domain-name "fundedwealth.com" \
  --subject-alternative-names "www.fundedwealth.com" \
  --validation-method DNS \
  --region us-east-1

echo ""
echo "================================================"
echo "Step 4: Create EC2 Key Pair"
echo "================================================"

aws ec2 create-key-pair \
  --key-name fundedwealth-api \
  --key-type rsa \
  --key-format pem \
  --query "KeyMaterial" \
  --output text \
  --region $AWS_REGION > fundedwealth-api.pem
chmod 400 fundedwealth-api.pem

echo ""
echo "================================================"
echo "Step 5: Create Security Group"
echo "================================================"

SG_ID=$(aws ec2 create-security-group \
  --group-name fundedwealth-api-sg \
  --description "FundedWealth API Server" \
  --region $AWS_REGION \
  --output text --query 'GroupId')

aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION

echo "Security Group ID: $SG_ID"

echo ""
echo "================================================"
echo "Step 6: Launch EC2 Instance"
echo "================================================"

aws ec2 run-instances \
  --image-id ami-0dee22c13ea7a9a67 \
  --instance-type t3.medium \
  --key-name fundedwealth-api \
  --security-group-ids $SG_ID \
  --region $AWS_REGION \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=fundedwealth-api}]' \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]'

echo ""
echo "================================================"
echo "Step 7: Allocate Elastic IP"
echo "================================================"

aws ec2 allocate-address --domain vpc --region $AWS_REGION
echo "NOTE: Associate the Elastic IP with your EC2 instance"
echo "      aws ec2 associate-address --instance-id <INSTANCE_ID> --allocation-id <ALLOCATION_ID>"

echo ""
echo "================================================"
echo "DONE! Next steps:"
echo "1. Validate ACM certificate (add DNS records)"
echo "2. Create CloudFront distribution"
echo "3. Update S3 bucket policy with CloudFront OAC ARN"
echo "4. SSH into EC2 and run ec2-setup.sh"
echo "5. Update DNS records"
echo "================================================"
