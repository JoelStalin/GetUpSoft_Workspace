# 🔐 Secrets Management Guide

**Purpose:** Secure handling of credentials, API keys, and sensitive configuration  
**Audience:** DevOps engineers, deployment engineers, security team  
**Updated:** 2026-05-19

---

## Overview

Secrets are sensitive information that should never be committed to Git or exposed in logs:
- Passwords and API keys
- SSH private keys
- Encryption keys
- Database credentials
- SMTP credentials
- Third-party service tokens

This guide covers how to manage secrets safely in development, staging, and production environments.

---

## Environment-Based Secret Management

### Development (Local)

**Location:** `.env.local` or `.env.development` (never committed)

**Configuration:**

```bash
# Use mock providers - no real secrets needed
VITE_ERP_TYPE=mock
VITE_USE_MOCK=true
VITE_USE_MOCK_EMAIL=true
NODE_ENV=development
```

**Usage:**

```bash
# Load locally
export $(cat .env.local | xargs)

# Or source for current session
source .env.local

# Verify (only non-sensitive vars)
echo $NODE_ENV  # Should output: development
```

**.gitignore Protection:**

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.development
.env.staging
.env.production
```

### Staging

**Location:** GitHub Secrets (referenced in `.github/workflows`)

**Required Secrets:**

```
STAGING_ODOO_HOST
STAGING_ODOO_PORT
STAGING_ODOO_DATABASE
STAGING_ODOO_USERNAME
STAGING_ODOO_PASSWORD
STAGING_SMTP_HOST
STAGING_SMTP_PORT
STAGING_SMTP_USER
STAGING_SMTP_PASS
STAGING_SMTP_FROM
```

**Usage in GitHub Actions:**

```yaml
env:
  VITE_ODOO_HOST: ${{ secrets.STAGING_ODOO_HOST }}
  VITE_ODOO_PASSWORD: ${{ secrets.STAGING_ODOO_PASSWORD }}
  VITE_SMTP_PASS: ${{ secrets.STAGING_SMTP_PASS }}
```

**Setup:**

1. Go to repository Settings
2. Select "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Enter name (e.g., `STAGING_ODOO_PASSWORD`)
5. Paste secret value
6. Click "Add secret"

### Production

**Location:** GitHub Secrets + Environment Variables on Server

**Critical Secrets:**

```
PRODUCTION_ODOO_PASSWORD
PRODUCTION_SMTP_PASS
DEPLOY_SSH_PRIVATE_KEY
CLOUDFLARE_API_TOKEN
SENTRY_AUTH_TOKEN
```

**Setup in GitHub:**

Same as staging, but use `PRODUCTION_*` prefix.

**Setup on Server:**

```bash
# Create .env.production (never commits to Git)
sudo nano /home/ubuntu/workspaces/GetUpSoft_Workspace/.env.production

# Content:
VITE_ERP_TYPE=odoo
VITE_ODOO_HOST=erp.company.com
VITE_ODOO_PASSWORD=super-secret-password
VITE_SMTP_PASS=smtp-secret-password
# ... all other variables

# Secure file permissions
chmod 600 .env.production
sudo chown ubuntu:ubuntu .env.production

# Load in deployment script
source .env.production
```

---

## GitHub Secrets Setup

### Step 1: Generate SSH Key (if needed)

```bash
# Generate Ed25519 key (recommended)
ssh-keygen -t ed25519 -f deploy_key -N ""

# View private key (for GitHub secret)
cat deploy_key

# Copy public key to authorized_keys on deployment server
cat deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 2: Add Secrets to GitHub

**Via UI:**

1. Go to https://github.com/getupsoft/workspace/settings/secrets/actions
2. Click "New repository secret"
3. For each secret:
   - Name: Exact name (e.g., `DEPLOY_SSH_PRIVATE_KEY`)
   - Value: Paste entire content (including BEGIN/END lines for keys)
   - Click "Add secret"

**Secrets to Add:**

