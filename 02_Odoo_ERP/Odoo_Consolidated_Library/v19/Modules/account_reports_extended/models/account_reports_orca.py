from odoo import fields, models


class OrcaFinancialReportLog(models.Model):
    """ORCA audit log for financial reports.

    Tracks all financial report generation, modification, and export operations.
    Inherits from base orca.log with report-specific fields.
    """
    _name = 'orca.financial.report.log'
    _description = 'Financial Report ORCA Audit Log'
    _inherit = 'orca.log'

    report_name = fields.Char(
        string='Report Name',
        help='Name of financial report at time of log'
    )
    report_type = fields.Selection(
        [
            ('balance_sheet', 'Balance Sheet'),
            ('income_statement', 'Income Statement'),
            ('cash_flow', 'Cash Flow'),
            ('equity', 'Equity'),
            ('custom', 'Custom Report'),
        ],
        string='Report Type',
        help='Type of financial report'
    )
    reporting_date = fields.Date(
        string='Reporting Date',
        help='Date of report at time of log'
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        help='Currency used in report'
    )
    export_format = fields.Selection(
        [
            ('pdf', 'PDF'),
            ('xlsx', 'Excel'),
            ('csv', 'CSV'),
            ('xml', 'XML'),
        ],
        string='Export Format',
        help='Format used for export'
    )
    line_count = fields.Integer(
        string='Line Count',
        help='Number of lines in report'
    )


class OrcaTaxReportLog(models.Model):
    """ORCA audit log for tax reports.

    Tracks tax report preparation, submission, and modifications.
    Critical for tax compliance and regulatory requirements.
    """
    _name = 'orca.tax.report.log'
    _description = 'Tax Report ORCA Audit Log'
    _inherit = 'orca.log'

    tax_report_name = fields.Char(
        string='Tax Report Name',
        help='Name of tax report'
    )
    tax_period = fields.Char(
        string='Tax Period',
        help='Period covered by tax report'
    )
    tax_amount = fields.Float(
        string='Tax Amount',
        help='Total tax amount reported'
    )
    filing_status = fields.Selection(
        [
            ('draft', 'Draft'),
            ('submitted', 'Submitted'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        string='Filing Status',
        help='Status of tax report filing'
    )
    jurisdiction = fields.Char(
        string='Jurisdiction',
        help='Tax jurisdiction for report'
    )


class AccountReport(models.Model):
    """Financial report with ORCA audit logging.

    All financial reports are automatically audited using OrcaUniversalMixin.
    Captures report generation, modifications, and all export operations.
    """
    _inherit = ['account.report', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.financial.report.log'


class AccountTaxReport(models.Model):
    """Tax report with ORCA audit logging.

    Mandatory audit logging for all tax-related reporting.
    Ensures complete regulatory compliance.
    """
    _inherit = ['account.tax.report', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.tax.report.log'
