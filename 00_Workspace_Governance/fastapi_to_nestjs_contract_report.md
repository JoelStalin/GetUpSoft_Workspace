# FastAPI To NestJS Contract Report

Fecha: 2026-05-23
Estado: primer incremento verificado

## Scope Tested

Initial contract coverage targets the first migrated surface:

- `orca/service/app.py` -> `apps/backend-nest/src/modules/orca/*`

## Endpoints

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /health` | `orca/service/app.py` | `OrcaController.health` | passed |
| `POST /interpret` | `orca/service/app.py` | `OrcaController.interpret` | passed |
| `POST /n8n-payload` | `orca/service/app.py` | `OrcaController.n8nPayload` | passed |

## Evidence

Evidence was written under:

- `apps/backend-nest/evidence/`

Captured files:

- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/server.stdout.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/server.stderr.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/health.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/healthz.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/interpret.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/n8n-payload.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-ui-standalone-preset.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-docs.png`
- `apps/backend-nest/evidence/fastapi-to-nestjs-orca/swagger-dom-state.json`

## QA Result

- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- `npm run build`: passed.
- `npm run test:e2e`: passed, 4 tests.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Swagger DOM processed: title is `Swagger UI`, visible body includes `GetUpSoft Backend Nest`, `/healthz`, `/health`, `/interpret`, `/n8n-payload`, and schema `InterpretRequestDto`.

## Remaining Risk

The ORCA HTTP surface is now NestJS, but the ORCA interpreter implementation is still Python non-HTTP core invoked through CLI. This must be ported or explicitly retained as legacy/tooling before the full workspace migration can be declared complete.

## Second Increment: Task Server

Source:

- `apps/orca/src/ai_automation_orchestrator/task_server.py`

Migrated target:

