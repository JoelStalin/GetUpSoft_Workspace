from odoo import models, fields

class OrcaKnowledgeLog(models.Model):
    _name = 'orca.knowledge.log'
    _description = 'Knowledge ORCA Audit Log'
    _inherit = 'orca.log'
    article_title = fields.Char(string='Article Title')
    category = fields.Char(string='Category')
    is_published = fields.Boolean(string='Published')
    views_count = fields.Integer(string='Views')

class KnowledgeArticle(models.Model):
    _inherit = ['knowledge.article', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.knowledge.log'
    _orca_tracked_fields = ['title', 'category_id', 'active', 'create_date']
