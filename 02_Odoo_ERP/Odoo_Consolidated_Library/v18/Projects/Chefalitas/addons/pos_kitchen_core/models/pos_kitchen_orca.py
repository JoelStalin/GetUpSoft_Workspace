# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class PosKitchenOrcaLog(models.Model):
    _name = 'pos_kitchen_core.orca.log'
    _description = 'pos_kitchen_core ORCA Audit Log'
    _inherit = 'orca.log'

    recipe_name = fields.Char(string='Recipe Name at Log Time')
    preparation_state = fields.Char(string='Preparation State at Log Time')
    portions_prepared = fields.Float(string='Portions Prepared at Log Time')


class RestRecipe(models.Model):
    _inherit = ['rest.recipe', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'product_id', 'active', 'target_margin_pct', 'notes_kitchen']
    _orca_log_model = 'pos_kitchen_core.orca.log'

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
            'recipe_name': after_dict.get('name', ''),
            'portions_prepared': 0.0,
        })


class RestPreparation(models.Model):
    _inherit = ['rest.preparation', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'recipe_id', 'state', 'prepared_portions', 'real_total_weight_g']
    _orca_log_model = 'pos_kitchen_core.orca.log'

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
            'preparation_state': after_dict.get('state', ''),
            'portions_prepared': after_dict.get('prepared_portions', 0.0),
        })
