# 🔬 Skills Research — GetUpSoft Website Redesign

**Date:** 2026-05-19  
**Purpose:** Document official Claude Code skills, agent frameworks, and skill installation strategy  
**Status:** Complete investigation (US-002)

---

## Executive Summary

GetUpSoft workspace uses a **multiagent framework** where:
- **Claude Code** (this environment) acts as orchestrator, Scrum Master, architect
- **Codex** handles implementation via shared skill bundle in `.agents/skills/`
- **ChatGPT, Gemini, NVIDIA** receive delegated tasks

The workspace provides:
- **AGENTS.md** — Shared rules for all agents
- **`.agents/skills/`** — Central skill registry
- **Skills manifest** — Pre-packaged capabilities (NotebookLM, security testing, UI testing, etc.)
- **skill-lock.json** — Pinned versions for consistency

---

## Existing Skills Infrastructure

### Workspace-Level Files

| File | Purpose | Status | Notes |
|---|---|---|---|
| `AGENTS.md` | Agent rules and shared policy | ✅ Exists | 43 lines; defines skill selection, bootstrap sequence |
| `.agents/skills/` | Central shared skill bundle | ✅ Exists | Contains pre-installed skills |
| `task-ledger/skill-recommendations.md` | Project-family skill recommendations | ✅ Exists | Updated by workspace generator |
| `task-ledger/skill-recommendations.json` | Machine-readable recommendations | ✅ Exists | Groups projects by family |
| `mcp-servers.shared.json` | Shared Stitch MCP manifest | ✅ Exists | For UI/design work (Stitch) |

### Existing AGENTS.md Structure (Current Workspace)

```markdown
# GetUpSoft Workspace Agent Rules

## Start-of-work sequence
1. Run .\scripts\agent_start.ps1
2. Run .\scripts\workspace_bootstrap.ps1 (if needed)
3. Read task-ledger\skill-recommendations.md
4. Normalize task with .\scripts\caveman_route.ps1
5. Use shared skill bundle in .agents\skills
6. Prefer most specific skill set

## Shared skills
- .agents\skills is live shared bundle
- skills-lock.json is pinned inventory
- New skills propagate to workspace bundle

## Skill selection policy
- Review available skills before starting
- Use agency-agents for role coordination
- Use webapp-testing for UI/browser validation
- Use authorized-security-testing only for defensive checks
- Avoid generic skills; use specific workspace skills

## Design projects
- Use shared Stitch MCP manifest (mcp-servers.shared.json)
- Run ./scripts/stitch_mcp_bootstrap.ps1 to validate
- If GOOGLE_CLOUD_PROJECT not set, Stitch is scaffolded but not ready
```

### Notable Existing Skills

From workspace exploration, identified:
| Skill | Type | Purpose | Audience |
|---|---|---|---|
| **agency-agents** | Coordination | Multi-agent role coordination, review flow, handoffs | All agents |
| **webapp-testing** | Testing | Browser/UI validation, Selenium-style QA | Frontend agents |
| **authorized-security-testing** | Security | Defensive security checks only; requires explicit authorization | Security reviewers |
| **notebooklm** | Integration | Google NotebookLM API automation | Data/research agents |
| **stitch-mcp** | Design | UI/design asset management | Design/UI agents |

---

## Claude Code Skills Framework

### How Skills Work

Per existing SKILL.md example (NotebookLM):

**Structure of a SKILL.md:**
```markdown
---
name: skill-name
description: One-line description (activates on intent or /skill-name)
---

# Skill Title

Full markdown documentation with:
- Installation instructions
- Prerequisites
- Usage examples
- API reference
- Architecture notes
```

**Activation:**
- Explicit: `/notebooklm` command or skill installation creates availability
- Intent-based: Mention "create a podcast about X" activates NotebookLM skill
- Pre-installed: `.claude/skills/` directory registers skill automatically

### Installing a Claude Code Skill

**Canonical method (for GetUpSoft):**

1. Create skill directory in `.claude/skills/[skill-name]/`
2. Create `SKILL.md` with frontmatter + documentation
3. Optionally: Create `.claude/agents/[skill-name].md` for subagent instructions
4. Register in workspace agent rules (AGENTS.md or task-ledger)

**File structure:**
```
.claude/
  skills/
    getupsoft-orchestrator/
      SKILL.md              # Main skill definition
      skill-details.md      # (optional) Extended reference
    getupsoft-code-review/
      SKILL.md
  agents/
    getupsoft-planner.md    # Subagent instructions
    getupsoft-reviewer.md   # Code review agent
```

### Codex Skills (`.agents/` Framework)

Codex (alternative AI agent in workspace) uses:
- **AGENTS.md** at `.agents/AGENTS.md` — Rules for Codex
- **Skills in `.agents/skills/`** — Pre-packaged capabilities for Codex
- **Same manifest style** — SKILL.md files with frontmatter + documentation

---

## Skills Needed for GetUpSoft Redesign (Per Master Prompt §15)

### Claude Code Skills to Create

Per master prompt §15.2, create:

