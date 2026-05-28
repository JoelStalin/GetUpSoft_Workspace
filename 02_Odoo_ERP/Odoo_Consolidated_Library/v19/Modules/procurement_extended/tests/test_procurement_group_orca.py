import json
from odoo.tests import TransactionCase, tagged

@tagged('post_install', '-at_install')
class TestProcurementGroupOrcaLogging(TransactionCase):
    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.pg_model = self.env['procurement.group']
        self.log_model = self.env['orca.procurement.group.log']
    
    def test_procurement_group_log_model_created(self):
        self.assertTrue(self.log_model, 'orca.procurement.group.log should exist')
    
    def test_create_procurement_group_logs_action(self):
        initial = self.log_model.search_count([])
        pg = self.pg_model.create({'name': 'PG-001'})
        final = self.log_model.search_count([])
        self.assertEqual(final, initial + 1, 'Creating PG should create log')
    
    def test_log_action_is_create(self):
        pg = self.pg_model.create({'name': 'Test PG'})
        log = self.log_model.search([('record_id', '=', pg.id)], limit=1)
        self.assertEqual(log.action, 'create', 'Action should be create')
    
    def test_write_procurement_group_logs_action(self):
        pg = self.pg_model.create({'name': 'Test'})
        before = self.log_model.search_count([('record_id', '=', pg.id)])
        pg.write({'name': 'Updated'})
        after = self.log_model.search_count([('record_id', '=', pg.id)])
        self.assertGreater(after, before, 'Write should create log')
    
    def test_log_captures_procurement_ref(self):
        pg = self.pg_model.create({'name': 'PG-TEST-001'})
        log = self.log_model.search([('record_id', '=', pg.id)], limit=1)
        self.assertEqual(log.procurement_ref, 'PG-TEST-001', 'Should capture reference')
    
    def test_log_model_name(self):
        self.assertEqual(self.log_model._name, 'orca.procurement.group.log', 'Model name incorrect')
    
    def test_status_selections(self):
        field = self.log_model._fields['status']
        selections = [s[0] for s in field.selection]
        self.assertIn('confirmed', selections)
        self.assertIn('progress', selections)
    
    def test_priority_selections(self):
        field = self.log_model._fields['priority']
        selections = [s[0] for s in field.selection]
        self.assertIn('0', selections)
        self.assertIn('1', selections)
        self.assertIn('2', selections)
    
    def test_access_control_user(self):
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should read logs')
    
    def test_inherits_from_orca_log(self):
        self.assertIn('orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Should inherit from orca.log')
    
    def test_required_fields(self):
        for field in ['procurement_ref', 'status', 'priority', 'item_count']:
            self.assertTrue(field in self.log_model._fields, f'Should have {field}')
    
    def test_unlink_procurement_group_logs_action(self):
        pg = self.pg_model.create({'name': 'Test'})
        pgid = pg.id
        before = self.log_model.search_count([('record_id', '=', pgid)])
        pg.unlink()
        after = self.log_model.search_count([('record_id', '=', pgid)])
        self.assertGreater(after, before, 'Unlink should create log')
    
    def test_write_log_action_is_write(self):
        pg = self.pg_model.create({'name': 'Test'})
        pg.write({'priority': '2'})
        log = self.log_model.search([('record_id', '=', pg.id), ('action', '=', 'write')], limit=1)
        self.assertIsNotNone(log, 'Write log should exist')
    
    def test_log_has_audit_data(self):
        pg = self.pg_model.create({'name': 'Test'})
        log = self.log_model.search([('record_id', '=', pg.id)], limit=1)
        self.assertIsNotNone(log.before_values, 'Should have before_values')
        self.assertIsNotNone(log.after_values, 'Should have after_values')
    
    def test_log_captures_status(self):
        pg = self.pg_model.create({'name': 'Test'})
        log = self.log_model.search([('record_id', '=', pg.id)], limit=1)
        self.assertIsNotNone(log.status, 'Should capture status')
    
    def test_log_captures_item_count(self):
        pg = self.pg_model.create({'name': 'Test'})
        log = self.log_model.search([('record_id', '=', pg.id)], limit=1)
        self.assertIsNotNone(log.item_count, 'Should capture item count')
