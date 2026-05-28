"""
ORCA Audit Logging Tests for Sale Order (v19)

Test coverage:
- Sale order create/write/unlink ORCA logging
- CRITICAL tier field auto-detection (~20-30 fields)
- Access control for sales users and managers
- UI views for audit log display
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaSaleOrderLogging(TransactionCase):
    """Unit tests for ORCA audit logging on sale.order"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=False))

        # Create test users
        cls.sales_user = cls.env['res.users'].create({
            'name': 'Test Sales User',
            'login': 'salesuser@test.com',
            'groups_id': [(4, cls.env.ref('sales_team.group_sale_salesman').id)],
        })

        cls.sales_manager = cls.env['res.users'].create({
            'name': 'Test Sales Manager',
            'login': 'salesmanager@test.com',
            'groups_id': [(4, cls.env.ref('sales_team.group_sale_manager').id)],
        })

        cls.company = cls.env.company

    def test_orca_log_on_sale_order_create(self):
        """Verify ORCA log is created when sale.order is created"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.partner_demo').id,
            'user_id': self.sales_user.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on sale.order create")
        self.assertEqual(logs.model_name, 'sale.order')
        self.assertEqual(logs.module_name, 'sale_extended')

    def test_orca_log_sale_order_write(self):
        """Verify ORCA log captures before/after values on write"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.partner_demo').id,
            'user_id': self.sales_user.id,
            'company_id': self.company.id,
        })

        # Clear create logs
        self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id)
        ]).unlink()

        order.write({'note': 'Special customer notes for this order'})

        logs = self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'write')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on sale.order write")
        self.assertTrue(logs.before_values, "Before values should be captured")
        self.assertTrue(logs.after_values, "After values should be captured")

        # Verify JSON structure
        after = json.loads(logs.after_values)
        self.assertIsInstance(after, dict)

    def test_field_auto_detection_sale_critical_tier(self):
        """Verify CRITICAL tier auto-detects ~20-30 sales-relevant fields"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.partner_demo').id,
            'user_id': self.sales_user.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)

        # Critical tier should include core sales fields
        expected_fields = [
            'partner_id', 'user_id', 'state', 'name',
            'amount_total', 'amount_untaxed', 'company_id',
            'validity_date', 'date_order'
        ]

        for field in expected_fields:
            self.assertIn(field, after_values,
                f"Field '{field}' should be in CRITICAL tier auto-detected fields")

        self.assertGreaterEqual(len(after_values), 15,
            "CRITICAL tier should auto-detect at least 15 sales fields")

    def test_access_control_sales_user_read_only(self):
        """Verify sales user has read-only access to ORCA logs"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.partner_demo').id,
            'user_id': self.sales_user.id,
            'company_id': self.company.id,
        })

        log = self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id)
        ], limit=1)

        # User should be able to read
        try:
            user_log = log.with_user(self.sales_user)
            _ = user_log.read(['id', 'action', 'date'])
        except AccessError:
            self.fail("Sales user should have read access to ORCA logs")

        # User should NOT be able to write
        with self.assertRaises(AccessError):
            log.with_user(self.sales_user).write({'orca_synced': True})

    def test_access_control_sales_manager_full_access(self):
        """Verify sales manager has full access to ORCA logs"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.partner_demo').id,
            'user_id': self.sales_user.id,
            'company_id': self.company.id,
        })

        log = self.env['orca.sale.order.log'].search([
            ('record_id', '=', order.id)
        ], limit=1)

        # Manager should have full access
        try:
            manager_log = log.with_user(self.sales_manager)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Sales manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify sale.order.orca.log model has expected fields"""
        log_model = self.env['orca.sale.order.log']

        expected_fields = [
            'order_reference', 'partner_name', 'salesperson_name',
            'amount_total', 'amount_untaxed', 'order_state',
            'module_name', 'model_name', 'record_id', 'action',
            'user_id', 'date', 'before_values', 'after_values',
            'orca_synced', 'orca_sync_error', 'orca_request_id'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on sale.order.orca.log")


class TestSaleOrderOrcaUIViews(TransactionCase):
    """Test UI views for sale order ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('sale_extended.sale_order_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')
        self.assertEqual(view.model, 'orca.sale.order.log')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('sale_extended.sale_order_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')
        self.assertEqual(view.model, 'orca.sale.order.log')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('sale_extended.sale_order_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')
        self.assertEqual(view.model, 'orca.sale.order.log')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('sale_extended.sale_order_orca_log_action')
        self.assertIsNotNone(action)
        self.assertEqual(action.res_model, 'orca.sale.order.log')

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('sale_extended.sale_order_orca_log_menu')
        self.assertIsNotNone(menu)
        self.assertEqual(menu.action.res_model, 'orca.sale.order.log')
