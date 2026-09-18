# ADR-0002: Diseño técnico integral de GetUpSoft Workspace y ORCA

**Fecha:** 2026-09-10
**Estado:** Aceptado — secciones 1, 3, 4 ya implementadas y verificadas; secciones 2 (reorg
real) y 5.4 (entregables restantes) parcialmente pendientes.

## Por qué existe este documento

El usuario proporcionó el diseño integral completo (5 secciones: arquitectura combinada,
directorios/bootstrap, base de datos, roles/seguridad, y secuencia de implementación) como
referencia para el trabajo ya en curso en esta rama. Este ADR mapea cada sección a su
implementación real en el repositorio, para que quede trazable qué ya existe, qué falta, y
dónde encontrar la evidencia — sin repetir el documento completo (el original queda en el
historial de la conversación y puede recuperarse ahí).

## Mapeo secciones → implementación real

### Sección 1 — Arquitectura combinada (bootstrap + patrones por proyecto)

- **1.1-1.2** (patrón por proyecto, bootstrap declarativo): implementado en
  `tools/workspace-cli/` (CLI corporativa: `inventory`, `doctor`, `validate`, `plan`,
  `status`, `up`, `down`) y `governance/registry/projects/*.json` (catálogo con
  `architecturePattern` por proyecto, `deploymentAuthority`, `owner`).
  Ver [ADR-0001](../policies/ADR-0001-patrones-combinados-por-proyecto.md).
- **1.3** (estructura interna de ORCA, hexagonal): parcialmente reflejada en
  `platform/client-gateway/apps/api/src/modules/` (auth, orca, gateway, workers,
  workspace, ai-automation, easycount, health) y en los modulos de dominio puro
  (`knowledge/domain/ingestion-policy.ts`, `context-budget.ts`, `prompt-normalizer.ts`)
  que NO importan NestJS/Prisma directamente — cumplen la regla "el dominio no importa
  framework" de la sección 1.3.
- **1.4** (tecnologías de referencia): coincide con lo ya usado — PostgreSQL 17, Prisma,
  NestJS 11, pgvector, pg-boss (outbox propio equivalente en
  `0007_outbox.sql`).

### Sección 2 — Directorios, reorganización, bootstrap

- **2.1-2.2** (árbol objetivo y mapa origen→destino): **NO ejecutado todavía** — es
  R01/R02 del backlog (sección 5.1), bloqueado pendiente de autorización explícita del
  usuario dado el riesgo (movimiento de directorios de produccion, ~294K archivos
  detectados en la raíz actual, ver checkpoint del 2026-09-10 en `CHANGE_TIMELINE.md`).
- **2.3** (manifiesto de traslado con precondiciones/rollback): el patrón de
  `migrationId`/`rollbackManifest` de este documento AÚN no tiene implementación —
  se construirá cuando se autorice R01.
- **2.4** (bootstrap corporativo, comandos `inventory/doctor/plan/bootstrap/up/down`):
  implementado en `tools/workspace-cli/src/cli/index.mjs` (`inventory`, `doctor`,
  `validate`, `plan`, `status`, `up`, `down`) con planificador DAG
  (`src/planner/dag.mjs`) y supervisor de procesos (`src/process-supervision/`),
  verificado 4/4 tests en verde (checkpoint B02-B04, 2026-09-10). Los subcomandos
  `bootstrap`/`migrate` de este documento no estan implementados todavia (fuera de
  alcance de B01-B04).

### Sección 3 — Base de datos

Implementado casi en su totalidad, verificado con Postgres real (no simulado) en
`governance/migration/validations/`:

| Diagrama del diseño | Migracion real | Verificacion |
|---|---|---|
| 3.2 Identidad y catálogo | `0001_iam_schema.sql` | D01-iam-schema-verification.md |
| — RLS / aislamiento | `0003_row_level_security.sql` | D02-rls-isolation-verification.md |
| 3.3 Conocimiento y prompts | `0004_knowledge_schema.sql`, `0005_knowledge_search.sql`, `0006_prompt_version_immutability.sql` | K01/K02/K03-*-verification.md |
| 3.4 Ejecución/dispositivos/costos | `0002_automation_schema.sql` (runs/steps), `0011_fleet_and_metering_schema.sql` (fleet/metering, checkpoint 2026-09-10) | D03-automation-schema-verification.md |
| 3.5 Reglas de esquema (lock_version, idempotencia) | `0008_idempotent_run_acceptance.sql` (`automation.accept_run()`) | E02-idempotency-verification.md (doble entrega real probada) |
| — Outbox durable | `0007_outbox.sql` (`claim_next_outbox_task()`, `FOR UPDATE SKIP LOCKED`) | E01-outbox-durability-verification.md (concurrencia real con 2 procesos psql) |
| 3.6 Roles técnicos separados | 6 roles creados en `0001_iam_schema.sql` (`orca_migrator`, `orca_api`, `orca_dispatcher`, `orca_indexer`, `orca_backup`, `orca_audit_reader`) | D01 |
| 3.8 Compilador de contexto (8K tokens) | `context-budget.ts` (`compileContext()`) | K02 (5 tests) |

