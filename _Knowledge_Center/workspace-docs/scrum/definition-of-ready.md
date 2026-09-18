# 📋 Definition of Ready — GetUpSoft Website Redesign

**Purpose:** Criteria for accepting a story into the sprint  
**Reference:** Master Prompt §17.3  
**Last Updated:** 2026-05-19

---

## The 10-Criteria Checklist

A story is **READY** for sprint intake ONLY when it meets all 10 criteria:

### 1. Clear Business Objective ✅

**What:** The story has a clear, measurable business goal.

**Examples:**
- ✅ GOOD: "Build Button component matching design system so developers can use consistent styled buttons"
- ✅ GOOD: "Write Home page copy (ES/EN) to establish brand voice and communicate value proposition"
- ❌ BAD: "Do some stuff to the hero component"
- ❌ BAD: "Implement forms" (too vague)

**How to verify:** Read story title + description. If you can't summarize the WHY in one sentence, it's not ready.

---

### 2. Affected Section / Page Identified ✅

**What:** The story specifies which page, section, or component it touches.

**Examples:**
- ✅ GOOD: "Home page Hero section"
- ✅ GOOD: "Contact form validation logic"
- ✅ GOOD: "Navigation header on all pages"
- ❌ BAD: "Global updates" (ambiguous)
- ❌ BAD: "Backend stuff" (not specific to a feature)

**How to verify:** Story has a clear file path or page reference. Use product-backlog.md as source of truth for page inventory.

---

### 3. Content ES/EN OR Responsible Person Assigned ✅

**What:** If story requires copy (pages, forms, CTAs), both ES and EN versions are assigned or already available. If purely technical, owner is named.

**Examples:**
- ✅ GOOD: "Copy assigned to ChatGPT (US-201: Write Home ES/EN)"
- ✅ GOOD: "Content exists in content/site.es.ts and content/site.en.ts"
- ✅ GOOD: "Technical task, assigned to Codex"
- ❌ BAD: "Copy needed but no owner"
- ❌ BAD: "English only (missing ES)"

**How to verify:** Story has "Assigned to: [Model/Person]" field. If copy-dependent, both ES and EN are accounted for.

---

### 4. Model / Agent Responsible Assigned ✅

**What:** The story names which AI model or human will execute it.

**Models per master prompt §14:**
- **Claude** — Orchestration, architecture, code review, Scrum
- **Codex** — Implementation (components, pages, forms, tests)
- **ChatGPT** — Content (copy, docs, SEO, FAQs)
- **Gemini** — Visual design (UI mockups, icons)
- **NVIDIA** — Support tasks (translation, summarization, drafts)

**Examples:**
- ✅ GOOD: "Assigned to Codex" (for implementation)
- ✅ GOOD: "Assigned to ChatGPT" (for copy)
- ✅ GOOD: "Claude reviews" (for code review)
- ❌ BAD: "Someone will do it"
- ❌ BAD: (No owner specified)

**How to verify:** Story has Owner field in product-backlog.md. Owner is one of the 5 models or a named human role.

---

### 5. Verifiable Acceptance Criteria ✅

**What:** The story defines 3–5 concrete acceptance criteria that can be tested (not opinions or subjective goals).

**Examples:**
- ✅ GOOD:
  ```
  - [ ] Button renders with 5 variants (primary, secondary, ghost, warning, pill)
  - [ ] Hover and focus states visible
  - [ ] Accessible to keyboard + screen reader
  ```
- ✅ GOOD:
  ```
  - [ ] Contact form accepts name, email, message
  - [ ] Validates email format before submit
  - [ ] Shows error message if required field empty
  ```
- ❌ BAD: "Make it look nice" (subjective)
- ❌ BAD: "Implement the form" (too vague)

**How to verify:** Read acceptance criteria. Could a QA tester verify each one? If yes, it's good. If it requires interpretation, rewrite it.

---

### 6. Dependencies Identified ✅

**What:** The story explicitly lists what must be completed BEFORE this story can start.

**Examples:**
- ✅ GOOD: "Depends on US-101 (design system tokens defined)"
- ✅ GOOD: "Blocks US-203 (awaits copy from US-201)"
- ✅ GOOD: "No dependencies"
- ❌ BAD: (No dependency field)
- ❌ BAD: "Probably needs other stuff"

**How to verify:** Story has "Depends On:" field listing story IDs. Cross-check that those stories are in progress or done. If not, story is NOT ready.

---

### 7. No Real Secrets Needed to Start ✅

**What:** The story does NOT require real API keys, credentials, or production data to begin work. Use `.env.example`, mock providers, or sample data only.

**Examples:**
- ✅ GOOD: "Use mock provider to test form submission"
- ✅ GOOD: "Read credentials from .env.example (no real keys needed)"
- ✅ GOOD: ".env provided with placeholder values"
- ❌ BAD: "Need Odoo credentials to start"
- ❌ BAD: "Requires production database access"

**How to verify:** Story does NOT ask for real secrets. `.env.example` is sufficient for development.

---

### 8. Does NOT Contradict Odoo as Primary ERP ✅

