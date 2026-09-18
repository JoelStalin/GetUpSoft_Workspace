{
    'name': 'Snailmail Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'snailmail'],
    'data': ['security/ir.model.access.csv', 'views/snailmail_orca_log_views.xml'],
    'tests': ['tests/test_snailmail_orca.py'],
    'installable': True,
    'auto_install': False,
}
