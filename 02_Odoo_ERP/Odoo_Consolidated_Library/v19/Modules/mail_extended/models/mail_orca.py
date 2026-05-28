from odoo import models, fields

class OrcaMailLog(models.Model):
    _name = 'orca.mail.log'
    _description = 'Mail ORCA Audit Log'
    _inherit = 'orca.log'
    subject = fields.Char(string='Email Subject')
    email_from = fields.Char(string='From')
    email_to = fields.Char(string='To')
    attachment_count = fields.Integer(string='Attachments')

class MailMail(models.Model):
    _inherit = ['mail.mail', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.mail.log'
    _orca_tracked_fields = ['subject', 'email_from', 'email_to', 'body_html', 'state']