**What:** The story respects master prompt rule §5.2: **Odoo is primary ERP. ERPNext, iSeries, SAP are integrable but NOT primary.**

**Examples:**
- ✅ GOOD: "Implement Odoo provider with real integration path"
- ✅ GOOD: "Implement ERPNext stub with clear error message 'Not yet integrated'"
- ✅ GOOD: "ERP selector: if Odoo, proceed; if other, show 'Coming soon'"
- ❌ BAD: "Make ERPNext equal to Odoo"
- ❌ BAD: "Default to SAP instead of Odoo"
- ❌ BAD: "Multiple ERPs without Odoo priority"

**How to verify:** Read story. Does it maintain Odoo as primary? If not, it's not ready.

---

### 9. Risks Identified ✅

**What:** The story documents known risks or uncertainties. Examples:
- Technical risk (complex integration, unknown library behavior)
- Resource risk (depends on unavailable model/person)
- Architectural risk (affects multiple systems)
- Timeline risk (depends on external API)

**Examples:**
- ✅ GOOD: "Risk: Odoo API connection may timeout. Mitigation: Implement retry with backoff."
- ✅ GOOD: "Risk: Hero images large, may impact LCP. Mitigation: Lazy-load below fold."
- ✅ GOOD: "Risk: i18n strategy not finalized. Mitigation: Use next-intl stub."
- ❌ BAD: (No risk field)
- ❌ BAD: "This should be fine"

**How to verify:** Story has "Risks:" field. If complex or novel work, at least one risk is listed with mitigation.

---

### 10. Rollback Criteria (if architecture-touching) ✅

**What:** If the story modifies architecture, establishes new patterns, or changes core abstractions, it defines how to undo it safely.

**Examples:**
- ✅ GOOD: "If lib/erp/ breaks, revert commit [hash] and restore previous provider interface"
- ✅ GOOD: "If design tokens change, can revert BEFORE deploying to production"
- ✅ GOOD: "Not architecture-touching, no rollback needed"
- ❌ BAD: "Just rebuild if it breaks"
- ❌ BAD: (No rollback plan for breaking change)

**How to verify:** If story is non-architectural (simple component or page), note "Not needed." If architectural, rollback plan must be concrete.

---

## Ready Checklist Template

Copy into story description or acceptance criteria:

```markdown
## Definition of Ready Checklist

- [ ] **Objective:** Clear business goal (not a task description)
- [ ] **Scope:** Affected section/page identified
- [ ] **Content:** ES/EN assigned or owner named
- [ ] **Owner:** Model/agent responsible assigned
- [ ] **Criteria:** 3–5 verifiable acceptance criteria
- [ ] **Dependencies:** Blockers identified, or "none"
- [ ] **Secrets:** No real credentials needed to start
- [ ] **Odoo:** Maintains Odoo as primary ERP
- [ ] **Risks:** Identified with mitigation
- [ ] **Rollback:** Defined (if architectural) or "Not needed"

**Ready for Sprint:** YES / NO
```

---

## Not-Ready Story Examples

### ❌ Bad: Too Vague
```
Title: Update things
Description: Do some improvements to the site.
Acceptance Criteria: Make it better.
```
→ **Issue:** No clear objective, scope, or criteria.
→ **Fix:** "Build Button component with 5 variants (primary, secondary, ghost, warning, pill) matching design-system.md. Acceptance: [list 3 specific criteria]."

### ❌ Bad: Missing Dependencies
```
Title: Implement Contact Form
Description: Build the form.
Depends On: (none listed)
Risk: Validation schema not designed yet.
```
→ **Issue:** Form validation depends on Zod schema (which isn't designed). Story can't start.
→ **Fix:** "Depends On: US-227 (validation schema done). Then implement form."

### ❌ Bad: No Owner
```
Title: Write Contact Page Copy
Description: ES and English versions needed.
Owner: (blank)
```
→ **Issue:** No one assigned.
→ **Fix:** "Owner: ChatGPT. Copy to: content/site.es.ts + content/site.en.ts."

---

## Workflow: From Backlog → Ready → Sprint

1. **Backlog:** Story exists but not ready (missing criteria, no owner, etc.)
2. **Ready:** Story passes all 10 criteria above.
3. **Sprint:** Story pulled into sprint board and work begins.
4. **In Progress:** Model claims and starts work.
5. **Review:** Work submitted for review.
6. **Done:** Work passes code review + QA + Definition of Done.

---

## Who Enforces This?

**Claude (Scrum Master):**
- Rejects stories that don't meet criteria before pull into sprint
- Escalates ambiguous stories to Product Owner (Joel) for clarification
- Documents rejection reason in implementation-log.md

**Product Owner (Joel):**
- Provides business objective clarity for rejected stories
- Assigns owners and content creators
- Makes Go/No-Go decisions on risky stories

---

## Continuous Improvement

After each sprint:
1. Review which stories were "ready but had issues during implementation"
2. Identify which criterion was missed or misunderstood
3. Update this guide with examples or clarifications
4. Share learning with team

---

_Definition of Ready v1.0 · Created 2026-05-19 · Enforced by Claude Scrum Master_
