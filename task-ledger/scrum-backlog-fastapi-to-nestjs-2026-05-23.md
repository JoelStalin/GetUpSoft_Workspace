# Scrum Backlog: Migracion FastAPI/Python a NestJS/TypeScript

Fecha: 2026-05-23
Workspace: `GetUpSoft_Workspace`
Estado: `implemented` (migracion ejecutada, legacy consolidado)
Owner sugerido: Backend Architect / Scrum Master
Prioridad: Alta

## Epic

Migrar de forma completa, controlada y verificable toda la superficie backend HTTP interna implementada con FastAPI/Python hacia una base NestJS/TypeScript/Node.js, excluyendo productos de clientes externos y dejando el repositorio limpio al final del proceso.

Esta operacion no es solo inventariar modulos. El objetivo final es reemplazar FastAPI por NestJS en los modulos internos de GetUpSoft.

## Prompt Operativo

Actua como arquitecto backend senior, especialista en migraciones de FastAPI/Python hacia NestJS/TypeScript dentro de monorepos empresariales.

Estas trabajando dentro del repositorio:

`GetUpSoft_Workspace`

### Objetivo Principal

Realizar una migracion completa, controlada y verificable de toda la superficie backend implementada en FastAPI/Python hacia NestJS/TypeScript/Node.js, excluyendo explicitamente productos o soluciones de clientes externos como `ChefAlitas`, `GalantesJewelry` y cualquier implementacion de `EXO` que sea client-specific.

La operacion debe incluir:

1. Inventario de todos los modulos internos del workspace.
2. Deteccion de toda la superficie FastAPI/Python.
3. Exclusion de client solutions.
4. Diseno de arquitectura NestJS objetivo.
5. Migracion completa de endpoints, DTOs, servicios, autenticacion, validaciones, errores, configuracion, tests y despliegue.
6. Compatibilidad funcional con la API existente.
7. Documentacion de la migracion.
8. Validacion de que no queda FastAPI activo en los modulos internos migrados, salvo codigo legacy documentado y aislado.
9. Limpieza final del repositorio: codigo FastAPI reemplazado o legacy debe quedar retirado, aislado o movido a un solo directorio controlado de legacy, sin tocar client solutions.

### Archivos Que Deben Leerse Primero

- `README.md`
- `WORKSPACE_MAP.md`
- `00_Workspace_Governance/workspace_inventory.md`
- `00_Workspace_Governance/dependency_map.md`
- `00_Workspace_Governance/directory_rules.md`
- `00_Workspace_Governance/migration_manifest.md`
- `02_Products/README.md`
- `03_Client_Solutions/README.md`

### Reglas De Exclusion

No migrar ni incluir como modulos internos:

- `06_E_Commerce_Lux/Galantesjewelry/`
- `06_E_Commerce_Lux/GalantesJewelry/`
- cualquier ruta con `galantesjewelry`, `Galantesjewelry` o `GalantesJewelry`
- `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/`
- cualquier ruta con `ChefAlitas`, `Chefalitas`, `chefalitas` o `chefalitas_repo`
- `EXO` solo debe excluirse si se confirma que es una implementacion especifica de cliente

Excluir tambien dependencias, caches y artefactos generados:

- `.git/`
- `node_modules/`
- `.venv/`
- `venv/`
- `.venv-scrapling/`
- `__pycache__/`
- `.pytest_cache/`
- `.mypy_cache/`
- `.ruff_cache/`
- `.next/`
- `dist/`
- `build/`
- `.turbo/`
- `.cache/`
- paquetes vendorizados dentro de productos cliente
- dependencias instaladas
- artefactos generados

### Alcance FastAPI A Migrar

Buscar y migrar todo uso interno de:

- `FastAPI`
- `APIRouter`
- `Depends`
- `HTTPException`
- `Request`
- `Response`
- `BackgroundTasks`
- `UploadFile`
- `File`
- `Form`
- `Query`
- `Path`
- `Body`
- `status`
- `fastapi.security`
- `fastapi.middleware`
- `fastapi_limiter`
- `pydantic.BaseModel`
- `pydantic.Field`
- `uvicorn`
- routers bajo `app/routers`
- routers bajo `app/api/routes`
- servicios HTTP bajo `service/app.py`
- endpoints bajo `apps/orca/src/ai_automation_orchestrator`
- cualquier modulo Python que exponga HTTP API o endpoints FastAPI

