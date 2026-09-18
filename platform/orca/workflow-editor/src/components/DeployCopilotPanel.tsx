import React, { useState } from 'react'
import { Play, RotateCcw, Clock, GitBranch, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Deploy Copilot Panel
 * Project deployment management with history tracking
 */

interface DeploymentHistoryItem {
  commitHash: string
  timestamp: string
  status: 'success' | 'failed' | 'in-progress'
}

interface ProjectCard {
  id: string
  name: string
  status: 'deployed' | 'failed' | 'deploying'
  lastDeployedAt: string
  history: DeploymentHistoryItem[]
}

export function DeployCopilotPanel() {
  const [projects, setProjects] = useState<ProjectCard[]>([
    {
      id: 'project-1',
      name: 'ORCA Unified Panel',
      status: 'deployed',
      lastDeployedAt: '2 hours ago',
      history: [
        {
          commitHash: '4f2a8d1',
          timestamp: '2 hours ago',
          status: 'success',
        },
        {
          commitHash: '8c3f9b2',
          timestamp: '5 hours ago',
          status: 'success',
        },
        {
          commitHash: '1e4a5d7',
          timestamp: '1 day ago',
          status: 'success',
        },
      ],
    },
    {
      id: 'project-2',
      name: 'Odoo Integration',
      status: 'deployed',
      lastDeployedAt: '6 hours ago',
      history: [
        {
          commitHash: 'a9c2d1e',
          timestamp: '6 hours ago',
          status: 'success',
        },
        {
          commitHash: 'f3e8b5a',
          timestamp: '1 day ago',
          status: 'failed',
        },
      ],
    },
  ])

  const [deployingProjectId, setDeployingProjectId] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  const handleDeploy = async (projectId: string) => {
    setDeployingProjectId(projectId)
    try {
      // TODO: Call backend API to trigger deployment
      // const response = await fetch(`/api/v1/orca/deployments/${projectId}/deploy`, {
      //   method: 'POST',
      // })
      // const result = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Mock deployment
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                status: 'deployed',
                lastDeployedAt: 'just now',
                history: [
                  {
                    commitHash: 'abc1234',
                    timestamp: 'just now',
                    status: 'success',
                  },
                  ...p.history,
                ],
              }
            : p
        )
      )
    } catch (error) {
      console.error('Deploy failed:', error)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: 'failed' } : p
        )
      )
    } finally {
      setDeployingProjectId(null)
    }
  }

  const handleRollback = async (projectId: string) => {
    setDeployingProjectId(projectId)
    try {
      // TODO: Call backend API to rollback
      // const response = await fetch(`/api/v1/orca/deployments/${projectId}/rollback`, {
      //   method: 'POST',
      // })
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                status: 'deployed',
                lastDeployedAt: '1 minute ago',
              }
            : p
        )
      )
    } catch (error) {
      console.error('Rollback failed:', error)
    } finally {
      setDeployingProjectId(null)
    }
  }

  const getStatusColor = (status: ProjectCard['status']) => {
    switch (status) {
      case 'deployed':
        return '#4ade80' // green
      case 'deploying':
        return '#fbbf24' // amber
      case 'failed':
        return '#ef4444' // red
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status: ProjectCard['status']) => {
    switch (status) {
      case 'deployed':
        return 'Deployed'
      case 'deploying':
        return 'Deploying...'
      case 'failed':
        return 'Deployment Failed'
      default:
        return 'Unknown'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '30px',
        backgroundColor: 'rgba(20, 20, 20, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
          Deploy Copilot
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Manage project deployments and view deployment history
        </p>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
            }}
          >
            {/* Project Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div>
                <h4
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  {project.name}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Clock size={12} />
                  Deployed {project.lastDeployedAt}
                </div>
              </div>

              {/* Status Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(project.status),
                    boxShadow: `0 0 8px ${getStatusColor(project.status)}`,
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: getStatusColor(project.status),
                  }}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                onClick={() => handleDeploy(project.id)}
                disabled={deployingProjectId === project.id}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor:
                    deployingProjectId === project.id
                      ? 'rgba(74, 222, 128, 0.15)'
                      : 'rgba(74, 222, 128, 0.1)',
                  border:
                    deployingProjectId === project.id
                      ? '1px solid rgba(74, 222, 128, 0.3)'
                      : '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '6px',
                  color: '#4ade80',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: deployingProjectId === project.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Play size={12} />
                {deployingProjectId === project.id ? 'Deploying...' : 'Deploy'}
              </button>

              <button
                onClick={() => handleRollback(project.id)}
                disabled={deployingProjectId === project.id}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: deployingProjectId === project.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={12} />
                Rollback
              </button>
            </div>

            {/* Deployment History */}
            <div>
              <button
                onClick={() =>
                  setExpandedProject(
                    expandedProject === project.id ? null : project.id
                  )
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <GitBranch size={12} />
                Deployment History ({project.history.length})
                <span
                  style={{
                    marginLeft: 'auto',
                    transform:
                      expandedProject === project.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  ▼
                </span>
              </button>

              {/* History Items */}
              {expandedProject === project.id && (
                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {project.history.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: "'Space Mono', monospace",
                          color: 'rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {item.status === 'success' ? (
                          <CheckCircle size={12} style={{ color: '#4ade80' }} />
                        ) : (
                          <AlertCircle size={12} style={{ color: '#ef4444' }} />
                        )}
                        <span style={{ fontWeight: 600 }}>{item.commitHash}</span>
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px 16px',
          backgroundColor: 'rgba(100, 200, 255, 0.08)',
          border: '1px solid rgba(100, 200, 255, 0.2)',
          borderRadius: '8px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        💡 Deployments are monitored in real-time. Check logs for detailed deployment status.
      </div>
    </div>
  )
}

export default DeployCopilotPanel
