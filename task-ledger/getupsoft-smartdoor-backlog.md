# GetUpSoft Smart Door - Initial Backlog

## Objective

Turn the Smart Door proposal into an implementable product backlog aligned with GetUpSoft governance, ORCA automation, and production delivery.

## Definition of Ready

- Tuya cloud capability matrix documented for target lock models.
- Supported unlock, status, event, and access-code features confirmed by provider and model.
- Product card and technical proposal published in canonical product directory.
- Security constraints accepted: official APIs only, no illegal reverse engineering.
- Backend baseline selected: `apps/backend-nest/`.
- ORCA automation contract indexed in `apps/orca/config/prompt_index.json`.
- Single PostgreSQL container policy accepted for the environment, with schema separation only.

## Definition of Done

- Feature implemented behind tested API and permission checks.
- Audit logging added for every critical action.
- Tenant scoping covered in tests.
- OpenAPI docs updated.
- Monitoring and health checks updated where relevant.
- ORCA workflow impact reviewed if automation-facing behavior changed.

## Epics

### SD-EPIC-01 Platform foundation

- Setup product repos and environment strategy.
- Establish NestJS bounded contexts and database schema baseline.
- Establish NestJS bounded contexts and schema-first PostgreSQL baseline.
- Add Redis, BullMQ, health checks, and observability skeleton.

Tests:
- lint
- typecheck
- unit tests for auth and tenancy
- DB migration smoke test

### SD-EPIC-02 Identity, tenancy, and policy

- Multi-tenant tenant/user model.
- RBAC + ABAC.
- JWT + refresh token rotation + MFA base.
- security sessions and audit baseline.

Tests:
- auth E2E
- tenant isolation tests
- brute-force and rate-limit tests

### SD-EPIC-03 Tuya integration MVP

- Tuya account linking.
- device sync.
- capability registry per model.
- webhook/polling normalization.

Tests:
- contract tests with mock Tuya
- duplicate event handling
- provider outage behavior

### SD-EPIC-04 Smart lock command engine

- open/close/lock/unlock command flow
- idempotency keys
- command signature
- retry/circuit breaker
- websocket status updates

Tests:
- command duplication
- expired command rejection
- audit completeness

### SD-EPIC-05 Mobile MVP

- Flutter auth
- lock list
- lock status
- remote unlock with biometric confirmation
- push notifications

Tests:
- widget tests
- integration tests for unlock flow
- offline/partial state tests

### SD-EPIC-06 Guest, code, and QR access

- guest invitations
- temporary access codes
- QR grant generation with stay-time parameter
- QR landing page and QR unlock flow

Tests:
- QR expiry
- usage limit enforcement
- permission revocation

### SD-EPIC-07 Admin, technician, and support portals

- admin dashboard
- technician job flow
- customer portal
- support audited access

Tests:
- role matrix E2E
- dashboard access control

### SD-EPIC-08 Cloudflare, deploy, and production readiness

- DNS, WAF, Access, Tunnel
- Docker Compose for dev/qa/prod
- backups, monitoring, alerts
- CI/CD

Tests:
- deployment smoke tests
- health endpoint checks
- backup restore drill

### SD-EPIC-09 ORCA automation

- ORCA prompt registration
- Smart Door operational workflow contracts
- automated lock-health sweeps
- audit incident timeline generator
- QR and guest expiry workflow orchestration

Tests:
- prompt index query
- workflow dry runs
- audit-safe automation tests

## Sprint mapping

1. Sprint 1: SD-EPIC-01 foundation
2. Sprint 2: SD-EPIC-02 identity
3. Sprint 3: SD-EPIC-03 Tuya skeleton
4. Sprint 4: SD-EPIC-03 sync and events
5. Sprint 5: SD-EPIC-04 commands
6. Sprint 6: SD-EPIC-05 mobile MVP
7. Sprint 7: SD-EPIC-06 guest/code/QR
8. Sprint 8: SD-EPIC-07 portals
9. Sprint 9: SD-EPIC-08 QA and hardening
10. Sprint 10: SD-EPIC-08 production + SD-EPIC-09 automation rollout

## ORCA workflow candidates

- Supported-device qualification workflow
- Tuya incident triage workflow
- offline lock daily sweep
- low-battery escalation workflow
- QR grant expiry cleanup workflow
- tenant onboarding checklist workflow
