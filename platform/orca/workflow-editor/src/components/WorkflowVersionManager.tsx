import { useState } from "react"
import { useWorkflowVersioning } from "../hooks/useWorkflowVersioning"
import { useToast } from "../contexts/ToastContext"
import { Clock, Trash2, Check, ChevronDown } from "lucide-react"

interface WorkflowVersionManagerProps {
  workflowId: string | null
  currentWorkflow?: any
  onRestoreVersion?: (workflow: any) => void
}

export default function WorkflowVersionManager({
  workflowId,
  currentWorkflow,
  onRestoreVersion,
}: WorkflowVersionManagerProps) {
  const { versions, currentVersionId, createVersion, restoreVersion, deleteVersion } =
    useWorkflowVersioning(workflowId)
  const { addToast } = useToast()
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null)

  const handleCreateVersion = () => {
    if (!currentWorkflow) return
    const name = prompt("Version name:")
    createVersion(currentWorkflow, name || undefined)
  }

  const handleRestore = (versionId: string) => {
    const restored = restoreVersion(versionId)
    if (restored && onRestoreVersion) {
      onRestoreVersion(restored)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid var(--stitch-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--stitch-text)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={16} /> Version History
          </h3>
          <button onClick={handleCreateVersion} style={{ padding: "4px 8px", backgroundColor: "rgb(74, 158, 255)", border: "none", borderRadius: "4px", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            Save
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {versions.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--stitch-muted)", fontSize: "12px" }}>
            <p>No versions saved</p>
          </div>
        ) : (
          versions.map((v) => (
            <div key={v.id} style={{ padding: "8px", marginBottom: "4px", backgroundColor: "rgba(var(--color-base-300), 0.3)", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>
                {v.name || "Untitled"}
                {currentVersionId === v.id && <span style={{ fontSize: "10px", padding: "2px 6px", backgroundColor: "rgb(74, 158, 255)", color: "white", borderRadius: "3px", marginLeft: "8px" }}>Current</span>}
              </div>
              <div style={{ fontSize: "10px", color: "var(--stitch-muted)", marginTop: "2px" }}>
                {new Date(v.timestamp).toLocaleString()}
              </div>
              {expandedVersionId === v.id && (
                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--stitch-border)", display: "flex", gap: "4px" }}>
                  {currentVersionId !== v.id && (
                    <button onClick={() => handleRestore(v.id)} style={{ flex: 1, padding: "4px 6px", backgroundColor: "rgba(29, 185, 84, 0.2)", border: "1px solid rgb(29, 185, 84)", borderRadius: "4px", color: "rgb(29, 185, 84)", fontSize: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                      <Check size={10} /> Restore
                    </button>
                  )}
                  <button onClick={() => deleteVersion(v.id)} style={{ flex: 1, padding: "4px 6px", backgroundColor: "rgba(237, 49, 93, 0.2)", border: "1px solid rgb(237, 49, 93)", borderRadius: "4px", color: "rgb(237, 49, 93)", fontSize: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              )}
              <div style={{ cursor: "pointer", marginTop: "4px" }} onClick={() => setExpandedVersionId(expandedVersionId === v.id ? null : v.id)}>
                <ChevronDown size={12} style={{ transform: expandedVersionId === v.id ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
