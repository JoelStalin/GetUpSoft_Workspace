import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestDepartmentOrcaLogging(TransactionCase):
    """Test suite for department ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.department_model = self.env['hr.department']
        self.log_model = self.env['orca.department.log']

    def test_hr_department_inherits_orca_mixin(self):
        """Test that hr.department inherits orca.universal.mixin."""
        self.assertTrue(
            self.department_model._inherits.get('orca.universal.mixin'),
            'hr.department should inherit orca.universal.mixin'
        )

    def test_department_orca_tier_high(self):
        """Test that hr.department has HIGH tier classification."""
        self.assertEqual(
            self.department_model._orca_tier,
            'high',
            'hr.department should have HIGH tier'
        )

    def test_department_log_model_configured(self):
        """Test that department log model is properly configured."""
        self.assertEqual(
            self.department_model._orca_log_model,
            'orca.department.log',
            'Department should use orca.department.log'
        )

    def test_department_log_model_has_required_fields(self):
        """Test that department log has all required fields."""
        required_fields = ['department_name', 'department_code', 'parent_department', 'manager_name', 'employee_count', 'department_status']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Department log should have {field} field'
            )

    def test_department_log_inherits_from_orca_log(self):
        """Test that department log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Department log should inherit from orca.log'
        )

    def test_department_create_action_logged(self):
        """Test that creating a department generates an ORCA log entry."""
        department = self.department_model.create({'name': 'Sales Department'})
        logs = self.log_model.search([('record_id', '=', department.id)])
        self.assertTrue(len(logs) > 0, 'Department creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_department_write_action_logged(self):
        """Test that modifying a department generates an ORCA log entry."""
        department = self.department_model.create({'name': 'Sales Department'})
        department.write({'name': 'Sales Department Updated'})
        logs = self.log_model.search([('record_id', '=', department.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Department modification should generate a log entry')

    def test_department_unlink_action_logged(self):
        """Test that deleting a department generates an ORCA log entry."""
        department = self.department_model.create({'name': 'Sales Department'})
        department_id = department.id
        department.unlink()
        logs = self.log_model.search([('record_id', '=', department_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Department deletion should generate a log entry')

    def test_department_log_captures_tracked_fields(self):
        """Test that department log captures tracked field values."""
        department = self.department_model.create({'name': 'Sales Department'})
        department.write({'name': 'Sales Department Updated'})
        logs = self.log_model.search([('record_id', '=', department.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('name', after_values, 'Tracked fields should be in after_values')

    def test_department_log_user_tracking(self):
        """Test that department log tracks which user made the change."""
        department = self.department_model.create({'name': 'Sales Department'})
        logs = self.log_model.search([('record_id', '=', department.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_department_log_date_tracking(self):
        """Test that department log captures timestamp."""
        department = self.department_model.create({'name': 'Sales Department'})
        logs = self.log_model.search([('record_id', '=', department.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_department_log_user(self):
        """Test that regular users can read department logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read department logs')

    def test_access_control_department_log_hr_user(self):
        """Test that HR users can read department logs."""
        hr_user = self.env['res.users'].create({
            'name': 'Test HR User',
            'login': 'hr_org_user@test.com',
            'groups_id': [(6, 0, [self.env.ref('hr.group_hr_user').id])],
        })
        logs = self.log_model.with_user(hr_user).search([])
        self.assertIsNotNone(logs, 'HR users should be able to read department logs')

    def test_department_log_model_name(self):
        """Test that department log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.department.log',
            'Department log model name incorrect'
        )

    def test_department_status_field_selections(self):
        """Test that department_status field has correct selections."""
        status_field = self.log_model._fields['department_status']
        expected_selections = ['active', 'inactive']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in department_status selections')
