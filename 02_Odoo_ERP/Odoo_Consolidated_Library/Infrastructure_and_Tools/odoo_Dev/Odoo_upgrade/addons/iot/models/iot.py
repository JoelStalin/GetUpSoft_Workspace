# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

# ----------------------------------------------------------
# Models for client
# ----------------------------------------------------------
class IotBox(models.Model):
    _name = 'iot.box'
    _description = 'IoT Box'

    name = fields.Char('Name', readonly=True)
    identifier = fields.Char(string='Identifier (Mac Address)', readonly=True)
    device_ids = fields.One2many('iot.device', 'iot_id', string="Devices", readonly=True)
    device_count = fields.Integer(compute='_compute_device_count', store=True)
    ip = fields.Char('Domain Address', readonly=True)
    ip_url = fields.Char('IoT Box Home Page', readonly=True, compute='_compute_ip_url', store=True)
    drivers_auto_update = fields.Boolean(
        string='Automatic drivers update', 
        help='Automatically update drivers when the IoT Box boots', 
        default=True
    )
    version = fields.Char('Image Version', readonly=True)
    company_id = fields.Many2one('res.company', string='Company')

    @api.depends('ip')
    def _compute_ip_url(self):
        for box in self:
            if not box.ip:
                box.ip_url = False
            else:
                protocol = 'https' if self.env['ir.config_parameter'].sudo().get_param('web.base.url').startswith('https') else 'http'
                box.ip_url = f'{protocol}://{box.ip}:8069'

    @api.depends('device_ids')
    def _compute_device_count(self):
        device_data = self.env['iot.device'].read_group(
            [('iot_id', 'in', self.ids)],
            ['iot_id'], 
            ['iot_id']
        )
        count_dict = {data['iot_id'][0]: data['iot_id_count'] for data in device_data}
        for box in self:
            box.device_count = count_dict.get(box.id, 0)


class IotDevice(models.Model):
    _name = 'iot.device'
    _description = 'IoT Device'

    iot_id = fields.Many2one('iot.box', string='IoT Box', required=True, ondelete='cascade')
    name = fields.Char('Name')
    identifier = fields.Char(string='Identifier', readonly=True)
    type = fields.Selection([
        ('printer', 'Printer'),
        ('camera', 'Camera'),
        ('keyboard', 'Keyboard'),
        ('scanner', 'Barcode Scanner'),
        ('device', 'Device'),
        ('payment', 'Payment Terminal'),
        ('scale', 'Scale'),
        ('display', 'Display'),
        ('fiscal_data_module', 'Fiscal Data Module'),
    ], readonly=True, default='device', string='Type', help="Type of device.")
    manufacturer = fields.Char(string='Manufacturer', readonly=True)
    connection = fields.Selection([
        ('network', 'Network'),
        ('direct', 'USB'),
        ('bluetooth', 'Bluetooth'),
        ('serial', 'Serial'),
        ('hdmi', 'Hdmi'),
    ], readonly=True, string="Connection", help="Type of connection.")
    report_ids = fields.One2many('ir.actions.report', 'device_id', string='Reports')
    iot_ip = fields.Char(related="iot_id.ip", store=True, readonly=True)
    company_id = fields.Many2one('res.company', related="iot_id.company_id", store=True, readonly=True)
    connected = fields.Boolean(string='Status', help='If device is connected to the IoT Box', readonly=True)
    keyboard_layout = fields.Many2one('iot.keyboard.layout', string='Keyboard Layout')
    display_url = fields.Char('Display URL', help="URL displayed on the device.")
    manual_measurement = fields.Boolean(
        string='Manual Measurement', 
        compute="_compute_manual_measurement", 
        store=True, 
        help="Manually read the measurement from the device"
    )
    is_scanner = fields.Boolean(
        string='Is Scanner', 
        compute="_compute_is_scanner", 
        inverse="_set_scanner", 
        store=True,
        help="Manually switch the device type between keyboard and scanner"
    )

    def name_get(self):
        return [(device.id, f"[{device.iot_id.name}] {device.name}") for device in self]

    @api.depends('type')
    def _compute_is_scanner(self):
        for device in self:
            device.is_scanner = device.type == 'scanner'

    def _set_scanner(self):
        for device in self:
            device.type = 'scanner' if device.is_scanner else 'keyboard'

    @api.depends('manufacturer')
    def _compute_manual_measurement(self):
        for device in self:
            device.manual_measurement = device.manufacturer == 'Adam'


class KeyboardLayout(models.Model):
    _name = 'iot.keyboard.layout'
    _description = 'Keyboard Layout'

    name = fields.Char('Name')
    layout = fields.Char('Layout')
    variant = fields.Char('Variant')
