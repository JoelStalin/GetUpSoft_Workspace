{
    'name': 'Sales ORCA Integration',
    'version': '19.0.1.0.0',
    'category': 'Sales',
    'sequence': 9,
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'depends': [
        'sale',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/sale_order_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Sales orders',
    'description': 'Automatically logs all sales order create/write/unlink operations to ORCA audit trail with field-level change tracking.',
}
