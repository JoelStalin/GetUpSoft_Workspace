# ADR-0004: Odoo ERP — Controlled Migration Policy

**Date:** 2026-05-31
**Status:** Accepted
**Authors:** Joel Stalin Martinez Espinal, Architecture Team

---

## Context

The Odoo ERP directory (`02_Odoo_ERP/`) contains:
- Multiple versions: v15, v16, v17, v18, v19 (active)
- Custom modules: 13 ORCA-integrated modules, DGII localization, ChefAlitas POS
- Business data exports
- Database scripts
- The Odoo Consolidated Library (shared across versions)

The target governance structure renames this domain to `05_ERP_Odoo/`. However, the existing `02_Odoo_ERP/` directory:
1. Contains PostgreSQL database scripts referenced in production Docker Compose files
2. Hosts DGII fiscal modules with RNC/NCF/ITBIS/eCF logic
3. Contains v19 modules under active development (ORCA Audit Mixin refactoring — 43 modules)
4. Has embedded client solutions (ChefAlitas inside `Odoo_Consolidated_Library/v18/Projects/`)
5. May have internal Odoo module paths hardcoded in `__manifest__.py` and model files

Any premature or unplanned move of this directory risks:
- Breaking production ERP for active business operations
- Invalidating DGII fiscal compliance (legal obligation in Dominican Republic)
- Disrupting the active 5-week Odoo v19 ORCA refactoring sprint
- Breaking ChefAlitas client POS configuration

A clear policy was needed to prevent accidental moves while documenting the long-term intent.

---

## Decision

The Odoo ERP directory follows a **Controlled Migration Policy** with the following rules:

### Rule 1: Never Move Without Full Dependency Audit

`02_Odoo_ERP/` and all its subdirectories MUST NOT be moved, renamed, or restructured until:
- A complete import scan is completed (`grep -r "02_Odoo_ERP" .`)
- All Docker Compose volume paths referencing this directory are identified and updated
- All database migration scripts are validated against the new path
- A staging environment full-cycle test passes (install, migrate, run, validate)

### Rule 2: Active Version First

Only after v19 becomes the sole active version (v15-v18 fully archived) may a migration sprint be planned. At that point:
- v15, v16, v17, v18 move to `09_Archives/Odoo_v15-v18/`
- v19 active modules stay in place until full audit

### Rule 3: ChefAlitas Extraction First

The ChefAlitas client solution embedded in `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` MUST be extracted and documented as a standalone Client Solution entry in `03_Client_Solutions/ChefAlitas/` before any ERP migration.

### Rule 4: Target Rename Is Documentation Only

The canonical long-term name for this domain is `05_ERP_Odoo/`. This name exists in governance documentation as the target. The actual directory rename is BLOCKED until all the conditions in Rule 1 are satisfied.

### Rule 5: DGII Modules Are Critical

The Dominican fiscal modules (l10n_do_accounting, l10n_do_pos, l10n_do_rnc_search, etc.) are subject to Dominican Republic tax law. Any modification to these modules requires:
1. Legal review of the change
2. Testing against DGII sandbox (if available)
3. A dedicated commit with reference to the tax rule changed

### Rule 6: Odoo v19 ORCA Refactoring Continues Undisturbed

The active mandate (`V19_COMPLETE_MODULE_REFACTORING_MANDATE.md`) to refactor all 43 Odoo modules with ORCA Audit Mixin continues in the current directory structure. No restructuring during this sprint.

---

## Consequences

### Positive
- Production ERP operations remain stable during restructuring of other domains
- DGII compliance is not disrupted
- ChefAlitas client is not inadvertently broken
- Active v19 ORCA refactoring sprint continues without interruption
- Long-term target is documented and will be executed in a controlled future sprint

### Negative
- The domain mismatch (current: `02_Odoo_ERP/`, target: `05_ERP_Odoo/`) persists for an indefinite period
- Some AI agents may attempt to move the directory if they only read the classification matrix — they must also read this ADR
- ChefAlitas is harder to manage while embedded in the ERP directory

### Neutral
- The ORCA Audit Mixin refactoring adds traceability that will make future migration safer
- Database backup procedures (`05_Backups/`) should cover this directory

---

## ISO Reference

- **ISO/IEC/IEEE 42010:2011 §4.6** — Architecture Decisions with rationale
- **ISO/IEC 12207:2017 §6.9.2** — Maintenance Process (controlled change)
- **ISO/IEC 27001:2022 A.8.10** — Information Deletion (archiving obsolete versions safely)
- **ISO/IEC 25010:2023 §4.6** — Reliability (production availability during maintenance)

---

## Related Decisions

- ADR-0001: Worker-First Monorepo (Odoo is not worker-based — it is ERP domain)
- ADR-0002: Domain-Based Repository Layout (05_ERP_Odoo as target domain)
- ADR-0003: EasyCount Canonical Product (DGII silo relationship with easycount-core)

---

*GetUpSoft Architecture Decision Record*
