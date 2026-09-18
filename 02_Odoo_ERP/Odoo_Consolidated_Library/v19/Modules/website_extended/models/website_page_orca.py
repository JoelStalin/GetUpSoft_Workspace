from odoo import models, fields, api


class OrcaWebsitePageLog(models.Model):
    _name = 'orca.website.page.log'
    _description = 'Website Page ORCA Audit Log'
    _inherit = 'orca.log'

    page_url = fields.Char(string='Page URL')
    page_title = fields.Char(string='Page Title')
    is_published = fields.Boolean(string='Published Status')
    website_id = fields.Char(string='Website ID')
    author_id = fields.Char(string='Author ID')
    page_type = fields.Selection([
        ('custom', 'Custom'),
        ('ecommerce', 'Ecommerce'),
        ('blog', 'Blog Post'),
        ('form', 'Form Page'),
    ], string='Page Type')


class Website(models.Model):
    _inherit = ['website', 'orca.universal.mixin']

    _orca_tier = 'medium'
    _orca_log_model = 'orca.website.page.log'
    _orca_tracked_fields = ['name', 'domain', 'company_id']


class WebsitePage(models.Model):
    _inherit = ['website.page', 'orca.universal.mixin']

    _orca_tier = 'medium'
    _orca_log_model = 'orca.website.page.log'
    _orca_tracked_fields = ['url', 'name', 'is_published', 'website_id', 'create_uid', 'type']
