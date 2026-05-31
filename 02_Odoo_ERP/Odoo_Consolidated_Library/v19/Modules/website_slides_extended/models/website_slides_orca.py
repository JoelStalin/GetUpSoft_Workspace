from odoo import models, fields

class OrcaWebsiteSlidesLog(models.Model):
    _name = 'orca.website.slides.log'
    _description = 'Website Slides ORCA Audit Log'
    _inherit = 'orca.log'
    slide_title = fields.Char(string='Slide Title')
    slide_type = fields.Char(string='Slide Type')
    duration = fields.Integer(string='Duration')
    views_count = fields.Integer(string='Views')

class SlidesSlide(models.Model):
    _inherit = ['slide.slide', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.website.slides.log'
    _orca_tracked_fields = ['name', 'slide_type', 'duration', 'create_date']
