import { useWorkflowAnalytics, formatDuration } from "../hooks/useWorkflowAnalytics"
import { Workflow } from "../types/workflow"
import { TrendingUp, BarChart3, Clock, CheckCircle } from "lucide-react"

interface WorkflowAnalyticsDashboardProps {
  workflow: Workflow | null
}

export default function WorkflowAnalyticsDashboard({ workflow }: WorkflowAnalyticsDashboardProps) {
  const stats = useWorkflowAnalytics(workflow)

  if (!stats) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "var(--stitch-muted)" }}>
        <BarChart3 size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p>No workflow selected</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", overflow: "auto" }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--stitch-text)", marginBottom: "8px" }}>
          Workflow Analytics
        </h2>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--stitch-muted)" }}>
          Last executed: {stats.lastExecuted ? new Date(stats.lastExecuted).toLocaleString() : "Never"}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <StatCard icon={<CheckCircle size={16} color="rgb(29, 185, 84)" />} label="Success Rate" value={`${stats.successRate}%`} />
        <StatCard icon={<TrendingUp size={16} color="rgb(255, 193, 7)" />} label="Total Executions" value={stats.totalExecutions.toString()} />
        <StatCard icon={<Clock size={16} color="rgb(74, 158, 255)" />} label="Avg Duration" value={formatDuration(stats.avgDuration)} />
        <StatCard icon={<BarChart3 size={16} color="rgb(188, 143, 206)" />} label="Failure Rate" value={`${stats.failureRate}%`} />
      </div>

      {/* Node Statistics */}
      {stats.nodeStats.length > 0 && (
        <div style={{ borderRadius: "8px", border: "1px solid var(--stitch-border)", overflow: "hidden" }}>
          <div style={{ padding: "12px", backgroundColor: "rgba(var(--color-base-300), 0.5)", borderBottom: "1px solid var(--stitch-border)" }}>
            <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--stitch-text)" }}>Node Performance</h3>
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {stats.nodeStats.map((node) => (
              <div key={node.nodeId} style={{ padding: "8px 12px", borderBottom: "1px solid var(--stitch-border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--stitch-text)" }}>{node.nodeLabel}</div>
                  <div style={{ color: "var(--stitch-muted)", fontSize: "10px" }}>
                    {node.executions} executions • {formatDuration(node.avgDuration)}
                  </div>
                </div>
                <div style={{ textAlign: "right", color: "var(--stitch-muted)" }}>
                  <div style={{ color: "rgb(29, 185, 84)" }}>{node.successes} ✓</div>
                  <div style={{ color: "rgb(237, 49, 93)" }}>{node.failures} ✗</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Summary */}
      <div style={{ borderRadius: "8px", border: "1px solid var(--stitch-border)", padding: "12px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: 600, color: "var(--stitch-text)" }}>Workflow Overview</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
          <div style={{ padding: "6px", backgroundColor: "rgba(var(--color-base-300), 0.3)", borderRadius: "4px" }}>
            <div style={{ color: "var(--stitch-muted)" }}>Nodes</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--stitch-text)" }}>{stats.totalNodes}</div>
          </div>
          <div style={{ padding: "6px", backgroundColor: "rgba(var(--color-base-300), 0.3)", borderRadius: "4px" }}>
            <div style={{ color: "var(--stitch-muted)" }}>Connections</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--stitch-text)" }}>{stats.totalEdges}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: "12px", backgroundColor: "rgba(var(--color-base-300), 0.5)", borderRadius: "8px", border: "1px solid var(--stitch-border)", display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10px", color: "var(--stitch-muted)" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--stitch-text)" }}>{value}</div>
      </div>
    </div>
  )
}

