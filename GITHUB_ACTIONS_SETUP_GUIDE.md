# GitHub Actions Setup Guide - Complete Instructions

This guide walks you through setting up GitHub Actions for automatic deployment of GetUpSoft projects.

## Prerequisites

- GitHub account with access to JoelStalin/GetUpSoft_Workspace repository
- SSH access to code.getupsoft.com server
- Cloudflare account with API token for getupsoft.com

## Step-by-Step Setup

### Step 1: Prepare SSH Key for GitHub Actions

GitHub Actions needs a private SSH key to authenticate with the deployment server.

#### Generate new SSH key on the server

```bash
ssh ubuntu@code.getupsoft.com

# Generate ed25519 key (no passphrase)
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_deploy -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Verify it's added
grep "github_actions_deploy" ~/.ssh/authorized_keys
```

#### Get the private key content

```bash
cat ~/.ssh/github_actions_deploy
```

**Save this output** - you'll need it in the next step.

### Step 2: Get Cloudflare Credentials

#### Get Zone ID

1. Go to: https://dash.cloudflare.com
2. Select domain: getupsoft.com
3. Click "Overview" tab
4. Copy the "Zone ID" (right side under "Account")

#### Get API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Select "Custom Token" → Create
4. Name: `github-actions-deploy`
5. Permissions:
   - Zone → Cache Purge → Purge
   - Zone → Zone → Read
6. Zone Resources → Include → getupsoft.com
7. Click "Create Token"
8. **Copy the token immediately** (you can only view it once)

### Step 3: Add Secrets to GitHub

#### Option A: Using the Setup Script (Recommended)

First, update the .env file with the private key:

```bash
# Edit .env and add/update:
DEPLOY_SSH_PRIVATE_KEY='-----BEGIN OPENSSH PRIVATE KEY-----
[paste the full private key from step 1]
-----END OPENSSH PRIVATE KEY-----'
```

Then run the setup script:

```bash
./scripts/GITHUB_SECRETS_FROM_ENV.sh
```

#### Option B: Manual Setup via GitHub UI

1. Go to: https://github.com/JoelStalin/GetUpSoft_Workspace/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:

| Secret Name | Value |
|-------------|-------|
| `DEPLOY_HOST` | `code.getupsoft.com` |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_PRIVATE_KEY` | [Entire key from step 1, with -----BEGIN and -----END] |
| `CLOUDFLARE_ZONE_ID` | [Zone ID from step 2] |
| `CLOUDFLARE_API_TOKEN` | [API Token from step 2] |

### Step 4: Verify Setup

```bash
./scripts/validate-github-actions-secrets.sh
```

Expected output:
```
✅ All required secrets are configured!
📋 Checking workflows:
  ✅ deploy-getupsoft-site.yml exists
🚀 Ready for GitHub Actions deployment!
```

## Testing the Workflow

### Method 1: Push a Test Commit

```bash
cd 01_Core_Platform/getupsoft-site

# Make a test change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger GitHub Actions workflow"
git push origin main
```

### Method 2: Monitor the Workflow

```bash
# View recent workflow runs
gh run list --workflow deploy-getupsoft-site.yml --limit 5

# Watch real-time
gh run list --workflow deploy-getupsoft-site.yml --watch

# Get full logs
LATEST_RUN=$(gh run list --workflow deploy-getupsoft-site.yml -L1 -q '.[0].databaseId')
gh run view $LATEST_RUN --log
```

### Method 3: GitHub Web UI

1. Go to: https://github.com/JoelStalin/GetUpSoft_Workspace/actions
2. Click on the "Deploy GetUpSoft Site to Production" workflow
3. Monitor in real-time as it runs

## Expected Workflow Execution

When you push to `main` branch:

1. **GitHub Actions triggers** (~10 seconds)
2. **SSH connects** to code.getupsoft.com (~5 seconds)
3. **Git pulls latest** changes (~2-5 seconds)
4. **Docker builds** new image (~30-60 seconds)
5. **Container restarts** (~5 seconds)
6. **Health check** verifies deployment (~5 seconds)
7. **Cloudflare cache** purges (~2-5 seconds)
8. **Workflow completes** ✅

**Total time:** 2-3 minutes

## Troubleshooting

### "ssh: Permission denied (publickey)"

**Problem:** SSH key is not authorized on server

**Solution:**
```bash
ssh ubuntu@code.getupsoft.com

