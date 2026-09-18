# ADR-0003: EasyCount as the Canonical Product Name and Unified Architecture

**Date:** 2026-05-31
**Status:** Accepted
**Authors:** Joel Stalin Martinez Espinal, Architecture Team

---

## Context

The accounting and fiscal compliance product for the Dominican Republic exists under multiple names and paths in the repository:

- `apps/easycount/` — Full stack application (frontend + API)
- `libs/easycount-core/` — Core fiscal library (DGII engine)
- `01_Core_Platform/easycount-core/` — Referenced in inventory as another location
- `01_Core_Platform/Easycouting_Refactor/` — Older refactoring attempt
- References to "EasyCounting" in some documents

This ambiguity causes:
- AI agents unsure which path is canonical
- Risk of parallel development on the same product
- DGII fiscal logic potentially being copied rather than imported from the core library
- Incomplete migration history

A decision was needed to:
1. Establish the single canonical name
2. Define the architectural boundary between the app and the fiscal library
3. Prevent DGII logic from spreading beyond the designated silo

---

## Decision

### Canonical Name

The product is officially named **EasyCount**. All references to "EasyCounting," "easycouting," or "Easycouting_Refactor" are deprecated.

### Canonical Architecture

EasyCount is a **two-layer product**:

**Layer 1 — Fiscal Library (DGII Silo)**
- Path: `libs/easycount-core/`
- Status: CRITICAL — never move
- Responsibility: All Dominican fiscal logic — NCF sequences, ITBIS calculation, RNC validation, e-CF electronic invoicing, DGII API integration
- Rule: This is the ONLY place where DGII fiscal logic may exist. Any other module or product that needs fiscal logic MUST import from `easycount-core` via its public API or SDK. Never copy fiscal logic.

**Layer 2 — Application Platform**
- Path: `apps/easycount/` (canonical)
- Responsibility: UI, API layer, invoice workflow UX, customer management, reports, mail delivery
- Depends on: `libs/easycount-core` (via import), PostgreSQL, SendGrid/Mailcow
- Technology: React frontend + Python API (migrating from FastAPI legacy to NestJS per FastAPI Deprecation Policy)

### Deprecated Paths

| Deprecated Path | Status | Action Required |
|---|---|---|
| `01_Core_Platform/easycount-core/` | Deprecated | Verify if this still exists — consolidate into `libs/easycount-core/` |
| `01_Core_Platform/Easycouting_Refactor/` | Deprecated | Audit content, migrate to `apps/easycount/` or archive |
| References to "EasyCounting" | Deprecated | Update in docs and manifests |

### Long-Term Migration Target

When Phase 3 migration is approved, `apps/easycount/` will move to `02_Products/EasyCount/`. The `libs/easycount-core/` will move to `07_Libraries_Tools/easycount-core/`. Both moves require dedicated sprint planning.

---

## Consequences

### Positive
- Single source of truth for EasyCount naming across all agents and documents
- DGII fiscal silo enforced: no accidental duplication of fiscal logic
- Clear architectural boundary: app layer vs fiscal library
- Reduces confusion for new agents joining the workspace

### Negative
- References in older documents (SESSION_*.md, PHASE_*.md) will still use deprecated names — this is acceptable as historical record
- The `01_Core_Platform/Easycouting_Refactor/` path requires a classification audit before archiving
- Python-to-NestJS migration for the API layer adds complexity to the product's near-term roadmap

### Neutral
- `libs/easycount-core/` stays where it is until Phase 3 — dual names in different layers is expected
- The DGII silo rule from `_Knowledge_Center/KNOWLEDGE_PROTOCOL.md` is now formally backed by this ADR

---

## ISO Reference

- **ISO/IEC/IEEE 42010:2011 §4.6** — Architecture Decisions must record rationale
- **ISO/IEC 12207:2017 §6.2.2** — Business or Mission Analysis Process (product definition)
- **ISO/IEC 25010:2023 §4.8** — Maintainability: Modularity (fiscal silo prevents coupling)
- **ISO/IEC 27001:2022 A.8.12** — Data Leakage Prevention (fiscal logic contained)

---

## Related Decisions

- ADR-0001: Worker-First Monorepo (EasyCount workers must follow worker contract pattern)
- ADR-0002: Domain-Based Repository Layout (canonical migration targets)
- ADR-0004: Odoo Controlled Migration (Odoo DGII modules consume easycount-core via SDK)

---

*GetUpSoft Architecture Decision Record*
