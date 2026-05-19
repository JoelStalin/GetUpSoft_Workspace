---
name: getupsoft-qa-verification
description: QA & verification skill for Codex - run lint, type checks, tests, build validation, accessibility audits, performance analysis
---

# GetUpSoft QA & Verification (Codex)

**For:** Codex (or dedicated QA agent)  
**Role:** Execute quality assurance, validation, testing  
**When to use:** Before marking story DONE, phase gate verification, final QA

---

## Quick Start

1. Read Definition of Done (master prompt §17.4)
2. Run build commands
3. Execute verification checklist
4. Document results in `docs/verification-report.md`
5. Mark story DONE (or list blockers)

---

## Daily QA Commands

```bash
cd apps/site

# Type checking
npm run build           # Includes tsc --noEmit (must succeed)

# Dev server (manual testing)
npm run dev             # http://localhost:5173

# Tests (if available)
npm run test            # Unit/integration tests

# E2E tests
npm run test:e2e:selenium   # Selenium regression suite

# Accessibility
# Manual: Use axe DevTools browser extension on each page
```

---

## QA Checklist (Per Story)

### Build & Types
- [ ] `npm run build` exits 0 (zero errors)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint critical warnings
- [ ] No console.log() left in production code

### Visual Regression
- [ ] Component matches design system (colors, spacing, typography)
- [ ] Responsive: mobile < 768px, tablet 768–1024px, desktop > 1024px
- [ ] No horizontal scroll on mobile
- [ ] Images scale correctly
- [ ] Text readable at all sizes

### Accessibility (WCAG AA)
- [ ] Color contrast ≥ 4.5:1 (normal) or 3:1 (large)
- [ ] Focus states visible (Tab through page)
- [ ] Icon-only buttons have `aria-label`
- [ ] Form labels present and associated
- [ ] Error messages accessible (`aria-describedby`)
- [ ] Keyboard navigation works (no trapped focus)
- [ ] `prefers-reduced-motion` respected

### Forms & Interaction
- [ ] Form validates on empty submit (shows errors)
- [ ] Form shows loading state on submit
- [ ] Form shows success message on success
- [ ] Form shows error message on failure
- [ ] Zod validation works client-side
- [ ] No data loss if user navigates away

### Content Quality
- [ ] Copy ES and EN both present
- [ ] No hardcoded copy (uses i18n)
- [ ] No invented company data
- [ ] All claims verified (in source-map.md)
- [ ] CTAs go to real pages (not #tbd- placeholders)

### Security
- [ ] No hardcoded API keys
- [ ] No sensitive data in console logs
- [ ] No XSS vulnerabilities (form inputs sanitized)
- [ ] No obvious injection risks

### Performance
- [ ] Bundle size reasonable (< 500 KB gzipped for site)
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] Images lazy-loaded (below fold)
- [ ] Animations smooth (60 FPS, no jank)

---

## Full QA Report (Phase Gate)

Run at phase end and populate `docs/verification-report.md`:

```markdown
## Phase [N] Final QA

**Date:** 2026-05-[date]  
**Tested by:** [Codex QA agent]  
**Status:** ✅ PASSED / ⚠️ ISSUES FOUND

### Build Status
- Build command: `npm run build`
- Result: ✅ SUCCESS
- Bundle size: [X] KB (gzipped)
- No TypeScript errors: ✅
- No console errors: ✅

### Accessibility Audit
- Tool: axe DevTools + manual keyboard nav
- WCAG AA baseline: ✅ MET
- Color contrast: ✅ All > 4.5:1
- Focus management: ✅ Keyboard nav works
- Labels & ARIA: ✅ Present on all interactive

### Responsive Design
- Mobile (< 768px): ✅ Tested
- Tablet (768–1024px): ✅ Tested
- Desktop (> 1024px): ✅ Tested
- No horizontal scroll: ✅
- Touch targets ≥ 48px: ✅

### Form Testing
- Contact form: ✅ Submits, shows success
- Validation: ✅ Client-side works
- Error handling: ✅ Shows errors on failure
- Diagnostic form: ✅ [if applicable]

### Browser Testing
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅ [if applicable]
- Mobile browsers: ✅ [iOS Safari, Android Chrome]

### Known Issues (if any)
None

### Sign-Off
- Phase [N] ready for Phase [N+1]: ✅ YES
- Product Owner approval: ⏳ PENDING
```

---

## Tools & Resources

| Task | Tool | Command |
|---|---|---|
| Type checking | TypeScript | `npx tsc --noEmit` |
| Linting | ESLint | `npm run lint` (if available) |
| Unit tests | Jest/Vitest | `npm run test` |
| E2E tests | Selenium/Playwright | `npm run test:e2e:*` |
| Accessibility | axe DevTools | Browser extension |
| Performance | Lighthouse | Chrome DevTools F12 |
| Bundle size | vite-plugin-visualizer | `npm run build` |

---

## Failure Handling

If QA fails:

1. **Document issue:**
   ```
   docs/implementation-log.md:
   
   **Issue:** Contact form validation not working
   **Cause:** Zod schema missing email pattern
   **Fix:** Added z.string().email() to schema
   **Status:** Resubmitting for QA
   ```

2. **Fix or escalate:**
   - If simple: Fix it, re-run QA
   - If complex: Escalate to Claude orchestrator + get approval before fixing

3. **Re-test:**
   - Run full checklist again
   - Verify fix doesn't break other tests

4. **Mark DONE only when all checks pass**

---

## Definition of Done (Final)

Story is DONE only when:

- [ ] All build commands succeed
- [ ] All QA checks passed
- [ ] All accessibility requirements met
- [ ] All responsive design verified
- [ ] All forms tested and working
- [ ] All docs updated
- [ ] Implementation log has entry
- [ ] Code review passed (if critical)
- [ ] Story marked DONE in sprint board

---

_GetUpSoft QA & Verification Skill (Codex) v1.0 · Created 2026-05-19_
