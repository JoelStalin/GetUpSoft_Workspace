# Phase 2 Component Migration Guide

Status: Ready for Implementation (2026-05-25)

## Quick Reference

Use these examples as templates:
1. ExecutionViewer.migrated.tsx - Simple state reading + SSE
2. WorkflowToolbar.example.migrated.tsx - Complex operations + undo/redo

## Hook Imports

All hooks come from single file:
```typescript
import {
  useWorkflowState,
  useWorkflowOperations,
  useWorkflowHistory,
  useExecutionStatus,
  useExecutionOperations,
} from '../hooks/useWorkflowOperations'

import { useErrorRecovery } from '../hooks/useWorkflowOperations'
```

## Common Patterns

### Reading Workflow State
```typescript
const { workflow, selectedNodeId, isDirty } = useWorkflowOperations()
```

### Workflow Actions
```typescript
const { addNode, deleteNode, selectNode } = useWorkflowOperations()
```

### Undo/Redo
```typescript
const { undo, redo, canUndo, canRedo } = useWorkflowHistory()
<button disabled={!canUndo} onClick={undo}>Undo</button>
```

### Execution Tracking
```typescript
const { status, progress, logs } = useExecutionStatus()
const { startExecution, addLog } = useExecutionOperations()
```

### Error Handling
```typescript
const { addError, hasErrors, retryableErrors } = useErrorRecovery()

try {
  await someOp()
} catch (error) {
  addError(error, 'ComponentName', 3)
}
```

## Components to Migrate

Priority order:
1. ErrorPanel (5 min)
2. ExecutionViewer (10 min) - *see example*
3. ExecutionStatusBar (5 min)
4. ExecutionTimeline (15 min)
5. OrcaNode (10 min)
6. FloatingPropertiesPanel (15 min)
7. FloatingChatPanel (15 min)
8. WorkflowToolbar (15 min) - *see example*
9. WorkflowCanvas (20 min)
10+ Others (30 min)

Total: ~2 hours for full completion

## Migration Steps

1. Identify old store usage in component
2. Map to new hooks using quick reference above
3. Update imports (remove useWorkflowStore)
4. Update all hook calls
5. Update JSX to reference hook return values
6. Add error handling with useErrorRecovery
7. Test component renders and functions
8. Commit with message like: "refactor: Migrate [ComponentName] to P2 hooks"

## Verification Checklist

After each component migration:
- [ ] No useWorkflowStore imports
- [ ] All hooks from useWorkflowOperations
- [ ] Error handling with useErrorRecovery
- [ ] Component renders
- [ ] State updates work
- [ ] Dispatch actions work
- [ ] No console errors

## Common Mistakes to Avoid

- Using useExecutionStatus for dispatch (use useExecutionOperations instead)
- Forgetting to destructure hooks
- Not importing useErrorRecovery for error handling
- Keeping old store imports

## Files Already Created as References

- ExecutionViewer.migrated.tsx
- WorkflowToolbar.example.migrated.tsx
- P2_COMPONENT_MIGRATION_CHECKLIST.md

Start with these examples and use them as templates!
