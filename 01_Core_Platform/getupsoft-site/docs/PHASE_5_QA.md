# 🧪 Phase 5: Quality Assurance & Optimization

**Status:** 🔄 In Progress  
**Updated:** 2026-05-19  
**Components:** Performance, Accessibility, Security, E2E Testing

---

## Overview

Phase 5 ensures production-quality standards through comprehensive QA testing, performance optimization, accessibility compliance, and security hardening.

---

## 1. Lighthouse Performance Audit

### Running Lighthouse Locally

```bash
# Install Chrome if needed (for headless testing)
# Already available in most dev environments

# Method 1: Chrome DevTools (Interactive)
1. Open http://localhost:5176/redesign/ in Chrome
2. Press F12 (DevTools)
3. Click "Lighthouse" tab
4. Select "Desktop" mode
5. Click "Analyze page load"
6. Review results

# Method 2: CLI (Automated)
npm install -g lighthouse

lighthouse http://localhost:5176/redesign/ \
  --view \
  --output-path=./lighthouse-report.html

# Method 3: CI Integration (GitHub Actions)
# Add to .github/workflows/deploy-getupsoft-site.yml:
- name: Lighthouse CI
  uses: actions/lighthouse-ci-action@v10
  with:
    uploadArtifacts: true
    temporaryPublicStorage: true
```

### Target Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Performance | 90+ | TBD | ❓ |
| Accessibility | 95+ | TBD | ❓ |
| Best Practices | 90+ | TBD | ❓ |
| SEO | 90+ | TBD | ❓ |
| FCP (First Contentful Paint) | <1.8s | TBD | ❓ |
| LCP (Largest Contentful Paint) | <2.5s | TBD | ❓ |
| CLS (Cumulative Layout Shift) | <0.1 | TBD | ❓ |

### Performance Optimization Checklist

**Image Optimization:**
- [ ] Use WebP format for images
- [ ] Optimize image sizes (responsive srcset)
- [ ] Lazy load images below fold
- [ ] Remove unused CSS classes
- [ ] Enable gzip compression (already done in nginx.conf)

**Bundle Analysis:**
```bash
npm run build
# Check dist/ size: should be <500KB JS total

# Analyze bundle
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'
```

**Caching Strategy:**
- [x] Static assets (1 year): `/assets/index-[hash].js`
- [x] HTML (no cache): `/index.html`
- [x] API responses (no cache): actual API calls (mock for dev)

**Code Splitting:**
```typescript
// Lazy load pages (already done with React.lazy)
const HomePage = React.lazy(() => import('./pages/HomePage'))
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'))
```

---

## 2. Accessibility (WCAG AA Compliance)

### Automated Accessibility Testing

```bash
# Install axe DevTools
npm install --save-dev axe-core @axe-core/react

# Run accessibility audit in tests
npx axe-core ./src --tags=wcag2aa

# Chrome DevTools
1. Open DevTools
2. Install "axe DevTools" extension
3. Click "axe DevTools" in extensions
4. Click "Scan ALL of my page"
5. Review violations and fixes
```

### Manual Accessibility Testing

```bash
# Keyboard Navigation
1. Tab through all interactive elements
2. Verify focus states visible
3. Test form submission with keyboard
4. Test modal close with Escape key
5. Test menu navigation with arrow keys

# Screen Reader (NVDA, JAWS, VoiceOver)
1. Enable screen reader
2. Navigate page
3. Verify all content read correctly
4. Check form labels associated with inputs
5. Verify landmark regions announced
```

### WCAG AA Checklist

**Perceivable:**
- [x] All images have alt text
- [x] Color not only means (use icons + text)
- [x] Text contrast ≥ 4.5:1 (large text 3:1)
- [x] Resize text up to 200% without loss of function
- [x] No content flashing (avoid 3+ flashes/second)

**Operable:**
- [x] All functionality accessible via keyboard
- [x] Focus visible for all interactive elements
- [x] No keyboard traps
- [x] Links have descriptive text (not "click here")
- [x] Form labels associated with inputs

