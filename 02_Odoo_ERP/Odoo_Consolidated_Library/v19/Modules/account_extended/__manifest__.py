{
    'name': 'Account ORCA Integration',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Technical/Accounting',
    'depends': [
        'account',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/account_move_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
    'summary': 'ORCA audit logging for account.move with universal field auto-detection',
}
