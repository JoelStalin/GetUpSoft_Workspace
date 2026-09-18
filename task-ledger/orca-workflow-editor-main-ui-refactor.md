# ORCA Workflow Editor Main UI Refactor

## Objective
Convert `apps/orca/workflow-editor` into the primary ORCA interface while preserving every existing route, setting, animation, workflow behavior, and integration.

## Acceptance policy
- Reject if any existing capability disappears.
- Reject if build, unit tests, or E2E tests fail.
- Reject if evidence is not produced by real execution.
- Reject if any report is manually fabricated.

## Task breakdown

### Phase 0 — Baseline inventory
- [x] Capture current routes, components, stores, hooks, providers, settings, animations, assets, localStorage keys, and bundles.
- [x] Save machine-readable inventory outputs under `apps/orca/evidence/pre-refactor/` and `apps/orca/evidence/workflow-editor-main-ui-refactor/inventory/`.
- [x] Record baseline screenshots, runtime state, and a pre-refactor summary for comparison.

### Phase 1 — Surface protection
- [ ] Preserve protected UI components through adapters, not rewrites.
- [ ] Preserve protected settings and window state migration paths.
- [ ] Preserve intro animation and matrix background behavior across motion preferences.

### Phase 2 — Unified shell
- [x] Introduce the ORCA shell entry that owns top bar, sidebar, canvas host, inspector, console, and route bridge.
- [x] Add `legacy`, `hybrid`, and `workflow` UI mode support behind an explicit feature flag.
- [x] Keep current workflow behavior as the default functional path until parity is proven.

### Phase 3 — Native subsystems
- [x] Integrate Hermes as a visible subsystem with runtime, memory, tasks, audit, tool registry, and evidence views.
- [x] Integrate gstack prompt search, review, and role workflows into visible UI.
- [x] Wire prompt library, memory explorer, and evidence explorer into the shell.

### Phase 4 — Validation and evidence
- [x] Run build, test, and E2E commands and store raw outputs under the evidence tree.
- [x] Produce a final acceptance report with before/after counts, test results, rollback notes, and evidence links.

## Evidence checklist
- [x] `npm run build`
- [x] `npm test`
- [x] `npm run test:e2e`
- [x] Screenshot set before/after
- [ ] Video evidence for intro and workflow execution
- [ ] Accessibility report
- [x] Final acceptance report

## Notes
- All proof must come from executed commands or captured browser runs.
- Missing inventory data blocks later refactor work.
