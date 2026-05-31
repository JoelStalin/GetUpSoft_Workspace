# ISO Traceability Matrix — GetUpSoft Workspace

**Document ID:** GOV-004
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** Active
**Standards Covered:** ISO/IEC/IEEE 42010:2011 · ISO/IEC 12207:2017 · ISO/IEC 25010:2023 · ISO/IEC 27001:2022

---

## How to Read This Matrix

- **ISO Standard**: The standard and clause number
- **Requirement / Principle**: What the standard requires
- **Evidence in Repo**: Where this is implemented or documented in the workspace
- **Generated Document**: Which governance document addresses this requirement
- **Status**: Compliant / Partial / Pending

---

## ISO/IEC/IEEE 42010:2011 — Systems and Software Engineering: Architecture Description

| ISO Standard | Requirement / Principle | Evidence in Repo | Generated Document | Status |
|---|---|---|---|---|
| 42010 §4.2 — Architecture Description | AD must identify the system, stakeholders, concerns, viewpoints, and views | ARCHITECTURE_OVERVIEW.md (C4 Level 1/2), ARCHITECTURE_GOVERNANCE.md §4 | `_Knowledge_Center/Architecture/ARCHITECTURE_OVERVIEW.md` | Compliant |
| 42010 §4.3 — Stakeholders and Concerns | Architecture must address stakeholder concerns | ARCHITECTURE_GOVERNANCE.md §4 domain definitions, AGENT_RULES.md roles | `00_Workspace_Governance/ARCHITECTURE_GOVERNANCE.md` | Compliant |
| 42010 §4.4 — Architecture Viewpoints | Use of multiple views (domain, product, infrastructure, worker) | ARCHITECTURE_OVERVIEW.md multi-view Mermaid diagrams | `_Knowledge_Center/Architecture/ARCHITECTURE_OVERVIEW.md` | Compliant |
| 42010 §4.5 — Architecture Views | Each view addresses specific concerns | Domain View, Worker View, Product View, Client View, Infra View in ARCHITECTURE_OVERVIEW.md | `_Knowledge_Center/Architecture/ARCHITECTURE_OVERVIEW.md` | Compliant |
| 42010 §4.6 — Architecture Decisions | AD must record key decisions and rationale | 5 ADRs with context, decision, consequences | `_Knowledge_Center/Architecture/ADR/ADR-0001 to ADR-0005` | Compliant |
| 42010 §4.7 — Rationale | Rationale recorded for each decision | Each ADR has Context + Decision + Consequences sections | `_Knowledge_Center/Architecture/ADR/` | Compliant |
| 42010 §5 — Architecture Framework Compliance | Framework must be consistently applied | ARCHITECTURE_GOVERNANCE.md §5 decision criteria, MIGRATION_PLAN.md phases | `00_Workspace_Governance/ARCHITECTURE_GOVERNANCE.md` | Compliant |

---

## ISO/IEC 12207:2017 — Software Life Cycle Processes

| ISO Standard | Requirement / Principle | Evidence in Repo | Generated Document | Status |
|---|---|---|---|---|
| 12207 §6.2.2 — Business or Mission Analysis Process | Define domain and context of the software system | REPOSITORY_CLASSIFICATION_MATRIX.md, domain definitions | `00_Workspace_Governance/REPOSITORY_CLASSIFICATION_MATRIX.md` | Compliant |
| 12207 §6.3 — Infrastructure Management Process | Define and maintain infrastructure for software lifecycle | MIGRATION_PLAN.md phases, pre/post validation checklists | `00_Workspace_Governance/MIGRATION_PLAN.md` | Compliant |
| 12207 §6.4 — Portfolio Management Process | Manage set of undertakings (products, solutions) | REPOSITORY_CLASSIFICATION_MATRIX.md full inventory | `00_Workspace_Governance/REPOSITORY_CLASSIFICATION_MATRIX.md` | Partial |
| 12207 §6.6 — Supply Process | Client solution delivery management | `03_Client_Solutions/` domain, Client Solution Card Template | `_Knowledge_Center/Memory/COMPONENT_CARDS/CLIENT_SOLUTION_CARD_TEMPLATE.md` | Partial |
| 12207 §6.7 — Requirements Management | Capture and maintain system requirements | task-ledger/EPIC-ORCA-*, V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md | `task-ledger/` (existing) | Partial |
| 12207 §6.8.4 — Architectural Design Process | Define system architecture, components, interfaces | ARCHITECTURE_OVERVIEW.md, ADRs, component cards | `_Knowledge_Center/Architecture/`, `_Knowledge_Center/Memory/COMPONENT_CARDS/` | Compliant |
| 12207 §6.8.6 — Unit Testing Process | Automated tests for all components | apps/orca/tests/, apps/easycount/tests/, apps/backend-nest/test/ | Existing code (no new doc needed) | Partial |
| 12207 §6.8.8 — Integration Testing Process | Integration test evidence stored | task-ledger/evidence/, .claude/evidence/ | Existing (evidence directories) | Partial |
| 12207 §6.9.1 — Operation Process | Deployment and operational procedures | scripts/deploy_*, DEPLOYMENT_*.md files at root | Existing docs | Compliant |
| 12207 §6.9.2 — Maintenance Process | Change management, migration planning | MIGRATION_PLAN.md, migration_manifest.md, CHANGE_TIMELINE.md | `00_Workspace_Governance/MIGRATION_PLAN.md` | Compliant |
| 12207 §7.2.2 — Configuration Management | Version control, change traceability | Git history, migration_manifest.md, ADRs | `00_Workspace_Governance/migration_manifest.md` | Compliant |
| 12207 §7.2.3 — Quality Management | Quality standards and review gates | CLAUDE.md QA checklist, ARCHITECTURE_GOVERNANCE.md P-10 | `CLAUDE.md` (existing), `ARCHITECTURE_GOVERNANCE.md` | Compliant |
| 12207 §7.2.6 — Risk Management | Risk classification for changes | REPOSITORY_CLASSIFICATION_MATRIX.md (Low/Medium/High/Critical) | `00_Workspace_Governance/REPOSITORY_CLASSIFICATION_MATRIX.md` | Compliant |

