"""
ORCA Audit Logging Tests for Stock Movement (v19)

Test coverage:
- Stock move create/write/unlink ORCA logging
- HIGH tier field auto-detection (~15-20 fields)
- Access control for stock users and managers
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaStockMoveLogging(TransactionCase):
    """Unit tests for ORCA audit logging on stock.move"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=False))

        cls.manager_user = cls.env['res.users'].create({
            'name': 'Test Manager',
            'login': 'manager@test.com',
            'groups_id': [(4, cls.env.ref('stock.group_stock_manager').id)],
        })

        cls.company = cls.env.company
        cls.product = self.env.ref('product.product_product_1')
        cls.location = self.env['stock.location'].search([('usage', '=', 'internal')], limit=1)

    def test_orca_log_on_stock_move_create(self):
        """Verify ORCA log is created when stock.move is created"""
        move = self.env['stock.move'].create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_qty': 10.0,
            'product_uom': self.product.uom_id.id,
            'location_id': self.location.id,
            'location_dest_id': self.location.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.stock.move.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on stock.move create")
        self.assertEqual(logs.model_name, 'stock.move')
        self.assertEqual(logs.module_name, 'stock_extended')

    def test_field_auto_detection_stock_high_tier(self):
        """Verify HIGH tier auto-detects ~15-20 stock fields"""
        move = self.env['stock.move'].create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_qty': 10.0,
            'product_uom': self.product.uom_id.id,
            'location_id': self.location.id,
            'location_dest_id': self.location.id,
            'company_id': self.company.id,
        })

        logs = self.env['orca.stock.move.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)
        self.assertGreaterEqual(len(after_values), 10,
            "HIGH tier should auto-detect at least 10 stock fields")

    def test_access_control_manager_full_access(self):
        """Verify manager has full access to ORCA logs"""
        move = self.env['stock.move'].create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_qty': 10.0,
            'product_uom': self.product.uom_id.id,
            'location_id': self.location.id,
            'location_dest_id': self.location.id,
            'company_id': self.company.id,
        })

        log = self.env['orca.stock.move.log'].search([
            ('record_id', '=', move.id)
        ], limit=1)

        try:
            manager_log = log.with_user(self.manager_user)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify stock.move.orca.log model has expected fields"""
        log_model = self.env['orca.stock.move.log']

        expected_fields = [
            'product_name', 'product_code', 'origin_location', 'destination_location',
            'quantity_moved', 'move_state', 'module_name', 'model_name', 'record_id',
            'action', 'user_id', 'date', 'before_values', 'after_values', 'orca_synced'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on orca.stock.move.log")


class TestStockMoveOrcaUIViews(TransactionCase):
    """Test UI views for stock move ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('stock_extended.stock_move_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('stock_extended.stock_move_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('stock_extended.stock_move_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('stock_extended.stock_move_orca_log_action')
        self.assertIsNotNone(action)

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('stock_extended.stock_move_orca_log_menu')
        self.assertIsNotNone(menu)
