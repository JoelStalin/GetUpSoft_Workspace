# Architecture Governance — GetUpSoft Workspace

**Document ID:** GOV-001
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal (CEO, GetUpSoft)
**Status:** Active
**ISO References:** ISO/IEC/IEEE 42010:2011 · ISO/IEC 12207:2017 · ISO/IEC 25010:2023 · ISO/IEC 27001:2022

---

## 1. Purpose

This document establishes the authoritative architecture governance framework for the GetUpSoft Workspace monorepo. It defines the principles, rules, domain boundaries, and decision criteria that all agents (human and AI) must follow when operating within this repository.

All changes to repository structure, domain boundaries, or architectural decisions require traceability through an ADR (Architecture Decision Record) stored in `_Knowledge_Center/Architecture/ADR/`.

---

## 2. ISO Standards Applied

| Standard | Title | Application in this Workspace |
|---|---|---|
| ISO/IEC/IEEE 42010:2011 | Systems and Software Engineering — Architecture Description | Architecture views, viewpoints, ADR format, ARCHITECTURE_OVERVIEW.md |
| ISO/IEC 12207:2017 | Software Life Cycle Processes | Process definitions, lifecycle stages, migration planning |
| ISO/IEC 25010:2023 | System and Software Quality Models | Quality attributes in domain rules, non-functional requirements |
| ISO/IEC 27001:2022 | Information Security Management | Secret management rules, access control, agent security rules |

---

## 3. Architecture Principles

### P-01 Worker-First Decomposition
Reusable technical logic MUST be extracted into autonomous `Workers` with explicit contracts before being embedded in Products or Client Solutions. Workers must be stateless, idempotent, and independently deployable.
> Rationale: Reduces coupling, enables reuse across multiple domains.

### P-02 Domain Isolation
Each domain directory (02_Products, 03_Client_Solutions, etc.) is a bounded context. Code from one domain MUST NOT directly import internal modules from another domain. All cross-domain interaction MUST happen through declared contracts (APIs, SDKs, worker interfaces).
> Rationale: Prevents dependency spaghetti, enables independent evolution.

### P-03 Canonical Product Names
Every GetUpSoft product has a single canonical name. Duplicate or renamed versions of the same product MUST converge. Known canonical names:
- `EasyCount` (not EasyCounting, not Easycouting_Refactor)
- `ORCA` (not orca-agent, not orchestrator)
- `GetUpSoft Site` (not getupsoft-site, not corporate-site)
> Rationale: Eliminates ambiguity, supports ISO 12207 naming conventions.

### P-04 ERP Controlled Migration
The Odoo ERP directory (`02_Odoo_ERP/`) contains critical business data, multi-version module libraries, and DGII fiscal logic. It MUST NOT be moved or refactored without a full dependency audit and an approved ADR.
> Rationale: ERP downtime has direct financial and regulatory impact.

### P-05 Knowledge Center as Architecture Memory
All architectural decisions, agent rules, product cards, and long-term memory are stored in `_Knowledge_Center/`. This directory is the single source of truth for AI agents and human developers.
> Rationale: Prevents knowledge loss between sessions, supports agent continuity.

### P-06 NestJS as Primary HTTP Framework
FastAPI HTTP services are DISCONTINUED as of 2026-05-25. All new HTTP APIs MUST use NestJS (`apps/backend-nest/`). Python tooling and CLI scripts remain valid for non-HTTP workloads.
> Rationale: Documented in FASTAPI_DEPRECATION_POLICY.md, enforced as code review gate.

### P-07 DGII Fiscal Logic Silo
All Dominican fiscal logic (DGII, NCF, RNC, ITBIS) resides exclusively in `libs/easycount-core/`. Other products and solutions MUST interact with it through the EasyCount SDK or API, never by copying fiscal logic.
> Rationale: Regulatory compliance, single point of maintenance.

### P-08 No Secrets in Code
All secrets, credentials, and environment-specific values MUST be injected via environment variables (`.env` files) or secrets management systems. No hardcoded credentials anywhere in the repository.
> ISO 27001:2022 Control A.8.10

### P-09 Agent-Safe Repository
All AI agents (Claude, Codex, ORCA, Gemini, Copilot) MUST read `_Knowledge_Center/Memory/AGENT_RULES.md` before modifying any domain. No structural changes without updating the manifest and an ADR.

