{
    'name': 'Mail Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'mail'],
    'data': ['security/ir.model.access.csv', 'views/mail_orca_log_views.xml'],
    'tests': ['tests/test_mail_orca.py'],
    'installable': True,
    'auto_install': False,
}
