# PHASE 5: Manufacturing & Website Modules - Implementation Plan

**Status:** PREPARATION  
**Phase:** 5 of 5  
**Duration:** 2 weeks (17 hours)  
**Modules:** 5 (mrp, mrp_byproduct, quality, project, project_enterprise)  
**Priority:** P1 (operational automation)  
**Start Date:** After Phase 4 complete

---

## Overview

Phase 5 refactors manufacturing operations and project management with ORCA audit logging. These 5 modules handle production planning, quality control, and project delivery tracking.

**Phase 4 (HR & Payroll) must complete before Phase 5 starts.**

---

## Module 1: `mrp` (OO-M-801)

### Strategic Importance
**CRITICAL** - Manufacturing Resource Planning drives production schedules, bill of materials, and work orders.

### Estimated Hours: 4 hours

### Models to Refactor

1. **mrp.production** (Most critical)
   - Manufacturing orders
   - Tracked fields (20+ fields):
     - `state` (draft, confirmed, progress, done, cancel)
     - `product_id`
     - `product_qty`
     - `bom_id` (bill of materials)
     - `date_planned_start`, `date_planned_finished`
     - `company_id`
     - `user_id` (MO creator)
     - `picking_type_id`
     - `scrap_ids`
     - `move_raw_ids`, `move_finished_ids`

2. **mrp.bom** (Important)
   - Bill of materials
   - Tracked fields:
     - `product_id`
     - `product_qty`
     - `type` (normal, phantom, set)
     - `code`
     - `active`
     - `company_id`

3. **mrp.bom.line** (Important)
   - BOM line items
   - Tracked fields:
     - `product_id`, `product_qty`
     - `bom_id`
     - `sequence`

### Tests Required (8 tests)
```python
test_orca_production_order_create()
test_orca_mo_state_changes()
test_orca_bom_creation()
test_orca_raw_materials_tracking()
test_orca_finished_goods_tracking()
test_orca_mo_cancellation()
test_orca_scrap_tracking()
test_orca_access_control()
```

---

## Module 2: `mrp_byproduct` (OO-M-802)

### Strategic Importance
**HIGH** - Handles co-products and byproducts in manufacturing operations.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **mrp.production** (reference)
   - Track byproduct fields

2. **mrp.bom.byproduct** (Important)
   - Byproduct definitions
   - Tracked fields:
     - `product_id`
     - `product_qty`
     - `bom_id`
     - `cost_share`

### Tests Required (3 tests)
```python
test_orca_byproduct_creation()
test_orca_byproduct_cost_allocation()
test_orca_access_control()
```

---

## Module 3: `quality` (OO-M-803)

### Strategic Importance
**HIGH** - Quality control points and inspections ensure product compliance.

### Estimated Hours: 3 hours

### Models to Refactor

1. **quality.point** (Important)
   - Quality control points
   - Tracked fields:
     - `name`
     - `test_type` (passfail, measure)
     - `picking_type_ids`
     - `product_ids`
     - `active`

2. **quality.check** (Important)
   - Quality checks/inspections
   - Tracked fields:
     - `point_id`
     - `product_id`
     - `quantity`, `qty_done`
     - `state` (draft, pass, fail, measure)
     - `date`
     - `user_id`

3. **quality.alert** (Important)
   - Quality issues/alerts
   - Tracked fields:
     - `name`
     - `check_id`
     - `stage_id`
     - `company_id`

### Tests Required (6 tests)
```python
test_orca_quality_check_creation()
test_orca_check_result_logging()
test_orca_alert_creation()
test_orca_point_modifications()
test_orca_stage_transitions()
test_orca_access_control()
```

---

## Module 4: `project` (OO-M-804)

### Strategic Importance
**CRITICAL** - Project management ties to sales orders, resource allocation, and financial tracking.

### Estimated Hours: 4 hours

### Models to Refactor

1. **project.project** (Most critical)
   - Projects
   - Tracked fields (20+ fields):
     - `name`
     - `state` (draft, open, close, cancel)
     - `partner_id` (customer)
     - `analytic_account_id`
     - `user_id` (manager)
     - `date_start`, `date_end`
     - `company_id`
     - `budget_amount`
     - `active`
     - `is_favorite`