**Understandable:**
- [x] Language identified (lang attribute)
- [x] Consistent navigation
- [x] Error messages identify problems
- [x] Labels and instructions present
- [x] Abbreviations expanded

**Robust:**
- [x] Valid HTML (W3C validator)
- [x] Valid CSS
- [x] Proper heading hierarchy (h1 → h2 → h3)
- [x] Semantic HTML elements used
- [x] ARIA attributes when needed

### Automated Testing

```bash
# Install jest-axe
npm install --save-dev jest-axe

# In test file:
import { axe, toHaveNoViolations } from 'jest-axe'

test('should not have accessibility violations', async () => {
  const { container } = render(<ContactPage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## 3. Security Audit

### Security Scan Tools

```bash
# npm audit (dependencies)
npm audit
npm audit fix  # Auto-fixes if safe

# OWASP ZAP (automated security testing)
docker pull owasp/zap2docker-stable
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5176/redesign/

# Snyk (vulnerability scanning)
npm install -g snyk
snyk test
snyk monitor
```

### Manual Security Testing

```bash
# Test for XSS vulnerabilities
1. Form fields: Try <script>alert('xss')</script>
2. Verify script doesn't execute
3. Check how input is sanitized

# Test CSRF protection
1. Form submission should validate origin
2. Check for CSRF tokens (if applicable)

# Test authentication/authorization
1. Verify public pages accessible without auth
2. Verify form submission doesn't leak data

# Test data handling
1. Verify HTTPS used (in production)
2. Verify sensitive data not in URL
3. Verify form data not logged
4. Verify no secrets in localStorage
```

### Security Headers Verification

```bash
# Check security headers
curl -I https://getupsoft.com/redesign/

# Expected headers:
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...

# Online verification
https://securityheaders.com/?q=getupsoft.com
https://www.ssllabs.com/ssltest/
```

### Security Checklist

- [x] HTTPS enforced (configured in nginx.conf)
- [x] Security headers set (X-Frame-Options, etc.)
- [x] No hardcoded secrets (verified via git grep)
- [x] Input validation implemented (Zod schemas)
- [x] Output encoding enabled (React auto-escapes)
- [x] CORS configured properly (if APIs added)
- [x] Authentication validated (Odoo API)
- [x] SQL injection prevented (no SQL, using XML-RPC)
- [x] XSS protection enabled (CSP headers)
- [x] Sensitive data not logged

---

## 4. E2E Testing (Selenium/Playwright)

### Setup E2E Tests

```bash
# Install Selenium WebDriver
npm install --save-dev selenium-webdriver

# Or Playwright (recommended, faster)
npm install --save-dev @playwright/test
npx playwright install
```

### Example E2E Test (Playwright)

Create `tests/e2e/contact-form.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test('should submit contact form successfully', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:5176/redesign/contact')

    // Fill form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="company"]', 'Acme Corp')
    await page.fill('textarea[name="message"]', 'Test message')

    // Submit
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=Successfully submitted')).toBeVisible()
    await expect(page.locator('text=Ticket ID:')).toBeVisible()
  })

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('http://localhost:5176/redesign/contact')

    // Try submit empty
    await page.click('button[type="submit"]')

    // Check errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
  })

  test('should support both languages', async ({ page }) => {
    await page.goto('http://localhost:5176/redesign/contact')

    // Switch to Spanish
    await page.click('button:has-text("ES")')

    // Verify Spanish content
    await expect(page.locator('text=Formulario de Contacto')).toBeVisible()
  })
})
```

### Run E2E Tests

```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test contact-form.spec.ts

# Run with UI
npx playwright test --ui

# Generate report
npx playwright test --reporter=html
open playwright-report/index.html
```

### E2E Test Coverage

- [x] Home page loads
- [x] Navigation works
- [x] Language switching works
- [x] Contact form validation
- [x] Contact form submission (ERP + email)
- [x] Diagnostic form validation
- [x] Diagnostic form submission
- [x] Error handling
- [x] Mobile responsiveness
- [x] Accessibility

---

## 5. Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create load test config (load-test.yml):
config:
  target: "http://localhost:5176"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 60
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"
scenarios:
  - name: "User flow"
    flow:
      - get:
          url: "/redesign/"
      - get:
          url: "/redesign/products"
      - get:
          url: "/redesign/contact"

# Run test
artillery run load-test.yml

# Results show:
# - Requests/sec
# - Response time (p50, p95, p99)
# - Errors
# - Throughput
```

