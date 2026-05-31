from odoo import models, fields

class OrcaWebTourLog(models.Model):
    _name = 'orca.web.tour.log'
    _description = 'Web Tour ORCA Audit Log'
    _inherit = 'orca.log'
    tour_name = fields.Char(string='Tour Name')
    steps_count = fields.Integer(string='Steps')
    active_status = fields.Boolean(string='Active')

class WebTourTour(models.Model):
    _inherit = ['web.tour.tour', 'orca.universal.mixin']
    _orca_tier = 'low'
    _orca_log_model = 'orca.web.tour.log'
    _orca_tracked_fields = ['name', 'tour_id', 'active']
