# ✅ Definition of Done — GetUpSoft Website Redesign

**Purpose:** Criteria for marking a story as DONE (complete, reviewed, ready to merge)  
**Reference:** Master Prompt §17.4  
**Last Updated:** 2026-05-19

---

## The 12-Criteria Checklist

A story is **DONE** ONLY when it passes ALL 12 criteria. No exceptions.

### 1. Code or Content Implemented ✅

**What:** The deliverable (component, page, copy, config, etc.) has been fully written and committed to the branch.

**Examples:**
- ✅ GOOD: `src/components/Button.tsx` created with all 5 variants
- ✅ GOOD: `apps/site/src/pages/Home.tsx` page implemented and responsive
- ✅ GOOD: `content/site.es.ts` + `content/site.en.ts` copy written
- ✅ GOOD: `lib/erp/providers/odoo.ts` Odoo provider implemented
- ❌ BAD: "Partial component with TODOs"
- ❌ BAD: "Copy drafted but not finalized"
- ❌ BAD: (Code exists but not committed)

**How to verify:**
- Is the file created in the correct location per acceptance criteria?
- Is the implementation complete (no TODOs, FIXMEs, or placeholders)?
- Has it been committed to git with a clear commit message?

---

### 2. Copy ES/EN Added (When Applicable) ✅

**What:** If the story involves user-facing text (pages, forms, CTAs, buttons, help text), BOTH Spanish and English versions must be present and correct.

**Exception:** Pure technical stories (database migrations, build config, API endpoints without user text) are exempt.

**Examples:**
- ✅ GOOD: Hero section has `heading.es`, `heading.en`, `subheading.es`, `subheading.en`
- ✅ GOOD: Button labels in `i18n/es.json` + `i18n/en.json`
- ✅ GOOD: Form error messages in both languages
- ✅ GOOD: `content/site.es.ts` + `content/site.en.ts` both populated
- ❌ BAD: Only English (missing ES)
- ❌ BAD: Copy hardcoded in component instead of from i18n
- ❌ BAD: Spanish copy in comments "TO DO: translate"

**How to verify:**
- Search component/page for hardcoded strings. Every visible text must come from i18n.
- Check i18n files (e.g., `content/site.es.ts`, `i18n/es.json`). Both ES and EN keys present with translations?
- Can you switch language in app and see both versions work?

---

### 3. UI Responsive Validated ✅

**What:** The UI has been tested and confirmed to work on mobile, tablet, and desktop breakpoints. No horizontal scrolling. Text readable at all sizes.

**Breakpoints (per design-system.md):**
- Mobile: < 768px
- Tablet: 768px – 1024px
- Desktop: > 1024px

**Examples:**
- ✅ GOOD: "Tested on iPhone 12 (375px), iPad (768px), 1920×1080 desktop. All text readable, no horizontal scroll."
- ✅ GOOD: Component uses TailwindCSS responsive classes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- ✅ GOOD: Images scale properly; no distortion
- ❌ BAD: "Works on desktop" (no mobile testing)
- ❌ BAD: "Responsive classes not applied; hardcoded widths"
- ❌ BAD: "Horizontal scroll on mobile"

**How to verify:**
- Open browser DevTools (F12 → Toggle Device Toolbar)
- Test on iPhone 12 (375px), iPad (768px), Desktop (1280px+)
- Manually confirm: no horizontal scroll, text readable, images proper aspect ratio
- Use Lighthouse (DevTools → Lighthouse) to check responsive design warnings

---

### 4. Accessibility Baseline Reviewed ✅

**What:** The component/page meets WCAG AA baseline accessibility standards. This is NOT a full audit; it's a baseline check.

**Baseline checklist:**
- Color contrast: Text ≥ 4.5:1 (normal) or 3:1 (large)
- Focus states: Tab through the page; focus ring visible on all interactive elements
- Form labels: Every `<input>` has an associated `<label>` or `aria-label`
- Icon-only buttons: Have `aria-label` describing the action
- Error messages: Linked to form fields via `aria-describedby`
- Keyboard nav: All interactive elements reachable via Tab; no trapped focus
- Motion: Animations respect `prefers-reduced-motion`

**Examples:**
- ✅ GOOD: "Button has visible focus ring (outline-2 outline-offset-2). Text contrast 5.2:1. aria-label added for icon-only variants."
- ✅ GOOD: "Form labels present and associated. Error messages use aria-describedby. Tab order is logical."
- ✅ GOOD: "Hero animation uses prefers-reduced-motion media query."
- ❌ BAD: "No focus states on buttons"
- ❌ BAD: "Form submit button has no aria-label"
- ❌ BAD: "Text contrast 3.1:1 on small text" (needs 4.5:1)
- ❌ BAD: "Animation doesn't respect prefers-reduced-motion"

