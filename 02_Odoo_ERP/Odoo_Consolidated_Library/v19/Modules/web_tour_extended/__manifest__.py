{
    'name': 'Web Tour Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'web_tour'],
    'data': ['security/ir.model.access.csv', 'views/web_tour_orca_log_views.xml'],
    'tests': ['tests/test_web_tour_orca.py'],
    'installable': True,
    'auto_install': False,
}
