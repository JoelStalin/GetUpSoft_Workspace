{
    'name': 'Helpdesk Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'helpdesk'],
    'data': ['security/ir.model.access.csv', 'views/helpdesk_orca_log_views.xml'],
    'tests': ['tests/test_helpdesk_orca.py'],
    'installable': True,
    'auto_install': False,
}