# Check if key is in authorized_keys
cat ~/.ssh/authorized_keys | grep -i github

# If not found, add it
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Test from local machine
ssh -i ~/.ssh/github_actions_deploy ubuntu@code.getupsoft.com "echo OK"
```

### "DEPLOY_HOST not found" in workflow

**Problem:** GitHub secret is not set

**Solution:**
```bash
./scripts/validate-github-actions-secrets.sh
```

If any are missing:
```bash
./scripts/setup-github-actions-secrets.sh
```

### "Docker build failed"

**Problem:** Docker image has build errors

**Solution:**
```bash
# Check the workflow logs in GitHub Actions
# Or manually build on the server:
ssh ubuntu@code.getupsoft.com
cd /home/ubuntu/GetUpSoft_Workspace/01_Core_Platform/getupsoft-site
docker build -t getupsoft-site:latest .

# Check for errors
docker logs getupsoft-site-web-1
```

### "Cloudflare cache purge failed"

**Problem:** Invalid API token or Zone ID

**Solution:**
```bash
# Verify credentials
source .env
echo "Zone ID: $CLOUDFLARE_ZONE_ID"
echo "Token length: ${#CLOUDFLARE_API_TOKEN}"

# Test API call
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' | jq '.'
```

### Workflow shows "Skipped"

**Problem:** Changes didn't match the workflow trigger path

**Solution:**
- Workflow only triggers on changes to `01_Core_Platform/getupsoft-site/**`
- Make sure your commit touches files in that directory
- Or edit `.github/workflows/deploy-getupsoft-site.yml` to adjust the trigger path

## Manual Deployment (Without GitHub Actions)

```bash
ssh ubuntu@code.getupsoft.com << 'EOF'
cd /home/ubuntu/GetUpSoft_Workspace

# Pull latest code
git fetch origin main
git reset --hard origin/main

# Build and deploy
cd 01_Core_Platform/getupsoft-site
docker build -t getupsoft-site:latest .

# Stop old container
docker stop getupsoft-site-web-1 2>/dev/null || true
docker rm getupsoft-site-web-1 2>/dev/null || true

# Start new container
docker run -d --name getupsoft-site-web-1 -p 3120:3000 getupsoft-site:latest

# Verify
sleep 5
curl -I http://localhost:3120/

# Purge cache
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-token"
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
EOF
```

## File Reference

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-getupsoft-site.yml` | Main GitHub Actions workflow |
| `scripts/GITHUB_SECRETS_FROM_ENV.sh` | Auto-configure secrets from .env |
| `scripts/validate-github-actions-secrets.sh` | Verify secrets are set |
| `scripts/setup-github-actions-secrets.sh` | Interactive secret setup |
| `GITHUB_ACTIONS_QUICKSTART.md` | Quick reference guide |
| `GITHUB_ACTIONS_MULTI_PROJECT.md` | Detailed documentation |

## Next Steps

After setup is complete:

1. ✅ Run `./scripts/validate-github-actions-secrets.sh` to verify
2. ✅ Make a test commit to trigger the workflow
3. ✅ Monitor at https://github.com/JoelStalin/GetUpSoft_Workspace/actions
4. ✅ Confirm changes appear on https://getupsoft.com
5. ✅ Check that Cloudflare cache was purged

## Support

For more information, see:
- `GITHUB_ACTIONS_MULTI_PROJECT.md` - Detailed architecture and configuration
- `GITHUB_ACTIONS_QUICKSTART.md` - Quick reference
- `.github/workflows/deploy-getupsoft-site.yml` - Workflow definition

---

**Status:** ✅ Ready for setup  
**Last Updated:** 2026-05-18
