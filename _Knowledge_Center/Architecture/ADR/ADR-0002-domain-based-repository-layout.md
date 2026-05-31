# ADR-0002: Domain-Based Repository Layout

**Date:** 2026-05-31
**Status:** Accepted
**Authors:** Joel Stalin Martinez Espinal, Architecture Team

---

## Context

The GetUpSoft monorepo has multiple directory layouts in partial conflict:
- A numbered domain layout (`01_Core_Platform/`, `02_Odoo_ERP/`, `03_AI_Automation/`, etc.) established early
- An `apps/` monorepo layout used for active product development
- Scattered directories at root level (infra/, libs/, archive/, docs/, etc.)
- Some products appear in multiple locations (ORCA in both `apps/orca/` and `03_AI_Automation/orca/`)

The team needed a canonical target layout that:
1. Can be adopted incrementally (not a big-bang migration)
2. Handles the `apps/` monorepo pattern for active development
3. Provides clear domain boundaries aligned with the Worker-First pattern
4. Is maintainable by AI agents without confusion

---

## Decision

The GetUpSoft workspace adopts a **hybrid domain-based layout**:

### Canonical Target Structure

```
00_Workspace_Governance/    — Governance docs, manifests, ISO docs
01_Core_Platform/           — Branding, ops tooling, site infrastructure
02_Products/                — GetUpSoft products (ORCA, EasyCount, GetUpSoftSite)
03_Client_Solutions/        — Client-specific solutions (GalantesJewelry, ChefAlitas)
04_Workers/                 — Autonomous reusable workers
05_ERP_Odoo/                — Odoo ERP (all versions, modules)
06_Infrastructure_Networking/ — Docker, VPN, Nginx, Cloudflare
07_Libraries_Tools/         — SDKs, CLI tools, shared libraries
08_Research_Labs/           — Experiments, POCs, research
09_Archives/                — Obsolete / legacy
_Knowledge_Center/          — Architecture memory, ADRs, agent rules
apps/                       — Active monorepo apps (transitional)
libs/                       — Critical libraries (transitional)
scripts/                    — Workspace automation (keep in place)
```

### Key Rules

1. `apps/` is a **transitional** directory. Over time, contents are migrated to domain directories. New projects start in `apps/` but have a designated canonical domain target.

2. `libs/` is **critical infrastructure** — `libs/easycount-core` is the DGII fiscal silo and MUST NOT be moved without a dedicated ADR and full audit.

3. For any directory with **duplicates** (ORCA in two places, n8n in two places), the canonical path is:
   - ORCA: `apps/orca/` (canonical) — `03_AI_Automation/orca/` is to be merged
   - n8n: resolve duplication before migration
   - GetUpSoft Site: `apps/site/` (canonical) — verify CI/CD

4. **Numbered directories** (`01_-09_`) represent the long-term target domain organization.

5. **No big-bang migration.** All moves follow MIGRATION_PLAN.md phases (Phase 0 → 1 → 2 → 3).

6. **Every folder move requires** a migration_manifest.md entry, updated ADR, and pre/post validation.

---

## Consequences

### Positive
- Clear single source of truth for where each component belongs
- Numbered directories provide natural alphabetical ordering by domain priority
- `_Knowledge_Center/` stays at root for easy agent discovery
- Incremental migration reduces risk
- Agents have unambiguous rules for classifying new code

### Negative
- During transition, some code exists in two valid locations (transitional dual-residency)
- AI agents may become confused if they encounter duplicate paths — must be trained to prefer canonical paths
- Migration requires careful CI/CD path updating

### Neutral
- `apps/` and `libs/` remain valid during the migration period
- The target layout is documented; actual migration happens per sprint planning

---

## ISO Reference

- **ISO/IEC/IEEE 42010:2011 §4.5** — Architecture Views (Domain View)
- **ISO/IEC 12207:2017 §6.3** — Infrastructure Management Process
- **ISO/IEC 12207:2017 §6.9.2** — Maintenance Process

---

## Related Decisions

- ADR-0001: Worker-First Monorepo (defines the domain content model)
- ADR-0003: EasyCount Canonical Product
- ADR-0004: Odoo Controlled Migration
- ADR-0005: Knowledge Center as Architecture Memory

---

*GetUpSoft Architecture Decision Record*
