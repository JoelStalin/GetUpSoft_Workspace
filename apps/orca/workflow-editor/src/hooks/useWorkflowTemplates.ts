'use client'

import { useCallback } from 'react'
import {
  WORKFLOW_TEMPLATES,
  getTemplate,
  getTemplateMetadata,
  getTemplatesByCategory,
  getTemplateCategories,
  TemplateMetadata,
} from '../constants/workflowTemplates'
import { Workflow } from '../types/workflow'
import { useWorkflowOperations } from './useWorkflowOperations'
import { useToast } from '../contexts/ToastContext'

/**
 * Hook for managing workflow templates
 */
export function useWorkflowTemplates() {
  const { setWorkflow } = useWorkflowOperations()
  const { addToast } = useToast()

  /**
   * Load a template and create a new workflow from it
   */
  const loadTemplate = useCallback(
    (templateId: string): boolean => {
      const template = getTemplate(templateId)
      if (!template) {
        addToast(`Template "${templateId}" not found`, 'error')
        return false
      }

      try {
        // Create a new workflow based on the template
        const newWorkflow: Workflow = {
          ...template,
          id: `workflow-${Date.now()}`,
          name: `${template.name} (${new Date().toLocaleDateString()})`,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Reset nodes and edges positions slightly
          nodes: template.nodes?.map((node) => ({
            ...node,
            id: `${node.type}-${Date.now()}-${Math.random()}`,
          })),
          edges: template.edges?.map((edge, idx) => ({
            ...edge,
            id: `edge-${Date.now()}-${idx}`,
            source: `${WORKFLOW_TEMPLATES[templateId]?.nodes?.[0]?.type || 'node'}-${Date.now()}-*`,
            target: `${WORKFLOW_TEMPLATES[templateId]?.nodes?.[1]?.type || 'node'}-${Date.now()}-*`,
          })),
        }

        setWorkflow(newWorkflow)
        addToast(`Loaded template: ${template.name}`, 'success')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        addToast(`Failed to load template: ${message}`, 'error')
        return false
      }
    },
    [setWorkflow, addToast]
  )

  /**
   * Get all available templates
   */
  const getAllTemplates = useCallback(() => {
    return Object.entries(WORKFLOW_TEMPLATES).map(([id, template]) => ({
      id,
      template,
    }))
  }, [])

  /**
   * Get template metadata for UI display
   */
  const getMetadata = useCallback(() => {
    return getTemplateMetadata()
  }, [])

  /**
   * Get templates in a specific category
   */
  const getByCategory = useCallback((category: string) => {
    return getTemplatesByCategory(category)
  }, [])

  /**
   * Get all available categories
   */
  const getCategories = useCallback(() => {
    return getTemplateCategories()
  }, [])

  /**
   * Get a single template
   */
  const getById = useCallback((templateId: string) => {
    return getTemplate(templateId)
  }, [])

  /**
   * Get count of templates
   */
  const getCount = useCallback(() => {
    return Object.keys(WORKFLOW_TEMPLATES).length
  }, [])

  return {
    // Operations
    loadTemplate,

    // Queries
    getAllTemplates,
    getMetadata,
    getByCategory,
    getCategories,
    getById,
    getCount,
  }
}