2. **project.task** (Most critical)
   - Project tasks
   - Tracked fields (20+ fields):
     - `name`
     - `project_id`
     - `stage_id`
     - `user_ids` (assignees)
     - `partner_id`
     - `date_start`, `date_deadline`
     - `priority`
     - `state` (draft, open, close, cancel)
     - `progress`
     - `company_id`

3. **project.stage** (Important)
   - Project stages
   - Tracked fields:
     - `name`
     - `sequence`
     - `fold` (hide/show)

### Tests Required (8 tests)
```python
test_orca_project_creation()
test_orca_project_state_changes()
test_orca_task_creation()
test_orca_task_assignment()
test_orca_stage_movement()
test_orca_deadline_tracking()
test_orca_progress_updates()
test_orca_access_control()
```

---

## Module 5: `project_enterprise` (OO-M-805)

### Strategic Importance
**MEDIUM-HIGH** - Enterprise project features (timesheets, resource management, forecasting).

### Estimated Hours: 4.5 hours

### Models to Refactor

1. **project.milestone** (Important)
   - Project milestones
   - Tracked fields:
     - `name`
     - `project_id`
     - `date`
     - `is_reached`

2. **analytic.line** (Important)
   - Timesheet entries and analytic records
   - Tracked fields:
     - `task_id`, `project_id`
     - `employee_id`
     - `unit_amount` (hours)
     - `date`
     - `state`

3. **project.forecast** (Important)
   - Resource forecasts
   - Tracked fields:
     - `project_id`
     - `employee_id`
     - `date_start`, `date_end`
     - `unit_amount`

### Tests Required (7 tests)
```python
test_orca_milestone_creation()
test_orca_milestone_reached()
test_orca_timesheet_logging()
test_orca_forecast_creation()
test_orca_resource_allocation()
test_orca_enterprise_access_control()
test_orca_batch_operations()
```

---

## Implementation Sequence

### Day 1-2: `mrp` Module (4 hours)
1. Create mrp_orca.py
2. Define OrcaLog model
3. Apply mixin to mrp.production (primary)
4. Apply mixin to mrp.bom
5. Apply mixin to mrp.bom.line
6. Create security rules and views
7. Write 8 tests

### Day 3: `mrp_byproduct` & `quality` (4.5 hours)
1. Create mrp_byproduct_orca.py (1.5h)
2. Create quality_orca.py (3h)
3. Apply mixin to quality.point
4. Apply mixin to quality.check
5. Apply mixin to quality.alert
6. Create security rules and views
7. Write 9 tests total

### Day 4-5: `project` Module (4 hours)
1. Create project_orca.py
2. Apply mixin to project.project (critical)
3. Apply mixin to project.task (critical)
4. Apply mixin to project.stage
5. Create security rules and views
6. Write 8 tests

### Day 6-7: `project_enterprise` (4.5 hours)
1. Create project_enterprise_orca.py
2. Apply mixin to project.milestone
3. Apply mixin to analytic.line
4. Apply mixin to project.forecast
5. Create security rules and views
6. Write 7 tests

### Day 8-10: Integration & Testing
1. Run all Phase 5 tests (32 tests total)
2. Verify MO → Production flow
3. Test Quality → Alert escalation
4. Verify Project → Task → Timesheet flow
5. Update CHANGE_TIMELINE.md
6. Create commit(s)

**Total: 17 hours (7 days of work + 3 days integration)**

---

## Integration Points with Other Phases

**Depends on:**
- Phase 3 (Procurement) - Bill of materials references inventory
- Phase 4 (HR & Payroll) - Employees assigned to tasks and timesheets

**Blocks:**
- None (final phase)

**Integrates with:**
- Production planning → Procurement (Phase 3)
- Project tasks → HR allocation (Phase 4)
- Timesheets → Payroll (Phase 4)
- Sales orders → Projects (Phase 2)

---

