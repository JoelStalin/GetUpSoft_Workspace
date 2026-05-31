# Odoo Module Card Template

**Template Version:** 1.0
**ISO Reference:** ISO/IEC 12207:2017 §6.8.4 · ISO/IEC 27001:2022 A.5.9

---

<!-- INSTRUCTIONS: Copy this template and rename as ODOO_MODULE_CARD_[MODULE_NAME].md -->
<!-- MANDATORY: All Odoo v19 modules must have ORCA Audit Mixin per V19_COMPLETE_MODULE_REFACTORING_MANDATE.md -->

---

# Odoo Module Card: [MODULE TECHNICAL NAME]

**Card ID:** ERP-[XXX]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Status:** [ ] Draft | [ ] Development | [ ] Active | [ ] Deprecated
**Owner:** [Name]
**Domain:** `02_Odoo_ERP/`
**Backlog ID:** OO-[XXX]

---

## 1. Identity

| Field | Value |
|---|---|
| Technical Name | `[module_technical_name]` |
| Display Name | [Human-readable name] |
| Odoo Version(s) | [ ] v15 | [ ] v16 | [ ] v17 | [ ] v18 | [ ] v19 |
| Module Type | [ ] Core extension | [ ] Custom | [ ] Localization | [ ] Integration |
| Path | `02_Odoo_ERP/Odoo_Enterprise_v[XX]/[module_name]/` |
| Author | GetUpSoft |
| License | LGPL-3 |

---

## 2. Description

### Purpose
[What business function this module provides]

### DGII Compliance
| Field | Value |
|---|---|
| Contains DGII fiscal logic | [ ] Yes | [ ] No |
| If yes — logic location | `libs/easycount-core/` ONLY — never here |
| Validates NCF | [ ] Yes | [ ] No |
| Validates RNC | [ ] Yes | [ ] No |
| Handles e-CF | [ ] Yes | [ ] No |

> CRITICAL: If this module has DGII logic outside easycount-core, it MUST be refactored immediately.

---

## 3. ORCA Integration Status

**MANDATORY for all v19 modules per V19_COMPLETE_MODULE_REFACTORING_MANDATE.md**

| Requirement | Status |
|---|---|
| Inherits from `OrcaAuditMixin` | [ ] Yes | [ ] No | [ ] N/A |
| `_orca_tracked_fields` defined | [ ] Yes | [ ] No |
| `_orca_log_model` specified | [ ] Yes | [ ] No |
| OrcaLog model created | [ ] Yes | [ ] No |
| Field snapshots captured (before/after JSON) | [ ] Yes | [ ] No |
| Access control (accountants read-only, managers full) | [ ] Yes | [ ] No |
| 5+ unit tests proving ORCA logging | [ ] Yes | [ ] No |
| Audit log views (list + form) in UI | [ ] Yes | [ ] No |

### Tracked Models
| Model | Technical Name | Tracked Fields (CRITICAL) | Tracked Fields (HIGH) |
|---|---|---|---|
| [Display name] | `[module.model]` | [field1, field2] | [field3, field4] |

---

## 4. Module Dependencies

| Dependency | Type | Version |
|---|---|---|
| `base_orca_integration` | Required (ORCA) | v19 |
| `[other module]` | [Required/Optional] | [version] |

---

## 5. Models

| Model | Technical Name | Description |
|---|---|---|
| [Display] | `[technical.name]` | [What it stores] |

---

## 6. Security Rules

| Rule | File | Groups |
|---|---|---|
| Audit log access | `security/ir.model.access.csv` | Accountant: read | Manager: full |
| Model access | `security/ir.model.access.csv` | [List groups] |

---

## 7. Views Created

| View | Type | File |
|---|---|---|
| [Model] Audit Logs | List | `views/[name]_log_views.xml` |
| [Model] Audit Log | Form | `views/[name]_log_views.xml` |
| [Other views] | [Type] | [File] |

---

## 8. Test Coverage

| Test | File | Status |
|---|---|---|
| Create log on record creation | `tests/test_orca_logging.py` | [ ] Pass |
| Create log on field update | `tests/test_orca_logging.py` | [ ] Pass |
| Create log on record deletion | `tests/test_orca_logging.py` | [ ] Pass |
| Accountant cannot modify logs | `tests/test_orca_logging.py` | [ ] Pass |
| Manager can access logs | `tests/test_orca_logging.py` | [ ] Pass |

---

## 9. Migration Notes

| Field | Value |
|---|---|
| Migrated from version | [v15/v16/v17/v18 or New] |
| Data migration script | [path or N/A] |
| Known breaking changes | [list or None] |

---

## 10. Change Log

| Date | Change | Author | Backlog ID |
|---|---|---|---|
| YYYY-MM-DD | Card created | [Name] | OO-[XXX] |

---

*GetUpSoft Odoo Module Card Template v1.0 — V19 ORCA Mandate Compliant*
