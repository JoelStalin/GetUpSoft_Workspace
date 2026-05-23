# Migration Notes

## ORCA Root Service

Source FastAPI surface:

- `orca/service/app.py`

Migrated NestJS surface:

- `src/modules/orca/orca.controller.ts`
- `src/modules/orca/orca.service.ts`
- `src/modules/orca/dto/interpret-request.dto.ts`

The HTTP layer is now represented by NestJS controllers and DTO validation. The existing Python ORCA interpreter remains a non-HTTP bridge through `python -m orca.cli` to preserve behavior during the incremental migration.

## Legacy Cleanup Rule

When a migrated endpoint is fully covered by NestJS and contract tests, remove active FastAPI deployment references. If Python code must stay temporarily, classify it in:

- `00_Workspace_Governance/fastapi_to_nestjs_migration_matrix.md`
- `09_Archives/legacy-fastapi-python/legacy_manifest.md`
