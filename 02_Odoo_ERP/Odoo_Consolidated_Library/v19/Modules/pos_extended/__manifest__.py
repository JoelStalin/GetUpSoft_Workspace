{
    'name': 'POS ORCA Integration',
    'version': '19.0.1.0.0',
    'category': 'Point of Sale',
    'sequence': 9,
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'depends': [
        'point_of_sale',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_order_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Point of Sale orders',
    'description': 'Automatically logs all POS order create/write/unlink operations to ORCA audit trail with field-level change tracking.',
}
