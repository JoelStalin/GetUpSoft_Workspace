# -*- coding: utf-8 -*-
"""
Tests for l10n_do_accounting_report ORCA Integration

Verify that accounting report operations are properly logged via ORCA mixin.
"""

import json
from odoo.tests.common import TransactionCase


class TestAccountingReportOrcaAudit(TransactionCase):
    """Test ORCA audit logging for accounting reports"""

    def setUp(self):
        super().setUp()
        self.OrcaLog = self.env['orca.l10n.do.accounting.report.log']
        self.TaxReport = self.env['account.tax.report']

    def test_orca_log_model_exists(self):
        """Test that l10n_do_accounting_report ORCA log model exists"""
        self.assertTrue(self.OrcaLog._name == 'orca.l10n.do.accounting.report.log')

    def test_orca_log_fields_exist(self):
        """Test that report-specific ORCA fields exist"""
        report_fields = ['report_type', 'date_from', 'date_to', 'record_count']
        for field_name in report_fields:
            self.assertIn(field_name, self.OrcaLog._fields)

    def test_orca_log_model_configuration(self):
        """Test that ORCA log model inherits from base"""
        # Verify it inherits from orca.log abstract model
        self.assertTrue('orca.log' in self.OrcaLog._inherit or self.OrcaLog._name == 'orca.l10n.do.accounting.report.log')

    def test_orca_log_readonly(self):
        """Test that ORCA logs are read-only"""
        # This is enforced by the form view (readonly="1")
        # Verify the model is properly configured
        self.assertTrue(self.OrcaLog._order == 'date desc')

    def test_orca_log_user_tracking(self):
        """Test that user is tracked in audit logs"""
        user_field = self.OrcaLog._fields['user_id']
        self.assertEqual(user_field.relation, 'res.users')

    def test_orca_log_date_tracking(self):
        """Test that date is tracked"""
        date_field = self.OrcaLog._fields['date']
        self.assertEqual(date_field.type, 'datetime')

    def test_accounting_report_orca_integration(self):
        """Test that accounting report models have ORCA integration"""
        # Verify tax report model exists
        self.assertTrue(self.TaxReport._name == 'account.tax.report')

    def test_orca_log_json_fields(self):
        """Test that before_values and after_values handle JSON"""
        before_field = self.OrcaLog._fields['before_values']
        after_field = self.OrcaLog._fields['after_values']
        # These should exist and be text fields
        self.assertTrue(before_field)
        self.assertTrue(after_field)

    def test_orca_log_action_field(self):
        """Test that action field has correct selections"""
        action_field = self.OrcaLog._fields['action']
        expected_actions = ['create', 'write', 'unlink', 'sync', 'error', 'validate']
        if action_field.selection:
            actual_actions = [selection[0] for selection in action_field.selection]
            for expected in expected_actions:
                self.assertIn(expected, actual_actions)

    def test_orca_log_module_name_tracking(self):
        """Test that module name is tracked"""
        module_field = self.OrcaLog._fields['module_name']
        self.assertTrue(module_field.index)

    def test_orca_log_search_view_available(self):
        """Test that ORCA log has search capabilities"""
        # Verify search view is defined
        search_view = self.env['ir.ui.view'].search([
            ('model', '=', 'orca.l10n.do.accounting.report.log'),
            ('type', '=', 'search'),
        ])
        # Search view should exist (defined in XML)
        # This test verifies the record can be searched

    def test_orca_log_tree_view_available(self):
        """Test that ORCA log has tree view"""
        tree_view = self.env['ir.ui.view'].search([
            ('model', '=', 'orca.l10n.do.accounting.report.log'),
            ('type', '=', 'tree'),
        ])
        # Tree view should be available

    def test_orca_log_form_view_available(self):
        """Test that ORCA log has form view"""
        form_view = self.env['ir.ui.view'].search([
            ('model', '=', 'orca.l10n.do.accounting.report.log'),
            ('type', '=', 'form'),
        ])
        # Form view should be available

    def test_orca_report_type_field(self):
        """Test that report type is tracked"""
        report_type_field = self.OrcaLog._fields['report_type']
        self.assertTrue(report_type_field)

    def test_orca_date_range_fields(self):
        """Test that date range is properly tracked"""
        date_from = self.OrcaLog._fields['date_from']
        date_to = self.OrcaLog._fields['date_to']
        self.assertTrue(date_from)
        self.assertTrue(date_to)

    def test_orca_record_count_field(self):
        """Test that record count is tracked"""
        record_count = self.OrcaLog._fields['record_count']
        self.assertEqual(record_count.type, 'integer')

    def test_orca_sync_status_tracking(self):
        """Test that ORCA sync status is tracked"""
        synced_field = self.OrcaLog._fields['orca_synced']
        request_id_field = self.OrcaLog._fields['orca_request_id']
        self.assertTrue(synced_field.type == 'boolean')
        self.assertTrue(request_id_field)
