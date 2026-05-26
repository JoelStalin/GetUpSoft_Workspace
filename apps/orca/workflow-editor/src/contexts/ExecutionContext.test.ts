import { describe, it, expect, beforeEach } from 'vitest'
import { executionReducer, createDefaultExecutionState } from './ExecutionContext'
import { ExecutionLog } from '../types/execution'

describe('ExecutionContext', () => {
  let initialState: any

  beforeEach(() => {
    initialState = createDefaultExecutionState()
  })

  describe('executionReducer - START_EXECUTION', () => {
    it('should start execution with valid id and workflow', () => {
      const action = {
        type: 'START_EXECUTION' as const,
        payload: { executionId: 'exec-123', workflowId: 'wf-456' },
      }
      const newState = executionReducer(initialState, action as any)

      expect(newState.status).toBe('running')
      expect(newState.currentExecutionId).toBe('exec-123')
      expect(newState.currentWorkflowId).toBe('wf-456')
    })

    it('should reset logs when starting new execution', () => {
      let state = initialState
      const logAction = {
        type: 'ADD_LOG' as const,
        payload: {
          nodeId: 'node-1',
          status: 'completed' as const,
          timestamp: new Date().toISOString(),
        },
      }
      state = executionReducer(state, logAction as any)
      expect(state.logs).toHaveLength(1)

      const startAction = {
        type: 'START_EXECUTION' as const,
        payload: { executionId: 'exec-123', workflowId: 'wf-456' },
      }
      state = executionReducer(state, startAction as any)

      expect(state.logs).toHaveLength(0)
    })
  })

  describe('executionReducer - ADD_LOG', () => {
    it('should add execution log', () => {
      const log: ExecutionLog = {
        nodeId: 'node-1',
        status: 'running',
        message: 'Executing node',
        timestamp: new Date().toISOString(),
      }

      const action = { type: 'ADD_LOG' as const, payload: log }
      const newState = executionReducer(initialState, action as any)

      expect(newState.logs).toHaveLength(1)
      expect(newState.logs[0]).toEqual(log)
    })

    it('should accumulate multiple logs', () => {
      let state = initialState

      const log1: ExecutionLog = {
        nodeId: 'node-1',
        status: 'running',
        timestamp: new Date().toISOString(),
      }

      const log2: ExecutionLog = {
        nodeId: 'node-2',
        status: 'pending',
        timestamp: new Date().toISOString(),
      }

      state = executionReducer(state, { type: 'ADD_LOG', payload: log1 } as any)
      state = executionReducer(state, { type: 'ADD_LOG', payload: log2 } as any)

      expect(state.logs).toHaveLength(2)
      expect(state.logs[0].nodeId).toBe('node-1')
      expect(state.logs[1].nodeId).toBe('node-2')
    })

    it('should handle logs with error messages', () => {
      const log: ExecutionLog = {
        nodeId: 'node-1',
        status: 'failed',
        error: { message: 'Connection timeout' },
        timestamp: new Date().toISOString(),
      }

      const action = { type: 'ADD_LOG' as const, payload: log }
      const newState = executionReducer(initialState, action as any)

      expect(newState.logs[0].status).toBe('failed')
      expect(newState.logs[0].error?.message).toBe('Connection timeout')
    })
  })

  describe('executionReducer - ADD_EVENT', () => {
    it('should add execution event', () => {
      const event = {
        id: 'evt-1',
        type: 'node.started' as const,
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
      }

      const action = { type: 'ADD_EVENT' as const, payload: event }
      const newState = executionReducer(initialState, action as any)

      expect(newState.events).toHaveLength(1)
      expect(newState.events[0]).toEqual(event)
    })
  })

  describe('executionReducer - UPDATE_NODE_STATUS', () => {
    it('should update node status', () => {
      const action = {
        type: 'UPDATE_NODE_STATUS' as const,
        payload: { nodeId: 'node-1', status: 'running' as const },
      }
      const newState = executionReducer(initialState, action as any)

      const log = newState.logs.find((l: any) => l.nodeId === 'node-1')
      expect(log?.status).toBe('running')
    })

    it('should track status transitions', () => {
      let state = initialState

      state = executionReducer(state, {
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId: 'node-1', status: 'pending' as const },
      } as any)

      state = executionReducer(state, {
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId: 'node-1', status: 'running' as const },
      } as any)

      state = executionReducer(state, {
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId: 'node-1', status: 'completed' as const },
      } as any)

      const logs = state.logs.filter((l: any) => l.nodeId === 'node-1')
      expect(logs).toHaveLength(3)
      expect(logs[0].status).toBe('pending')
      expect(logs[1].status).toBe('running')
      expect(logs[2].status).toBe('completed')
    })
  })

  describe('executionReducer - SET_CURRENT_NODE', () => {
    it('should set currently executing node', () => {
      const action = { type: 'SET_CURRENT_NODE' as const, payload: 'node-123' }
      const newState = executionReducer(initialState, action as any)

      expect(newState.currentNodeId).toBe('node-123')
    })

    it('should clear current node when passed null', () => {
      let state = initialState
      state = executionReducer(state, { type: 'SET_CURRENT_NODE', payload: 'node-123' } as any)
      state = executionReducer(state, { type: 'SET_CURRENT_NODE', payload: null } as any)

      expect(state.currentNodeId).toBeNull()
    })
  })

  describe('executionReducer - UPDATE_PROGRESS', () => {
    it('should update progress percentage', () => {
      const action = { type: 'UPDATE_PROGRESS' as const, payload: 50 }
      const newState = executionReducer(initialState, action as any)

      expect(newState.progress).toBe(50)
    })

    it('should clamp progress between 0-100', () => {
      let state = initialState

      state = executionReducer(state, { type: 'UPDATE_PROGRESS', payload: 150 } as any)
      expect(state.progress).toBeLessThanOrEqual(100)

      state = executionReducer(state, { type: 'UPDATE_PROGRESS', payload: -10 } as any)
      expect(state.progress).toBeGreaterThanOrEqual(0)
    })
  })

  describe('executionReducer - EXECUTION_COMPLETE', () => {
    it('should mark execution as completed', () => {
      let state = initialState
      state = executionReducer(state, {
        type: 'START_EXECUTION',
        payload: { executionId: 'exec-1', workflowId: 'wf-1' },
      } as any)

      state = executionReducer(state, {
        type: 'EXECUTION_COMPLETE',
        payload: 'completed' as const,
      } as any)

      expect(state.status).toBe('completed')
      expect(state.completedAt).toBeDefined()
    })

    it('should mark execution as failed', () => {
      let state = initialState
      state = executionReducer(state, {
        type: 'START_EXECUTION',
        payload: { executionId: 'exec-1', workflowId: 'wf-1' },
      } as any)

      state = executionReducer(state, {
        type: 'EXECUTION_COMPLETE',
        payload: 'failed' as const,
      } as any)

      expect(state.status).toBe('failed')
    })

    it('should mark execution as cancelled', () => {
      let state = initialState
      state = executionReducer(state, {
        type: 'START_EXECUTION',
        payload: { executionId: 'exec-1', workflowId: 'wf-1' },
      } as any)

      state = executionReducer(state, {
        type: 'EXECUTION_COMPLETE',
        payload: 'cancelled' as const,
      } as any)

      expect(state.status).toBe('cancelled')
    })
  })

  describe('executionReducer - RESET', () => {
    it('should reset to default execution state', () => {
      let state = initialState
      state = executionReducer(state, {
        type: 'START_EXECUTION',
        payload: { executionId: 'exec-1', workflowId: 'wf-1' },
      } as any)

      const log: ExecutionLog = {
        nodeId: 'node-1',
        status: 'running',
        timestamp: new Date().toISOString(),
      }
      state = executionReducer(state, { type: 'ADD_LOG', payload: log } as any)

      state = executionReducer(state, { type: 'RESET' } as any)

      expect(state).toEqual(createDefaultExecutionState())
      expect(state.logs).toHaveLength(0)
      expect(state.status).toBe('idle')
    })
  })

  describe('Edge cases', () => {
    it('should handle logs without timestamps', () => {
      const log: any = {
        nodeId: 'node-1',
        status: 'running',
      }

      const action = { type: 'ADD_LOG' as const, payload: log }
      const newState = executionReducer(initialState, action as any)

      expect(newState.logs).toHaveLength(1)
    })

    it('should handle concurrent node status updates', () => {
      let state = initialState

      state = executionReducer(state, {
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId: 'node-1', status: 'running' as const },
      } as any)

      state = executionReducer(state, {
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId: 'node-2', status: 'running' as const },
      } as any)

      const node1Logs = state.logs.filter((l: any) => l.nodeId === 'node-1')
      const node2Logs = state.logs.filter((l: any) => l.nodeId === 'node-2')

      expect(node1Logs).toHaveLength(1)
      expect(node2Logs).toHaveLength(1)
    })

    it('should handle rapid progress updates', () => {
      let state = initialState

      for (let i = 0; i <= 100; i += 10) {
        state = executionReducer(state, { type: 'UPDATE_PROGRESS', payload: i } as any)
      }

      expect(state.progress).toBe(100)
    })
  })
})