- `apps/backend-nest/src/modules/workers/*`
- `apps/backend-nest/src/common/guards/orca-api-key.guard.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `POST /tasks` | `task_server.py` | `WorkersController.submitTask` | passed |
| `GET /tasks/{task_id}` | `task_server.py` | `WorkersController.getTaskStatus` | passed |
| `GET /tasks` | `task_server.py` | `WorkersController.listTasks` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/server.stdout.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/server.stderr.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/tasks.no-auth.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/tasks.create.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/tasks.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/tasks.list.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-workers.png`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-workers-dom-state.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workers/swagger-ui-standalone-preset.js`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed, 2 suites and 7 tests total.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- OpenAPI JSON confirms `api-key` header on `/tasks` endpoints.
- Browser DOM confirms visible `workers` section and `/tasks` endpoints in Swagger.

Remaining risk:

The original Python task server delegates to `agent.task_queue`. The NestJS implementation currently preserves HTTP behavior with an in-memory queue. A durable queue such as BullMQ should replace it before production cutover if persistence, retries, or distributed workers are required.

## Third Increment: Workspace API

Source:

- `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py`
- `apps/orca/src/ai_automation_orchestrator/workspace_manager.py`

Migrated target:

- `apps/backend-nest/src/modules/workspace/*`
- `apps/backend-nest/src/common/guards/orca-api-key.guard.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/workspace/status` | `workspace_endpoints.py` | `WorkspaceController.status` | passed |
| `GET /api/workspace/files` | `workspace_endpoints.py` | `WorkspaceController.listFiles` | passed |
| `POST /api/workspace/files/read` | `workspace_endpoints.py` | `WorkspaceController.readFile` | passed |
| `POST /api/workspace/files/write` | `workspace_endpoints.py` | `WorkspaceController.writeFile` | passed as protected mutation |
| `POST /api/workspace/files/delete` | `workspace_endpoints.py` | `WorkspaceController.deleteFile` | migrated, protected mutation |
| `POST /api/workspace/git/commit` | `workspace_endpoints.py` | `WorkspaceController.gitCommit` | migrated, protected mutation |
| `POST /api/workspace/git/push` | `workspace_endpoints.py` | `WorkspaceController.gitPush` | migrated, protected mutation |
| `POST /api/workspace/git/pull` | `workspace_endpoints.py` | `WorkspaceController.gitPull` | migrated, protected mutation |
| `POST /api/workspace/execute` | `workspace_endpoints.py` | `WorkspaceController.execute` | migrated, protected mutation |
| `GET /api/workspace/logs` | `workspace_endpoints.py` | `WorkspaceController.logs` | migrated |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/server.stdout.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/server.stderr.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.no-auth.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.files.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.read.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.traversal.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/workspace.write.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-workspace.png`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-workspace-dom-state.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-workspace/swagger-ui-standalone-preset.js`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed, 3 suites and 13 tests total.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Browser DOM confirms visible `workspace` section and all `/api/workspace/*` routes in Swagger.
- Security checks: missing API key returns `401`, path traversal returns `403`, and write mutation returns `403` unless explicitly enabled.

Remaining risk:

The FastAPI version allowed workspace mutations directly after API key validation. The NestJS migration intentionally gates write/delete/git/execute behind `ORCA_WORKSPACE_MUTATIONS_ENABLED=true`. This is a deliberate security hardening and should be called out during contract review.

## Fourth Increment: Provider Endpoints

Source:

- `apps/orca/src/ai_automation_orchestrator/provider_endpoints.py`
- `apps/orca/src/ai_automation_orchestrator/provider_config_endpoints.py`
- `apps/orca/src/ai_automation_orchestrator/provider_login_endpoints.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/*`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/providers` | `provider_endpoints.py` | `ProvidersController.listProviders` | passed |
| `GET /api/providers/{provider}` | `provider_endpoints.py` | `ProvidersController.getProvider` | migrated |
| `POST /api/providers/{provider}/validate` | `provider_endpoints.py` | `ProvidersController.validateProvider` | passed |
| `GET /api/providers/status` | `provider_endpoints.py` | `ProvidersController.providerStatus` | passed |
| `POST /api/providers/{provider}/connect` | `provider_endpoints.py` | `ProvidersController.connectProvider` | passed |
| `DELETE /api/providers/{provider}/disconnect` | `provider_endpoints.py` | `ProvidersController.disconnectProvider` | passed |
| `POST /api/providers/config` | `provider_config_endpoints.py` | `ProvidersController.saveProviderConfig` | passed |
| `GET /api/providers/config/{provider_id}` | `provider_config_endpoints.py` | `ProvidersController.getProviderConfig` | passed |
| `POST /api/providers/test` | `provider_config_endpoints.py` | `ProvidersController.testProvider` | passed |
| `/api/provider-auth-disabled/*` | `provider_login_endpoints.py` | n/a | legacy-excluded |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/server.stdout.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/server.stderr.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.no-auth.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.catalog.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.connect.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.validate.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.config-save.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.config-get.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/providers.test.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-providers.png`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-providers-dom-state.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers/swagger-ui-standalone-preset.js`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed, 4 suites and 18 tests total.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Browser DOM confirms visible `ai-automation providers` section and all `/api/providers/*` migrated routes in Swagger.
- Secret scan of captured JSON did not find raw test secrets `sk-test-1234567890` or `gm-secret-123456`.

Remaining risk:

Provider validation and config testing are offline-contract checks by default for deterministic CI. Real provider calls are implemented behind `AI_PROVIDER_VALIDATION_MODE=live`, with timeout controlled by `AI_PROVIDER_VALIDATION_TIMEOUT_MS`. Production use still needs secret storage hardening before broad rollout.

## Provider Live Validation Evidence

Runtime mode:

- `AI_PROVIDER_VALIDATION_MODE=live`
- `AI_PROVIDER_VALIDATION_TIMEOUT_MS=15000`

Real call performed:

- `POST /api/providers/openai/validate`
- Provider target: `https://api.openai.com/v1/models`
- Test credential: dummy key, not a real secret.

Observed result:

- NestJS endpoint status: `400`
- Provider status reported by NestJS: `401`
- Mode: `live-provider-validation`
- Raw dummy key was not present in captured response files.

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-providers-live/openai-live-valid.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers-live/openai-live-valid.error.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers-live/server.stdout.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-providers-live/server.stderr.log`

QA result:

- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Secret scan over captured live-validation evidence did not find the dummy key.
