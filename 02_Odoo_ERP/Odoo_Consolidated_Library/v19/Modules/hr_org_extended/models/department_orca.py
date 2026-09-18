from odoo import models, fields


class OrcaDepartmentLog(models.Model):
    _name = 'orca.department.log'
    _description = 'Department ORCA Audit Log'
    _inherit = 'orca.log'

    department_name = fields.Char(string='Department Name', index=True)
    department_code = fields.Char(string='Department Code')
    parent_department = fields.Char(string='Parent Department')
    manager_name = fields.Char(string='Manager Name')
    employee_count = fields.Integer(string='Employee Count')
    department_status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ], string='Department Status')


class HrDepartment(models.Model):
    _inherit = ['hr.department', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.department.log'
    _orca_tracked_fields = ['name', 'parent_id', 'manager_id', 'active', 'company_id']
