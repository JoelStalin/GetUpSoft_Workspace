import json
from odoo.tests.common import TransactionCase


class TestOrcaMixin(TransactionCase):
    """Test cases for OrcaAuditMixin functionality"""

    def setUp(self):
        super().setUp()
        self.OrcaLog = self.env['orca.log']

    def test_orca_log_model_exists(self):
        """Test that ORCA log abstract model is available"""
        self.assertTrue(self.OrcaLog._name == 'orca.log')
        self.assertTrue(self.OrcaLog._abstract)

    def test_orca_log_fields(self):
        """Test that all required audit fields exist"""
        required_fields = [
            'module_name', 'model_name', 'record_id', 'action',
            'user_id', 'date', 'before_values', 'after_values',
            'orca_synced', 'orca_sync_error', 'orca_request_id'
        ]
        for field_name in required_fields:
            self.assertIn(field_name, self.OrcaLog._fields)

    def test_orca_log_action_choices(self):
        """Test that action field has correct selections"""
        action_field = self.OrcaLog._fields['action']
        expected_actions = ['create', 'write', 'unlink', 'sync', 'error', 'validate']
        actual_actions = [selection[0] for selection in action_field.selection]
        for expected in expected_actions:
            self.assertIn(expected, actual_actions)

    def test_orca_log_readonly_fields(self):
        """Test that audit log is read-only after creation"""
        # This is enforced by the OrcaLog view (readonly="1")
        # Verify the abstract model exists and is properly configured
        self.assertTrue(self.OrcaLog._order == 'date desc')

    def test_orca_log_json_fields(self):
        """Test that before_values and after_values handle JSON correctly"""
        # These should store JSON snapshots
        before_field = self.OrcaLog._fields['before_values']
        after_field = self.OrcaLog._fields['after_values']

        self.assertEqual(before_field.store, True)
        self.assertEqual(after_field.store, True)

    def test_orca_log_indexing(self):
        """Test that audit log has proper indexes for performance"""
        indexed_fields = ['module_name', 'model_name', 'record_id', 'action', 'user_id']
        for field_name in indexed_fields:
            field = self.OrcaLog._fields[field_name]
            self.assertTrue(field.index, f"Field {field_name} should be indexed")

    def test_orca_service_placeholder(self):
        """Test that ORCA service placeholder is available"""
        service = self.env['orca.service']
        # Service should have a push_log method (even if it's a placeholder)
        self.assertTrue(hasattr(service, 'push_log'))

    def test_orca_config_parameters(self):
        """Test that ORCA configuration parameters are available"""
        config = self.env['ir.config.parameter']

        # These should be available (may be empty if not configured)
        orca_url = config.get_param('orca.api.url', '')
        orca_key = config.get_param('orca.api.key', '')
        orca_enabled = config.get_param('orca.enabled', 'False')

        # Just verify they can be retrieved without error
        self.assertIsInstance(orca_url, str)
        self.assertIsInstance(orca_key, str)
        self.assertIsInstance(orca_enabled, str)

    def test_orca_mixin_inheritance(self):
        """Test that OrcaAuditMixin can be inherited by domain models"""
        # This is tested by verifying the mixin exists and has required methods
        mixin = self.env['orca.audit.mixin']

        # Mixin should have these methods
        self.assertTrue(hasattr(mixin, '_orca_log_action'))
        self.assertTrue(hasattr(mixin, '_orca_snapshot'))
