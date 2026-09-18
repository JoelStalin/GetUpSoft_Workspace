# EPIC: ISO Architecture Governance Documentation

**Epic ID:** EPIC-GOV-001
**Date Opened:** 2026-05-31
**Date Closed:** 2026-05-31
**Status:** COMPLETE
**Owner:** Joel Stalin Martinez Espinal
**Sessions:** 15, 16
**Commits:** c673d87bf5 (Session 15), f918e783c0 (Session 16)

---

## Objective

Generate a complete, ISO-compliant architecture governance documentation set for the GetUpSoft Workspace monorepo — without moving any code or folders.

## Standards Applied

- ISO/IEC/IEEE 42010:2011 — Architecture Description
- ISO/IEC 12207:2017 — Software Life Cycle Processes
- ISO/IEC 25010:2023 — System and Software Quality Models
- ISO/IEC 27001:2022 — Information Security Management

## Deliverables

### 00_Workspace_Governance/
| File | ID | Status |
|---|---|---|
| ARCHITECTURE_GOVERNANCE.md | GOV-001 | DONE |
| REPOSITORY_CLASSIFICATION_MATRIX.md | GOV-002 | DONE |
| MIGRATION_PLAN.md | GOV-003 | DONE |
| ISO_TRACEABILITY_MATRIX.md | GOV-004 | DONE |
| migration_manifest.md (updated with ISO columns) | — | DONE |

### _Knowledge_Center/Architecture/
| File | ID | Status |
|---|---|---|
| ARCHITECTURE_OVERVIEW.md | ARCH-001 | DONE |
| ADR/ADR-0001-worker-first-monorepo.md | — | DONE |
| ADR/ADR-0002-domain-based-repository-layout.md | — | DONE |
| ADR/ADR-0003-easycount-canonical-product.md | — | DONE |
| ADR/ADR-0004-odoo-controlled-migration.md | — | DONE |
| ADR/ADR-0005-knowledge-center-as-architecture-memory.md | — | DONE |

### _Knowledge_Center/Memory/
| File | ID | Status |
|---|---|---|
| REPOSITORY_MEMORY.md | MEM-001 | DONE |
| AGENT_RULES.md | MEM-002 | DONE |
| COMPONENT_CARDS/PRODUCT_CARD_TEMPLATE.md | — | DONE |
| COMPONENT_CARDS/CLIENT_SOLUTION_CARD_TEMPLATE.md | — | DONE |
| COMPONENT_CARDS/WORKER_CARD_TEMPLATE.md | — | DONE |
| COMPONENT_CARDS/ODOO_MODULE_CARD_TEMPLATE.md | — | DONE |
| COMPONENT_CARDS/INFRA_COMPONENT_CARD_TEMPLATE.md | — | DONE |

**Total files delivered: 18 documents**

## Key Decisions Formalized

1. Worker-First Monorepo pattern (ADR-0001)
2. Domain-based numbered directory layout (ADR-0002)
3. EasyCount as sole canonical product name (ADR-0003)
4. Odoo ERP controlled migration — never move without audit (ADR-0004)
5. _Knowledge_Center/ as permanent architecture memory (ADR-0005)
6. FastAPI deprecation — already in FASTAPI_DEPRECATION_POLICY.md, referenced in agent rules

## Classification Result

49 directories inventoried and classified in REPOSITORY_CLASSIFICATION_MATRIX.md:
- Critical (never move): 9 paths
- High risk (ADR required): 12 paths
- Medium risk (sprint required): 14 paths
- Low risk (Phase 1 candidate): 8 paths
- 6 duplication alerts documented

## Next Steps (Future Epics)

- EPIC-GOV-002: Phase 1 Migration — Execute low-risk archive consolidation
- EPIC-GOV-003: Populate 02_Products/ with product cards for ORCA, EasyCount, GetUpSoft Site
- EPIC-GOV-004: Populate 03_Client_Solutions/ with GalantesJewelry and ChefAlitas cards
- EPIC-GOV-005: Resolve ORCA canonical path duplication (apps/orca/ vs 03_AI_Automation/orca/)
- EPIC-GOV-006: Phase 2 Medium-Risk migrations (GalantesJewelry, infra consolidation)
