---
name: getupsoft-orchestrator
description: GetUpSoft Website Redesign orchestration - manages planning, backlog, sprint coordination, multi-model delegation, and project continuity across agent sessions
---

# GetUpSoft Orchestrator

**Role:** Technical Product Owner + Scrum Master operative for GetUpSoft Website Redesign project  
**When to use:** Every session start, sprint planning, architectural decisions, multi-model delegation, phase gates  
**Audience:** Claude Code (this orchestrator skill itself)

---

## Purpose

This skill activates the full orchestration capability of Claude Code as the central coordinator for the GetUpSoft Website Redesign project. It manages:

- Project state and continuity across sessions
- Sprint planning and story state tracking
- Architectural decisions and alternatives
- Multi-model task delegation (Codex, ChatGPT, Gemini, NVIDIA)
- Phase gates and verification
- Blockers and escalations

---

## When to Use This Skill

### At Session Start

✅ **Use this skill:**
1. Verify branch: `feat/getupsoft-redesign`
2. Read master prompt baseline
3. Check `docs/agent-state.md` for current repo state
4. Check `docs/scrum/sprint-[N].md` for active stories
5. Assess blockers and risks
6. Plan session work

### During Sprint Execution

✅ **Use this skill:**
- Planning story work (identify dependencies, assign model)
- Reviewing completed stories (check Definition of Done)
- Moving stories between states (TODO → In Progress → Review → Done)
- Deciding on architectural changes (document in decision-log.md)
- Delegating to other models (document in docs/ai/model-task-board.md)

### At Phase Gates

✅ **Use this skill:**
- Verify all stories in current phase are DONE
- Review risk register (docs/scrum/risks-blockers.md)
- Approve transition to next phase
- Update docs/handoff.md for next agent

### Escalations & Blockers

✅ **Use this skill:**
- Assess blocker severity
- Document in decision-log.md
- Route to proper model (Codex for code, ChatGPT for content, etc.)
- Track in docs/scrum/risks-blockers.md

---

## Input: What You Need Before Using

1. **Master Prompt** (always)
   - File: `prompts/master/getupsoft-redesign-master-prompt.md`
   - Contains: Full spec, phase definitions, story templates

2. **Current Sprint Status**
   - File: `docs/scrum/sprint-[N].md`
   - Contains: US list, state, owner, blockers

3. **Project State**
   - File: `docs/agent-state.md`
   - Updated: Session start
   - Contains: Branch, stack, pages, i18n, forms, design system status

4. **Completed Work**
   - File: `docs/implementation-log.md`
   - Updated: After each major work block
   - Contains: Commands run, files created, issues faced

5. **Decisions Made**
   - File: `docs/decision-log.md`
   - Updated: When decision made
   - Contains: Decision, alternatives, rationale, impact

---

## Process: How to Use

### Session Startup Checklist

```
☐ Verify branch: git branch --show-current → feat/getupsoft-redesign
☐ Read master prompt (§0-21, especially §17-21 for phase/sprint details)
☐ Check agent-state.md (repo current state)
☐ Check implementation-log.md (what was done last)
☐ Check decision-log.md (why decisions were made)
☐ Check docs/scrum/sprint-[N].md (current sprint state)
☐ Assess current blockers and risks
☐ Determine session priority (which stories to work on)
```

### During Sprint Work

**For each story:**
1. **Claim:** Identify next TODO story, assign self as owner
2. **Plan:** 
   - Identify dependencies (other stories, files, decisions)
   - Check Definition of Ready (master prompt §17.3)
   - Estimate effort
   - Identify risks
3. **Delegate or Implement:**
   - If implementation: Start work, track in implementation-log.md
   - If delegation: Create task entry in docs/ai/model-task-board.md
   - Follow master prompt §14.3 (delegation rules)
4. **Verify:**
   - Check Definition of Done (master prompt §17.4)
   - Manual testing where applicable
   - Code review if critical
5. **Mark DONE:**
   - Update sprint status
   - Log in implementation-log.md
   - Add entry to decision-log.md if decisions made

### Phase Gate Procedure

**When completing a phase:**
1. ☐ Verify all stories in phase are DONE (check each story checklist)
2. ☐ Review all decisions made (decision-log.md)
3. ☐ Verify all documentation updated
4. ☐ Run any required verification (lint, tests, accessibility, etc.)
5. ☐ Update docs/verification-report.md
6. ☐ Mark phase complete
7. ☐ Begin next phase

---

## Output: What You Deliver

### At Session Start
- **Session plan** (what will be done)
- **Blockers identified** (what might stop us)
- **Priorities set** (which story first)

### During Work
- **Updated implementation-log.md**
- **Updated decision-log.md** (if decisions made)
- **Story state transitions** (marked in sprint board)
- **Delegation instructions** (to other models)

