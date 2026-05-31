import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestQualityCheckOrcaLogging(TransactionCase):
    """Test suite for quality check ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.check_model = self.env['quality.check']
        self.log_model = self.env['orca.quality.check.log']

    def test_quality_check_inherits_orca_mixin(self):
        """Test that quality.check inherits orca.universal.mixin."""
        self.assertTrue(
            self.check_model._inherits.get('orca.universal.mixin'),
            'quality.check should inherit orca.universal.mixin'
        )

    def test_quality_check_orca_tier_high(self):
        """Test that quality.check has HIGH tier classification."""
        self.assertEqual(
            self.check_model._orca_tier,
            'high',
            'quality.check should have HIGH tier'
        )

    def test_quality_check_log_model_configured(self):
        """Test that quality check log model is properly configured."""
        self.assertEqual(
            self.check_model._orca_log_model,
            'orca.quality.check.log',
            'Quality check should use orca.quality.check.log'
        )

    def test_quality_check_log_model_has_required_fields(self):
        """Test that quality check log has all required fields."""
        required_fields = ['check_reference', 'product_name', 'check_type', 'quality_status', 'inspected_quantity', 'accepted_quantity', 'rejected_quantity', 'check_date']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Quality check log should have {field} field'
            )

    def test_quality_check_log_inherits_from_orca_log(self):
        """Test that quality check log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Quality check log should inherit from orca.log'
        )

    def test_quality_check_create_action_logged(self):
        """Test that creating a quality check generates an ORCA log entry."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        logs = self.log_model.search([('record_id', '=', check.id)])
        self.assertTrue(len(logs) > 0, 'Quality check creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_quality_check_write_action_logged(self):
        """Test that modifying a quality check generates an ORCA log entry."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        check.write({'quality_state': 'pass'})
        logs = self.log_model.search([('record_id', '=', check.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Quality check modification should generate a log entry')

    def test_quality_check_unlink_action_logged(self):
        """Test that deleting a quality check generates an ORCA log entry."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        check_id = check.id
        check.unlink()
        logs = self.log_model.search([('record_id', '=', check_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Quality check deletion should generate a log entry')

    def test_quality_check_log_captures_tracked_fields(self):
        """Test that quality check log captures tracked field values."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        check.write({'quality_state': 'pass'})
        logs = self.log_model.search([('record_id', '=', check.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('quality_state', after_values, 'Tracked fields should be in after_values')

    def test_quality_check_log_user_tracking(self):
        """Test that quality check log tracks which user made the change."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        logs = self.log_model.search([('record_id', '=', check.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_quality_check_log_date_tracking(self):
        """Test that quality check log captures timestamp."""
        product = self.env['product.product'].search([], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Test Product'})
        check = self.check_model.create({
            'product_id': product.id,
            'quality_check_type': 'manual',
        })
        logs = self.log_model.search([('record_id', '=', check.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_quality_check_log_user(self):
        """Test that regular users can read quality check logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read quality check logs')

    def test_quality_check_log_model_name(self):
        """Test that quality check log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.quality.check.log',
            'Quality check log model name incorrect'
        )

    def test_check_type_field_selections(self):
        """Test that check_type field has correct selections."""
        check_type_field = self.log_model._fields['check_type']
        expected_selections = ['manual', 'automated', 'sampling', 'incoming', 'outgoing']
        actual_selections = [s[0] for s in check_type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in check_type selections')

    def test_quality_status_field_selections(self):
        """Test that quality_status field has correct selections."""
        status_field = self.log_model._fields['quality_status']
        expected_selections = ['pass', 'fail', 'pending', 'cancel']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in quality_status selections')
