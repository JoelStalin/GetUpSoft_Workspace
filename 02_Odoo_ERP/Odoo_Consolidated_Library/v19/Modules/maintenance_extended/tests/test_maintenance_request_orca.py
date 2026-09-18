import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestMaintenanceRequestOrcaLogging(TransactionCase):
    """Test suite for maintenance request ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.request_model = self.env['maintenance.request']
        self.log_model = self.env['orca.maintenance.request.log']

    def test_maintenance_request_inherits_orca_mixin(self):
        """Test that maintenance.request inherits orca.universal.mixin."""
        self.assertTrue(
            self.request_model._inherits.get('orca.universal.mixin'),
            'maintenance.request should inherit orca.universal.mixin'
        )

    def test_maintenance_request_orca_tier_high(self):
        """Test that maintenance.request has HIGH tier classification."""
        self.assertEqual(
            self.request_model._orca_tier,
            'high',
            'maintenance.request should have HIGH tier'
        )

    def test_maintenance_request_log_model_configured(self):
        """Test that maintenance request log model is properly configured."""
        self.assertEqual(
            self.request_model._orca_log_model,
            'orca.maintenance.request.log',
            'Maintenance request should use orca.maintenance.request.log'
        )

    def test_maintenance_request_log_model_has_required_fields(self):
        """Test that maintenance request log has all required fields."""
        required_fields = ['request_reference', 'equipment_name', 'maintenance_type', 'priority', 'request_status', 'assigned_to', 'scheduled_date', 'completion_date']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Maintenance request log should have {field} field'
            )

    def test_maintenance_request_log_inherits_from_orca_log(self):
        """Test that maintenance request log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Maintenance request log should inherit from orca.log'
        )

    def test_maintenance_request_create_action_logged(self):
        """Test that creating a maintenance request generates an ORCA log entry."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        logs = self.log_model.search([('record_id', '=', request.id)])
        self.assertTrue(len(logs) > 0, 'Maintenance request creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_maintenance_request_write_action_logged(self):
        """Test that modifying a maintenance request generates an ORCA log entry."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        request.write({'priority': '2'})
        logs = self.log_model.search([('record_id', '=', request.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Maintenance request modification should generate a log entry')

    def test_maintenance_request_unlink_action_logged(self):
        """Test that deleting a maintenance request generates an ORCA log entry."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        request_id = request.id
        request.unlink()
        logs = self.log_model.search([('record_id', '=', request_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Maintenance request deletion should generate a log entry')

    def test_maintenance_request_log_captures_tracked_fields(self):
        """Test that maintenance request log captures tracked field values."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        request.write({'priority': '2'})
        logs = self.log_model.search([('record_id', '=', request.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('priority', after_values, 'Tracked fields should be in after_values')

    def test_maintenance_request_log_user_tracking(self):
        """Test that maintenance request log tracks which user made the change."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        logs = self.log_model.search([('record_id', '=', request.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_maintenance_request_log_date_tracking(self):
        """Test that maintenance request log captures timestamp."""
        equipment = self.env['maintenance.equipment'].search([], limit=1)
        if not equipment:
            equipment = self.env['maintenance.equipment'].create({'name': 'Test Equipment'})
        request = self.request_model.create({
            'name': 'Test Maintenance Request',
            'equipment_id': equipment.id,
        })
        logs = self.log_model.search([('record_id', '=', request.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_maintenance_request_log_user(self):
        """Test that regular users can read maintenance request logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read maintenance request logs')

    def test_maintenance_request_log_model_name(self):
        """Test that maintenance request log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.maintenance.request.log',
            'Maintenance request log model name incorrect'
        )

    def test_maintenance_type_field_selections(self):
        """Test that maintenance_type field has correct selections."""
        type_field = self.log_model._fields['maintenance_type']
        expected_selections = ['preventive', 'corrective', 'predictive']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in maintenance_type selections')

    def test_priority_field_selections(self):
        """Test that priority field has correct selections."""
        priority_field = self.log_model._fields['priority']
        expected_selections = ['low', 'medium', 'high', 'urgent']
        actual_selections = [s[0] for s in priority_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in priority selections')
