import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestExpenseOrcaLogging(TransactionCase):
    """Test suite for expense ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.expense_model = self.env['hr.expense']
        self.log_model = self.env['orca.expense.log']

    def test_hr_expense_inherits_orca_mixin(self):
        """Test that hr.expense inherits orca.universal.mixin."""
        self.assertTrue(
            self.expense_model._inherits.get('orca.universal.mixin'),
            'hr.expense should inherit orca.universal.mixin'
        )

    def test_expense_orca_tier_high(self):
        """Test that hr.expense has HIGH tier classification."""
        self.assertEqual(
            self.expense_model._orca_tier,
            'high',
            'hr.expense should have HIGH tier'
        )

    def test_expense_log_model_configured(self):
        """Test that expense log model is properly configured."""
        self.assertEqual(
            self.expense_model._orca_log_model,
            'orca.expense.log',
            'Expense should use orca.expense.log'
        )

    def test_expense_log_model_has_required_fields(self):
        """Test that expense log has all required fields."""
        required_fields = ['expense_ref', 'employee_name', 'expense_date', 'expense_category', 'expense_amount', 'currency', 'expense_status', 'payment_method']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Expense log should have {field} field'
            )

    def test_expense_log_inherits_from_orca_log(self):
        """Test that expense log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Expense log should inherit from orca.log'
        )

    def test_expense_create_action_logged(self):
        """Test that creating an expense generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        logs = self.log_model.search([('record_id', '=', expense.id)])
        self.assertTrue(len(logs) > 0, 'Expense creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_expense_write_action_logged(self):
        """Test that modifying an expense generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        expense.write({'unit_amount': 150.0})
        logs = self.log_model.search([('record_id', '=', expense.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Expense modification should generate a log entry')

    def test_expense_unlink_action_logged(self):
        """Test that deleting an expense generates an ORCA log entry."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        expense_id = expense.id
        expense.unlink()
        logs = self.log_model.search([('record_id', '=', expense_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Expense deletion should generate a log entry')

    def test_expense_log_captures_tracked_fields(self):
        """Test that expense log captures tracked field values."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        expense.write({'unit_amount': 150.0})
        logs = self.log_model.search([('record_id', '=', expense.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('unit_amount', after_values, 'Tracked fields should be in after_values')

    def test_expense_log_user_tracking(self):
        """Test that expense log tracks which user made the change."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        logs = self.log_model.search([('record_id', '=', expense.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_expense_log_date_tracking(self):
        """Test that expense log captures timestamp."""
        employee = self.env['hr.employee'].create({'name': 'Test Employee'})
        product = self.env['product.product'].search([('name', 'ilike', 'expense')], limit=1)
        if not product:
            product = self.env['product.product'].create({'name': 'Expense Product'})
        expense = self.expense_model.create({
            'employee_id': employee.id,
            'product_id': product.id,
            'unit_amount': 100.0,
            'date': '2024-01-15',
        })
        logs = self.log_model.search([('record_id', '=', expense.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_expense_log_user(self):
        """Test that regular users can read expense logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read expense logs')

    def test_access_control_expense_log_hr_user(self):
        """Test that HR users can read expense logs."""
        hr_user = self.env['res.users'].create({
            'name': 'Test HR User',
            'login': 'hr_expense_user@test.com',
            'groups_id': [(6, 0, [self.env.ref('hr.group_hr_user').id])],
        })
        logs = self.log_model.with_user(hr_user).search([])
        self.assertIsNotNone(logs, 'HR users should be able to read expense logs')

    def test_expense_log_model_name(self):
        """Test that expense log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.expense.log',
            'Expense log model name incorrect'
        )

    def test_expense_status_field_selections(self):
        """Test that expense_status field has correct selections."""
        status_field = self.log_model._fields['expense_status']
        expected_selections = ['draft', 'reported', 'approved', 'done', 'cancelled']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in expense_status selections')
