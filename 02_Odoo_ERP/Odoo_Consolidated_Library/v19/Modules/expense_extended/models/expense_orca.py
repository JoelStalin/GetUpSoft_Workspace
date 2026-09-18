from odoo import models, fields


class OrcaExpenseLog(models.Model):
    _name = 'orca.expense.log'
    _description = 'Employee Expense ORCA Audit Log'
    _inherit = 'orca.log'

    expense_ref = fields.Char(string='Expense Reference', index=True)
    employee_name = fields.Char(string='Employee Name')
    expense_date = fields.Date(string='Expense Date')
    expense_category = fields.Char(string='Expense Category')
    expense_amount = fields.Float(string='Expense Amount')
    currency = fields.Char(string='Currency')
    expense_status = fields.Selection([
        ('draft', 'Draft'),
        ('reported', 'Reported'),
        ('approved', 'Approved'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ], string='Expense Status')
    payment_method = fields.Char(string='Payment Method')


class HrExpense(models.Model):
    _inherit = ['hr.expense', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.expense.log'
    _orca_tracked_fields = ['name', 'employee_id', 'date', 'unit_amount', 'quantity', 'state', 'currency_id', 'product_id']
