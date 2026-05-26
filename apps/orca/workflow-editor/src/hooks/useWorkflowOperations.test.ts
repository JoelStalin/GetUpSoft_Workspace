import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWorkflowOperations, useWorkflowHistory, useExecutionStatus, useExecutionOperations } from './useWorkflowOperations'
import { WorkflowProvider } from '../contexts/WorkflowContext'
import { ExecutionProvider } from '../contexts/ExecutionContext'

// Mock component wrapper
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <WorkflowProvider>
    <ExecutionProvider>{children}</ExecutionProvider>
  </WorkflowProvider>
)

describe('useWorkflowOperations Hook', () => {
  describe('Basic Operations', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      expect(result.current.workflow).toBeDefined()
      expect(result.current.workflow?.nodes).toEqual([])
      expect(result.current.selectedNodeId).toBeNull()
    })

    it('should add a node', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Start', type: 'trigger' },
        })
      })

      expect(result.current.workflow?.nodes).toHaveLength(1)
      expect(result.current.workflow?.nodes[0].id).toBe('node-1')
    })

    it('should delete a node', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Start', type: 'trigger' },
        })
      })

      expect(result.current.workflow?.nodes).toHaveLength(1)

      act(() => {
        result.current.deleteNode('node-1')
      })

      expect(result.current.workflow?.nodes).toHaveLength(0)
    })

    it('should update a node', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      const node = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      act(() => {
        result.current.addNode(node)
      })

      act(() => {
        result.current.updateNode('node-1', {
          ...node,
          data: { label: 'Updated Start', type: 'trigger' },
        })
      })

      expect(result.current.workflow?.nodes[0].data.label).toBe('Updated Start')
    })
  })

  describe('Edge Operations', () => {
    it('should add an edge', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        })
      })

      expect(result.current.workflow?.edges).toHaveLength(1)
      expect(result.current.workflow?.edges[0].id).toBe('edge-1')
    })

    it('should delete an edge', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.addEdge({
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        })
      })

      act(() => {
        result.current.deleteEdge('edge-1')
      })

      expect(result.current.workflow?.edges).toHaveLength(0)
    })
  })

  describe('Selection Operations', () => {
    it('should select a node', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.selectNode('node-123')
      })

      expect(result.current.selectedNodeId).toBe('node-123')
    })

    it('should select an edge', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.selectEdge('edge-456')
      })

      expect(result.current.selectedEdgeId).toBe('edge-456')
    })
  })

  describe('State Management', () => {
    it('should mark workflow as dirty', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      expect(result.current.workflow?.isDirty).toBeFalsy()

      act(() => {
        result.current.markDirty()
      })

      expect(result.current.workflow?.isDirty).toBe(true)
    })

    it('should mark workflow as clean', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.markDirty()
      })

      act(() => {
        result.current.markClean()
      })

      expect(result.current.workflow?.isDirty).toBe(false)
    })
  })

  describe('Reset Operation', () => {
    it('should reset to default state', () => {
      const { result } = renderHook(() => useWorkflowOperations(), {
        wrapper: AllProviders,
      })

      act(() => {
        result.current.addNode({
          id: 'node-1',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Start', type: 'trigger' },
        })
        result.current.selectNode('node-1')
      })

      expect(result.current.workflow?.nodes).toHaveLength(1)
      expect(result.current.selectedNodeId).toBe('node-1')

      act(() => {
        result.current.reset()
      })

      expect(result.current.workflow?.nodes).toHaveLength(0)
      expect(result.current.selectedNodeId).toBeNull()
    })
  })
})

describe('useWorkflowHistory Hook', () => {
  it('should support undo/redo', () => {
    const { result: operationsResult } = renderHook(() => useWorkflowOperations(), {
      wrapper: AllProviders,
    })
    const { result: historyResult } = renderHook(() => useWorkflowHistory(), {
      wrapper: AllProviders,
    })

    act(() => {
      operationsResult.current.addNode({
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      })
      historyResult.current.pushHistory(operationsResult.current.workflow!)
    })

    expect(historyResult.current.canUndo).toBe(true)
    expect(historyResult.current.canRedo).toBe(false)

    act(() => {
      historyResult.current.undo()
    })

    expect(historyResult.current.canUndo).toBe(false)
    expect(historyResult.current.canRedo).toBe(true)
  })
})

describe('useExecutionStatus Hook', () => {
  it('should initialize with default execution state', () => {
    const { result } = renderHook(() => useExecutionStatus(), {
      wrapper: AllProviders,
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.logs).toEqual([])
    expect(result.current.currentExecutionId).toBeNull()
  })

  it('should provide log access', () => {
    const { result } = renderHook(() => useExecutionStatus(), {
      wrapper: AllProviders,
    })

    expect(Array.isArray(result.current.logs)).toBe(true)
    expect(result.current.logs).toHaveLength(0)
  })
})

describe('useExecutionOperations Hook', () => {
  it('should start execution', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.startExecution('exec-1', 'wf-1')
    })

    expect(result.current.state.status).toBe('running')
    expect(result.current.state.currentExecutionId).toBe('exec-1')
  })

  it('should add log entries', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.addLog({
        nodeId: 'node-1',
        status: 'running',
        timestamp: new Date().toISOString(),
      })
    })

    expect(result.current.state.logs).toHaveLength(1)
    expect(result.current.state.logs[0].nodeId).toBe('node-1')
  })

  it('should update node status', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.updateNodeStatus('node-1', 'running')
    })

    const log = result.current.state.logs.find((l) => l.nodeId === 'node-1')
    expect(log?.status).toBe('running')
  })

  it('should complete execution', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.startExecution('exec-1', 'wf-1')
      result.current.completeExecution('completed')
    })

    expect(result.current.state.status).toBe('completed')
    expect(result.current.state.completedAt).toBeDefined()
  })

  it('should track progress', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.updateProgress(50)
    })

    expect(result.current.state.progress).toBe(50)
  })

  it('should reset execution state', () => {
    const { result } = renderHook(() => useExecutionOperations(), {
      wrapper: AllProviders,
    })

    act(() => {
      result.current.startExecution('exec-1', 'wf-1')
      result.current.addLog({
        nodeId: 'node-1',
        status: 'running',
        timestamp: new Date().toISOString(),
      })
    })

    expect(result.current.state.logs).toHaveLength(1)

    act(() => {
      result.current.resetExecution()
    })

    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.logs).toHaveLength(0)
  })
})
