"""ORCA integration for l10n_do_accounting_report module.

Tracks all DGII report submissions and fiscal reporting operations.
"""

from odoo import models, fields


class OrcaAccountingReportLog(models.Model):
    """ORCA audit log for accounting report operations."""

    _name = 'orca.l10n.do.accounting.report.log'
    _description = 'Dominican Accounting Report ORCA Audit Log'
    _inherit = 'orca.log'

    # Report-specific fields
    report_type = fields.Char(
        string='Report Type',
        help='Type of report (annual, monthly, dgii, tax, etc.)'
    )
    report_period = fields.Char(
        string='Period',
        help='Report period (YYYY-MM or YYYY)'
    )
    submission_status = fields.Char(
        string='Submission Status',
        help='Status of DGII submission (pending, submitted, accepted, rejected)'
    )
    dgii_receipt_id = fields.Char(
        string='DGII Receipt ID',
        help='Receipt ID from DGII submission'
    )


class AccountingReport(models.Model):
    """Extend accounting report wizards with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant report fields without explicit configuration.
    """

    _inherit = ['account.report', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal reporting operations
    # OrcaUniversalMixin will auto-select report-related fields based on tier
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'orca.l10n.do.accounting.report.log'
