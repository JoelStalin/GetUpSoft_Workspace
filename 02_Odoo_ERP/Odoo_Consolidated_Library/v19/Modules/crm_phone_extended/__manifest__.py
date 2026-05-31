{
    'name': 'CRM Phone Extended - ORCA Audit Logging',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'CRM',
    'depends': [
        'base_orca_integration',
        'crm_phone',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/phone_call_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
