from odoo import models, fields


class OrcaApplicantLog(models.Model):
    _name = 'orca.applicant.log'
    _description = 'Job Applicant ORCA Audit Log'
    _inherit = 'orca.log'

    applicant_name = fields.Char(string='Applicant Name', index=True)
    applicant_email = fields.Char(string='Email')
    job_position = fields.Char(string='Job Position')
    department_name = fields.Char(string='Department')
    stage_name = fields.Selection([
        ('initiate', 'Initiate'),
        ('screen', 'Screening'),
        ('interview', 'Interview'),
        ('test', 'Test'),
        ('offer', 'Offer'),
        ('refuse', 'Refused'),
        ('hired', 'Hired'),
    ], string='Stage')
    phone = fields.Char(string='Phone')
    source = fields.Char(string='Source')
    rating = fields.Float(string='Rating')


class HrApplicant(models.Model):
    _inherit = ['hr.applicant', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.applicant.log'
    _orca_tracked_fields = ['name', 'email_from', 'job_id', 'stage_id', 'active', 'phone', 'source_id', 'rating']
