import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WorkflowProvider } from '@/contexts/WorkflowContext'
import { useWorkflowHistory } from './useWorkflowHistory'
import { useWorkflowOperations } from './useWorkflowOperations'
import { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return <WorkflowProvider>{children}</WorkflowProvider>
}

describe('useWorkflowHistory', () => {
  it('should initialize with no history', () => {
    const { result } = renderHook(() => useWorkflowHistory(), { wrapper: Wrapper })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historySize).toBe(0)
    expect(result.current.futureSize).toBe(0)
  })

  it('should push history', () => {
    const { result } = renderHook(() => {
      const ops = useWorkflowOperations()
      const hist = useWorkflowHistory()
      return { ops, hist }
    }, { wrapper: Wrapper })

    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.ops.setWorkflow(workflow)
    })

    act(() => {
      result.current.hist.pushHistory()
    })

    expect(result.current.hist.historySize).toBe(1)
  })

  it('should undo after pushHistory and mutation', () => {
    function TestComponent() {
      const operations = useWorkflowOperations()
      const history = useWorkflowHistory()
      return {
        operations,
        history,
      }
    }

    const { result } = renderHook(() => {
      const ops = useWorkflowOperations()
      const hist = useWorkflowHistory()
      return { ops, hist }
    }, { wrapper: Wrapper })

    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Initial state
    act(() => {
      result.current.ops.setWorkflow(workflow)
    })

    // Push history
    act(() => {
      result.current.hist.pushHistory()
    })

    // Make a change
    act(() => {
      result.current.ops.addNode({
        id: 'node-1',
        type: 'default',
        data: { label: 'Test Node', type: 'test' },
        position: { x: 0, y: 0 },
      })
    })

    expect(result.current.ops.workflow?.nodes).toHaveLength(1)

    // Undo
    act(() => {
      result.current.hist.undo()
    })

    expect(result.current.ops.workflow?.nodes).toHaveLength(0)
    expect(result.current.hist.canRedo).toBe(true)
  })

  it('should redo after undo', () => {
    const { result } = renderHook(() => {
      const ops = useWorkflowOperations()
      const hist = useWorkflowHistory()
      return { ops, hist }
    }, { wrapper: Wrapper })

    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.ops.setWorkflow(workflow)
      result.current.hist.pushHistory()
      result.current.ops.addNode({
        id: 'node-1',
        type: 'default',
        data: { label: 'Test Node', type: 'test' },
        position: { x: 0, y: 0 },
      })
      result.current.hist.undo()
    })

    expect(result.current.ops.workflow?.nodes).toHaveLength(0)

    act(() => {
      result.current.hist.redo()
    })

    expect(result.current.ops.workflow?.nodes).toHaveLength(1)
  })

  it('should clear future stack on new mutation', () => {
    const { result } = renderHook(() => {
      const ops = useWorkflowOperations()
      const hist = useWorkflowHistory()
      return { ops, hist }
    }, { wrapper: Wrapper })

    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.ops.setWorkflow(workflow)
      result.current.hist.pushHistory()
      result.current.ops.addNode({
        id: 'node-1',
        type: 'default',
        data: { label: 'Test Node', type: 'test' },
        position: { x: 0, y: 0 },
      })
      result.current.hist.undo()
    })

    expect(result.current.hist.canRedo).toBe(true)

    // Make a new change
    act(() => {
      result.current.ops.addNode({
        id: 'node-2',
        type: 'default',
        data: { label: 'Test Node 2', type: 'test' },
        position: { x: 100, y: 0 },
      })
    })

    expect(result.current.hist.canRedo).toBe(false)
    expect(result.current.hist.futureSize).toBe(0)
  })

  it('should not undo beyond history limit', () => {
    const { result } = renderHook(() => {
      const ops = useWorkflowOperations()
      const hist = useWorkflowHistory()
      return { ops, hist }
    }, { wrapper: Wrapper })

    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.ops.setWorkflow(workflow)
      result.current.hist.pushHistory()
    })

    expect(result.current.hist.canUndo).toBe(true)

    act(() => {
      result.current.hist.undo()
    })

    expect(result.current.hist.canUndo).toBe(false)
  })

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useWorkflowHistory())
    }).toThrow()
  })
})
