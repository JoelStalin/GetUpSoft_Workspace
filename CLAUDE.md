# Claude Workspace Rules

This workspace uses shared skills and a bootstrap step before project work.

Required sequence:

1. Run `.\scripts\agent_start.ps1`.
2. If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Review `task-ledger\skill-recommendations.md`.
4. Run the prompt through `.\scripts\caveman_route.ps1`.
5. Select the most specific skills from `.agents\skills`.

Persistent workspace guard:

- Use `.\scripts\claude_project_watchdog.ps1` to keep a Claude process active for this workspace.
- Use `.\scripts\install_claude_project_watchdog_task.ps1` once to start the watchdog automatically at Windows logon.
- Before closing work, only report QA and functional tests that were actually executed, and reference real videos/screenshots from `.claude\evidence` when they exist. Do not invent or generate fake evidence.

Use `agency-agents` for multiagent coordination, `webapp-testing` for browser QA, and `authorized-security-testing` for defensive security validation only.

For design projects, use `mcp-servers.shared.json` plus `.\scripts\stitch_mcp_bootstrap.ps1` to validate Stitch MCP before generating UI work.

## GSTACK + ORCA Multi-Model Adapter (Required)

- Follow `docs/GSTACK_ORCA_MULTIAGENT_ADAPTER.md` for routing contract and fallback policy.
- Keep ORCA as the base orchestrator for repo workflows.
- Use GSTACK for multi-model selection across client tasks.
- Include backlog, DoR, DoD, and tests in delivery summaries.

---

## 🔴 FASTAPI DEPRECATION - MANDATORY COMPLIANCE

**EFFECTIVE 2026-05-25: All FastAPI HTTP services are DISCONTINUED and RESTRICTED**

**ALL agents MUST follow:**

### ❌ DO NOT:
1. Create, modify, or deploy any FastAPI HTTP services
2. Recommend FastAPI for new API development
3. Call FastAPI endpoints (legacy/python-fastapi/*, apps/orca/ai_automation_orchestrator/*)
4. Add FastAPI dependencies or routes

### ✅ DO:
1. Use **NestJS** (`apps/backend-nest/`) for all new HTTP APIs
2. Use **Python CLI** (`orca/cli.py`) for local ORCA tooling
3. Reference `00_Workspace_Governance/FASTAPI_DEPRECATION_POLICY.md` for service mapping
4. Report any discovered FastAPI usage as a code review finding

**Reference:** See full policy at `00_Workspace_Governance/FASTAPI_DEPRECATION_POLICY.md`

---

## 🔴 ORCA WORKFLOW EDITOR - MANDATORY QA UI-UX RULES

**ALL agents making UI-UX changes MUST follow these rules or code will be BLOCKED:**

### Quick Checklist (After ANY UI-UX Change):
1. ✅ Visual regression (colors, icons, spacing visible)
2. ✅ Contrast validation (text ≥ 4.5:1, WCAG AA)
3. ✅ Interaction states (hover, focus, active, disabled)
4. ✅ Z-index hierarchy (no overlapping conflicts)
5. ✅ Responsive test (1024px, 1440px, 1920px)
6. ✅ Keyboard navigation (Tab, Escape, Enter work)
7. ✅ Browser DevTools (no console errors)
8. ✅ Before/after screenshots (timestamped)

### Location of Rules:
- **Full ruleset:** `.claude/projects/.../memory/qa_ui_ux_mandatory_rules.md`
- **QA template:** `apps/orca/workflow-editor/QA_UI_UX_AUDIT.md`
- **Accessibility doc:** `apps/orca/workflow-editor/ACCESSIBILITY_STATEMENT.md`

### Code Review Gate (BLOCKING):
- [ ] QA checklist 7/7 passed
- [ ] Accessibility WCAG AA verified
- [ ] Color contrast ≥ 4.5:1 documented
- [ ] Responsive tested 3+ sizes
- [ ] Browser tested (Chrome, Firefox, Safari)
- [ ] Performance <50KB bundle increase
- [ ] Screenshots before/after provided
- [ ] Consistency matrix maintained
- [ ] Console clean (0 errors)
- [ ] Merge ready? YES/NO

### Penalties for Non-Compliance:
- 1st: Warning + mandatory audit
- 2nd: Blocked PR + re-training
- 3rd: Removed from ORCA UI-UX tasks