**How to verify:**
- Install axe DevTools browser extension (free)
- Run axe scan on page. Fix critical and serious issues.
- Manually: Tab through page (Shift+Tab backward). Are focus indicators visible? Is focus order logical?
- Use Chrome DevTools → Lighthouse → Accessibility. Fix "Failing audits" items.
- Check WCAG AA contrast with WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

---

### 5. CTAs Have Real Destination OR Placeholder Documented ✅

**What:** Every Call-to-Action (button, link, CTA text) either:
- Points to a real page/route that exists, OR
- Explicitly documents the placeholder (e.g., `#tbd-contact-form`) with a note in comments

**Placeholders are ALLOWED during development** but must be:
- Marked clearly with `#tbd-` prefix
- Documented in implementation-log.md explaining what will replace it
- Tracked in product-backlog.md as a dependent story

**Examples:**
- ✅ GOOD: `<a href="/contact">Request Demo</a>` (real page exists)
- ✅ GOOD: `<a href="/ai-agents">Learn More</a>` (real page in backlog, linked)
- ✅ GOOD: `<Button href="#tbd-book-call" onClick={() => alert('Coming soon')}>Book Call</Button>` + implementation-log note: "Booking flow to be implemented in Phase 3 (US-229)"
- ❌ BAD: `<a href="#">Learn More</a>` (dead link, no documentation)
- ❌ BAD: `<Button onClick={() => console.log('TODO')}>Submit</Button>` (no documented plan)
- ❌ BAD: CTA points to a page that doesn't exist (not even in backlog)

**How to verify:**
- Click every CTA on the page/component. Does it go somewhere real?
- If it shows `#tbd-`, search implementation-log.md for explanation of what will replace it.
- Check product-backlog.md: Is the dependent story (e.g., "Book call flow") scheduled?

---

### 6. No Sample Company Data ✅

**What:** The story does NOT hardcode or reference sample company names, fake data, or example data from other companies. Use GetUpSoft or generic placeholders only.

**Forbidden:**
- ❌ Galantes, Galantesjewelry, Starbucks, Microsoft, etc.
- ❌ Fake team member names
- ❌ Made-up certifications or partnerships
- ❌ Copy from other companies' websites (paraphrased or not)

**Allowed:**
- ✅ GetUpSoft, Inteligencia Operacional, Arquitectura Digital
- ✅ Generic placeholders: "[Company Name]", "[Industry]", "[Metric]"
- ✅ Verified GetUpSoft claims from master prompt §9

**Examples:**
- ✅ GOOD: "GetUpSoft helps [company] implement Odoo integration in [industry]."
- ✅ GOOD: "Our methodology: Audit → Design → Delivery → Scale."
- ✅ GOOD: Features listed generically: "Inventory management, Sales automation, Reporting"
- ❌ BAD: "Galantes increased revenue by 45%" (sample data from another company)
- ❌ BAD: "Starbucks uses our platform" (invented partnership)
- ❌ BAD: "Team: Sarah, Mike, Jennifer, Elena" (fake people)

**How to verify:**
- Search component/page copy for proper nouns and company names
- Check docs/content-source-map.md: Is every claim traced to a verified source?
- Compare with master prompt §9 (content requirements): Does story match spec?

---

### 7. No Hardcoded Secrets ✅

**What:** The story contains NO API keys, tokens, credentials, passwords, or sensitive configuration in the code. All secrets come from environment variables (`.env`).

**Examples:**
- ✅ GOOD: `const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL`
- ✅ GOOD: `const apiKey = process.env.ODOO_API_KEY` (private to server only)
- ✅ GOOD: `.env.example` has placeholders: `ODOO_API_KEY=your_key_here`
- ❌ BAD: `const apiKey = "sk-1234567890abcdef"` (hardcoded in code)
- ❌ BAD: `fetch("https://api.example.com?key=secret123")`
- ❌ BAD: `.env` file committed to git with real values

**How to verify:**
- Search code for common secret patterns: `api_key=`, `token=`, `password=`, `secret=`, quoted long strings
- Run: `grep -r "sk-\|ghp_\|sv_live_" src/ tests/` (catches common secret prefixes)
- Confirm: `.env` file is in `.gitignore`
- Confirm: All environment-specific values read from process.env

---

### 8. Public Claims in docs/content-source-map.md ✅

**What:** Every factual claim in the content (e.g., "Odoo is the most flexible ERP" or "GetUpSoft serves 500+ companies") is documented with a source or marked as internal.

