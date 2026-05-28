from odoo import models, fields

class OrcaHelpdeskLog(models.Model):
    _name = 'orca.helpdesk.log'
    _description = 'Helpdesk ORCA Audit Log'
    _inherit = 'orca.log'
    ticket_name = fields.Char(string='Ticket Name')
    customer_name = fields.Char(string='Customer Name')
    priority = fields.Char(string='Priority')
    ticket_status = fields.Char(string='Status')

class HelpdeskTicket(models.Model):
    _inherit = ['helpdesk.ticket', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.helpdesk.log'
    _orca_tracked_fields = ['name', 'partner_id', 'priority', 'stage_id']
