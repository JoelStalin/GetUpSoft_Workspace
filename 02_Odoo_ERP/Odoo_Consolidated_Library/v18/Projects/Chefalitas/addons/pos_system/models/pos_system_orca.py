# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class PosSystemOrcaLog(models.Model):
    _name = 'pos_system.orca.log'
    _description = 'pos_system ORCA Audit Log'
    _inherit = 'orca.log'

    order_state = fields.Char(string='Order State at Log Time')
    customer_name = fields.Char(string='Customer Name at Log Time')
    total_amount = fields.Float(string='Total Amount at Log Time')


class PosOrder(models.Model):
    _inherit = ['pos.order', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'state', 'partner_id', 'amount_total', 'invoice_name']
    _orca_log_model = 'pos_system.orca.log'

    def _orca_log_action(self, record, action, before, after):
        import json
        after_dict = json.loads(after) if after else {}

        self.env[self._orca_log_model].create({
            'module_name': self._module,
            'model_name': self._name,
            'record_id': record.id,
            'action': action,
            'before_values': before,
            'after_values': after,
            'order_state': after_dict.get('state', ''),
            'customer_name': record.partner_id.name if record.partner_id else '',
            'total_amount': after_dict.get('amount_total', 0.0),
        })
