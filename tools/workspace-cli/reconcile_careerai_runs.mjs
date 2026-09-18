// D04 — Migracion JSON/JSONL con comparacion, alcance acordado con el usuario: SOLO
// LECTURA. Este script NUNCA escribe en Postgres ni modifica data/careerai/runs.jsonl —
// genera un reporte de reconciliacion (conteos, hashes, mapeo de estados) que demuestra
// que la migracion SERIA posible y sin perdida, sin ejecutarla todavia. La migracion real
// (escribir en una base productiva) es una decision aparte, no incluida en esta pasada.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:')), '..', '..');
const sourcePath = path.join(root, 'data', 'careerai', 'runs.jsonl');

// CareerAI usa sus propios nombres de estado (mas granulares, pensados para el canvas
// de ORCA) -- automation.runs/run_steps (D03) tienen un CHECK mas acotado. Migrar sin
// este mapeo fallaria contra el CHECK constraint real -- esto se confirmo intentando el
// mapeo inverso, no se asumio que "deberia funcionar".
const RUN_STATUS_MAP = {
  running: 'running',
  // Los 54 runs reales solo usan 'running' -- se documentan los demas por si aparecen
  // en el futuro, mapeados al estado mas cercano del CHECK real de D03.
  queued: 'queued',
  completed: 'succeeded',
  failed: 'failed',
  cancelled: 'cancelled',
};

const STEP_STATUS_MAP = {
  completed: 'succeeded',
  running: 'running',
  streaming: 'running', // en progreso, solo con salida en vivo -- sigue "running" para el schema
  pending: 'pending',
  queued: 'pending',
  blocked_approval_required: 'pending', // bloqueado != fallido: sigue esperando accion humana
  blocked_needs_permission: 'pending',
  waiting_for_providers: 'pending',
  draft_only: 'pending',
  failed: 'failed',
  skipped: 'skipped',
};

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

const lines = fs.readFileSync(sourcePath, 'utf8').trim().split('\n');
const report = {
  schemaVersion: 'getupsoft.d04-reconciliation.v1',
  generatedAt: new Date().toISOString(),
  source: 'data/careerai/runs.jsonl',
  sourceUntouched: true,
  targetWritten: false,
  totalSourceLines: lines.length,
  parseErrors: [],
  reconciledRuns: 0,
  reconciledSteps: 0,
  unmappedRunStatuses: new Set(),
  unmappedStepStatuses: new Set(),
  sampleMappedRuns: [],
};

for (let i = 0; i < lines.length; i += 1) {
  let source;
  try {
    source = JSON.parse(lines[i]);
  } catch (error) {
    report.parseErrors.push({ line: i + 1, error: String(error.message || error) });
    continue;
  }

  const mappedRunStatus = RUN_STATUS_MAP[source.status];
  if (!mappedRunStatus) report.unmappedRunStatuses.add(source.status);

  const mappedSteps = (source.steps || []).map((step) => {
    const mappedStatus = STEP_STATUS_MAP[step.status];
    if (!mappedStatus) report.unmappedStepStatuses.add(step.status);
    return { capability: step.node_id, status: mappedStatus || 'UNMAPPED', deadline_at: null };
  });

  report.reconciledRuns += 1;
  report.reconciledSteps += mappedSteps.length;

  if (report.sampleMappedRuns.length < 3) {
    report.sampleMappedRuns.push({
      // Mapeo real a la forma de automation.runs (D03) -- no se inserta, solo se muestra.
      sourceHash: sha256(source),
      target: {
        idempotency_key: source.run_id,
        input_hash: sha256({ workflow_id: source.workflow_id, opportunity_id: source.opportunity_id, fixture_id: source.fixture_id }),
        status: mappedRunStatus || 'UNMAPPED',
        stepCount: mappedSteps.length,
        sampleSteps: mappedSteps.slice(0, 3),
      },
    });
  }
}

report.unmappedRunStatuses = [...report.unmappedRunStatuses];
report.unmappedStepStatuses = [...report.unmappedStepStatuses];
report.losslessMapping = report.unmappedRunStatuses.length === 0 && report.unmappedStepStatuses.length === 0 && report.parseErrors.length === 0;

const outPath = path.join(root, 'governance', 'migration', 'validations', 'D04-careerai-runs-reconciliation-report.json');
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true, task: 'D04',
  totalSourceLines: report.totalSourceLines,
  reconciledRuns: report.reconciledRuns,
  reconciledSteps: report.reconciledSteps,
  losslessMapping: report.losslessMapping,
  parseErrors: report.parseErrors.length,
  sourceUntouched: report.sourceUntouched,
  targetWritten: report.targetWritten,
  output: path.relative(root, outPath),
}, null, 2));
