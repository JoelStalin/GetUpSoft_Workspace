# Post-Deployment QA Checklist - Phase 10 Staging

**Purpose:** Comprehensive QA validation of Phase 10 in staging environment  
**Audience:** QA Engineer, QA Lead  
**Estimated Time:** 4-6 hours  
**Success Criteria:** All 7 categories PASS  
**Pass Condition:** Sign-off from QA Lead  

---

## Pre-QA Verification (15 minutes)

### Deployment Status Check
- [ ] Application URL accessible: `https://staging-orca.getupsoft.com`
- [ ] HTTP status: 200 OK (not 404, 500, etc)
- [ ] Page loads within 3 seconds
- [ ] No CloudFlare error pages
- [ ] DNS resolves correctly

### Baseline Metrics Collection
- [ ] Open Lighthouse in DevTools (F12)
- [ ] Run performance audit
  - [ ] Record: FCP, LCP, TTI, Lighthouse Score
  - [ ] Save screenshot of results
- [ ] Open Network tab
  - [ ] Note bundle size (should be ~269KB gzip)
  - [ ] Check for 404 errors
  - [ ] Record API response times

---

## Category 1: Functional Testing (1 hour)

### 1.1 Application Launch
- [ ] Page loads with 0 console errors (F12 → Console)
- [ ] All UI elements visible (header, sidebar, canvas, panels)
- [ ] No layout shift or rendering glitches
- [ ] Logo displays correctly
- [ ] Toolbar buttons accessible

### 1.2 Mode Switching (All 4 Modes)

**Mode 1: Workflow (Default)**
- [ ] Loads on first access
- [ ] Canvas visible with workflow nodes
- [ ] Left sidebar present (properties)
- [ ] Right panel visible (actions)
- [ ] Bottom toolbar functional

**Mode 2: Web Design**
- [ ] Switch via keyboard shortcut (2) or button
- [ ] Design canvas renders
- [ ] Responsive components visible
- [ ] Mode switch time: <1000ms
- [ ] No console errors on switch

**Mode 3: Mobile Design**
- [ ] Switch via keyboard shortcut (3) or button
- [ ] Device previews load (iPhone, Pixel, iPad)
- [ ] Preview renders correctly
- [ ] Mode switch time: <1000ms
- [ ] Orientation switching works

**Mode 4: AI Mode**
- [ ] Switch via keyboard shortcut (4) or button
- [ ] Chat interface loads
- [ ] Input field functional
- [ ] Mode switch time: <1000ms
- [ ] Send message works (if backend connected)

### 1.3 Interaction Testing
- [ ] Click buttons → response immediate (<100ms)
- [ ] Drag nodes → smooth animation
- [ ] Scroll canvas → no jank
- [ ] Keyboard shortcuts (1-4) work
- [ ] Tab navigation works

---

## Category 2: Performance Metrics (1 hour)

### 2.1 Load Performance
- [ ] First Contentful Paint (FCP): <2.0s (target <1.5s Phase 10)
- [ ] Largest Contentful Paint (LCP): <3.0s (target <2.8s Phase 10)
- [ ] Time to Interactive (TTI): <3.5s (target <3.2s Phase 10)
- [ ] Cumulative Layout Shift (CLS): <0.1 (target 0.05)
- [ ] Lighthouse Score: >70 (target 75 Phase 10)

### 2.2 Mode Switching Performance
- [ ] Workflow → Web Design: <1000ms
- [ ] Web Design → Mobile Design: <1000ms
- [ ] Mobile Design → AI: <1000ms
- [ ] AI → Workflow: <1000ms
- [ ] All switches smooth (no stuttering)

**Measurement:** F12 → Performance tab → record mode switch

### 2.3 Bundle Size Verification
```bash
# In browser DevTools Network tab:
# - Check main.[hash].js size
# - Should be ~269KB gzipped
# - Uncompressed: ~901KB
```
- [ ] Main bundle: 269KB gzip (±10%)
- [ ] No large unexpected assets
- [ ] Code splitting working (multiple chunks visible)
- [ ] No duplicate dependencies

### 2.4 API Response Times
- [ ] Analytics API: <500ms (p95)
- [ ] Optimization API: <300ms (p95)
- [ ] User preference API: <150ms (p95)
- [ ] No 5xx errors in Network tab

---

## Category 3: Data & Analytics (1 hour)

### 3.1 Analytics Collection
- [ ] F12 → Network tab → filter by "analytics"
- [ ] Look for POST requests to `/api/analytics`
- [ ] Response status: 200 OK
- [ ] Response body: Valid JSON with metrics

### 3.2 Data Integrity
- [ ] Check for required fields in analytics payload:
  - [ ] `timestamp`
  - [ ] `event_type` (e.g., "mode_switch", "node_created")
  - [ ] `user_id` or `session_id`
  - [ ] Performance metrics (if applicable)
- [ ] No PII in payloads (check for secrets, emails)

### 3.3 Multi-Tenant Isolation
- [ ] Switch to different tenant account (if available)
- [ ] Verify: Data doesn't leak between tenants
- [ ] Analytics isolated by tenant
- [ ] Cost tracking per tenant

### 3.4 Cost Optimization Tracking
- [ ] Analytics dashboard shows metrics (if UI has dashboard)
- [ ] Cost trends visible
- [ ] Recommendations displayed
- [ ] No data corruption

