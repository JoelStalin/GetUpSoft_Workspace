# 🎯 Decision Log — GetUpSoft Website Redesign

**Started:** 2026-05-19  
**Purpose:** Track all architectural, technical, and business decisions with alternatives considered and rationale

---

## Format

Each decision follows this template:

```
## Decision: [Decision ID] — [Title]

**Date:** [YYYY-MM-DD]  
**Phase:** [0-5]  
**Discussed in:** [Section/User Story]  

### Context

[Situation requiring decision]

### Options Considered

1. **Option A — [Title]**
   - Pros: ...
   - Cons: ...

2. **Option B — [Title]**
   - Pros: ...
   - Cons: ...

### Decision

**Chosen:** Option [Letter]  
**Rationale:** [Why this is the best choice]

### Implementation

- Files affected: ...
- Commands: ...
- Timeline: ...

### Impact

- **Other decisions:** May affect [Decision ID]
- **Risk:** ...
- **Scope:** ...

### Rollback Plan

If this decision proves wrong: [How to undo]

### Status

- Created: [Date]
- Implemented: [Date or TBD]
- Verified: [Date or TBD]

### Notes

[Any additional context or follow-up]
```

---

## Decisions Log

### Decision: ARCH-001 — Master Prompt Baseline & Immutability

**Date:** 2026-05-19  
**Phase:** 0 (Pre-flight)  
**Discussed in:** Master Prompt §0-21 (entire spec)

#### Context

GetUpSoft website redesign requires coordination across multiple agents (Claude, Codex, ChatGPT, Gemini, NVIDIA) over multiple weeks. Need a single source of truth that cannot drift, enables audit trail, and reduces context overhead for future agents.

#### Options Considered

1. **Break prompt into 21 separate files** (one per section)
   - Pros: Easier to search, update individual sections
   - Cons: Risk of inconsistency, hard to trace dependencies, context fragmentation

2. **Store prompt as single file + lock + hash** ← **CHOSEN**
   - Pros: Single source of truth, immutable audit trail, full context always available, can detect tampering
   - Cons: Larger file, requires checking hash if modified

3. **Use CMS or database for spec**
   - Pros: Flexible, version-controlled
   - Cons: Overkill for this project, requires infrastructure we don't have

#### Decision

**Chosen:** Option 2 — Single file + lock + SHA256 hash

#### Rationale

- Master Prompt is 1465 lines of tightly coupled spec
- Separating into sections would create 21 files with cross-references, increasing coordination overhead
- Single file + immutable lock enables audit trail (can answer "what was the baseline on 2026-05-19?")
- SHA256 detects accidental or intentional modifications
- Fits DevOps/infrastructure patterns familiar to engineering team

#### Implementation

```bash
# Files created:
prompts/master/getupsoft-redesign-master-prompt.md        # The spec
prompts/master/getupsoft-redesign-master-prompt.lock.md   # Immutable marker
prompts/master/getupsoft-redesign-master-prompt.sha256    # Integrity hash
```

#### Impact

- **Other decisions:** All Phase 0 decisions depend on spec clarity from this file
- **Risk:** If team loses access to GitHub, prompt is inaccessible (mitigate: local backups)
- **Scope:** Applies to all 5 implementation phases

#### Rollback Plan

If spec needs major revision:
1. Copy current prompt to `...v7-approved.md` (archive)
2. Create new `.lock.md` with version increment
3. Generate new SHA256
4. Update `docs/decision-log.md` to note this decision was superseded

#### Status

- Created: 2026-05-19
- Implemented: ✅ 2026-05-19
- Verified: ✅ SHA256 matches file on disk

#### Notes

Future agents should NEVER edit the master prompt file directly. Instead:
- If issues found, create `ISSUE-[number].md` in `docs/` with proposed fix
- Escalate to Product Owner (Joel) for approval
- If approved, create new version of prompt with dated suffix

---

### Decision: PHASE0-001 — Documentation Tree Structure

**Date:** 2026-05-19  
**Phase:** 0 (Pre-flight)  
**Discussed in:** Master Prompt §16 (Documentación persistente)

#### Context

