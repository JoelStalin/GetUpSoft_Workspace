import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPayrollEntryOrcaLogging(TransactionCase):
    """Test suite for payroll entry ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.move_model = self.env['account.move']
        self.log_model = self.env['orca.payroll.entry.log']

    def test_account_move_inherits_orca_mixin(self):
        """Test that account.move inherits orca.universal.mixin for payroll entries."""
        self.assertTrue(
            self.move_model._inherits.get('orca.universal.mixin'),
            'account.move should inherit orca.universal.mixin'
        )

    def test_payroll_entry_orca_tier_critical(self):
        """Test that payroll accounting entry has CRITICAL tier classification."""
        self.assertEqual(
            self.move_model._orca_tier,
            'critical',
            'Payroll accounting entry should have CRITICAL tier'
        )

    def test_payroll_entry_log_model_configured(self):
        """Test that payroll entry log model is properly configured."""
        self.assertEqual(
            self.move_model._orca_log_model,
            'orca.payroll.entry.log',
            'Payroll entry should use orca.payroll.entry.log'
        )

    def test_payroll_entry_log_model_has_required_fields(self):
        """Test that payroll entry log has all required fields."""
        required_fields = ['entry_ref', 'entry_type', 'account_code', 'account_name', 'debit_amount', 'credit_amount', 'entry_status']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Payroll entry log should have {field} field'
            )

    def test_payroll_entry_log_inherits_from_orca_log(self):
        """Test that payroll entry log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Payroll entry log should inherit from orca.log'
        )

    def test_payroll_entry_create_action_logged(self):
        """Test that creating a payroll entry generates an ORCA log entry."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        logs = self.log_model.search([('record_id', '=', move.id)])
        self.assertTrue(len(logs) > 0, 'Payroll entry creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_payroll_entry_write_action_logged(self):
        """Test that modifying a payroll entry generates an ORCA log entry."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        move.write({'ref': 'Updated Payroll Entry'})
        logs = self.log_model.search([('record_id', '=', move.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Payroll entry modification should generate a log entry')

    def test_payroll_entry_unlink_action_logged(self):
        """Test that deleting a payroll entry generates an ORCA log entry."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        move_id = move.id
        move.unlink()
        logs = self.log_model.search([('record_id', '=', move_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Payroll entry deletion should generate a log entry')

    def test_payroll_entry_log_captures_tracked_fields(self):
        """Test that payroll entry log captures tracked field values."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        move.write({'ref': 'Updated Payroll Entry'})
        logs = self.log_model.search([('record_id', '=', move.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('ref', after_values, 'Tracked fields should be in after_values')

    def test_payroll_entry_log_user_tracking(self):
        """Test that payroll entry log tracks which user made the change."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        logs = self.log_model.search([('record_id', '=', move.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_payroll_entry_log_date_tracking(self):
        """Test that payroll entry log captures timestamp."""
        journal = self.env['account.journal'].search([('type', '=', 'general')], limit=1)
        if not journal:
            journal = self.env['account.journal'].create({
                'name': 'Test Journal',
                'type': 'general',
                'code': 'TEST'
            })
        move = self.move_model.create({
            'journal_id': journal.id,
            'date': '2024-01-01',
            'ref': 'Payroll Entry 01/2024',
            'move_type': 'entry',
        })
        logs = self.log_model.search([('record_id', '=', move.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_payroll_entry_log_accountant(self):
        """Test that accountants can read payroll entry logs."""
        accountant = self.env['res.users'].create({
            'name': 'Test Accountant',
            'login': 'accountant_payroll@test.com',
            'groups_id': [(6, 0, [self.env.ref('account.group_account_accountant').id])],
        })
        logs = self.log_model.with_user(accountant).search([])
        self.assertIsNotNone(logs, 'Accountants should be able to read payroll entry logs')

    def test_access_control_payroll_entry_log_manager(self):
        """Test that managers can read payroll entry logs."""
        manager = self.env['res.users'].create({
            'name': 'Test Manager',
            'login': 'manager_payroll@test.com',
            'groups_id': [(6, 0, [self.env.ref('account.group_account_manager').id])],
        })
        logs = self.log_model.with_user(manager).search([])
        self.assertIsNotNone(logs, 'Managers should be able to read payroll entry logs')

    def test_payroll_entry_log_model_name(self):
        """Test that payroll entry log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.payroll.entry.log',
            'Payroll entry log model name incorrect'
        )

    def test_entry_type_field_selections(self):
        """Test that entry_type field has correct selections."""
        entry_type_field = self.log_model._fields['entry_type']
        expected_selections = ['salary', 'tax', 'contribution', 'advance', 'deduction']
        actual_selections = [s[0] for s in entry_type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in entry_type selections')

    def test_entry_status_field_selections(self):
        """Test that entry_status field has correct selections."""
        status_field = self.log_model._fields['entry_status']
        expected_selections = ['draft', 'posted', 'reconciled', 'cancelled']
        actual_selections = [s[0] for s in status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in entry_status selections')