Rutas esperadas a revisar especialmente:

- `legacy/python-fastapi/orca-service/`
- `orca/`
- `apps/orca/`
- `apps/orca/src/ai_automation_orchestrator/`
- `apps/orca/libs/hermes-agent/`
- `apps/easycount/app/`
- `apps/easycount/app/routers/`
- `apps/easycount/app/api/routes/`
- `apps/easycount/app/core/`
- `apps/easycount/app/security/`
- `apps/easycount/app/auth/`
- `apps/easycount/app/application/`
- `apps/easycount/app/services/`
- `legacy/python-fastapi/easycount-core/`
- `legacy/python-fastapi/Easycouting_Refactor/`
- cualquier otra ruta interna con FastAPI

No asumir que solo hay una app FastAPI. La auditoria debe buscar en todo el repo.

### Mapeo Obligatorio FastAPI A NestJS

| FastAPI/Python | NestJS/TypeScript |
|---|---|
| `FastAPI()`, `create_app()` | `NestFactory.create(AppModule)` |
| `APIRouter(prefix="/x", tags=["x"])` | `@Controller("x")`, modulos por dominio |
| `@router.get/post/put/patch/delete` | `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` |
| `BaseModel`, `Field` | DTOs TS, `class-validator`, `class-transformer`; Zod solo si se documenta |
| `Depends(...)` | providers, services, guards, interceptors, decorators, DI |
| FastAPI security, OAuth2, JWT manual | `@nestjs/passport`, JWT strategy, guards, `@CurrentUser()` |
| `HTTPException` | `HttpException`, excepciones Nest y filters |
| FastAPI middleware | Nest middleware, interceptors, exception filters |
| `BackgroundTasks` | BullMQ/Nest queues o service async controlado |
| `UploadFile`, `File`, `Form` | `FileInterceptor`, Multer, DTOs metadata |
| `Query`, `Path`, `Body` | `@Query`, `@Param`, `@Body` |
| OpenAPI FastAPI | `@nestjs/swagger` |
| pytest/httpx/TestClient | Jest/Supertest/Nest TestingModule |
| pydantic settings/env directo | `@nestjs/config` con config tipada |

Para base de datos, detectar primero si usa SQLAlchemy, SQLModel, raw SQL, asyncpg, sqlite, Odoo XML-RPC o servicios externos. No cambiar la base de datos por decision arbitraria. Si se reimplementa persistencia en TypeScript, proponer Prisma, TypeORM, MikroORM o cliente SQL directo y documentar el motivo.

## Arquitectura NestJS Objetivo

Ruta sugerida:

`apps/backend-nest/`

Si el workspace ya define una convencion mejor para apps backend, usarla y documentarla.

Estructura base:

```text
apps/backend-nest/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── decorators/
│   │   └── pipes/
│   ├── modules/
│   │   ├── health/
│   │   ├── auth/
│   │   ├── orca/
│   │   ├── easycount/
│   │   ├── ai-automation/
│   │   ├── workspace/
│   │   ├── odoo/
│   │   └── workers/
│   └── jobs/
├── test/
├── docs/
└── Dockerfile
```

Modulos esperados:

- `HealthModule`: liveness/readiness.
- `AuthModule`: login, JWT, guards, roles si existen.
- `EasyCountModule`: producto canonico unico para `apps/easycount/`, `easycount-core/` y `Easycouting_Refactor/`.
- `OrcaModule`: `legacy/python-fastapi/orca-service/app.py`, endpoints HTTP ORCA y comandos HTTP si existen.
- `AiAutomationModule`: endpoints bajo `apps/orca/src/ai_automation_orchestrator/`, n8n, deploy, provider login y task server si existen.
- `WorkspaceModule`: workspace manager, status, file operations, git operations, command execution y logs con seguridad estricta.
- `OdooModule`: solo APIs FastAPI relacionadas con Odoo; no mover addons ni modulos Odoo.
- `WorkersModule`: background jobs, colas y tareas async reutilizables.

