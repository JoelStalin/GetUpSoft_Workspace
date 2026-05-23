# FastAPI To NestJS Audit

Fecha: 2026-05-23
Workspace: `GetUpSoft_Workspace`
Estado: auditoria inicial + primera migracion incremental

## Reglas Aplicadas

- Se excluyeron client solutions: GalantesJewelry, ChefAlitas y rutas equivalentes por nombre.
- Se excluyeron dependencias/caches/artefactos: `.git`, `node_modules`, `.venv*`, `venv`, `__pycache__`, caches, `dist`, `build`.
- Odoo no se mueve fisicamente; solo se migrarian capas HTTP FastAPI si aparecen como API interna.
- EasyCount se trata como producto canonico unico, no como tres productos.
- ORCA se trata como conjunto de superficies relacionadas: `orca/`, `apps/orca/`, AI automation y agent tooling.

## Superficies FastAPI Detectadas

| Area | Ruta | Evidencia | Clasificacion | Estado |
|---|---|---|---|---|
| ORCA root service | `orca/service/app.py` | `FastAPI`, `@app.get("/health")`, `@app.post("/interpret")`, `@app.post("/n8n-payload")` | internal HTTP API | migracion NestJS inicial creada |
| ORCA CLI/service launcher | `orca/cli.py` | `uvicorn.run(...)` | launcher legacy HTTP | pendiente de retiro cuando NestJS cubra despliegue |
| ORCA core models | `orca/core/prompt_interpreter.py`, `orca/config.py`, `orca/integrations/n8n_contract.py`, `orca/audio/*` | `pydantic.BaseModel` | Python core no HTTP | legacy/tooling temporal, no FastAPI HTTP |
| AI Automation workspace API | `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py` | `FastAPI`, workspace status/files/git/execute/logs endpoints | internal HTTP API, security-sensitive | migrated to `WorkspaceModule` |
| AI Automation webapp | `apps/orca/src/ai_automation_orchestrator/webapp.py` | `FastAPI`, `Request`, `BackgroundTasks`, static/html responses, many `/api/*` endpoints | internal HTTP API + UI/static serving | pending |
| AI Automation task server | `apps/orca/src/ai_automation_orchestrator/task_server.py` | `FastAPI`, API key header, `/tasks` endpoints | internal HTTP API | migrated to `WorkersModule` |
| AI Automation providers | `apps/orca/src/ai_automation_orchestrator/provider_*endpoints.py` | `APIRouter`, provider config/auth endpoints | internal HTTP API | provider catalog/config migrated to `AiAutomationModule`; disabled login endpoints remain legacy-excluded |
| AI Automation n8n | `apps/orca/src/ai_automation_orchestrator/n8n_endpoints_v2.py` | `APIRouter`, uploads, workflow endpoints | internal HTTP API | pending |
| AI Automation models | `apps/orca/src/ai_automation_orchestrator/*models.py`, `user_auth.py` | Pydantic models | DTO source | pending |
| EasyCount runtime | `apps/easycount/gunicorn.conf.py` | `uvicorn.workers.UvicornWorker` | deployment/runtime signal | pending audit, product canonical EasyCount |
| EasyCount tests | `apps/easycount/e2e/*`, `apps/easycount/test_*` | smoke/test scripts | test source | pending audit |
| EasyCounting refactor test tooling | `01_Core_Platform/Easycouting_Refactor/scripts/run_local_controlled_matrix.py` | `fastapi.testclient.TestClient` | test tooling | legacy/test-source pending |
| Hermes agent reference | `03_AI_Automation/hermes-agent/hermes_cli/web_server.py` | `FastAPI`, many dashboard/session/config/model endpoints | external/reference agent tooling cloned by request | reference/tooling, not migrated as product in this pass |

## ORCA Root Endpoint Inventory

| Endpoint | Method | Request schema | Response schema | Auth | Services used | Risk |
|---|---|---|---|---|---|---|
| `/health` | GET | none | `HealthResponse` | none | `get_settings`, completion policy | low |
| `/interpret` | POST | `InterpretRequest` with `source_type`, `content` min length 1 | `InterpretationOutput` | none | `PromptInterpreter` | medium, preserves current Python core |
| `/n8n-payload` | POST | `InterpretRequest` | `N8NContract` | none | `PromptInterpreter`, `build_n8n_contract` | medium |

## Migration Notes

The first migration increment creates `apps/backend-nest/` and maps `orca/service/app.py` into `OrcaModule`. The HTTP surface is NestJS. The ORCA interpreter remains Python non-HTTP core invoked through CLI as a temporary bridge.

The second migration increment maps `apps/orca/src/ai_automation_orchestrator/task_server.py` into `WorkersModule`. The HTTP contract and API key behavior are covered by NestJS e2e tests. The old Python agent queue dependency is not moved; this increment uses an in-memory NestJS queue equivalent for request/status compatibility.

The third migration increment maps `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py` into `WorkspaceModule`. The NestJS version preserves read/status routes and adds strict API key protection, path traversal blocking, `execFile` command execution without shell, and a mutation safety gate. Write/delete/git/execute routes require `ORCA_WORKSPACE_MUTATIONS_ENABLED=true`.

The fourth migration increment maps provider catalog, status, connect/disconnect, validate, config, and config-test routes into `AiAutomationModule`. Provider validation is intentionally offline-contract validation in this increment so tests do not call external LLM APIs or expose raw secrets.

This is not final completion of the full workspace migration. Remaining internal FastAPI endpoints must be migrated or classified before declaring completion.

## Client Solutions Excluded

- `06_E_Commerce_Lux/Galantesjewelry/`
- `06_E_Commerce_Lux/GalantesJewelry/`
- routes containing Galantes variants
- `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/`
- routes containing ChefAlitas/Chefalitas variants
