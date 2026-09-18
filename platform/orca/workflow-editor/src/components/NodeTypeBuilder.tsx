import { useState } from "react"
import { Plus, Trash2, ChevronDown, Save } from "lucide-react"
import { useToast } from "../contexts/ToastContext"

export interface CustomNodeType {
  id: string
  name: string
  description?: string
  inputs: NodeInput[]
  outputs: NodeOutput[]
  color?: string
  icon?: string
  createdAt: string
}

export interface NodeInput {
  id: string
  name: string
  type: string
  required?: boolean
}

export interface NodeOutput {
  id: string
  name: string
  type: string
}

const CUSTOM_TYPES_KEY = "orca_custom_node_types"

export function useCustomNodeTypes() {
  const { addToast } = useToast()
  const [types, setTypes] = useState<CustomNodeType[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TYPES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const saveTypes = (newTypes: CustomNodeType[]) => {
    try {
      localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(newTypes))
      setTypes(newTypes)
    } catch (e) {
      addToast("Failed to save custom node type", "error")
    }
  }

  const createNodeType = (nodeType: CustomNodeType) => {
    const newTypes = [...types, nodeType]
    saveTypes(newTypes)
    addToast(`Custom node type "${nodeType.name}" created`, "success")
    return nodeType
  }

  const deleteNodeType = (id: string) => {
    const newTypes = types.filter((t) => t.id !== id)
    saveTypes(newTypes)
    addToast("Custom node type deleted", "success")
  }

  const updateNodeType = (id: string, updated: Partial<CustomNodeType>) => {
    const newTypes = types.map((t) => (t.id === id ? { ...t, ...updated } : t))
    saveTypes(newTypes)
    addToast("Custom node type updated", "success")
  }

  return { types, createNodeType, deleteNodeType, updateNodeType }
}

interface NodeTypeBuilderProps {
  onNodeTypeCreated?: (nodeType: CustomNodeType) => void
}

export default function NodeTypeBuilder({ onNodeTypeCreated }: NodeTypeBuilderProps) {
  const { types, createNodeType } = useCustomNodeTypes()
  const { addToast } = useToast()

  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#7c4dff",
  })
  const [inputs, setInputs] = useState<NodeInput[]>([])
  const [outputs, setOutputs] = useState<NodeOutput[]>([])

  const handleCreateType = () => {
    if (!formData.name.trim()) {
      addToast("Node type name is required", "warning")
      return
    }

    const nodeType: CustomNodeType = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      inputs,
      outputs,
      color: formData.color,
      createdAt: new Date().toISOString(),
    }

    createNodeType(nodeType)
    onNodeTypeCreated?.(nodeType)

    setFormData({ name: "", description: "", color: "#7c4dff" })
    setInputs([])
    setOutputs([])
    setIsCreating(false)
  }

  const addInput = () => {
    setInputs([
      ...inputs,
      {
        id: `input-${Date.now()}`,
        name: "Input",
        type: "any",
        required: false,
      },
    ])
  }

  const addOutput = () => {
    setOutputs([
      ...outputs,
      {
        id: `output-${Date.now()}`,
        name: "Output",
        type: "any",
      },
    ])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--stitch-border)" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "var(--stitch-text)" }}>
          Node Type Builder
        </h3>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--stitch-muted)" }}>
          Create custom node types for your workflows
        </p>
      </div>

      {/* Existing Types */}
      {types.length > 0 && (
        <div style={{ padding: "0 16px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: 600, color: "var(--stitch-muted)" }}>
            Saved Types ({types.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {types.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "rgba(var(--color-base-300), 0.5)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--stitch-text)" }}>{t.name}</div>
                  <div style={{ fontSize: "10px", color: "var(--stitch-muted)" }}>
                    {t.inputs.length} inputs, {t.outputs.length} outputs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      {isCreating ? (
        <div style={{ padding: "16px", backgroundColor: "rgba(var(--color-base-300), 0.2)", borderRadius: "8px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px", color: "var(--stitch-muted)" }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid var(--stitch-border)",
                borderRadius: "4px",
                backgroundColor: "rgb(var(--color-base-100))",
                color: "var(--stitch-text)",
                fontSize: "12px",
              }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "4px", color: "var(--stitch-muted)" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid var(--stitch-border)",
                borderRadius: "4px",
                backgroundColor: "rgb(var(--color-base-100))",
                color: "var(--stitch-text)",
                fontSize: "12px",
                minHeight: "60px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Inputs Section */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--stitch-muted)" }}>Inputs</label>
              <button
                onClick={addInput}
                style={{
                  padding: "2px 6px",
                  backgroundColor: "rgba(74, 158, 255, 0.2)",
                  border: "1px solid rgb(74, 158, 255)",
                  borderRadius: "3px",
                  color: "rgb(74, 158, 255)",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                <Plus size={10} style={{ display: "inline", marginRight: "2px" }} /> Add
              </button>
            </div>
            {inputs.map((input) => (
              <div key={input.id} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <input
                  type="text"
                  placeholder="Input name"
                  value={input.name}
                  onChange={(e) => {
                    setInputs(inputs.map((i) => (i.id === input.id ? { ...i, name: e.target.value } : i)))
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 6px",
                    fontSize: "10px",
                    border: "1px solid var(--stitch-border)",
                    borderRadius: "3px",
                    backgroundColor: "rgb(var(--color-base-100))",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Outputs Section */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--stitch-muted)" }}>Outputs</label>
              <button
                onClick={addOutput}
                style={{
                  padding: "2px 6px",
                  backgroundColor: "rgba(74, 158, 255, 0.2)",
                  border: "1px solid rgb(74, 158, 255)",
                  borderRadius: "3px",
                  color: "rgb(74, 158, 255)",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                <Plus size={10} style={{ display: "inline", marginRight: "2px" }} /> Add
              </button>
            </div>
            {outputs.map((output) => (
              <div key={output.id} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <input
                  type="text"
                  placeholder="Output name"
                  value={output.name}
                  onChange={(e) => {
                    setOutputs(outputs.map((o) => (o.id === output.id ? { ...o, name: e.target.value } : o)))
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 6px",
                    fontSize: "10px",
                    border: "1px solid var(--stitch-border)",
                    borderRadius: "3px",
                    backgroundColor: "rgb(var(--color-base-100))",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handleCreateType}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "rgb(74, 158, 255)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Save size={12} style={{ display: "inline", marginRight: "4px" }} /> Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "transparent",
                border: "1px solid var(--stitch-border)",
                borderRadius: "4px",
                color: "var(--stitch-text)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "rgba(74, 158, 255, 0.15)",
              border: "1px solid rgb(74, 158, 255)",
              borderRadius: "6px",
              color: "rgb(74, 158, 255)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={14} style={{ display: "inline", marginRight: "6px" }} /> New Node Type
          </button>
        </div>
      )}
    </div>
  )
}
