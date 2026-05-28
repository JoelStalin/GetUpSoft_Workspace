from odoo import models, fields


class OrcaPayslipLog(models.Model):
    _name = 'orca.payslip.log'
    _description = 'Payslip ORCA Audit Log'
    _inherit = 'orca.log'

    payslip_name = fields.Char(string='Payslip Number', index=True)
    employee_name = fields.Char(string='Employee Name')
    payslip_status = fields.Selection([
        ('draft', 'Draft'),
        ('verify', 'Waiting'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ], string='Payslip Status')
    payroll_period = fields.Char(string='Payroll Period')
    basic_salary = fields.Float(string='Basic Salary')
    gross_amount = fields.Float(string='Gross Amount')
    deductions = fields.Float(string='Deductions')
    net_amount = fields.Float(string='Net Amount')


class HrPayslip(models.Model):
    _inherit = ['hr.payslip', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.payslip.log'
    _orca_tracked_fields = ['name', 'state', 'employee_id', 'date_from', 'date_to', 'contract_id', 'amount_basic', 'amount_gross', 'amount_net']
