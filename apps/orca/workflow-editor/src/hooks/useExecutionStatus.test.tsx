import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ExecutionProvider } from '@/contexts/ExecutionContext'
import { useExecutionStatus } from './useExecutionStatus'
import { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return <ExecutionProvider>{children}</ExecutionProvider>
}

describe('useExecutionStatus', () => {
  it('should initialize with empty logs', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })
    expect(result.current.logs).toEqual([])
    expect(result.current.isExecuting).toBe(false)
    expect(result.current.currentExecutionId).toBeNull()
  })

  it('should add log', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const log = {
      nodeId: 'node-1',
      status: 'completed' as const,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      output: { result: 'test' },
    }

    act(() => {
      result.current.addLog(log)
    })

    expect(result.current.logs).toHaveLength(1)
    expect(result.current.logs[0].nodeId).toBe('node-1')
  })

  it('should update log', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const log = {
      nodeId: 'node-1',
      status: 'running' as const,
      startTime: new Date().toISOString(),
      endTime: undefined,
      output: undefined,
    }

    act(() => {
      result.current.addLog(log)
    })

    act(() => {
      result.current.updateLog('node-1', {
        status: 'completed',
        endTime: new Date().toISOString(),
        output: { result: 'success' },
      })
    })

    expect(result.current.logs[0].status).toBe('completed')
    expect(result.current.logs[0].output).toEqual({ result: 'success' })
  })

  it('should set logs', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const logs = [
      {
        nodeId: 'node-1',
        status: 'completed' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
      {
        nodeId: 'node-2',
        status: 'failed' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        error: { message: 'Test error' },
      },
    ]

    act(() => {
      result.current.setLogs(logs)
    })

    expect(result.current.logs).toHaveLength(2)
    expect(result.current.logs[0].status).toBe('completed')
    expect(result.current.logs[1].status).toBe('failed')
  })

  it('should clear logs', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const log = {
      nodeId: 'node-1',
      status: 'completed' as const,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    }

    act(() => {
      result.current.addLog(log)
    })

    expect(result.current.logs).toHaveLength(1)

    act(() => {
      result.current.clearLogs()
    })

    expect(result.current.logs).toHaveLength(0)
  })

  it('should set current execution', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    act(() => {
      result.current.setCurrentExecution('exec-123')
    })

    expect(result.current.currentExecutionId).toBe('exec-123')
  })

  it('should set is executing', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    expect(result.current.isExecuting).toBe(false)

    act(() => {
      result.current.setIsExecuting(true)
    })

    expect(result.current.isExecuting).toBe(true)

    act(() => {
      result.current.setIsExecuting(false)
    })

    expect(result.current.isExecuting).toBe(false)
  })

  it('should get node log', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const log = {
      nodeId: 'node-1',
      status: 'completed' as const,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      output: { result: 'success' },
    }

    act(() => {
      result.current.addLog(log)
    })

    const nodeLog = result.current.getNodeLog('node-1')
    expect(nodeLog).toEqual(log)
  })

  it('should return undefined for missing node log', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const nodeLog = result.current.getNodeLog('non-existent')
    expect(nodeLog).toBeUndefined()
  })

  it('should handle multiple node logs', () => {
    const { result } = renderHook(() => useExecutionStatus(), { wrapper: Wrapper })

    const logs = [
      { nodeId: 'node-1', status: 'completed' as const, startTime: new Date().toISOString() },
      { nodeId: 'node-2', status: 'running' as const, startTime: new Date().toISOString() },
      { nodeId: 'node-3', status: 'pending' as const, startTime: new Date().toISOString() },
    ]

    act(() => {
      logs.forEach((log) => result.current.addLog(log))
    })

    expect(result.current.logs).toHaveLength(3)
    expect(result.current.getNodeLog('node-2')?.status).toBe('running')
  })

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useExecutionStatus())
    }).toThrow()
  })
})