**Examples:**
- ✅ GOOD: Claim: "Odoo is open-source" → Source: https://www.odoo.com/ (verified)
- ✅ GOOD: Claim: "GetUpSoft integrates 50+ systems" → Source: Master Prompt §9.1 (internal spec)
- ✅ GOOD: Claim: "DGII compliance required in Dominican Republic" → Source: master prompt or verified external source
- ❌ BAD: Claim: "GetUpSoft is the #1 platform" (unverified, contradicts master prompt honesty rule)
- ❌ BAD: Claim: "We have 1000+ happy customers" (not documented anywhere)
- ❌ BAD: Claim: "Odoo is the only ERP that does X" (probably wrong, unverified)

**How to verify:**
- For every factual claim in the new content, search docs/content-source-map.md
- If claim is missing, add it with source or mark as internal
- Check source is verifiable (not another company, not made up)

---

### 9. Lint / Build / Tests Executed (or Documented Failure) ✅

**What:** The story includes the output of running:
- `npm run build` — Must succeed (exit 0)
- `npm run lint` — Must pass (if available)
- `npm run test` — Must pass or be marked skipped with reason
- `npm run typecheck` (if separate from build) — Must pass

If any command fails, document:
- The exact command and error message
- Root cause analysis
- Proposed fix (even if not implemented)
- Whether it's blocking story completion or acceptable for next phase

**Examples:**
- ✅ GOOD: "npm run build succeeded. No errors."
- ✅ GOOD: "npm run lint: PASSED. No ESLint violations."
- ✅ GOOD: "npm run test: 42 tests passed. Coverage 85%."
- ❌ BAD: "Didn't run build" (missing evidence)
- ❌ BAD: "npm run build failed but it's fine" (no root cause, no fix plan)
- ❌ BAD: (Build error exists but not documented)

**How to verify:**
- Run commands locally before marking DONE:
  ```bash
  cd apps/site
  npm run build        # Must exit 0
  npm run lint         # If available
  npm run test         # If available
  ```
- Copy output to implementation-log.md with timestamp
- If error, analyze: What broke? Why? How to fix?

---

### 10. docs/implementation-log.md Updated ✅

**What:** The story has an entry in the implementation log documenting:
- Story ID and title
- What was done (changes, files, logic)
- Commands executed and results
- Any blockers or decisions made
- Timestamp and model/owner who completed it

**Example log entry:**
```markdown
## US-102 — Build Button Component

**Owner:** Codex  
**Started:** 2026-05-21 14:30  
**Completed:** 2026-05-21 16:45

### What was done
- Created src/components/Button.tsx with 5 variants
- Added Storybook stories for each variant
- Implemented focus states and accessibility

### Files created/modified
- `src/components/Button.tsx` (150 lines)
- `src/components/Button.stories.tsx` (80 lines)
- `src/components/__tests__/Button.test.tsx` (45 lines)

### Commands executed
```bash
npm run build        # ✅ PASSED
npm run lint         # ✅ PASSED
npm run test         # ✅ 8 tests passed
```

### Accessibility
- ✅ Focus visible on all variants
- ✅ Color contrast > 4.5:1
- ✅ No console warnings

### Decisions
- Used Tailwind CSS for styling (matches design system)
- Icon variants use aria-label, not visible text

### Blockers
None. Ready for code review.

### Next
Code review + merge to main.
```

**How to verify:**
- Story ID appears in implementation-log.md
- Entry has all sections: What, Files, Commands, Accessibility (if relevant), Decisions, Next
- Timestamp is recent (today or yesterday)

---

### 11. Product Backlog Updated ✅

**What:** The product-backlog.md file reflects the completion of this story:
- Story status changed from `⏳ TODO` or `🔄 IN PROGRESS` to `✅ DONE`
- Any dependencies are marked (e.g., "Blocks US-202")
- Timestamp of completion recorded

**How to verify:**
- Open product-backlog.md
- Search for the story ID (e.g., US-102)
- Status is `✅ DONE`
- Backlog reflects updated project state

---

### 12. Code Review Passed (For Critical Changes) ✅

**What:** For stories that modify core architecture, security, or critical paths:
- Code has been reviewed by Claude (via getupsoft-code-review skill)
- Reviewer checked: architecture alignment, design system compliance, security, accessibility, i18n correctness
- Review is documented in implementation-log.md or as a comment in the PR

**Exception:** Simple stories (e.g., "Update contact form label") may skip formal review if no architectural impact.

