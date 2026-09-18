{
    'name': 'Portal Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Portal',
    'depends': ['base_orca_integration', 'portal'],
    'data': [
        'security/ir.model.access.csv',
        'views/portal_user_orca_log_views.xml',
    ],
    'tests': [
        'tests/test_portal_user_orca.py',
    ],
    'installable': True,
    'auto_install': False,
}
