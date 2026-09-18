# Quick Start: Deploy Phase 10 to Staging

**Purpose:** Step-by-step instructions for deployment team  
**Estimated Time:** 30-45 minutes  
**Target:** Staging environment  
**Prerequisites:** Deployment credentials, staging server access

---

## Pre-Deployment Checklist (5 minutes)

```bash
# 1. Verify code is on main branch
git status
# Expected: On branch main, Your branch is up to date with 'origin/main'

# 2. Pull latest Phase 10 code
git pull origin main

# 3. Verify tests pass locally
cd apps/orca/workflow-editor
npm test
# Expected: 347/347 tests passing

# 4. Build for production
npm run build
# Expected: dist/ folder created, ~901KB bundle
```

If all checks pass, proceed to deployment.

---

## Step 1: Environment Setup (5 minutes)

### 1.1 Clone/Pull Code
```bash
cd /deployment/orca
git pull origin main
```

### 1.2 Install Dependencies
```bash
cd apps/orca/workflow-editor
npm install
```

### 1.3 Build Production Bundle
```bash
npm run build
# Output: dist/ directory with production bundle
# Size: 901KB uncompressed, 269KB gzipped
```

---

## Step 2: Pre-Staging Verification (5 minutes)

### 2.1 Verify Build Output
```bash
ls -lh dist/
# Expected: index.html, main.[hash].js, style.[hash].css, etc.
```

### 2.2 Run Smoke Tests
```bash
npm test -- --reporter=verbose 2>&1 | tail -20
# Expected: All tests passing, no errors in console
```

### 2.3 Type Check
```bash
npm run type-check
# Expected: 0 TypeScript errors
```

---

## Step 3: Deploy to Staging Server (10 minutes)

### 3.1 Upload Build to Staging

**Option A: SCP/SFTP**
```bash
scp -r dist/* staging-server:/var/www/orca-workflow-editor/
```

**Option B: Docker**
```bash
docker build -t orca-workflow-editor:phase10 .
docker push staging-registry/orca-workflow-editor:phase10
docker run -d -p 8080:80 staging-registry/orca-workflow-editor:phase10
```

**Option C: Kubernetes**
```bash
kubectl set image deployment/orca-editor \
  orca-editor=staging-registry/orca-workflow-editor:phase10
```

### 3.2 Configure Environment

```bash
# Set environment variables on staging server
export API_BASE_URL=https://staging-api.getupsoft.com
export ENABLE_ANALYTICS=true
export ML_OPTIMIZER_ENABLED=true
export MULTI_TENANT_ENABLED=true

# Or add to .env file
cat > staging/.env << EOF
VITE_API_BASE_URL=https://staging-api.getupsoft.com
VITE_ENABLE_ANALYTICS=true
VITE_ML_OPTIMIZER_ENABLED=true
VITE_MULTI_TENANT_ENABLED=true
EOF
```

### 3.3 Verify Deployment

```bash
# Check server is running
curl -I https://staging-orca.getupsoft.com
# Expected: HTTP 200 OK

# Check no console errors
# Open browser console (F12) at https://staging-orca.getupsoft.com
# Expected: No red errors, only info/warnings expected
```

---

## Step 4: Basic Functionality Testing (10 minutes)

### 4.1 Verify Application Loads
1. Navigate to https://staging-orca.getupsoft.com
2. Expected: Page loads within 3 seconds
3. Expected: No 404 or 500 errors

### 4.2 Test Mode Switching
1. Press `1` → Web Design Mode (should load)
2. Press `2` → Workflow Mode (should load)
3. Press `3` → Mobile Design Mode (should load)
4. Press `4` → AI Mode (should load)
5. All mode switches should complete in <1000ms

### 4.3 Test Analytics Dashboard (if enabled)
1. Navigate to Analytics section
2. Verify metrics display: Cost, Requests, Response Time, Cache Hit Rate, Error Rate
3. Verify charts render: Cost Trend, Request Volume
4. Verify export buttons work: CSV, PDF

### 4.4 Test Multi-Tenant Isolation (if enabled)
1. Create two test organizations
2. Verify cost tracking per org is isolated
3. Verify quotas are enforced per tier

### 4.5 Check Browser Console
```javascript
// Open F12 Developer Tools → Console
// Expected: Only informational messages, NO RED ERRORS
// Common info messages:
// - [Analytics] SESSION_START
// - Rate limit set for [provider]
// - ML Optimizer initialized
```

---

## Step 5: Performance Validation (5 minutes)

