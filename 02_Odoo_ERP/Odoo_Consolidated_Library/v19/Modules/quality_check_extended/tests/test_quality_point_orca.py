import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestQualityPointOrcaLogging(TransactionCase):
    """Test suite for quality point ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.point_model = self.env['quality.point']
        self.log_model = self.env['orca.quality.point.log']

    def test_quality_point_inherits_orca_mixin(self):
        """Test that quality.point inherits orca.universal.mixin."""
        self.assertTrue(
            self.point_model._inherits.get('orca.universal.mixin'),
            'quality.point should inherit orca.universal.mixin'
        )

    def test_quality_point_orca_tier_high(self):
        """Test that quality.point has HIGH tier classification."""
        self.assertEqual(
            self.point_model._orca_tier,
            'high',
            'quality.point should have HIGH tier'
        )

    def test_quality_point_log_model_configured(self):
        """Test that quality point log model is properly configured."""
        self.assertEqual(
            self.point_model._orca_log_model,
            'orca.quality.point.log',
            'Quality point should use orca.quality.point.log'
        )

    def test_quality_point_log_model_has_required_fields(self):
        """Test that quality point log has all required fields."""
        required_fields = ['point_reference', 'point_name', 'test_type', 'point_status', 'applicable_operation', 'measurement_frequency', 'responsible_team']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Quality point log should have {field} field'
            )

    def test_quality_point_log_inherits_from_orca_log(self):
        """Test that quality point log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Quality point log should inherit from orca.log'
        )

    def test_quality_point_create_action_logged(self):
        """Test that creating a quality point generates an ORCA log entry."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        logs = self.log_model.search([('record_id', '=', point.id)])
        self.assertTrue(len(logs) > 0, 'Quality point creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_quality_point_write_action_logged(self):
        """Test that modifying a quality point generates an ORCA log entry."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        point.write({'active': False})
        logs = self.log_model.search([('record_id', '=', point.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Quality point modification should generate a log entry')

    def test_quality_point_unlink_action_logged(self):
        """Test that deleting a quality point generates an ORCA log entry."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        point_id = point.id
        point.unlink()
        logs = self.log_model.search([('record_id', '=', point_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Quality point deletion should generate a log entry')

    def test_quality_point_log_captures_tracked_fields(self):
        """Test that quality point log captures tracked field values."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        point.write({'active': False})
        logs = self.log_model.search([('record_id', '=', point.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('active', after_values, 'Tracked fields should be in after_values')

    def test_quality_point_log_user_tracking(self):
        """Test that quality point log tracks which user made the change."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        logs = self.log_model.search([('record_id', '=', point.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_quality_point_log_date_tracking(self):
        """Test that quality point log captures timestamp."""
        point = self.point_model.create({'name': 'Test Quality Point'})
        logs = self.log_model.search([('record_id', '=', point.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_quality_point_log_user(self):
        """Test that regular users can read quality point logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read quality point logs')

    def test_quality_point_log_model_name(self):
        """Test that quality point log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.quality.point.log',
            'Quality point log model name incorrect'
        )

    def test_test_type_field_selections(self):
        """Test that test_type field has correct selections."""
        type_field = self.log_model._fields['test_type']
        expected_selections = ['test', 'question', 'passfail']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in test_type selections')

    def test_point_status_field_selections(self):
        """Test that point_status field has correct selections."""
        status_field = self.log_model._fields['point_status']
        expected_selections = ['active', 'inactive', 'draft']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in point_status selections')
