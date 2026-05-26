# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class PosPrinterOrcaLog(models.Model):
    _name = 'pos_any_printer.orca.log'
    _description = 'pos_any_printer ORCA Audit Log'
    _inherit = 'orca.log'

    printer_type = fields.Char(string='Printer Type at Log Time')
    printer_ip = fields.Char(string='Printer IP at Log Time')
    config_name = fields.Char(string='Associated Config')


class PosPrinter(models.Model):
    _inherit = ['pos.printer', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'printer_type', 'any_printer_ip']
    _orca_log_model = 'pos_any_printer.orca.log'

    def _orca_log_action(self, record, action, before, after):
        import json
        before_dict = json.loads(before) if before else {}
        after_dict = json.loads(after) if after else {}

        self.env[self._orca_log_model].create({
            'module_name': self._module,
            'model_name': self._name,
            'record_id': record.id,
            'action': action,
            'before_values': before,
            'after_values': after,
            'printer_type': after_dict.get('printer_type', ''),
            'printer_ip': after_dict.get('any_printer_ip', ''),
            'config_name': record.config_id.name if hasattr(record, 'config_id') and record.config_id else '',
        })
