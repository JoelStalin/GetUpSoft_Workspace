# Product Card: GetUpSoft Smart Door

**Card ID:** PROD-004
**Date Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Status:** [x] Draft | [ ] Active | [ ] Deprecated | [ ] Archived
**Owner:** GetUpSoft
**Domain:** `02_Products/`

## 1. Identity

| Field | Value |
|---|---|
| Canonical Name | GetUpSoft Smart Door |
| Deprecated Names | Smart Door, GetUpSoft Door Control |
| Current Path | `02_Products/GetUpSoftSmartDoor/` |
| Target Path | `02_Products/GetUpSoftSmartDoor/` |
| Repository | TBD - split into backend/admin/mobile/infra repos at implementation time |
| Version | 0.1.0-draft |
| Tech Stack | Flutter + NestJS + PostgreSQL (single shared container, schema-based isolation) + Redis + BullMQ + Cloudflare |

## 2. Description

### What it does

GetUpSoft Smart Door is a multi-tenant product for remote smart lock management, guest access, QR-based temporary access, installer workflows, audit logging, and commercial subscription management.

The MVP is cloud-first and legally integrates with official Tuya APIs where compatible. The platform keeps GetUpSoft as the business control plane while leaving room for optional gateway and future hardware ownership.

### Who uses it

- GetUpSoft platform admins
- tenant admins for enterprise customers
- property owners and managers
- temporary guests
- field technicians
- support agents under controlled access

### Primary features

- Remote lock control with audit and policy enforcement
- Guest invitations, temporary codes, and QR access windows
- Multi-tenant administration, technician workflows, and subscriptions

## 3. Architecture Summary

### Components

| Component | Path | Technology | Role |
|---|---|---|---|
| Product governance | `02_Products/GetUpSoftSmartDoor/` | Markdown | Canonical product architecture |
| API | `apps/backend-nest/` | NestJS | Business control plane |
| Automation | `apps/orca/` | ORCA/Hermes/gstack | Workflow orchestration and support automation |
| Mobile app | TBD | Flutter | End-user mobile control |
| Admin web | TBD | React/Next.js | Admin, customer, technician portals |

### External Dependencies

| System | Type | Purpose |
|---|---|---|
| Tuya Cloud Open API | API | MVP smart lock provider integration |
| Cloudflare | Edge platform | DNS, WAF, Access, Tunnel, TLS |
| Firebase / APNs | Push platform | Mobile notifications |

### Workers Used

| Worker | Path | Contract |
|---|---|---|
| ORCA automation | `apps/orca/` | `_Knowledge_Center/Master_Prompts/AI_Automation/GETUPSOFT_SMART_DOOR_ORCA_AUTOMATION_PROMPT.md` |

## 4. Infrastructure

| Item | Value |
|---|---|
| Docker Compose File | `/opt/getupsoft-smartdoor/docker-compose.yml` |
| Production URL | `api.smartdoor.getupsoft.com` |
| Staging URL | `qa-api.smartdoor.getupsoft.com` |
| CI/CD Pipeline | TBD at implementation |
| Cloudflare Config | WAF + Access + Tunnel + DNS |
| Environment File | `.env.example` per repo |
| Database Strategy | Single PostgreSQL container per environment with per-product schemas |

## 5. Critical Rules

- [x] NestJS only for the API; FastAPI is out of scope.
- [x] No illegal reverse engineering or crypto bypass of Tuya or other vendor protocols.
- [x] Remote unlocks must remain policy-checked, auditable, idempotent, and time-bounded.

## 6. Migration Status

| Field | Value |
|---|---|
| Migration Risk | [ ] Low | [x] Medium | [ ] High | [ ] Critical |
| Migration Phase | [x] Phase 0 (doc only) | [ ] Phase 1 | [ ] Phase 2 | [ ] Phase 3 | [ ] Complete |
| Blocking Conditions | Tuya capability validation, implementation repo setup, lock test matrix |
| ADR Reference | TBD |

## 7. Test Coverage

| Test Type | Tool | Status | Last Run |
|---|---|---|---|
| Unit Tests | Jest / Flutter test | [ ] Passing | N/A |
| Integration Tests | Supertest / contract tests | [ ] Passing | N/A |
| E2E Tests | Playwright / Flutter integration | [ ] Passing | N/A |

## 8. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-06-25 | Card created | Codex |

*GetUpSoft Product Card Template v1.0 - ISO/IEC 12207:2017*
