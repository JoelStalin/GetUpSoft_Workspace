# Claude Workspace Rules

This workspace uses shared skills and a bootstrap step before project work.

## Universal Context Efficiency (WORKSPACE.map) - GETUPSOFT WORKSPACE STANDARD
- **MANDATORY FOR ALL GETUPSOFT ECOSYSTEM**: Every agent (Claude, Gemini, Codex, ChatGPT, Copilot, Cursor, OpenClaw, AutoGen, NemoClaw, Rowboat, Hermes, ORCA) MUST run `python scripts/update_repo_map.py` when operating within any sub-project of `GetUpSoft_Workspace`.
- **ISOLATION**: This standard is exclusive to the GetUpSoft business environment and does not affect external PC projects.
- **READ FIRST**: Use `WORKSPACE.map` as the primary structural reference.

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

---

## 🔴 ODOO V19 COMPLETE MODULE REFACTORING - MANDATORY COMPLIANCE

**EFFECTIVE 2026-05-28: ALL Odoo v19 modules MUST be refactored with ORCA audit logging**

**This is NOT optional. This is a code review gate that applies to ALL modules.**

### The Rule

**Every single Odoo v19 module (core + custom + localization) MUST:**
1. Inherit from `OrcaAuditMixin` for all tracked models
2. Provide automatic audit logging via ORCA
3. Capture field snapshots (before/after JSON)
4. Enforce access control (accountants read-only, managers full)
5. Include tests proving ORCA logging works
6. Have UI views showing audit logs

**Scope: 43 total modules**
- ✅ 13 custom/localization modules (DONE)
- ⏳ 30 core modules (REMAINING - must be refactored sequentially)

### Code Review Gate (BLOCKING)

**NO module PR can merge if it:**
- ❌ Adds/modifies models WITHOUT ORCA integration
- ❌ Creates business logic WITHOUT audit logging
- ❌ Lacks tests proving ORCA logging works
- ❌ Doesn't include security rules for audit logs
- ❌ Missing views to show logs in Odoo UI

### PR Requirements

All PRs modifying ANY Odoo v19 module must include:
- [ ] OrcaLog model created/updated
- [ ] OrcaAuditMixin applied to tracked models
- [ ] `_orca_tracked_fields` defined
- [ ] `_orca_log_model` specified
- [ ] Security rules (ir.model.access.csv)
- [ ] Views (list/form for logs)
- [ ] 5+ unit tests (create/write/delete/access/fields)
- [ ] README updated with ORCA section
- [ ] Commit references backlog ID (OO-XXX)
- [ ] All tests PASSING

**Checklist in PR description:**
```
## ORCA Integration Checklist
- [ ] Models tracked: <model1>, <model2>, ...
- [ ] Fields tracked (CRITICAL): <field1>, <field2>, ...
- [ ] Fields tracked (HIGH): <field3>, <field4>, ...
- [ ] Tests created: <N> test cases
- [ ] Security rules: Accountant read-only, Manager full
- [ ] Views created: List view, Form view
- [ ] Backlog item: OO-XXX
```

### Backlog Reference

**Complete backlog with all 43 modules:**
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_MANDATE.md` - Mandate and rationale
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md` - All modules with estimates

**Current phases (5 weeks):**
1. Phase 1 (Week 1): Core Financial (4 modules, 13h)
2. Phase 2 (Week 2): Sales & CRM (5 modules, 14.5h)
3. Phase 3 (Week 3): Procurement & Inventory (5 modules, 14.5h)
4. Phase 4 (Week 4): HR & Payroll (6 modules, 12h)
5. Phase 5 (Week 5): Manufacturing + Website (5 modules, 17h)

### Penalties for Non-Compliance

- 1st: PR rejected with "Module refactoring required" comment
- 2nd: Agent escalation + mandatory re-training
- 3rd: Removed from Odoo module development tasks

### Exceptions

**THERE ARE NO EXCEPTIONS.** This applies to:
- ✅ Core Odoo modules (account, sale, purchase, etc.)
- ✅ Custom modules
- ✅ Localization modules
- ✅ Any future modules added

No module is exempt. No deadline is flexible. This is non-negotiable.

### Reference Documents

- **Mandate:** `task-ledger/V19_COMPLETE_MODULE_REFACTORING_MANDATE.md`
- **Backlog:** `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md`
- **Lab Setup:** `task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md`
- **Lab Validation:** `task-ledger/V19_LAB_VALIDATION_CHECKPOINT.md`
