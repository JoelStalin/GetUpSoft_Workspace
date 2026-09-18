from odoo import models, fields


class OrcaQualityPointLog(models.Model):
    _name = 'orca.quality.point.log'
    _description = 'Quality Point ORCA Audit Log'
    _inherit = 'orca.log'

    point_reference = fields.Char(string='Point Reference', index=True)
    point_name = fields.Char(string='Point Name')
    test_type = fields.Selection([
        ('test', 'Test'),
        ('question', 'Question'),
        ('passfail', 'Pass/Fail'),
    ], string='Test Type')
    point_status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ], string='Point Status')
    applicable_operation = fields.Char(string='Applicable Operation')
    measurement_frequency = fields.Char(string='Measurement Frequency')
    responsible_team = fields.Char(string='Responsible Team')


class QualityPoint(models.Model):
    _inherit = ['quality.point', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.quality.point.log'
    _orca_tracked_fields = ['name', 'test_type', 'active', 'operation_id', 'team_id', 'company_id']
