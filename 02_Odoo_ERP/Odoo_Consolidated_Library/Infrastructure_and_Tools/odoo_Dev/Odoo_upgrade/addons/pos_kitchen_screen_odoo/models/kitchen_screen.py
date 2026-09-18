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

from odoo import api, fields, models

class KitchenScreen(models.Model):
    """Kitchen Screen model for the cook"""
    _name = 'kitchen.screen'
    _description = 'POS Kitchen Screen'
    _rec_name = 'sequence'

    def _get_pos_config_domain(self):
        """Domain for the allowed POS configuration"""
        kitchen_screens = self.search([]).mapped('pos_config_id.id')
        return [('module_pos_restaurant', '=', True), ('id', 'not in', kitchen_screens)]

    sequence = fields.Char(
        string="Sequence",
        readonly=True,
        default='New',
        copy=False,
        help="Sequence of items"
    )
    
    pos_config_id = fields.Many2one(
        'pos.config',
        string='Allowed POS',
        domain=_get_pos_config_domain,
        help="Allowed POS for the kitchen"
    )
    
    pos_categ_ids = fields.Many2many(
        'pos.category',
        string='Allowed POS Category',
        help="Allowed POS Category for the corresponding POS"
    )
    
    shop_number = fields.Integer(
        related='pos_config_id.id',
        string='Shop Number',
        help="ID of the POS"
    )

    def open_kitchen_screen(self):
        """Redirect to the corresponding kitchen screen for the cook"""
        if not self.pos_config_id:
            return
        return {
            'type': 'ir.actions.act_url',
            'target': 'new',
            'url': f'/pos/kitchen?pos_config_id={self.pos_config_id.id}',
        }

    @api.model_create_multi
    def create(self, vals_list):
        """Override create method to generate sequence"""
        for vals in vals_list:
            if vals.get('sequence', 'New') == 'New':
                vals['sequence'] = self.env['ir.sequence'].next_by_code('kitchen.screen') or 'New'
        records = super(KitchenScreen, self).create(vals_list)
        return records
