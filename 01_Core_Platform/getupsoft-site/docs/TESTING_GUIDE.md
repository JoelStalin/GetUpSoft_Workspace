# 🧪 Testing Guide

**Purpose:** Comprehensive guide for all testing activities  
**Audience:** QA engineers, developers, DevOps  
**Updated:** 2026-05-19

---

## Quick Reference

| Test Type | Command | Time | Purpose |
|-----------|---------|------|---------|
| Smoke Tests | `npm run test:smoke` | 1-2 min | Post-deployment validation |
| E2E (Selenium) | `npm run test:e2e:selenium` | 5-10 min | Full user workflows |
| Lighthouse | `npm run test:lighthouse` | 2-5 min | Performance & SEO |
| Type Checking | `npx tsc --noEmit` | <1 min | TypeScript errors |
| Manual Testing | See below | 30 min | Exploratory & edge cases |

---

## 1. Pre-Deployment Testing

### Local Validation

```bash
# 1. Type checking
npx tsc --noEmit
# Should output: "Found 0 errors"

# 2. Build validation
npm run build
# Should complete without errors
# Check dist/ exists and has assets

# 3. Preview production build
npm run preview
# Visit http://localhost:4173/redesign/
# Test all pages load and forms work

# 4. Run E2E tests (if set up)
npm run test:e2e:selenium
# Should pass all test cases
```

### Manual Testing Checklist

**Pages:**
- [ ] Home page: Hero visible, sections load, CTAs clickable
- [ ] Products page: Product cards render, badges display
- [ ] Solutions page: Industry cards load, solutions are clear
- [ ] About page: Vision, mission, values displayed
- [ ] Contact form: Fields render, validation works
- [ ] Diagnostic form: All fields present, logic works

**Forms:**
- [ ] Contact form with empty fields shows errors
- [ ] Contact form with valid data submits
- [ ] Contact form shows success message with ticket ID
- [ ] Diagnostic form shows all sections
- [ ] Diagnostic form validates budget/timeline correctly
- [ ] Forms prevent submission with validation errors

**Languages:**
- [ ] Toggle between Spanish and English works
- [ ] All content appears in selected language
- [ ] Forms submit in correct language
- [ ] Language preference persists on refresh

**Responsive Design:**
- [ ] Mobile (<640px): Single column, hamburger menu
- [ ] Tablet (640-1024px): Two columns, responsive layout
- [ ] Desktop (>1024px): Full layout, optimal spacing
- [ ] All buttons/links clickable on mobile

**Accessibility:**
- [ ] Tab through page: Tab order logical, focus visible
- [ ] Screen reader: Page structure makes sense
- [ ] Keyboard only: All functions accessible
- [ ] Color contrast: Meets WCAG AA standards

---

## 2. Smoke Tests (Post-Deployment)

### Automated Smoke Tests

```bash
# Run smoke test suite
npm run test:smoke

# Expected output:
# ✅ 1. Testing homepage...
# ✅ 2. Testing products page...
# ✅ 3. Testing solutions page...
# ... (more pages)
# 📊 Results: ✅ 10 passed, ❌ 0 failed
```

### What Smoke Tests Check

1. **Page Access:** All pages return HTTP 200
2. **Response Time:** <2s for page loads
3. **Content:** Pages contain expected text
4. **Health Endpoint:** Deployment server is healthy
5. **SSL Certificate:** HTTPS valid and trusted

### Failed Smoke Test Diagnosis

```bash
# If test fails, check:

# 1. Server is running
docker ps | grep getupsoft-site

# 2. Container logs
docker logs -f getupsoft-site-web

# 3. Test specific endpoint
curl -v http://localhost:3120/health

# 4. Check network connectivity
ping deploy.getupsoft.com

# 5. Check DNS resolution
nslookup getupsoft.com
```

---

## 3. E2E Testing

### Selenium-Based Tests

