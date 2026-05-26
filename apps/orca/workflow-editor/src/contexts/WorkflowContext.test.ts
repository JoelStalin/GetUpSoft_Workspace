import { describe, it, expect, beforeEach } from 'vitest'
import { workflowReducer, createDefaultWorkflowState } from './WorkflowContext'
import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow'

describe('WorkflowContext', () => {
  let initialState: any

  beforeEach(() => {
    initialState = createDefaultWorkflowState()
  })

  describe('workflowReducer - SET_WORKFLOW', () => {
    it('should set workflow with valid data', () => {
      const mockWorkflow: Workflow = {
        id: 'wf-123',
        name: 'Test Workflow',
        description: 'Test',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const action = { type: 'SET_WORKFLOW' as const, payload: mockWorkflow }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.workflow).toEqual(mockWorkflow)
      expect(newState.isDirty).toBe(false)
    })
  })

  describe('workflowReducer - ADD_NODE', () => {
    it('should add node to empty workflow', () => {
      const mockNode: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      const action = { type: 'ADD_NODE' as const, payload: mockNode }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.workflow.nodes).toHaveLength(1)
      expect(newState.workflow.nodes[0]).toEqual(mockNode)
      expect(newState.isDirty).toBe(true)
    })

    it('should preserve existing nodes when adding new one', () => {
      const node1: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      const node2: WorkflowNode = {
        id: 'node-2',
        type: 'action',
        position: { x: 200, y: 0 },
        data: { label: 'Action', type: 'action' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node1 } as any)
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node2 } as any)

      expect(state.workflow.nodes).toHaveLength(2)
      expect(state.workflow.nodes[0].id).toBe('node-1')
      expect(state.workflow.nodes[1].id).toBe('node-2')
    })
  })

  describe('workflowReducer - DELETE_NODE', () => {
    it('should remove node by id', () => {
      const node: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node } as any)
      expect(state.workflow.nodes).toHaveLength(1)

      state = workflowReducer(state, { type: 'DELETE_NODE', payload: 'node-1' } as any)

      expect(state.workflow.nodes).toHaveLength(0)
      expect(state.isDirty).toBe(true)
    })

    it('should remove only specified node', () => {
      const node1: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      const node2: WorkflowNode = {
        id: 'node-2',
        type: 'action',
        position: { x: 200, y: 0 },
        data: { label: 'Action', type: 'action' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node1 } as any)
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node2 } as any)
      state = workflowReducer(state, { type: 'DELETE_NODE', payload: 'node-1' } as any)

      expect(state.workflow.nodes).toHaveLength(1)
      expect(state.workflow.nodes[0].id).toBe('node-2')
    })
  })

  describe('workflowReducer - ADD_EDGE', () => {
    it('should add edge between nodes', () => {
      const edge: WorkflowEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      }

      const action = { type: 'ADD_EDGE' as const, payload: edge }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.workflow.edges).toHaveLength(1)
      expect(newState.workflow.edges[0]).toEqual(edge)
      expect(newState.isDirty).toBe(true)
    })
  })

  describe('workflowReducer - DELETE_EDGE', () => {
    it('should remove edge by id', () => {
      const edge: WorkflowEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_EDGE', payload: edge } as any)
      expect(state.workflow.edges).toHaveLength(1)

      state = workflowReducer(state, { type: 'DELETE_EDGE', payload: 'edge-1' } as any)

      expect(state.workflow.edges).toHaveLength(0)
    })
  })

  describe('workflowReducer - SELECT_NODE', () => {
    it('should select node by id', () => {
      const action = { type: 'SELECT_NODE' as const, payload: 'node-123' }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.selectedNodeId).toBe('node-123')
    })

    it('should deselect when passing null', () => {
      const action = { type: 'SELECT_NODE' as const, payload: null }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.selectedNodeId).toBeNull()
    })
  })

  describe('workflowReducer - SELECT_EDGE', () => {
    it('should select edge by id', () => {
      const action = { type: 'SELECT_EDGE' as const, payload: 'edge-123' }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.selectedEdgeId).toBe('edge-123')
    })
  })

  describe('workflowReducer - MARK_DIRTY/MARK_CLEAN', () => {
    it('should mark workflow as dirty', () => {
      const action = { type: 'MARK_DIRTY' as const }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.isDirty).toBe(true)
    })

    it('should mark workflow as clean', () => {
      let state = initialState
      state.isDirty = true
      const action = { type: 'MARK_CLEAN' as const }
      const newState = workflowReducer(state, action as any)

      expect(newState.isDirty).toBe(false)
    })
  })

  describe('workflowReducer - UNDO/REDO', () => {
    it('should undo to previous state', () => {
      const node: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'PUSH_HISTORY', payload: state.workflow } as any)
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node } as any)

      expect(state.workflow.nodes).toHaveLength(1)
      expect(state.historyIndex).toBe(1)

      state = workflowReducer(state, { type: 'UNDO' } as any)

      expect(state.historyIndex).toBe(0)
    })

    it('should redo to next state', () => {
      const node: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'PUSH_HISTORY', payload: state.workflow } as any)
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node } as any)
      state = workflowReducer(state, { type: 'UNDO' } as any)

      expect(state.historyIndex).toBe(0)

      state = workflowReducer(state, { type: 'REDO' } as any)

      expect(state.historyIndex).toBe(1)
    })
  })

  describe('workflowReducer - RESET', () => {
    it('should reset to default state', () => {
      const node: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node } as any)
      expect(state.workflow.nodes).toHaveLength(1)

      state = workflowReducer(state, { type: 'RESET' } as any)

      expect(state).toEqual(createDefaultWorkflowState())
      expect(state.workflow.nodes).toHaveLength(0)
      expect(state.selectedNodeId).toBeNull()
    })
  })

  describe('Edge cases', () => {
    it('should handle adding duplicate node ids (overwrites)', () => {
      const node: WorkflowNode = {
        id: 'node-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'trigger' },
      }

      const nodeDuplicate: WorkflowNode = {
        id: 'node-1',
        type: 'action',
        position: { x: 200, y: 0 },
        data: { label: 'Action', type: 'action' },
      }

      let state = initialState
      state = workflowReducer(state, { type: 'ADD_NODE', payload: node } as any)
      state = workflowReducer(state, { type: 'ADD_NODE', payload: nodeDuplicate } as any)

      expect(state.workflow.nodes).toHaveLength(1)
      expect(state.workflow.nodes[0].data.label).toBe('Action')
    })

    it('should handle selecting non-existent node', () => {
      const action = { type: 'SELECT_NODE' as const, payload: 'non-existent' }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.selectedNodeId).toBe('non-existent')
    })

    it('should handle deleting non-existent node gracefully', () => {
      const action = { type: 'DELETE_NODE' as const, payload: 'non-existent' }
      const newState = workflowReducer(initialState, action as any)

      expect(newState.workflow.nodes).toHaveLength(0)
      expect(newState.isDirty).toBe(true)
    })
  })
})
