# -*- coding: utf-8 -*-
from odoo import fields, models, api

class PosConfig(models.Model):
    _inherit = 'pos.config'

    any_printer_ip = fields.Char(string='Any Printer IP Address', help="Local IP address of the Any Printer")
    use_pricelist = fields.Boolean(string="Use Pricelist", default=False)
    
    def _load_pos_data_fields(self, config_id):
        params = super(PosConfig, self)._load_pos_data_fields(config_id)
        params.append('any_printer_ip')
        return params
    def _loader_params_pos_config(self):
        result = super()._loader_params_pos_config()
        result['search_params']['fields'].append('use_pricelist')
        return result