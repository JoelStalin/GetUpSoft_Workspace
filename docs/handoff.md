# 🤝 Handoff Template — GetUpSoft Website Redesign

**Purpose:** Enable seamless continuation of work across agent sessions without context loss  
**Updated:** 2026-05-19  
**Current Phase:** 0 (Pre-flight)

---

## For the Next Agent

### Read These First (In Order)

1. **Master Prompt** (baseline spec, non-negotiable)
   - File: `prompts/master/getupsoft-redesign-master-prompt.md`
   - Length: 1465 lines, ~50KB
   - Key sections: §0 (vision), §2 (rules), §17 (backlog), §21 (tasks)
   - Time to read: 30–45 min (skim) or 90 min (full)

2. **Agent State** (current repo status)
   - File: `docs/agent-state.md`
   - What it has: Stack, pages, i18n status, forms, design system gaps, deployment status
   - Time to read: 15 min
   - Action: Verify any changes since last update

3. **Implementation Log** (what was actually done)
   - File: `docs/implementation-log.md`
   - What it has: Commands run, files created, Phase progress
   - Time to read: 10 min
   - Action: Know what's already built

4. **Decision Log** (why decisions were made)
   - File: `docs/decision-log.md`
   - What it has: Every architectural choice, alternatives considered, rationale
   - Time to read: 10–15 min
   - Action: Understand context before changing anything

5. **Current Sprint Status**
   - File: `docs/scrum/sprint-0.md` (when created)
   - What it has: US-000 to US-009 status, blockers, next tasks
   - Time to read: 5 min
   - Action: Know which task to pick up next

### Quick Context Window Refresh

If you have limited context:

```
- Branch: feat/getupsoft-redesign
- Phase: 0 (Pre-flight)
- Sprint: 0 (9 user stories)
- Completed: US-000, US-001 (prompt, audit, lock)
- Next: US-002–US-009 (skills, docs, backlog, design system)
- Blocker: None (server connectivity restored)
- Risk: i18n strategy not yet decided
```

### Critical Rules (Non-Negotiable)

From Master Prompt §2.2 and §2.3:

1. ✅ DO: Execute without asking (master prompt authorizes this)
2. ✅ DO: Update `docs/implementation-log.md` after each major step
3. ✅ DO: Record decisions in `docs/decision-log.md` immediately
4. ❌ DON'T: Use real data from Galantes or other companies
5. ❌ DON'T: Hardcode secrets or credentials
6. ❌ DON'T: Invent certifications or partnerships
7. ❌ DON'T: Touch Phase 1+ before Sprint 0 is DONE
8. ✅ DO: Mark stories DONE per Definition of Done (master prompt §17.4)

### Current Status Summary

| Item | Status | Notes |
|---|---|---|
| Prompt saved | ✅ | `prompts/master/getupsoft-redesign-master-prompt.md` |
| Lock created | ✅ | SHA256: `B2F0AEFE...` |
| Repo audited | ✅ | See `docs/agent-state.md` |
| Sprint 0 started | ✅ | 9 stories, 2 done |
| Design system | ⏳ | Tokens defined in prompt; implementation TBD |
| i18n strategy | ⏳ | Options in decision-log; TBD Phase 0 Step 13 |
| ERP integration | ⏳ | `lib/erp/` architecture defined; TBD Phase 3 |

---

## Phase 0 Sprint 0 — Current Status

### Stories Completed

- ✅ **US-000:** Save prompt + lock + SHA256
  - Files: `prompts/master/*` (3 files)
  - Evidence: All files created and verified
  - Owner: Claude (previous session)
  - Completed: 2026-05-19

- ✅ **US-001:** Audit repo → create `docs/agent-state.md`
  - Output: 12 KB audit report covering stack, pages, gaps, deployment
  - Evidence: File created with 14 sections
  - Owner: Claude (previous session)
  - Completed: 2026-05-19

