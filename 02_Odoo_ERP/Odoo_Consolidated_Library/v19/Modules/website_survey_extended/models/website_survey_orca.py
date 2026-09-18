from odoo import models, fields

class OrcaWebsiteSurveyLog(models.Model):
    _name = 'orca.website.survey.log'
    _description = 'Website Survey ORCA Audit Log'
    _inherit = 'orca.log'
    survey_title = fields.Char(string='Survey Title')
    question_count = fields.Integer(string='Questions')
    response_count = fields.Integer(string='Responses')
    survey_status = fields.Char(string='Status')

class SurveySurvey(models.Model):
    _inherit = ['survey.survey', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.website.survey.log'
    _orca_tracked_fields = ['title', 'question_ids', 'state', 'create_date']
