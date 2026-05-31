# 03_Client_Solutions — GetUpSoft Workspace

**Domain:** Client Solutions
**ISO Reference:** ISO/IEC 12207:2017 §6.6 · ISO/IEC/IEEE 42010:2011 §4.4

This folder is the target architecture area for solutions built by GetUpSoft for named external clients.

Existing client projects remain in their current paths until `migration_manifest.md` approves a controlled move. This directory will be populated with client solution cards and eventually the migrated solution code.

## Client Solution Registry

| Client | Short Name | Current Path | Target Path | Migration Phase | Status |
|---|---|---|---|---|---|
| Galantes Jewelry | `GalantesJewelry` | `06_E_Commerce_Lux/Galantesjewelry/` | `03_Client_Solutions/GalantesJewelry/` | Phase 2 | Active — do not move yet |
| Chef Alitas | `ChefAlitas` | `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` | `03_Client_Solutions/ChefAlitas/` | Phase 2 (after ERP audit) | Active — extract from ERP first |

## Client Solution Rules

- A Client Solution may consume GetUpSoft Products (ORCA, EasyCount)
- A Client Solution may consume Workers from `04_Workers/`
- A Client Solution may include client-specific adapters and configuration — but NOT copy generic worker logic
- Client-specific credentials MUST NOT be committed (use `.env` files)
- Each client solution MUST have a Client Solution Card before migration — see `_Knowledge_Center/Memory/COMPONENT_CARDS/CLIENT_SOLUTION_CARD_TEMPLATE.md`
- Client data and backups belong in `05_Backups/` or client-managed storage — NOT in this directory

## ChefAlitas Special Note

ChefAlitas is embedded inside `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/`. It also has a related printer integration (`03_AI_Automation/local_printer_agent/` and `apps/local_printer_agent/`). Extraction requires:
1. ERP module audit (ADR-0004 conditions)
2. Printer worker audit (separate from ChefAlitas-specific config)
3. Client Solution Card completed first

## Governance

See `_Knowledge_Center/Memory/COMPONENT_CARDS/CLIENT_SOLUTION_CARD_TEMPLATE.md` for card template.
See `00_Workspace_Governance/MIGRATION_PLAN.md` Phase 2 for migration conditions.
See `_Knowledge_Center/Architecture/ADR/ADR-0004-odoo-controlled-migration.md` for ChefAlitas ERP constraint.
