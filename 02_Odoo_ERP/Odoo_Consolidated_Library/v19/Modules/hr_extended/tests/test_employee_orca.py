import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestEmployeeOrcaLogging(TransactionCase):
    """Test suite for employee ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.employee_model = self.env['hr.employee']
        self.log_model = self.env['orca.employee.log']

    def test_hr_employee_inherits_orca_mixin(self):
        """Test that hr.employee inherits orca.universal.mixin."""
        self.assertTrue(
            self.employee_model._inherits.get('orca.universal.mixin'),
            'hr.employee should inherit orca.universal.mixin'
        )

    def test_employee_orca_tier_high(self):
        """Test that hr.employee has HIGH tier classification."""
        self.assertEqual(
            self.employee_model._orca_tier,
            'high',
            'hr.employee should have HIGH tier'
        )

    def test_employee_log_model_configured(self):
        """Test that employee log model is properly configured."""
        self.assertEqual(
            self.employee_model._orca_log_model,
            'orca.employee.log',
            'Employee should use orca.employee.log'
        )

    def test_employee_log_model_has_required_fields(self):
        """Test that employee log has all required fields."""
        required_fields = ['employee_name', 'employee_email', 'employee_status', 'job_title', 'department_name', 'manager_name', 'contract_status']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Employee log should have {field} field'
            )

    def test_employee_log_inherits_from_orca_log(self):
        """Test that employee log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Employee log should inherit from orca.log'
        )

    def test_employee_create_action_logged(self):
        """Test that creating an employee generates an ORCA log entry."""
        employee = self.employee_model.create({'name': 'Test Employee'})
        logs = self.log_model.search([('record_id', '=', employee.id)])
        self.assertTrue(len(logs) > 0, 'Employee creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_employee_write_action_logged(self):
        """Test that modifying an employee generates an ORCA log entry."""
        employee = self.employee_model.create({'name': 'Test Employee'})
        employee.write({'active': False})
        logs = self.log_model.search([('record_id', '=', employee.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Employee modification should generate a log entry')

    def test_employee_unlink_action_logged(self):
        """Test that deleting an employee generates an ORCA log entry."""
        employee = self.employee_model.create({'name': 'Test Employee'})
        employee_id = employee.id
        employee.unlink()
        logs = self.log_model.search([('record_id', '=', employee_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Employee deletion should generate a log entry')

    def test_employee_log_captures_tracked_fields(self):
        """Test that employee log captures tracked field values."""
        employee = self.employee_model.create({
            'name': 'John Doe',
            'active': True,
        })
        employee.write({'active': False})
        logs = self.log_model.search([('record_id', '=', employee.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('active', after_values, 'Tracked fields should be in after_values')

    def test_employee_log_user_tracking(self):
        """Test that employee log tracks which user made the change."""
        employee = self.employee_model.create({'name': 'Test Employee'})
        logs = self.log_model.search([('record_id', '=', employee.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_employee_log_date_tracking(self):
        """Test that employee log captures timestamp."""
        employee = self.employee_model.create({'name': 'Test Employee'})
        logs = self.log_model.search([('record_id', '=', employee.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_employee_log_user(self):
        """Test that regular users can read employee logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read employee logs')

    def test_access_control_employee_log_hr_user(self):
        """Test that HR users can read employee logs."""
        hr_user = self.env['res.users'].create({
            'name': 'Test HR User',
            'login': 'hr_user@test.com',
            'groups_id': [(6, 0, [self.env.ref('hr.group_hr_user').id])],
        })
        logs = self.log_model.with_user(hr_user).search([])
        self.assertIsNotNone(logs, 'HR users should be able to read employee logs')

    def test_employee_log_model_name(self):
        """Test that employee log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.employee.log',
            'Employee log model name incorrect'
        )

    def test_employee_status_field_selections(self):
        """Test that employee_status field has correct selections."""
        status_field = self.log_model._fields['employee_status']
        expected_selections = ['draft', 'open', 'close']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in employee_status selections')
