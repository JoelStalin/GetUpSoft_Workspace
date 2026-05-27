{
    'name': 'Dominican RNC Search and Validation',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Localization/Validation',
    'depends': [
        'base',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/rnc_search_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