**Pendiente de esta sección:** el flujo completo de secuencia de chat (3.7) esta
parcialmente conectado — U01 lo integro end-to-end (checkpoint `f6114aacca`), pero no
se ha verificado contra los 12 pasos exactos del diagrama de secuencia de este
documento uno por uno.

### Sección 4 — Roles, seguridad, alojamiento

- **4.1-4.2** (RBAC combinado, matriz de permisos): los roles de aplicación (`iam.roles`,
  `iam.permissions`, `iam.role_permissions`) existen en el schema (D01) pero **la matriz
  de permisos exacta de la tabla 4.2 (14 roles funcionales) no esta poblada como datos
  semilla todavia** — es trabajo pendiente, no bloqueado, solo no iniciado.
- **4.3** (perfiles de seguridad estándar/estricto): no implementado como configuración
  explicita; es una decision de producto pendiente.
- **4.4-4.5** (separación de confianza, seguridad del Gateway): el pairing de dispositivos
  (`fleet.pairing_codes`, `fleet.device_credentials`, `fleet.device_commands`) tiene su
  esquema de datos (0011, checkpoint 2026-09-10) pero la logica de aplicacion (endpoint de
  pairing, consumo de un solo uso transaccional) es F01 y sigue pendiente.
- **4.6** (modelo de amenazas): no existe un documento formal que mapee cada amenaza de
  la tabla 4.6 a un control verificado especificamente — trabajo de documentacion
  pendiente, la mayoria de los controles tecnicos SI existen (RLS, idempotencia, outbox)
  pero no estan indexados contra esta tabla especifica.
- **4.7** (alojamiento/continuidad): sin implementacion — son decisiones operativas de
  despliegue, no de codigo, pendientes de instalacion piloto (P01/P02).

### Sección 5 — Construcción, pruebas, entrega

- **5.1** (secuencia G01→P02): corresponde 1:1 con el backlog de 32 tareas ya ejecutado
  y documentado en `governance/migration/MASTER_32_TASKS_VERIFICATION_REPORT.json` y
  `CHANGE_TIMELINE.md`. Unicas dos tareas sin completar: **R01 y R02** (reorg real),
  bloqueadas pendiente de autorizacion explicita.
- **5.2** (pruebas por nivel): las pruebas de base de datos (FK cruzada, RLS, concurrencia,
  idempotencia) SI se ejecutaron con Postgres real segun esta lista. Las pruebas de
  bootstrap (CWD distinto, puerto ocupado, ciclo DAG, doble `up` simultaneo) estan
  PARCIALMENTE cubiertas por los tests de `tools/workspace-cli/tests/` pero no
  verificadas una por una contra esta lista especifica.
- **5.3** (estrategia de migracion: snapshot → import → comparar → delta → conmutar):
  este es exactamente el patron que sigue el script de D04
  (`reconcile_careerai_runs.mjs`) en su fase de "comparar" -- la fase de "conmutar
  adapter" no se ha ejecutado (D04 se detuvo deliberadamente en solo lectura, por
  decision del usuario).
- **5.4** (entregables exigidos): de la lista de 14 entregables, estan completos:
  catalogo de proyectos (G03), bootstrap funcional (B01-B04), esquema SQL con
  migraciones (D01-D05), matriz RBAC en schema aunque sin poblar datos (D01), backlog
  con dependencias (este mismo ADR + CHANGE_TIMELINE.md). Pendientes: ADR por cada
  decision arquitectonica individual (solo existen 2: ADR-0001 y este), diagramas de
  despliegue especificos del entorno real, modelo de amenazas indexado (4.6),
  instaladores por plataforma (F02-F04), backups/restauracion probados end-to-end (P01).

## Decision explicita registrada aqui

Por instruccion directa del usuario en esta sesion: **no se ejecuta ningun movimiento de
archivos de R01/R02 sin su confirmacion explicita**, incluso cuando un mensaje ambiguo o
una notificacion automatica sugiera lo contrario. Este ADR documenta el estado de
alineacion con el diseño integral SIN autorizar esa ejecucion.
