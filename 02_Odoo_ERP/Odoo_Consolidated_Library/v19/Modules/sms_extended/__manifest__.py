{
    'name': 'SMS Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'sms'],
    'data': ['security/ir.model.access.csv', 'views/sms_orca_log_views.xml'],
    'tests': ['tests/test_sms_orca.py'],
    'installable': True,
    'auto_install': False,
}
