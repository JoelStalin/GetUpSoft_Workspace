# Repository Memory — GetUpSoft Workspace

**Document ID:** MEM-001
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** Active — Update after every architectural milestone
**ISO Reference:** ISO/IEC/IEEE 42010:2011 · ISO/IEC 12207:2017 §7.2.2

---

## Purpose

This document is the persistent memory for all AI agents and human developers operating in the GetUpSoft Workspace. Read this before making any structural decisions. Update this after every completed architectural sprint or migration.

---

## What Each Domain Represents

### `00_Workspace_Governance/`
Workspace-level governance. Contains classification matrices, migration plans, ISO traceability, and the master inventory. Think of it as the "rules of the repo." Nobody touches architecture without updating this first.

Key files:
- `ARCHITECTURE_GOVERNANCE.md` — Principles, ISO standards, decision criteria
- `REPOSITORY_CLASSIFICATION_MATRIX.md` — Where every directory belongs
- `MIGRATION_PLAN.md` — How to migrate safely, phase by phase
- `ISO_TRACEABILITY_MATRIX.md` — ISO compliance mapping
- `migration_manifest.md` — Log of every folder move ever made
- `FASTAPI_DEPRECATION_POLICY.md` — FastAPI is dead (2026-05-25)

### `01_Core_Platform/`
GetUpSoft's core operational infrastructure that is not a product per se. Contains branding assets, ops tooling, the corporate site infrastructure, and LAN infrastructure. This is the "glue" infrastructure.

Sub-directories:
- `branding_assets/` — Logos, fonts, brand guidelines
- `getupsoft-ops/` — Ops scripts, monitoring
- `getupsoft-site/` — DEPRECATED — canonical is `apps/site/` (resolve duplication)
- `getupsoft-mail-infra/` — Mail infrastructure (resolve duplication with `infra/mail/`)
- `infrastructure/` — OpenVPN, Cloudflare (merge with `infra/` eventually)

### `02_Products/`
GetUpSoft's own products with real end users. Currently a stub with only README. Target contents:

| Product | Canonical Location | Status |
|---|---|---|
| ORCA | `apps/orca/` (current) → `02_Products/ORCA/` (target) | Active |
| EasyCount | `apps/easycount/` (current) → `02_Products/EasyCount/` (target) | Active |
| GetUpSoft Site | `apps/site/` (current) → `02_Products/GetUpSoftSite/` (target) | Active |

### `03_Client_Solutions/`
Solutions built by GetUpSoft for named external clients. Currently a stub. Target contents:

| Client | Current Location | Target |
|---|---|---|
| GalantesJewelry | `06_E_Commerce_Lux/Galantesjewelry/` | `03_Client_Solutions/GalantesJewelry/` |
| ChefAlitas | `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` | `03_Client_Solutions/ChefAlitas/` |

### `04_Workers/`
Autonomous reusable workers. Currently a stub. Workers follow the contract: defined input, output, retry, audit log. Target contents:
- `printer/` — local-printer-agent, printer-proxy (ChefAlitas)
- `social/` — insta-manager-pro (Instagram automation)
- `data/` — scrapling (web scraping)
- `ai-agents/` — hermes-agent
- `workflow-runtime/` — n8n

### `02_Odoo_ERP/` (target rename: `05_ERP_Odoo/`)
The Odoo ERP domain. Multiple versions. NEVER move without ADR-0004 conditions satisfied. Active version is v19. Contains DGII modules (regulatory critical).

**Current active development:** v19 ORCA Audit Mixin refactoring — 43 modules, 5-week sprint.

### `06_Infrastructure_Networking/` (not yet created as directory)
Target for all networking/infrastructure. Currently split between `infra/`, `01_Core_Platform/infrastructure/`, `01_Core_Platform/getupsoft-mail-infra/`. Will be unified here.

### `07_Libraries_Tools/` (current: `libs/`)
Reusable SDKs and tools. Most critical: `libs/easycount-core/` — DGII fiscal silo — NEVER move (see ADR-0003).

### `08_Research_Labs/` (current: scattered in `03_AI_Automation/research/`, `notebooks/`, etc.)
Experiments and POCs. Low risk, low consumers.

### `09_Archives/` (current: `04_Archive_Legacy/`, `archive/`)
Obsolete code. Phase 1 migration can consolidate these.

