#!/bin/bash

# Script to set up GitHub Actions AWS credentials and secrets
# This script creates an IAM role and policy for GitHub Actions to deploy to AWS

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Actions AWS Setup ===${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get repository information
GITHUB_REPO="${1:-PawRush/vuestic-admin}"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="${2:-vuestic-admin-1765463271}"
CLOUDFRONT_DIST_ID="${3:-ES3S0ZC645KC8}"

echo -e "${YELLOW}Configuration:${NC}"
echo "GitHub Repository: $GITHUB_REPO"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "CloudFront Distribution: $CLOUDFRONT_DIST_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Parse repository to get owner and name
IFS='/' read -r REPO_OWNER REPO_NAME <<< "$GITHUB_REPO"

# Create IAM role for GitHub Actions
ROLE_NAME="github-actions-vuestic-admin"
POLICY_NAME="github-actions-vuestic-admin-deploy"

echo -e "${BLUE}Step 1: Creating IAM Role...${NC}"

# Create trust policy for GitHub OIDC
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::\$(aws sts get-caller-identity --query Account --output text):oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:ref:refs/heads/*"
        }
      }
    }
  ]
}
EOF
)

# Create the role
aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$TRUST_POLICY" \
  --description "Role for GitHub Actions to deploy Vuestic Admin to AWS" \
  2>/dev/null || echo "Role already exists"

ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
echo -e "${GREEN}✓ IAM Role created/exists${NC}"
echo "  Role ARN: $ROLE_ARN"
echo ""

# Create inline policy for S3 and CloudFront access
echo -e "${BLUE}Step 2: Creating IAM Policy...${NC}"

DEPLOY_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketVersioning"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/${CLOUDFRONT_DIST_ID}"
    }
  ]
}
EOF
)

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "$DEPLOY_POLICY" \
  2>/dev/null || echo "Policy already updated"

echo -e "${GREEN}✓ IAM Policy attached${NC}"
echo ""

# Display secrets to add to GitHub
echo -e "${BLUE}Step 3: GitHub Secrets Configuration${NC}"
echo -e "${YELLOW}Add the following secrets to your GitHub repository:${NC}"
echo ""
echo "1. AWS_ROLE_ARN"
echo "   Value: $ROLE_ARN"
echo ""
echo "2. AWS_S3_BUCKET_NAME"
echo "   Value: $S3_BUCKET_NAME"
echo ""
echo "3. AWS_CLOUDFRONT_DISTRIBUTION_ID"
echo "   Value: $CLOUDFRONT_DIST_ID"
echo ""

# Get the CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DIST_ID" --query 'Distribution.DomainName' --output text)
echo "4. AWS_CLOUDFRONT_DOMAIN"
echo "   Value: $CLOUDFRONT_DOMAIN"
echo ""

echo -e "${YELLOW}Instructions:${NC}"
echo "1. Go to https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret from the list above"
echo ""

# Test AWS credentials
echo -e "${BLUE}Step 4: Verifying AWS Access...${NC}"
if aws s3 ls "s3://$S3_BUCKET_NAME" --max-items 1 &>/dev/null; then
    echo -e "${GREEN}✓ S3 bucket is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify S3 access (this might be expected if not using the role yet)${NC}"
fi

if aws cloudfront get-distribution --id "$CLOUDFRONT_DIST_ID" &>/dev/null; then
    echo -e "${GREEN}✓ CloudFront distribution is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify CloudFront access${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Add the secrets to your GitHub repository"
echo "2. Push a commit to the 'master' branch to trigger the deployment"
echo "3. Monitor the GitHub Actions workflow at https://github.com/$GITHUB_REPO/actions"