Phase 0 requires creating 9+ documentation files to support Scrum, implementation, verification, and handoff. Need clear organization to avoid duplication and ensure all future agents can navigate the docs.

#### Options Considered

1. **All docs in `docs/` root**
   - Pros: Simple, flat structure
   - Cons: Cluttered with 30+ files, hard to find right doc

2. **Subdirectories by concern** ← **CHOSEN**
   ```
   docs/
     agent-state.md          (repo audit)
     implementation-log.md   (this session's work)
     decision-log.md         (this file)
     handoff.md              (agent→agent handoff)
     verification-report.md  (QA criteria)
     design-system.md        (UI tokens & components)
     content-architecture.md (routes, SEO, matrix)
     content-source-map.md   (fact verification)
     brand-voice.md          (copy guidelines)
     ai/
       skill-research.md     (official API research)
       model-routing.md      (agent assignments)
       model-task-board.md   (task tracking)
       skill-registry.md     (skills installed)
     scrum/
       product-backlog.md    (20 epics)
       sprint-0.md           (US-000 to US-009)
       definition-of-ready.md
       definition-of-done.md
       risks-blockers.md
   ```
   - Pros: Clear organization, scalable, mirrors project concerns
   - Cons: Requires discipline to maintain

3. **CMS or wiki**
   - Pros: Better search, collaboration
   - Cons: Overkill, adds dependencies, less portable

#### Decision

**Chosen:** Option 2 — Subdirectories by concern

#### Rationale

- Matches how a real engineering team would organize docs
- Reflects Master Prompt §16 structure exactly
- `docs/ai/` for orchestration, `docs/scrum/` for project management keeps concerns separated
- Easy for future agents to understand "which doc do I read?"

#### Implementation

Directories created:
```bash
mkdir -p docs/{ai,scrum}
```

Files created this session:
- `docs/agent-state.md` — repo audit
- `docs/implementation-log.md` — execution log
- `docs/decision-log.md` — this file
- (TODO) `docs/handoff.md` — handoff template
- (TODO) `docs/verification-report.md` — QA checklist

#### Impact

- Future docs inherit this structure
- All Phase 0–5 work references this tree
- Search/navigation depends on naming consistency

#### Rollback Plan

If structure proves wrong: `git mv docs/ai docs/orchestration && ...` (minimal impact, docs are content not code)

#### Status

- Created: 2026-05-19
- Implemented: ✅ 2026-05-19
- Verified: ✅ Directories exist and docs being populated

---

### Decision: ARCH-002 — Repository Branch Strategy

**Date:** 2026-05-19  
**Phase:** 0 (Pre-flight)  
**Discussed in:** Master Prompt §1 (Rol del agente), §21 (Primera tarea exacta)

#### Context

Full-scale website redesign (Phase 0–5) requires isolating work from main branch. Need strategy for feature branch, testing, and eventual merge.

#### Options Considered

1. **Work directly on main**
   - Pros: Simpler
   - Cons: Breaks dev environment, unreviewed code on main, risky

2. **Single feature branch for entire project** ← **CHOSEN**
   - Pros: Isolated, all Phase 0–5 work contained, easier to rollback entire redesign if needed
   - Cons: Long-lived branch (potential merge conflicts), but master prompt is coherent enough to minimize that

3. **Per-phase branches (feat/phase0, feat/phase1, ...)**
   - Pros: Smaller PRs, easier reviews
   - Cons: Complex phase dependencies, coordination overhead

#### Decision

**Chosen:** Option 2 — Single feature branch `feat/getupsoft-redesign`

#### Rationale

- Master Prompt is designed as single coherent spec; phases are sequential, not parallel
- Allows full rollback if redesign direction changes
- Reduced context switching vs. multiple branches
- Final PR will be comprehensive with full audit trail

#### Implementation

```bash
# Branch already created:
git branch --show-current  # → feat/getupsoft-redesign
git log --oneline | head -1 # → 0d61d4fa5 (current HEAD)
```

#### Impact

- All Phase 0 work committed to this branch
- CI/CD may need to ignore this branch until Phase 5 complete
- Merge to main only after Phase 5 QA passes

#### Rollback Plan

