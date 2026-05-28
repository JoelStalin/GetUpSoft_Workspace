{
    'name': 'Dominican Accounting',
    'version': '19.0.2.1.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Accounting/Localization',
    'depends': [
        'account',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/account_move_orca_log_views.xml',
        'data/easycount_cron.xml',
    ],
    'installable': True,
    'auto_install': False,
    'external_dependencies': {
        'python': [],
    },
}
