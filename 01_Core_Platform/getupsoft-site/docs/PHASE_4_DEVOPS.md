# 🚀 Phase 4: DevOps & Containerization

**Status:** ✅ In Progress  
**Updated:** 2026-05-19  
**Components:** Docker, Docker Compose, GitHub Actions, Secrets Management, Monitoring

---

## Overview

Phase 4 establishes production-ready DevOps infrastructure for the GetUpSoft Website Redesign. This includes containerization, CI/CD automation, secrets management, and monitoring/observability setup.

---

## Components

### 1. Docker Containerization

#### Files

- **`Dockerfile`** — Multi-stage build for production
  - Stage 1: Build stage (Node.js 20-alpine with pnpm)
  - Stage 2: Runtime stage (Nginx 1.25-alpine)
  - Non-root user for security (nginx-user)
  - Health check every 30s
  - Port 5173 exposed for Nginx

- **`nginx.conf`** — Production-grade Nginx configuration
  - SPA routing with fallback to index.html
  - 1-year cache for static assets (.js, .css, images)
  - Gzip compression (level 6) for text/JSON
  - Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
  - Health check endpoint at `/health`
  - Deny access to hidden files (/.*)
  - Client body size limit: 20MB

- **`.dockerignore`** — Optimize build context
  - Excludes git, node_modules, build outputs
  - Excludes config files and IDE files
  - Reduces image size by ~200MB

#### Building and Testing

```bash
# Build Docker image
docker build -t getupsoft-site:latest .

# Run locally (maps to localhost:5173)
docker run -d \
  --name getupsoft-site-dev \
  -p 127.0.0.1:5173:5173 \
  getupsoft-site:latest

# Test health endpoint
curl http://localhost:5173/health
# Expected: "healthy"

# View logs
docker logs getupsoft-site-dev

# Stop container
docker stop getupsoft-site-dev
docker rm getupsoft-site-dev
```

---

### 2. Docker Compose

#### Development Environment (`docker-compose.dev.yml`)

```yaml
# Features:
# - Vite dev server with HMR on port 5176
# - Hot reload enabled with volumes
# - Mock ERP and email providers
# - Health check every 10s
# - Logs to stdout for debugging
```

Usage:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild and start fresh
docker-compose -f docker-compose.dev.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production Environment (`docker-compose.prod.yml`)

```yaml
# Features:
# - Single web service (Nginx)
# - Environment variables from .env.production
# - Resource limits (1 CPU, 512MB RAM)
# - Health check every 30s
# - JSON logging with rotation (10MB per file, 3 files max)
# - Network isolation (getupsoft-network bridge)
# - Restart policy: unless-stopped
```

Usage:

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Environment variables must be in .env.production
export $(cat .env.production | xargs)

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale (future)
docker-compose -f docker-compose.prod.yml up -d --scale web=3

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

### 3. GitHub Actions CI/CD

#### Workflow File: `.github/workflows/deploy-getupsoft-site.yml`

**Trigger:** Push to `main` branch with changes in `01_Core_Platform/getupsoft-site/**`

**Jobs:**

1. **Deploy Job**
   - Checks out code
   - Sets up SSH access via secrets
   - Pulls latest from GitHub
   - Builds Docker image
   - Stops previous container
   - Starts new container with environment variables
   - Waits for health check
   - Tests HTTP connectivity
   - Syncs built assets to production directories
   - Purges Cloudflare cache

2. **Verification Job**
   - Runs post-deployment checks
   - Verifies container status
   - Reviews recent logs
   - Tests network connectivity
   - Tests public host routing

**Secrets Required:**

```
DEPLOY_HOST               # SSH host
DEPLOY_USER               # SSH user
DEPLOY_SSH_PRIVATE_KEY    # SSH private key
CLOUDFLARE_ZONE_ID        # Cloudflare zone ID
CLOUDFLARE_API_TOKEN      # Cloudflare API token
```

---

### 4. Environment Configuration

#### Development (`.env.development`)

```bash
VITE_ERP_TYPE=mock
VITE_USE_MOCK=true
VITE_USE_MOCK_EMAIL=true
NODE_ENV=development
```

