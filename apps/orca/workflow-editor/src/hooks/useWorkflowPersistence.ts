'use client'

import { useCallback, useState } from 'react'
import { Workflow } from '../types/workflow'
import { useToast } from '../contexts/ToastContext'
import { getApiUrl } from '../config/runtime'

/**
 * Hook for saving and loading workflows
 * Handles both backend persistence and local fallback
 */
export function useWorkflowPersistence() {
  const { addToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const saveWorkflow = useCallback(
    async (workflow: Workflow): Promise<boolean> => {
      setIsSaving(true)
      try {
        // Try backend first
        const response = await fetch(getApiUrl(`/api/n8n/workflows/${workflow.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: workflow.name,
            active: workflow.active,
            nodes: workflow.nodes,
            connections: convertEdgesToConnections(workflow.edges),
            settings: workflow.settings,
          }),
        })

        if (response.ok) {
          // Also save to localStorage as backup
          localStorage.setItem(
            `orca_workflow_${workflow.id}`,
            JSON.stringify({ ...workflow, timestamp: Date.now() })
          )

          addToast(`Workflow "${workflow.name}" saved successfully`, 'success')
          return true
        } else {
          throw new Error(`Server error: ${response.statusText}`)
        }
      } catch (error) {
        console.warn('Backend save failed, using localStorage fallback')

        // Fallback to localStorage
        try {
          localStorage.setItem(
            `orca_workflow_${workflow.id}`,
            JSON.stringify({ ...workflow, timestamp: Date.now() })
          )
          addToast(`Workflow saved to local storage (offline mode)`, 'info')
          return true
        } catch (storageError) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          addToast(`Failed to save workflow: ${message}`, 'error')
          console.error('Save failed:', error)
          return false
        }
      } finally {
        setIsSaving(false)
      }
    },
    [addToast]
  )

  const loadWorkflow = useCallback(
    async (workflowId: string): Promise<Workflow | null> => {
      setIsLoading(true)
      try {
        // Try backend first
        const response = await fetch(getApiUrl(`/api/n8n/workflows/${workflowId}`))

        if (response.ok) {
          const data = await response.json()
          const workflow: Workflow = {
            id: data.id,
            name: data.name,
            active: data.active,
            nodes: data.nodes || [],
            edges: data.connections ? convertConnectionsToEdges(data.connections) : [],
            settings: data.settings,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            orca_meta: data.orca_meta,
          }
          addToast(`Workflow "${workflow.name}" loaded`, 'success')
          return workflow
        } else if (response.status === 404) {
          // Try localStorage
          const stored = localStorage.getItem(`orca_workflow_${workflowId}`)
          if (stored) {
            const workflow = JSON.parse(stored) as Workflow
            addToast(`Workflow loaded from local cache`, 'info')
            return workflow
          }
          throw new Error('Workflow not found')
        } else {
          throw new Error(`Server error: ${response.statusText}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        addToast(`Failed to load workflow: ${message}`, 'error')
        console.error('Load failed:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [addToast]
  )

  const listWorkflows = useCallback(async (): Promise<Workflow[]> => {
    setIsLoading(true)
    try {
      const response = await fetch(getApiUrl('/api/n8n/workflows'))

      if (response.ok) {
        const data = await response.json()
        return (data.data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          active: w.active,
          nodes: w.nodes || [],
          edges: w.connections ? convertConnectionsToEdges(w.connections) : [],
          settings: w.settings,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          orca_meta: w.orca_meta,
        }))
      } else {
        throw new Error('Failed to list workflows')
      }
    } catch (error) {
      console.error('List workflows failed:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const exportWorkflow = useCallback(
    async (workflow: Workflow, format: 'json' | 'yaml' = 'json'): Promise<Blob | null> => {
      try {
        if (format === 'json') {
          const jsonStr = JSON.stringify(workflow, null, 2)
          return new Blob([jsonStr], { type: 'application/json' })
        } else {
          // Simple YAML export (can be enhanced)
          const yamlStr = workflowToYaml(workflow)
          return new Blob([yamlStr], { type: 'application/x-yaml' })
        }
      } catch (error) {
        addToast('Failed to export workflow', 'error')
        console.error('Export failed:', error)
        return null
      }
    },
    [addToast]
  )

  const deleteWorkflow = useCallback(
    async (workflowId: string): Promise<boolean> => {
      try {
        const response = await fetch(getApiUrl(`/api/n8n/workflows/${workflowId}`), {
          method: 'DELETE',
        })

        if (response.ok) {
          localStorage.removeItem(`orca_workflow_${workflowId}`)
          addToast('Workflow deleted', 'success')
          return true
        } else {
          throw new Error(`Server error: ${response.statusText}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        addToast(`Failed to delete workflow: ${message}`, 'error')
        return false
      }
    },
    [addToast]
  )

  return {
    saveWorkflow,
    loadWorkflow,
    listWorkflows,
    exportWorkflow,
    deleteWorkflow,
    isSaving,
    isLoading,
  }
}

// Helper: Convert connections format to edges
function convertConnectionsToEdges(connections: Record<string, any>) {
  const edges = []
  for (const [source, targets] of Object.entries(connections)) {
    if (Array.isArray(targets)) {
      targets.forEach((target: any, index: number) => {
        edges.push({
          id: `${source}-${target.node_id || target}-${index}`,
          source,
          target: target.node_id || target,
          animated: true,
          type: 'smoothstep',
          style: { stroke: '#7c4dff', strokeWidth: 2 },
        })
      })
    }
  }
  return edges
}

// Helper: Convert edges to connections format
function convertEdgesToConnections(edges: any) {
  const connections: Record<string, any> = {}

  edges.forEach((edge: any) => {
    if (!connections[edge.source]) {
      connections[edge.source] = []
    }
    connections[edge.source].push({
      node_id: edge.target,
      type: edge.type || 'smoothstep',
    })
  })

  return connections
}

// Helper: Simple workflow to YAML converter
function workflowToYaml(workflow: Workflow): string {
  let yaml = `name: ${workflow.name}\n`
  yaml += `id: ${workflow.id}\n`
  yaml += `active: ${workflow.active}\n`
  yaml += `\nnodes:\n`

  workflow.nodes.forEach((node) => {
    yaml += `  - id: ${node.id}\n`
    yaml += `    type: ${node.type}\n`
    yaml += `    label: ${node.data.label}\n`
    yaml += `    position:\n`
    yaml += `      x: ${node.position.x}\n`
    yaml += `      y: ${node.position.y}\n`
  })

  yaml += `\nedges:\n`
  workflow.edges.forEach((edge) => {
    yaml += `  - id: ${edge.id}\n`
    yaml += `    source: ${edge.source}\n`
    yaml += `    target: ${edge.target}\n`
  })

  return yaml
}