---

## ISO/IEC 25010:2023 — System and Software Quality Models

| ISO Standard | Requirement / Principle | Evidence in Repo | Generated Document | Status |
|---|---|---|---|---|
| 25010 §4.2 — Functional Suitability | System provides correct and complete functions | EasyCount DGII modules, ORCA workflow features, task-ledger backlogs | Existing code + task-ledger | Partial |
| 25010 §4.3 — Performance Efficiency | System performs adequately under conditions | oo-021-load-test.py, oo-021-metrics.json, ORCA load testing | task-ledger/oo-021-* (existing) | Partial |
| 25010 §4.4 — Compatibility | Co-existence and interoperability | backend-nest NestJS API, ORCA client gateway bridge, n8n integration | Existing architecture | Partial |
| 25010 §4.5 — Interaction Capability (Usability) | QA UI/UX rules, WCAG AA accessibility | CLAUDE.md QA checklist, qa_ui_ux_mandatory_rules.md, ACCESSIBILITY_STATEMENT.md | `.claude/projects/.../memory/qa_ui_ux_mandatory_rules.md` (existing) | Compliant |
| 25010 §4.6 — Reliability | Fault tolerance, recoverability | SSH_RECOVERY_GUIDE.md, CONTAINER_REMEDIATION_GUIDE.md, orca retry patterns | Existing docs | Partial |
| 25010 §4.7 — Security | Confidentiality, integrity, authenticity | ARCHITECTURE_GOVERNANCE.md P-08, AGENT_RULES.md §4, .gitignore patterns | `_Knowledge_Center/Memory/AGENT_RULES.md`, `ARCHITECTURE_GOVERNANCE.md` | Compliant |
| 25010 §4.8 — Maintainability | Modifiability, reusability, testability | Worker-First Architecture, domain isolation, ADRs | `_Knowledge_Center/Architecture/WORKER_FIRST_ARCHITECTURE.md` (existing), ADRs | Compliant |
| 25010 §4.9 — Flexibility | Adaptability, installability, scalability | Hexagonal architecture, Docker Compose, ORCA model-agnostic design | ARCHITECTURE_OVERVIEW.md, ADR-0001 | Compliant |

---

## ISO/IEC 27001:2022 — Information Security Management

| ISO Standard | Requirement / Principle | Evidence in Repo | Generated Document | Status |
|---|---|---|---|---|
| 27001 A.5.1 — Information Security Policies | Security policies documented | ARCHITECTURE_GOVERNANCE.md P-08 (no secrets in code), AGENT_RULES.md §4 | `_Knowledge_Center/Memory/AGENT_RULES.md` | Compliant |
| 27001 A.5.9 — Inventory of Assets | Inventory of all information assets | REPOSITORY_CLASSIFICATION_MATRIX.md, workspace_inventory.md | `00_Workspace_Governance/REPOSITORY_CLASSIFICATION_MATRIX.md` | Compliant |
| 27001 A.5.10 — Acceptable Use of Assets | Rules for acceptable use | AGENT_RULES.md — agent restrictions and prohibited actions | `_Knowledge_Center/Memory/AGENT_RULES.md` | Compliant |
| 27001 A.5.15 — Access Control | Access rules for different roles | Odoo access control (ir.model.access.csv), ORCA audit logging | Odoo modules (existing) | Partial |
| 27001 A.8.3 — Information Access Restriction | Restrict access based on policy | ORCA audit mixin (read-only accountants, full manager), AGENT_RULES.md | `_Knowledge_Center/Memory/AGENT_RULES.md`, ODOO modules | Partial |
| 27001 A.8.10 — Information Deletion | Secure deletion of obsolete data | Archive policy in MIGRATION_PLAN.md (09_Archives), AGENT_RULES.md | `00_Workspace_Governance/MIGRATION_PLAN.md` | Partial |
| 27001 A.8.12 — Data Leakage Prevention | Prevent unauthorized data exposure | .gitignore (secrets), .env.example pattern, AGENT_RULES.md §4 | `_Knowledge_Center/Memory/AGENT_RULES.md` | Compliant |
| 27001 A.8.25 — Secure Development Lifecycle | Security integrated into development | CLAUDE.md mandatory rules, FASTAPI_DEPRECATION_POLICY.md, code review gates | `00_Workspace_Governance/FASTAPI_DEPRECATION_POLICY.md` (existing) | Compliant |

---

## Compliance Gap Summary

| Domain | Compliant | Partial | Pending |
|---|---|---|---|
| ISO 42010 (Architecture) | 7 | 0 | 0 |
| ISO 12207 (Lifecycle) | 6 | 7 | 0 |
| ISO 25010 (Quality) | 4 | 4 | 0 |
| ISO 27001 (Security) | 5 | 3 | 0 |
| **Total** | **22** | **14** | **0** |

### Priority Actions for Partial Items

1. Complete portfolio management: populate `02_Products/` and `03_Client_Solutions/` with product cards
2. Complete requirements management: link task-ledger epics to classification matrix
3. Complete integration testing: ensure evidence directories are populated after test runs
4. Complete access control: document Cloudflare Zero Trust policies in `06_Infrastructure_Networking/`

---

*Generated: 2026-05-31 | GetUpSoft ISO Traceability Matrix*
