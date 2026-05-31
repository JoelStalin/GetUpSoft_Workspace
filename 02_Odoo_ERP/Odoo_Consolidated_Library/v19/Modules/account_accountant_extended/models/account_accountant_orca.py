from odoo import fields, models


class OrcaGeneralLedgerLog(models.Model):
    """ORCA audit log for general ledger reporting.

    Tracks changes to general ledger configuration, views, and report parameters.
    Inherits from base orca.log with accounting reporting-specific fields.
    """
    _name = 'orca.general.ledger.log'
    _description = 'General Ledger ORCA Audit Log'
    _inherit = 'orca.log'

    report_type = fields.Char(
        string='Report Type',
        help='Type of general ledger report at time of log'
    )
    report_period = fields.Char(
        string='Report Period',
        help='Period covered by report at time of log'
    )
    account_codes = fields.Text(
        string='Account Codes',
        help='Accounts included in report at time of log'
    )
    filter_status = fields.Char(
        string='Filter Status',
        help='Active filters on report at time of log'
    )


class OrcaTrialBalanceLog(models.Model):
    """ORCA audit log for trial balance.

    Tracks changes to trial balance configuration and report generation.
    """
    _name = 'orca.trial.balance.log'
    _description = 'Trial Balance ORCA Audit Log'
    _inherit = 'orca.log'

    balance_date = fields.Date(
        string='Balance Date',
        help='Date of trial balance at time of log'
    )
    account_count = fields.Integer(
        string='Account Count',
        help='Number of accounts in trial balance'
    )
    total_debit = fields.Float(
        string='Total Debit',
        help='Total debit amount'
    )
    total_credit = fields.Float(
        string='Total Credit',
        help='Total credit amount'
    )
    is_balanced = fields.Boolean(
        string='Is Balanced',
        help='Whether debit equals credit'
    )


class AccountGeneralLedger(models.Model):
    """General ledger report with ORCA audit logging.

    Uses OrcaUniversalMixin for automatic audit logging of all GL operations.
    Captures report parameters, filters, and account selections.
    """
    _inherit = ['account.general.ledger', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.general.ledger.log'


class AccountTrialBalance(models.Model):
    """Trial balance report with ORCA audit logging.

    Auto-logs all trial balance configuration and generation operations.
    Ensures complete audit trail for financial reporting.
    """
    _inherit = ['account.trial.balance', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.trial.balance.log'
