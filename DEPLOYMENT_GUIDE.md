# CI/CD Deployment Pipeline Setup Guide

This guide explains how to set up the GitHub Actions CI/CD pipeline for automated deployments to AWS.

## Overview

The pipeline is configured to:
- Automatically build and deploy to AWS when code is pushed to the `master` branch
- Run linting and type checks to ensure code quality
- Upload optimized assets to S3
- Invalidate CloudFront cache for instant updates
- Support manual deployments via workflow dispatch

## Pipeline Configuration

### Workflow File
- **Location**: `.github/workflows/deploy-aws.yml`
- **Trigger**:
  - Automatic on push to `master` branch
  - Manual trigger via GitHub Actions UI (workflow_dispatch)
- **Pipeline Name**: `Build and Deploy to AWS`

### Build and Deployment Steps
1. **Checkout code** - Clone repository
2. **Setup Node.js** - Install Node using `.nvmrc` version
3. **Install dependencies** - Using Yarn with caching
4. **Lint code** - Run ESLint to check code quality
5. **Type check** - Run TypeScript compiler
6. **Build** - Create production build
7. **Configure AWS credentials** - Use OIDC role assumption
8. **Upload to S3** - Sync dist folder to S3 bucket
9. **Invalidate CloudFront** - Clear cache for instant updates
10. **Deployment summary** - Log deployment details

## AWS Resources

The following AWS resources have been configured:

### IAM Role
- **Role Name**: `github-actions-vuestic-admin`
- **Role ARN**: `arn:aws:iam::376058330285:role/github-actions-vuestic-admin`
- **Trust Policy**: Configured to trust GitHub Actions OIDC provider
- **Repository**: `repo:PawRush/vuestic-admin:ref:refs/heads/*`

### S3 Bucket
- **Name**: `vuestic-admin-1765463271`
- **Region**: `us-east-1`
- **Permissions**: Managed through CloudFront Origin Access Identity

### CloudFront Distribution
- **Distribution ID**: `ES3S0ZC645KC8`
- **Domain**: `d1f012lsx189gg.cloudfront.net`
- **Origin**: S3 bucket with static website hosting
- **Protocol**: HTTPS only
- **Cache Settings**:
  - Static assets (except `index.html`): 1 year cache
  - `index.html`: No cache (always fresh)

## GitHub Secrets Configuration

The pipeline requires the following secrets to be configured in your GitHub repository:

### Required Secrets

1. **AWS_ROLE_ARN**
   - Value: `arn:aws:iam::376058330285:role/github-actions-vuestic-admin`
   - Description: IAM role for GitHub Actions to assume

2. **AWS_S3_BUCKET_NAME**
   - Value: `vuestic-admin-1765463271`
   - Description: S3 bucket for hosting static files

3. **AWS_CLOUDFRONT_DISTRIBUTION_ID**
   - Value: `ES3S0ZC645KC8`
   - Description: CloudFront distribution ID for cache invalidation

4. **AWS_CLOUDFRONT_DOMAIN**
   - Value: `d1f012lsx189gg.cloudfront.net`
   - Description: CloudFront domain name for logging

### How to Add Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value from the list above
5. Click **Add secret**
6. Repeat for all required secrets

## Deployment Process

### Automatic Deployment (on Push)

1. Push code to the `master` branch:
   ```bash
   git add .
   git commit -m "Feature: Add new feature"
   git push origin master
   ```

2. GitHub Actions automatically triggers the pipeline:
   - Check the workflow status: https://github.com/PawRush/vuestic-admin/actions
   - Click on the latest workflow run to view progress
   - Scroll down to see deployment summary

3. Once complete, your changes are live at: `https://d1f012lsx189gg.cloudfront.net`

### Manual Deployment (Workflow Dispatch)

1. Go to: https://github.com/PawRush/vuestic-admin/actions
2. Select **Build and Deploy to AWS** workflow
3. Click **Run workflow**
4. Select the branch (default: `master`)
5. Click **Run workflow**

The pipeline will execute and deploy the selected branch.

## Monitoring Deployments

### View Pipeline Runs

1. Go to: https://github.com/PawRush/vuestic-admin/actions
2. Click on **Build and Deploy to AWS** workflow
3. View active and completed runs

### Check Build Status

Each workflow run shows:
- ✅ **Success**: All steps completed successfully
- ❌ **Failure**: Step failed, check logs for error details
- ⏳ **In Progress**: Pipeline is currently running

