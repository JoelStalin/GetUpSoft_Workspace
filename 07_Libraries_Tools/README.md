# 07_Libraries_Tools — GetUpSoft Workspace

**Domain:** Libraries and Tools
**ISO Reference:** ISO/IEC 25010:2023 §4.8 (Reusability) · ISO/IEC/IEEE 42010:2011 §4.4

This directory contains reusable SDKs, CLI tools, and shared libraries used across multiple products and client solutions.

## Rules

- Libraries MUST have a stable public API and semantic versioning
- Libraries MUST NOT contain client-specific logic
- `easycount-core` is the DGII fiscal silo — all Dominican fiscal logic lives here and NOWHERE ELSE
- Libraries are imported, not copied

## Critical Notice — DGII Silo

`libs/easycount-core/` (current location) is the DGII fiscal silo. It will migrate here in Phase 3.
Until then: **NEVER copy fiscal logic out of `libs/easycount-core/`.**

## Contents (Target)

| Directory | Source | Purpose | Status |
|---|---|---|---|
| `easycount-core/` | `libs/easycount-core/` (target migration) | DGII fiscal engine — NCF, ITBIS, RNC, eCF | CRITICAL — migrate Phase 3 only |
| `traffic-control/` | `libs/traffic_control/` (target migration) | Network traffic control | Pending migration |
| `qr-tools/` | `apps/QR_generetor/` + `apps/web_qr_generetor/` | QR code generation utilities | Phase 1 candidate |
| `nexus/` | `apps/nexus/` | Internal tooling | Phase 1 candidate |

## Governance

See `00_Workspace_Governance/MIGRATION_PLAN.md` for migration phases.
See `_Knowledge_Center/Architecture/ADR/ADR-0003-easycount-canonical-product.md` for DGII silo rules.
