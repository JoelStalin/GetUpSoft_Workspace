# AGENTS.md — GetUpSoft Website Redesign

**Purpose:** Shared rules and instructions for all agents (Codex, Claude, ChatGPT, Gemini, NVIDIA) working on the GetUpSoft Website Redesign project.

---

## Prerequisite Reading

Before working on this project, read these in order:

1. **Master Prompt** (5–10 min skim; 30 min full read)
   - File: `prompts/master/getupsoft-redesign-master-prompt.md`
   - Key sections: §0 (vision), §2 (rules), §17 (backlog), §21 (tasks)

2. **Agent State** (5 min)
   - File: `docs/agent-state.md`
   - Tells you: current branch, stack, pages status, i18n state, forms status, design system status

3. **Current Sprint** (3 min)
   - File: `docs/scrum/sprint-[N].md` (e.g., sprint-0.md)
   - Tells you: what stories are TODO, In Progress, Review, DONE

---

## Repository Rules (Non-Negotiable)

### 1. Odoo is the Primary ERP

✅ GetUpSoft uses Odoo as the primary ERP for:
- CRM (leads, contacts, opportunities)
- Sales (sales orders, quotations, invoicing)
- Inventory (stock control, barcoding)
- Accounting (general ledger, reconciliation)
- POS (point-of-sale systems)
- Reporting & analytics

❌ ERPNext, IBM iSeries, and SAP are **NOT** primary. They are:
- Integratable via connectors
- Shown as integration partners (not GetUpSoft products)
- NOT presented with depth they don't have
- Implemented as stubs with clear error messages ("Not configured")

### 2. Content Must Be Bilingue (ES/EN)

✅ **Every public page and form** must have:
- Spanish (ES) version
- English (EN) version

❌ **Do NOT:**
- Hardcode copy in components
- Translate in your head (both languages must be present in codebase)
- Skip copy for "I'll add it later" (add to Definition of Done checklist)

### 3. No Real Company Data or Invented Claims

❌ **Forbidden:**
- Copy data/names from Galantes or other real companies
- Invent certifications ("ISO 9001 certified" — not verified)
- Invent partnerships ("Official Odoo Partner" — not confirmed)
- Invent client testimonials
- Invent metrics ("99.9% SLA" — not proven)

✅ **Do this instead:**
- Use placeholder content if unknown: "[Company claim pending verification]"
- Mark all public claims in `docs/content-source-map.md`
- Only include verified facts

### 4. No Secrets Hardcoded

✅ **All secrets in `.env`:**
- API keys
- Database credentials
- Third-party API tokens
- Private URLs

