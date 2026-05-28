{
    'name': 'Web Unseen Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'web_unseen'],
    'data': ['security/ir.model.access.csv', 'views/web_unseen_orca_log_views.xml'],
    'tests': ['tests/test_web_unseen_orca.py'],
    'installable': True,
    'auto_install': False,
}