---

## Category 4: Accessibility & Usability (45 minutes)

### 4.1 WCAG AA Compliance
- [ ] All text readable (color contrast ≥4.5:1)
  - [ ] Use: F12 → axe DevTools or WAVE extension
  - [ ] Run scan: 0 violations expected
- [ ] All buttons keyboard accessible (Tab through all)
- [ ] Focus indicators visible (F12 → outline buttons)
- [ ] Form labels present and associated

### 4.2 Keyboard Navigation
- [ ] Tab cycles through all interactive elements
- [ ] Escape closes any open modals/panels
- [ ] Enter activates buttons
- [ ] Shortcuts work: 1, 2, 3, 4 for modes
- [ ] No keyboard traps

### 4.3 Screen Reader Testing (Optional)
- [ ] ARIA labels on interactive elements
- [ ] Semantic HTML structure
- [ ] No screen reader warnings in console

### 4.4 Mobile Responsiveness
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test at 3 breakpoints:
  - [ ] Mobile (375px): Layout adjusts, readable
  - [ ] Tablet (768px): Responsive, no overflow
  - [ ] Desktop (1440px): Optimal layout
- [ ] No horizontal scroll at any size
- [ ] Touch targets ≥48px (mobile)

---

## Category 5: Browser Compatibility (30 minutes)

### 5.1 Chrome (Latest)
- [ ] Application loads
- [ ] All modes work
- [ ] Performance acceptable
- [ ] Console: 0 errors

### 5.2 Firefox (Latest)
- [ ] Application loads
- [ ] All modes work
- [ ] Performance acceptable
- [ ] Console: 0 errors (may have warnings, acceptable)

### 5.3 Safari (Latest)
- [ ] Application loads
- [ ] All modes work
- [ ] Performance acceptable
- [ ] Console: 0 errors

### 5.4 Edge (Latest)
- [ ] Application loads
- [ ] All modes work
- [ ] Performance acceptable
- [ ] Console: 0 errors

**Note:** If web testing framework available (Playwright/Selenium), automate these checks.

---

## Category 6: Error Handling & Edge Cases (45 minutes)

### 6.1 Network Issues
- [ ] DevTools → Network → Throttle to "Slow 3G"
- [ ] Application still loads (may take longer)
- [ ] Error messages display if needed
- [ ] Graceful degradation (features work, may be slower)
- [ ] Restore throttle settings

### 6.2 Invalid User Input
- [ ] Type gibberish in search/input fields
- [ ] Click rapidly (spam clicks)
- [ ] Long-hold buttons
- [ ] All handled gracefully without crashes

### 6.3 Missing Data Scenarios
- [ ] If no analytics data yet: UI doesn't crash
- [ ] Empty tenant: Still loads
- [ ] No user preferences: Defaults applied

### 6.4 Concurrent Operations
- [ ] Open multiple modes simultaneously (if possible)
- [ ] Switch modes quickly
- [ ] Rapid API calls
- [ ] No memory leaks (check DevTools → Memory)

---

## Category 7: Production Readiness (30 minutes)

### 7.1 Security Check
- [ ] F12 → Console: 0 security warnings
- [ ] No hardcoded API keys or secrets
- [ ] HTTPS enabled (URL is `https://`, not `http://`)
- [ ] No mixed content warnings
- [ ] CORS headers correct

### 7.2 SEO & Meta Tags
- [ ] Page title present and meaningful
- [ ] Meta description present
- [ ] Open Graph tags present (for sharing)
- [ ] Favicon displays correctly

### 7.3 Monitoring & Observability
- [ ] Datadog dashboard shows metrics
  - [ ] Error rate: <0.1%
  - [ ] Success rate: >99.5%
  - [ ] Latency p95: <500ms
  - [ ] Uptime: >99.5%
- [ ] Alert thresholds configured
- [ ] Logs collected and queryable

### 7.4 Build Artifacts
- [ ] dist/ directory contains all files
- [ ] No source maps in production (security)
- [ ] Minified JS/CSS (size should be small)
- [ ] Assets gzipped or compressed

---

## Post-QA Summary (15 minutes)

### Results Compilation
- [ ] All 7 categories passed
- [ ] Issues discovered: 0 critical, [X] non-critical
- [ ] Performance metrics met: Yes/No
- [ ] Security review passed: Yes/No

### Issue Log (if any)

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| [Example] Mode switching lag | Low | Fixed | Cache issue |
| | | | |

### Final Checklist
- [ ] Test evidence saved (screenshots/videos)
- [ ] Performance baseline recorded
- [ ] No blocking issues remain
- [ ] Documentation of any quirks (for team)
- [ ] Sign-off ready from QA Lead

---

## Sign-Off

**QA Lead Name:** ________________________  
**Date:** ________________________  
**Status:** ✅ **PASS** / ❌ **FAIL**  

If FAIL, blocking issues:
```
1. 
2. 
3. 
```

---

## Next Steps (If QA Passes)

1. **Monitor Staging:** 24-48 hours of continuous monitoring
2. **Team Notification:** Post #phase-11 Slack: "Phase 10 staging QA complete ✅"
3. **Production Readiness:** Schedule Phase 11 kick-off (2026-05-27)
4. **Risk Review:** Weekly risk review (Friday 2:00pm UTC)

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** QA Team  
**Category:** Deployment Validation
