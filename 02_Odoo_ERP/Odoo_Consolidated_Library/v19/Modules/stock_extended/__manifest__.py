{
    'name': 'Inventory ORCA Integration',
    'version': '19.0.1.0.0',
    'category': 'Inventory',
    'sequence': 9,
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'depends': [
        'stock',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/stock_move_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Inventory Movements',
    'description': 'Automatically logs all stock movement create/write/unlink operations to ORCA audit trail.',
}
