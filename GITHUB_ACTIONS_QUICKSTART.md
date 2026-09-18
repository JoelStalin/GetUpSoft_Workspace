# GitHub Actions Deployment - Quick Start

Deploy GetUpSoft projects to production automatically when you push to `main`.

## One-Time Setup (5 minutes)

### 1. Generate SSH Key

SSH into your server and generate a key:

```bash
ssh ubuntu@code.getupsoft.com

# Generate key
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""

# Add to authorized keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Display private key to copy
cat ~/.ssh/github_deploy_key
```

Copy the entire output including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.

### 2. Add GitHub Secrets

Option A: Interactive Setup Script (Recommended)

```bash
./scripts/setup-github-actions-secrets.sh
```

Option B: Manual Setup

1. Go to: https://github.com/JoelStalin/GetUpSoft_Workspace/settings/secrets/actions
2. Click "New repository secret"
3. Add these 5 secrets:

| Name | Value |
|------|-------|
| `DEPLOY_HOST` | `code.getupsoft.com` |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_PRIVATE_KEY` | [Paste from step 1] |
| `CLOUDFLARE_ZONE_ID` | [Get from Cloudflare dashboard] |
| `CLOUDFLARE_API_TOKEN` | [Create API token at Cloudflare] |

### 3. Verify Setup

```bash
./scripts/validate-github-actions-secrets.sh
```

Expected output:
```
✅ All required secrets are configured!
```

## Usage

### Deploy getupsoft-site

Just push to main:

```bash
cd 01_Core_Platform/getupsoft-site
# Make changes...
git add .
git commit -m "feature: update site"
git push origin main
```

Workflow automatically:
- Pulls code on server
- Rebuilds Docker image
- Restarts container
- Validates it's running
- Purges Cloudflare cache

**Total time:** ~2-3 minutes

### Monitor Deployment

```bash
# View recent runs
gh run list

# Watch in real-time
gh run list --watch

# View specific workflow
gh workflow view deploy-getupsoft-site.yml

# Get last run details
gh run view $(gh run list -L1 -q '.[0].databaseId')

# Stream logs
gh run view $(gh run list -L1 -q '.[0].databaseId') --log
```

Or view on GitHub: https://github.com/JoelStalin/GetUpSoft_Workspace/actions

## Troubleshooting

### Secrets not working?

```bash
./scripts/validate-github-actions-secrets.sh
```

### SSH Connection Failing?

1. Test manually from your machine:
```bash
ssh -i ~/.ssh/github_deploy_key ubuntu@code.getupsoft.com "echo OK"
```

2. If that fails, check the server:
```bash
ssh ubuntu@code.getupsoft.com
ls -la ~/.ssh/authorized_keys
```

### Docker build failing?

Check the logs on the server:
```bash
ssh ubuntu@code.getupsoft.com
docker logs getupsoft-site-web-1
```

### Cloudflare cache purge failing?

Test credentials:
```bash
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-token"

curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## What Deploys Automatically?

| Path | Workflow | Deployment |
|------|----------|------------|
| `01_Core_Platform/getupsoft-site/**` | deploy-getupsoft-site.yml | ✅ Active |
| `01_Core_Platform/easycount-core/**` | [Planned] | 📋 Soon |
| `01_Core_Platform/Easycouting_Refactor/**` | [Planned] | 📋 Soon |

## Manual Deployment (No GitHub Actions)

```bash
ssh ubuntu@code.getupsoft.com << 'EOF'
cd /home/ubuntu/GetUpSoft_Workspace
git pull origin main
cd 01_Core_Platform/getupsoft-site
docker build -t getupsoft-site:latest .
docker stop getupsoft-site-web-1 2>/dev/null || true
docker rm getupsoft-site-web-1 2>/dev/null || true
docker run -d --name getupsoft-site-web-1 -p 3120:3000 getupsoft-site:latest
EOF
```

## Files Reference

- **Workflow:** `.github/workflows/deploy-getupsoft-site.yml`
- **Setup guide:** `GITHUB_ACTIONS_MULTI_PROJECT.md`
- **Setup script:** `scripts/setup-github-actions-secrets.sh`
- **Validation script:** `scripts/validate-github-actions-secrets.sh`

## Success Indicators

✅ Push to main  
✅ GitHub Actions shows "✓" on commit  
✅ Can view logs in Actions tab  
✅ Website updates in 2-3 minutes  
✅ Cloudflare cache clears  

---

**Need help?** See `GITHUB_ACTIONS_MULTI_PROJECT.md` for detailed documentation.
