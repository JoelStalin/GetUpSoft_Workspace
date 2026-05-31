from odoo import models, fields

class OrcaSnailmailLog(models.Model):
    _name = 'orca.snailmail.log'
    _description = 'Snailmail ORCA Audit Log'
    _inherit = 'orca.log'
    recipient_name = fields.Char(string='Recipient Name')
    address = fields.Text(string='Address')
    mail_status = fields.Char(string='Mail Status')
    pages_count = fields.Integer(string='Pages')

class SnailmailLetter(models.Model):
    _inherit = ['snailmail.letter', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.snailmail.log'
    _orca_tracked_fields = ['partner_id', 'address', 'state', 'page_count']
