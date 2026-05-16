# -*- coding: utf-8 -*-
from odoo import models

class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_any_printer(self):
        # Si 'pos_restaurant' no está instalado, usa '_loader_params' del módulo base.
        result = super(PosSession, self)._loader_params()
        result['search_params']['fields'].append('any_printer_ip')
        return result