```
Name                        Value
---                         -----
DEPLOY_HOST                 deploy.example.com
DEPLOY_USER                 ubuntu
DEPLOY_SSH_PRIVATE_KEY      -----BEGIN OPENSSH PRIVATE KEY-----
                            (entire key content)
                            -----END OPENSSH PRIVATE KEY-----
CLOUDFLARE_ZONE_ID          1234567890abcdef1234567890abcdef
CLOUDFLARE_API_TOKEN        Bearer token_value_here
STAGING_ODOO_PASSWORD       password123
STAGING_SMTP_PASS           smtp_password123
PRODUCTION_ODOO_PASSWORD    prod_password_secure
PRODUCTION_SMTP_PASS        prod_smtp_secure
SENTRY_AUTH_TOKEN           sentry_token_here
```

### Step 3: Test Secrets in Workflow

```yaml
# In GitHub Actions workflow
- name: Test secrets loaded
  run: |
    if [ -z "${{ secrets.DEPLOY_HOST }}" ]; then
      echo "ERROR: DEPLOY_HOST secret not set"
      exit 1
    fi
    echo "✅ Secrets loaded successfully"
```

---

## Docker Runtime Secrets

### Passing Secrets to Container

#### Via Environment Variables

```bash
# Build
docker build -t getupsoft-site:latest .

# Run with secrets
docker run -d \
  --name getupsoft-site \
  -e VITE_ODOO_PASSWORD=secret123 \
  -e VITE_SMTP_PASS=smtp_secret \
  -p 127.0.0.1:3120:80 \
  getupsoft-site:latest
```

#### Via .env File

```bash
# Create .env.production (with real values)
VITE_ERP_TYPE=odoo
VITE_ODOO_HOST=erp.company.com
VITE_ODOO_PASSWORD=secret123
VITE_SMTP_PASS=smtp_secret
# ... all variables

# Pass to container
docker run -d \
  --name getupsoft-site \
  --env-file .env.production \
  -p 127.0.0.1:3120:80 \
  getupsoft-site:latest
```

#### Via Docker Compose

```yaml
# docker-compose.prod.yml
services:
  web:
    image: getupsoft-site:latest
    environment:
      - VITE_ERP_TYPE=${VITE_ERP_TYPE}
      - VITE_ODOO_HOST=${VITE_ODOO_HOST}
      - VITE_ODOO_PASSWORD=${VITE_ODOO_PASSWORD}
      - VITE_SMTP_PASS=${VITE_SMTP_PASS}
```

Load before running:

```bash
export $(cat .env.production | xargs)
docker-compose -f docker-compose.prod.yml up -d
```

#### Via Docker Secrets (Swarm/Kubernetes)

```bash
# Create secret
echo "my-secret-value" | docker secret create my_secret -

# Use in service
docker service create \
  --secret my_secret \
  --name myservice \
  myimage

# Inside container
cat /run/secrets/my_secret
```

---

## Secret Rotation Procedures

### Passwords (Every 90 days)

```bash
# 1. Generate new password
# Use: https://passwordsgenerator.net/
# Minimum 24 characters, include special characters

# 2. Update production system
# For Odoo: Settings → Users → Select user → Change Password
# For SMTP: Update Gmail App Passwords

# 3. Update GitHub secrets
# Settings → Secrets → Update secret value

# 4. Update server .env.production
sudo nano /home/ubuntu/workspaces/GetUpSoft_Workspace/.env.production
# Change values

# 5. Restart container
docker-compose -f docker-compose.prod.yml restart web

# 6. Document rotation
# Timestamp, who rotated, new password (encrypted storage)
```

### SSH Keys (Every 6 months)

```bash
# 1. Generate new key
ssh-keygen -t ed25519 -f deploy_key_new -N ""

# 2. Add public key to server
cat deploy_key_new.pub >> ~/.ssh/authorized_keys

# 3. Update GitHub secret
# Settings → Secrets → Update DEPLOY_SSH_PRIVATE_KEY

# 4. Test new key in workflow
# Push test commit, verify deployment works

# 5. Remove old key from server
# ssh-keygen -R user@host (removes from known_hosts)
# Remove from authorized_keys manually

# 6. Destroy old key
rm deploy_key deploy_key.pub
```

