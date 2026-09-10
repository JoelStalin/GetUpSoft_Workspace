# D02 (mitad RLS): Verificacion real de aislamiento multi-tenant

**Fecha:** 2026-09-10
**Alcance:** D02 en el diseno original combina "OIDC, bindings y RLS". Esta entrega cubre
**solo RLS** — la parte verificable con Postgres puro, sin ningun proveedor de identidad.
La parte de "OIDC bindings" (login real via Keycloak u otro IdP) **no se implemento**:
requiere que el usuario decida que IdP usar, y no se asume esa decision aqui.

**Metodo:** mismo patron que D01/D03 — Postgres 17 desechable (contenedor `--rm`,
eliminado al terminar). Se aplicaron `0001_iam_schema.sql` + `0002_automation_schema.sql`
+ `0003_row_level_security.sql`, se creo un rol REAL conectable (`orca_api_login`,
miembro de `orca_api`, sin `BYPASSRLS`) y se corrieron las pruebas conectado como ESE
rol — no como superusuario, que es precisamente el error que el diseno advierte
explicitamente evitar (seccion 3.6: "los propietarios pueden eludir RLS sin `FORCE ROW
LEVEL SECURITY`").

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | Query sin `SET LOCAL app.current_organization_id` (contexto vacio) | 0 filas — nunca "ve todo" por defecto | ✅ `visible_sin_contexto = 0` |
| 2 | Contexto = org-a dentro de una transaccion | Solo ve las filas de org-a (`iam.organizations`, `iam.projects`) | ✅ `slug = org-a`, `slug = proyecto-a` — exactamente 1 fila cada una |
| 3 | Misma conexion TCP, transaccion NUEVA, sin volver a hacer `SET LOCAL` | El contexto de la transaccion anterior NO debe persistir (regla explicita del diseno) | ✅ `visible_tras_commit_sin_nuevo_set = 0` — `SET LOCAL` es automaticamente local a la transaccion, confirmado con una conexion real reutilizada |
| 4 | Contexto = org-b, misma conexion | Solo ve org-b, JAMAS mezcla con lo que vio para org-a en el test 2 | ✅ `slug = org-b`, `slug = proyecto-b` |
| 5 | Con contexto org-a, `SELECT ... WHERE id = '<id-de-proyecto-de-org-b>'` (ataque directo por ID) | 0 filas — invisible, no solo "acceso denegado" con error | ✅ `(0 rows)` |

**Por que esto importa mas que un test generico:** el test 5 es el que realmente prueba
que RLS funciona como filtro estructural y no como una validacion que se pueda evadir
sabiendo el UUID exacto de una fila ajena — que es el vector de ataque mas simple contra
un sistema multi-tenant mal aislado.

## GRANTs otorgados en `0003_row_level_security.sql`

Solo `orca_api` recibio `SELECT, INSERT, UPDATE` sobre `iam.*` y `automation.*` — los
demas roles tecnicos creados en D01 (`orca_dispatcher`, `orca_indexer`, `orca_backup`,
`orca_audit_reader`) siguen sin ningun permiso: se acotaran cuando la tarea que
efectivamente los use (E01/K01/etc.) los necesite de verdad, en vez de otorgar permisos
"por si acaso" a un rol que todavia no ejecuta ningun codigo real.

## Pendiente (fuera de alcance, requiere decision del usuario)

- Eleccion de proveedor OIDC (Keycloak segun el diseno original, u otro).
- Flujo real de login/MFA/PKCE de la seccion 4.3.
- Emision real de `SET LOCAL app.current_organization_id` desde la capa de aplicacion
  (NestJS) en cada transaccion — hoy solo esta probado a nivel SQL puro; conectar esto al
  middleware/interceptor real de `platform/client-gateway` es trabajo de A02+ sobre el
  modulo de auth existente.