### P-10 Evidence-Based Validation
Functional tests must produce real evidence (screenshots, test reports, logs) stored in `.claude/evidence/` or `task-ledger/evidence/`. Fake or generated evidence is prohibited.

---

## 4. Domain Definitions

| Domain Code | Directory | Description | Owner Role |
|---|---|---|---|
| GOV | `00_Workspace_Governance/` | Governance rules, migration manifests, inventories, classification matrices | Architecture Lead |
| CORE | `01_Core_Platform/` | Core platform infrastructure: site, ops, mail, branding | Platform Lead |
| PROD | `02_Products/` | GetUpSoft-owned products with end users | Product Leads |
| CLIENT | `03_Client_Solutions/` | Solutions built for external clients | Client Delivery Lead |
| WORKER | `04_Workers/` | Autonomous reusable workers with explicit contracts | Engineering Lead |
| ERP | `02_Odoo_ERP/` (target: `05_ERP_Odoo/`) | Odoo ERP — all versions, modules, customizations | ERP Lead |
| INFRA | `06_Infrastructure_Networking/` (current: `infra/`, `01_Core_Platform/infrastructure/`) | Docker, VPN, Nginx, Cloudflare, networking | DevOps Lead |
| LIB | `07_Libraries_Tools/` (current: `libs/`) | Reusable SDKs, CLI tools, shared libraries | Engineering Lead |
| LAB | `08_Research_Labs/` (current: `03_AI_Automation/research/`, notebooks) | Experiments, POCs, research projects | R&D Lead |
| ARCH | `09_Archives/` (current: `04_Archive_Legacy/`, `archive/`) | Obsolete, replaced, or mothballed projects | Any |
| KNOW | `_Knowledge_Center/` | Architecture memory, agent rules, prompts, ADRs | All Agents |

---

## 5. Decision Criteria for Domain Classification

To classify any folder, answer these questions in order:

1. **Is it a GetUpSoft product with defined end users?** → `02_Products/`
2. **Is it built for a specific named external client?** → `03_Client_Solutions/`
3. **Is it a reusable autonomous component with a defined input/output contract?** → `04_Workers/`
4. **Is it Odoo ERP — any version or module?** → `02_Odoo_ERP/` (do NOT move without ADR)
5. **Is it Docker, VPN, Nginx, Cloudflare, or networking?** → `06_Infrastructure_Networking/`
6. **Is it a reusable SDK, CLI, or shared library?** → `07_Libraries_Tools/`
7. **Is it an experiment, POC, or research project?** → `08_Research_Labs/`
8. **Is it obsolete, replaced, or no longer maintained?** → `09_Archives/`
9. **Is it documentation, memory, prompts, or ADRs?** → `_Knowledge_Center/`
10. **Is it workspace-level infrastructure/tooling/scripts?** → `01_Core_Platform/` or `00_Workspace_Governance/`

---

## 6. Risk Classification for Migrations

| Risk Level | Criteria | Action |
|---|---|---|
| Low | Doc-only, no imports, no CI/CD references | Can move after updating manifest |
| Medium | Used by 1-2 known consumers, paths resolvable | Move only after impact matrix approved |
| High | Critical path, multiple consumers, Docker volumes, CI references | Document only, create ADR, plan migration sprint |
| Critical | Production databases, fiscal logic, live services | NEVER move. Document target state in ADR only |

---

## 7. Criteria for Folder Moves

Before recommending or performing ANY folder move:

1. Run import/dependency scan (`grep -r "from <path>"` across repo)
2. Check Docker Compose volumes and build contexts
3. Check GitHub Actions workflow references
4. Check scripts/ for hardcoded paths
5. Create impact matrix (see MIGRATION_PLAN.md)
6. Classify risk (Low/Medium/High/Critical)
7. If High or Critical: document target state only — do NOT move
8. Create or update ADR
9. Update migration_manifest.md with new entry
10. After move: update all references, validate CI, validate Docker builds

---

## 8. Review and Update Schedule

This document must be reviewed:
- When a new domain is added to the repository
- When a product reaches production
- When a client engagement begins or ends
- When a new ISO standard version is adopted
- At the start of each quarterly architecture review

**Next scheduled review:** 2026-08-31

---

*Generated: 2026-05-31 | GetUpSoft Workspace Architecture Governance*
