# -*- coding: utf-8 -*-
{
    'name': 'POS Any Printer',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'summary': 'Impresora Cualquiera en POS',
    'description': """
Usa cualquier impresora de red sin la IoT Box en el Punto de Venta.
Conecta cualquier impresora de red directamente al POS usando una dirección IP.
""",
    'depends': ['base', 'point_of_sale', 'pos_restaurant'],
    'data': [
        'views/pos_config_views.xml',
        'views/res_config_settings_views.xml',
        'views/pos_printer_views.xml',
    ],
    'installable': True,
    'auto_install': False,
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_any_printer/static/src/**/*',
            
        ],
    },
    'license': 'LGPL-3',
}