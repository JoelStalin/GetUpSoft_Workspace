# 02_Products — GetUpSoft Workspace

**Domain:** Products
**ISO Reference:** ISO/IEC 12207:2017 §6.2.2 · ISO/IEC/IEEE 42010:2011 §4.4

This folder is the target architecture area for GetUpSoft-owned products with real end users.

Existing products remain in their current `apps/` paths until `migration_manifest.md` approves a controlled move. This directory will be populated with product cards and eventually the migrated product code.

## Product Registry

| Product | Canonical Name | Current Path | Target Path | Migration Phase | ADR |
|---|---|---|---|---|---|
| ORCA AI Platform | `ORCA` | `apps/orca/` | `02_Products/ORCA/` | Phase 3 | ADR-0001, ADR-0002 |
| Accounting Platform | `EasyCount` | `apps/easycount/` | `02_Products/EasyCount/` | Phase 3 | ADR-0003 |
| Corporate Site | `GetUpSoft Site` | `apps/site/` | `02_Products/GetUpSoftSite/` | Phase 3 | ADR-0002 |
| AI Hub | `GetUpNet` | `_Knowledge_Center/Master_Prompts/GetUpNet/` | TBD — locate impl | Pending classification | — |

## EasyCount Canonical Name

EasyCount and EasyCounting are the same product. The canonical name is **EasyCount**.
- `apps/easycount/` — full stack application (canonical current path)
- `libs/easycount-core/` — DGII fiscal library (NEVER move — see ADR-0003)
- `01_Core_Platform/Easycouting_Refactor/` — deprecated name, to be archived or merged

Do NOT treat `easycount-core` and the application as the same component. They are separate architectural layers.

## ORCA Architecture Note

ORCA exists in two locations:
- `apps/orca/` — **canonical** active development path
- `03_AI_Automation/orca/` — duplicate, to be resolved (merged into apps/orca/)

Do NOT create new ORCA code in `03_AI_Automation/orca/`. Use `apps/orca/` only.

## Rules

- A Product may consume Workers from `04_Workers/`
- A Product must have a Product Card (`_Knowledge_Center/Memory/COMPONENT_CARDS/`) before migration
- Product-specific logic belongs here; reusable logic must be extracted as Workers
- Production secrets must not be committed (use `.env` files)
- HTTP APIs use NestJS (`apps/backend-nest/`) — FastAPI is deprecated

## Governance

See `_Knowledge_Center/Memory/COMPONENT_CARDS/PRODUCT_CARD_TEMPLATE.md` for the card template.
See `00_Workspace_Governance/MIGRATION_PLAN.md` Phase 3 for migration conditions.
