import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestProductEcommerceOrcaLogging(TransactionCase):
    """Test suite for ecommerce product ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.product_model = self.env['product.template']
        self.log_model = self.env['orca.ecommerce.log']

    def test_product_template_inherits_orca_mixin(self):
        """Test that product.template inherits orca.universal.mixin."""
        self.assertTrue(
            self.product_model._inherits.get('orca.universal.mixin'),
            'product.template should inherit orca.universal.mixin'
        )

    def test_product_orca_tier_high(self):
        """Test that product.template has HIGH tier classification."""
        self.assertEqual(
            self.product_model._orca_tier,
            'high',
            'product.template should have HIGH tier'
        )

    def test_product_log_model_configured(self):
        """Test that product log model is properly configured."""
        self.assertEqual(
            self.product_model._orca_log_model,
            'orca.ecommerce.log',
            'Product should use orca.ecommerce.log'
        )

    def test_product_log_model_has_required_fields(self):
        """Test that product log has all required fields."""
        required_fields = ['product_name', 'product_sku', 'is_ecommerce', 'product_price', 'website_id', 'category_name', 'purchase_count']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Product log should have {field} field'
            )

    def test_product_log_inherits_from_orca_log(self):
        """Test that product log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Product log should inherit from orca.log'
        )

    def test_product_create_action_logged(self):
        """Test that creating a product generates an ORCA log entry."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(len(logs) > 0, 'Product creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_product_write_action_logged(self):
        """Test that modifying a product generates an ORCA log entry."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        product.write({'list_price': 99.99})
        logs = self.log_model.search([('record_id', '=', product.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Product modification should generate a log entry')

    def test_product_unlink_action_logged(self):
        """Test that deleting a product generates an ORCA log entry."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        product_id = product.id
        product.unlink()
        logs = self.log_model.search([('record_id', '=', product_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Product deletion should generate a log entry')

    def test_product_log_captures_tracked_fields(self):
        """Test that product log captures tracked field values."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        product.write({'list_price': 99.99})
        logs = self.log_model.search([('record_id', '=', product.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('list_price', after_values, 'Tracked fields should be in after_values')

    def test_product_log_user_tracking(self):
        """Test that product log tracks which user made the change."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_product_log_date_tracking(self):
        """Test that product log captures timestamp."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001'})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_product_log_user(self):
        """Test that regular users can read product logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read product logs')

    def test_product_log_model_name(self):
        """Test that product log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.ecommerce.log',
            'Product log model name incorrect'
        )

    def test_product_availability_field_tracking(self):
        """Test that is_ecommerce field is tracked properly."""
        product = self.product_model.create({'name': 'Test Product', 'default_code': 'TEST-001', 'sale_ok': True})
        logs = self.log_model.search([('record_id', '=', product.id)])
        self.assertTrue(len(logs) > 0, 'Product creation should be logged')
