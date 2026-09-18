# D01: Verificacion real del esquema IAM

**Fecha:** 2026-09-09
**Metodo:** Postgres 17 desechable (`postgres:17-alpine`, contenedor temporal `--rm` en el
motor Docker de WSL, puerto 15432 solo local, eliminado al terminar) — no se toco ninguna
base de datos real. `platform/orca/database/migrations/0001_iam_schema.sql` se aplico tal
cual contra una base vacia y `0001_iam_schema.test.sql` corrio los 8 casos siguientes:

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | Binding proyecto-membership, misma organizacion | INSERT ok | ✅ INSERT 0 1 |
| 2 | Binding declarando `organization_id` de otra org que el project/membership real | ERROR FK | ✅ `violates foreign key constraint project_role_bindings_organization_id_project_id_fkey` |
| 3 | Slug de proyecto duplicado en la MISMA organizacion | ERROR unicidad | ✅ `duplicate key value violates unique constraint` |
| 4 | Mismo slug de proyecto en OTRA organizacion | INSERT ok (unicidad es por-org, no global) | ✅ INSERT 0 1 |
| 5 | `organizations.status` con valor no permitido | ERROR CHECK | ✅ `violates check constraint` |
| 6 | `principals` tipo `device_agent` sin OIDC | INSERT ok (excepcion explicita del CHECK) | ✅ INSERT 0 1 |
| 7 | `principals` tipo `human` sin OIDC | ERROR CHECK | ✅ `violates check constraint principals_check` |
| 8 | Roles tecnicos (`orca_*`) con `rolsuper` o `rolbypassrls` | 0 filas (ninguno privilegiado) | ✅ `(0 rows)` |

Los 8 casos coinciden exactamente con lo esperado. El punto mas importante (test 2) confirma
que la FK compuesta `(organization_id, project_id) -> projects(organization_id, id)`
efectivamente impide que un binding "cruce" organizaciones aunque alguien intente forzar
los IDs directamente — es la base sobre la que D02 construira las politicas RLS.

## Pendiente (fuera de alcance de D01)

- Politicas RLS (`FORCE ROW LEVEL SECURITY`, contexto de sesion por transaccion) son D02,
  no D01 — D01 solo entrega el esquema y sus restricciones estructurales.
- `GRANT` explicitos a los roles `orca_*` (hoy creados sin ningun permiso) tambien son D02.
- El contenedor de prueba se elimino al terminar (`--rm`); no queda ninguna instancia
  Postgres corriendo como resultado de esta tarea.
