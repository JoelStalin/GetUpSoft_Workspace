{
    'name': 'CRM Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'crm'],
    'data': ['security/ir.model.access.csv', 'views/crm_orca_log_views.xml'],
    'tests': ['tests/test_crm_orca.py'],
    'installable': True,
    'auto_install': False,
}
