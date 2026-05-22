# Claude Workspace Rules

This workspace uses shared skills and a bootstrap step before project work.

Required sequence:

1. Run `.\scripts\agent_start.ps1`.
2. If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Review `task-ledger\skill-recommendations.md`.
4. Run the prompt through `.\scripts\caveman_route.ps1`.
5. Select the most specific skills from `.agents\skills`.

Use `agency-agents` for multiagent coordination, `webapp-testing` for browser QA, and `authorized-security-testing` for defensive security validation only.

For design projects, use `mcp-servers.shared.json` plus `.\scripts\stitch_mcp_bootstrap.ps1` to validate Stitch MCP before generating UI work.

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