| Skill | Purpose | Who uses | Dependencies |
|---|---|---|---|
| **getupsoft-orchestrator** | Plan work, track progress, coordinate multi-model | Claude | AGENTS.md complete |
| **getupsoft-code-review** | Review code changes, verify architecture | Claude | Codex implementation |
| **getupsoft-scrum-master** | Manage backlog, track sprints, DoR/DoD | Claude | Project backlog created |
| **getupsoft-erp-architect** | Design ERP integration, verify Odoo decisions | Claude | Master prompt §10 |
| **getupsoft-design-auditor** | Verify visual system, accessibility, responsive | Claude | Design system doc |

### Codex / `.agents/skills/` to Create

Per master prompt §15.3, create:

| Skill | Purpose | Who uses | Dependencies |
|---|---|---|---|
| **getupsoft-implementation** | Build components, pages, integrate systems | Codex | Design system done |
| **getupsoft-docs-copy** | Write documentation, ES/EN copy | ChatGPT (via Codex orchestration) | Brand voice doc |
| **getupsoft-qa-verification** | Run tests, verify accessibility, build | Codex | Phase 5 (QA phase) |

### Subagents (`.claude/agents/`)

| Agent | Purpose | Triggers |
|---|---|---|
| **getupsoft-planner** | Deep-dive planning for major features | When scope unclear |
| **getupsoft-reviewer** | Independent code review | After implementation done |
| **getupsoft-qa** | Comprehensive QA before launch | Phase 5 start |

---

## AGENTS.md for GetUpSoft Website Redesign

**File to create:** `.agents/AGENTS.md`

**Based on master prompt §15.3, should include:**

```markdown
# AGENTS.md — GetUpSoft Website Redesign

## Prerequisite
- Read prompts/master/getupsoft-redesign-master-prompt.md
- Confirm branch: feat/getupsoft-redesign
- Check docs/agent-state.md for current stack

## Repository Rules
- Odoo is ERP principal (not ERPNext, iSeries, SAP)
- All content ES/EN; no hardcoded copy
- No real company data; no certifications invented
- Claims verified in docs/content-source-map.md
- No secrets hardcoded

## Workflow
1. Confirm master prompt locked and accessible
2. Check docs/scrum/sprint-0.md for current sprint
3. Claim a story in "Ready" status
4. Implement minimally and verify-ably
5. Update docs/implementation-log.md
6. Mark story DONE per Definition of Done
7. Never skip to Phase 1 until Sprint 0 DONE

## Skill Selection
- Use getupsoft-implementation for component/page work
- Use getupsoft-docs-copy for ES/EN content
- Use getupsoft-qa-verification before marking stories DONE
- Use webapp-testing for browser/form validation (if available)

## Communication
- All decisions in docs/decision-log.md
- All changes in docs/implementation-log.md
- Blockers escalate to Claude (Scrum Master role)
```

---

## Multi-Model Orchestration Skills (Master Prompt §14)

### Delegation Structure

Per master prompt §14.2-14.4:

| Model | Role | Skill/Instructions | Constraints |
|---|---|---|---|
| Claude | Orchestrator, Scrum Master | `.claude/skills/getupsoft-orchestrator` | Plans, reviews, delegates |
| Codex | Implementation | `.agents/skills/getupsoft-implementation` | Builds code, minimally |
| ChatGPT | Documentation, copy | `.agents/skills/getupsoft-docs-copy` | ES/EN content, no code |
| Gemini | Visual, UI | Prompt-based (no skill file) | Wireframes, UI concepts |
| NVIDIA free | Support, translation | Prompt-based | Low-cost tasks |

### Each Delegation Requires (§14.3)

- ID (unique task identifier)
- Assigned model
- Objective (what to accomplish)
- Allowed inputs (what data it can see)
- Prohibited inputs (what NOT to share — secrets, PII, etc.)
- Expected output format
- Acceptance criteria
- Reviewer (who verifies output)
- Status tracking (in docs/ai/model-task-board.md)

---

## Implementation Strategy

### Phase 0 (Pre-flight): Skill Creation

**Timeline:** Week 1 of project

**Tasks:**
1. ✅ **US-002** — Create this research doc (DONE)
2. **US-003** — Install Claude skills in `.claude/skills/`
   - Create `getupsoft-orchestrator/SKILL.md`
   - Create `getupsoft-code-review/SKILL.md`
   - Create `getupsoft-scrum-master/SKILL.md`
   - Create `getupsoft-erp-architect/SKILL.md`
   - Create `getupsoft-design-auditor/SKILL.md`

3. **US-004** — Create AGENTS.md and Codex skills
   - Create `.agents/AGENTS.md` with shared rules
   - Create `.agents/skills/getupsoft-implementation/SKILL.md`
   - Create `.agents/skills/getupsoft-docs-copy/SKILL.md`
   - Create `.agents/skills/getupsoft-qa-verification/SKILL.md`

