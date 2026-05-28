from odoo import models, fields


class OrcaEmployeeLog(models.Model):
    _name = 'orca.employee.log'
    _description = 'Employee ORCA Audit Log'
    _inherit = 'orca.log'

    employee_name = fields.Char(string='Employee Name', index=True)
    employee_email = fields.Char(string='Email')
    employee_status = fields.Selection([
        ('draft', 'Draft'),
        ('open', 'Active'),
        ('close', 'Inactive'),
    ], string='Employee Status')
    job_title = fields.Char(string='Job Title')
    department_name = fields.Char(string='Department')
    manager_name = fields.Char(string='Manager')
    contract_status = fields.Char(string='Contract Status')


class HrEmployee(models.Model):
    _inherit = ['hr.employee', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.employee.log'
    _orca_tracked_fields = ['name', 'email', 'active', 'job_title', 'department_id', 'parent_id', 'resource_id']