### Stories In Progress / TODO

| US | Title | Status | Owner | Dependency | Est. Time |
|---|---|---|---|---|---|
| US-002 | Investigate skills → create `docs/ai/skill-research.md` | ⏳ TODO | Claude | None | 2 hrs |
| US-003 | Install skills Claude in `.claude/skills/` | ⏳ TODO | Claude | US-002 | 1 hr |
| US-004 | Install AGENTS.md + skills Codex | ⏳ TODO | Claude | US-002 | 1 hr |
| US-005 | Create multi-model routing matrix | ⏳ TODO | Claude | US-003, 004 | 1.5 hrs |
| US-006 | Create Scrum backlog (20 epics + DoR/DoD) | ⏳ TODO | Claude | None | 3 hrs |
| US-007 | Create design system + content architecture docs | ⏳ TODO | Claude | None | 2 hrs |
| US-008 | Create content-source-map + brand-voice | ⏳ TODO | Claude | None | 1.5 hrs |
| US-009 | Create verification criteria + report template | ⏳ TODO | Claude | None | 1 hr |

**Sprint 0 Progress:** 2/10 stories done (20%)  
**Estimated completion:** 12 hours of work remaining  
**Target date:** End of 2026-05-19 or morning 2026-05-20

---

## Files Reference Guide

### Master Documentation (Read-Only)

| File | Purpose | Size | Last Updated |
|---|---|---|---|
| `prompts/master/getupsoft-redesign-master-prompt.md` | Spec baseline | 50 KB | 2026-05-19 |
| `prompts/master/getupsoft-redesign-master-prompt.lock.md` | Audit trail | 2.5 KB | 2026-05-19 |
| `prompts/master/getupsoft-redesign-master-prompt.sha256` | Integrity | 89 B | 2026-05-19 |

### Phase 0 Docs (Update After Each Work Session)

| File | Purpose | Owner | Next Reviewer |
|---|---|---|---|
| `docs/agent-state.md` | Repo state snapshot | Claude | Next agent |
| `docs/implementation-log.md` | What was done & how | Claude | Next agent |
| `docs/decision-log.md` | Why decisions made | Claude | Next agent |
| `docs/handoff.md` | This file | Claude | All agents |
| `docs/verification-report.md` | QA/test results | Claude | Next agent (Phase 5) |

### Documentation In Progress (To Complete Phase 0)

| File | US | Owner | Target |
|---|---|---|---|
| `docs/ai/skill-research.md` | US-002 | Claude | ASAP |
| `docs/ai/model-routing.md` | US-005 | Claude | After US-003 |
| `docs/scrum/product-backlog.md` | US-006 | Claude | After US-008 |
| `docs/scrum/sprint-0.md` | US-006 | Claude | After US-008 |
| `docs/design-system.md` | US-007 | Claude | Phase 0 End |
| `docs/content-architecture.md` | US-007 | Claude | Phase 0 End |
| `docs/content-source-map.md` | US-008 | Claude | Phase 0 End |
| `docs/brand-voice.md` | US-008 | Claude | Phase 0 End |

---

## Checklist for Starting a Work Session

When taking over this project:

- [ ] Verify branch: `git branch --show-current` should be `feat/getupsoft-redesign`
- [ ] Read master prompt: `prompts/master/getupsoft-redesign-master-prompt.md`
- [ ] Check agent state: `docs/agent-state.md` (verify changes since last update)
- [ ] Check last log: `docs/implementation-log.md` (know where we left off)
- [ ] Check latest decisions: `docs/decision-log.md` (understand context)
- [ ] Check sprint board: `docs/scrum/sprint-0.md` (if created; else check this handoff)
- [ ] Identify next task: Pick lowest US number that's TODO
- [ ] Update this file: Add a "Session X" section at the end before starting work
- [ ] Commit checkpoint: `git add docs/handoff.md && git commit -m "docs: update handoff before starting session"`
- [ ] Begin work on next user story

