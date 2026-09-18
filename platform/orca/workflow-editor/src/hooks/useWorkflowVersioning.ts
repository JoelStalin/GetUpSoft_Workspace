import { useCallback, useState, useEffect } from 'react'
import { Workflow } from '../types/workflow'
import { useToast } from '../contexts/ToastContext'

export interface WorkflowVersion {
  id: string
  timestamp: string
  name?: string
  description?: string
  workflow: Workflow
  author?: string
  nodeCount: number
  edgeCount: number
  tags?: string[]
}

interface VersioningState {
  versions: WorkflowVersion[]
  currentVersionId?: string
  maxVersions?: number
}

const VERSIONING_STORAGE_KEY = 'orca_workflow_versions'

export function useWorkflowVersioning(workflowId: string | null) {
  const { addToast } = useToast()
  const [state, setState] = useState<VersioningState>({
    versions: [],
    maxVersions: 50,
  })

  // Load versions from localStorage
  useEffect(() => {
    if (!workflowId) return

    try {
      const saved = localStorage.getItem(`${VERSIONING_STORAGE_KEY}_${workflowId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setState(parsed)
      }
    } catch (e) {
      console.warn('Failed to load workflow versions:', e)
    }
  }, [workflowId])

  // Save versions to localStorage
  const saveVersions = useCallback(
    (newState: VersioningState) => {
      if (!workflowId) return

      try {
        localStorage.setItem(`${VERSIONING_STORAGE_KEY}_${workflowId}`, JSON.stringify(newState))
        setState(newState)
      } catch (e) {
        console.warn('Failed to save workflow versions:', e)
        addToast('Failed to save version', 'warning')
      }
    },
    [workflowId, addToast]
  )

  // Create a new version
  const createVersion = useCallback(
    (workflow: Workflow, versionName?: string, description?: string) => {
      if (!workflowId) return

      const newVersion: WorkflowVersion = {
        id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date().toISOString(),
        name: versionName,
        description,
        workflow,
        nodeCount: workflow.nodes?.length || 0,
        edgeCount: workflow.edges?.length || 0,
        tags: [],
      }

      const newVersions = [newVersion, ...state.versions]

      // Keep only maxVersions recent versions
      if (state.maxVersions && newVersions.length > state.maxVersions) {
        newVersions.splice(state.maxVersions)
      }

      const newState: VersioningState = {
        ...state,
        versions: newVersions,
        currentVersionId: newVersion.id,
      }

      saveVersions(newState)
      addToast(`Version "${versionName || 'Untitled'}" created`, 'success')

      return newVersion
    },
    [workflowId, state, saveVersions, addToast]
  )

  // Get a specific version
  const getVersion = useCallback(
    (versionId: string): WorkflowVersion | undefined => {
      return state.versions.find((v) => v.id === versionId)
    },
    [state.versions]
  )

  // Restore a version
  const restoreVersion = useCallback(
    (versionId: string): Workflow | null => {
      const version = getVersion(versionId)
      if (!version) {
        addToast('Version not found', 'error')
        return null
      }

      const newState: VersioningState = {
        ...state,
        currentVersionId: versionId,
      }

      saveVersions(newState)
      addToast(`Restored version "${version.name || 'Untitled'}"`, 'success')

      return version.workflow
    },
    [state, getVersion, saveVersions, addToast]
  )

  // Delete a version
  const deleteVersion = useCallback(
    (versionId: string) => {
      const newVersions = state.versions.filter((v) => v.id !== versionId)
      const newState: VersioningState = {
        ...state,
        versions: newVersions,
        currentVersionId:
          state.currentVersionId === versionId
            ? newVersions[0]?.id
            : state.currentVersionId,
      }

      saveVersions(newState)
      addToast('Version deleted', 'success')
    },
    [state, saveVersions, addToast]
  )

  // Compare two versions
  const compareVersions = useCallback(
    (versionId1: string, versionId2: string) => {
      const v1 = getVersion(versionId1)
      const v2 = getVersion(versionId2)

      if (!v1 || !v2) {
        addToast('One or both versions not found', 'error')
        return null
      }

      return {
        v1,
        v2,
        nodeCountDiff: (v2.nodeCount || 0) - (v1.nodeCount || 0),
        edgeCountDiff: (v2.edgeCount || 0) - (v1.edgeCount || 0),
      }
    },
    [getVersion, addToast]
  )

  // Add tag to version
  const tagVersion = useCallback(
    (versionId: string, tag: string) => {
      const newVersions = state.versions.map((v) =>
        v.id === versionId
          ? {
              ...v,
              tags: [...(v.tags || []), tag],
            }
          : v
      )

      const newState: VersioningState = {
        ...state,
        versions: newVersions,
      }

      saveVersions(newState)
      addToast(`Tagged with "${tag}"`, 'success')
    },
    [state, saveVersions, addToast]
  )

  return {
    versions: state.versions,
    currentVersionId: state.currentVersionId,
    createVersion,
    getVersion,
    restoreVersion,
    deleteVersion,
    compareVersions,
    tagVersion,
  }
}
