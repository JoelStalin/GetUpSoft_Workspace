# PHASE 1: Code Templates - Ready for Implementation

**Status:** Template library prepared  
**Use:** Copy these templates when implementing each Phase 1 module  
**Format:** Python (Odoo 19)

---

## Template 1: ORCA Log Model

```python
# Copy this to models/<module>_orca.py for each Phase 1 module

from odoo import models, fields

class [Module]OrcaLog(models.Model):
    """ORCA audit log for [module]"""
    _name = '[module].orca.log'
    _description = '[Module] Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields (optional - add if needed)
    # Example:
    # partner_name = fields.Char(string='Partner Name')
    # amount = fields.Float(string='Amount')
    # state_before = fields.Char(string='Previous State')
```

---

## Template 2: Model with ORCA Mixin

```python
# Copy this for each model to be tracked

from odoo import models

class [ModelName](models.Model):
    """Inherit [model_name] with ORCA audit logging"""
    _inherit = ['[model_name]', 'orca.audit.mixin']
    
    # List of fields to capture in ORCA logs
    _orca_tracked_fields = [
        'field1', 'field2', 'field3',      # CRITICAL tier
        'field4', 'field5', 'field6',      # HIGH tier
    ]
    
    # Reference to the ORCA log model
    _orca_log_model = '[module].orca.log'
```

---

## Template 3: Security Rules (ir.model.access.csv)

```csv
# Add these lines to security/ir.model.access.csv for each module

id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_[module]_orca_log_user,model_[module]_orca_log_user,model_[module]_orca_log,base.group_user,1,0,0,0
access_[module]_orca_log_accountant,model_[module]_orca_log_accountant,model_[module]_orca_log,account.group_account_user,1,0,0,0
access_[module]_orca_log_manager,model_[module]_orca_log_manager,model_[module]_orca_log,account.group_account_manager,1,1,1,0
```

---

## Template 4: Views (XML)

```xml
<!-- Create file: views/[module]_orca_log_views.xml -->

<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- List View -->
    <record id="view_[module]_orca_log_tree" model="ir.ui.view">
        <field name="name">[Module] ORCA Log - List</field>
        <field name="model">[module].orca.log</field>
        <field name="arch" type="xml">
            <tree string="[Module] Audit Logs">
                <field name="date" />
                <field name="user_id" />
                <field name="action" />
                <field name="model_name" />
                <field name="record_id" />
            </tree>
        </field>
    </record>

    <!-- Form View -->
    <record id="view_[module]_orca_log_form" model="ir.ui.view">
        <field name="name">[Module] ORCA Log - Detail</field>
        <field name="model">[module].orca.log</field>
        <field name="arch" type="xml">
            <form string="[Module] Audit Log">
                <group>
                    <field name="date" />
                    <field name="user_id" />
                    <field name="action" />
                    <field name="model_name" />
                    <field name="record_id" />
                </group>
                <group string="Values">
                    <field name="before_values" />
                    <field name="after_values" />
                </group>
            </form>
        </field>
    </record>

    <!-- Action & Menu -->
    <record id="action_[module]_orca_log" model="ir.actions.act_window">
        <field name="name">[Module] ORCA Logs</field>
        <field name="type">ir.actions.act_window</field>
        <field name="res_model">[module].orca.log</field>
        <field name="view_mode">tree,form</field>
    </record>

    <menuitem id="menu_[module]_orca_log" 
              name="[Module] ORCA Logs"
              action="action_[module]_orca_log"
              parent="account.menu_accounting" />
</odoo>
```

---

## Template 5: Unit Tests

