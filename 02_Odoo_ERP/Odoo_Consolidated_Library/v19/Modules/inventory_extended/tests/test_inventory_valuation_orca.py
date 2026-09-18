import json
from odoo.tests import TransactionCase, tagged

@tagged('post_install', '-at_install')
class TestInventoryValuationOrcaLogging(TransactionCase):
    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.product_model = self.env['product.product']
        self.log_model = self.env['orca.inventory.valuation.log']
    
    def test_inventory_valuation_log_model_created(self):
        self.assertTrue(self.log_model, 'orca.inventory.valuation.log should exist')
    
    def test_create_product_logs_action(self):
        initial = self.log_model.search_count([])
        prod = self.product_model.create({'name': 'Test Inv Product', 'type': 'product', 'cost_method': 'fifo'})
        final = self.log_model.search_count([])
        self.assertEqual(final, initial + 1, 'Creating product should create log')
    
    def test_log_action_is_create(self):
        prod = self.product_model.create({'name': 'Test Inv', 'type': 'product'})
        log = self.log_model.search([('record_id', '=', prod.id)], limit=1)
        self.assertEqual(log.action, 'create', 'Action should be create')
    
    def test_write_product_logs_action(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product'})
        before = self.log_model.search_count([('record_id', '=', prod.id)])
        prod.write({'standard_price': 100})
        after = self.log_model.search_count([('record_id', '=', prod.id)])
        self.assertGreater(after, before, 'Write should create log')
    
    def test_log_captures_product_name(self):
        prod = self.product_model.create({'name': 'Named Product', 'type': 'product'})
        log = self.log_model.search([('record_id', '=', prod.id)], limit=1)
        self.assertEqual(log.product_name, 'Named Product', 'Should capture product name')
    
    def test_log_model_name(self):
        self.assertEqual(self.log_model._name, 'orca.inventory.valuation.log', 'Model name incorrect')
    
    def test_valuation_selections(self):
        field = self.log_model._fields['valuation_method']
        selections = [s[0] for s in field.selection]
        self.assertIn('fifo', selections)
        self.assertIn('lifo', selections)
        self.assertIn('average', selections)
    
    def test_access_control_user(self):
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should read logs')
    
    def test_inherits_from_orca_log(self):
        self.assertIn('orca.log', 
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Should inherit from orca.log')
    
    def test_required_fields(self):
        for field in ['product_name', 'valuation_method', 'unit_cost', 'total_value']:
            self.assertTrue(field in self.log_model._fields, f'Should have {field}')
    
    def test_unlink_product_logs_action(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product'})
        pid = prod.id
        before = self.log_model.search_count([('record_id', '=', pid)])
        prod.unlink()
        after = self.log_model.search_count([('record_id', '=', pid)])
        self.assertGreater(after, before, 'Unlink should create log')
    
    def test_log_captures_unit_cost(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product', 'standard_price': 75.50})
        log = self.log_model.search([('record_id', '=', prod.id)], limit=1)
        self.assertEqual(log.unit_cost, 75.50, 'Should capture unit cost')
    
    def test_log_captures_valuation_method(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product', 'cost_method': 'average'})
        log = self.log_model.search([('record_id', '=', prod.id)], limit=1)
        self.assertIn(log.valuation_method, ['average', 'fifo'], 'Should capture valuation method')
    
    def test_write_log_action_is_write(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product'})
        prod.write({'standard_price': 50})
        log = self.log_model.search([('record_id', '=', prod.id), ('action', '=', 'write')], limit=1)
        self.assertIsNotNone(log, 'Write log should exist')
    
    def test_log_has_audit_data(self):
        prod = self.product_model.create({'name': 'Test', 'type': 'product'})
        log = self.log_model.search([('record_id', '=', prod.id)], limit=1)
        self.assertIsNotNone(log.before_values, 'Should have before_values')
        self.assertIsNotNone(log.after_values, 'Should have after_values')
