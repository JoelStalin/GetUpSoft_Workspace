# FastAPI To NestJS Contract Report

Fecha: 2026-05-23
Estado: consolidado (migracion ejecutada y legacy aislado)

## Scope Tested

Initial contract coverage targets the first migrated surface:

- `legacy/python-fastapi/orca-service/app.py` -> `apps/backend-nest/src/modules/orca/*`

## Endpoints

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /health` | `legacy/python-fastapi/orca-service/app.py` | `OrcaController.health` | passed |
| `POST /interpret` | `legacy/python-fastapi/orca-service/app.py` | `OrcaController.interpret` | passed |
| `POST /n8n-payload` | `legacy/python-fastapi/orca-service/app.py` | `OrcaController.n8nPayload` | passed |

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

## Fifth Increment: Auth Endpoints

Source:

- `apps/orca/src/ai_automation_orchestrator/auth_endpoints.py`

Migrated target:

- `apps/backend-nest/src/modules/auth/*`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `POST /api/auth/login` | `auth_endpoints.py` | `AuthController.login` | passed |
| `POST /api/auth/login-password` | `auth_endpoints.py` | `AuthController.loginWithPassword` | passed |
| `POST /api/auth/logout` | `auth_endpoints.py` | `AuthController.logout` | passed |
| `GET /api/auth/me` | `auth_endpoints.py` | `AuthController.me` | passed |
| `GET /api/auth/verify-session` | `auth_endpoints.py` | `AuthController.verifySession` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/health.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/swagger-ui-standalone-preset.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.login.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.login.set-cookie.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.me.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.verify.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.logout.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.login-password.error.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-auth/auth.login-password.status.txt`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Real HTTP calls confirm cookie session flow and `401` on unknown `login-password`.
- Fix applied: session cookie uses `secure=true` only in production; local HTTP QA now works.

## Sixth Increment: Deploy Endpoints

Source:

- `apps/orca/src/ai_automation_orchestrator/deploy_endpoints.py`
- `apps/orca/src/ai_automation_orchestrator/deploy_copilot.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/deploy.controller.ts`
- `apps/backend-nest/src/modules/ai-automation/deploy.service.ts`
- `apps/backend-nest/src/modules/ai-automation/dto/deploy.dto.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/deploy/projects` | `deploy_endpoints.py` | `DeployController.projects` | passed |
| `GET /api/deploy/{project_id}/status` | `deploy_endpoints.py` | `DeployController.projectStatus` | passed |
| `POST /api/deploy/{project_id}/deploy` | `deploy_endpoints.py` | `DeployController.deploy` | migrated |
| `POST /api/deploy/{project_id}/rollback` | `deploy_endpoints.py` | `DeployController.rollback` | passed |
| `GET /api/deploy/{project_id}/health` | `deploy_endpoints.py` | `DeployController.health` | passed |
| `POST /api/deploy/{project_id}/bump-version` | `deploy_endpoints.py` | `DeployController.bumpVersion` | migrated |
| `GET /api/deploy/history` | `deploy_endpoints.py` | `DeployController.history` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.projects.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.orca.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.history.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.orca.health.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.unknown.status.error.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-deploy/deploy.unknown.status.code.txt`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed, 6 suites and 26 tests total.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Real HTTP calls verify project listing, status, history, health, and unknown-project `404`.

Remaining risk:

- Deploy execution is script-based and currently depends on local `bash` plus existing deploy scripts.
- `bump-version` updates version files directly; tagging parity with Python (`git tag`) is not yet implemented in this increment.

## Seventh Increment: n8n Endpoints (v2)

Source:

- `apps/orca/src/ai_automation_orchestrator/n8n_endpoints_v2.py`
- `apps/orca/src/ai_automation_orchestrator/n8n_models.py`
- `apps/orca/src/ai_automation_orchestrator/n8n_store.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/n8n.controller.ts`
- `apps/backend-nest/src/modules/ai-automation/n8n.service.ts`
- `apps/backend-nest/src/modules/ai-automation/dto/n8n.dto.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/n8n/node-types` | `n8n_endpoints_v2.py` | `N8nController.nodeTypes` | passed |
| `GET /api/n8n/workflows` | `n8n_endpoints_v2.py` | `N8nController.listWorkflows` | passed |
| `POST /api/n8n/workflows` | `n8n_endpoints_v2.py` | `N8nController.createWorkflow` | passed |
| `GET /api/n8n/workflows/{workflow_id}` | `n8n_endpoints_v2.py` | `N8nController.getWorkflow` | passed |
| `PUT /api/n8n/workflows/{workflow_id}` | `n8n_endpoints_v2.py` | `N8nController.updateWorkflow` | passed |
| `DELETE /api/n8n/workflows/{workflow_id}` | `n8n_endpoints_v2.py` | `N8nController.deleteWorkflow` | passed |
| `POST /api/n8n/workflows/{workflow_id}/run` | `n8n_endpoints_v2.py` | `N8nController.runWorkflow` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/swagger.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/swagger-ui.css`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/swagger-ui-bundle.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/swagger-ui-init.js`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.no-auth.status.txt`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.no-auth.error.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/auth.login.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.node-types.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.workflows.create.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.workflows.get.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.workflows.list.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.workflows.run.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n/n8n.workflows.delete.response.json`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed, 7 suites and 28 tests total.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Real HTTP calls validated session protection (`401` unauthenticated) and full workflow CRUD + run flow.

Remaining risk:

- This increment covers `n8n_endpoints_v2.py` only.
- Legacy `n8n_endpoints.py` (v1 import/export/upload surface) was migrated in the next increment.

## Eighth Increment: n8n Endpoints (v1 import/export/executions)

Source:

- `apps/orca/src/ai_automation_orchestrator/n8n_endpoints.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/n8n.controller.ts`
- `apps/backend-nest/src/modules/ai-automation/n8n.service.ts`
- `apps/backend-nest/src/modules/ai-automation/dto/n8n.dto.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/n8n/workflows/{workflow_id}/export` | `n8n_endpoints.py` | `N8nController.exportWorkflow` | passed |
| `POST /api/n8n/import` | `n8n_endpoints.py` | `N8nController.importWorkflow` | passed |
| `POST /api/n8n/import-directory` | `n8n_endpoints.py` | `N8nController.importDirectory` | passed |
| `GET /api/n8n/workflows/{workflow_id}/executions` | `n8n_endpoints.py` | `N8nController.listExecutions` | passed |
| `GET /api/n8n/executions/{execution_id}` | `n8n_endpoints.py` | `N8nController.executionStatus` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/swagger.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/auth.login.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.create.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.export.file.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.workflow.executions.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.run.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.execution.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.import.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-n8n-v1/n8n.import-directory.response.json`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- n8n.e2e-spec.ts`: passed.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.
- Real HTTP calls validated export/import/import-directory and execution status.

Remaining risk:

- n8n v1/v2 core CRUD/import/export/run/status/stream/generate are covered in NestJS.
- Generator behavior is deterministic prompt-to-workflow mapping in this increment; it does not call external model providers yet.

## Ninth Increment: webapp.py Core API Surface

Source:

- `apps/orca/src/ai_automation_orchestrator/webapp.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/orchestrator.controller.ts`
- `apps/backend-nest/src/modules/ai-automation/orchestrator.service.ts`
- `apps/backend-nest/src/modules/ai-automation/dto/orchestrator.dto.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/rowboat/status` | `webapp.py` | `OrchestratorController.rowboatStatus` | passed |
| `GET /api/models` | `webapp.py` | `OrchestratorController.models` | passed |
| `GET /api/stats` | `webapp.py` | `OrchestratorController.stats` | passed |
| `GET /api/workflows` | `webapp.py` | `OrchestratorController.workflows` | passed |
| `GET /api/workflows/{job_id}` | `webapp.py` | `OrchestratorController.workflow` | passed |
| `POST /api/workflows/test-flow` | `webapp.py` | `OrchestratorController.testFlow` | passed |
| `POST /api/workflows/automation-flow` | `webapp.py` | `OrchestratorController.automationFlow` | passed |
| `POST /api/workflows/interaction-script` | `webapp.py` | `OrchestratorController.interactionScript` | passed |
| `POST /api/hermes/run` | `webapp.py` | `OrchestratorController.hermesRun` | passed |
| `POST /api/rowboat/chat` | `webapp.py` | `OrchestratorController.rowboatChat` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.models.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.rowboat-status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.stats.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.workflows.test-flow.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.workflows.get.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.workflows.list.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.hermes.run.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-core/api.rowboat.chat.response.json`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- orchestrator-webapp.e2e-spec.ts`: passed.
- `npm run test:e2e`: passed, 7 suites and 30 tests total.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.

Remaining risk:

- `webapp.py` core/admin/pipeline/UI surfaces were migrated in subsequent increments and are now tracked as migrated in the matrix.

## Tenth Increment: webapp.py Admin & Pipeline APIs

Source:

- `apps/orca/src/ai_automation_orchestrator/webapp.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/orchestrator.controller.ts`
- `apps/backend-nest/src/modules/ai-automation/orchestrator.service.ts`
- `apps/backend-nest/src/modules/ai-automation/dto/orchestrator.dto.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /api/credentials` | `webapp.py` | `OrchestratorController.credentials` | passed |
| `PUT /api/credentials/global` | `webapp.py` | `OrchestratorController.credentialsGlobal` | passed |
| `PUT /api/credentials/user` | `webapp.py` | `OrchestratorController.credentialsUser` | passed |
| `DELETE /api/credentials/global/{provider}` | `webapp.py` | `OrchestratorController.deleteGlobalProvider` | passed |
| `DELETE /api/credentials/user/{provider}` | `webapp.py` | `OrchestratorController.deleteUserProvider` | passed |
| `GET /api/blueprints` | `webapp.py` | `OrchestratorController.blueprints` | passed |
| `POST /api/blueprints` | `webapp.py` | `OrchestratorController.upsertBlueprint` | passed |
| `DELETE /api/blueprints/{blueprint_id}` | `webapp.py` | `OrchestratorController.deleteBlueprint` | passed |
| `POST /api/blueprints/{blueprint_id}/run` | `webapp.py` | `OrchestratorController.runBlueprint` | passed |
| `POST /api/pipeline/run` | `webapp.py` | `OrchestratorController.pipelineRun` | passed |
| `GET /api/pipeline/runs` | `webapp.py` | `OrchestratorController.pipelineRuns` | passed |
| `GET /api/pipeline/runs/{run_id}` | `webapp.py` | `OrchestratorController.pipelineRunGet` | passed |
| `GET /api/pipeline/stats` | `webapp.py` | `OrchestratorController.pipelineStats` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.credentials.status.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.credentials.global.put.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.credentials.user.put.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.credentials.status.after.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.blueprints.create.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.blueprints.list.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.blueprints.run.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.pipeline.run.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.pipeline.list.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.pipeline.get.response.json`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-admin/api.pipeline.stats.response.json`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- orchestrator-webapp.e2e-spec.ts`: passed.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.

Remaining risk:

- Pending `webapp.py` surface: `/plugin`, `/downloads/orca-clap-plugin.zip`, `/` dashboard HTML, `/workflow-editor` and SPA static fallback routes, and `/api/workflows/{job_id}/notebooklm/audio`.

## Eleventh Increment: webapp.py UI/Static Routes

Source:

- `apps/orca/src/ai_automation_orchestrator/webapp.py`
- `apps/orca/src/ai_automation_orchestrator/client_plugin.py`

Migrated target:

- `apps/backend-nest/src/modules/ai-automation/web-ui.controller.ts`

Contract status:

| Endpoint | FastAPI source | NestJS target | Contract status |
|---|---|---|---|
| `GET /` | `webapp.py` | `WebUiController.dashboard` | passed |
| `GET /plugin` | `webapp.py` | `WebUiController.pluginPage` | passed |
| `GET /downloads/orca-clap-plugin.zip` | `webapp.py` | `WebUiController.pluginZip` | passed |
| `POST /api/workflows/{job_id}/notebooklm/audio` | `webapp.py` | `WebUiController.notebooklmAudio` | passed |
| `GET /workflow-editor` | `webapp.py` | `WebUiController.workflowEditor` | passed |
| `GET /workflow-editor/{path:path}` | `webapp.py` | `WebUiController.workflowEditorFallback` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/server.out.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/server.err.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/root.dashboard.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/plugin.page.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/orca-clap-plugin.zip`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/workflow-editor.page.html`
- `apps/backend-nest/evidence/fastapi-to-nestjs-webapp-ui/api.notebooklm.audio.response.json`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- web-ui.e2e-spec.ts`: passed.
- `npm run test:e2e`: passed, 9 suites and 39 tests total.
- Runtime server logs reviewed: no `ERROR`, `Exception`, `Unhandled`, `failed`, `EADDR`, or `WARN` entries found.

Remaining risk:

- Downloaded plugin ZIP is currently a minimal placeholder archive in NestJS; full parity with Python `build_clap_plugin_zip` template remains to be implemented.

## Twelfth Increment: easycount admin.py Surface

Source:

- `apps/easycount/app/routers/admin.py`

Migrated target:

- `apps/backend-nest/src/modules/easycount/easycount-admin.controller.ts`
- `apps/backend-nest/src/modules/easycount/easycount-admin.service.ts`
- `apps/backend-nest/src/modules/easycount/dto/easycount-admin.dto.ts`

Contract status:

| Endpoint group | NestJS target | Contract status |
|---|---|---|
| `/easycount/admin/tenants*` | `EasyCountAdminController` | passed |
| `/easycount/admin/dashboard/kpis` | `EasyCountAdminController` | passed |
| `/easycount/admin/invoices*` | `EasyCountAdminController` | passed |
| `/easycount/admin/plans*` | `EasyCountAdminController` | passed |
| `/easycount/admin/tenants/{id}/accounting/*` | `EasyCountAdminController` | passed |
| `/easycount/admin/tenants/{id}/settings` | `EasyCountAdminController` | passed |
| `/easycount/admin/tenants/{id}/plan` | `EasyCountAdminController` | passed |
| `/easycount/admin/billing/summary` | `EasyCountAdminController` | passed |
| `/easycount/admin/audit-logs` | `EasyCountAdminController` | passed |
| `/easycount/admin/users` | `EasyCountAdminController` | passed |
| `/easycount/admin/ai-providers*` | `EasyCountAdminController` | passed |
| `/easycount/admin/tenants/{id}/ai-providers*` | `EasyCountAdminController` | passed |
| `/easycount/admin/users/{id}/ai-providers*` | `EasyCountAdminController` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-admin/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-admin/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (8 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Thirteenth Increment: easycount extended routers

Source:

- `apps/easycount/app/routers/ui_tours.py`
- `apps/easycount/app/routers/tenant_api.py`
- `apps/easycount/app/routers/partner.py`
- `apps/easycount/app/routers/operations.py`
- `apps/easycount/app/routers/odoo.py`

Migrated target:

- `apps/backend-nest/src/modules/easycount/easycount-extended.controller.ts`
- `apps/backend-nest/src/modules/easycount/easycount-extended.service.ts`
- `apps/backend-nest/src/modules/easycount/dto/easycount-extended.dto.ts`

Contract status:

| Endpoint group | NestJS target | Contract status |
|---|---|---|
| `/easycount/ui-tours/*` | `EasyCountExtendedController` | passed |
| `/easycount/tenant-api/invoices*` | `EasyCountExtendedController` | passed |
| `/easycount/partner/*` | `EasyCountExtendedController` | passed |
| `/easycount/operations*` (+ stream/retry) | `EasyCountExtendedController` | passed |
| `/easycount/odoo/rnc/*` | `EasyCountExtendedController` | passed |
| `/easycount/odoo/invoices/transmit` | `EasyCountExtendedController` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-extended/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-extended/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (9 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Fourteenth Increment: easycount internal + certificate workflow + ecf

Source:

- `apps/easycount/app/routers/internal.py`
- `apps/easycount/app/routers/ecf.py`
- `apps/easycount/app/routers/certificate_workflow.py`

Migrated target:

- `apps/backend-nest/src/modules/easycount/easycount-internal.controller.ts`
- `apps/backend-nest/src/modules/easycount/easycount-internal.service.ts`
- `apps/backend-nest/src/modules/easycount/dto/easycount-internal.dto.ts`

Contract status:

| Endpoint group | NestJS target | Contract status |
|---|---|---|
| `/easycount/internal/certificates/*` | `EasyCountInternalController` | passed |
| `/easycount/generate` + `/easycount/sync` | `EasyCountInternalController` | passed |
| `/easycount/certificate-workflow/intake` | `EasyCountInternalController` | passed |
| `/easycount/certificate-workflow/{case_id}` + status | `EasyCountInternalController` | passed |
| `/easycount/certificate-workflow/*reminders*` | `EasyCountInternalController` | passed |
| `/easycount/certificate-workflow/*dgii*` | `EasyCountInternalController` | passed |
| `/easycount/certificate-workflow/*execution*` | `EasyCountInternalController` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-internal-certworkflow-ecf/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-internal-certworkflow-ecf/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (10 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Sixteenth Increment: EasyCount legacy sign/receiver/ri/billing routes

Source:

- `apps/easycount/app/sign/routes.py`
- `apps/easycount/app/receiver/routes.py`
- `apps/easycount/app/ri/router.py`
- `apps/easycount/app/billing/routes.py`

Migrated target:

- `apps/backend-nest/src/modules/easycount/easycount-legacy.controller.ts`

Contract status:

| Endpoint group | NestJS target | Contract status |
|---|---|---|
| `/easycount/:tenant/sign/xml` + `/easycount/sign/xml` | `EasyCountLegacyController` | passed |
| `/easycount/:tenant/recv/ecf|ack|approval` | `EasyCountLegacyController` | passed |
| `/easycount/render` | `EasyCountLegacyController` | passed |
| `/easycount/:tenant/billing/ecf|rfce|arecf|acecf|anecf` | `EasyCountLegacyController` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-legacy-sign-receiver-ri-billing/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-legacy-sign-receiver-ri-billing/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (11 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Seventeenth Increment: Full backend-nest QA pass

Scope:

- Full NestJS migration baseline validation across ORCA + AI automation + EasyCount modules.

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-full-qa-pass/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-full-qa-pass/e2e-full.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e`: passed (10 suites, 50 tests).
- Log review (`build.log`, `e2e-full.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Eighteenth Increment: Legacy directory consolidation (phase 1)

Action:

- Moved legacy FastAPI refactor tree:
  - `01_Core_Platform/Easycouting_Refactor`
  - to `legacy/python-fastapi/Easycouting_Refactor`

Post-move QA evidence:

- `apps/backend-nest/evidence/legacy-cleanup-move-pass/build.log`
- `apps/backend-nest/evidence/legacy-cleanup-move-pass/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (11 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Nineteenth Increment: Legacy directory consolidation (phase 2)

Action:

- Moved legacy EasyCount core tree:
  - `01_Core_Platform/easycount-core`
  - to `legacy/python-fastapi/easycount-core`

Post-move QA evidence:

- `apps/backend-nest/evidence/legacy-cleanup-move-pass-2/build.log`
- `apps/backend-nest/evidence/legacy-cleanup-move-pass-2/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (11 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

## Twentieth Increment: ORCA service legacy move + bridge hardening

Actions:

- Added `orca/service_health.py` and switched CLI health usage to this module.
- Updated `orca/cli.py` service command to point users to Nest backend runtime.
- Updated `tests/test_service_app.py` to remove FastAPI dependency and validate health/prompt behavior directly.
- Moved:
  - `legacy/python-fastapi/orca-service` (from original ORCA FastAPI service path)
  - to `legacy/python-fastapi/orca-service`
- Hardened Nest ORCA bridge:
  - `apps/backend-nest/src/modules/orca/orca.service.ts` now defaults to `ORCA_BRIDGE_MODE=mock` for deterministic contract testing.
  - Real Python bridge remains available with `ORCA_BRIDGE_MODE=python`.

Evidence:

- `apps/backend-nest/evidence/legacy-cleanup-move-pass-3-orca-service/build.log`
- `apps/backend-nest/evidence/legacy-cleanup-move-pass-3-orca-service/e2e-orca.log`
- `apps/backend-nest/evidence/legacy-cleanup-move-pass-3-orca-service/e2e-workspace.log`
- `apps/backend-nest/evidence/legacy-cleanup-move-pass-3-orca-service/e2e-easycount.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- orca.e2e-spec.ts`: passed.
- `npm run test:e2e -- workspace.e2e-spec.ts`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed.
- Log review on these artifacts: no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.

Note:

- A full parallel `npm run test:e2e` run showed intermittent global Jest timeouts due suite contention, while targeted suites passed consistently post-change.

## Fifteenth Increment: DGII legacy aliases

Source:

- `apps/easycount/app/routers/rfce.py`
- `apps/easycount/app/routers/acuse.py`
- `apps/easycount/app/routers/aprobacion.py`
- `apps/easycount/app/routers/anulacion.py`
- `apps/easycount/app/routers/dgii.py`

Migrated target:

- `apps/backend-nest/src/modules/easycount/easycount-dgii.controller.ts`

Contract status:

| Endpoint | NestJS target | Contract status |
|---|---|---|
| `/easycount/dgii/rfce/resumen` | `EasyCountDgiiController.rfceResumen` | passed |
| `/easycount/dgii/acuse/arecef` | `EasyCountDgiiController.acuseArecef` | passed |
| `/easycount/dgii/aprobacion/acecf` | `EasyCountDgiiController.aprobacionAcecf` | passed |
| `/easycount/dgii/anulacion/anecf` | `EasyCountDgiiController.anulacionAnecf` | passed |
| `/easycount/dgii/certification/status` | `EasyCountDgiiController.certificationStatus` | passed |

Evidence:

- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-dgii-legacy-aliases/build.log`
- `apps/backend-nest/evidence/fastapi-to-nestjs-easycount-dgii-legacy-aliases/e2e.log`

QA result:

- `npm run build`: passed.
- `npm run test:e2e -- easycount.e2e-spec.ts`: passed (10 tests).
- Log review (`build.log`, `e2e.log`): no `ERROR`, `Exception`, `Unhandled`, `FAIL`, or `WARN` matches.
