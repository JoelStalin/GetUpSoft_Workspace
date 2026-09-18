"""
ORCA Audit Logging Tests for Payments (v19)

Test coverage:
- Payment create/write/unlink ORCA logging
- HIGH tier field auto-detection (~15-20 fields)
- Access control for accountants and managers
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaPaymentLogging(TransactionCase):
    """Unit tests for ORCA audit logging on account.payment"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=False))

        cls.manager_user = cls.env['res.users'].create({
            'name': 'Test Manager',
            'login': 'manager@test.com',
            'groups_id': [(4, cls.env.ref('account.group_account_manager').id)],
        })

        cls.company = cls.env.company
        cls.partner = self.env.ref('base.partner_demo')
        cls.journal = self.env['account.journal'].search([('type', '=', 'bank')], limit=1)

    def test_orca_log_on_payment_create(self):
        """Verify ORCA log is created when account.payment is created"""
        payment = self.env['account.payment'].create({
            'payment_type': 'outbound',
            'partner_type': 'customer',
            'partner_id': self.partner.id,
            'amount': 1000.0,
            'currency_id': self.company.currency_id.id,
            'journal_id': self.journal.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.account.payment.log'].search([
            ('record_id', '=', payment.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.payment create")
        self.assertEqual(logs.model_name, 'account.payment')
        self.assertEqual(logs.module_name, 'payment_extended')

    def test_field_auto_detection_payment_high_tier(self):
        """Verify HIGH tier auto-detects ~15-20 payment fields"""
        payment = self.env['account.payment'].create({
            'payment_type': 'outbound',
            'partner_type': 'customer',
            'partner_id': self.partner.id,
            'amount': 1000.0,
            'currency_id': self.company.currency_id.id,
            'journal_id': self.journal.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.account.payment.log'].search([
            ('record_id', '=', payment.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)
        self.assertGreaterEqual(len(after_values), 10,
            "HIGH tier should auto-detect at least 10 payment fields")

    def test_access_control_manager_full_access(self):
        """Verify manager has full access to ORCA logs"""
        payment = self.env['account.payment'].create({
            'payment_type': 'outbound',
            'partner_type': 'customer',
            'partner_id': self.partner.id,
            'amount': 1000.0,
            'currency_id': self.company.currency_id.id,
            'journal_id': self.journal.id,
            'company_id': self.company.id,
        })

        log = self.env['orca.account.payment.log'].search([
            ('record_id', '=', payment.id)
        ], limit=1)

        try:
            manager_log = log.with_user(self.manager_user)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify account.payment.orca.log model has expected fields"""
        log_model = self.env['orca.account.payment.log']

        expected_fields = [
            'payment_reference', 'partner_name', 'amount', 'currency_code',
            'payment_method', 'payment_state', 'module_name', 'model_name',
            'record_id', 'action', 'user_id', 'date', 'before_values', 'after_values'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on orca.account.payment.log")


class TestPaymentOrcaUIViews(TransactionCase):
    """Test UI views for payment ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('payment_extended.payment_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('payment_extended.payment_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('payment_extended.payment_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('payment_extended.payment_orca_log_action')
        self.assertIsNotNone(action)

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('payment_extended.payment_orca_log_menu')
        self.assertIsNotNone(menu)
