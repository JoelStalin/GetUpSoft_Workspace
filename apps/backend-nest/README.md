# GetUpSoft Backend Nest

NestJS migration target for internal GetUpSoft FastAPI/Python HTTP surfaces.

## Current Status

- `HealthModule`: implemented.
- `OrcaModule`: first compatibility migration for `orca/service/app.py`.
- `WorkersModule`: compatibility migration for `apps/orca/src/ai_automation_orchestrator/task_server.py`.
- `WorkspaceModule`: compatibility migration for `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py`.
- `AiAutomationModule`: provider catalog/config migration for provider endpoints.
- Python ORCA core is currently used as non-HTTP bridge through `python -m orca.cli` while the internal interpreter logic is ported to TypeScript.

## Commands

```powershell
npm install
npm run build
npm run test:e2e
npm run start
```

Default port: `8788`.

Swagger: `http://localhost:8788/docs`

## Compatibility Endpoints

- `GET /health`
- `POST /interpret`
- `POST /n8n-payload`
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:taskId`
- `GET /api/workspace/status`
- `GET /api/workspace/files`
- `POST /api/workspace/files/read`
- `POST /api/workspace/files/write`
- `POST /api/workspace/files/delete`
- `POST /api/workspace/git/commit`
- `POST /api/workspace/git/push`
- `POST /api/workspace/git/pull`
- `POST /api/workspace/execute`
- `GET /api/workspace/logs`
- `GET /api/providers`
- `GET /api/providers/status`
- `GET /api/providers/:provider`
- `POST /api/providers/:provider/validate`
- `POST /api/providers/:provider/connect`
- `DELETE /api/providers/:provider/disconnect`
- `POST /api/providers/config`
- `GET /api/providers/config/:providerId`
- `POST /api/providers/test`

Workspace mutation routes are blocked by default. Set `ORCA_WORKSPACE_MUTATIONS_ENABLED=true` only in controlled environments.

Provider validation defaults to offline contract checks for deterministic tests. Set `AI_PROVIDER_VALIDATION_MODE=live` to perform real network calls to provider validation endpoints. Optional timeout: `AI_PROVIDER_VALIDATION_TIMEOUT_MS`.

## Legacy Boundary

This app must not expose FastAPI. Any remaining Python is non-HTTP tooling or temporary core logic bridge and must be tracked in the migration matrix.