### `_Knowledge_Center/`
This directory. Architecture memory. Never move. Read this before modifying the repo.

### `apps/`
Active monorepo apps. Transitional directory. Over time, contents migrate to domain directories.

### `libs/`
Critical libraries. `easycount-core` is the DGII fiscal silo.

### `scripts/`
Workspace automation. Too many hardcoded paths — keep in place.

---

## Decisions Already Made (Key Decisions)

| Decision | ADR | Summary | Do NOT reopen |
|---|---|---|---|
| Worker-First Architecture | ADR-0001 | All reusable logic goes into Workers | Yes |
| Domain-Based Layout | ADR-0002 | Numbered directories are canonical targets | Yes |
| EasyCount Canonical Name | ADR-0003 | Only "EasyCount" — no EasyCounting/Easycouting | Yes |
| Odoo Controlled Migration | ADR-0004 | 02_Odoo_ERP must NOT be moved until audit | Yes |
| Knowledge Center as Memory | ADR-0005 | _Knowledge_Center/ is permanent, never moves | Yes |
| FastAPI Deprecation | FASTAPI_DEPRECATION_POLICY.md | FastAPI HTTP dead since 2026-05-25, use NestJS | Yes |
| DGII Fiscal Silo | ADR-0003, KNOWLEDGE_PROTOCOL.md | All DGII logic only in libs/easycount-core | Yes |
| ORCA v19 Refactoring | V19_COMPLETE_MODULE_REFACTORING_MANDATE.md | All 43 Odoo modules get ORCA Audit Mixin | In progress |
| NestJS as primary HTTP | FASTAPI_DEPRECATION_POLICY.md | apps/backend-nest/ is the HTTP API | Yes |

---

## What Agents Must Remember Before Modifying This Repo

1. **Read AGENT_RULES.md first** — every agent, every session.
2. **FastAPI HTTP services are dead.** Do not create, fix, or extend FastAPI routes.
3. **DGII logic stays in `libs/easycount-core/`** — never copy to other modules.
4. **`02_Odoo_ERP/` must NOT be moved** — active production ERP with DGII compliance.
5. **EasyCount is the canonical name** — not EasyCounting, not Easycouting.
6. **ORCA is canonical in `apps/orca/`** — `03_AI_Automation/orca/` is a duplicate to be resolved.
7. **Never commit secrets.** Use `.env` files and environment variables only.
8. **Update migration_manifest.md** if you move any folder.
9. **Create an ADR** for any structural decision.
10. **UI/UX changes require QA checklist** (7 categories, WCAG AA, before/after screenshots).

---

## Current Active Initiatives (as of 2026-05-31)

| Initiative | Location | Status | Owner |
|---|---|---|---|
| Odoo v19 ORCA Audit Mixin Refactoring | `02_Odoo_ERP/Odoo_Enterprise_v19/` | In progress — 5 phases | Joel |
| ORCA Workflow Editor production deployment | `apps/orca/workflow-editor/` | Production ready | Joel |
| FastAPI → NestJS migration | `apps/backend-nest/` | In progress | Joel |
| Phase 2 ORCA Sales (feature/orca-phase-2-sales) | `apps/orca/` | Active branch | Joel |
| Workspace Architecture Governance (ISO docs) | `00_Workspace_Governance/`, `_Knowledge_Center/` | This sprint | Joel |

---

## History Log

| Date | Decision | Agent/Person | ADR/Reference |
|---|---|---|---|
| 2026-05-17 | Initial workspace inventory and migration manifest created | Human | migration_manifest.md |
| 2026-05-25 | FastAPI HTTP services deprecated — NestJS is the standard | Human | FASTAPI_DEPRECATION_POLICY.md |
| 2026-05-28 | Odoo v19 complete module refactoring mandate issued (43 modules) | Human | V19_COMPLETE_MODULE_REFACTORING_MANDATE.md |
| 2026-05-31 | ISO Architecture Governance documentation created (ADR-0001 to ADR-0005) | Claude | ADR-0001 to ADR-0005 |
| 2026-05-31 | REPOSITORY_CLASSIFICATION_MATRIX.md — full inventory with risk and target | Claude | GOV-002 |
| 2026-05-31 | MIGRATION_PLAN.md — 3-phase migration plan with rollback | Claude | GOV-003 |

---

*Generated: 2026-05-31 | GetUpSoft Repository Memory*