### 5.1 Page Load Performance
- Lighthouse score: Target >85
- Time-to-interactive: <3 seconds
- First Contentful Paint: <1 second

### 5.2 API Response Times
- Mode switching: <1000ms
- Analytics update: <2000ms
- ML recommendations: <500ms

### 5.3 Bundle Analysis
```bash
# If using webpack-bundle-analyzer
npm run build -- --report
# Expected: No package bloat, main bundle <1MB uncompressed
```

---

## Step 6: Setup Monitoring (5 minutes)

### 6.1 Enable Error Tracking
```javascript
// Add to staging configuration
window.errorTracking = {
  enabled: true,
  endpoint: 'https://staging-errors.getupsoft.com/api',
  sampleRate: 1.0  // Capture 100% on staging
}
```

### 6.2 Configure Metrics Collection
- CPU usage monitoring
- Memory usage monitoring
- API response time tracking
- Error rate tracking

### 6.3 Setup Alerts
- Alert if error rate > 1%
- Alert if response time p95 > 100ms
- Alert if CPU > 80%
- Alert if memory > 90%

---

## Step 7: Documentation & Sign-Off (5 minutes)

### 7.1 Document Deployment
```markdown
## Deployment Record

- **Date:** [Date]
- **Version:** Phase 10
- **Server:** [Staging Server URL]
- **Build:** 901KB (269KB gzip)
- **Tests Passed:** 347/347
- **Verified By:** [Your Name]
- **Date Verified:** [Date]
```

### 7.2 Notify Stakeholders
- [ ] Product team - Feature available in staging
- [ ] QA team - Ready for testing
- [ ] Support team - Feature overview
- [ ] Dev team - Available for testing

### 7.3 Provide Access Links
- Staging URL: https://staging-orca.getupsoft.com
- API Docs: https://staging-api-docs.getupsoft.com
- Analytics Dashboard: https://staging-orca.getupsoft.com/analytics
- Mode Selection: Press 1-4 to switch modes

---

## Troubleshooting

### Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Fail After Deployment
```bash
# Re-run tests
npm test

# Check for console errors
npm run build
# Look for TypeScript errors in build output
```

### Mode Switching Not Working
- Check browser console (F12)
- Verify all mode components are loaded
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

### Analytics Not Showing Data
- Verify VITE_ENABLE_ANALYTICS=true
- Check API connection to analytics backend
- Verify multi-tenant context is set
- Check browser console for errors

### Performance Issues
```bash
# Run performance analysis
npm run build -- --report

# Check bundle size
ls -lh dist/

# Expected: ~269KB gzip total
```

---

## Rollback Plan

If critical issues found in staging:

### Quick Rollback
```bash
# Revert to previous version
git checkout [previous-commit]
npm run build
# Re-deploy with previous build
```

### Full Rollback
```bash
# Use deployment system to rollback
kubectl rollout undo deployment/orca-editor
# or
docker run -d -p 8080:80 staging-registry/orca-workflow-editor:phase9-latest
```

---

## Success Criteria

Deployment is successful when:

- [x] Application loads without 404/500 errors
- [x] All 4 modes are accessible and load in <1000ms
- [x] Analytics dashboard displays data (if enabled)
- [x] No red errors in browser console
- [x] Performance metrics meet targets
- [x] All QA tests pass
- [x] Stakeholders are notified

---

## Next Steps After Staging Validation

1. **QA Testing** (4-6 hours)
   - Test all features thoroughly
   - Validate with product team
   - Document any issues

2. **UAT** (1-2 days)
   - Stakeholder validation
   - Business logic verification
   - User experience feedback

3. **Production Rollout** (when approved)
   - Phased deployment (10% → 50% → 100%)
   - Monitor metrics closely
   - Be ready to rollback if issues arise

---

## Contact & Support

**Questions During Deployment?**
- Check DEPLOYMENT_READINESS.md for detailed procedures
- See ORCA_WORKFLOW_EDITOR_README.md for architecture
- Review WORKSPACE_BLOCKER_DOCUMENTATION.md if git issues arise

**For Phase 10 Details:**
- PHASE_10_SESSION_PROGRESS.md - Implementation details
- ORCA_WORKFLOW_EDITOR_README.md - Complete reference

---

**Estimated Total Time:** 30-45 minutes  
**Difficulty:** Medium  
**Risk Level:** Low (comprehensive testing before deployment)

**When ready to proceed:** Follow these steps in order, verify each step passes before moving to next step.
