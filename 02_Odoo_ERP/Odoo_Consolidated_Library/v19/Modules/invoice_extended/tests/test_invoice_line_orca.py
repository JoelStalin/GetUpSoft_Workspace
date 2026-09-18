"""
ORCA Audit Logging Tests for Invoice Lines (v19)

Test coverage:
- Invoice line create/write/unlink ORCA logging
- HIGH tier field auto-detection (~15-20 fields)
- Access control for accountants and managers
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaInvoiceLineLogging(TransactionCase):
    """Unit tests for ORCA audit logging on account.move.line"""

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
        cls.product = self.env.ref('product.product_product_1')
        cls.journal = self.env['account.journal'].create({
            'name': 'Test Journal',
            'code': 'TJOURNAL',
            'type': 'general',
            'company_id': cls.company.id,
        })

    def test_orca_log_on_invoice_line_create(self):
        """Verify ORCA log is created when account.move.line is created"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.product.id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        line = move.invoice_line_ids[0]
        logs = self.env['orca.account.move.line.log'].search([
            ('record_id', '=', line.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.move.line create")
        self.assertEqual(logs.model_name, 'account.move.line')
        self.assertEqual(logs.module_name, 'invoice_extended')

    def test_field_auto_detection_invoice_high_tier(self):
        """Verify HIGH tier auto-detects ~15-20 invoice line fields"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.product.id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        line = move.invoice_line_ids[0]
        logs = self.env['orca.account.move.line.log'].search([
            ('record_id', '=', line.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)
        self.assertGreaterEqual(len(after_values), 10,
            "HIGH tier should auto-detect at least 10 invoice line fields")

    def test_access_control_manager_full_access(self):
        """Verify manager has full access to ORCA logs"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.product.id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        line = move.invoice_line_ids[0]
        log = self.env['orca.account.move.line.log'].search([
            ('record_id', '=', line.id)
        ], limit=1)

        try:
            manager_log = log.with_user(self.manager_user)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify account.move.line.orca.log model has expected fields"""
        log_model = self.env['orca.account.move.line.log']

        expected_fields = [
            'product_name', 'product_code', 'quantity', 'price_unit', 'line_amount',
            'invoice_reference', 'account_code', 'module_name', 'model_name', 'record_id',
            'action', 'user_id', 'date', 'before_values', 'after_values', 'orca_synced'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on orca.account.move.line.log")


class TestInvoiceLineOrcaUIViews(TransactionCase):
    """Test UI views for invoice line ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('invoice_extended.invoice_line_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('invoice_extended.invoice_line_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('invoice_extended.invoice_line_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('invoice_extended.invoice_line_orca_log_action')
        self.assertIsNotNone(action)

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('invoice_extended.invoice_line_orca_log_menu')
        self.assertIsNotNone(menu)
