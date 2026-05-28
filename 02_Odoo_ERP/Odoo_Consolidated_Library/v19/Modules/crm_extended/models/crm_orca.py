from odoo import models, fields

class OrcaCrmLog(models.Model):
    _name = 'orca.crm.log'
    _description = 'CRM ORCA Audit Log'
    _inherit = 'orca.log'
    lead_name = fields.Char(string='Lead Name')
    company_name = fields.Char(string='Company Name')
    stage = fields.Char(string='Stage')
    expected_revenue = fields.Float(string='Expected Revenue')

class CrmLead(models.Model):
    _inherit = ['crm.lead', 'orca.universal.mixin']
    _orca_tier = 'high'
    _orca_log_model = 'orca.crm.log'
    _orca_tracked_fields = ['name', 'partner_name', 'stage_id', 'expected_revenue']
