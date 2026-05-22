import { useCallback } from "react"
import { useToast } from "../contexts/ToastContext"

export interface AIEditSuggestion {
  type: "label" | "description" | "parameters" | "connections"
  suggestion: string
  confidence: number
  action: () => void
}

export function useAINodeEditor() {
  const { addToast } = useToast()

  const generateNodeSuggestions = useCallback(
    async (nodeLabel: string, nodeType: string): Promise<AIEditSuggestion[]> => {
      try {
        // Simulate AI suggestions based on node type and label
        const suggestions: AIEditSuggestion[] = []

        // Suggest better label based on common patterns
        const betterLabels: Record<string, string[]> = {
          http: ["Fetch Data", "Call API", "Download", "Request Data"],
          webhook: ["Trigger Handler", "Incoming Event", "Webhook Listener"],
          database: ["Query Database", "Save Data", "Retrieve Records"],
          filter: ["Filter Results", "Validate Data", "Check Conditions"],
          transform: ["Transform Data", "Format Output", "Convert Values"],
        }

        if (nodeType && betterLabels[nodeType]) {
          const labels = betterLabels[nodeType]
          labels.forEach((label, index) => {
            suggestions.push({
              type: "label",
              suggestion: label,
              confidence: 0.95 - index * 0.05,
              action: () => {
                addToast(`Suggested label: ${label}`, "info")
              },
            })
          })
        }

        // Suggest parameters based on type
        const paramSuggestions: Record<string, string[]> = {
          http: ["URL", "Method", "Headers", "Body", "Timeout"],
          database: ["Query", "Table", "Limit", "OrderBy"],
          filter: ["Condition", "Field", "Operator", "Value"],
        }

        if (nodeType && paramSuggestions[nodeType]) {
          const params = paramSuggestions[nodeType]
          suggestions.push({
            type: "parameters",
            suggestion: `Consider adding parameters: ${params.join(", ")}`,
            confidence: 0.9,
            action: () => {
              addToast(`Suggested parameters: ${params.join(", ")}`, "info")
            },
          })
        }

        return suggestions
      } catch (error) {
        console.error("Error generating AI suggestions:", error)
        addToast("Failed to generate AI suggestions", "error")
        return []
      }
    },
    [addToast]
  )

  const improveNodeDescription = useCallback(
    async (currentDescription: string, nodeLabel: string): Promise<string> => {
      try {
        // Simulate AI improvement of description
        if (!currentDescription) {
          return `This node performs the operation: ${nodeLabel}`
        }

        // In production, this would call an AI API
        return currentDescription
      } catch (error) {
        console.error("Error improving description:", error)
        addToast("Failed to improve description", "error")
        return currentDescription
      }
    },
    [addToast]
  )

  const suggestConnections = useCallback(
    async (nodeId: string, nodeType: string): Promise<string[]> => {
      try {
        // Suggest node types that typically connect
        const connectionMap: Record<string, string[]> = {
          http: ["filter", "transform", "database"],
          database: ["transform", "filter", "output"],
          filter: ["transform", "database"],
          transform: ["output", "filter"],
        }

        return connectionMap[nodeType] || []
      } catch (error) {
        console.error("Error suggesting connections:", error)
        return []
      }
    },
    []
  )

  return {
    generateNodeSuggestions,
    improveNodeDescription,
    suggestConnections,
  }
}

