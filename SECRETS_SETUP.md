# GitHub Secrets Setup Instructions

## Quick Setup Guide

This file contains exact step-by-step instructions to add the required GitHub secrets for the CI/CD pipeline.

## Prerequisites

- You have admin or maintainer access to the GitHub repository
- You're logged into GitHub

## Add GitHub Secrets

### Step 1: Navigate to Repository Settings

1. Go to: https://github.com/PawRush/vuestic-admin
2. Click on the **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add First Secret - AWS_ROLE_ARN

1. Click the green **New repository secret** button
2. In the **Name** field, enter:
   ```
   AWS_ROLE_ARN
   ```
3. In the **Secret** field, enter:
   ```
   arn:aws:iam::376058330285:role/github-actions-vuestic-admin
   ```
4. Click **Add secret**

### Step 3: Add Second Secret - AWS_S3_BUCKET_NAME

1. Click the green **New repository secret** button
2. In the **Name** field, enter:
   ```
   AWS_S3_BUCKET_NAME
   ```
3. In the **Secret** field, enter:
   ```
   vuestic-admin-1765463271
   ```
4. Click **Add secret**

### Step 4: Add Third Secret - AWS_CLOUDFRONT_DISTRIBUTION_ID

1. Click the green **New repository secret** button
2. In the **Name** field, enter:
   ```
   AWS_CLOUDFRONT_DISTRIBUTION_ID
   ```
3. In the **Secret** field, enter:
   ```
   ES3S0ZC645KC8
   ```
4. Click **Add secret**

### Step 5: Add Fourth Secret - AWS_CLOUDFRONT_DOMAIN

1. Click the green **New repository secret** button
2. In the **Name** field, enter:
   ```
   AWS_CLOUDFRONT_DOMAIN
   ```
3. In the **Secret** field, enter:
   ```
   d1f012lsx189gg.cloudfront.net
   ```
4. Click **Add secret**

## Verify Secrets Are Added

1. Go back to: https://github.com/PawRush/vuestic-admin/settings/secrets/actions
2. You should see 4 secrets listed:
   - ✓ AWS_ROLE_ARN
   - ✓ AWS_S3_BUCKET_NAME
   - ✓ AWS_CLOUDFRONT_DISTRIBUTION_ID
   - ✓ AWS_CLOUDFRONT_DOMAIN

All secrets should show a green checkmark (✓) and display as "Updated X minutes ago"

## Test Your Pipeline

Once all 4 secrets are added, your CI/CD pipeline is ready to use:

### Method 1: Automatic Trigger (Push to master)

```bash
# Make a test change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger CI/CD pipeline"
git push origin master
```

### Method 2: Manual Trigger (Workflow Dispatch)

1. Go to: https://github.com/PawRush/vuestic-admin/actions
2. Click **Build and Deploy to AWS** on the left
3. Click the **Run workflow** button
4. Select the branch (default: master)
5. Click **Run workflow**

## Monitor Deployment

1. Go to: https://github.com/PawRush/vuestic-admin/actions
2. Click on the latest **Build and Deploy to AWS** workflow run
3. Watch the progress in real-time
4. Once complete, check https://d1f012lsx189gg.cloudfront.net

## Troubleshooting

### "Permission denied" error during deployment
- **Cause**: AWS_ROLE_ARN secret has incorrect value
- **Solution**: Double-check the value is exactly: `arn:aws:iam::376058330285:role/github-actions-vuestic-admin`

### "InvalidParameterException" on S3 upload
- **Cause**: AWS_S3_BUCKET_NAME secret is incorrect
- **Solution**: Verify the value is exactly: `vuestic-admin-1765463271`

### CloudFront invalidation fails
- **Cause**: AWS_CLOUDFRONT_DISTRIBUTION_ID is incorrect
- **Solution**: Verify the value is exactly: `ES3S0ZC645KC8`

### Secrets still don't work
1. Go to Settings → Secrets and variables → Actions
2. Delete all 4 secrets
3. Re-add them carefully, ensuring exact values
4. Try deployment again

## Security Notes

- Secrets are encrypted and never displayed in logs
- Only the repository can access these secrets
- Each workflow run gets a temporary token with these secrets
- GitHub automatically masks secret values in logs (shown as `***`)
- If a secret is accidentally exposed, delete it and create a new one

## Need Help?

- GitHub Secrets Docs: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- AWS IAM Role: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

---

**Once all secrets are added, your deployment pipeline is live and ready for production!**
