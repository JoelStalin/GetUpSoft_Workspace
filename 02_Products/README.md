# Products

This folder is the target architecture area for GetUpSoft-owned products.

Existing products remain in their current paths until `migration_manifest.md` approves a controlled move.

## Known products

- GetUpNet
- EasyCount (canonical name — consolidates easycount-core/ and Easycouting_Refactor/)
- ORCA
- AIHub
- GetUpSoft Site / Product Catalog

## EasyCount unification note

EasyCount and EasyCounting are the same product. The canonical name is EasyCount.
The folders `easycount-core/` and `Easycouting_Refactor/` both belong to this product
and must be consolidated under `02_Products/EasyCount/` in a future controlled migration,
pending dependency audit. Do not treat them as separate products.

## Rules

- A Product may consume Workers.
- A Product must have a Product Card before migration.
- Product-specific logic belongs here.
- Reusable automation should be extracted as Workers.
- Production secrets must not be committed.
