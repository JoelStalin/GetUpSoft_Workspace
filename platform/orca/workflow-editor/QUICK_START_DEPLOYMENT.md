# Quick Start Deployment Guide - Phase 10 to Staging

**Purpose:** Deploy Phase 10 to staging environment in 30-45 minutes  
**Audience:** DevOps Engineer, Deployment Lead  
**Estimated Time:** 30-45 minutes total  
**Rollback Plan:** See section 5  
**Reference:** DEPLOYMENT_ACTION_PLAN.md for detailed checklist

---

## Prerequisites (Verify Before Starting)

- [ ] Phase 10 code committed: All tests passing (117/117)
- [ ] Branch up-to-date: `git status` shows "Your branch is up to date"
- [ ] Access ready: SSH keys, Docker registry credentials, Kubernetes access
- [ ] Staging environment: Accessible and running
- [ ] Monitoring setup: Datadog/equivalent dashboard ready
- [ ] Communication: Notify team in #phase-11 Slack channel

---

## Quick Deploy Steps (Choose One Method)

### Method 1: SCP/SFTP Deployment (Simplest - 5 min)

**1. Build the application**
```bash
cd apps/orca/workflow-editor
npm install
npm run build
```

Expected output:
- Bundle size: ~901KB uncompressed, ~269KB gzip
- Build time: <30 seconds
- No TypeScript errors

**2. Copy to staging server**
```bash
scp -r dist/* staging-user@staging.getupsoft.com:/var/www/orca-editor/
```

**3. Verify deployment**
```bash
# From staging server:
ls -lah /var/www/orca-editor/
# Should see: index.html, main.[hash].js, style.[hash].css
```

**4. Access the app**
```
https://staging-orca.getupsoft.com
```

---

### Method 2: Docker Deployment (15 min)

**1. Build Docker image**
```bash
cd apps/orca/workflow-editor
docker build -t orca-editor:phase10 .
```

**2. Push to staging registry**
```bash
docker tag orca-editor:phase10 staging-registry.getupsoft.com/orca-editor:phase10
docker push staging-registry.getupsoft.com/orca-editor:phase10
```

**3. Run container**
```bash
docker run -d \
  --name orca-phase10 \
  -p 8080:80 \
  -e NODE_ENV=staging \
  staging-registry.getupsoft.com/orca-editor:phase10
```

**4. Verify**
```bash
docker ps | grep orca
curl http://localhost:8080/
```

---

### Method 3: Kubernetes Deployment (10 min)

**1. Update image in k8s deployment**
```bash
kubectl set image deployment/orca-editor \
  orca-editor=staging-registry.getupsoft.com/orca-editor:phase10 \
  -n staging
```

**2. Wait for rollout**
```bash
kubectl rollout status deployment/orca-editor -n staging
```

**3. Verify**
```bash
kubectl get pods -n staging | grep orca
kubectl logs deployment/orca-editor -n staging
```

---

## Post-Deployment Verification (5 min)

After choosing a deployment method, run these checks:

### 1. Application Loading

```bash
# Test URL accessibility
curl -I https://staging-orca.getupsoft.com/
# Expected: HTTP 200 OK

# Or open in browser and check:
# - Page loads within 2-3 seconds
# - No 404 errors in network tab
# - Logo/header visible
```

### 2. All 4 Modes Loading

In browser console at `https://staging-orca.getupsoft.com/`:

```javascript
// Test each mode loading
// Press keyboard shortcuts or click buttons:
// 1 = Workflow mode (default)
// 2 = Web Design mode
// 3 = Mobile Design mode
// 4 = AI mode

// Expected: Each mode loads in <1000ms, no console errors
// Check F12 → Console for any errors
```

### 3. Performance Check

```bash
# F12 → Lighthouse → Analyze
# Expected:
# - Load time: 1.5-3.0 seconds
# - Lighthouse score: >75
# - FCP: <2s, LCP: <3s
```

### 4. Analytics Verification

```bash
# F12 → Network tab
# Load page and check for:
# - POST /api/analytics calls (should see these)
# - Status: 200 OK
# - Response: Valid JSON
```

---

## If Deployment Fails

### Issue: 404 Not Found

**Cause:** Files not uploaded correctly  
**Solution:**
```bash
# Verify files were copied
ls -la /var/www/orca-editor/
# Should show: index.html, main.*.js, style.*.css

# Re-deploy
npm run build
scp -r dist/* staging-user@staging.getupsoft.com:/var/www/orca-editor/
```

### Issue: Blank Page / JS Errors

**Cause:** Build artifacts missing or corrupted  
**Solution:**
```bash
# Rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build

# Verify bundle
npm run build -- --report
# Check dist/report.html for any issues
```

### Issue: Mode Switching Slow or Breaking

**Cause:** Likely lazy-loading configuration issue  
**Solution:**
```bash
# Check webpack config for code splitting
npm run build -- --report

# Look for suspicious chunk sizes in report.html
# Re-deploy after fix
```

---

## Rollback Plan

If critical issues found in staging, rollback to previous version:

```bash
# Get previous image/commit
git log --oneline -5
git checkout <previous-commit>

# Rebuild and redeploy
npm install
npm run build
scp -r dist/* staging-user@staging.getupsoft.com:/var/www/orca-editor/

# Or for Docker:
docker run -d -p 8080:80 staging-registry/orca-editor:<previous-tag>
```

---

## Next Steps

1. ✅ Deployment complete → Run POST_DEPLOYMENT_QA_CHECKLIST.md (4-6 hours)
2. ✅ QA passes → Monitor for 24-48 hours
3. ✅ Monitoring passes → Ready for Phase 11 kick-off (2026-05-27)

---

## Troubleshooting Reference

For detailed troubleshooting, see: TROUBLESHOOTING_GUIDE.md

Common issues:
- Bundle size: Check webpack analyzer output
- Performance: Check Lighthouse report
- Mode switching: Check Console for errors
- Analytics: Check Network tab for API calls

---

**Deployment Started:** [Timestamp]  
**Deployment Completed:** [Timestamp]  
**Verified By:** [Name]  
**Status:** ✅ Ready for QA  

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Last Updated:** 2026-05-24  
**Owner:** DevOps Team
