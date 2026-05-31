from odoo import models, fields


class OrcaProductionPlanLog(models.Model):
    _name = 'orca.production.plan.log'
    _description = 'Production Plan ORCA Audit Log'
    _inherit = 'orca.log'

    plan_reference = fields.Char(string='Plan Reference', index=True)
    plan_name = fields.Char(string='Plan Name')
    planning_period = fields.Char(string='Planning Period')
    planned_quantity = fields.Float(string='Planned Quantity')
    plan_status = fields.Selection([
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Plan Status')
    plan_type = fields.Selection([
        ('forecasted', 'Forecasted'),
        ('committed', 'Committed'),
        ('fixed', 'Fixed'),
    ], string='Plan Type')
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')


class ProcurementGroup(models.Model):
    _inherit = ['procurement.group', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.production.plan.log'
    _orca_tracked_fields = ['name', 'state', 'date_planned', 'partner_dest_id', 'company_id']
