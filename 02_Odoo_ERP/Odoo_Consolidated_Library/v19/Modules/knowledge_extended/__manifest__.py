{
    'name': 'Knowledge Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'knowledge'],
    'data': ['security/ir.model.access.csv', 'views/knowledge_orca_log_views.xml'],
    'tests': ['tests/test_knowledge_orca.py'],
    'installable': True,
    'auto_install': False,
}
