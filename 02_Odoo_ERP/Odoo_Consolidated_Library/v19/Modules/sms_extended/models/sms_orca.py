from odoo import models, fields

class OrcaSmsLog(models.Model):
    _name = 'orca.sms.log'
    _description = 'SMS ORCA Audit Log'
    _inherit = 'orca.log'
    recipient_number = fields.Char(string='Recipient Number')
    message_body = fields.Text(string='Message Body')
    sms_state = fields.Char(string='SMS State')
    character_count = fields.Integer(string='Characters')

class SmsSms(models.Model):
    _inherit = ['sms.sms', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.sms.log'
    _orca_tracked_fields = ['number', 'body', 'state', 'create_date']
