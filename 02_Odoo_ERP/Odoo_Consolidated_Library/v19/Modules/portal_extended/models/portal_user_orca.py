from odoo import models, fields, api


class OrcaPortalUserLog(models.Model):
    _name = 'orca.portal.user.log'
    _description = 'Portal User ORCA Audit Log'
    _inherit = 'orca.log'

    user_email = fields.Char(string='User Email')
    partner_name = fields.Char(string='Partner Name')
    portal_access = fields.Boolean(string='Portal Access')
    access_level = fields.Selection([
        ('public', 'Public'),
        ('partner', 'Partner'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    ], string='Access Level')
    last_login = fields.Datetime(string='Last Login')


class ResPartner(models.Model):
    _inherit = ['res.partner', 'orca.universal.mixin']

    _orca_tier = 'medium'
    _orca_log_model = 'orca.portal.user.log'
    _orca_tracked_fields = ['name', 'email', 'active', 'company_id', 'user_ids']
