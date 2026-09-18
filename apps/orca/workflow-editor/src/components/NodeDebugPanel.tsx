import { useEffect, useState } from 'react'

/**
 * Panel de debug estilo n8n para un nodo del canvas: input/output real de la ultima
 * ejecucion (via apps/orca/src/careerai/execution-debug.mjs, expuesto en
 * scripts/start_orca_local.mjs como GET/DELETE /api/careerai/runs/:id/executions y
 * POST/DELETE /api/careerai/runs/:id/pin).
 *
 * Componente separado a proposito, en vez de crecer FloatingPropertiesPanel.tsx: mantiene el
 * riesgo de esta pieza nueva aislado del resto del panel de propiedades ya existente.
 */

const RUN_ID_STORAGE_KEY = 'orca-debug-run-id'

type ExecutionEntry = {
  run_index: number
  status: string
  input: unknown
  output: unknown
  error: string | null
  started_at: string | null
  finished_at: string | null
  execution_time_ms: number | null
}

type NodeExecutionResponse = {
  ok: boolean
  history?: ExecutionEntry[]
  last?: ExecutionEntry | null
  pinned?: { data: unknown; pinned_at: string } | null
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--stitch-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  }
}

function jsonBoxStyle(): React.CSSProperties {
  return {
    maxHeight: '220px',
    overflow: 'auto',
    padding: '8px 10px',
    backgroundColor: 'var(--stitch-elevated)',
    border: '1px solid var(--stitch-border)',
    borderRadius: '6px',
    color: 'var(--stitch-text)',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
}

export default function NodeDebugPanel({ nodeId }: { nodeId: string }) {
  const [runId, setRunId] = useState<string>(() => localStorage.getItem(RUN_ID_STORAGE_KEY) || '')
  const [data, setData] = useState<NodeExecutionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(RUN_ID_STORAGE_KEY, runId)
  }, [runId])

  // Se limpia el resultado anterior al cambiar de nodo o de run_id, para no mostrar por error
  // la ejecucion de un nodo distinto mientras carga la nueva.
  useEffect(() => {
    setData(null)
    setError(null)
  }, [nodeId, runId])

  async function fetchExecution() {
    if (!runId) { setError('Escribe un run_id primero'); return }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/careerai/runs/${encodeURIComponent(runId)}/executions?node_id=${encodeURIComponent(nodeId)}`)
      const json = await response.json()
      if (!response.ok || json.ok === false) {
        setError(json.reason || json.error || `HTTP ${response.status}`)
        setData(null)
        return
      }
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function pinCurrentOutput() {
    if (!runId || !data?.last) return
    setLoading(true)
    try {
      await fetch(`/api/careerai/runs/${encodeURIComponent(runId)}/pin`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, data: data.last.output }),
      })
      await fetchExecution()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function unpin() {
    if (!runId) return
    setLoading(true)
    try {
      await fetch(`/api/careerai/runs/${encodeURIComponent(runId)}/pin?node_id=${encodeURIComponent(nodeId)}`, { method: 'DELETE' })
      await fetchExecution()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle()}>Debug (run_id)</label>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <input
          type="text"
          value={runId}
          onChange={(event) => setRunId(event.target.value)}
          placeholder="p.ej. mi-prueba-1"
          style={{
            flex: 1,
            padding: '7px 10px',
            backgroundColor: 'var(--stitch-elevated)',
            border: '1px solid var(--stitch-border)',
            borderRadius: '6px',
            color: 'var(--stitch-text)',
            fontSize: '11px',
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
        <button
          onClick={fetchExecution}
          disabled={loading}
          style={{
            padding: '7px 12px',
            backgroundColor: 'var(--stitch-accent)',
            border: 'none',
            borderRadius: '6px',
            color: '#0a0a0a',
            fontSize: '11px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Ver'}
        </button>
      </div>

      {error && (
        <div style={{ ...jsonBoxStyle(), color: 'rgb(237, 49, 93)', marginBottom: '8px' }}>{error}</div>
      )}

      {data?.pinned && (
        <div style={{ marginBottom: '8px', fontSize: '11px', color: 'var(--stitch-accent)' }}>
          📌 Fijado ({new Date(data.pinned.pinned_at).toLocaleTimeString()}) — este nodo usa este dato aunque se vuelva a ejecutar.{' '}
          <button onClick={unpin} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--stitch-accent)', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px', padding: 0 }}>
            quitar pin
          </button>
        </div>
      )}

      {data?.last && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle()}>Ultima ejecucion — estado</label>
            <div style={{ fontSize: '11px', color: data.last.status === 'error' ? 'rgb(237, 49, 93)' : 'var(--stitch-text)' }}>
              {data.last.status}
              {data.last.execution_time_ms !== null ? ` · ${data.last.execution_time_ms}ms` : ''}
              {data.last.error ? ` · ${data.last.error}` : ''}
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle()}>Input</label>
            <div style={jsonBoxStyle()}>{JSON.stringify(data.last.input, null, 2)}</div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle()}>Output</label>
            <div style={jsonBoxStyle()}>{JSON.stringify(data.last.output, null, 2)}</div>
            {!data.pinned && (
              <button
                onClick={pinCurrentOutput}
                disabled={loading}
                style={{
                  marginTop: '6px', padding: '5px 10px', backgroundColor: 'transparent',
                  border: '1px solid var(--stitch-border)', borderRadius: '6px',
                  color: 'var(--stitch-text)', fontSize: '11px', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                📌 Fijar este output
              </button>
            )}
          </div>
          {data.history && data.history.length > 1 && (
            <div style={{ fontSize: '10px', color: 'var(--stitch-muted)' }}>
              {data.history.length} ejecuciones de este nodo en este run.
            </div>
          )}
        </>
      )}

      {data && !data.last && !error && (
        <div style={{ fontSize: '11px', color: 'var(--stitch-muted)' }}>
          Sin ejecuciones registradas para este nodo en el run &quot;{runId}&quot;.
        </div>
      )}
    </div>
  )
}
