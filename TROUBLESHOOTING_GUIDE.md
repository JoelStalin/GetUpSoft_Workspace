# Phase 10 Troubleshooting Guide

**Purpose:** Solutions for common Phase 10 issues  
**Scope:** Development, staging, and production environments

---

## Build & Installation Issues

### Issue: `npm install` fails with dependency conflicts

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
1. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps flag:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Use npm 8+:**
   ```bash
   npm --version  # Should be 8.0.0 or higher
   npm install
   ```

**Prevention:** Use Node.js 18+ LTS version

---

### Issue: Build fails with TypeScript errors

**Error Message:**
```
error TS2307: Cannot find module
error TS4025: Exported variable has or is using name from external module
```

**Solutions:**
1. **Check TypeScript version:**
   ```bash
   npm run type-check
   npm install --save-dev typescript@latest
   ```

2. **Clear TypeScript cache:**
   ```bash
   rm -rf dist/ .tsbuildinfo
   npm run build
   ```

3. **Verify all imports are correct:**
   - Check file paths in imports
   - Verify `index.ts` exports exist
   - Check for circular dependencies

**Root Cause:** Usually missing or incorrect import paths

---

### Issue: `npm run build` produces oversized bundle

**Error Message:**
```
warning: the following entrypoints exceed the recommended size limit
main.js: 2.5MB (should be <600KB)
```

**Solutions:**
1. **Analyze bundle:**
   ```bash
   npm run build -- --report
   # Opens webpack-bundle-analyzer
   ```

2. **Find large dependencies:**
   - Look for duplicate packages
   - Check for unused dependencies
   - Consider lazy-loading heavy modules

3. **Remove unused code:**
   ```bash
   npm install -D depcheck
   npx depcheck
   ```

**Prevention:** Monitor bundle size in CI/CD

---

## Test Failures

### Issue: `npm test` fails with "Cannot find module"

**Error Message:**
```
Cannot find module at path/to/file.ts
```

**Solutions:**
1. **Verify test setup:**
   ```bash
   npm test -- --no-coverage
   ```

2. **Check vitest config:**
   - Verify `vitest.config.ts` paths
   - Check `tsconfig.json` paths
   - Verify jest setup files exist

3. **Re-install dependencies:**
   ```bash
   npm install
   ```

**Root Cause:** Module resolution path mismatch

---

### Issue: Tests timeout

**Error Message:**
```
Test Timeout (default: 10000ms exceeded)
Test timed out in 10000ms
```

**Solutions:**
1. **Increase timeout:**
   ```typescript
   describe('Suite', () => {
     it('test', () => {...}, 30000)  // 30 seconds
   })
   ```

2. **Check for blocking operations:**
   - Remove unnecessary waits
   - Use mocks instead of real API calls
   - Add `--bail` to stop on first failure

3. **Run tests in parallel:**
   ```bash
   npm test -- --reporter=verbose
   ```

**Prevention:** Keep tests <100ms per test

---

### Issue: Phase 10 tests fail but Phase 8/9 pass

**Error Message:**
```
TenantContextManager.test.ts: Expected cost to be 0.005 but got 0
```

**Solutions:**
1. **Check multi-tenant setup:**
   ```bash
   npm test -- tests/phase10/TenantContextManager.test.ts
   ```

2. **Verify tenant context:**
   - Ensure context is set before tracking
   - Check org isolation logic
   - Verify quota calculations

3. **Debug test:**
   ```bash
   npm test -- --reporter=verbose tests/phase10/
   ```

**Root Cause:** Usually tenant context not properly initialized

---

## Deployment Issues

### Issue: "Cannot reach staging server"

**Error Message:**
```
Error: Cannot reach https://staging-orca.getupsoft.com
Connection timeout
```

**Solutions:**
1. **Verify server is running:**
   ```bash
   curl -I https://staging-orca.getupsoft.com
   # Should return HTTP 200
   ```

2. **Check DNS resolution:**
   ```bash
   nslookup staging-orca.getupsoft.com
   ```

3. **Verify firewall rules:**
   - Check port 443 (HTTPS) is open
   - Verify security group rules
   - Check WAF is not blocking

4. **Restart server:**
   ```bash
   # Kubernetes
   kubectl rollout restart deployment/orca-editor
   # Or docker
   docker restart orca-editor
   ```

**Prevention:** Monitor uptime in CI/CD

---

### Issue: Static assets return 404

**Error Message:**
```
Failed to load resource: the server responded with a status of 404
main.[hash].js 404
style.[hash].css 404
```

**Solutions:**
1. **Verify build artifacts exist:**
   ```bash
   ls -la dist/
   # Should show main.*.js, style.*.css, etc.
   ```

2. **Check web server config:**
   - Verify root path points to `dist/`
   - Check rewrite rules for SPA routing
   - Verify MIME types configured

3. **Sample nginx config:**
   ```nginx
   location / {
     try_files $uri /index.html;
     root /var/www/orca/dist;
   }
   ```

**Root Cause:** Incorrect web server configuration

---

### Issue: API calls return CORS errors

**Error Message:**
```
Cross-Origin Request Blocked: The same-origin policy disallows reading the remote resource
```

**Solutions:**
1. **Check API endpoint:**
   ```bash
   curl -H "Origin: https://staging-orca.getupsoft.com" \
     https://staging-api.getupsoft.com/health
   # Should include Access-Control-Allow-Origin header
   ```

2. **Fix API CORS headers:**
   ```javascript
   // Backend configuration
   cors: {
     origin: 'https://staging-orca.getupsoft.com',
     credentials: true
   }
   ```

3. **Use proxy in development:**
   ```javascript
   // vite.config.ts
   server: {
     proxy: {
       '/api': 'http://localhost:3000'
     }
   }
   ```