If redesign needs to be abandoned:
```bash
git checkout main
git branch -D feat/getupsoft-redesign
# Or: git reset --hard main (if changes accidentally on main)
```

#### Status

- Created: 2026-05-19 (previous session)
- Implemented: ✅ 2026-05-19 (all work on this branch)
- Verified: ✅ `git branch --show-current` confirms active branch

---

### Decision: PROC-001 — Phase 0 Completion Criteria

**Date:** 2026-05-19  
**Phase:** 0 (Pre-flight)  
**Discussed in:** Master Prompt §17.2, §21

#### Context

Phase 0 has 9 user stories (US-000 to US-009) that must be DONE before Phase 1 (Design System) begins. Need clear definition of "DONE" to prevent scope creep and ensure Phase 1 starts with solid foundation.

#### Options Considered

1. **Phase 0 is "DONE" when docs exist (even if partial)**
   - Pros: Faster to Phase 1
   - Cons: Risk of incomplete foundation, Phase 1 could fail due to missing decisions/skills

2. **Phase 0 complete only when all 9 stories marked DONE** ← **CHOSEN**
   - Pros: Ensures comprehensive foundation, all decisions documented, skills installed, backlog ready
   - Cons: Takes longer (estimated 1–2 days of work)

3. **Phase 0 can run in parallel with Phase 1**
   - Pros: Faster overall timeline
   - Cons: UI work might conflict with ongoing architecture work, increases complexity

#### Decision

**Chosen:** Option 2 — All 9 stories must be DONE (Definition of Done met per master prompt §17.4)

#### Rationale

- Master Prompt §17.2 explicitly states: "No tocar UI hasta que estas historias estén Done"
- Solid Phase 0 prevents rework in later phases
- All agents (Claude, Codex, etc.) need consistent context before starting UI

#### Implementation

Definition of Ready (for US accepting into sprint):
- Clear objective
- Acceptance criteria
- Dependencies identified
- Owner assigned

Definition of Done (for story completion):
- All checklist items checked or marked as N/A with justification
- Documentation updated
- Implementation log entry
- Tests passed or failure documented

#### Impact

- US-000 through US-009 block Phase 1 start
- Can increase timeline by 1–2 days
- But reduces Phase 1–5 risk significantly

#### Rollback Plan

If critical task is discovered mid-Phase 0:
1. Add as new story to Sprint 0 (US-010, US-011, ...)
2. Document why it wasn't in original 9
3. Adjust timeline
4. Do NOT skip to Phase 1 without completion

#### Status

- Created: 2026-05-19
- Implemented: ✅ 2026-05-19 (Sprint 0 structure created)
- Verified: ✅ (docs/scrum will track this)

---

## Pending Decisions (To Make)

| Decision | Context | Options | Owner | Timeline |
|---|---|---|---|---|
| ARCH-003 | i18n strategy (next-intl vs. local content vs. CMS) | 3 options | Claude | Phase 0 Step 13 |
| ARCH-004 | Design system tokens (use master prompt colors or customize?) | 2 options | Claude + Gemini | Phase 1 US-001 |
| ARCH-005 | ERP primary endpoint (Odoo mock vs. real instance) | 2 options | Claude + Joel | Phase 3 US-001 |
| PROC-002 | Code review process (who reviews PRs for Phase 1–5?) | 2 options | Claude | Phase 0 Step 9 |
| SEC-001 | Secrets management (.env storage, GitHub secrets) | 2 options | Claude | Phase 4 US-001 |

---

## Decision Velocity

| Week | Decisions Made | Average | Trend |
|---|---|---|---|
| Week 1 (May 19) | 4 | 4 | ↑ Initial |

---

_Last updated: 2026-05-19 · Phase 0 Pre-flight · 4 decisions logged_

| V8 Pivot: Aesthetic Minimalist | 2026-05-19 | Cambiar est�tica de Dark Enterprise a Light Minimalist (tonos pastel, blanco, explorium.ai). | Seguir con Dark Theme. | Solicitud directa del PO para mejorar la claridad y accesibilidad, dando un toque moderno y 'tech-friendly'. | Cambio total de tokens en Tailwind y dise�o base. |