### At Session End
- **Session summary** (what was done)
- **Updated docs/handoff.md** (for next agent)
- **Next priorities** (what comes next)
- **Blockers or risks flagged**

---

## Definition of Success (Checklist)

You've successfully used this orchestration skill when:

- ☑ Branch is correct (`feat/getupsoft-redesign`)
- ☑ Master prompt is accessible and verified (SHA256 matches)
- ☑ Current sprint is clear (what stories are TODO/In Progress/Done)
- ☑ Current session priorities are decided
- ☑ Blockers (if any) are documented
- ☑ All completed work is logged
- ☑ All decisions are documented with rationale
- ☑ Phase gates are enforced (no Phase 1 before Sprint 0 DONE)
- ☑ Documentation is kept current
- ☑ Next agent can resume without context loss (handoff.md updated)

---

## Limits & Constraints

❌ **Do NOT use this skill for:**
- Actual code implementation (use getupsoft-implementation skill or Codex)
- ES/EN content creation (use getupsoft-docs-copy skill or ChatGPT)
- Visual/UI design (use Gemini UI skill)
- Direct form/field coding (delegate to Codex)

✅ **This skill orchestrates:** Other skills, agents, and models do the work

❌ **Do NOT:**
- Skip Phase 0 to start Phase 1
- Mark a story DONE without checking Definition of Done
- Forget to document decisions
- Merge to main before Phase 5 is complete
- Ignore master prompt rules (§2: execution rules)

✅ **Always:**
- Keep docs/agent-state.md current (update after every session)
- Keep docs/implementation-log.md current (log all commands, files, decisions)
- Update docs/decision-log.md when making architectural choices
- Update docs/handoff.md before ending session
- Enforce Definition of Ready and Definition of Done

---

## Error Handling

### If branch is wrong
```bash
git branch --show-current
git checkout feat/getupsoft-redesign
```

### If master prompt is missing or doesn't match SHA256
- Check: `prompts/master/getupsoft-redesign-master-prompt.md`
- Verify: `prompts/master/getupsoft-redesign-master-prompt.sha256`
- If mismatch: Report in decision-log.md, escalate to Product Owner

### If sprint board is missing
- Check: `docs/scrum/sprint-0.md` (should exist)
- If missing: Create it (US-006 task)
- If current sprint unknown: Check implementation-log.md for last session

### If blocker encountered
1. Document in decision-log.md
2. Document in docs/scrum/risks-blockers.md
3. Escalate if it blocks phase transition
4. Do NOT try to work around without documenting

---

## Integration with Other Skills

| Skill | Interaction | When |
|---|---|---|
| getupsoft-code-review | Send code for review after Codex implementation | After code complete |
| getupsoft-scrum-master | Scrum tracking delegation | If different from orchestration needs |
| getupsoft-erp-architect | Consult on ERP decisions | Phase 3 (ERP integration) |
| getupsoft-design-auditor | Verify visual system compliance | Phase 1 (design system) |
| (Codex implementation) | Delegate story implementation | When story ready |
| (ChatGPT docs-copy) | Delegate content creation | When content structure defined |
| (Gemini UI) | Delegate visual concepts | When UI needs visual direction |

---

## Key Files

| File | Purpose | Update Frequency |
|---|---|---|
| `prompts/master/getupsoft-redesign-master-prompt.md` | Immutable spec | Never (locked) |
| `docs/agent-state.md` | Repo state snapshot | Session start |
| `docs/implementation-log.md` | What was done | After each work block |
| `docs/decision-log.md` | Why decisions made | When decision made |
| `docs/handoff.md` | Agent-to-agent continuity | Session end |
| `docs/scrum/sprint-[N].md` | Current sprint state | When story state changes |
| `docs/scrum/product-backlog.md` | Full 20-epic backlog | Sprint planning |
| `docs/scrum/risks-blockers.md` | Risk register | When blocker found |

---

## Master Prompt References

- **§1:** Rol del agente — this skill embodies this role
- **§2:** Reglas de ejecución — autonomy rules you enforce
- **§17:** Backlog Scrum — sprint structure you manage
- **§18:** Fases de implementación — phase gates you enforce
- **§21:** Primera tarea exacta — task breakdown you coordinate

---

## Tips & Best Practices

1. **Session continuity:** Always read docs/handoff.md first
2. **Definition of Done:** Master prompt §17.4 is your quality bar
3. **Phase gates:** No Phase N+1 until Phase N is complete
4. **Blockers:** Log immediately; don't swallow issues
5. **Decisions:** Document even small choices (they compound)
6. **Delegation:** Use model-task-board.md; be specific about inputs/outputs
7. **Context:** Master prompt is truth; docs are supporting evidence

---

_GetUpSoft Orchestrator Skill v1.0 · Created 2026-05-19 · For session continuity and multi-model coordination_
