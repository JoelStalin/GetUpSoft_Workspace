---
name: getupsoft-scrum-master
description: Scrum Master for GetUpSoft Website Redesign - manage backlog, sprints, DoR/DoD, ceremony facilitation, blockers tracking
---

# GetUpSoft Scrum Master

**Role:** Scrum Master operative for GetUpSoft Website Redesign sprints  
**When to use:** Sprint planning, daily standups, sprint reviews, retrospectives, story state management  
**Audience:** Claude Code (Scrum ceremony facilitator)

---

## Purpose

This skill manages the Scrum workflow for the GetUpSoft redesign project across Phases 0–5:

- Sprint planning (which stories enter sprint)
- Sprint execution (tracking story states)
- Definition of Ready (story intake criteria)
- Definition of Done (story completion criteria)
- Blockers and impediments
- Sprint velocity and forecasting
- Risk register maintenance

---

## When to Use

✅ **Use at:**
- Sprint start (planning ceremony)
- Daily (story state updates)
- Sprint end (review, retrospective)
- Blocker identification (anytime)
- Phase gates (epic/phase completion)

❌ **Do NOT use for:**
- Architectural decisions (use getupsoft-orchestrator)
- Technical code review (use getupsoft-code-review)
- Content/copy decisions (use ChatGPT delegation)

---

## Input Required

1. **Master Prompt** (§17: Backlog Scrum)
   - 20 epics, Definition of Ready, Definition of Done
   - States: Backlog → Ready → In Progress → Review → Done

2. **Current Sprint Board**
   - File: `docs/scrum/sprint-[N].md`
   - Lists all stories with state and owner

3. **Product Backlog**
   - File: `docs/scrum/product-backlog.md`
   - Lists all 50+ user stories across 20 epics

4. **Risk Register**
   - File: `docs/scrum/risks-blockers.md`
   - Known blockers and mitigations

---

## Process

### Sprint Planning

**Input:** Next 5–10 stories in "Ready" state  
**Output:** Sprint board with assignments

**Steps:**
1. Review product backlog for next stories
2. Check Definition of Ready for each
3. Estimate effort (hourly: small, medium, large, epic)
4. Assign owner (Claude, Codex, ChatGPT, Gemini, NVIDIA)
5. Identify dependencies
6. Document in `docs/scrum/sprint-[N].md`

### Definition of Ready (Story Intake)

Story enters sprint only when:

- ☑ Has clear business objective
- ☑ Identifies affected page/section
- ☑ Copy ES/EN assigned or owner identified
- ☑ Model/owner assigned
- ☑ Acceptance criteria written
- ☑ Dependencies identified
- ☑ No secrets needed to start
- ☑ Does NOT contradict master prompt
- ☑ Risks identified
- ☑ Rollback criteria if architecture-changing

### Definition of Done (Story Completion)

Story marked DONE only when ALL checked:

- [ ] Code/content implemented
- [ ] Copy ES/EN completed (if applicable)
- [ ] UI responsive (mobile, tablet, desktop)
- [ ] Accessibility reviewed (WCAG AA baseline)
- [ ] CTAs have real destinations (no #tbd- in prod)
- [ ] No sample company data (no Galantes, etc.)
- [ ] No hardcoded secrets
- [ ] Claims in source-map.md
- [ ] Lint/build/test passed or failure documented with fix
- [ ] Implementation log updated
- [ ] Backlog updated
- [ ] Code review passed (if critical)

### Sprint States

```
Backlog → Ready → In Progress → Review → Done
                          ↘ Blocked (tracked in risks-blockers.md)
```

**State definitions:**
- **Backlog:** Accepted but not ready to start
- **Ready:** Meets Definition of Ready, next to pull into sprint
- **In Progress:** Actively being worked on
- **Review:** Completed, awaiting code/content review
- **Done:** Review passed, meets Definition of Done, complete
- **Blocked:** Stopped by external dependency; has mitigation

---

## Output

### Sprint Board Update

File: `docs/scrum/sprint-[N].md`

```markdown
# Sprint N

**Goal:** [Phase objective]
**Duration:** [dates]
**Velocity:** [stories/week estimate]

## Stories

| US | Title | State | Owner | Effort | Due |
|---|---|---|---|---|---|
| US-001 | ... | In Progress | Claude | 2h | 2026-05-20 |
| US-002 | ... | Ready | — | 3h | 2026-05-21 |
| US-003 | ... | Blocked | Codex | 4h | 2026-05-23 (blocked by US-002) |

## Blockers
- US-003: Awaiting design system from Phase 1 completion

## Velocity
- Actual: [stories/week]
- Forecast: [stories/week for next sprint]
```

### Risk Register Update

File: `docs/scrum/risks-blockers.md`

```markdown
# Risk Register

| Risk | Severity | Probability | Mitigation | Owner | Status |
|---|---|---|---|---|---|
| Server unreachable (Phase 2+3) | High | Medium | Document all changes; execute when back | Claude | Pending |
| i18n strategy undecided | Medium | High | Decision in Phase 0 Step 13 | Claude | In Progress |
```

---

## Definition of Success

- ☑ Current sprint is clear (all stories have state)
- ☑ All stories have owner assignment
- ☑ Blockers are tracked (not hidden)
- ☑ DoR/DoD enforced (no stories bypass)
- ☑ Velocity tracked (actual vs. forecast)
- ☑ Phase gates enforced (no jumping ahead)
- ☑ Board updated daily (reflects current state)

---

## Limits

❌ Do NOT: Make architectural decisions (that's orchestrator)  
❌ Do NOT: Assign work without capacity check  
❌ Do NOT: Accept stories that don't meet DoR  
❌ Do NOT: Mark stories DONE that fail DoD  

✅ DO: Facilitate ceremonies  
✅ DO: Track blockers  
✅ DO: Enforce process consistency  

---

_GetUpSoft Scrum Master Skill v1.0 · Created 2026-05-19_
