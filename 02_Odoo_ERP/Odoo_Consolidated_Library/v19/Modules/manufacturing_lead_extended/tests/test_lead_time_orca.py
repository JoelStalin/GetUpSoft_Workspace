import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestLeadTimeOrcaLogging(TransactionCase):
    """Test suite for lead time ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.product_template_model = self.env['product.template']
        self.log_model = self.env['orca.lead.time.log']

    def test_product_template_inherits_orca_mixin(self):
        """Test that product.template inherits orca.universal.mixin."""
        self.assertTrue(
            self.product_template_model._inherits.get('orca.universal.mixin'),
            'product.template should inherit orca.universal.mixin'
        )

    def test_lead_time_orca_tier_high(self):
        """Test that product.template has HIGH tier classification."""
        self.assertEqual(
            self.product_template_model._orca_tier,
            'high',
            'product.template should have HIGH tier'
        )

    def test_lead_time_log_model_configured(self):
        """Test that lead time log model is properly configured."""
        self.assertEqual(
            self.product_template_model._orca_log_model,
            'orca.lead.time.log',
            'Product template should use orca.lead.time.log'
        )

    def test_lead_time_log_model_has_required_fields(self):
        """Test that lead time log has all required fields."""
        required_fields = ['product_name', 'route_name', 'lead_time_days', 'procurement_method', 'lead_time_type', 'effective_date', 'status']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Lead time log should have {field} field'
            )

    def test_lead_time_log_inherits_from_orca_log(self):
        """Test that lead time log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Lead time log should inherit from orca.log'
        )

    def test_lead_time_create_action_logged(self):
        """Test that creating a product template generates an ORCA log entry."""
        product = self.product_template_model.create({'name': 'Test Product'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(len(logs) > 0, 'Product template creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_lead_time_write_action_logged(self):
        """Test that modifying a product template generates an ORCA log entry."""
        product = self.product_template_model.create({'name': 'Test Product'})
        product.write({'produce_delay': 5.0})
        logs = self.log_model.search([('record_id', '=', product.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Product template modification should generate a log entry')

    def test_lead_time_unlink_action_logged(self):
        """Test that deleting a product template generates an ORCA log entry."""
        product = self.product_template_model.create({'name': 'Test Product'})
        product_id = product.id
        product.unlink()
        logs = self.log_model.search([('record_id', '=', product_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Product template deletion should generate a log entry')

    def test_lead_time_log_captures_tracked_fields(self):
        """Test that lead time log captures tracked field values."""
        product = self.product_template_model.create({'name': 'Test Product'})
        product.write({'produce_delay': 5.0})
        logs = self.log_model.search([('record_id', '=', product.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('produce_delay', after_values, 'Tracked fields should be in after_values')

    def test_lead_time_log_user_tracking(self):
        """Test that lead time log tracks which user made the change."""
        product = self.product_template_model.create({'name': 'Test Product'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_lead_time_log_date_tracking(self):
        """Test that lead time log captures timestamp."""
        product = self.product_template_model.create({'name': 'Test Product'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_lead_time_log_user(self):
        """Test that regular users can read lead time logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read lead time logs')

    def test_lead_time_log_model_name(self):
        """Test that lead time log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.lead.time.log',
            'Lead time log model name incorrect'
        )

    def test_procurement_method_field_selections(self):
        """Test that procurement_method field has correct selections."""
        method_field = self.log_model._fields['procurement_method']
        expected_selections = ['make_to_stock', 'make_to_order', 'buy']
        actual_selections = [s[0] for s in method_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in procurement_method selections')

    def test_lead_time_type_field_selections(self):
        """Test that lead_time_type field has correct selections."""
        type_field = self.log_model._fields['lead_time_type']
        expected_selections = ['customer_lead_time', 'supplier_lead_time', 'manufacturing_lead_time']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in lead_time_type selections')
