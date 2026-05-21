import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WorkflowProvider } from '@/contexts/WorkflowContext'
import { useWorkflowOperations } from './useWorkflowOperations'
import { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return <WorkflowProvider>{children}</WorkflowProvider>
}

describe('useWorkflowOperations', () => {
  it('should initialize with empty workflow', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
    expect(result.current.workflow).toBeNull()
    expect(result.current.selectedNodeId).toBeNull()
  })

  it('should set workflow', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
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
      result.current.setWorkflow(workflow)
    })

    expect(result.current.workflow).toEqual(workflow)
  })

  it('should add node', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
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
      result.current.setWorkflow(workflow)
    })

    const node = {
      id: 'node-1',
      type: 'default',
      data: { label: 'Test Node', type: 'test' },
      position: { x: 0, y: 0 },
    }

    act(() => {
      result.current.addNode(node)
    })

    expect(result.current.workflow?.nodes).toHaveLength(1)
    expect(result.current.workflow?.nodes[0].id).toBe('node-1')
  })

  it('should delete node', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [
        {
          id: 'node-1',
          type: 'default',
          data: { label: 'Test Node', type: 'test' },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.setWorkflow(workflow)
    })

    act(() => {
      result.current.deleteNode('node-1')
    })

    expect(result.current.workflow?.nodes).toHaveLength(0)
  })

  it('should update node', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [
        {
          id: 'node-1',
          type: 'default',
          data: { label: 'Old Label', type: 'test' },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.setWorkflow(workflow)
    })

    act(() => {
      result.current.updateNode('node-1', {
        data: { label: 'New Label', type: 'test' },
      })
    })

    expect(result.current.workflow?.nodes[0].data.label).toBe('New Label')
  })

  it('should select node', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })

    act(() => {
      result.current.selectNode('node-1')
    })

    expect(result.current.selectedNodeId).toBe('node-1')
  })

  it('should add edge', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
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
      result.current.setWorkflow(workflow)
    })

    const edge = {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
    }

    act(() => {
      result.current.addEdge(edge)
    })

    expect(result.current.workflow?.edges).toHaveLength(1)
    expect(result.current.workflow?.edges[0].id).toBe('edge-1')
  })

  it('should delete edge', () => {
    const { result } = renderHook(() => useWorkflowOperations(), { wrapper: Wrapper })
    const workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      active: false,
      nodes: [],
      edges: [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.setWorkflow(workflow)
    })

    act(() => {
      result.current.deleteEdge('edge-1')
    })

    expect(result.current.workflow?.edges).toHaveLength(0)
  })

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useWorkflowOperations())
    }).toThrow()
  })
})
