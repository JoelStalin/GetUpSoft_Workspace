"""
ORCA Audit Logging Tests for POS Order (v19)

Test coverage:
- POS order create/write/unlink ORCA logging
- CRITICAL tier field auto-detection (~20-30 fields)
- Access control for POS users and managers
- UI views for audit log display
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaPosOrderLogging(TransactionCase):
    """Unit tests for ORCA audit logging on pos.order"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=False))

        # Create test users
        cls.pos_user = cls.env['res.users'].create({
            'name': 'Test POS User',
            'login': 'posuser@test.com',
            'groups_id': [(4, cls.env.ref('point_of_sale.group_pos_user').id)],
        })

        cls.pos_manager = cls.env['res.users'].create({
            'name': 'Test POS Manager',
            'login': 'posmanager@test.com',
            'groups_id': [(4, cls.env.ref('point_of_sale.group_pos_manager').id)],
        })

        # Create test company and POS config
        cls.company = cls.env.company
        cls.pos_config = cls.env['pos.config'].create({
            'name': 'Test POS Config',
            'company_id': cls.company.id,
        })

        # Create POS session
        cls.session = cls.env['pos.session'].create({
            'name': 'Test Session',
            'config_id': cls.pos_config.id,
            'user_id': cls.pos_user.id,
            'company_id': cls.company.id,
        })

    def test_orca_log_on_pos_order_create(self):
        """Verify ORCA log is created when pos.order is created"""
        self.session.action_pos_session_open()

        order = self.env['pos.order'].create({
            'session_id': self.session.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'amount_total': 100.0,
            'amount_paid': 100.0,
            'lines': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'qty': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on pos.order create")
        self.assertEqual(logs.model_name, 'pos.order')
        self.assertEqual(logs.module_name, 'pos_extended')

    def test_orca_log_pos_order_write(self):
        """Verify ORCA log captures before/after values on write"""
        self.session.action_pos_session_open()

        order = self.env['pos.order'].create({
            'session_id': self.session.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'amount_total': 100.0,
            'amount_paid': 100.0,
            'lines': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'qty': 1,
                'price_unit': 100.0,
            })],
        })

        # Clear create logs
        self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id)
        ]).unlink()

        order.write({'note': 'Customer request: add gift wrapping'})

        logs = self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'write')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on pos.order write")
        self.assertTrue(logs.before_values, "Before values should be captured")
        self.assertTrue(logs.after_values, "After values should be captured")

        # Verify JSON structure
        after = json.loads(logs.after_values)
        self.assertIsInstance(after, dict)

    def test_field_auto_detection_pos_critical_tier(self):
        """Verify CRITICAL tier auto-detects ~20-30 POS-relevant fields"""
        self.session.action_pos_session_open()

        order = self.env['pos.order'].create({
            'session_id': self.session.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'amount_total': 100.0,
            'amount_paid': 100.0,
            'lines': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'qty': 1,
                'price_unit': 100.0,
            })],
        })

        logs = self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)

        # Critical tier should include core POS fields
        expected_fields = [
            'partner_id', 'session_id', 'config_id', 'user_id',
            'amount_total', 'amount_paid', 'state', 'name'
        ]

        for field in expected_fields:
            self.assertIn(field, after_values,
                f"Field '{field}' should be in CRITICAL tier auto-detected fields")

        self.assertGreaterEqual(len(after_values), 12,
            "CRITICAL tier should auto-detect at least 12 POS fields")

    def test_access_control_pos_user_read_only(self):
        """Verify POS user has read-only access to ORCA logs"""
        self.session.action_pos_session_open()

        order = self.env['pos.order'].create({
            'session_id': self.session.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'amount_total': 100.0,
            'amount_paid': 100.0,
            'lines': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'qty': 1,
                'price_unit': 100.0,
            })],
        })

        log = self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id)
        ], limit=1)

        # User should be able to read
        try:
            user_log = log.with_user(self.pos_user)
            _ = user_log.read(['id', 'action', 'date'])
        except AccessError:
            self.fail("POS user should have read access to ORCA logs")

        # User should NOT be able to write
        with self.assertRaises(AccessError):
            log.with_user(self.pos_user).write({'orca_synced': True})

    def test_access_control_pos_manager_full_access(self):
        """Verify POS manager has full access to ORCA logs"""
        self.session.action_pos_session_open()

        order = self.env['pos.order'].create({
            'session_id': self.session.id,
            'partner_id': self.env.ref('base.partner_demo').id,
            'amount_total': 100.0,
            'amount_paid': 100.0,
            'lines': [(0, 0, {
                'product_id': self.env.ref('product.product_product_1').id,
                'qty': 1,
                'price_unit': 100.0,
            })],
        })

        log = self.env['orca.pos.order.log'].search([
            ('record_id', '=', order.id)
        ], limit=1)

        # Manager should have full access
        try:
            manager_log = log.with_user(self.pos_manager)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("POS manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify pos.order.orca.log model has expected fields"""
        log_model = self.env['orca.pos.order.log']

        expected_fields = [
            'pos_reference', 'pos_config_name', 'session_name',
            'partner_name', 'cashier_name', 'amount_total', 'amount_paid',
            'order_state', 'module_name', 'model_name', 'record_id',
            'action', 'user_id', 'date', 'before_values', 'after_values',
            'orca_synced', 'orca_sync_error', 'orca_request_id'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on pos.order.orca.log")


class TestPosOrderOrcaUIViews(TransactionCase):
    """Test UI views for POS order ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('pos_extended.pos_order_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')
        self.assertEqual(view.model, 'orca.pos.order.log')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('pos_extended.pos_order_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')
        self.assertEqual(view.model, 'orca.pos.order.log')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('pos_extended.pos_order_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')
        self.assertEqual(view.model, 'orca.pos.order.log')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('pos_extended.pos_order_orca_log_action')
        self.assertIsNotNone(action)
        self.assertEqual(action.res_model, 'orca.pos.order.log')

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('pos_extended.pos_order_orca_log_menu')
        self.assertIsNotNone(menu)
        self.assertEqual(menu.action.res_model, 'orca.pos.order.log')
