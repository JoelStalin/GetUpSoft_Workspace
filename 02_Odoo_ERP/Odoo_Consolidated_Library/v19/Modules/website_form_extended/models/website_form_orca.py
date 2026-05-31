from odoo import models, fields

class OrcaWebsiteFormLog(models.Model):
    _name = 'orca.website.form.log'
    _description = 'Website Form ORCA Audit Log'
    _inherit = 'orca.log'
    form_name = fields.Char(string='Form Name')
    field_count = fields.Integer(string='Field Count')
    is_published = fields.Boolean(string='Published')
    submission_count = fields.Integer(string='Submissions')

class WebsiteForm(models.Model):
    _inherit = ['website.form', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.website.form.log'
    _orca_tracked_fields = ['title', 'website_published', 'website_id', 'create_date']
