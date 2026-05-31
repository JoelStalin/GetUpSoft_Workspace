from odoo import models, fields

class OrcaWebUnseenLog(models.Model):
    _name = 'orca.web.unseen.log'
    _description = 'Web Unseen ORCA Audit Log'
    _inherit = 'orca.log'
    notification_type = fields.Char(string='Notification Type')
    notification_count = fields.Integer(string='Count')
    marked_as_read = fields.Boolean(string='Marked as Read')

class MailNotification(models.Model):
    _inherit = ['mail.notification', 'orca.universal.mixin']
    _orca_tier = 'low'
    _orca_log_model = 'orca.web.unseen.log'
    _orca_tracked_fields = ['res_partner_id', 'mail_message_id', 'is_read']