```python
# Create file: tests/test_[module]_orca.py

from odoo.tests import TransactionCase
from datetime import datetime


class Test[Module]OrcaLogging(TransactionCase):
    """Test ORCA logging for [module]"""

    def setUp(self):
        super().setUp()
        self.OrcaLog = self.env['[module].orca.log']
        self.Model = self.env['[model_name]']

    def test_orca_[model]_create_logs(self):
        """Test: Creating [model] generates ORCA log"""
        # Create record
        record = self.Model.create({
            'field1': 'value1',
            'field2': 'value2',
        })
        
        # Verify log created
        logs = self.OrcaLog.search([
            ('record_id', '=', record.id),
            ('action', '=', 'create')
        ])
        self.assertEqual(len(logs), 1, "Should create exactly 1 log entry")
        self.assertEqual(logs[0].action, 'create')
        self.assertEqual(logs[0].user_id.id, self.env.user.id)

    def test_orca_[model]_write_captures_changes(self):
        """Test: Write hook captures before/after values"""
        record = self.Model.create({'field1': 'original'})
        
        # Clear create logs
        self.OrcaLog.search([('record_id', '=', record.id)]).unlink()
        
        # Update record
        record.write({'field1': 'updated'})
        
        # Verify write log
        logs = self.OrcaLog.search([
            ('record_id', '=', record.id),
            ('action', '=', 'write')
        ])
        self.assertEqual(len(logs), 1)
        
        # Verify before/after captured
        import json
        before = json.loads(logs[0].before_values or '{}')
        after = json.loads(logs[0].after_values or '{}')
        
        self.assertIn('field1', after)
        self.assertEqual(after['field1'], 'updated')

    def test_orca_[model]_state_change(self):
        """Test: State changes are logged"""
        record = self.Model.create({'state': 'draft'})
        initial_logs = len(self.OrcaLog.search([('record_id', '=', record.id)]))
        
        record.write({'state': 'confirmed'})
        
        final_logs = len(self.OrcaLog.search([('record_id', '=', record.id)]))
        self.assertGreater(final_logs, initial_logs)

    def test_orca_field_auto_detection(self):
        """Test: Field auto-detection works"""
        record = self.Model.create({'field1': 'test'})
        logs = self.OrcaLog.search([('record_id', '=', record.id)])
        
        # Verify key fields captured
        import json
        after = json.loads(logs[0].after_values or '{}')
        self.assertIn('field1', after)

    def test_orca_access_control_accountant(self):
        """Test: Accountants can only READ logs"""
        # Create record
        record = self.Model.create({'field1': 'test'})
        
        # Get accountant user
        accountant = self.env['res.users'].search(
            [('groups_id', 'in', [self.env.ref('account.group_account_user').id])]
        )
        
        if accountant:
            log = self.OrcaLog.search([('record_id', '=', record.id)])[0]
            
            # Accountant should be able to read
            try:
                _ = log.read()
                can_read = True
            except:
                can_read = False
            
            self.assertTrue(can_read, "Accountant should be able to read ORCA logs")

    def test_orca_access_control_manager(self):
        """Test: Managers have full access to logs"""
        record = self.Model.create({'field1': 'test'})
        log = self.OrcaLog.search([('record_id', '=', record.id)])[0]
        
        # Manager should be able to modify (mark as synced, etc.)
        # This depends on your implementation
        pass
```

---

## Template 6: __init__.py Updates

```python
# Update v19/Modules/[module_extended]/models/__init__.py

from . import [model_name]  # Existing imports
from . import [module]_orca  # ADD THIS LINE

__all__ = [
    '[model_name]',
    '[module]_orca',  # ADD THIS
]
```

---

## Template 7: Manifest Updates

```python
# Update __manifest__.py for each Phase 1 module

{
    'name': '[Module Name]',
    'version': '19.0.x.1.0',  # Increment minor version for ORCA
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': '[Category]',
    'depends': [
        'base_orca_integration',  # ADD IF NOT PRESENT
        '[original_dependencies]',
        # ... other deps
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/[module]_orca_log_views.xml',  # ADD
        # ... other views
    ],
    'installable': True,
}
```

---

## Template 8: README Addition

