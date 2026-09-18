# -*- coding: utf-8 -*-

import base64
from odoo import fields, models, api


class IrActionReport(models.Model):
    _inherit = 'ir.actions.report'

    device_id = fields.Many2one(
        'iot.device', 
        string='IoT Device', 
        domain="[('type', '=', 'printer')]",
        help='When setting a device here, the report will be printed through this device on the IoT Box'
    )

    @api.model
    def iot_render(self, res_ids, data=None):
        """
        Render the report and encode it for IoT printing.
        """
        device = self.device_id or self.env['iot.device'].browse(data.get('device_id'))
        if not device or not device.iot_id:
            raise ValueError("Invalid IoT device or IoT box configuration.")

        datas = self._render(res_ids, data=data)
        if not datas or not datas[0]:
            raise ValueError("Empty report data.")

        # Codificar solo si es necesario (evitar overhead innecesario)
        data_bytes = datas[0]
        data_base64 = base64.b64encode(data_bytes).decode('utf-8')

        return device.iot_id.ip, device.identifier, data_base64

    def report_action(self, docids, data=None, config=True):
        """
        Trigger the report action and optionally redirect to the printer.
        """
        result = super().report_action(docids, data, config)
        if result.get('type') != 'ir.actions.report':
            return result

        # Definir dispositivo IoT de forma segura
        device = self.device_id
        if data:
            device_id = data.get('device_id')
            if device_id:
                device = self.env['iot.device'].browse(device_id)

        # Solo definir si el dispositivo existe
        if device:
            result.update({
                'id': self.id,
                'device_id': device.identifier,
            })

        return result

    def _get_readable_fields(self):
        """
        Define los campos accesibles para lectura en el contexto de IoT.
        """
        return super()._get_readable_fields() | {
            "device_id",
        }
