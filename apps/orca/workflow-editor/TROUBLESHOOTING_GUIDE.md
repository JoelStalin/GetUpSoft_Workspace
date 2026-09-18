# Troubleshooting Guide - ORCA Workflow Editor Phase 10

**Purpose:** Resolve common issues with Phase 10 deployment and runtime  
**Audience:** DevOps, QA, Developers  
**Status:** Comprehensive (Last Updated: 2026-05-24)

---

## Quick Troubleshooting Index

| Issue | Severity | Resolution Time | Link |
|-------|----------|-----------------|------|
| Page won't load (404) | Critical | 5 min | [Section 1](#1-deployment--infrastructure-issues) |
| Blank page / JS errors | Critical | 10 min | [Section 2](#2-javascript--build-issues) |
| Mode switching broken | High | 15 min | [Section 3](#3-mode-switching-issues) |
| Slow performance | High | 30 min | [Section 4](#4-performance-issues) |
| Analytics not working | Medium | 20 min | [Section 5](#5-analytics--api-issues) |
| Styling looks wrong | Medium | 10 min | [Section 6](#6-ui--styling-issues) |
| Memory leak / crashes | Critical | 30 min | [Section 7](#7-stability--memory-issues) |

---

## 1. Deployment & Infrastructure Issues

### Issue: 404 Not Found

**Symptoms:** 
- URL shows "Cannot GET /" 
- Blank page with 404 error

**Diagnosis:**
```bash
# Check if files exist on server
ls -la /var/www/orca-editor/
# Expected: index.html, main.*.js, style.*.css, etc.

# Check web server logs
tail -50 /var/log/nginx/error.log  # For nginx
tail -50 /var/log/apache2/error.log  # For Apache
```

**Solutions:**

1. **Files not deployed:**
   ```bash
   # Rebuild locally
   cd apps/orca/workflow-editor
   rm -rf dist
   npm install
   npm run build
   
   # Redeploy
   scp -r dist/* user@server:/var/www/orca-editor/
   ```

2. **Wrong deployment path:**
   ```bash
   # Verify nginx/Apache config points to correct directory
   grep -r "orca-editor" /etc/nginx/sites-enabled/
   # Should show: root /var/www/orca-editor;
   
   # Or check Docker volume mount
   docker inspect <container-id> | grep -A5 Mounts
   ```

3. **Missing index.html:**
   ```bash
   # Rebuild forces index.html generation
   npm run build
   # Verify it exists
   ls -la dist/index.html
   ```

**Prevention:** Always run `npm run build` before deployment and verify `dist/` contents.

---

### Issue: HTTPS Redirect Loop

**Symptoms:**
- URL keeps redirecting to itself
- Browser shows warning: "Too many redirects"

**Diagnosis:**
```bash
# Check CloudFlare settings (if used)
# Settings → SSL/TLS should be "Full" or "Full Strict"

# Check nginx config
grep -A5 "server {" /etc/nginx/sites-enabled/orca
# Should show: server_name staging-orca.getupsoft.com;
```

**Solutions:**

1. **CloudFlare SSL setting wrong:**
   - Login to CloudFlare
   - Go to SSL/TLS settings
   - Change from "Flexible" to "Full"
   - Wait 5 minutes for propagation

2. **Nginx redirect loop:**
   ```bash
   # Edit nginx config
   sudo nano /etc/nginx/sites-enabled/orca
   
   # Add this (prevents redirect loop):
   server {
       if ($http_x_forwarded_proto != "https") {
           return 301 https://$server_name$request_uri;
       }
   }
   ```

---

### Issue: Connection Refused / Cannot Connect

**Symptoms:**
- "ERR_CONNECTION_REFUSED"
- Server appears offline

**Diagnosis:**
```bash
# Check if server is running
ping staging-orca.getupsoft.com
curl -I https://staging-orca.getupsoft.com

# Check DNS resolution
nslookup staging-orca.getupsoft.com
dig staging-orca.getupsoft.com
```

**Solutions:**

1. **Server down:**
   ```bash
   # Restart web server
   sudo systemctl restart nginx  # or apache2
   
   # Check status
   sudo systemctl status nginx
   # Should show: active (running)
   ```

2. **Wrong DNS:**
   ```bash
   # Flush DNS cache (client side)
   # macOS:
   sudo dscacheutil -flushcache
   
   # Windows:
   ipconfig /flushdns
   
   # Linux:
   sudo systemctl restart systemd-resolved
   ```

3. **Firewall blocking:**
   ```bash
   # Check if port 443 (HTTPS) is open
   sudo ufw status
   # Should show: 443/tcp ALLOW
   
   # If not:
   sudo ufw allow 443/tcp
   sudo ufw allow 80/tcp
   ```

---

## 2. JavaScript & Build Issues

### Issue: Blank Page / No Content Renders

**Symptoms:**
- Page loads (no 404)
- But completely blank
- Console shows JS errors

**Diagnosis:**
```javascript
// Open F12 → Console and check for errors
// Common patterns:
// - Uncaught ReferenceError: X is not defined
// - Cannot read property 'X' of undefined
// - React errors (if using React)
```

**Solutions:**

1. **Missing chunks/JS files:**
   ```bash
   # Check if all chunks are included in dist/
   ls dist/ | grep ".js"
   
   # If missing, rebuild
   npm run build
   ```

2. **Incorrect asset paths:**
   ```bash
   # Edit vite.config.ts or webpack.config.js
   # Make sure publicPath is correct:
   export default {
     build: {
       outDir: 'dist',
       assetsDir: 'assets',  // Correct path
     }
   }
   ```

3. **Corrupted bundle:**
   ```bash
   # Clean and rebuild completely
   rm -rf node_modules dist package-lock.json
   npm install
   npm run build
   
   # Redeploy
   npm run build && scp -r dist/* user@server:/var/www/orca-editor/
   ```

---

### Issue: TypeScript Compilation Errors

**Symptoms:**
- Build fails: "error TS..."
- Build never completes

**Diagnosis:**
```bash
npm run type-check
# Shows list of errors with line numbers
```

**Solutions:**

1. **Fix type errors:**
   ```bash
   # Each error shows file:line:col
   # Edit the file and fix the error
   # Example:
   # src/App.tsx:45:12 - error TS7006: Parameter 'x' implicitly has an 'any' type
   
   # Fix: Add type annotation
   const handler = (x: string) => { ... }
   ```

2. **Ignore specific error (if necessary):**
   ```typescript
   // @ts-ignore-next-line
   const data = unsafeData;
   ```

3. **Install missing types:**
   ```bash
   npm install --save-dev @types/your-package
   ```

---

### Issue: ESLint / Code Style Errors

**Symptoms:**
- Build fails: "Linting errors"
- Code doesn't match style guide

**Diagnosis:**
```bash
npm run lint
# Shows style violations
```

**Solutions:**

1. **Auto-fix most issues:**
   ```bash
   npm run lint -- --fix
   # Automatically corrects formatting issues
   ```

2. **Manual fixes:**
   ```bash
   # Review each error and fix:
   # - Unused variables: remove them
   # - Missing imports: add them
   # - Semicolons: add/remove as needed
   ```

---

## 3. Mode Switching Issues

### Issue: Mode Switch Fails / Throws Error

**Symptoms:**
- Click mode button → nothing happens
- Or console shows error
- Can't switch between modes

**Diagnosis:**
```javascript
// F12 → Console
// Look for errors like:
// Error: Cannot find module './modes/WebDesignMode'
// React Error: Component not found
```

**Solutions:**

1. **Missing mode component files:**
   ```bash
   # Check if all mode files exist
   ls src/components/modes/
   # Should contain:
   # - WebDesignMode.tsx
   # - MobileDesignMode.tsx
   # - AIMode.tsx
   
   # If missing, check git status
   git status src/components/modes/
   # May need to rebuild: npm install
   ```

2. **Import paths wrong:**
   ```typescript
   // Check src/App.tsx imports
   import WebDesignMode from './components/modes/WebDesignMode';
   // Should be correct relative path
   ```

3. **Event listener not working:**
   ```typescript
   // Check keyboard listener in App.tsx
   const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === '1') setMode('workflow');
       if (e.key === '2') setMode('web');
       // etc...
   };
   ```

---

### Issue: Mode Switch Very Slow

**Symptoms:**
- Mode switch takes >2-3 seconds
- UI freezes briefly
- Other interactions lag

**Diagnosis:**
```javascript
// F12 → Performance tab
// Record mode switch and look for:
// - Long JavaScript execution (yellow blocks)
// - Layout recalculations (purple)
// - Long rendering time
```

**Solutions:**

1. **Component re-renders too much:**
   ```typescript
   // Wrap component with React.memo to prevent unnecessary re-renders
   const WebDesignMode = React.memo(() => {
     return <div>...</div>;
   });
   ```

2. **Expensive computation in render:**
   ```typescript
   // Move expensive computations outside render
   const expensiveValue = useMemo(() => {
       return complexCalculation();
   }, [dependencies]);
   ```

3. **Large components not code-split:**
   ```typescript
   // Use lazy loading instead of direct import
   const WebDesignMode = React.lazy(() => 
       import('./components/modes/WebDesignMode')
   );
   ```

---

## 4. Performance Issues

### Issue: Page Takes >3 Seconds to Load

**Symptoms:**
- Slow initial load (FCP >2s, LCP >3s)
- White screen for a while
- Users complain about speed

**Diagnosis:**
```bash
# Run Lighthouse audit
F12 → Lighthouse → Generate report

# Check bundle size
npm run build -- --report
# Opens interactive bundle analysis
```

**Solutions:**

1. **Bundle too large:**
   ```bash
   # Check webpack report for:
   # - Large dependencies (should be <50KB each)
   # - Duplicated modules
   # - Tree-shaking not working
   
   # Remove unused dependencies
   npm prune
   npm audit fix
   ```

2. **Too much JavaScript on critical path:**
   ```typescript
   // Move non-critical code to code-split chunks
   const NonCriticalComponent = React.lazy(() => 
       import('./NonCritical')
   );
   ```

3. **CSS render-blocking:**
   ```html
   <!-- In index.html, prioritize critical CSS -->
   <link rel="preload" as="style" href="/critical.css">
   <link rel="stylesheet" href="/critical.css">
   <link rel="defer" rel="stylesheet" href="/non-critical.css">
   ```

---

### Issue: Mode Switching Animation Janky

**Symptoms:**
- Mode switch stutters/jank
- FPS drops during switch
- Animation appears choppy

**Solutions:**

1. **Use will-change CSS:**
   ```css
   .mode-switch {
       will-change: opacity, transform;
       transition: opacity 0.3s ease;
   }
   ```

2. **Reduce animation complexity:**
   ```typescript
   // Instead of complex animations, use simple fade
   const transition = { opacity: 0.3 };  // Shorter duration
   ```

3. **Offload to GPU:**
   ```css
   .animated {
       transform: translateZ(0);  /* Force GPU acceleration */
       backface-visibility: hidden;
   }
   ```

---

## 5. Analytics & API Issues

### Issue: Analytics Not Sending

**Symptoms:**
- No POST requests to `/api/analytics`
- Analytics dashboard empty
- Data not persisting

**Diagnosis:**
```javascript
// F12 → Network tab
// Filter by "analytics"
// Look for POST requests
// Check response status (should be 200)
```

**Solutions:**

1. **API endpoint not configured:**
   ```bash
   # Check environment variables
   echo $REACT_APP_API_URL
   # Should point to: https://api.getupsoft.com
   
   # Or check src/config/api.ts
   cat src/config/api.ts
   # Should have: ANALYTICS_ENDPOINT: '/api/analytics'
   ```

2. **CORS blocked:**
   ```javascript
   // F12 → Console error:
   // Access to XMLHttpRequest blocked by CORS policy
   
   // Solution: Check backend CORS headers
   # On backend server:
   # Add header: Access-Control-Allow-Origin: https://staging-orca.getupsoft.com
   ```

3. **Network request fails silently:**
   ```typescript
   // Add error handling
   fetch('/api/analytics', {
       method: 'POST',
       body: JSON.stringify(data)
   }).catch(err => {
       console.error('Analytics failed:', err);
       // Fallback: store locally and retry
   });
   ```

---

### Issue: API Responses Slow

**Symptoms:**
- API responses take >500ms
- User sees loading spinners frequently
- Network tab shows slow requests

**Diagnosis:**
```bash
# Check API latency
curl -w "@curl-format.txt" -o /dev/null -s https://api.getupsoft.com/analytics

# Or use load testing tool
ab -n 100 https://api.getupsoft.com/health
```

**Solutions:**

1. **Backend is slow:**
   - Check backend server resources (CPU, memory, disk)
   - Run profiler on backend code
   - Consider caching responses

2. **Network latency:**
   ```bash
   # Check latency from staging server
   ping api.getupsoft.com
   # Should be <50ms
   ```

3. **Missing database indexes:**
   - Check if query needs optimization
   - Add indexes on frequently queried columns

---

## 6. UI & Styling Issues

### Issue: Styling Looks Wrong / Colors Off

**Symptoms:**
- Colors don't match design
- Spacing looks wrong
- Buttons look different

**Diagnosis:**
```javascript
// F12 → Inspect element
// Check computed styles (right panel)
// Compare with design spec
```

**Solutions:**

1. **CSS file not loaded:**
   ```bash
   # Check if style bundle exists
   ls dist/style.*.css
   
   # Check Network tab for 404 on CSS file
   # May need to rebuild:
   npm run build
   ```

2. **CSS specificity wrong:**
   ```css
   /* More specific selector wins */
   /* Check for conflicting classes */
   .button { color: red; }
   .button.primary { color: blue; }  /* This should win */
   ```

3. **Media query not activating:**
   ```css
   /* Check viewport width */
   @media (max-width: 768px) {
       .responsive { display: none; }
   }
   ```

---

### Issue: Icons Not Displaying

**Symptoms:**
- Empty boxes instead of icons
- Or alt text showing

**Diagnosis:**
```javascript
// F12 → Elements tab → find <img> or <svg>
// Check:
// - src attribute correct?
// - File exists in dist/?
// - Network tab shows 404?
```

**Solutions:**

1. **Icon files not bundled:**
   ```bash
   # Check if icons exist in source
   find src -name "*.svg" -o -name "*.png" | head -20
   
   # Check if they're in dist/
   find dist -name "*.svg" | head -20
   
   # Rebuild if missing
   npm run build
   ```

2. **Wrong path in code:**
   ```jsx
   // Check icon imports
   import { IconName } from '@icons';
   // Or
   <img src="/icons/my-icon.svg" />
   // Verify path is relative to public/ or dist/
   ```

---

## 7. Stability & Memory Issues

### Issue: Application Crashes / Freezes

**Symptoms:**
- Page becomes unresponsive
- Have to refresh
- "Page unresponsive" dialog

**Diagnosis:**
```javascript
// F12 → Memory tab
// Take heap snapshot before/after action
// Look for growing memory usage

// Or check browser task manager
// Ctrl+Shift+Esc → Chrome Task Manager
// Look for tabs with high memory
```

**Solutions:**

1. **Memory leak:**
   ```typescript
   // Ensure cleanup in useEffect
   useEffect(() => {
       const listener = () => { ... };
       window.addEventListener('click', listener);
       
       return () => {
           window.removeEventListener('click', listener);  // Cleanup!
       };
   }, []);
   ```

2. **Infinite loop:**
   ```typescript
   // Check state updates don't cause re-renders
   useEffect(() => {
       // Don't update state without dependencies
       setState(newValue);  // WRONG - infinite loop
       
       // Add dependencies
   }, [dependencies]);  // RIGHT
   ```

3. **Too many event listeners:**
   ```typescript
   // Debounce/throttle frequent events
   const handleScroll = debounce(() => {
       // Handle scroll
   }, 100);  // Wait 100ms between calls
   ```

---

### Issue: High CPU Usage

**Symptoms:**
- Fan spins up
- Laptop gets hot
- Browser tab shows "⚠️" in Task Manager

**Diagnosis:**
```javascript
// F12 → Performance tab
// Record for 10 seconds
// Look for long JavaScript blocks (yellow)
// Each block should be <50ms
```

**Solutions:**

1. **Expensive computation in render:**
   ```typescript
   // Move to web worker or use requestAnimationFrame
   const expensiveCalc = useCallback(() => {
       // Use requestAnimationFrame for smooth animation
       requestAnimationFrame(() => {
           // Do calculation
       });
   }, []);
   ```

2. **Polling too frequently:**
   ```typescript
   // Instead of setInterval(check, 100), use:
   useEffect(() => {
       const id = setInterval(check, 5000);  // 5 second polling
       return () => clearInterval(id);
   }, []);
   ```

---

## 8. Monitoring & Diagnostics

### Getting Detailed Error Information

**In Datadog (if configured):**
```
1. Go to Datadog dashboard
2. Filter by: service=orca-editor, env=staging
3. Look at Error Rate widget
4. Click to drill down into specific errors
5. Check stack traces
```

**In Browser DevTools:**
```javascript
// Enable verbose logging
localStorage.setItem('DEBUG', '*');
// Or for specific module:
localStorage.setItem('DEBUG', 'orca:*');

// Reload page and check Console
// Should show detailed debug info
```

**Server Logs:**
```bash
# Tail production logs
tail -f /var/log/orca-editor/production.log

# Search for errors
grep "error\|Error\|ERROR" /var/log/orca-editor/production.log
```

---

## 9. Escalation Checklist

If you cannot resolve the issue:

1. [ ] Gathered error logs (console, server, network)
2. [ ] Took screenshots/video of issue
3. [ ] Documented steps to reproduce
4. [ ] Checked this guide completely
5. [ ] Searched existing issues/PRs
6. [ ] Gathered system info (browser version, OS, etc)

**Escalate to:** DevOps Lead → Engineering Manager → CTO

---

## Contact & Support

**Slack Channels:**
- #phase-11 (general updates)
- #phase-11-technical (technical issues)
- #phase-11-critical (critical incidents)

**On-Call:** Check rotation in Slack channel description

**Email:** devops-team@getupsoft.com

---

**Version:** 1.0  
**Last Updated:** 2026-05-24  
**Owner:** DevOps & QA Team  
**Reference:** DEPLOYMENT_ACTION_PLAN.md, QUICK_START_DEPLOYMENT.md, POST_DEPLOYMENT_QA_CHECKLIST.md
