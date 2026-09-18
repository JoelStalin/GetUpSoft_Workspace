# 📊 Model Task Board — GetUpSoft Website Redesign

**Purpose:** Track all delegated tasks across models (Claude, Codex, ChatGPT, Gemini, NVIDIA)  
**Updated:** 2026-05-19  
**Current Phase:** 0 (Pre-flight)

---

## Task Tracking Format

| ID | Model | Task | US | Status | Owner | Due | Review | Notes |
|---|---|---|---|---|---|---|---|---|
| DEL-001 | Codex | Build Hero component | US-010 | ⏳ TODO | — | 2026-05-21 | Claude | Depends on design-system.md |
| DEL-002 | ChatGPT | Write Home page copy (ES/EN) | US-011 | ⏳ TODO | — | 2026-05-22 | Claude | Both languages required |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## Status Legend

- **⏳ TODO** — Not yet started
- **🔄 IN PROGRESS** — Currently assigned and being worked
- **👀 REVIEW** — Completed, waiting for review
- **✅ APPROVED** — Review passed, ready to merge/accept
- **❌ REJECTED** — Review failed, needs rework
- **🚫 BLOCKED** — Waiting for dependency

---

## Active Delegations (Phase 0)

None yet. Sprint 0 work is Claude-only.

---

## Phase 1 Delegations (Design System & Layout)

*To be populated when Phase 1 begins*

Expected delegations:
- Codex: Build Button, Container, Section, Card components
- ChatGPT: Write design system documentation
- Gemini: Create component visual mockups
- Codex: Build Header and Footer layouts

---

## Phase 2 Delegations (Pages & Content)

*To be populated when Phase 2 begins*

Expected delegations (per 12 pages):
- **Codex:** Build each page (React component)
- **ChatGPT:** Write page copy (ES + EN)
- **Gemini:** Create hero visuals
- **NVIDIA:** Generate alt text and CTA variants

---

## Phase 3 Delegations (Forms & ERP)

*To be populated when Phase 3 begins*

Expected delegations:
- **Codex:** Build Contact and Diagnostic forms, implement lib/erp/
- **ChatGPT:** Write form labels, help text, success/error messages (ES/EN)
- **Codex QA:** Test forms, validate API submissions
- **NVIDIA:** Generate test data variations

---

## Phase 4 Delegations (DevOps)

*To be populated when Phase 4 begins*

Expected delegations:
- **Codex:** Create Dockerfile, CI/CD workflows
- **ChatGPT:** Write deployment documentation
- **Codex QA:** Test Docker build, verify deployment readiness

---

## Phase 5 Delegations (QA)

*To be populated when Phase 5 begins*

Expected delegations:
- **Codex QA:** Run full QA suite (lint, tests, accessibility, build)
- **Claude (via getupsoft-qa subagent):** Comprehensive verification
- **NVIDIA:** Generate test reports, documentation

---

## Completed Delegations (Archive)

*Historical record of completed work*

### Phase 0

| ID | Model | Task | US | Status | Completed | Notes |
|---|---|---|---|---|---|---|
| (none yet) | — | — | — | — | — | — |

---

## Delegation Template (Copy & Fill)

```markdown
## DEL-[NNN] — [Task Title]

**Assigned to:** [Model Name]  
**Story:** US-[NNN]  
**Assigned date:** 2026-05-[date]  
**Due date:** 2026-05-[date]

### Objective
[Clear, specific description of what to do]

### Input (Model can access)
- [ ] Master prompt
- [ ] docs/design-system.md (if design task)
- [ ] docs/brand-voice.md (if content task)
- [ ] [Specific file paths or examples]

### Output Expected
- File(s): [specific paths and formats]
- Criteria:
  - Criterion 1
  - Criterion 2
  - Criterion 3

### Examples (if helpful)
[Concrete examples of expected format/style]

### Reviewer
[Who reviews: Claude by default, or specific skill]

### Status Log

**Created:** 2026-05-[date] by Claude  
**Assigned:** 2026-05-[date]  
→ [Model] claimed task

**In Progress:** [date]  
→ [Brief update on progress, if multiple days]

**Review Ready:** 2026-05-[date]  
→ [Model] submitted for review

**Reviewed:** 2026-05-[date]  
→ Claude review result: ✅ APPROVED / ❌ REQUIRES CHANGES  
→ Feedback: [specific feedback if changes needed]

**Completed:** 2026-05-[date]  
→ Merged/Accepted  
→ Location: [final file path]

### Notes
[Any additional context, blockers, learning]
```

---

## Batch Delegation Example

When multiple models work in parallel:

```markdown
## Batch DEL-100 — Home Page (Phase 2 US-010)

**Sprint:** Phase 2, Week 1  
**Components:** Home page (global + RD variants)

### DEL-101: Codex — Build Home page component
- Due: 2026-05-25
- Output: apps/site/src/pages/global/Home.tsx, apps/site/src/pages/rd/Home.tsx
- Awaits: DEL-102 (copy)
- Status: ⏳ TODO

### DEL-102: ChatGPT — Write Home copy (ES/EN)
- Due: 2026-05-24
- Output: content/site.es.ts (home section), content/site.en.ts (home section)
- Criteria: Both languages, 3 CTAs, hero + 5 sections, all claims verified
- Status: ⏳ TODO

### DEL-103: Gemini — Create Home hero visual
- Due: 2026-05-23
- Output: Figma mockup / hero.png (1920×600 @2x)
- Criteria: Dark theme, enterprise, responsive concepts
- Status: ⏳ TODO

### Sequencing
1. Start: DEL-102 (ChatGPT copy) + DEL-103 (Gemini visual) in parallel
2. Use: Copy/visual to inform DEL-101 (Codex component)
3. Integrate: All by 2026-05-25
4. Review: Claude verifies component, copy, visual alignment

### Status
- Created: 2026-05-19 (Phase 0)
- Assigned: [2026-05-21 Phase 1 start]
- Completed: [TBD]
```

---

## Monitoring Metrics

Track per model, per sprint:

| Metric | Target | Claude | Codex | ChatGPT | Gemini | NVIDIA |
|---|---|---|---|---|---|---|
| On-time delivery | 95%+ | — | — | — | — | — |
| Quality (first-pass approval) | 90%+ | — | — | — | — | — |
| Rework cycles | < 1.5 avg | — | — | — | — | — |
| Feedback incorporation | 100% | — | — | — | — | — |

---

## Communication Channels

**Within delegations:**
- Delegation template (this file) — source of truth
- docs/implementation-log.md — daily progress updates
- GitHub commits — code submissions (Codex)

**Cross-model escalations:**
- If Model A needs decision from Model B: Flag in task status
- Claude coordinates resolution
- Document decision in decision-log.md

---

## Continuous Improvement

End of each sprint:
1. Claude reviews delegation success rate
2. Identify what worked, what didn't
3. Update model routing (if patterns emerge)
4. Log lessons in decision-log.md
5. Adjust delegation style for next sprint

---

_Model Task Board v1.0 · Created 2026-05-19 · To be populated Phase 1+_
