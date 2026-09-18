# 🔀 Model Routing Matrix — GetUpSoft Website Redesign

**Purpose:** Define which AI model handles which task, with constraints and expected outputs  
**Updated:** 2026-05-19  
**Status:** Active (Phase 0–5)

---

## Model Assignments (Master Prompt §14)

### Claude Code — Orchestrator & Strategic Lead

**Primary Role:** Technical Product Owner, Scrum Master, Architecture Lead, Quality Reviewer

| Task Category | Specific Tasks | Constraints | Output |
|---|---|---|---|
| **Planning** | Sprint planning, epic decomposition, roadmap | Can see: master prompt, all docs, code. Cannot: implement UI, write final copy | Sprint board, task breakdown, timeline |
| **Architecture** | Design system decisions, component structure, ERP patterns | Must reference master prompt; escalate to Joel if scope change | Architecture docs, design-system.md, erp-integration.md |
| **Scrum** | Sprint ceremonies, story states, DoR/DoD enforcement, blockers | Enforce rigorously; no exceptions to phase gates | Sprint board updates, risk register |
| **Code Review** | Quality, security, accessibility, performance | Must check against master prompt §13; flag violations | Approval or required-changes report |
| **Decisions** | Why decisions made, alternatives considered, impact analysis | Document in decision-log.md immediately | Decision log entry |
| **Handoff** | Session summaries, continuity, context preservation | Update docs/handoff.md before session end | Updated handoff.md |

**Input Access (ALLOWED):**
- ✅ Master prompt (full)
- ✅ All docs (decision-log, implementation-log, etc.)
- ✅ Code (for review)
- ✅ Sprint board status
- ✅ Requirements from master prompt

**Input Access (PROHIBITED):**
- ❌ Real API credentials (Odoo, SMTP, etc.)
- ❌ Real customer data or PII
- ❌ Private team/company info not in public spec

---

### Codex — Implementation Lead

**Primary Role:** Build components, pages, forms, API endpoints, integrations

| Task Category | Specific Tasks | Constraints | Output |
|---|---|---|---|
| **Components** | React components (Button, Card, Form, Hero, etc.) | Must use design system tokens; no hardcoded styles | `.tsx` files with TypeScript strict |
| **Pages** | Page layouts, routing, responsive design | Must pull copy from i18n system, not hardcode | Complete `.tsx` pages, responsive |
| **Forms** | Validation, submission, error handling | Zod schemas; client + server validation; mock API by default | Functional forms, `.ts` validators |
| **ERP Integration** | lib/erp/ architecture, providers, API endpoints | Odoo real path; ERPNext/iSeries/SAP stubs with clear errors | `lib/erp/` module with all providers |
| **Tests** | Unit tests, E2E smoke tests (if applicable) | Focused on critical paths (forms, API, integrations) | Test files + coverage report |
| **Build Verification** | Type checking, linting, build success | `npm run build` must exit 0; no TypeScript errors | Build logs, error-free bundle |

**Input Access (ALLOWED):**
- ✅ Design system docs
- ✅ Content files (i18n)
- ✅ Component specs
- ✅ `.env.example` (what secrets to expect)

**Input Access (PROHIBITED):**
- ❌ Real `.env` with actual credentials
- ❌ Production API keys
- ❌ Customer data

**Success Criteria:**
- [ ] Code passes TypeScript strict mode
- [ ] Build succeeds with zero errors
- [ ] Components responsive (mobile, tablet, desktop)
- [ ] Forms validate and submit
- [ ] No hardcoded copy or secrets
- [ ] Accessibility baseline met

---

### ChatGPT — Content & Documentation Lead

**Primary Role:** Write copy, documentation, SEO metadata, FAQs, brand-aligned content

| Task Category | Specific Tasks | Constraints | Output |
|---|---|---|---|
| **Copy Writing** | Page headlines, subheadings, body copy, CTAs | Both ES and EN; verify all claims in source-map.md | `.md` or `.ts` content files |
| **Documentation** | Docs, READMEs, guides, API docs, deployment docs | Technical accuracy; link to sources | `.md` files in docs/ |
| **SEO Metadata** | Titles, meta descriptions, OpenGraph, schema.org | Per master prompt §13.1; unique per page | HTML/JSON-LD snippets |
| **FAQs** | Frequently asked questions & answers | Comprehensive; link to detailed docs | `.md` FAQ sections |
| **Brand Voice** | Tone guidelines, vocabulary (allowed/forbidden) | Per master prompt §8.3; enforce consistency | `docs/brand-voice.md` |

**Input Access (ALLOWED):**
- ✅ Master prompt (for tone, required content)
- ✅ Brand guidelines
- ✅ Public information (verified sources)
- ✅ Master prompt §9 (content requirements per page)

**Input Access (PROHIBITED):**
- ❌ Inventing certifications or partnerships
- ❌ Using data from Galantes or other companies
- ❌ Making unverified claims
- ❌ Hardcoding copy in components

**Success Criteria:**
- [ ] Both ES and EN versions written
- [ ] All claims verified (source-map.md)
- [ ] No invented data
- [ ] Brand voice consistent
- [ ] SEO metadata complete and unique per page
- [ ] No hardcoded company data

---

### Gemini — Visual & UI Design Lead

**Primary Role:** Create visual assets, UI concepts, design mockups, image generation

| Task Category | Specific Tasks | Constraints | Output |
|---|---|---|---|
| **Visual Design** | Component mockups, page layouts, visual hierarchy | Reference master prompt §6 (dark, enterprise, premium) | Figma designs, PNG mockups |
| **UI Concepts** | Interactive states, hover effects, animations | Accessible; respect `prefers-reduced-motion` | CSS code or design specs |
| **Image Generation** | Hero images, hero backgrounds, icons (if needed) | No real company logos unless verified; no deepfakes | `.png` images, `.svg` icons |
| **Wireframes** | Layout structure, responsive sketches | For communication before implementation | Sketches, wireframe images |
| **Icon Design** | Symbolic icons for capabilities, features | Consistent style; include alt text / aria-label | `.svg` files |

