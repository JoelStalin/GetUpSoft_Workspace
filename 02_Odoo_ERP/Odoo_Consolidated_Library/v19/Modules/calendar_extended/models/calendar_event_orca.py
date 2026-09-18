from odoo import models, fields, api


class OrcaCalendarEventLog(models.Model):
    _name = 'orca.calendar.event.log'
    _description = 'Calendar Event ORCA Audit Log'
    _inherit = 'orca.log'

    event_title = fields.Char(string='Event Title')
    event_date = fields.Datetime(string='Event Date')
    organizer = fields.Char(string='Organizer')
    attendees_count = fields.Integer(string='Attendees Count')
    event_type = fields.Selection([('meeting', 'Meeting'), ('task', 'Task'), ('call', 'Call'), ('other', 'Other')], string='Event Type')


class CalendarEvent(models.Model):
    _inherit = ['calendar.event', 'orca.universal.mixin']

    _orca_tier = 'medium'
    _orca_log_model = 'orca.calendar.event.log'
    _orca_tracked_fields = ['name', 'start', 'stop', 'user_id', 'partner_ids']
