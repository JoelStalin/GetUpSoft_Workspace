import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPayslipOrcaLogging(TransactionCase):
    """Test suite for payslip ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.payslip_model = self.env['hr.payslip']
        self.log_model = self.env['orca.payslip.log']

    def test_hr_payslip_inherits_orca_mixin(self):
        """Test that hr.payslip inherits orca.universal.mixin."""
        self.assertTrue(
            self.payslip_model._inherits.get('orca.universal.mixin'),
            'hr.payslip should inherit orca.universal.mixin'
        )

    def test_payslip_orca_tier_high(self):
        """Test that hr.payslip has HIGH tier classification."""
        self.assertEqual(
            self.payslip_model._orca_tier,
            'high',
            'hr.payslip should have HIGH tier'
        )

    def test_payslip_log_model_configured(self):
        """Test that payslip log model is properly configured."""
        self.assertEqual(
            self.payslip_model._orca_log_model,
            'orca.payslip.log',
            'Payslip should use orca.payslip.log'
        )

    def test_payslip_log_model_has_required_fields(self):
        """Test that payslip log has all required fields."""
        required_fields = ['payslip_name', 'employee_name', 'payslip_status', 'payroll_period', 'basic_salary', 'gross_amount', 'deductions', 'net_amount']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Payslip log should have {field} field'
            )

    def test_payslip_log_inherits_from_orca_log(self):
        """Test that payslip log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Payslip log should inherit from orca.log'
        )

    def test_payslip_create_action_logged(self):
        """Test that creating a payslip generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        logs = self.log_model.search([('record_id', '=', payslip.id)])
        self.assertTrue(len(logs) > 0, 'Payslip creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_payslip_write_action_logged(self):
        """Test that modifying a payslip generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        payslip.write({'state': 'verify'})
        logs = self.log_model.search([('record_id', '=', payslip.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Payslip modification should generate a log entry')

    def test_payslip_unlink_action_logged(self):
        """Test that deleting a payslip generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        payslip_id = payslip.id
        payslip.unlink()
        logs = self.log_model.search([('record_id', '=', payslip_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Payslip deletion should generate a log entry')

    def test_payslip_log_captures_tracked_fields(self):
        """Test that payslip log captures tracked field values."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        payslip.write({'state': 'verify'})
        logs = self.log_model.search([('record_id', '=', payslip.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('state', after_values, 'Tracked fields should be in after_values')

    def test_payslip_log_user_tracking(self):
        """Test that payslip log tracks which user made the change."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        logs = self.log_model.search([('record_id', '=', payslip.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_payslip_log_date_tracking(self):
        """Test that payslip log captures timestamp."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        contract = self.env['hr.contract'].create({
            'name': 'Contract',
            'employee_id': employee.id,
            'date_start': '2024-01-01',
            'wage': 1000,
        })
        payslip = self.payslip_model.create({
            'employee_id': employee.id,
            'contract_id': contract.id,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31',
        })
        logs = self.log_model.search([('record_id', '=', payslip.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_payslip_log_user(self):
        """Test that regular users can read payslip logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read payslip logs')

    def test_access_control_payslip_log_hr_user(self):
        """Test that HR users can read payslip logs."""
        hr_user = self.env['res.users'].create({
            'name': 'Test HR User',
            'login': 'hr_payroll_user@test.com',
            'groups_id': [(6, 0, [self.env.ref('hr.group_hr_user').id])],
        })
        logs = self.log_model.with_user(hr_user).search([])
        self.assertIsNotNone(logs, 'HR users should be able to read payslip logs')

    def test_payslip_log_model_name(self):
        """Test that payslip log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.payslip.log',
            'Payslip log model name incorrect'
        )

    def test_payslip_status_field_selections(self):
        """Test that payslip_status field has correct selections."""
        status_field = self.log_model._fields['payslip_status']
        expected_selections = ['draft', 'verify', 'done', 'cancel']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in payslip_status selections')