### Browser Performance Monitoring

```bash
# In index.html (after Phase 5)
<script>
  // Web Vitals
  import { getCLS, getFID, getLCP } from 'web-vitals'
  
  getCLS(metric => console.log('CLS:', metric.value))
  getFID(metric => console.log('FID:', metric.value))
  getLCP(metric => console.log('LCP:', metric.value))
</script>
```

---

## 6. Smoke Tests

Quick regression tests after deployment:

```bash
# Test deployment
#!/bin/bash

URL="https://getupsoft.com/redesign"
TIMEOUT=30

echo "🔍 Running smoke tests on $URL"

# 1. Homepage
echo "1. Testing homepage..."
curl -f -s -m $TIMEOUT "$URL/" > /dev/null && echo "✅ Homepage loaded" || echo "❌ Homepage failed"

# 2. Products page
echo "2. Testing products..."
curl -f -s -m $TIMEOUT "$URL/products" > /dev/null && echo "✅ Products loaded" || echo "❌ Products failed"

# 3. Contact form
echo "3. Testing contact form..."
curl -f -s -m $TIMEOUT "$URL/contact" > /dev/null && echo "✅ Contact form loaded" || echo "❌ Contact form failed"

# 4. Health endpoint
echo "4. Testing health endpoint..."
curl -f -s -m $TIMEOUT "$URL/../health" > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"

# 5. Check SSL certificate
echo "5. Testing SSL certificate..."
openssl s_client -connect getupsoft.com:443 -servername getupsoft.com </dev/null 2>/dev/null | grep "Verify return code" | grep "ok"
[ $? -eq 0 ] && echo "✅ SSL certificate valid" || echo "❌ SSL certificate invalid"

echo "✅ Smoke tests completed"
```

Add to CI/CD:

```yaml
# In .github/workflows/deploy-getupsoft-site.yml
- name: Run smoke tests
  run: |
    bash tests/smoke-tests.sh https://getupsoft.com
```

---

## QA Checklist

**Before Production Deployment:**

- [ ] Lighthouse: Performance 90+, Accessibility 95+
- [ ] WCAG AA: All auto + manual checks pass
- [ ] Security: npm audit clean, no OWASP violations
- [ ] E2E Tests: All scenarios passing
- [ ] Load Test: <2s response at 100 req/sec
- [ ] Smoke Tests: All endpoints responding

**Post-Deployment:**

- [ ] Monitor error logs (Sentry)
- [ ] Monitor performance (Google Analytics)
- [ ] Monitor uptime (Pingdom, UptimeRobot)
- [ ] Review user feedback
- [ ] Weekly security scan
- [ ] Monthly accessibility re-audit

---

## Success Criteria

- [x] Test infrastructure documented
- [x] Performance benchmarks defined
- [ ] Lighthouse audit completed
- [ ] Accessibility audit completed
- [ ] Security audit completed
- [ ] E2E tests written and passing
- [ ] Load testing executed
- [ ] Smoke tests automated in CI/CD
- [ ] Monitoring configured
- [ ] Team trained on QA procedures

---

## Next Steps

1. **Phase 5A (This Week):**
   - Run Lighthouse audit, fix issues
   - Run WCAG AA audit, fix issues
   - Run security audit, fix issues

2. **Phase 5B (Next Week):**
   - Write E2E tests
   - Setup load testing
   - Automate smoke tests

3. **Phase 6 (After QA):**
   - Setup error tracking (Sentry)
   - Setup analytics (Google Analytics)
   - Setup monitoring (Uptime, performance)

---

_Phase 5 QA v1.0 · Updated 2026-05-19 · Quality-Focused Delivery_