#### Production (`.env.production`)

```bash
VITE_ERP_TYPE=odoo
VITE_ODOO_HOST=erp.company.com
VITE_ODOO_PORT=8069
VITE_ODOO_DATABASE=production_db
VITE_ODOO_USERNAME=api_user
VITE_ODOO_PASSWORD=${PRODUCTION_ODOO_PASSWORD}
VITE_SMTP_HOST=smtp.company.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=noreply@company.com
VITE_SMTP_PASS=${PRODUCTION_SMTP_PASS}
VITE_SMTP_FROM=noreply@company.com
NODE_ENV=production
```

---

### 5. Secrets Management

#### GitHub Secrets

1. Go to Settings → Secrets and Variables → Actions
2. Add each secret with exact name
3. SSH key format: `-----BEGIN OPENSSH PRIVATE KEY-----`

#### Best Practices

- Never commit secrets to Git
- Use environment variables in CI/CD
- Rotate secrets every 90 days
- Separate credentials by environment

---

### 6. Monitoring & Health Checks

#### Health Endpoint

```bash
# Manual check
curl http://localhost:5173/health
# Response: "healthy"
```

#### Container Health Monitoring

```bash
# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# View logs
docker logs -f getupsoft-site-web

# Check health history
docker inspect --format='{{json .State.Health}}' getupsoft-site-web | jq
```

#### Logging

- Driver: `json-file`
- Max size: 10MB per file
- Max files: 3 (30MB total)
- Labels: `service=getupsoft-site`

---

## Deployment Workflow

### Local Development

```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up

# 2. Visit http://localhost:5176/redesign/

# 3. Make changes (HMR auto-reloads)

# 4. Build production bundle
npm run build

# 5. Test production build
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify at http://localhost:3120/

# 7. Stop services
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
```

### Production Deployment

```bash
# 1. Commit changes
git add .
git commit -m "feat(redesign): update content"

# 2. Push to main (triggers CI/CD)
git push origin main

# 3. Monitor in Actions tab
# GitHub UI → Actions → Deploy GetUpSoft Site

# 4. Verify deployment
curl https://getupsoft.com/redesign/

# 5. Monitor health on server
ssh deploy@host
docker ps | grep getupsoft-site-web
docker logs getupsoft-site-web
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check build logs
docker build -t getupsoft-site:latest . --verbose

# Check container logs
docker logs getupsoft-site-web
```

### Health Check Failing

```bash
# Test endpoint directly
docker exec getupsoft-site-web wget -O - http://localhost/health

# Check nginx configuration
docker exec getupsoft-site-web nginx -t

# View error logs
docker exec getupsoft-site-web tail -f /var/log/nginx/error.log
```

### Deployment Not Triggering

```bash
# Verify workflow file exists
test -f .github/workflows/deploy-getupsoft-site.yml

# Check trigger conditions:
# 1. Push to 'main' branch
# 2. Changes in 01_Core_Platform/getupsoft-site/**
```

### Environment Variables Not Working

```bash
# Verify .env file exists and has no spaces
cat .env.production | grep "VITE_"

# Load and verify
export $(cat .env.production | xargs)
echo $VITE_ODOO_HOST

# Check Docker Compose config
docker-compose -f docker-compose.prod.yml config | grep VITE_
```

---

## Success Criteria

- [x] Docker image builds successfully
- [x] Docker Compose dev environment runs
- [x] Docker Compose prod environment has health checks
- [x] GitHub Actions workflow configured
- [ ] Secrets configured in GitHub Actions
- [ ] Deployment tested and verified
- [ ] Health endpoint returns 200
- [ ] Container logs show no errors
- [ ] Production site accessible
- [ ] Cache purge working

---

## Next Steps (Phase 5)

- [ ] Lighthouse performance audit
- [ ] WCAG AA accessibility scan
- [ ] Security audit
- [ ] Load testing
- [ ] Backup & recovery procedures
- [ ] Incident response plan

---

_Phase 4 DevOps v1.0 · Updated 2026-05-19_
