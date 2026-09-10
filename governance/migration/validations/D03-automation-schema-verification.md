# D03: Verificacion real del esquema workflows/runs/eventos

**Fecha:** 2026-09-10
**Metodo:** Postgres 17 desechable (mismo patron que D01, contenedor `--rm` en WSL,
eliminado al terminar) aplicando `0001_iam_schema.sql` + `0002_automation_schema.sql`
contra una base vacia.

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | `runs.status` con valor no permitido | ERROR CHECK | ✅ `violates check constraint runs_status_check` |
| 2 | `idempotency_key` duplicada en la misma org+project | ERROR unicidad | ✅ `duplicate key value violates unique constraint` |
| 3 | `run` declarando una organizacion distinta a la de su `workflow_version` real | ERROR FK compuesta | ✅ `violates foreign key constraint runs_organization_id_project_id_workflow_version_id_fkey` |
| 4 | **Bloqueo optimista bajo concurrencia REAL** (dos procesos `psql` distintos, transacciones separadas, ambas leen `lock_version=0` antes de que ninguna confirme) | Solo una transaccion afecta la fila; la otra afecta 0 filas, sin error silencioso | ✅ TXN-B (sin sleep) leyo `lock_version=0`, ejecuto `UPDATE ... WHERE lock_version=0` y commiteo primero -> `UPDATE 1`. TXN-A (con `pg_sleep(2)` antes del UPDATE) intento el mismo `UPDATE ... WHERE lock_version=0` sobre la fila ya modificada -> `UPDATE 0`, exactamente el comportamiento esperado de optimistic locking: ninguna sobreescribe silenciosamente a la otra. |

El caso 4 es el mas importante de D03: se probo con **dos procesos `psql` reales corriendo
en paralelo** (no una simulacion secuencial ni un mock) contra el mismo contenedor
Postgres, replicando el escenario real de "actualizaciones concurrentes sin perdida" que
pedia el AC de esta tarea en el plan original.

## Decisiones de diseno documentadas en el propio SQL

- `workflow_versions` NO tiene un trigger que fuerce inmutabilidad tras publicar — se deja
  como convencion de la capa de aplicacion (que rol tiene permiso de `UPDATE`), ya que
  forzarlo con un trigger acoplaria el esquema a una decision de D02 (permisos por rol)
  que todavia no se ha tomado.
- `run_events` es append-only por el mismo criterio: ningun rol de aplicacion creado en
  D01 tiene `UPDATE`/`DELETE` sobre tablas fuera de lo que necesita (D02 formalizara los
  GRANTs explicitos).

## Pendiente (fuera de alcance de D03)

- GRANTs explicitos de los roles `orca_*` sobre este esquema nuevo (`automation.*`) —
  corresponde a D02.
- Politicas RLS sobre estas tablas — igual, D02.
