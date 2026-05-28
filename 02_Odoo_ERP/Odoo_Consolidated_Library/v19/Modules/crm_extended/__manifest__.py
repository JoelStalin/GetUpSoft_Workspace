{
    'name': 'CRM Extended - ORCA Audit Logging',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'CRM',
    'depends': [
        'base_orca_integration',
        'crm',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/lead_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
