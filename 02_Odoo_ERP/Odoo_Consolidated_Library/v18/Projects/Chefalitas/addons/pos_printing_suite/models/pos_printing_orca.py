# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class PosPrintingOrcaLog(models.Model):
    _name = 'pos_printing_suite.orca.log'
    _description = 'pos_printing_suite ORCA Audit Log'
    _inherit = 'orca.log'

    printer_type = fields.Char(string='Printer Type at Log Time')
    device_state = fields.Char(string='Device State at Log Time')
    agent_version = fields.Char(string='Agent Version at Log Time')


class PosPrinter(models.Model):
    _inherit = ['pos.printer', 'orca.audit.mixin']

    _orca_tracked_fields = ['printer_type', 'local_printer_name', 'hw_proxy_ip']
    _orca_log_model = 'pos_printing_suite.orca.log'

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
            'printer_type': after_dict.get('printer_type', ''),
        })


class PosPrintDevice(models.Model):
    _inherit = ['pos.print.device', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'state', 'agent_version', 'pos_config_id']
    _orca_log_model = 'pos_printing_suite.orca.log'

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
            'device_state': after_dict.get('state', ''),
            'agent_version': after_dict.get('agent_version', ''),
        })
