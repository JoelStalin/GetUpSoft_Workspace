from odoo import models, fields


class OrcaMaintenanceRequestLog(models.Model):
    _name = 'orca.maintenance.request.log'
    _description = 'Maintenance Request ORCA Audit Log'
    _inherit = 'orca.log'

    request_reference = fields.Char(string='Request Reference', index=True)
    equipment_name = fields.Char(string='Equipment Name')
    maintenance_type = fields.Selection([
        ('preventive', 'Preventive'),
        ('corrective', 'Corrective'),
        ('predictive', 'Predictive'),
    ], string='Maintenance Type')
    priority = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], string='Priority')
    request_status = fields.Selection([
        ('new', 'New'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Request Status')
    assigned_to = fields.Char(string='Assigned To')
    scheduled_date = fields.Date(string='Scheduled Date')
    completion_date = fields.Date(string='Completion Date')


class MaintenanceRequest(models.Model):
    _inherit = ['maintenance.request', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.maintenance.request.log'
    _orca_tracked_fields = ['name', 'equipment_id', 'maintenance_type', 'request_date', 'priority', 'assigned_user_id', 'stage_id', 'schedule_date']