## Product Backlog Items

| ID | Historia | Prioridad | Criterios de aceptacion |
|---|---|---:|---|
| F2N-001 | Como arquitecto, quiero auditar toda la superficie FastAPI interna para conocer el alcance real. | P0 | `fastapi_to_nestjs_audit.md` contiene rutas, endpoints, modelos, auth, servicios, riesgos y exclusiones. |
| F2N-002 | Como Scrum Master, quiero una matriz de migracion endpoint por endpoint para seguir avance y bloqueos. | P0 | `fastapi_to_nestjs_migration_matrix.md` usa estados permitidos y cubre cada endpoint detectado. |
| F2N-003 | Como backend lead, quiero crear `apps/backend-nest/` con base NestJS equivalente. | P0 | Nest compila, Swagger existe, validation pipe, config, health y logging base funcionan. |
| F2N-004 | Como usuario API, quiero que ORCA mantenga compatibilidad funcional al migrar su servicio HTTP. | P0 | Endpoints ORCA migrados o marcados como legacy/tooling no HTTP. |
| F2N-005 | Como usuario EasyCount, quiero una migracion unificada del producto canonico EasyCount. | P0 | No se crean tres productos; superficies EasyCount quedan consolidadas logicamente. |
| F2N-006 | Como operador AI Automation, quiero migrar endpoints de orquestacion y providers sin romper contratos. | P1 | Endpoints de AI automation migrados con DTOs, services y tests. |
| F2N-007 | Como operador de workspace, quiero que operaciones sensibles tengan guardas y auditoria. | P1 | WorkspaceModule tiene auth/guards/interceptors o queda bloqueado documentado. |
| F2N-008 | Como integrador Odoo, quiero conservar addons y migrar solo APIs HTTP FastAPI relacionadas. | P1 | No se mueve Odoo; solo capa API equivalente se migra si existe. |
| F2N-009 | Como QA, quiero contract tests FastAPI vs NestJS para validar equivalencia. | P0 | Reporte compara status, body, headers relevantes, errores, auth y validaciones. |
| F2N-010 | Como maintainer, quiero retirar o aislar FastAPI reemplazado para limpiar el repo. | P0 | Codigo reemplazado queda eliminado o movido a directorio legacy unico con manifiesto y razon. |

## Timeline Scrum

### Sprint 0: Preparacion y Auditoria (1 semana)

Objetivo: entender alcance real sin escribir NestJS productivo.

- Leer archivos de gobernanza requeridos.
- Crear `00_Workspace_Governance/fastapi_to_nestjs_audit.md`.
- Crear inventario FastAPI con exclusiones.
- Listar endpoints, routers, modelos Pydantic, Depends, auth, middleware, background tasks, env vars, DBs y tests.
- Clasificar resultados como interno, client-solution-excluded, Odoo/tooling, legacy o pendiente.

Entregables:

- `00_Workspace_Governance/fastapi_to_nestjs_audit.md`
- Evidencia de busqueda FastAPI restante clasificada.

### Sprint 1: Matriz, Contratos y Diseno NestJS (1 semana)

Objetivo: preparar migracion controlada por endpoint.

- Crear `00_Workspace_Governance/fastapi_to_nestjs_migration_matrix.md`.
- Definir modulos NestJS destino por dominio.
- Decidir ORM/cliente DB por modulo solo despues de auditar persistencia real.
- Definir estrategia de auth, errores, config y Swagger.
- Definir criterio de compatibilidad de contrato por endpoint.

Entregables:

- Matriz de migracion.
- Diseno de arquitectura NestJS.
- Lista de breaking changes propuestos, si existen.

### Sprint 2: Scaffold NestJS y Base Comun (1 semana)

Objetivo: dejar una app NestJS funcional y preparada para migrar modulos.