---

## Session Log

### Session 0: 2026-05-19 — Initial Setup (Claude)

**Started:** 2026-05-19  
**Ended:** 2026-05-19  
**Work:** Phase 0 Pre-flight, Steps 1–4

**Completed:**
- ✅ Branch verification
- ✅ Master prompt saved
- ✅ Lock file + SHA256 created
- ✅ Repository audit → agent-state.md
- ✅ Implementation-log.md created
- ✅ Decision-log.md created
- ✅ This handoff.md created
- ✅ Started docs/verification-report.md

**Next priority:** US-002 (skill research)

**Blockers:** None at start of session

**Changes made:** 6 files created in `prompts/master/`, `docs/`, total ~80 KB

---

## Tools & Commands Reference

### Git

```bash
# Verify branch
git branch --show-current

# Check status
git status

# Commit work
git add docs/*
git commit -m "docs: [description]"

# View log
git log --oneline | head -10
```

### Phase 0 Tasks

```bash
# Investigate skills
# (no command; research official docs)

# Install Claude skills
mkdir -p .claude/skills/[skill-name]
# Copy skill templates into each directory

# Build/test
cd apps/site
npm install
npm run build
npm run dev
```

### Documentation

```bash
# Update implementation log
# (Edit docs/implementation-log.md, add entry under "Session X")

# Record decision
# (Edit docs/decision-log.md, add new decision section)

# Update handoff
# (Edit docs/handoff.md, add "Session X" under "Session Log")
```

---

## Escalation Contacts

| Issue | Contact | Method |
|---|---|---|
| Scope change / new requirement | Joel (Product Owner) | Email: joelstalin2105@gmail.com |
| Technical blocker | Claude (this repo's Scrum Master) | Refer to `docs/decision-log.md` for similar cases |
| Server issues | Infrastructure team | SSH to server (IP in deploy docs) |
| GitHub access | Team admin | Request via team Slack |

---

## Success Criteria (End of Phase 0)

When all 9 stories are marked DONE:

- [ ] Master prompt baseline established and locked
- [ ] Repository fully audited and state documented
- [ ] Implementation log complete with all commands
- [ ] Decisions logged with alternatives considered
- [ ] This handoff updated with all sessions
- [ ] Verification report created with test strategy
- [ ] Skills researched and AGENTS.md ready
- [ ] Scrum backlog with 20 epics ready
- [ ] Design system tokens & content architecture documented
- [ ] Content source map (claim verification) started
- [ ] Brand voice guidelines documented
- [ ] Team (Claude/Codex/ChatGPT/Gemini/NVIDIA) routing matrix complete
- [ ] Sprint 0 marked DONE, Phase 1 can start

---

## Notes for Future Agents

### Common Pitfalls to Avoid

1. **Don't skip Phase 0** — It feels slow but prevents rework in Phase 1–5
2. **Don't hardcode copy** — Use content files / i18n system
3. **Don't use real company data** — Master prompt §2.3 prohibits this
4. **Don't deploy to production** — Phase 5 is QA only; Phase 6 would be prod
5. **Don't modify the master prompt** — Create an issue instead; let Joel approve

### What Makes This Project Work

- **Single source of truth** (the master prompt)
- **Immutable baseline** (lock + SHA256)
- **Comprehensive documentation** (before code, not after)
- **Clear phase gates** (Sprint 0 must pass before Phase 1)
- **Multi-model coordination** (Claude orchestrates, others implement)

### The Hard Parts

1. **i18n without hardcoding** — Requires discipline; see master prompt §8.1
2. **ERP mocking without real credentials** — Use mock provider by default
3. **Content verification** — Every claim must be in source-map; no inventing certifications
4. **Responsive design at 12 pages** — Lot of work; prioritize above-the-fold first

---

_Last updated: 2026-05-19 by Claude · For next session, update the "Session Log" section before starting work_