**What requires review:**
- ✅ Any component changes to design system
- ✅ Any ERP provider implementation
- ✅ Any lib/ changes
- ✅ Any i18n system changes
- ✅ Any form validation or security-relevant changes

**What doesn't require review:**
- ✅ Content/copy updates (already reviewed by ChatGPT/Product Owner)
- ✅ Simple styling fixes
- ✅ Documentation updates
- ✅ Non-critical label updates

**Examples:**
- ✅ GOOD: "Code review completed by Claude (getupsoft-code-review skill). ✅ APPROVED. All items checked. Ready to merge."
- ✅ GOOD: "Simple content update, no code review needed."
- ❌ BAD: "Code review pending" (not done, story can't be marked DONE)
- ❌ BAD: (Architecture changed, no review at all)

**How to verify:**
- For critical changes: implementation-log.md or GitHub PR has review comment from Claude
- Review covers: architecture, design system, security, accessibility, i18n
- Status is ✅ APPROVED (not pending or rejected)

---

## Done Checklist Template

Copy into story or mark in sprint board:

```markdown
## Definition of Done Checklist

- [ ] **Implemented:** Code/content fully written and committed
- [ ] **ES/EN:** Both languages (if applicable)
- [ ] **Responsive:** Tested on mobile < 768px, tablet 768–1024px, desktop > 1024px
- [ ] **Accessibility:** Focus states, labels, aria-label, contrast ≥ 4.5:1, motion respected
- [ ] **CTAs:** Real destination or `#tbd-` placeholder documented
- [ ] **No sample data:** No hardcoded company names or fake data
- [ ] **No secrets:** All credentials from .env, not hardcoded
- [ ] **Source map:** All claims in docs/content-source-map.md
- [ ] **Build:** `npm run build` ✅ PASSED, lint ✅ PASSED, test ✅ PASSED (or documented failure)
- [ ] **Log:** Entry in docs/implementation-log.md with details
- [ ] **Backlog:** Product-backlog.md updated (status = ✅ DONE)
- [ ] **Review:** Code review ✅ APPROVED (if architectural)

**Ready to merge:** YES / NO
```

---

## Not-Done Story Examples

### ❌ Bad: Build Passed but No Tests
```
Component: Button implemented.
npm run build: ✅ PASSED
npm run test: ❌ FAILED (3 tests failed)
Log entry: None
Review: Pending
```
→ **Issue:** Tests failed, no explanation, no fix plan. Not done.
→ **Fix:** Run tests, analyze failures, fix code, re-run until all pass, then mark DONE.

### ❌ Bad: Only English
```
Contact Form implemented.
Copy: English labels only. Spanish missing.
i18n: Not implemented.
```
→ **Issue:** Master prompt requires ES/EN. Incomplete.
→ **Fix:** Add content/site.es.ts with Spanish labels, integrate into form, verify both languages work.

### ❌ Bad: No Accessibility Check
```
Hero component built.
Focus states: Not visible (no outline).
aria-label: Not added to image.
Contrast: Measured at 3.2:1 (below 4.5:1 baseline).
```
→ **Issue:** Accessibility failed.
→ **Fix:** Add focus outline, aria-labels, increase contrast to 4.5:1 minimum. Re-test with axe DevTools.

### ❌ Bad: Hardcoded Secret
```python
ODOO_API_KEY = "odoo_abc123_secret"
```
→ **Issue:** Secret in code.
→ **Fix:** Move to .env, use `process.env.ODOO_API_KEY`, add `.env.example` placeholder.

---

## Workflow: From In Progress → Review → Done

1. **In Progress:** Model working on story, updating implementation-log.md
2. **Review:** Model submits for code review (if needed) or requests merge
3. **Review Passed:** Claude approves, documents in implementation-log.md
4. **Done:** All 12 criteria met, story merged, status updated in product-backlog.md, logged as complete

---

## Who Enforces This?

**Model executing story (Codex, ChatGPT, etc.):**
- Responsible for doing the work and documenting completion
- Runs all required tests and commands
- Submits for review when ready

**Claude (Code Reviewer):**
- Reviews critical changes for architecture, security, accessibility alignment
- Approves or requests changes
- Marks story as ready to merge

**Claude (Scrum Master):**
- Verifies all 12 criteria before accepting story as DONE
- Rejects incomplete stories with specific feedback
- Updates sprint board and product backlog

---

## Continuous Improvement

After each sprint:
1. Review stories marked DONE. Were they truly complete?
2. Identify which criterion was overlooked or misunderstood
3. Update this guide with examples or clarifications
4. Share learning in sprint retro

---

_Definition of Done v1.0 · Created 2026-05-19 · Enforced by Claude Code Review & Scrum Master_
