{
    'name': 'Asset ORCA Integration',
    'version': '19.0.1.0.0',
    'category': 'Accounting',
    'sequence': 9,
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'depends': [
        'account_asset',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/asset_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Fixed Assets',
    'description': 'Automatically logs all fixed asset create/write/unlink operations to ORCA audit trail.',
}