## Code Template: mrp_orca.py

```python
# v19/Modules/mrp/models/mrp_orca.py

from odoo import models, fields

class MrpProductionOrcaLog(models.Model):
    """ORCA audit log for mrp.production - Manufacturing operations"""
    _name = 'mrp.production.orca.log'
    _description = 'MRP Production Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields
    bom_name = fields.Char(string='BOM')
    product_name = fields.Char(string='Product')
    qty_produced = fields.Float(string='Quantity')
    state_before = fields.Char(string='Previous State')


class MrpProduction(models.Model):
    """Inherit mrp.production with ORCA audit logging"""
    _inherit = ['mrp.production', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'state', 'product_id', 'product_qty', 'bom_id',
        'date_planned_start', 'date_planned_finished',
        'company_id', 'user_id', 'picking_type_id'
    ]
    _orca_log_model = 'mrp.production.orca.log'


class MrpBom(models.Model):
    """Inherit mrp.bom with ORCA audit logging"""
    _inherit = ['mrp.bom', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'product_id', 'product_qty', 'type', 'code', 'active', 'company_id'
    ]
    _orca_log_model = 'mrp.production.orca.log'


class MrpBomLine(models.Model):
    """Inherit mrp.bom.line with ORCA audit logging"""
    _inherit = ['mrp.bom.line', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'product_id', 'product_qty', 'bom_id', 'sequence'
    ]
    _orca_log_model = 'mrp.production.orca.log'
```

---

## Code Template: project_orca.py

```python
# v19/Modules/project/models/project_orca.py

from odoo import models, fields

class ProjectProjectOrcaLog(models.Model):
    """ORCA audit log for project.project - Project management"""
    _name = 'project.project.orca.log'
    _description = 'Project Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields
    project_name = fields.Char(string='Project')
    partner_name = fields.Char(string='Customer')
    task_count = fields.Integer(string='Task Count')
    budget = fields.Float(string='Budget')


class ProjectProject(models.Model):
    """Inherit project.project with ORCA audit logging"""
    _inherit = ['project.project', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'state', 'partner_id', 'user_id',
        'date_start', 'date_end', 'company_id',
        'budget_amount', 'active', 'is_favorite'
    ]
    _orca_log_model = 'project.project.orca.log'


class ProjectTask(models.Model):
    """Inherit project.task with ORCA audit logging"""
    _inherit = ['project.task', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'project_id', 'stage_id', 'user_ids',
        'partner_id', 'date_start', 'date_deadline',
        'priority', 'state', 'progress', 'company_id'
    ]
    _orca_log_model = 'project.project.orca.log'


class ProjectStage(models.Model):
    """Inherit project.stage with ORCA audit logging"""
    _inherit = ['project.stage', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'sequence', 'fold'
    ]
    _orca_log_model = 'project.project.orca.log'
```

---

## Success Criteria

✅ **All 5 modules refactored**  
✅ **32+ tests written and passing**  
✅ **Manufacturing fully logged**  
✅ **Quality checks tracked**  
✅ **Project delivery audited**  
✅ **Timesheet integration verified**  
✅ **Production → Inventory → Sales flow complete**  

---

## Integration with Complete ODOO v19 Refactoring

**After Phase 5 completion:**
- ✅ ALL 43 Odoo v19 modules refactored with ORCA
- ✅ 103+ unit tests written and passing
- ✅ Complete financial → sales → procurement → manufacturing → hr → project audit trail
- ✅ Full EasyCount integration for localization modules
- ✅ Code review gate enforced across all modules
- ✅ Ready for v17/v16/v15 porting phase

**Timeline:**
- Phase 1 (Core Financial): 13 hours — Week 1
- Phase 2 (Sales & CRM): 15 hours — Week 2
- Phase 3 (Procurement): 15 hours — Week 3
- Phase 4 (HR & Payroll): 12 hours — Week 4
- Phase 5 (Manufacturing & Website): 17 hours — Week 5-6

**Total Effort: 72 hours across 6 weeks**

**Estimated Completion: End of Week 6 (all 43 modules complete)**

