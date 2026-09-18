# GetUpSoft QA — Subagent Instructions

**Role:** Comprehensive QA and verification specialist  
**Triggered by:** Claude orchestrator at Phase 5 start  
**Duration:** Full day(s) for final QA pass

## Mission

Execute comprehensive QA before launch: lint, type check, tests, build, accessibility, performance, browser testing, form validation, E2E smoke tests.

## Activation

**Triggered at:** Phase 5 start  
**Task:** Verify all Phase 1–4 work meets criteria  
**Deliverable:** Populated docs/verification-report.md

## QA Checklist

### Build & Type Safety
- [ ] `npm run build` exits 0 (no errors)
- [ ] `tsc --noEmit` passes (no TS errors)
- [ ] ESLint passes (no critical warnings)
- [ ] No console errors in built site

### Unit / Integration Tests
- [ ] `npm run test` (if tests exist)
- [ ] Coverage > 50% (if available)
- [ ] All tests passing

### Accessibility (WCAG AA)
- [ ] Color contrast ≥ 4.5:1 on all text
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Form labels present and associated
- [ ] Error messages associated (aria-describedby)
- [ ] Icons have alt text or aria-label
- [ ] `prefers-reduced-motion` respected

### Performance (Lighthouse)
- [ ] Performance score ≥ 90
- [ ] FCP < 2s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 3.5s

### Responsive Design
- [ ] Mobile (< 768px): readable, no horiz scroll, hamburger nav
- [ ] Tablet (768–1024px): good layout
- [ ] Desktop (> 1024px): optimal experience
- [ ] Images scale correctly
- [ ] Touch targets ≥ 48px × 48px

### Form & ERP Testing
- [ ] Contact form validates (empty field errors)
- [ ] Contact form submits (shows success)
- [ ] Diagnostic form validates
- [ ] Diagnostic form submits
- [ ] lib/erp/ works with mock provider
- [ ] API error handling (bad input, network errors)

### SEO & Analytics
- [ ] All pages have unique `<title>`
- [ ] All pages have `<meta description>`
- [ ] OpenGraph tags present (og:title, og:description, og:image)
- [ ] hreflang tags for ES/EN
- [ ] Canonical tags
- [ ] Schema.org markup (Organization, Service, FAQPage)

### Smoke Tests (Manual Browser)
- [ ] Home page loads and renders
- [ ] Region switch works (Global ↔ RD)
- [ ] Language switch works (ES ↔ EN)
- [ ] All nav links clickable
- [ ] Header sticky on scroll
- [ ] Footer visible and interactive
- [ ] Mobile hamburger menu works (opens, closes, click nav)
- [ ] Contact form submittable
- [ ] No 404s for assets (images, CSS, JS)

### Security
- [ ] No hardcoded secrets in code
- [ ] No sensitive data in logs
- [ ] HTTPS enforced (in prod)
- [ ] CSP headers set
- [ ] No XSS vulnerabilities (check form inputs)
- [ ] No obvious SQL injection (N/A for frontend)

### Documentation
- [ ] docs/design-system.md complete
- [ ] docs/content-architecture.md complete
- [ ] docs/erp-integration.md complete
- [ ] docs/deployment-google-cloud.md complete
- [ ] docs/verification-report.md populated
- [ ] implementation-log.md has all sessions
- [ ] decision-log.md has all decisions
- [ ] handoff.md is current

## Deliverable

Populated `docs/verification-report.md` with all checks passed or documented (with approved waivers).

## Sign-Off

```
## Final QA Sign-Off

- [ ] All Phase 5 checks passed or waiered
- [ ] Product Owner (Joel) approves
- [ ] Team confidence: Green / Yellow / Red
- [ ] Date ready: ___________
- [ ] Signed: ___________

Ready for production deploy: YES / NO
```

---

_Created 2026-05-19 · Subagent for final QA pass before launch_
