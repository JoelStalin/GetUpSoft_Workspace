# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2024-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Gokul P I (odoo@cybrosys.com)
#
#    This program is distributed under the terms of the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#############################################################################

from odoo import models


class PosSession(models.Model):
    """Inherit POS session to add custom order loading"""

    _inherit = 'pos.session'

    def _pos_ui_models_to_load(self):
        """
        Extend the list of models to load in POS UI.
        """
        result = super()._pos_ui_models_to_load()
        # Agregamos nuevos modelos requeridos para la pantalla de cocina
        result = set(result) | {'pos.order', 'pos.order.line'}
        return list(result)

    def _loader_params_pos_order(self):
        """
        Define fields to load for POS Order.
        """
        return {
            'search_params': {
                'domain': [],
                'fields': [
                    'name', 'date_order', 'pos_reference',
                    'partner_id', 'lines', 'order_status',
                    'order_ref', 'is_cooking', 'minutes', 'floor'
                ]
            }
        }

    def _get_pos_ui_pos_order(self, params):
        """
        Get POS Order data for POS UI.
        """
        return self.env['pos.order'].search_read(**params['search_params'])

    def _loader_params_pos_order_line(self):
        """
        Define fields to load for POS Order Line.
        """
        return {
            'search_params': {
                'domain': [],
                'fields': [
                    'product_id', 'qty', 'order_status',
                    'order_ref', 'customer_id', 'price_subtotal', 'total_cost'
                ]
            }
        }

    def _get_pos_ui_pos_order_line(self, params):
        """
        Get POS Order Line data for POS UI.
        """
        return self.env['pos.order.line'].search_read(**params['search_params'])
