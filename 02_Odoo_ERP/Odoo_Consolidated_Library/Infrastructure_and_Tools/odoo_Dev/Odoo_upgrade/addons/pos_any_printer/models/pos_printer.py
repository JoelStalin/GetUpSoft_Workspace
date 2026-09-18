# -*- coding: utf-8 -*-
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):
    _inherit = 'pos.printer'

    printer_type = fields.Selection(selection_add=[('any_printer', 'Use any printer')], string="Printer Type")
    any_printer_ip = fields.Char(string='Proxy Printer IP Address', help="Local IP address of proxy receipt printer.")

    @api.constrains('any_printer_ip')
    def _constrains_any_printer_ip(self):
        for record in self:
            if record.printer_type == 'any_printer' and not record.any_printer_ip:
                raise ValidationError(_("Printer IP Address cannot be empty."))
    @api.model
    def _load_pos_data_fields(self, config_id):
        params = super()._load_pos_data_fields(config_id)
        params += ['any_printer_ip']
        return params