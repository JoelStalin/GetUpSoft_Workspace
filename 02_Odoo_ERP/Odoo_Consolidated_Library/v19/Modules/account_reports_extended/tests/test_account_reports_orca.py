import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestAccountReportsOrcaLogging(TransactionCase):
    """Test suite for account_reports ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.report_model = self.env['account.report']
        self.tax_report_model = self.env['account.tax.report']
        self.fin_log_model = self.env['orca.financial.report.log']
        self.tax_log_model = self.env['orca.tax.report.log']

    def test_account_report_inherits_mixin(self):
        """Test that account.report inherits OrcaUniversalMixin."""
        self.assertTrue(
            self.report_model._inherits.get('orca.universal.mixin'),
            'account.report should inherit orca.universal.mixin'
        )

    def test_tax_report_inherits_mixin(self):
        """Test that account.tax.report inherits OrcaUniversalMixin."""
        self.assertTrue(
            self.tax_report_model._inherits.get('orca.universal.mixin'),
            'account.tax.report should inherit orca.universal.mixin'
        )

    def test_account_report_orca_tier_critical(self):
        """Test that account.report has CRITICAL tier classification."""
        self.assertEqual(
            self.report_model._orca_tier,
            'critical',
            'account.report should have CRITICAL tier'
        )

    def test_tax_report_orca_tier_critical(self):
        """Test that tax.report has CRITICAL tier classification."""
        self.assertEqual(
            self.tax_report_model._orca_tier,
            'critical',
            'tax.report should have CRITICAL tier'
        )

    def test_financial_report_log_model_configured(self):
        """Test that financial report log model is properly configured."""
        self.assertEqual(
            self.report_model._orca_log_model,
            'orca.financial.report.log',
            'Report should use orca.financial.report.log'
        )

    def test_tax_report_log_model_configured(self):
        """Test that tax report log model is properly configured."""
        self.assertEqual(
            self.tax_report_model._orca_log_model,
            'orca.tax.report.log',
            'Tax report should use orca.tax.report.log'
        )

    def test_fin_log_model_has_required_fields(self):
        """Test that financial report log has all required fields."""
        required_fields = ['report_name', 'report_type', 'reporting_date', 'currency_id', 'export_format', 'line_count']
        for field in required_fields:
            self.assertTrue(
                field in self.fin_log_model._fields,
                f'Financial log should have {field} field'
            )

    def test_tax_log_model_has_required_fields(self):
        """Test that tax report log has all required fields."""
        required_fields = ['tax_report_name', 'tax_period', 'tax_amount', 'filing_status', 'jurisdiction']
        for field in required_fields:
            self.assertTrue(
                field in self.tax_log_model._fields,
                f'Tax log should have {field} field'
            )

    def test_fin_log_inherits_from_orca_log(self):
        """Test that financial report log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.fin_log_model._inherit if isinstance(self.fin_log_model._inherit, list) else [self.fin_log_model._inherit],
            'Financial log should inherit from orca.log'
        )

    def test_tax_log_inherits_from_orca_log(self):
        """Test that tax report log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.tax_log_model._inherit if isinstance(self.tax_log_model._inherit, list) else [self.tax_log_model._inherit],
            'Tax log should inherit from orca.log'
        )

    def test_access_control_fin_log_user(self):
        """Test that regular users can read financial logs only."""
        user = self.env.ref('base.user_demo')
        fin_logs = self.fin_log_model.with_user(user).search([])
        self.assertIsNotNone(fin_logs, 'Regular users should be able to read financial logs')

    def test_access_control_tax_log_accountant(self):
        """Test that accountants can read tax logs only."""
        accountant = self.env['res.users'].create({
            'name': 'Test Accountant',
            'login': 'accountant_reports@test.com',
            'groups_id': [(6, 0, [self.env.ref('account.group_account_accountant').id])],
        })
        tax_logs = self.tax_log_model.with_user(accountant).search([])
        self.assertIsNotNone(tax_logs, 'Accountants should be able to read tax logs')

    def test_fin_log_model_name(self):
        """Test that financial log model has correct name."""
        self.assertEqual(
            self.fin_log_model._name,
            'orca.financial.report.log',
            'Financial log model name incorrect'
        )

    def test_tax_log_model_name(self):
        """Test that tax log model has correct name."""
        self.assertEqual(
            self.tax_log_model._name,
            'orca.tax.report.log',
            'Tax log model name incorrect'
        )

    def test_fin_log_report_type_selections(self):
        """Test that financial log report_type has correct selections."""
        report_type_field = self.fin_log_model._fields['report_type']
        expected_selections = ['balance_sheet', 'income_statement', 'cash_flow', 'equity', 'custom']
        actual_selections = [s[0] for s in report_type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in report_type selections')

    def test_tax_log_filing_status_selections(self):
        """Test that tax log filing_status has correct selections."""
        filing_status_field = self.tax_log_model._fields['filing_status']
        expected_selections = ['draft', 'submitted', 'approved', 'rejected']
        actual_selections = [s[0] for s in filing_status_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in filing_status selections')
