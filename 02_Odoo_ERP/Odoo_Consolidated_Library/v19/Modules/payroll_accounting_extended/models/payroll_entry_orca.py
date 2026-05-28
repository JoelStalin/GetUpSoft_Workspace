from odoo import models, fields


class OrcaPayrollEntryLog(models.Model):
    _name = 'orca.payroll.entry.log'
    _description = 'Payroll Accounting Entry ORCA Audit Log'
    _inherit = 'orca.log'

    entry_ref = fields.Char(string='Entry Reference', index=True)
    entry_type = fields.Selection([
        ('salary', 'Salary Expense'),
        ('tax', 'Tax Payable'),
        ('contribution', 'Contribution Payable'),
        ('advance', 'Advance Payment'),
        ('deduction', 'Deduction'),
    ], string='Entry Type')
    account_code = fields.Char(string='Account Code')
    account_name = fields.Char(string='Account Name')
    debit_amount = fields.Float(string='Debit Amount')
    credit_amount = fields.Float(string='Credit Amount')
    entry_status = fields.Selection([
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('reconciled', 'Reconciled'),
        ('cancelled', 'Cancelled'),
    ], string='Entry Status')


class AccountMove(models.Model):
    _inherit = ['account.move', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.payroll.entry.log'
    _orca_tracked_fields = ['name', 'state', 'date', 'amount_total', 'journal_id', 'ref', 'partner_id']
