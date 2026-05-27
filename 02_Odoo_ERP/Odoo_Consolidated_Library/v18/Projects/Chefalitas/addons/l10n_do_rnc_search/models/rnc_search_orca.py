from odoo import fields, models


class RncSearchOrcaLog(models.Model):
    _name = 'l10n.do.rnc.search.orca.log'
    _description = 'RNC Search ORCA Audit Log'
    _inherit = 'orca.log'

    search_term = fields.Char(string='Search Term')
    result_count = fields.Integer(string='Results Found')
    result_status = fields.Char(string='Search Status')
    searched_rnc = fields.Char(string='Searched RNC')
    dgii_response_code = fields.Char(string='DGII Response Code')


class RncSearchOrcaMixin(models.AbstractModel):
    _name = 'rnc.search.orca.mixin'
    _description = 'RNC Search ORCA Mixin'

    def log_rnc_search(self, search_term, result_count=0, result_status='success', searched_rnc='', dgii_response_code=''):
        self.env['l10n.do.rnc.search.orca.log'].create({
            'module_name': 'l10n_do_rnc_search',
            'model_name': 'l10n_do_rnc_search',
            'record_id': 0,
            'action': 'search',
            'search_term': search_term,
            'result_count': result_count,
            'result_status': result_status,
            'searched_rnc': searched_rnc,
            'dgii_response_code': dgii_response_code,
        })
