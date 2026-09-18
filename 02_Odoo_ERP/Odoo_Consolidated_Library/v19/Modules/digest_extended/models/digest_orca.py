from odoo import models, fields

class OrcaDigestLog(models.Model):
    _name = 'orca.digest.log'
    _description = 'Digest ORCA Audit Log'
    _inherit = 'orca.log'
    digest_name = fields.Char(string='Digest Name')
    frequency = fields.Char(string='Frequency')
    recipient_count = fields.Integer(string='Recipients')

class DigestDigest(models.Model):
    _inherit = ['digest.digest', 'orca.universal.mixin']
    _orca_tier = 'low'
    _orca_log_model = 'orca.digest.log'
    _orca_tracked_fields = ['name', 'periodicity', 'user_ids']
