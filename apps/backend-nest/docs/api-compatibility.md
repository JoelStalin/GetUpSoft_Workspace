# API Compatibility

## Migrated From `legacy/python-fastapi/orca-service/app.py`

| FastAPI endpoint | NestJS endpoint | Status | Notes |
|---|---|---|---|
| `GET /health` | `GET /health` | migrated | Response shape preserved. |
| `POST /interpret` | `POST /interpret` | migrated | DTO validation preserves non-empty `content`; ORCA core bridge preserves current interpreter behavior. |
| `POST /n8n-payload` | `POST /n8n-payload` | migrated | Response shape rebuilt from interpretation payload. |

## Known Temporary Compatibility Boundary

The ORCA interpreter implementation is still Python. It no longer requires FastAPI for the migrated NestJS HTTP surface, but it is not yet a native TypeScript service.

This bridge can take tens of seconds on cold start because the Python ORCA core imports the local ML/NLP stack. Native TypeScript porting of the interpreter internals is required before this surface is considered fully retired from Python.

## Migrated From `apps/orca/src/ai_automation_orchestrator/task_server.py`

| FastAPI endpoint | NestJS endpoint | Status | Notes |
|---|---|---|---|
| `POST /tasks` | `POST /tasks` | migrated | Requires `api-key`; returns queued task id and project id. |
| `GET /tasks/{task_id}` | `GET /tasks/:taskId` | migrated | Requires `api-key`; returns status or 404. |
| `GET /tasks` | `GET /tasks` | migrated | Requires `api-key`; returns all in-memory statuses. |

The Python `agent.task_queue` implementation is not moved in this increment. `WorkersModule` uses an in-memory queue to preserve HTTP contract behavior while the worker runtime is redesigned for NestJS.

## Migrated From `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py`

| FastAPI endpoint | NestJS endpoint | Status | Notes |
|---|---|---|---|
| `GET /api/workspace/status` | `GET /api/workspace/status` | migrated | Requires `api-key`; includes git status. |
| `GET /api/workspace/files` | `GET /api/workspace/files` | migrated | Requires `api-key`; safe path resolution. |
| `POST /api/workspace/files/read` | `POST /api/workspace/files/read` | migrated | Requires `api-key`; blocks path traversal. |
| `POST /api/workspace/files/write` | `POST /api/workspace/files/write` | migrated | Requires `api-key`; blocked unless `ORCA_WORKSPACE_MUTATIONS_ENABLED=true`. |
| `POST /api/workspace/files/delete` | `POST /api/workspace/files/delete` | migrated | Requires `api-key`; blocked unless mutations are enabled. |
| `POST /api/workspace/git/commit` | `POST /api/workspace/git/commit` | migrated | Requires `api-key`; blocked unless mutations are enabled. |
| `POST /api/workspace/git/push` | `POST /api/workspace/git/push` | migrated | Requires `api-key`; blocked unless mutations are enabled. |
| `POST /api/workspace/git/pull` | `POST /api/workspace/git/pull` | migrated | Requires `api-key`; blocked unless mutations are enabled. |
| `POST /api/workspace/execute` | `POST /api/workspace/execute` | migrated | Requires `api-key`; allow-listed `execFile`, no shell, blocked unless mutations are enabled. |
| `GET /api/workspace/logs` | `GET /api/workspace/logs` | migrated | Requires `api-key`; process-local operation log. |

## Migrated From Provider Endpoints

| FastAPI endpoint | NestJS endpoint | Status | Notes |
|---|---|---|---|
| `GET /api/providers` | `GET /api/providers` | migrated | Requires `api-key`; provider catalog. |
| `GET /api/providers/{provider}` | `GET /api/providers/:provider` | migrated | Requires `api-key`; unknown provider returns 404. |
| `POST /api/providers/{provider}/validate` | `POST /api/providers/:provider/validate` | migrated | Offline by default; real provider calls when `AI_PROVIDER_VALIDATION_MODE=live`. |
| `GET /api/providers/status` | `GET /api/providers/status` | migrated | Requires `api-key`; masks credentials. |
| `POST /api/providers/{provider}/connect` | `POST /api/providers/:provider/connect` | migrated | In-memory credential store for contract migration. |
| `DELETE /api/providers/{provider}/disconnect` | `DELETE /api/providers/:provider/disconnect` | migrated | Removes in-memory credential. |
| `POST /api/providers/config` | `POST /api/providers/config` | migrated | Stores redacted config in memory. |
| `GET /api/providers/config/{provider_id}` | `GET /api/providers/config/:providerId` | migrated | Does not return raw provider config. |
| `POST /api/providers/test` | `POST /api/providers/test` | migrated | Offline by default; real provider calls when `AI_PROVIDER_VALIDATION_MODE=live`. |
| `/api/provider-auth-disabled/*` | n/a | legacy-excluded | Source route is explicitly disabled; unified auth needs separate design. |
