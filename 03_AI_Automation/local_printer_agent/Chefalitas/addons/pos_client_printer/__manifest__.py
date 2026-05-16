{
    'name': 'POS Client Printer Unified',
    'version': '1.0.0',
    'category': 'Point of Sale',
    'summary': 'Módulo unificado para impresión y autoservicio POS',
    'description': """
        Reúne funcionalidades de:
        - Impresión remota (pos_any_printer)
        - Autoservicio (pos_self_order)
        - Agente local de impresión para Windows
    """,
    'author': 'Joel S. Martinez',
    'depends': ['point_of_sale', 'stock', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_client_printer_views.xml',
        'views/pos_client_config_views.xml',
        'data/pos_client_printer_data.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_client_printer/static/src/js/local_printer_service.js',
            'pos_client_printer/static/src/js/printer.js',
            'pos_client_printer/static/src/js/pos_store.js',
            'pos_client_printer/static/src/js/pos_client_printer.js',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