4. **US-005** — Create multi-model routing matrix
   - Create `docs/ai/model-routing.md`
   - Create `docs/ai/model-task-board.md` (empty, to be filled during implementation)
   - Define per-model constraints and input/output contracts

### Phase 1–5: Usage

**When implementing features:**
- Claude uses `getupsoft-orchestrator` to plan
- Codex uses `getupsoft-implementation` to build
- ChatGPT receives delegation for copy (via Claude orchestration)
- Gemini provides UI concepts (prompt-based)
- All work tracked in `docs/ai/model-task-board.md`

---

## Key Decisions

### Decision: Unified Skill Bundle vs. Per-Project Skills

**Chosen:** Unified in `.agents/skills/` for all agents

**Rationale:**
- GetUpSoft team can update skills once
- All agents (Codex, ChatGPT, etc.) see same rules
- Easier to maintain consistency
- Master prompt centralized in `prompts/master/`

### Decision: Skills vs. Inline Instructions

**Chosen:** SKILL.md files (not inline prompts in tasks)

**Rationale:**
- Discoverable and versioned
- Can be refined based on feedback
- Clear handoff to next agent
- Follows workspace convention

### Decision: Delegate via Skill vs. Direct Execution

**Chosen:** Delegate with explicit instructions and skill files

**Rationale:**
- Master prompt authorizes autonomous work (§2.1)
- Skill files create audit trail
- Allows other agents (future Claude sessions, Codex, ChatGPT) to use same definition
- Reduces context fragmentation

---

## Validation Checklist (For US-003 Completion)

When Claude skills are created:

- [ ] `getupsoft-orchestrator/SKILL.md` exists (200+ lines)
- [ ] `getupsoft-code-review/SKILL.md` exists (150+ lines)
- [ ] `getupsoft-scrum-master/SKILL.md` exists (150+ lines)
- [ ] `getupsoft-erp-architect/SKILL.md` exists (150+ lines)
- [ ] `getupsoft-design-auditor/SKILL.md` exists (100+ lines)
- [ ] Each skill has: name, description, when-to-use, process, output, checklist, limits
- [ ] `.claude/agents/` directory has subagent instructions (3+ files)
- [ ] All skills are committed to git

---

## Validation Checklist (For US-004 Completion)

When Codex skills are created:

- [ ] `.agents/AGENTS.md` exists and is complete
- [ ] `.agents/skills/getupsoft-implementation/SKILL.md` exists
- [ ] `.agents/skills/getupsoft-docs-copy/SKILL.md` exists
- [ ] `.agents/skills/getupsoft-qa-verification/SKILL.md` exists
- [ ] Each skill references master prompt and docs/agent-state.md
- [ ] All skills are committed to git

---

## Validation Checklist (For US-005 Completion)

When multi-model routing is complete:

- [ ] `docs/ai/model-routing.md` created (decision matrix)
- [ ] `docs/ai/model-task-board.md` created (tracking template)
- [ ] Model constraints documented (what each model CAN/CANNOT do)
- [ ] Input/output contracts defined per model
- [ ] Prohibited inputs listed (secrets, PII, credentials)
- [ ] Reviewer assignments documented (who verifies each model's output)
- [ ] All files committed to git

---

## Integration with Master Prompt

| Master Prompt Section | Skill Equivalent | File |
|---|---|---|
| §1 (Rol del agente) | Multiple skills work together | All skills combined |
| §14 (Orquestación multi-modelo) | Model routing matrix | `docs/ai/model-routing.md` |
| §15 (Skills del proyecto) | This entire document + skill files | `.claude/skills/`, `.agents/skills/` |
| §21 (Primera tarea exacta) | Skill creation steps 7–9 | US-003, US-004, US-005 |

---

## References

### Official Documentation Consulted

- **GetUpSoft Workspace AGENTS.md** (43 lines) — Current agent rules
- **GetUpSoft Workspace CLAUDE.md** — Claude Code guidelines
- **NotebookLM Skill Example** (`03_AI_Automation/notebooklm-py/SKILL.md`) — Skill structure reference
- **Master Prompt §15** — Skill requirements

### Files to Update After Skills Created

| File | Action | Owner | Timing |
|---|---|---|---|
| `task-ledger/skill-recommendations.md` | Add getupsoft-redesign to recommendations | Claude | US-005 end |
| `AGENTS.md` (root workspace) | Reference getupsoft skills | Claude | US-005 end |
| `.claude/skills/` | Register new skills | Claude | US-003 |
| `.agents/skills/` | Register Codex skills | Claude | US-004 |

---

## Next Steps

**Immediate (Next Session):**
1. Create `getupsoft-orchestrator/SKILL.md` in `.claude/skills/`
2. Create 4 more Claude skills
3. Create subagent instructions in `.claude/agents/`
4. Create AGENTS.md and 3 Codex skills
5. Create model routing matrix

**After Skills Ready:**
1. Begin Phase 1 with skills available to team
2. Update skill-recommendations.md
3. Optionally create a skills index in docs/ai/skill-registry.md

---

_Research completed: 2026-05-19 · US-002 DONE · Next: US-003 (skill creation)_