### View Logs

1. Click on a workflow run
2. Click on **build-and-deploy** job
3. Expand individual steps to see detailed logs
4. Check the **Deployment Summary** step for final status

### Troubleshooting

Common issues and solutions:

#### Deployment fails with permission error
- **Cause**: AWS_ROLE_ARN secret not configured
- **Fix**: Add the secret following the configuration guide above

#### Build fails with missing dependencies
- **Cause**: Yarn cache out of date
- **Fix**: The workflow uses cache, but you can manually clear it:
  1. Go to Settings → Actions → General
  2. Click **Clear all caches**
  3. Re-run the workflow

#### S3 upload fails
- **Cause**: Incorrect S3 bucket name or permissions
- **Fix**: Verify AWS_S3_BUCKET_NAME secret matches the actual bucket

#### CloudFront invalidation fails
- **Cause**: Invalid distribution ID
- **Fix**: Verify AWS_CLOUDFRONT_DISTRIBUTION_ID matches the actual distribution

## Cache Invalidation Strategy

The pipeline uses smart cache invalidation:

### Cache Behavior
```
Static Assets (JS, CSS, Images):
- Cache-Control: public, max-age=31536000 (1 year)
- Files with content hashes (e.g., main.abc123.js)

HTML (index.html):
- Cache-Control: public, max-age=0, must-revalidate
- Always fetched fresh from CloudFront edge

Map Files (.map):
- NOT uploaded to reduce storage costs
```

### CloudFront Invalidation
After every deployment:
1. Workflow creates invalidation for all paths (`/*`)
2. CloudFront edge locations update within 5-10 minutes
3. Users receive latest version on next visit

## Performance

The deployment pipeline is optimized for:

### Build Speed
- Yarn dependency caching for faster installs
- Incremental builds where applicable
- Typical build time: 2-3 minutes

### Upload Speed
- Parallel S3 uploads
- Only changed files are uploaded via `--delete` flag
- Typical upload time: 1-2 minutes

### Overall Deployment Time
- **Average**: 3-5 minutes from push to live
- **Includes**: Build, lint, type check, upload, invalidation

## Security Considerations

### OIDC Authentication
- Uses GitHub's OIDC provider (no AWS credentials stored)
- More secure than static access keys
- Credentials valid for single workflow run only

### IAM Policy
- Scoped to specific S3 bucket
- Limited CloudFront permissions (invalidation only)
- Cannot delete distribution or modify settings

### Network Security
- All communication over HTTPS
- S3 bucket has public access blocked
- Only CloudFront can serve content from S3

## Rollback Procedure

If you need to revert to a previous deployment:

1. Identify the previous good commit
2. Create a new branch from that commit
3. Merge back to master (via PR)
4. Pipeline automatically deploys the reverted code

Alternative: Manually sync S3 from previous backup if available

## Advanced Customization

### Modify Deployment Strategy

Edit `.github/workflows/deploy-aws.yml` to:

- Change trigger branch (line 6)
- Add environment variables (env section)
- Modify cache settings (cache-control headers)
- Add additional checks (new steps)
- Add notifications (Slack, email, etc.)

### Add Environment-Specific Builds

Example for staging deployments:
```yaml
on:
  push:
    branches:
      - master      # Production
      - staging     # Staging environment
```

Then conditionally deploy based on branch:
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/master'
  run: ...

- name: Deploy to staging
  if: github.ref == 'refs/heads/staging'
  run: ...
```

## Maintenance

### Regular Tasks

- **Weekly**: Monitor GitHub Actions usage (free tier: 2,000 minutes/month)
- **Monthly**: Review CloudFront metrics (cost optimization)
- **Quarterly**: Update Node.js version in `.nvmrc`
- **Quarterly**: Review IAM policy permissions

### Update Dependencies

The pipeline tests for outdated dependencies. To update:

1. Locally: `yarn upgrade-interactive`
2. Commit: `git commit -m "chore: update dependencies"`
3. Push: `git push origin master`
4. Pipeline automatically tests and deploys

## Support Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **AWS IAM OIDC**: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html
- **Vuestic Admin Docs**: https://vuestic.dev/

## Questions?

For issues or questions:
1. Check GitHub Actions logs for detailed error messages
2. Review AWS IAM role trust policy
3. Verify all secrets are correctly configured
4. Check CloudFront distribution status
