# Coding Agents Guide

This file provides guidance for AI coding agents working on this project.

## Deployment

See `./DEPLOYMENT.md` for deployment status, logs, troubleshooting, pipeline setup, and next steps.

## Project Structure

- `/src` - Vue 3 application source code
- `/infra` - AWS CDK infrastructure code
- `/scripts` - Deployment and utility scripts
- `/dist` - Build output (generated)

## Key Commands

```bash
# Development
yarn dev                  # Start development server
yarn build                # Build for production
yarn lint                 # Lint and fix code

# Deployment
./scripts/deploy.sh       # Deploy to preview environment
./scripts/deploy.sh prod  # Deploy to production

# Infrastructure
cd infra
npm run synth             # Generate CloudFormation template
npm run diff              # Show infrastructure changes
npm run deploy            # Deploy infrastructure
npm run destroy           # Destroy infrastructure
```

## Build Configuration

- Framework: Vite + Vue 3
- Package Manager: yarn (project root), npm (infra directory)
- Build Output: `dist/`
- TypeScript enabled
