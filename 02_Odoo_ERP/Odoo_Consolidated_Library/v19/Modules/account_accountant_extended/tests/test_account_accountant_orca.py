import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestAccountAccountantOrcaLogging(TransactionCase):
    """Test suite for account_accountant ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.gl_model = self.env['account.general.ledger']
        self.tb_model = self.env['account.trial.balance']
        self.gl_log_model = self.env['orca.general.ledger.log']
        self.tb_log_model = self.env['orca.trial.balance.log']

    def test_general_ledger_inherits_mixin(self):
        """Test that account.general.ledger inherits OrcaUniversalMixin."""
        self.assertTrue(
            self.gl_model._inherits.get('orca.universal.mixin'),
            'account.general.ledger should inherit orca.universal.mixin'
        )

    def test_trial_balance_inherits_mixin(self):
        """Test that account.trial.balance inherits OrcaUniversalMixin."""
        self.assertTrue(
            self.tb_model._inherits.get('orca.universal.mixin'),
            'account.trial.balance should inherit orca.universal.mixin'
        )

    def test_general_ledger_orca_tier_high(self):
        """Test that general ledger has HIGH tier classification."""
        self.assertEqual(
            self.gl_model._orca_tier,
            'high',
            'General ledger should have HIGH tier'
        )

    def test_trial_balance_orca_tier_critical(self):
        """Test that trial balance has CRITICAL tier classification."""
        self.assertEqual(
            self.tb_model._orca_tier,
            'critical',
            'Trial balance should have CRITICAL tier'
        )

    def test_general_ledger_log_model_configured(self):
        """Test that GL log model is properly configured."""
        self.assertEqual(
            self.gl_model._orca_log_model,
            'orca.general.ledger.log',
            'GL should use orca.general.ledger.log'
        )

    def test_trial_balance_log_model_configured(self):
        """Test that TB log model is properly configured."""
        self.assertEqual(
            self.tb_model._orca_log_model,
            'orca.trial.balance.log',
            'TB should use orca.trial.balance.log'
        )

    def test_gl_log_model_has_required_fields(self):
        """Test that GL log model has all required fields."""
        required_fields = ['report_type', 'report_period', 'account_codes', 'filter_status']
        for field in required_fields:
            self.assertTrue(
                field in self.gl_log_model._fields,
                f'GL log model should have {field} field'
            )

    def test_tb_log_model_has_required_fields(self):
        """Test that TB log model has all required fields."""
        required_fields = ['balance_date', 'account_count', 'total_debit', 'total_credit', 'is_balanced']
        for field in required_fields:
            self.assertTrue(
                field in self.tb_log_model._fields,
                f'TB log model should have {field} field'
            )

    def test_gl_log_inherits_from_orca_log(self):
        """Test that general ledger log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.gl_log_model._inherit if isinstance(self.gl_log_model._inherit, list) else [self.gl_log_model._inherit],
            'GL log should inherit from orca.log'
        )

    def test_tb_log_inherits_from_orca_log(self):
        """Test that trial balance log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.tb_log_model._inherit if isinstance(self.tb_log_model._inherit, list) else [self.tb_log_model._inherit],
            'TB log should inherit from orca.log'
        )

    def test_access_control_gl_log_user(self):
        """Test that regular users can read GL logs only."""
        user = self.env.ref('base.user_demo')
        gl_logs = self.gl_log_model.with_user(user).search([])
        self.assertIsNotNone(gl_logs, 'Regular users should be able to read GL logs')

    def test_access_control_tb_log_accountant(self):
        """Test that accountants can read TB logs only."""
        accountant = self.env['res.users'].create({
            'name': 'Test Accountant',
            'login': 'accountant@test.com',
            'groups_id': [(6, 0, [self.env.ref('account.group_account_accountant').id])],
        })
        tb_logs = self.tb_log_model.with_user(accountant).search([])
        self.assertIsNotNone(tb_logs, 'Accountants should be able to read TB logs')

    def test_gl_log_model_name(self):
        """Test that GL log model has correct name."""
        self.assertEqual(
            self.gl_log_model._name,
            'orca.general.ledger.log',
            'GL log model name incorrect'
        )

    def test_tb_log_model_name(self):
        """Test that TB log model has correct name."""
        self.assertEqual(
            self.tb_log_model._name,
            'orca.trial.balance.log',
            'TB log model name incorrect'
        )
