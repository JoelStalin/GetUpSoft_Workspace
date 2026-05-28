{
    'name': 'Event Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'event'],
    'data': ['security/ir.model.access.csv', 'views/event_orca_log_views.xml'],
    'tests': ['tests/test_event_orca.py'],
    'installable': True,
    'auto_install': False,
}