❌ **Never:**
- Commit `.env` (it's in `.gitignore`)
- Hardcode secrets in code
- Put secrets in logs
- Share credentials via chat

### 5. Respect the Definition of Done

Each story is DONE only when **ALL** of these are checked:

- [ ] Code/content implemented
- [ ] Copy ES/EN completed (both languages present)
- [ ] UI responsive (mobile, tablet, desktop)
- [ ] Accessibility reviewed (WCAG AA baseline)
- [ ] CTAs with real destinations (no #tbd- placeholders in prod)
- [ ] No sample company data
- [ ] No hardcoded secrets
- [ ] All public claims in `docs/content-source-map.md`
- [ ] Lint/build/test passed OR failure documented with fix
- [ ] `docs/implementation-log.md` updated
- [ ] Backlog status updated
- [ ] Code review passed (if critical)

### 6. Never Skip a Phase Gate

Phase gates are real blockers:

❌ **Do NOT:**
- Start Phase 1 before Sprint 0 is DONE
- Start Phase 2 before Phase 1 is complete and tested
- Start Phase 5 (QA) before Phases 1–4 are complete

✅ **Always:**
- Verify all stories in phase are DONE
- Run phase verification (lint, tests, accessibility, build)
- Update `docs/verification-report.md`
- Get approval before moving forward

### 7. Update Documentation After Work

Every agent session must update:

| File | What | When |
|---|---|---|
| `docs/implementation-log.md` | Commands run, files created, issues, fixes | After major block of work |
| `docs/decision-log.md` | Why decisions were made, alternatives considered | Immediately when decision made |
| `docs/scrum/sprint-[N].md` | Story state changes (TODO → In Progress → Review → DONE) | When story state changes |
| `docs/handoff.md` | Session summary, next priorities, blockers | Session end |

---

## Workflow for Every Task

### 1. Claim a Story

Find a story in "Ready" status in `docs/scrum/sprint-[N].md`:

```
| US-010 | Build Hero Component | Ready | — | 3h | 2026-05-21 |
```

Update to "In Progress":

```
| US-010 | Build Hero Component | In Progress | [Your Name] | 3h | 2026-05-21 |
```

### 2. Read the Story Details

Story format (in sprint-[N].md):

```markdown
### US-010 — Build Hero Component

**Acceptance Criteria:**
- Hero displays on desktop and mobile
- Headline, subheading, 2 CTAs visible
- Uses design system tokens (colors, spacing)
- Responsive: Desktop 2-col, mobile 1-col
- Accessible: WCAG AA (contrast, focus, ARIA)

**Dependencies:**
- Design system must be complete (docs/design-system.md)
- Content provided in content/site.es.ts and content/site.en.ts
- No Codex-specific tasks; Claude solo

**Owner:** Codex

**Estimated Effort:** 3 hours

**Definition of Done:**
- [x] Component created (Hero.tsx)
- [x] Props defined with TypeScript
- [x] Content pulled from i18n system (not hardcoded)
- [x] Responsive design tested (DevTools)
- [x] Accessibility (contrast, focus) checked
- [x] No console errors
- [x] Story in docs/scrum/sprint-0.md marked DONE
```

### 3. Implement

Do the work following:
- Master prompt rules (§2: execution rules)
- Definition of Done checklist
- Design system (if Phase 1+ exists)
- TypeScript strict mode
- No hardcoded secrets

### 4. Test Locally

Before marking DONE:

```bash
cd apps/site
npm install
npm run build       # Must succeed, zero errors
npm run dev         # Run locally, test feature
```

### 5. Update Docs

Add entry to `docs/implementation-log.md`:

```markdown
### Session [N]: [Your Name] — US-010

**Work:** Build Hero component  
**Files created:** apps/site/src/components/Hero.tsx  
**Files modified:** apps/site/src/pages/global/Home.tsx (imported Hero)  
**Commands:** npm install, npm run build, npm run dev  
**Time:** 2.5 hours  
**Status:** ✅ DONE  

**Tests:**
- Responsive: Desktop 2-col, mobile 1-col ✅
- Contrast: #E5E7EB text on #070B12 background ✅
- Focus: Keyboard nav works ✅
- No console errors ✅

**Issues encountered:** None  
**Decisions:** Used `useEffect` for viewport tracking (simpler than Resize Observer)  

**Next:** PR-ready; awaiting code review
```

### 6. Mark Story DONE

Update `docs/scrum/sprint-[N].md`:

```
| US-010 | Build Hero Component | Done | Codex | 3h | 2026-05-21 ✅ |
```

---

## Skill Selection (For Agent Dispatch)

When Claude orchestrator delegates work, agents use these skills:

| Agent | Skill | Used For | Files They Modify |
|---|---|---|---|
| **Codex** | getupsoft-implementation | Components, pages, forms, integration | `apps/site/src/**/*.tsx`, `lib/erp/**/*.ts` |
| **ChatGPT** | getupsoft-docs-copy | Copy ES/EN, documentation | `content/site.*.ts`, `docs/**/*.md` |
| **Gemini** | (prompt-based, no skill file) | UI/visual concepts | Design assets (Figma, specs) |
| **NVIDIA free** | (prompt-based) | Translation, classification, drafts | Any non-critical task |
| **Claude** | getupsoft-orchestrator | Planning, Scrum, decision-making | `docs/**/*.md`, `prompts/**/*.md` |

---

## Communication & Blockers

### If You Hit a Blocker

1. **Document immediately:**
   ```
   docs/scrum/risks-blockers.md:
   
   | Risk | Severity | Mitigation | Owner | Status |
   |---|---|---|---|---|
   | Design system not ready | High | Codex blocked on Phase 1 | Claude | Escalated |
   ```

2. **Add to implementation-log.md:**
   ```markdown
   **Blocker:** Design system file (docs/design-system.md) doesn't exist yet.
   Can't proceed with Hero component (needs token definitions).
   **Mitigation:** Waiting for Phase 1 completion.
   ```

3. **Do NOT:**
   - Make up design system values
   - Work around the blocker
   - Ignore the blocker and move on

### If You Need Clarification

1. Check `docs/decision-log.md` (similar questions may be answered)
2. Check master prompt (§6–§9 usually have answers)
3. If still unclear: Document the ambiguity and escalate to Claude orchestrator

### If You Find a Bug in Existing Code

1. Document in implementation-log.md
2. Create issue/comment in decision-log.md
3. Fix if it's in your scope; escalate if it's architecture-level

---

## Key Files You'll Need

| File | Purpose | Updated By | Read When |
|---|---|---|---|
| `prompts/master/getupsoft-redesign-master-prompt.md` | Master spec (immutable) | Never | Session start |
| `docs/agent-state.md` | Repo state snapshot | Claude | Session start |
| `docs/implementation-log.md` | Work log | All agents | Session start, session end |
| `docs/decision-log.md` | Architecture decisions | Claude | When confused about why |
| `docs/scrum/sprint-[N].md` | Current sprint board | All agents | Before claiming story |
| `docs/scrum/product-backlog.md` | Full backlog | Claude | Sprint planning |
| `docs/design-system.md` | Color, typography, components | Claude/Codex | Phase 1+ start |
| `docs/content-architecture.md` | Routes, SEO, content structure | Claude | Phase 2 start |
| `docs/brand-voice.md` | Tone, vocabulary, ES/EN voice | ChatGPT | When writing copy |
| `.env.example` | What secrets/vars to provide | Codex | Phase 3 (ERP) |

---

## Build & Test Commands

```bash
# Navigate to site
cd apps/site

# Install dependencies
npm install

# Run development server
npm run dev              # Local dev: http://localhost:5173

# Build for production
npm run build            # Must succeed with zero errors

# Type check (part of build)
npx tsc --noEmit        # Standalone type check

# Run tests (if tests exist)
npm run test

# Run e2e tests (Selenium)
npm run test:e2e:selenium

# Build preview
npm run preview          # Local preview of production build
```

---

## Phase Structure (Don't Skip!)

```
PHASE 0 (Pre-flight)
├─ Sprint 0 (US-000 to US-009)
│  └─ Completion gates: All docs, skills, backlog ready

PHASE 1 (Design System & Layout)
├─ Design system tokens, components, Header, Footer
└─ Completion gates: Design system doc done, tokens work, responsive

PHASE 2 (Pages & Content)
├─ Home Global, Home RD, AI Agents, Integrations, ERP & Billing, Infrastructure, Industries, Products, Methodology, About, Contact, Diagnostic
└─ Completion gates: All 12 pages work, responsive, copy ES/EN

PHASE 3 (Forms & Integration)
├─ Form validation, POST /api/leads, lib/erp/, ERP providers
└─ Completion gates: Forms submit, ERP mocked, Odoo path ready

PHASE 4 (DevOps)
├─ Dockerfile, CI/CD, Google Cloud readiness
└─ Completion gates: Docker build succeeds, GCP docs ready

PHASE 5 (QA)
├─ Lint, tests, accessibility, performance, E2E smoke tests
└─ Completion gates: All checks pass, ready for production
```

---

## Expected to Understand

- **JavaScript/TypeScript:** For Codex (implementing pages/forms)
- **React 18:** For Codex (component architecture)
- **TailwindCSS:** For Codex (styling system)
- **Python/FastAPI:** For Claude/Codex (Orca integration reference, not implementation)
- **Git:** All agents (commits, branches, logs)
- **Master prompt:** All agents (know what's allowed, what's forbidden)

---

## Expected to Ask For Help

- Architectural questions → Claude orchestrator (use getupsoft-orchestrator skill)
- Code review → Claude (use getupsoft-code-review skill)
- Design validation → Claude (use getupsoft-design-auditor skill)
- Content/copy strategy → ChatGPT (via Claude delegation)
- Visual/UI concepts → Gemini (via Claude delegation)

---

## Examples of Good Work

✅ **Codex implements Contact form:**
- Uses TypeScript types
- Zod validation
- Client + server-side validation
- Loading/success/error states
- No hardcoded copy (pulled from i18n)
- Responsive design
- WCAG AA accessibility
- Calls mock provider (not real API)
- Updates docs/implementation-log.md
- Marks story DONE

✅ **Claude decides on design system:**
- References master prompt §6
- Documents decision in docs/decision-log.md
- Creates docs/design-system.md with all tokens
- Makes file publicly visible (all agents can use it)

✅ **ChatGPT writes copy:**
- Both ES and EN provided
- Matches brand voice (docs/brand-voice.md)
- No made-up claims
- All claims traceable to source (content-source-map.md)

---

## Examples of Bad Work

❌ **Codex hardcodes copy:**
- "Contacto" appears in component (should be from i18n)
- Next agent won't know how to translate it

❌ **Claude skips documenting decision:**
- Chose design system colors without recording why
- Next agent asks: "Why teal?" → No answer

❌ **ChatGPT invents partnerships:**
- "Official Odoo Partner" in copy
- Joel didn't approve; now on public site

❌ **Any agent skips Definition of Done:**
- Says "form is 90% done, can come back to accessibility later"
- Phase 5 QA finds accessibility issues; have to rework

---

## Support

- **Questions about master prompt?** → See §0–21 (it's complete)
- **Questions about repo state?** → See docs/agent-state.md
- **Questions about why a decision?** → See docs/decision-log.md
- **Questions about what's next?** → See docs/scrum/sprint-[N].md
- **Questions about brand/tone?** → See docs/brand-voice.md
- **Questions about design?** → See docs/design-system.md
- **Questions about how to proceed?** → Ask Claude (orchestrator skill)

---

**Final Rule:** If in doubt, read the master prompt and ask the orchestrator.  
**Good luck!** 🚀

---

_GetUpSoft Website Redesign · Shared Agent Rules v1.0 · Created 2026-05-19_