- Crear `apps/backend-nest/`.
- Configurar `main.ts`, `AppModule`, Swagger, config, validation pipe, filters, CORS, logging y health.
- Agregar scripts `start`, `start:dev`, `build`, `test`, `test:e2e`, `lint`, `typecheck`.
- Crear `apps/backend-nest/README.md` y docs base.

Entregables:

- App NestJS compilando.
- Health endpoint funcional.
- Swagger disponible.

### Sprint 3: Migracion ORCA + AI Automation (1-2 semanas)

Objetivo: migrar superficies internas de ORCA sin mover carpetas sin auditoria.

- Migrar `legacy/python-fastapi/orca-service/app.py`.
- Migrar endpoints HTTP bajo `apps/orca/src/ai_automation_orchestrator/`.
- Revisar `apps/orca/libs/hermes-agent/` como tooling/agente relacionado.
- Documentar Python que quede como CLI, worker no HTTP o legacy temporal.
- Crear tests de controlador, servicio y contrato.

Entregables:

- `OrcaModule`.
- `AiAutomationModule`.
- Tests y reporte de compatibilidad.

### Sprint 4: Migracion EasyCount Canonico (1-2 semanas)

Objetivo: migrar EasyCount como producto unico.

- Auditar `apps/easycount/`, `01_Core_Platform/easycount-core/` y `01_Core_Platform/Easycouting_Refactor/`.
- Migrar routers, api routes, application services, auth/security y servicios.
- Mantener contrato externo o documentar diferencias.
- Crear tests unitarios/e2e/contract.

Entregables:

- `EasyCountModule`.
- Matriz actualizada con endpoints migrados/tested.

### Sprint 5: Workspace/Odoo/Workers y DevOps (1 semana)

Objetivo: completar superficies restantes y preparar despliegue.

- Migrar APIs internas de workspace manager si existen.
- Migrar solo capas HTTP FastAPI relacionadas con Odoo, sin mover addons.
- Migrar background tasks a workers/queues si aplica.
- Agregar Dockerfile, env example, health checks y pipeline si aplica.

Entregables:

- `WorkspaceModule`, `OdooModule`, `WorkersModule` segun auditoria.
- DevOps NestJS listo.

### Sprint 6: Contract Testing, Retiro y Limpieza Legacy (1 semana)

Objetivo: cerrar migracion sin FastAPI interno activo injustificado y limpiar el repo.

- Ejecutar contract tests FastAPI vs NestJS donde FastAPI aun pueda levantarse.
- Crear `00_Workspace_Governance/fastapi_to_nestjs_contract_report.md`.
- Marcar cada endpoint como `tested`, `client-solution-excluded`, `legacy-excluded` o `blocked`.
- Retirar referencias de despliegue FastAPI cuando NestJS cubra el contrato.
- Centralizar codigo FastAPI reemplazado o legacy en un solo directorio.

Directorio legacy sugerido:

`legacy/python-fastapi/`

Estructura sugerida:

```text
legacy/python-fastapi/
├── README.md
├── legacy_manifest.md
├── orca/
├── easycount/
├── ai-automation/
├── workspace/
└── odoo-api/
```

Reglas de limpieza:

- No mover ni modificar client solutions.
- No mover Odoo addons.
- No mover scripts Python no HTTP que sigan activos sin documentar reemplazo.
- Cada archivo movido a legacy debe aparecer en `legacy_manifest.md` con ruta original, razon, reemplazo NestJS, fecha y estado.
- Si un archivo FastAPI queda en su ruta original temporalmente, debe estar marcado en la matriz como `blocked` o `legacy-excluded` con razon.

Entregables:

- Reporte de contrato.
- Legacy centralizado o justificado.
- Repo sin endpoints FastAPI internos activos sin clasificar.

## Definition Of Done

La migracion se considera completa solo si:

