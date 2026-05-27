from odoo import models, fields


class AccountingReportOrcaLog(models.Model):
    _name = 'l10n.do.accounting.report.orca.log'
    _description = 'l10n_do_accounting_report ORCA Audit Log'
    _inherit = 'orca.log'

    report_type = fields.Char(string='Report Type')
    report_period = fields.Char(string='Report Period')
    submission_status = fields.Selection([
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], string='Submission Status')
    dgii_receipt_id = fields.Char(string='DGII Receipt ID')
