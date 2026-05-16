# ADR-004: CI/CD Promotion Strategy

Date: 2026-05-09
Status: Accepted

## Decision

Use branch-based promotion with manual production gates:

- `develop`: staging deployment.
- `main`: production-ready branch.
- Tags `release/YYYY.MM.DD-N`: production release markers.
- Production requires manual approval and completed Go/No-Go checklist.

## Required Checks

- Lint, typecheck, unit tests, and contract validation.
- Secret scanning before merge.
- Cloudflare and GitHub configuration dry-run before infrastructure changes.
- Production smoke after deploy.

## Rollback

Every production deploy must record the previous image/tag, config version, and database backup reference where applicable.
