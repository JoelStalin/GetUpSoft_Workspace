import { describe, it, expect, beforeEach } from 'vitest'
import { errorRecoveryReducer, createDefaultErrorRecoveryState } from './ErrorRecoveryContext'
import { ErrorRecord } from '../types/execution'

describe('ErrorRecoveryContext', () => {
  let initialState: any

  beforeEach(() => {
    initialState = createDefaultErrorRecoveryState()
  })

  describe('errorRecoveryReducer - ADD_ERROR', () => {
    it('should add error record', () => {
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'connection_error',
        message: 'Failed to connect to API',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: error }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.errors).toHaveLength(1)
      expect(newState.errors[0]).toEqual(error)
    })

    it('should classify retryable errors', () => {
      const retryableError: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: retryableError }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.errors[0].retryable).toBe(true)
      expect(newState.retryableErrors).toContainEqual(retryableError)
    })

    it('should classify non-retryable errors', () => {
      const fatalError: ErrorRecord = {
        id: 'err-1',
        type: 'validation_error',
        message: 'Invalid node configuration',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: false,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: fatalError }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.errors[0].retryable).toBe(false)
      expect(newState.retryableErrors).not.toContainEqual(fatalError)
    })
  })

  describe('errorRecoveryReducer - RETRY_ERROR', () => {
    it('should increment retry count', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      state = errorRecoveryReducer(state, {
        type: 'RETRY_ERROR',
        payload: 'err-1',
      } as any)

      expect(state.errors[0].retryCount).toBe(1)
    })

    it('should track max retry attempts', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)

      // Retry 3 times (max is usually 3)
      for (let i = 0; i < 3; i++) {
        state = errorRecoveryReducer(state, {
          type: 'RETRY_ERROR',
          payload: 'err-1',
        } as any)
      }

      expect(state.errors[0].retryCount).toBe(3)
    })

    it('should not retry non-retryable errors', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'validation_error',
        message: 'Invalid node configuration',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: false,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      state = errorRecoveryReducer(state, {
        type: 'RETRY_ERROR',
        payload: 'err-1',
      } as any)

      expect(state.errors[0].retryCount).toBe(0)
    })
  })

  describe('errorRecoveryReducer - RESOLVE_ERROR', () => {
    it('should mark error as resolved', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      state = errorRecoveryReducer(state, {
        type: 'RESOLVE_ERROR',
        payload: { errorId: 'err-1', resolvedAt: new Date().toISOString() },
      } as any)

      expect(state.errors[0].resolvedAt).toBeDefined()
    })

    it('should remove error from retryable list when resolved', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      expect(state.retryableErrors).toHaveLength(1)

      state = errorRecoveryReducer(state, {
        type: 'RESOLVE_ERROR',
        payload: { errorId: 'err-1', resolvedAt: new Date().toISOString() },
      } as any)

      expect(state.retryableErrors).toHaveLength(0)
    })
  })

  describe('errorRecoveryReducer - DISMISS_ERROR', () => {
    it('should dismiss error', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'warning',
        message: 'Non-critical warning',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: false,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      expect(state.errors).toHaveLength(1)

      state = errorRecoveryReducer(state, {
        type: 'DISMISS_ERROR',
        payload: 'err-1',
      } as any)

      expect(state.errors).toHaveLength(0)
    })
  })

  describe('errorRecoveryReducer - CLEAR_ERRORS', () => {
    it('should clear all errors', () => {
      let state = initialState

      const error1: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      const error2: ErrorRecord = {
        id: 'err-2',
        type: 'connection_error',
        message: 'Connection failed',
        nodeId: 'node-2',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error1 } as any)
      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error2 } as any)
      expect(state.errors).toHaveLength(2)

      state = errorRecoveryReducer(state, { type: 'CLEAR_ERRORS' } as any)

      expect(state.errors).toHaveLength(0)
      expect(state.retryableErrors).toHaveLength(0)
    })
  })

  describe('errorRecoveryReducer - RESET', () => {
    it('should reset to default state', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      state = errorRecoveryReducer(state, { type: 'RESET' } as any)

      expect(state).toEqual(createDefaultErrorRecoveryState())
      expect(state.errors).toHaveLength(0)
    })
  })

  describe('Error Type Classification', () => {
    it('should classify timeout as retryable', () => {
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: error }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.retryableErrors).toContainEqual(expect.objectContaining({ id: 'err-1' }))
    })

    it('should classify network_error as retryable', () => {
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'network_error',
        message: 'Network error',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: error }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.retryableErrors).toContainEqual(expect.objectContaining({ id: 'err-1' }))
    })

    it('should classify validation_error as non-retryable', () => {
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'validation_error',
        message: 'Invalid configuration',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: false,
        retryCount: 0,
      }

      const action = { type: 'ADD_ERROR' as const, payload: error }
      const newState = errorRecoveryReducer(initialState, action as any)

      expect(newState.retryableErrors).not.toContainEqual(expect.objectContaining({ id: 'err-1' }))
    })
  })

  describe('Edge cases', () => {
    it('should handle multiple errors for same node', () => {
      let state = initialState

      for (let i = 0; i < 5; i++) {
        const error: ErrorRecord = {
          id: `err-${i}`,
          type: 'timeout',
          message: `Request timeout ${i}`,
          nodeId: 'node-1',
          timestamp: new Date().toISOString(),
          retryable: true,
          retryCount: 0,
        }
        state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      }

      expect(state.errors).toHaveLength(5)
      const nodeErrors = state.errors.filter((e: any) => e.nodeId === 'node-1')
      expect(nodeErrors).toHaveLength(5)
    })

    it('should handle concurrent error and retry actions', () => {
      let state = initialState
      const error: ErrorRecord = {
        id: 'err-1',
        type: 'timeout',
        message: 'Request timeout',
        nodeId: 'node-1',
        timestamp: new Date().toISOString(),
        retryable: true,
        retryCount: 0,
      }

      state = errorRecoveryReducer(state, { type: 'ADD_ERROR', payload: error } as any)
      state = errorRecoveryReducer(state, {
        type: 'RETRY_ERROR',
        payload: 'err-1',
      } as any)
      state = errorRecoveryReducer(state, {
        type: 'RETRY_ERROR',
        payload: 'err-1',
      } as any)

      expect(state.errors[0].retryCount).toBe(2)
      expect(state.retryableErrors).toHaveLength(1)
    })
  })
})
