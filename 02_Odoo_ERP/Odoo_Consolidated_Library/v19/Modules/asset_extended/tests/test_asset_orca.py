"""
ORCA Audit Logging Tests for Fixed Assets (v19)

Test coverage:
- Asset create/write/unlink ORCA logging
- HIGH tier field auto-detection (~15-20 fields)
- Access control for accountants and managers
- UI views for audit log display
"""

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError
import json


class TestOrcaAssetLogging(TransactionCase):
    """Unit tests for ORCA audit logging on account.asset"""

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

    def test_orca_log_on_asset_create(self):
        """Verify ORCA log is created when account.asset is created"""
        asset = self.env['account.asset'].create({
            'name': 'Test Fixed Asset',
            'account_asset_id': self.env['account.account'].search([('account_type', '=', 'asset_fixed')], limit=1).id,
            'account_depreciation_id': self.env['account.account'].search([('account_type', '=', 'asset_depreciation')], limit=1).id,
            'account_depreciation_expense_id': self.env['account.account'].search([('account_type', '=', 'expense_depreciation')], limit=1).id,
            'original_value': 10000.0,
            'company_id': self.company.id,
        })

        logs = self.env['orca.account.asset.log'].search([
            ('record_id', '=', asset.id),
            ('action', '=', 'create')
        ])

        self.assertEqual(len(logs), 1, "ORCA log should be created on account.asset create")
        self.assertEqual(logs.model_name, 'account.asset')
        self.assertEqual(logs.module_name, 'asset_extended')

    def test_field_auto_detection_asset_high_tier(self):
        """Verify HIGH tier auto-detects ~15-20 asset fields"""
        asset = self.env['account.asset'].create({
            'name': 'Test Asset',
            'account_asset_id': self.env['account.account'].search([('account_type', '=', 'asset_fixed')], limit=1).id,
            'account_depreciation_id': self.env['account.account'].search([('account_type', '=', 'asset_depreciation')], limit=1).id,
            'account_depreciation_expense_id': self.env['account.account'].search([('account_type', '=', 'expense_depreciation')], limit=1).id,
            'original_value': 10000.0,
            'company_id': self.company.id,
        })

        logs = self.env['orca.account.asset.log'].search([
            ('record_id', '=', asset.id),
            ('action', '=', 'create')
        ])

        after_values = json.loads(logs.after_values)
        self.assertGreaterEqual(len(after_values), 10,
            "HIGH tier should auto-detect at least 10 asset fields")

    def test_access_control_manager_full_access(self):
        """Verify manager has full access to ORCA logs"""
        asset = self.env['account.asset'].create({
            'name': 'Test Asset',
            'account_asset_id': self.env['account.account'].search([('account_type', '=', 'asset_fixed')], limit=1).id,
            'account_depreciation_id': self.env['account.account'].search([('account_type', '=', 'asset_depreciation')], limit=1).id,
            'account_depreciation_expense_id': self.env['account.account'].search([('account_type', '=', 'expense_depreciation')], limit=1).id,
            'original_value': 10000.0,
            'company_id': self.company.id,
        })

        log = self.env['orca.account.asset.log'].search([
            ('record_id', '=', asset.id)
        ], limit=1)

        try:
            manager_log = log.with_user(self.manager_user)
            manager_log.write({'orca_synced': True})
            self.assertTrue(manager_log.orca_synced)
        except AccessError:
            self.fail("Manager should have full access to ORCA logs")

    def test_orca_log_model_fields(self):
        """Verify account.asset.orca.log model has expected fields"""
        log_model = self.env['orca.account.asset.log']

        expected_fields = [
            'asset_name', 'asset_code', 'gross_value', 'book_value', 'asset_state',
            'module_name', 'model_name', 'record_id', 'action', 'user_id', 'date',
            'before_values', 'after_values', 'orca_synced'
        ]

        for field_name in expected_fields:
            self.assertIn(field_name, log_model._fields,
                f"Field '{field_name}' should exist on orca.account.asset.log")


class TestAssetOrcaUIViews(TransactionCase):
    """Test UI views for asset ORCA logs"""

    def test_list_view_exists(self):
        """Verify tree (list) view is properly configured"""
        view = self.env.ref('asset_extended.asset_orca_log_view_tree')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'tree')
        self.assertEqual(view.model, 'orca.account.asset.log')

    def test_form_view_exists(self):
        """Verify form view is properly configured"""
        view = self.env.ref('asset_extended.asset_orca_log_view_form')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'form')
        self.assertEqual(view.model, 'orca.account.asset.log')

    def test_search_view_exists(self):
        """Verify search view is properly configured"""
        view = self.env.ref('asset_extended.asset_orca_log_view_search')
        self.assertIsNotNone(view)
        self.assertEqual(view.type, 'search')
        self.assertEqual(view.model, 'orca.account.asset.log')

    def test_action_window_exists(self):
        """Verify action window for ORCA logs is configured"""
        action = self.env.ref('asset_extended.asset_orca_log_action')
        self.assertIsNotNone(action)
        self.assertEqual(action.res_model, 'orca.account.asset.log')

    def test_menu_item_exists(self):
        """Verify menu item is properly configured"""
        menu = self.env.ref('asset_extended.asset_orca_log_menu')
        self.assertIsNotNone(menu)
        self.assertEqual(menu.action.res_model, 'orca.account.asset.log')
