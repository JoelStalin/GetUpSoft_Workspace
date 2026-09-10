# D04: Reconciliacion de solo lectura — runs reales de CareerAI

**Fecha:** 2026-09-10
**Alcance acordado con el usuario:** SOLO LECTURA. El script
(`tools/workspace-cli/reconcile_careerai_runs.mjs`) nunca escribe en Postgres ni modifica
`data/careerai/runs.jsonl`. Genera un reporte que demuestra que la migracion SERIA posible
y sin perdida, sin ejecutarla. La migracion real (escribir en una base productiva) queda
fuera de esta pasada, como decision aparte.

## Resultado real (54 runs, 1005 steps)

| Metrica | Valor |
|---|---|
| `totalSourceLines` | 54 |
| `reconciledRuns` | 54 |
| `reconciledSteps` | 1005 |
| `parseErrors` | 0 |
| `unmappedRunStatuses` | [] |
| `unmappedStepStatuses` | [] |
| `losslessMapping` | **true** |
| `sourceUntouched` | true (confirmado tambien con `git status` — `data/careerai/runs.jsonl` no aparece modificado) |
| `targetWritten` | false |

## Por que hacia falta un mapeo de estados

CareerAI usa vocabulario de estado mas granular que el `CHECK` constraint real de
`automation.runs`/`automation.run_steps` (definido en `0002_automation_schema.sql`, D03).
Antes de escribir el script se enumeraron los valores REALES presentes en los 54 runs
(no se asumio el vocabulario, se extrajo de los datos):

- **Run-level status:** solo `running` aparece en los 54 runs reales.
- **Step-level status:** 9 valores distintos — `completed, running, streaming,
  blocked_approval_required, pending, blocked_needs_permission, queued,
  waiting_for_providers, draft_only`.

Cada uno de esos 9 valores se mapeo explicitamente al valor mas cercano permitido por el
`CHECK` real (`pending, running, succeeded, failed, skipped`):

| CareerAI (step) | automation.run_steps |
|---|---|
| `completed` | `succeeded` |
| `running` | `running` |
| `streaming` | `running` (en progreso, solo con salida en vivo) |
| `pending`, `queued` | `pending` |
| `blocked_approval_required`, `blocked_needs_permission`, `waiting_for_providers`, `draft_only` | `pending` (bloqueado != fallido, sigue esperando accion) |
| `failed` | `failed` |
| `skipped` | `skipped` |

El resultado real (`unmappedStepStatuses: []`) confirma que los 9 valores encontrados
quedaron cubiertos — no se descubrio ningun valor fuera de la tabla al correr contra los
datos reales.

## Que prueba esto y que no

- **Prueba:** con el mapeo de estados definido, los 54 runs y 1005 steps reales de
  CareerAI se pueden representar sin perdida (`losslessMapping: true`) en la forma que
  exige el schema `automation` (D03) — incluye muestras reales (`sampleMappedRuns`) con
  hash sha256 del registro origen y su representacion destino, para trazabilidad.
- **No prueba:** que la migracion real (INSERT en una base productiva) vaya a
  ejecutarse sin incidentes — eso depende de decisiones aun pendientes (transaccion unica
  vs por lotes, punto de corte con el sistema en vivo, rollback plan) que son la
  siguiente decision, no parte de este reporte.

## Verificacion de que no se toco el origen

`git status --short data/careerai/runs.jsonl` no devuelve ninguna linea — el archivo
sigue exactamente como estaba antes de correr el script, confirmando `sourceUntouched`
con evidencia externa al propio reporte (no solo con el campo que el script mismo
escribe).
