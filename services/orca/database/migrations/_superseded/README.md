# Migraciones superadas (archivadas, no eliminadas)

Estos 2 archivos fueron escritos por una sesion de Claude ejecutandose en paralelo,
que reimplemento D02 (RLS) y D03 (schema `automation`) sin visibilidad de que esta
sesion ya los habia completado, verificado con Postgres real, y commiteado como
`0002_automation_schema.sql` y `0003_row_level_security.sql`. Se detecto la colision
de numeracion (ambos usaban `0002`/`0003`), se investigo el contenido, y se confirmo
que no son variantes validas sino versiones incompletas -- por eso se archivan aqui en
vez de aplicarse, por instruccion explicita del usuario ("prioriza tus cambios, los
demas deja solo en el historico... por si se requiere algun cambio o funcion").

**No se usan en la cadena de migraciones activa** (`platform/orca/database/migrations/*.sql`,
sin este subdirectorio). Se conservan por si en el futuro se necesita revisar una idea o
funcion especifica de ellos.

## `0009_oidc_rls_policies.sql` (originalmente `0002_oidc_rls_policies.sql`)

Reimplementa RLS sobre 5 tablas `iam.*` -- subconjunto de lo que ya cubre
`0003_row_level_security.sql` (13 tablas: `iam.*` + `automation.*`).

**Bug real, confirmado leyendo el SQL:** `iam.organizations` y `iam.org_role_bindings`
reciben `FORCE ROW LEVEL SECURITY` pero **nunca se les crea ninguna `CREATE POLICY`** --
si se aplicara, ninguna fila de esas 2 tablas seria visible para nadie, ni siquiera para
usuarios legitimos con `app.current_organization_id` correctamente seteado. Verificado
por lectura directa del archivo, no por ejecucion (no hacia falta correrlo para
confirmar la ausencia de la politica).

## `0010_automation_runs_schema.sql` (originalmente `0003_automation_runs_schema.sql`)

Reimplementa `automation.workflows`/`runs`/`run_steps` (mas una tabla `automation.events`,
version simplificada de mi `automation.run_events`) -- pero con un schema de columnas
INCOMPATIBLE con trabajo posterior ya verificado:

- `automation.runs` en este archivo NO tiene columnas `idempotency_key` / `input_hash`.
  La funcion `automation.accept_run()` (`0008_idempotent_run_acceptance.sql`, tarea E02,
  verificada con Postgres real incluyendo doble entrega) depende exactamente de esas 2
  columnas -- si este archivo reemplazara `0002_automation_schema.sql`, `accept_run()`
  dejaria de funcionar.
- Usa `ENABLE ROW LEVEL SECURITY` sin `FORCE` y sin ninguna politica -- mismo patron de
  "candado sin llave" que el archivo anterior: el dueño de la tabla seguiria viendo todo
  sin restriccion (`ENABLE` sin `FORCE` no aplica a roles con privilegio de dueño), y
  para cualquier otro rol, sin politica, tampoco veria nada.
- Vocabulario de estados distinto (`completed` en vez de `succeeded`) -- rompe el mapeo
  ya construido y verificado en D04
  (`tools/workspace-cli/reconcile_careerai_runs.mjs`, `RUN_STATUS_MAP`).

## Verificacion de que la cadena activa sin estos 2 archivos sigue funcionando

Se corrio en un Postgres 17 desechable (WSL2/Docker), en orden real:
`0001_iam_schema.sql` -> `0002_automation_schema.sql` -> `0003_row_level_security.sql` ->
`0004_knowledge_schema.sql` -> `0006_prompt_version_immutability.sql` ->
`0007_outbox.sql` -> `0008_idempotent_run_acceptance.sql` -> `0011_fleet_and_metering_schema.sql`
-- todas aplicaron sin error. (`0005_knowledge_search.sql` no se incluyo en esta pasada
especifica por requerir la extension `pgvector`, no disponible en la imagen base usada
para esta verificacion puntual -- ya fue verificada por separado con la imagen
`pgvector/pgvector:pg17` en K02.)

`0011_fleet_and_metering_schema.sql` (schema `fleet` + `metering`, contenido nuevo sin
colision con nada anterior) se conserva como parte activa de la cadena de migraciones.