---

## Secret Auditing

### View Secret Access Logs

```bash
# GitHub Actions log output
# Secrets are masked automatically (shown as ***)

# Example in logs:
# > curl -H "Authorization: Bearer ***"
# ✅ Secret not exposed

# If secret appears in logs:
# 1. Rotate immediately
# 2. Review commit history
# 3. Check for breaches on haveibeenpwned.com
```

### Audit Checklist

```bash
# Monthly audit:

# 1. Verify .gitignore protects secrets
grep -E "\.env|\.key|secret" .gitignore

# 2. Check for hardcoded secrets in code
git log --all --full-history --oneline | head -20
git grep -i "password\|secret\|api.?key" -- "*.ts" "*.js" "*.tsx" "*.jsx"

# 3. Verify GitHub secrets are all used
# Settings → Secrets → Verify each secret is referenced in workflows

# 4. Check environment files not committed
git status --porcelain | grep -E "\.env"

# 5. Review who has access
# Settings → Collaborators → Verify access appropriate
```

---

## Emergency: Compromised Secret

### Immediate Actions (First 5 minutes)

```bash
# 1. Stop any active deployments
# GitHub Actions → Cancel running workflows

# 2. Rotate the secret immediately
# Change password/key in source system

# 3. Update GitHub secret
# Settings → Secrets → Update with new value

# 4. Monitor for abuse
# Check logs for unusual activity
# Monitor billing for unauthorized usage
```

### Follow-up Actions (Within 24 hours)

```bash
# 1. Force new container deployment
docker-compose -f docker-compose.prod.yml restart web

# 2. Review access logs
# Odoo: Settings → Logs
# SMTP: Gmail → Security → Review activity
# Server: /var/log/auth.log

# 3. Change related passwords
# If Odoo password leaked, also rotate SMTP password

# 4. Document incident
# Keep records for audit trail
```

### Long-term Response (Within 1 week)

```bash
# 1. Post-mortem meeting
# How was secret exposed?
# Prevent future incidents

# 2. Update procedures
# Improve secret handling
# Better logging/monitoring

# 3. Security audit
# Review all secrets
# Audit access controls
# Check for other exposures

# 4. Team training
# Review secrets best practices
# Distribute security guidelines
```

---

## Best Practices Checklist

- [x] Use `.env.example` for non-secret variables
- [x] Never commit `.env` files to Git
- [x] Use separate secrets per environment (dev/staging/prod)
- [x] Rotate secrets every 90 days (passwords) or 6 months (keys)
- [x] Use GitHub Secrets for CI/CD secrets
- [x] Mask secrets in logs (automatic in GitHub Actions)
- [x] Use strong passwords (24+ characters, mixed case, numbers, symbols)
- [x] Document secret rotation procedures
- [x] Audit secret access monthly
- [x] Secure file permissions on servers (600 for .env files)
- [x] Use SSH keys instead of passwords when possible
- [x] Enable 2FA on all service accounts
- [x] Keep SSH keys off production servers (only public keys)
- [x] Monitor for compromise (haveibeenpwned.com)
- [x] Have incident response plan

---

## Reference

### Useful Commands

```bash
# Export variables from .env file
export $(cat .env.production | xargs)

# Verify variable loaded
echo $VITE_ODOO_PASSWORD

# Mask variable in output
echo "Password is: $(echo $VITE_ODOO_PASSWORD | sed 's/./*/g')"

# Check file permissions
ls -la .env.production
# Should be: -rw------- (600)

# Securely delete file
shred -vfz .env.old  # (Linux)
rm -P .env.old       # (macOS)
```

### Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Password Generator](https://passwordsgenerator.net/)
- [Have I Been Pwned](https://haveibeenpwned.com/)

---

_Secrets Management v1.0 · Updated 2026-05-19 · Secure by Default_
