# Migration Notes

## ORCA Root Service

Source FastAPI surface (legacy):

- `legacy/python-fastapi/orca-service/app.py`

Migrated NestJS surface:

- `src/modules/orca/orca.controller.ts`
- `src/modules/orca/orca.service.ts`
- `src/modules/orca/dto/interpret-request.dto.ts`

The HTTP layer is now represented by NestJS controllers and DTO validation. For deterministic QA, NestJS uses `ORCA_BRIDGE_MODE=mock` by default; set `ORCA_BRIDGE_MODE=python` to invoke the Python CLI bridge.

## Legacy Cleanup Rule

When a migrated endpoint is fully covered by NestJS and contract tests, remove active FastAPI deployment references. If Python code must stay temporarily, classify it in:

- `00_Workspace_Governance/fastapi_to_nestjs_migration_matrix.md`
- `legacy/python-fastapi/`
