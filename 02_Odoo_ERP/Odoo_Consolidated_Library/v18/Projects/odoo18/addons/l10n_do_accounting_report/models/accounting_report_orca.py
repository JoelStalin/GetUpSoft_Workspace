from odoo import fields, models


class AccountingReportOrcaLog(models.Model):
    _name = 'l10n.do.accounting.report.orca.log'
    _description = 'l10n_do_accounting_report ORCA Audit Log'
    _inherit = 'orca.log'

    report_type = fields.Char(
        string='Report Type',
        help='Type of report (dgii, tax, etc.)'
    )
    date_from = fields.Date(
        string='Date From',
        help='Report period start date'
    )
    date_to = fields.Date(
        string='Date To',
        help='Report period end date'
    )
    record_count = fields.Integer(
        string='Record Count',
        help='Number of records in report'
    )


class AccountTaxReport(models.Model):
    _inherit = ['account.tax.report', 'orca.audit.mixin']
    _orca_tracked_fields = [
        'name',
        'country_id',
    ]
    _orca_log_model = 'l10n.do.accounting.report.orca.log'


class DGIIReport(models.Model):
    _inherit = ['ir.model', 'orca.audit.mixin']
    _orca_tracked_fields = [
        'name',
        'date_created',
    ]
    _orca_log_model = 'l10n.do.accounting.report.orca.log'
