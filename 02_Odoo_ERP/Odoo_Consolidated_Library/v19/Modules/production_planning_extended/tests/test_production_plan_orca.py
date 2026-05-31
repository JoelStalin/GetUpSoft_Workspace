import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestProductionPlanOrcaLogging(TransactionCase):
    """Test suite for production plan ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.group_model = self.env['procurement.group']
        self.log_model = self.env['orca.production.plan.log']

    def test_procurement_group_inherits_orca_mixin(self):
        """Test that procurement.group inherits orca.universal.mixin."""
        self.assertTrue(
            self.group_model._inherits.get('orca.universal.mixin'),
            'procurement.group should inherit orca.universal.mixin'
        )

    def test_production_plan_orca_tier_high(self):
        """Test that procurement.group has HIGH tier classification."""
        self.assertEqual(
            self.group_model._orca_tier,
            'high',
            'procurement.group should have HIGH tier'
        )

    def test_production_plan_log_model_configured(self):
        """Test that production plan log model is properly configured."""
        self.assertEqual(
            self.group_model._orca_log_model,
            'orca.production.plan.log',
            'Procurement group should use orca.production.plan.log'
        )

    def test_production_plan_log_model_has_required_fields(self):
        """Test that production plan log has all required fields."""
        required_fields = ['plan_reference', 'plan_name', 'planning_period', 'planned_quantity', 'plan_status', 'plan_type', 'start_date', 'end_date']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Production plan log should have {field} field'
            )

    def test_production_plan_log_inherits_from_orca_log(self):
        """Test that production plan log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Production plan log should inherit from orca.log'
        )

    def test_production_plan_create_action_logged(self):
        """Test that creating a procurement group generates an ORCA log entry."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        logs = self.log_model.search([('record_id', '=', group.id)])
        self.assertTrue(len(logs) > 0, 'Procurement group creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_production_plan_write_action_logged(self):
        """Test that modifying a procurement group generates an ORCA log entry."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        group.write({'state': 'progress'})
        logs = self.log_model.search([('record_id', '=', group.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Procurement group modification should generate a log entry')

    def test_production_plan_unlink_action_logged(self):
        """Test that deleting a procurement group generates an ORCA log entry."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        group_id = group.id
        group.unlink()
        logs = self.log_model.search([('record_id', '=', group_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Procurement group deletion should generate a log entry')

    def test_production_plan_log_captures_tracked_fields(self):
        """Test that production plan log captures tracked field values."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        group.write({'state': 'progress'})
        logs = self.log_model.search([('record_id', '=', group.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('state', after_values, 'Tracked fields should be in after_values')

    def test_production_plan_log_user_tracking(self):
        """Test that production plan log tracks which user made the change."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        logs = self.log_model.search([('record_id', '=', group.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_production_plan_log_date_tracking(self):
        """Test that production plan log captures timestamp."""
        group = self.group_model.create({'name': 'Test Procurement Group'})
        logs = self.log_model.search([('record_id', '=', group.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_production_plan_log_user(self):
        """Test that regular users can read production plan logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read production plan logs')

    def test_production_plan_log_model_name(self):
        """Test that production plan log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.production.plan.log',
            'Production plan log model name incorrect'
        )

    def test_plan_status_field_selections(self):
        """Test that plan_status field has correct selections."""
        status_field = self.log_model._fields['plan_status']
        expected_selections = ['draft', 'approved', 'in_progress', 'completed', 'cancelled']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in plan_status selections')

    def test_plan_type_field_selections(self):
        """Test that plan_type field has correct selections."""
        type_field = self.log_model._fields['plan_type']
        expected_selections = ['forecasted', 'committed', 'fixed']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in plan_type selections')
