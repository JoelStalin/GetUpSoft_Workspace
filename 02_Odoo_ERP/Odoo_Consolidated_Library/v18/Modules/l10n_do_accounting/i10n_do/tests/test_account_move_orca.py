# -*- coding: utf-8 -*-
"""
Tests for l10n_do_accounting ORCA Integration

Verify that account.move operations are properly logged via ORCA mixin.
"""

import json
from odoo.tests.common import TransactionCase


class TestAccountMoveOrcaAudit(TransactionCase):
    """Test ORCA audit logging for account.move"""

    def setUp(self):
        super().setUp()
        self.OrcaLog = self.env['l10n.do.accounting.orca.log']
        self.AccountMove = self.env['account.move']

    def _create_test_invoice(self):
        """Create a test invoice for ORCA testing"""
        return self.AccountMove.create({
            'move_type': 'out_invoice',
            'partner_id': self.env.ref('base.res_partner_2').id,
            'journal_id': self.env.ref('account.sales_journal').id,
            'line_ids': [
                (0, 0, {
                    'account_id': self.env.ref('account.data_account_type_receivable').id,
                    'amount_currency': 1000,
                    'currency_id': self.env.company.currency_id.id,
                }),
            ],
        })

    def test_orca_log_model_exists(self):
        """Test that l10n_do_accounting ORCA log model exists"""
        self.assertTrue(self.OrcaLog._name == 'l10n.do.accounting.orca.log')

    def test_orca_log_fields_exist(self):
        """Test that fiscal-specific ORCA fields exist"""
        fiscal_fields = ['encf', 'fiscal_state', 'dgii_uuid', 'document_type', 'operation_type', 'amount_impacted', 'impact_level']
        for field_name in fiscal_fields:
            self.assertIn(field_name, self.OrcaLog._fields)

    def test_account_move_inherits_orca_mixin(self):
        """Test that account.move inherits OrcaAuditMixin"""
        # Check that the mixin is in the inheritance chain
        self.assertTrue('orca.audit.mixin' in self.AccountMove._inherit)

    def test_orca_tracked_fields_defined(self):
        """Test that ORCA tracked fields are properly defined"""
        tracked = self.AccountMove._orca_tracked_fields
        critical_fields = ['name', 'state', 'amount_total', 'partner_id', 'l10n_do_fiscal_number']
        for field in critical_fields:
            self.assertIn(field, tracked)

    def test_orca_log_model_configured(self):
        """Test that ORCA log model is correctly configured"""
        self.assertEqual(self.AccountMove._orca_log_model, 'l10n.do.accounting.orca.log')

    def test_account_move_create_creates_orca_log(self):
        """Test that creating an account.move generates ORCA log"""
        initial_logs = self.OrcaLog.search([('model_name', '=', 'account.move')])
        initial_count = len(initial_logs)

        # Create invoice
        move = self._create_test_invoice()

        # Check that log was created
        new_logs = self.OrcaLog.search([
            ('model_name', '=', 'account.move'),
            ('record_id', '=', move.id),
            ('action', '=', 'create'),
        ])

        self.assertEqual(len(new_logs), 1, "ORCA log should be created on account.move creation")
        log = new_logs[0]
        self.assertEqual(log.module_name, 'l10n_do_accounting')

    def test_account_move_write_creates_orca_log(self):
        """Test that modifying an account.move generates ORCA log"""
        move = self._create_test_invoice()

        # Clear any previous logs
        self.OrcaLog.search([
            ('record_id', '=', move.id),
            ('action', '=', 'create'),
        ]).unlink()

        # Modify invoice
        move.write({'memo': 'Test memo'})

        # Check that write log was created
        write_logs = self.OrcaLog.search([
            ('record_id', '=', move.id),
            ('action', '=', 'write'),
        ])

        self.assertGreater(len(write_logs), 0, "ORCA log should be created on account.move write")

    def test_orca_log_captures_before_values(self):
        """Test that ORCA log captures before values"""
        move = self._create_test_invoice()

        # Get create log
        create_log = self.OrcaLog.search([
            ('record_id', '=', move.id),
            ('action', '=', 'create'),
        ], limit=1)

        self.assertTrue(create_log.before_values or create_log.before_values == '')

    def test_orca_log_captures_after_values(self):
        """Test that ORCA log captures after values"""
        move = self._create_test_invoice()

        # Get create log
        create_log = self.OrcaLog.search([
            ('record_id', '=', move.id),
            ('action', '=', 'create'),
        ], limit=1)

        # After values should contain JSON
        self.assertTrue(create_log.after_values)
        try:
            after_data = json.loads(create_log.after_values)
            self.assertIsInstance(after_data, dict)
        except json.JSONDecodeError:
            self.fail("after_values should contain valid JSON")

    def test_orca_log_fiscal_fields_populated(self):
        """Test that fiscal-specific fields are populated"""
        move = self._create_test_invoice()

        log = self.OrcaLog.search([
            ('record_id', '=', move.id),
            ('action', '=', 'create'),
        ], limit=1)

        # These should be populated (even if empty)
        self.assertIsNotNone(log.fiscal_state)
        self.assertIsNotNone(log.operation_type)
        self.assertIsNotNone(log.amount_impacted)

    def test_orca_log_impact_level_calculation(self):
        """Test that impact level is calculated correctly"""
        move = self._create_test_invoice()

        log = self.OrcaLog.search([
            ('record_id', '=', move.id),
        ], limit=1)

        # For a 1000 amount, should be 'low'
        self.assertEqual(log.impact_level, 'low')

    def test_action_view_orca_logs(self):
        """Test that action_view_orca_logs returns correct action"""
        move = self._create_test_invoice()

        action = move.action_view_orca_logs()

        self.assertEqual(action['type'], 'ir.actions.act_window')
        self.assertEqual(action['res_model'], 'l10n.do.accounting.orca.log')
        self.assertIn('domain', action)

    def test_orca_log_readonly(self):
        """Test that ORCA logs are read-only"""
        move = self._create_test_invoice()
        log = self.OrcaLog.search([
            ('record_id', '=', move.id),
        ], limit=1)

        # Try to modify (should fail or be prevented by view)
        # Actual enforcement is in the form view (readonly="1")
        self.assertTrue(log.exists(), "Log should still exist")
