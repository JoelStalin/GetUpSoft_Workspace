{
    'name': 'Sale Management Extended - ORCA Audit Logging',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Sales',
    'depends': [
        'base_orca_integration',
        'sale_management',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/quotation_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