1. Existe app NestJS funcional.
2. Todos los endpoints FastAPI internos estan inventariados.
3. Todos los endpoints internos estan migrados o marcados como exclusion justificada.
4. Client solutions estan excluidas.
5. EasyCount esta tratado como producto canonico unico.
6. ORCA esta tratado como modulo con multiples superficies.
7. Odoo no fue movido fisicamente.
8. No se migraron carpetas de cliente.
9. NestJS compila sin errores.
10. Tests unitarios pasan.
11. Tests e2e pasan.
12. Contract tests pasan o documentan diferencias.
13. Swagger/OpenAPI NestJS esta disponible.
14. La documentacion explica como correr NestJS.
15. La documentacion explica que queda de FastAPI, si queda algo.
16. No hay endpoints FastAPI internos activos sin justificar.
17. El codigo FastAPI reemplazado fue eliminado o centralizado en `legacy/python-fastapi/`.
18. El manifiesto legacy indica que fue reemplazado, retirado, aislado o dejado temporalmente como legacy.

## Validaciones Requeridas

Usar `rg` preferentemente:

```powershell
rg "from fastapi|import fastapi|FastAPI\\(|APIRouter|Depends\\(|HTTPException|uvicorn|pydantic\\.BaseModel|from pydantic" . `
  -g "!**/.git/**" `
  -g "!**/node_modules/**" `
  -g "!**/.venv/**" `
  -g "!**/venv/**" `
  -g "!**/.venv-scrapling/**" `
  -g "!**/__pycache__/**" `
  -g "!**/.pytest_cache/**" `
  -g "!**/.mypy_cache/**" `
  -g "!**/.ruff_cache/**" `
  -g "!**/.next/**" `
  -g "!**/dist/**" `
  -g "!**/build/**" `
  -g "!**/.turbo/**" `
  -g "!**/.cache/**"
```

Cada resultado debe clasificarse como:

- `migrated`
- `legacy no HTTP`
- `client-solution-excluded`
- `Odoo/Python tooling`
- `pending blocked`

Validacion de exclusiones:

- `GalantesJewelry` no aparece como modulo interno migrado.
- `ChefAlitas` no aparece como modulo interno migrado.
- `chefalitas_repo` no aparece como modulo interno migrado.
- Rutas de clientes aparecen solo en seccion de excluidos.
- No se modifico codigo dentro de client solutions.
- No se migraron dependencias vendorizadas dentro de `.venv` o similares.

## Artefactos A Crear Durante La Implementacion

- `00_Workspace_Governance/fastapi_to_nestjs_audit.md`
- `00_Workspace_Governance/fastapi_to_nestjs_migration_matrix.md`
- `00_Workspace_Governance/fastapi_to_nestjs_contract_report.md`
- `apps/backend-nest/README.md`
- `apps/backend-nest/docs/migration-notes.md`
- `apps/backend-nest/docs/api-compatibility.md`
- `legacy/python-fastapi/README.md`
- `legacy/python-fastapi/legacy_manifest.md`

Actualizar si aplica:

- `WORKSPACE_MAP.md`
- `00_Workspace_Governance/workspace_inventory.md`
- `00_Workspace_Governance/migration_manifest.md`

## Riesgos

- Hay multiples superficies ORCA y EasyCount; tratarlas como apps separadas puede duplicar contratos.
- Algunas rutas Python pueden ser tooling no HTTP; no deben migrarse sin clasificacion.
- Odoo no debe moverse fisicamente.
- EXO requiere confirmacion antes de excluirse como client-specific.
- La limpieza legacy solo debe ejecutarse despues de pruebas y matriz actualizada.

## Respuesta Final Esperada Al Ejecutar La Migracion

Al terminar la implementacion, responder con:

1. Resumen ejecutivo.
2. Lista de modulos FastAPI detectados.
3. Lista de modulos migrados a NestJS.
4. Lista de endpoints migrados.
5. Lista de endpoints pendientes o excluidos.
6. Client solutions excluidas.
7. Archivos creados.
8. Archivos modificados.
9. Tests ejecutados.
10. Resultado de validacion.
11. Riesgos restantes.
12. Proximos pasos recomendados.

## Regla Final

No declarar la migracion como completada si queda algun endpoint FastAPI interno sin una de estas condiciones:

- migrado a NestJS;
- excluido por ser client solution;
- documentado como legacy/tooling no HTTP o bloqueo temporal.
