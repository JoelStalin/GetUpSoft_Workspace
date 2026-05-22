import { useMemo } from 'react'
import { Workflow } from '../types/workflow'

export interface NodeStats {
  nodeId: string
  nodeLabel: string
  executions: number
  successes: number
  failures: number
  avgDuration: number
  lastExecuted?: string
}

export interface WorkflowStats {
  totalExecutions: number
  successRate: number
  totalDuration: number
  avgDuration: number
  totalNodes: number
  totalEdges: number
  lastExecuted?: string
  mostUsedNode?: string
  failureRate: number
  nodeStats: NodeStats[]
}

export function useWorkflowAnalytics(workflow: Workflow | null) {
  const stats = useMemo<WorkflowStats | null>(() => {
    if (!workflow) return null

    const nodeCount = workflow.nodes?.length || 0
    const edgeCount = workflow.edges?.length || 0

    // Simulate analytics data - in production would come from API
    const baseStats: WorkflowStats = {
      totalExecutions: Math.floor(Math.random() * 100) + 1,
      successRate: Math.floor(Math.random() * 40) + 60,
      totalDuration: Math.floor(Math.random() * 60000) + 5000,
      avgDuration: Math.floor(Math.random() * 5000) + 500,
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      failureRate: 0,
      nodeStats: [],
      lastExecuted: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }

    baseStats.failureRate = 100 - baseStats.successRate

    // Generate node stats
    if (workflow.nodes) {
      baseStats.nodeStats = workflow.nodes.map((node) => ({
        nodeId: node.id,
        nodeLabel: node.data?.label || 'Unknown',
        executions: Math.floor(baseStats.totalExecutions * (0.5 + Math.random() * 0.5)),
        successes: Math.floor(baseStats.totalExecutions * baseStats.successRate * 0.01),
        failures: Math.floor(baseStats.totalExecutions * baseStats.failureRate * 0.01),
        avgDuration: Math.floor(Math.random() * 3000) + 200,
        lastExecuted: new Date(Date.now() - Math.random() * 43200000).toISOString(),
      }))

      const mostUsed = baseStats.nodeStats.reduce((prev, current) =>
        prev.executions > current.executions ? prev : current
      )
      baseStats.mostUsedNode = mostUsed.nodeLabel
    }

    return baseStats
  }, [workflow])

  return stats
}

export function calculateTrendPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}
