{
    'name': 'Accounting Reports - ORCA Integration',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Accounting',
    'depends': [
        'base_orca_integration',
        'account',
        'account_reports',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/account_reports_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