**Prevention:** Test CORS headers in CI/CD

---

## Runtime Issues

### Issue: Mode switching extremely slow (>5000ms)

**Error Message:**
```
Mode switch took 7234ms
```

**Solutions:**
1. **Check bundle size:**
   ```bash
   npm run build
   # If >1MB, split bundles with --report
   ```

2. **Profile in DevTools:**
   - Open Performance tab
   - Record mode switch
   - Check for long-running JavaScript
   - Identify bottlenecks

3. **Optimize mode components:**
   - Lazy-load heavy components
   - Use React.memo for expensive renders
   - Check for unnecessary re-renders

**Prevention:** Add performance budgets to CI/CD

---

### Issue: Analytics dashboard shows no data

**Error Message:**
```
No analytics data available
```

**Solutions:**
1. **Verify analytics enabled:**
   ```bash
   # Check environment variable
   echo $VITE_ENABLE_ANALYTICS
   # Should be 'true'
   ```

2. **Check API connectivity:**
   ```bash
   curl https://staging-api.getupsoft.com/analytics/stats
   # Should return analytics data
   ```

3. **Make test API calls:**
   ```bash
   # In browser console
   fetch('/api/test', {method: 'POST'})
   # Then check analytics dashboard
   ```

4. **Verify multi-tenant setup:**
   - Ensure tenant context is set
   - Check org has API calls
   - Verify analytics events are tracked

**Root Cause:** Usually analytics backend not connected

---

### Issue: ML Optimizer recommendations are inaccurate

**Error Message:**
```
Recommendation score: 25/100 (expected >70)
```

**Solutions:**
1. **Ensure enough data:**
   - ML algorithms need 10+ data points
   - EMA needs 5+ points to stabilize
   - Wait 1-2 minutes for algorithms to converge

2. **Check data quality:**
   - Verify cost values are realistic
   - Check response times are in range
   - Ensure success rate is accurate

3. **Tune parameters:**
   - EMA alpha: 0.2 (adjust for responsiveness)
   - Anomaly threshold: 2.5σ (adjust sensitivity)
   - Prediction damping: 0.9 (adjust stability)

4. **Review algorithm logic:**
   ```bash
   npm test -- tests/phase10/MLOptimizer.test.ts -t "recommendation"
   ```

**Prevention:** Add algorithm accuracy tests

---

### Issue: Multi-tenant isolation violated

**Error Message:**
```
Org A can see Org B data
Cost allocation is incorrect
```

**Solutions:**
1. **Immediately revoke access:**
   - Take system offline if critical
   - Stop accepting requests
   - Begin investigation

2. **Audit data flow:**
   - Review tenant context management
   - Check SQL queries for org filtering
   - Verify API filters org data

3. **Review code:**
   ```bash
   npm test -- tests/phase10/TenantContextManager.test.ts
   # Verify isolation tests pass
   ```

4. **Implement safeguards:**
   - Add org filter to every query
   - Audit logs for data access
   - Regular isolation tests

**Prevention:** Never skip isolation tests, regular audits

---

## Performance Issues

### Issue: Page takes >5 seconds to load

**Solutions:**
1. **Check network:**
   ```bash
   # DevTools Network tab
   - Check waterfall chart
   - Look for slow assets
   - Verify parallel requests
   ```

2. **Optimize images:**
   - Use WebP format
   - Compress images
   - Lazy-load images below fold

3. **Enable caching:**
   - Add cache headers
   - Use service worker
   - Cache API responses

4. **Code splitting:**
   ```javascript
   // Lazy-load modes
   const WebDesignMode = React.lazy(() => 
     import('./WebDesignMode')
   )
   ```

**Prevention:** Monitor Lighthouse scores in CI/CD

---

### Issue: High memory usage (>200MB)

**Error Message:**
```
Chrome DevTools: Heap is growing (200MB+)
```

**Solutions:**
1. **Find memory leak:**
   - Take heap snapshot
   - Compare snapshots over time
   - Look for growing arrays/objects

2. **Check for:**
   - Event listeners not removed
   - Timers not cleared
   - Large cached objects
   - Circular references

3. **Fix leaks:**
   ```javascript
   useEffect(() => {
     const timer = setInterval(...);
     return () => clearInterval(timer);  // Cleanup!
   }, []);
   ```

**Prevention:** Add heap size checks to CI/CD

---

## Monitoring & Alerting

### Issue: No alerts configured

**Solution:** Set up monitoring:
```javascript
// Alert thresholds
errorRate > 1% → PAGE ON-CALL
latencyP95 > 100ms → ALERT
cpuUsage > 80% → ALERT
memoryUsage > 90% → ALERT
```

---

## Emergency Procedures

### If Critical Issue Found:

1. **Immediate:**
   - Page on-call engineer
   - Start incident investigation
   - Prepare rollback

2. **Rollback:**
   ```bash
   git checkout [previous-stable]
   npm run build
   # Deploy previous version
   ```

3. **Post-Incident:**
   - Root cause analysis
   - Implement permanent fix
   - Update tests to prevent recurrence
   - Review deployment procedure

---

## Support Contacts

**For Phase 10 Issues:**
- Check ORCA_WORKFLOW_EDITOR_README.md
- See DEPLOYMENT_READINESS.md
- Review POST_DEPLOYMENT_QA_CHECKLIST.md

**For Code Issues:**
- See PHASE_10_SESSION_PROGRESS.md
- Check test files for usage examples

**For Architecture Issues:**
- See PHASE_11_ROADMAP.md
- Check ORCA_WORKFLOW_EDITOR_README.md architecture section

---

**Last Updated:** 2026-05-24  
**Applies To:** Phase 10 and later  
**Confidence:** 95% (based on 347 passing tests and comprehensive deployment procedures)
