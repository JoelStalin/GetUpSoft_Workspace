"""ORCA integration for l10n_do_accounting_report module.

Tracks all DGII report submissions and fiscal reporting operations.
"""

from odoo import models, fields


class AccountingReportOrcaLog(models.Model):
    """ORCA audit log for accounting report operations."""

    _name = 'l10n.do.accounting.report.orca.log'
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
    """Extend accounting report wizards with ORCA audit logging."""

    _inherit = ['account.report', 'orca.audit.mixin']

    # Fields to snapshot on report generation/submission
    _orca_tracked_fields = [
        'name',
        'report_type',
        'date_from',
        'date_to',
        'state',
        'company_id',
    ]

    # Concrete log model for this module
    _orca_log_model = 'l10n.do.accounting.report.orca.log'
