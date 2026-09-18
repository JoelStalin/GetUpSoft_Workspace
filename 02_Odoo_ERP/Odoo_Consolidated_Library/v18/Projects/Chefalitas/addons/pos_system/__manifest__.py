# -*- coding: utf-8 -*-
{
    'name': 'Cambios para Punto de Venta',
    'version': '1.1.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com/',
    'license': 'LGPL-3',
    'category': 'Punto de Venta',
    "sequence": 2,
    'summary': 'Cambios para Punto de Venta',
    'complexity': "easy",
    'depends': [
        'sale_management', 'point_of_sale', 'product', 'pos_loyalty', 'base_orca_integration'
    ],
    'data': [
       'views/pos_order/pos_order_views.xml',
       'views/pos_system_orca_log_views.xml',
       'security/pos_system_orca_access.csv',
    ],
    "assets": {
        'point_of_sale._assets_pos': [
            'pos_system/static/src/**/*',
        ],
        'point_of_sale.customer_display_assets': [
            "pos_system/static/src/overrides/components/order_widget/*",
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': True,
}
