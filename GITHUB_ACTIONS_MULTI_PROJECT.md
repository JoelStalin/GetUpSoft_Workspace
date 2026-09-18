# GitHub Actions Multi-Project Deployment Guide

This document describes how to configure GitHub Actions workflows for independent deployment of GetUpSoft projects.

## Overview

GetUpSoft_Workspace contains multiple projects that can be deployed independently:

| Project | Type | Location | Status |
|---------|------|----------|--------|
| **getupsoft-site** | React Frontend | `01_Core_Platform/getupsoft-site/` | ✅ Active |
| **Easycouting_Refactor** | Python Backend | `01_Core_Platform/Easycouting_Refactor/` | 📋 Ready |
| **easycount-core** | Full Stack | `01_Core_Platform/easycount-core/` | 📋 Ready |
| **Galantesjewelry** | Separate Repo | `05_Backups/Galantesjewelry-sanitize/` | 🚫 Own CI/CD |

## Configured Workflows

### 1. Deploy GetUpSoft Site (`.github/workflows/deploy-getupsoft-site.yml`)

**Trigger:** Push to `main` branch affecting `01_Core_Platform/getupsoft-site/`

**What it does:**
1. Checks out code from GitHub
2. SSHs into code.getupsoft.com (Ubuntu server)
3. Pulls latest changes
4. Builds Docker image
5. Restarts container
6. Validates deployment
7. Purges Cloudflare cache

**Required Secrets:**
- `DEPLOY_HOST` - Server hostname (e.g., `code.getupsoft.com`)
- `DEPLOY_USER` - SSH user (e.g., `ubuntu`)
- `DEPLOY_SSH_PRIVATE_KEY` - SSH private key (ed25519)
- `CLOUDFLARE_ZONE_ID` - Cloudflare Zone ID
- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token

## Setting Up GitHub Secrets

### Step 1: Generate SSH Keys (if not already done)

On code.getupsoft.com server:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy_key
```

Copy the private key (everything including `-----BEGIN...` and `-----END...`)

### Step 2: Add Secrets to GitHub Repository

1. Go to GitHub: https://github.com/JoelStalin/GetUpSoft_Workspace
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

Add these secrets:

#### DEPLOY_HOST
```
code.getupsoft.com
```

#### DEPLOY_USER
```
ubuntu
```

#### DEPLOY_SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
[paste the contents of ~/.ssh/github_deploy_key]
-----END OPENSSH PRIVATE KEY-----
```

#### CLOUDFLARE_ZONE_ID
```
[Get from Cloudflare Dashboard → Overview]
```

#### CLOUDFLARE_API_TOKEN
```
[Create at Cloudflare → Profile → API Tokens]
```

## Testing Workflows

### Option 1: Manual Trigger (if available)

```bash
gh workflow run deploy-getupsoft-site.yml --ref main
```

### Option 2: Make a Test Commit

```bash
cd 01_Core_Platform/getupsoft-site
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger deployment workflow"
git push origin main
```

Then monitor at: https://github.com/JoelStalin/GetUpSoft_Workspace/actions

### Option 3: Monitor from Terminal

```bash
# Real-time workflow monitoring
gh run list --workflow deploy-getupsoft-site.yml --limit 1

# Get details of last run
gh run view $(gh run list --workflow deploy-getupsoft-site.yml --limit 1 -q '.[0].databaseId')

# Stream logs
gh run view --log $(gh run list --workflow deploy-getupsoft-site.yml --limit 1 -q '.[0].databaseId')
```

## Common Issues and Solutions

### Issue: "ssh: Permission denied (publickey)"

**Cause:** SSH key not authorized on server

**Solution:**
1. SSH into code.getupsoft.com manually
2. Add the public key to `~/.ssh/authorized_keys`
```bash
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste the contents of ~/.ssh/github_deploy_key.pub]
EOF
```

### Issue: "CLOUDFLARE_ZONE_ID not found"

**Cause:** Secret not created in GitHub

**Solution:**
1. Go to Settings → Secrets and variables
2. Verify all 5 secrets are created
3. Check spelling exactly: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_PRIVATE_KEY`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`

### Issue: "Failed to connect to site"

**Cause:** Docker container failed to start or isn't responding

**Solution:**
1. SSH into server manually:
```bash
ssh ubuntu@code.getupsoft.com
docker logs getupsoft-site-web-1
docker ps | grep getupsoft-site
```
2. Check environment variables in workflow
3. Verify Docker build doesn't have errors

### Issue: "Cloudflare cache purge failed"

**Cause:** Invalid API token or zone ID

**Solution:**
1. Verify credentials at https://dash.cloudflare.com
2. Ensure API Token has "Cache Purge" permission
3. Test credentials manually:
```bash
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-token"
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository (JoelStalin/GetUpSoft_Workspace)      │
│                                                           │
│  main branch → Event: push to 01_Core_Platform/...      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions Runner                                    │
│                                                           │
│  - Checkout code                                         │
│  - Load secrets from GitHub                             │
│  - SSH to code.getupsoft.com                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ code.getupsoft.com (Ubuntu Server)                       │
│                                                           │
│  - Git pull latest                                       │
│  - Docker build                                          │
│  - Container restart                                     │
│  - Health check                                          │
│  - Cloudflare cache purge                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Production Environment                                    │
│                                                           │
│  - https://getupsoft.com (Global)                        │
│  - https://getupsoft.com.do (Dominican Republic)         │
└─────────────────────────────────────────────────────────┘
```

## Manual Deployment (Without GitHub Actions)

If you need to deploy without GitHub Actions:

```bash
ssh ubuntu@code.getupsoft.com << 'EOF'
cd /home/ubuntu/GetUpSoft_Workspace
git pull origin main
cd 01_Core_Platform/getupsoft-site
docker build -t getupsoft-site:latest .
docker stop getupsoft-site-web-1 2>/dev/null || true
docker rm getupsoft-site-web-1 2>/dev/null || true
docker run -d --name getupsoft-site-web-1 -p 3120:3000 getupsoft-site:latest
sleep 5
curl -I http://localhost:3120/
EOF
```

## Workflow Execution Summary

1. **Trigger:** Developer pushes code to `main` branch
2. **GitHub Actions:** Workflow automatically starts
3. **SSH Deploy:** Server pulls code and rebuilds
4. **Health Check:** Verifies container is running
5. **Cache Purge:** Cloudflare cache is cleared
6. **Verification:** Tests confirm deployment success
7. **Result:** Changes live on production (getupsoft.com)

**Total time:** ~2-3 minutes

## Future Workflows

Additional workflows can be created for:
- `easycount-core` - Full backend deployment
- `Easycouting_Refactor` - Alternative backend
- `getupsoft-mail-infra` - Email infrastructure
- `infrastructure` - Infrastructure changes

Each would follow the same pattern:
1. Path-based trigger (only when files change)
2. SSH deployment to appropriate server
3. Service-specific health checks
4. Appropriate cache invalidation

## Quick Reference

| Task | Command |
|------|---------|
| View all workflows | `gh workflow list` |
| View recent runs | `gh run list` |
| Check specific workflow | `gh workflow view deploy-getupsoft-site.yml` |
| Monitor live | `gh run list --watch` |
| Trigger manually | `gh workflow run deploy-getupsoft-site.yml` |
| View secrets | GitHub UI → Settings → Secrets and variables |

---

**Last Updated:** 2026-05-18
**Status:** ✅ Ready for production deployment
