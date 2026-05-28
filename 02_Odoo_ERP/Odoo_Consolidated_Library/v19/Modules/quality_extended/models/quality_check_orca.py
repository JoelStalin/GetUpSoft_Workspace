from odoo import models, fields


class OrcaQualityCheckLog(models.Model):
    _name = 'orca.quality.check.log'
    _description = 'Quality Check ORCA Audit Log'
    _inherit = 'orca.log'

    check_reference = fields.Char(string='Check Reference', index=True)
    product_name = fields.Char(string='Product Name')
    check_type = fields.Selection([
        ('manual', 'Manual'),
        ('automated', 'Automated'),
        ('sampling', 'Sampling'),
        ('incoming', 'Incoming'),
        ('outgoing', 'Outgoing'),
    ], string='Check Type')
    quality_status = fields.Selection([
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('pending', 'Pending'),
        ('cancel', 'Cancelled'),
    ], string='Quality Status')
    inspected_quantity = fields.Float(string='Inspected Quantity')
    accepted_quantity = fields.Float(string='Accepted Quantity')
    rejected_quantity = fields.Float(string='Rejected Quantity')
    check_date = fields.Date(string='Check Date')


class QualityCheck(models.Model):
    _inherit = ['quality.check', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.quality.check.log'
    _orca_tracked_fields = ['name', 'product_id', 'quality_check_type', 'quality_state', 'qty_to_inspect', 'qty_pass', 'qty_fail', 'check_date']
