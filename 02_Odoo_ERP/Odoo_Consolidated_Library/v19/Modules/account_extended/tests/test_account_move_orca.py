"""
ORCA Audit Logging Tests for Account Move (v19)

Test coverage:
- T1.6: ORCA log creation on account.move create/write/unlink
- T1.7: Field auto-detection (CRITICAL tier ~20-30 fields)
- T1.8: Access control (read-only for accountant, read/write/create for manager)
- T1.9: Module installation and model availability
- T1.10: Log entries visible in UI (list/form views)
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaAccountMoveLogging(TransactionCase):
    """Unit tests for ORCA audit logging on account.move"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=False))

        # Create test users
        cls.manager_user = cls.env['res.users'].create({
            'name': 'Test Manager',
            'login': 'manager@test.com',
            'groups_id': [(4, cls.env.ref('account.group_account_manager').id)],
        })

        cls.accountant_user = cls.env['res.users'].create({
            'name': 'Test Accountant',
            'login': 'accountant@test.com',
            'groups_id': [(4, cls.env.ref('account.group_account_user').id)],
        })

        # Create test company and journal
        cls.company = cls.env.company
        cls.journal = cls.env['account.journal'].create({
            'name': 'Test Journal',
            'code': 'TJOURNAL',
            'type': 'general',
            'company_id': cls.company.id,
        })

    def test_orca_log_on_create(self):
        """T1.6: Verify ORCA log is created when account.move is created"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.move create")
        self.assertEqual(logs.model_name, 'account.move')
        self.assertEqual(logs.module_name, 'account_extended')
        self.assertFalse(logs.orca_synced, "New logs should not be synced yet")

    def test_orca_log_on_write(self):
        """T1.6: Verify ORCA log captures before/after values on write"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        # Clear create logs to isolate write test
        self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ]).unlink()

        original_ref = move.ref
        move.write({'ref': 'TEST-INVOICE-001'})

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'write')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.move write")
        self.assertTrue(logs.before_values, "Before values should be captured")
        self.assertTrue(logs.after_values, "After values should be captured")

        # Verify JSON structure
        before = json.loads(logs.before_values)
        after = json.loads(logs.after_values)
        self.assertIsInstance(before, dict)
        self.assertIsInstance(after, dict)

    def test_orca_log_on_unlink(self):
        """T1.6: Verify ORCA log is created when account.move is deleted"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        move_id = move.id
        move.unlink()

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move_id),
            ('action', '=', 'unlink')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.move unlink")

    def test_field_auto_detection_critical_tier(self):
        """T1.7: Verify CRITICAL tier auto-detects ~20-30 accounting fields"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)

        # Critical tier should include core accounting fields
        expected_fields = [
            'state', 'move_type', 'journal_id', 'partner_id',
            'amount_total', 'amount_untaxed', 'invoice_date',
            'invoice_user_id', 'narration'
        ]

        for field in expected_fields:
            self.assertIn(field, after_values,
                f"Field '{field}' should be in CRITICAL tier auto-detected fields")

        self.assertGreaterEqual(len(after_values), 15,
            "CRITICAL tier should auto-detect at least 15 accounting fields")

    def test_access_control_accountant_read_only(self):
        """T1.8: Verify accountant has read-only access to ORCA logs"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        log = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ], limit=1)

        # Accountant should be able to read
        try:
            accountant_log = log.with_user(self.accountant_user)
            _ = accountant_log.read(['id', 'action', 'date'])
        except AccessError:
            self.fail("Accountant should have read access to ORCA logs")

        # Accountant should NOT be able to write
        with self.assertRaises(AccessError):
            log.with_user(self.accountant_user).write({'orca_synced': True})

    def test_access_control_manager_full_access(self):
        """T1.8: Verify manager has full access to ORCA logs"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        log = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ], limit=1)

        # Manager should be able to read, write, and create
        try:
            manager_log = log.with_user(self.manager_user)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """T1.9: Verify account.move.orca.log model has expected fields"""
        log_model = self.env['account.move.orca.log']

        # Check inherited orca.log fields
        expected_fields = [
            'module_name', 'model_name', 'record_id', 'action',
            'user_id', 'date', 'before_values', 'after_values',
            'orca_synced', 'orca_sync_error', 'orca_request_id'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on account.move.orca.log")

    def test_orca_log_user_tracking(self):
        """T1.6: Verify ORCA logs track the user who made the change"""
        move = self.env['account.move'].with_user(self.manager_user).create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ])

        for log in logs:
            self.assertEqual(log.user_id.id, self.manager_user.id,
                "ORCA log should track the user who made the change")

    def test_orca_log_timestamp(self):
        """T1.6: Verify ORCA logs have accurate timestamps"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': self.journal.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'invoice_date': '2026-05-28',
            'invoice_line_ids': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'quantity': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ])

        for log in logs:
            self.assertIsNotNone(log.date, "ORCA log should have a date timestamp")
            self.assertGreater(log.date, '2026-01-01', "Log date should be recent")


class TestAccountMoveOrcaUIViews(TransactionCase):
    """Test UI views for ORCA audit logs (T1.10)"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.move_orca_log_model = cls.env['account.move.orca.log']

    def test_list_view_exists(self):
        """T1.10: Verify tree (list) view is properly configured"""
        view = self.env.ref('account_extended.account_move_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')
        self.assertEqual(view.model, 'account.move.orca.log')

    def test_form_view_exists(self):
        """T1.10: Verify form view is properly configured"""
        view = self.env.ref('account_extended.account_move_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')
        self.assertEqual(view.model, 'account.move.orca.log')

    def test_search_view_exists(self):
        """T1.10: Verify search view is properly configured"""
        view = self.env.ref('account_extended.account_move_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')
        self.assertEqual(view.model, 'account.move.orca.log')

    def test_action_window_exists(self):
        """T1.10: Verify action window for ORCA logs is configured"""
        action = self.env.ref('account_extended.account_move_orca_log_action')
        self.assertIsNotNone(action)
        self.assertEqual(action.res_model, 'account.move.orca.log')

    def test_menu_item_exists(self):
        """T1.10: Verify menu item is properly configured"""
        menu = self.env.ref('account_extended.account_move_orca_log_menu')
        self.assertIsNotNone(menu)
        self.assertEqual(menu.action.res_model, 'account.move.orca.log')