```markdown
## ORCA Audit Logging

This module automatically logs all create/write/delete operations on key financial models.

### Tracked Models

- **account.move** (CRITICAL tier)
  - All journal entries, invoices, bills
  - Fields: move_type, state, amount_total, partner_id, date, journal_id
  
- **account.journal** (CRITICAL tier)
  - All ledger journal changes
  - Fields: code, name, type, active

- **account.account** (HIGH tier)
  - Chart of accounts modifications
  - Fields: code, name, account_type, deprecated

### Access Control

- **Accountants (group_account_user):** Can VIEW audit logs only
- **Managers (group_account_manager):** Can VIEW, CREATE, MODIFY audit logs
- **Admin:** Full access

### ORCA Log Location

Odoo UI: **Accounting** → **ORCA Logs** → **[Module] Logs**

### Example

When you create an invoice:
1. User creates account.move record
2. OrcaAuditMixin.create() hook triggers automatically
3. ORCA log entry created with:
   - Model: account.move
   - Record ID: [invoice_id]
   - Action: create
   - Before: {} (empty)
   - After: {move_type, amount_total, partner_id, ...}
4. User can see log in Odoo UI
```

---

## Implementation Checklist per Module

```
Phase 1 Implementation Checklist
================================

Module: ___________________
Status: [ ] TODO [ ] IN_PROGRESS [ ] DONE

PRE-IMPLEMENTATION
[ ] Read PHASE1_CORE_FINANCIAL_IMPLEMENTATION.md
[ ] Identify models to track
[ ] List CRITICAL/HIGH tier fields
[ ] Design ORCA log model fields

CODE IMPLEMENTATION
[ ] Create models/[module]_orca.py
[ ] Create OrcaLog model (inherit from orca.log)
[ ] Apply OrcaAuditMixin to model 1
[ ] Apply OrcaAuditMixin to model 2
[ ] Apply OrcaAuditMixin to model 3 (if needed)
[ ] Define _orca_tracked_fields for each
[ ] Define _orca_log_model for each
[ ] Update __init__.py to import new file
[ ] Update __manifest__.py (dependencies + data)

SECURITY & VIEWS
[ ] Create/update security/ir.model.access.csv
[ ] Create views/[module]_orca_log_views.xml
[ ] Test list view displays logs
[ ] Test form view shows details
[ ] Verify menu item appears in Odoo UI

TESTING
[ ] Write test_create_logs()
[ ] Write test_write_captures_changes()
[ ] Write test_state_change()
[ ] Write test_field_auto_detection()
[ ] Write test_access_control_accountant()
[ ] Write test_access_control_manager()
[ ] Run all tests - must PASS
[ ] Verify logs visible in Odoo UI

DOCUMENTATION
[ ] Update README.md with ORCA section
[ ] Document tracked models
[ ] Document access control
[ ] Add example of ORCA logging

GIT & REVIEW
[ ] Stage files
[ ] Create commit with message: feat: Refactor [module] with ORCA (OO-F-40X)
[ ] Run full test suite
[ ] Ready for merge

Total Tests: __ (minimum 6 per module)
All Passing: [ ] YES [ ] NO
```

---

## Per-Module Checklist

### Module 1: account (OO-F-401)
- [ ] account_orca.py created
- [ ] OrcaLog model: account.move.orca.log
- [ ] Models: account.move, account.journal, account.account
- [ ] Tests: 8 minimum
- [ ] Status: Ready for implementation

### Module 2: account_accountant (OO-F-402)
- [ ] account_accountant_orca.py created
- [ ] OrcaLog model: account.tax.orca.log
- [ ] Models: account.tax, account.move.line, account.bank
- [ ] Tests: 6 minimum
- [ ] Status: Ready for implementation

### Module 3: account_payment (OO-F-403)
- [ ] payment_orca.py created
- [ ] OrcaLog model: account.payment.orca.log
- [ ] Models: account.payment, account.payment.method
- [ ] Tests: 6 minimum
- [ ] Status: Ready for implementation

### Module 4: account_reports (OO-F-404)
- [ ] account_reports_orca.py created
- [ ] OrcaLog model: account.report.orca.log
- [ ] Models: report.general.ledger, account.report.wizard
- [ ] Tests: 5 minimum
- [ ] Status: Ready for implementation

---

## Quality Gates

**All must pass before merge:**
- [ ] No lint/style errors
- [ ] All 25+ tests passing
- [ ] No console errors in Odoo
- [ ] ORCA logs visible in UI
- [ ] Manual test: create invoice → log appears
- [ ] Performance: <10ms latency
- [ ] Security: proper access control enforced
- [ ] Documentation: README updated

