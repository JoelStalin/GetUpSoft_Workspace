# Phase 2 - Component Migration Checklist

**Status:** In Progress (P2-006)  
**Date Started:** 2026-05-25  
**Target Completion:** 2026-05-25 (same session)

## Migration Overview

Migrate components from old Zustand-based `workflowStore` to new React Context API hooks system.

### Old Pattern (Deprecated)
```typescript
import { useWorkflowStore } from '../store/workflowStore'
const state = useWorkflowStore((state) => state.executionLogs)
const action = useWorkflowStore((state) => state.setCurrentExecutionId)
```

### New Pattern (Target)
```typescript
import { useExecutionStatus, useExecutionOperations } from '../hooks/useWorkflowOperations'
const { logs, currentNode, progress } = useExecutionStatus()
const { startExecution, addLog, updateProgress } = useExecutionOperations()
```

## Component Migration Map

### High Priority (Core Execution Features)
- [ ] **ExecutionViewer.tsx** - Uses `executionLogs`, `clearLogs`, `currentExecutionId`, `setCurrentExecutionId`
  - Migrate to: `useExecutionStatus()`, `useExecutionOperations()`
  - Complexity: Low (straightforward mapping)
  - **Status:** Planned

- [ ] **ExecutionStatusBar.tsx** - Displays execution status
  - Migrate to: `useExecutionStatus()`
  - Complexity: Low
  - **Status:** Pending

- [ ] **ExecutionTimeline.tsx** - Shows execution timeline
  - Migrate to: `useExecutionStatus()`, event tracking
  - Complexity: Medium
  - **Status:** Pending

### Medium Priority (Workflow Operations)
- [ ] **WorkflowToolbar.tsx** - Node operations, undo/redo
  - Migrate to: `useWorkflowOperations()`, `useWorkflowHistory()`
  - Complexity: Medium
  - **Status:** Pending

- [ ] **WorkflowCanvas.tsx** - Canvas manipulation
  - Migrate to: `useWorkflowOperations()`
  - Complexity: Medium
  - **Status:** Pending

- [ ] **OrcaNode.tsx** - Individual node component
  - Migrate to: `useWorkflowOperations()` (for node selection/updates)
  - Complexity: Low
  - **Status:** Pending

### Medium Priority (Panels & UI)
- [ ] **FloatingPropertiesPanel.tsx** - Node property editing
  - Migrate to: `useWorkflowOperations()`, `useErrorRecovery()`
  - Complexity: Medium
  - **Status:** Pending

- [ ] **ErrorPanel.tsx** - Error display
  - Migrate to: `useErrorRecovery()`, event bus
  - Complexity: Low
  - **Status:** Pending

- [ ] **FloatingChatPanel.tsx** - AI chat integration
  - Migrate to: `useWorkflowOperations()`, `useErrorRecovery()`
  - Complexity: Medium
  - **Status:** Pending

### Low Priority (Utilities & Analytics)
- [ ] **WorkflowVersionManager.tsx** - Version management
  - Uses: localStorage, own hooks
  - Complexity: Low (mostly independent)
  - **Status:** Pending

- [ ] **WorkflowAnalyticsDashboard.tsx** - Analytics display
  - Uses: localStorage analytics tracking
  - Complexity: Low
  - **Status:** Pending

- [ ] **SearchDialog.tsx** - Workflow search
  - Uses: custom useSearch hook
  - Complexity: Low
  - **Status:** Pending

## Hook Mapping Reference

### Workflow State
```typescript
const { 
  workflow,           // Current workflow or null
  selectedNodeId,     // Currently selected node
  selectedEdgeId,     // Currently selected edge
  isDirty,           // Has unsaved changes
  isLoading,         // Loading state
  error,             // Error message
  historyIndex,      // Current position in undo/redo stack
  history,           // Array of past states
} = useWorkflowState()
```

### Workflow Operations
```typescript
const {
  setWorkflow,       // Replace entire workflow
  updateNodes,       // Update node array
  updateEdges,       // Update edge array
  addNode,           // Add single node
  deleteNode,        // Remove node by ID
  addEdge,           // Add connection
  deleteEdge,        // Remove connection
  selectNode,        // Set selected node
  selectEdge,        // Set selected edge
  setLoading,        // Set loading state
  setError,          // Set error message
  markDirty,         // Mark workflow as modified
  markClean,         // Clear dirty flag
  reset,             // Reset to initial state
} = useWorkflowOperations()
```

### Workflow History (Undo/Redo)
```typescript
const {
  pushHistory,       // Save current state to history
  undo,              // Go back one step
  redo,              // Go forward one step
  canUndo,           // Boolean - can undo?
  canRedo,           // Boolean - can redo?
  historyIndex,      // Current position
  historyLength,     // Total saved states
} = useWorkflowHistory()
```

### Execution Status
```typescript
const {
  status,            // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  currentNodeId,     // Node currently executing
  progress,          // 0-100 percentage
  logs,              // Array of ExecutionLog
  events,            // Array of ExecutionEvent
  startTime,         // ISO timestamp
  estimatedEndTime,  // ISO timestamp
  errors,            // Array of ExecutionError
} = useExecutionStatus()
```

### Execution Operations
```typescript
const {
  startExecution,    // (executionId, workflowId) => void
  addEvent,          // (event: ExecutionEvent) => void
  addLog,            // (log: ExecutionLog) => void
  updateNodeStatus,  // (nodeId, status) => void
  setCurrentNode,    // (nodeId) => void
  updateProgress,    // (progress: 0-100) => void
  completeExecution, // (status: completed|failed|cancelled) => void
  resetExecution,    // () => void
  isRunning,         // Boolean - execution in progress?
  progress,          // Number 0-100
} = useExecutionOperations()
```

### Error Recovery
```typescript
const {
  state: {
    errors,          // Array of ErrorRecord
    isRecovering,    // Currently recovering?
    lastRecoveryTime,// ISO timestamp
  },
  addError,          // (error, context?, maxRetries?) => void
  removeError,       // (errorId) => void
  clearErrors,       // () => void
  incrementRetry,    // (errorId) => void
  startRecovery,     // () => void
  completeRecovery,  // () => void
  hasErrors,         // Boolean
  retryableErrors,   // Filtered errors that can be retried
} = useErrorRecovery()
```

## Testing Strategy

After each component migration:
1. Check that component renders without console errors
2. Verify state updates work (hook values change)
3. Verify dispatch functions work (actions trigger)
4. Check localStorage persists state
5. Run Playwright tests if they exist

## Rollback Plan

If a component migration breaks functionality:
1. Revert the component to old store usage temporarily
2. Document the issue in a separate file
3. Continue with other components
4. Return to problematic component in P2-007 (testing phase)

## Timeline Estimate

- ExecutionViewer: 10 min
- ExecutionStatusBar: 5 min
- ErrorPanel: 5 min
- WorkflowToolbar: 15 min
- Remaining components: 30-45 min
- **Total: ~1.5 hours**

## Success Criteria

- [ ] All components compile without errors
- [ ] App loads without console errors
- [ ] All hooks accessible from migrated components
- [ ] State updates work correctly
- [ ] Undo/redo functions properly
- [ ] Error recovery accessible from error panel
- [ ] All localStorage persisted state works
- [ ] No regressions in existing features