```bash
# Run existing Selenium E2E tests
npm run test:e2e:selenium

# Location: tests/e2e/getupsoft_site_functional.py
# Tests included:
# - Homepage loads
# - Navigation works
# - Forms can be filled
# - Form submission works
# - Error handling works
```

### Add New Playwright Tests (Recommended)

```bash
# Install Playwright
npm install -D @playwright/test

# Create test file: tests/e2e/contact-form.spec.ts
# See PHASE_5_QA.md for example

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run single test
npx playwright test contact-form
```

### Test Scenarios

**Critical User Paths:**
1. Visit home → Navigate to contact → Submit form
2. Visit home → Navigate to solutions → Click industry link
3. Visit products → Click product → View details
4. Visit contact → Fill form with invalid data → See errors
5. Fill form correctly → Submit → See success

**Edge Cases:**
1. Submit form with very long text
2. Submit form with special characters
3. Switch language mid-form
4. Close form modal and reopen
5. Network timeout during submission

---

## 4. Performance Testing

### Lighthouse Audit

```bash
# Option 1: Chrome DevTools (Interactive)
1. Open http://localhost:5176/redesign/ in Chrome
2. Press F12 (DevTools)
3. Click "Lighthouse" tab
4. Click "Analyze page load"

# Option 2: CLI
npm install -g lighthouse
lighthouse http://localhost:5176/redesign/ --view

# Option 3: npm script
npm run test:lighthouse
```

### Target Metrics

| Metric | Target | What to fix if failing |
|--------|--------|----------------------|
| Performance | 90+ | Optimize images, defer JS, cache better |
| Accessibility | 95+ | Fix contrast, labels, alt text |
| Best Practices | 90+ | Update dependencies, remove console.logs |
| SEO | 90+ | Add meta tags, improve heading structure |
| FCP | <1.8s | Reduce main thread work, inline critical CSS |
| LCP | <2.5s | Lazy load images, reduce JS size |
| CLS | <0.1 | Reserve space for images, avoid layout shifts |

### Performance Optimization

```bash
# 1. Analyze bundle size
npm run build
# Check dist/ file sizes

# 2. Check for unused CSS
npm install -g purgecss
# Identify unused Tailwind classes

# 3. Optimize images
# Convert to WebP format
# Use responsive srcset
# Lazy load below-fold images

# 4. Enable compression (already done)
# gzip: enabled in nginx.conf
# Brotli: add for better compression

# 5. Code splitting
# Already implemented with React.lazy()
# Pages load on demand
```

---

## 5. Accessibility Testing

### Automated Checks

```bash
# Chrome DevTools
1. Install "axe DevTools" extension
2. Open http://localhost:5176/redesign/
3. Click extension icon
4. Click "Scan ALL of my page"
5. Review violations

# npm packages (for CI/CD)
npm install -D jest-axe
npm install -D @axe-core/react
```

### Manual Testing

**Keyboard Navigation:**
```bash
1. Visit http://localhost:5176/redesign/
2. Press Tab repeatedly
3. Verify focus moves to all interactive elements
4. Verify focus style visible
5. Press Enter on buttons/links
6. Press Escape to close modals
```

**Screen Reader Testing:**
```bash
# Windows: NVDA (free)
# macOS: VoiceOver (built-in, Cmd+F5)
# iOS: VoiceOver (Settings → Accessibility)

1. Enable screen reader
2. Navigate through page
3. Verify all content is announced
4. Check form labels are associated
5. Verify heading structure makes sense
```

**Color Contrast:**
```bash
# Use Chrome DevTools
1. Right-click element
2. Inspect
3. Check Colors tab
4. Verify contrast ratio ≥ 4.5:1 (large text 3:1)

# Online tool
https://webaim.org/resources/contrastchecker/
```

### WCAG AA Checklist

- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Heading hierarchy proper (h1 → h2 → h3)
- [ ] Color not only way to convey info
- [ ] Focus visible on all interactive elements
- [ ] No keyboard traps
- [ ] Skip links present (if applicable)
- [ ] Language identified in HTML
- [ ] Error messages clear and actionable
- [ ] No flashing content

---

## 6. Security Testing

### Dependency Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if safe)
npm audit fix

# Monitor with Snyk
npm install -g snyk
snyk test
snyk monitor
```

### Manual Security Tests

**Input Validation:**
```bash
# Test XSS prevention
1. Go to contact form
2. Try: <script>alert('xss')</script>
3. Verify script doesn't execute
4. Check browser console (should have no errors)
```

**HTTPS & SSL:**
```bash
# Check SSL certificate
openssl s_client -connect getupsoft.com:443 \
  -servername getupsoft.com < /dev/null | \
  openssl x509 -noout -dates

# Online verification
https://www.ssllabs.com/ssltest/?d=getupsoft.com
```

**Security Headers:**
```bash
# Check headers on production
curl -I https://getupsoft.com/redesign/

# Expected headers:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: ...

# Online verification
https://securityheaders.com/?q=getupsoft.com
```

**No Secrets in Code:**
```bash
# Verify no hardcoded secrets
git grep -i "password\|secret\|api.key" -- "*.ts" "*.tsx"
# Should return nothing

# Check git history
git log --all --full-history -p -- "*.ts" | grep -i "password"
# Should return nothing
```

---

## 7. Testing in CI/CD

### GitHub Actions Integration

```yaml
# In .github/workflows/deploy-getupsoft-site.yml

- name: Run smoke tests
  if: success()
  run: |
    bash tests/smoke-tests.sh https://deployed-url.com

- name: Run E2E tests
  if: success()
  run: |
    npm run test:e2e:selenium || true  # Don't fail on E2E failures

- name: Lighthouse CI
  uses: actions/lighthouse-ci-action@v10
  with:
    uploadArtifacts: true
    temporaryPublicStorage: true
```

---

## 8. Test Reporting

### Store Test Results

```bash
# Smoke tests log to stdout
# E2E tests can be stored
npm run test:e2e:selenium > test-results.log

# Lighthouse reports HTML
lighthouse http://localhost:5176/redesign/ \
  --output-path=lighthouse-report.html

# Upload to CI/CD artifacts
# GitHub Actions: use `actions/upload-artifact@v2`
```

### Review Test Results

```bash
# Check for regressions
1. Compare with previous test runs
2. Look for failing scenarios
3. Check performance metrics trended down
4. Verify accessibility didn't regress

# Common regressions:
- Performance < 90 (bundle size increased)
- Forms not submitting (validation changed)
- Language switching broken (context issue)
- Mobile layout broken (CSS change)
```

---

## Testing Checklist

**Before Push:**
- [ ] npm run build succeeds
- [ ] npm run preview works
- [ ] Manual testing passes (5 min)
- [ ] No console errors
- [ ] No TypeScript errors

**Before Merge to Main:**
- [ ] All above checks passed
- [ ] Code review completed
- [ ] Test results documented
- [ ] No regressions identified

**After Deployment:**
- [ ] npm run test:smoke passes
- [ ] npm run test:e2e:selenium passes (or skipped)
- [ ] Lighthouse score ≥ 90
- [ ] No error logs in Sentry
- [ ] Health endpoint returns 200

---

## Useful Commands

```bash
# Type checking
npx tsc --noEmit

# Build and preview
npm run build && npm run preview

# Run all tests
npm run test:smoke && \
npm run test:e2e:selenium && \
npm run test:lighthouse

# Check bundle size
du -sh dist/
ls -lh dist/assets/*.js | head -5

# View Lighthouse report
open lighthouse-report.html

# SSH to server and check logs
ssh deploy@host
docker logs -f getupsoft-site-web
```

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [WCAG 2.1 Standards](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

_Testing Guide v1.0 · Updated 2026-05-19 · Quality Assurance for Production_