**Input Access (ALLOWED):**
- ✅ Master prompt visual direction (§6)
- ✅ Design system tokens (colors, spacing)
- ✅ Figma links for collaboration

**Input Access (PROHIBITED):**
- ❌ Real company logos (not authorized)
- ❌ Copyrighted images
- ❌ Real customer data in mockups

**Success Criteria:**
- [ ] Designs match master prompt visual direction
- [ ] Dark theme enforced (#070B12 background, #E5E7EB text)
- [ ] Enterprise/premium appearance
- [ ] Responsive layouts shown (mobile, tablet, desktop)
- [ ] Accessible color contrasts
- [ ] No copyrighted assets

---

### NVIDIA Free Models — Support & Lightweight Tasks

**Primary Role:** Boost productivity with low-cost, lightweight tasks

| Task Category | Specific Tasks | Constraints | Output |
|---|---|---|---|
| **Translation** | Translate borrow copy to ES or EN | Not final; Claude reviews | Draft translations |
| **Summarization** | Summarize docs, research, requirements | For communication; not decision-making | Summary docs |
| **Classification** | Tag backlog items, categorize tasks | For organization; human reviews | Tagged lists |
| **Draft Content** | Initial FAQ drafts, outline sketches | ChatGPT refines and finalizes | Draft `.md` files |
| **Variation Generation** | Alt text options, CTA variants, subject lines | Non-critical; Codex/ChatGPT picks best | Multiple options |

**Input Access (ALLOWED):**
- ✅ Non-critical content and docs
- ✅ Public information

**Input Access (PROHIBITED):**
- ❌ Credentials or secrets
- ❌ Final decision-making
- ❌ Architecture-level choices

**Success Criteria:**
- [ ] Output reviewed by higher-tier model (Claude, ChatGPT, Codex)
- [ ] No invented data
- [ ] Useful and actionable

---

## Delegation Template

When Claude delegates work to another model:

```markdown
## Delegation: [Task Title]

**To:** [Model Name]  
**Task ID:** [DEL-001, etc.]  
**Objective:** [What to accomplish]

### Input (What the model can see)
- ✅ Master prompt
- ✅ docs/brand-voice.md
- ✅ This delegation template
- ❌ Real API credentials
- ❌ Customer data

### Output (What we expect)
- File: [specific file path or format]
- Format: [markdown, .ts, .tsx, JSON, etc.]
- Criteria:
  - Criterion 1
  - Criterion 2
  - Criterion 3

### Reviewer
Claude (review for accuracy, brand compliance, completeness)

### Deadline
2026-05-[date] [time]

### Status
- Created: 2026-05-19
- Assigned: [date]
- Completed: [date]
- Reviewed: [date]

### Notes
[Any additional context or constraints]
```

---

## Model Communication Rules

### What Models Can Share

✅ **Safe to share:**
- Master prompt (non-sensitive spec)
- Docs (architecture, design, content guidelines)
- Code (to be reviewed)
- Requirements (from master prompt)

### What Models CANNOT Share

❌ **Never share:**
- Real API keys, credentials, tokens
- `.env` file (even sanitized) with real values
- Real customer data or PII
- Production database access
- Private team information

### Cross-Model Escalation

**Claude ←→ Codex:**
- Claude: "Codex, implement Hero component per design-system.md"
- Codex: [builds component]
- Claude: [reviews code, approves or requests changes]

**Claude ←→ ChatGPT:**
- Claude: "ChatGPT, write copy for /es/ai-agents per master prompt §9.3"
- ChatGPT: [writes copy]
- Claude: [reviews for brand voice, verifies claims, approves]

**Claude ←→ Gemini:**
- Claude: "Gemini, create Hero visual matching design system tokens"
- Gemini: [creates mockup]
- Claude: [verifies against master prompt §6, approves]

---

## Quality Gates (Per Model Output)

### Claude Output
- ✅ Passes: Aligns with master prompt, logically sound, well-documented
- ❌ Fails: Contradicts spec, missing justification, unclear direction

### Codex Output
- ✅ Passes: TypeScript strict, responsive, accessible, builds successfully
- ❌ Fails: Console errors, hardcoded values, no types, build fails

### ChatGPT Output
- ✅ Passes: Both ES & EN, verified claims, brand voice consistent, no invented data
- ❌ Fails: Only one language, unverified claims, invented data, wrong tone

### Gemini Output
- ✅ Passes: Matches design system, dark theme, professional, accessible
- ❌ Fails: Bright colors, copied assets, low contrast, non-enterprise appearance

### NVIDIA Output
- ✅ Passes: Useful, reviewed by higher-tier model, actionable
- ❌ Fails: Incomplete, reviewed negatively, not useful

---

## Escalation Path

When something doesn't fit model capabilities:

1. **Model identifies issue:** "This decision requires architecture expertise, not my role"
2. **Model escalates:** Stops work, documents blocker in implementation-log.md
3. **Claude reviews:** Assesses blocker, approves new approach or seeks Product Owner input
4. **Resolution:** Claude communicates back to model or escalates to Joel

---

## Monitoring & Iteration

Every sprint:
1. Claude reviews model outputs for quality and consistency
2. If model output needs rework, communicate specific feedback
3. Log lessons in decision-log.md (improvements for next sprint)
4. Update this matrix if new patterns emerge

---

_Model Routing Matrix v1.0 · Created 2026-05-19 · Active Phase 0–5_
