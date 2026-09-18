from odoo import models, fields

class OrcaEventLog(models.Model):
    _name = 'orca.event.log'
    _description = 'Event ORCA Audit Log'
    _inherit = 'orca.log'
    event_name = fields.Char(string='Event Name')
    event_date = fields.Datetime(string='Event Date')
    attendees_expected = fields.Integer(string='Expected Attendees')
    event_status = fields.Char(string='Status')

class EventEvent(models.Model):
    _inherit = ['event.event', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.event.log'
    _orca_tracked_fields = ['name', 'date_begin', 'seats_available', 'state']
