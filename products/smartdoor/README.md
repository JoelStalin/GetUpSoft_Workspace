# GetUpSoft Smart Door

Canonical product directory for the GetUpSoft Smart Door platform.

## Scope

GetUpSoft Smart Door is a multi-tenant SaaS + mobile platform for remote smart door control, guest access, temporary QR access, installer workflows, auditability, and future optional local gateway support.

## Current artifacts

- `TECHNICAL_PROPOSAL.md` - full solution architecture, security, platform, roadmap, and delivery plan.

## Canonical implementation targets

- Backend API: `apps/backend-nest/`
- ORCA automation integration: `apps/orca/`
- Product governance: `02_Products/GetUpSoftSmartDoor/`
- Product card: `_Knowledge_Center/Memory/COMPONENT_CARDS/PRODUCT_CARD_GETUPSOFT_SMART_DOOR.md`
- Delivery backlog: `task-ledger/getupsoft-smartdoor-backlog.md`

## Product rules

- Use NestJS for HTTP APIs and core business services.
- Do not implement illegal reverse engineering or bypass proprietary Tuya protections.
- Use Tuya Cloud Open API for the MVP where officially supported.
- Treat local gateway support as optional unless protocol constraints require it.
- All remote unlock commands require auditable authorization, idempotency, expiry, and policy checks.
- QR access must resolve to a controlled GetUpSoft web flow, never a direct device secret.
