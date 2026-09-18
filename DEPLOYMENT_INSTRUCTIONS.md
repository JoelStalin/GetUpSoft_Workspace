# 🚀 Website Redesign Deployment Instructions

## Overview
This document contains all necessary steps to deploy the GetUpSoft website redesign to production. The redesign includes:
- Google Cloud-inspired colorful, minimalist aesthetic
- Light theme throughout all pages
- New Privacy Policy page
- New Terms of Service page
- Updated layouts and components

## Prerequisites
- SSH access to production server: `192.168.1.233` (ubuntu user)
- Docker and Docker Compose installed
- Git repository access
- npm/Node.js installed

## Deployment Steps

### Step 1: Connect to Server
```bash
ssh -i ~/.ssh/id_getupsoft_cloudflare ubuntu@192.168.1.233
```

### Step 2: Navigate to Workspace
```bash
cd /app/getupsoft-workspace
```

### Step 3: Pull Latest Changes from GitHub
```bash
git pull origin main
```

**Expected Output:**
```
From https://github.com/JoelStalin/GetUpSoft_Workspace
   5e918503f..b19406a6d  main -> main
Updating 5e918503f..b19406a6d
Fast-forward
 01_Core_Platform/getupsoft-site/src/components/GlobalLayout.tsx    | 85 ++---
 01_Core_Platform/getupsoft-site/src/components/RDLayout.tsx        | 85 ++---
 01_Core_Platform/getupsoft-site/src/components/SiteLayout.tsx      | 88 ++---
 01_Core_Platform/getupsoft-site/src/pages/Home.tsx                 | 220 +++++++++++
 01_Core_Platform/getupsoft-site/src/pages/PrivacyPolicy.tsx        | 265 ++++++++++++
 01_Core_Platform/getupsoft-site/src/pages/TermsOfService.tsx       | 347 ++++++++++++++++
 01_Core_Platform/getupsoft-site/src/pages/global/Home.tsx          | 142 +++----
 01_Core_Platform/getupsoft-site/src/routes.tsx                     |  4 +
 01_Core_Platform/getupsoft-site/src/styles.css                     | 125 +++++++
 01_Core_Platform/getupsoft-site/tailwind.config.ts                 |  32 ++---
```

### Step 4: Navigate to Website Directory
```bash
cd 01_Core_Platform/getupsoft-site
```

### Step 5: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 6: Build the Website
```bash
npm run build
```

**Expected Output:**
```
> tsc --noEmit && vite build

vite v5.4.21 building for production...
transforming...
✓ 98 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.49 kB │ gzip:   0.32 kB
dist/assets/index-*.css          38.80 kB │ gzip:   7.18 kB
dist/assets/index-*.js           341.26 kB │ gzip: 104.97 kB
✓ built in 24.88s
```

### Step 7: Rebuild Docker Container
```bash
docker build -t getupsoft-site:latest .
```

**Expected Output:**
```
[+] Building 45.2s
 => [internal] load .dockerignore
 => [internal] load build context
 ...
 => => naming to docker.io/library/getupsoft-site:latest
```

### Step 8: Stop and Restart Container
```bash
# Stop current container
docker compose -f docker-compose.prod.yml down

# Start with new build
docker compose -f docker-compose.prod.yml up -d
```

**Expected Output:**
```
[+] Running 2/2
 ✓ Network getupsoft-network  Created
 ✓ Container getupsoft-site   Started
```

### Step 9: Verify Deployment
```bash
# Check container status
docker ps | grep getupsoft-site

# Test health endpoint
curl http://localhost:3120/health

# Check website is accessible
curl -s http://localhost:3120 | head -20
```

**Expected Output:**
```
CONTAINER ID   IMAGE                  STATUS          PORTS
abc12345def    getupsoft-site:latest  Up 2 seconds    0.0.0.0:3120->3120/tcp

{"status":"ok"}
```

## Verification Checklist

After deployment, verify the following:

### Homepage
- [ ] Visit https://getupsoft.com (or http://localhost:3120)
- [ ] Check light theme is applied
- [ ] Verify colorful gradients display correctly
- [ ] Test button hover effects
- [ ] Verify responsive design on mobile

### New Pages
- [ ] Privacy Policy: https://getupsoft.com/privacy
  - [ ] All sections display properly
  - [ ] GDPR section visible
  - [ ] CCPA section visible
  - [ ] Contact information correct

- [ ] Terms of Service: https://getupsoft.com/terms
  - [ ] All sections display properly
  - [ ] Payment terms section visible
  - [ ] Service availability (99.9% uptime) stated
  - [ ] Legal contact information correct

### Navigation
- [ ] Footer links point to /privacy and /terms
- [ ] RD portal footer has Privacy/Terms links
- [ ] Global portal footer has Privacy/Terms links

### Performance
- [ ] CSS files load correctly (38.80 kB gzipped)
- [ ] JavaScript bundles load correctly (341.26 kB gzipped)
- [ ] Images and assets load without errors
- [ ] No console errors in browser DevTools

### Docker Status
```bash
# Check logs
docker logs getupsoft-site

# Check container resource usage
docker stats getupsoft-site

# Verify volumes mounted correctly
docker inspect getupsoft-site | grep -A 5 "Mounts"
```

## Rollback Instructions

If deployment fails, rollback to previous version:

```bash
# Stop current container
docker compose -f docker-compose.prod.yml down

# Revert Git changes
git reset --hard HEAD~2

# Rebuild with previous version
docker build -t getupsoft-site:previous .
docker compose -f docker-compose.prod.yml up -d
```

## Deployment Summary

### Changed Files
- `tailwind.config.ts` - Updated color palette
- `src/styles.css` - Light theme CSS
- `src/pages/Home.tsx` - Redesigned homepage
- `src/pages/PrivacyPolicy.tsx` - NEW
- `src/pages/TermsOfService.tsx` - NEW
- `src/pages/global/Home.tsx` - Light theme update
- `src/components/GlobalLayout.tsx` - Updated layout
- `src/components/RDLayout.tsx` - Updated layout
- `src/components/SiteLayout.tsx` - Updated layout
- `src/routes.tsx` - Added new routes

### New Colors (Google Cloud Palette)
- Primary Blue: `#3B82F6`
- Purple: `#A855F7`
- Orange: `#F97316`
- Green: `#10B981`
- Cyan: `#06B6D4`
- Red: `#EF4444`

### New Routes
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

## Support

If you encounter issues during deployment:

1. Check Docker logs: `docker logs getupsoft-site`
2. Verify npm build: `npm run build` (locally)
3. Check network connectivity: `curl http://localhost:3120`
4. Review Git status: `git status`
5. Check disk space: `df -h`

For additional support, contact the development team.

---

**Deployment Date:** 2026-05-19
**Deployed By:** Claude Code
**Commit:** b19406a6d
**Status:** Ready for Production
