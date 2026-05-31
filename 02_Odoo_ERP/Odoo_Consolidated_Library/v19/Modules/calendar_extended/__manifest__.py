{
    'name': 'Calendar Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Calendar',
    'depends': ['base_orca_integration', 'calendar'],
    'data': [
        'security/ir.model.access.csv',
        'views/calendar_event_orca_log_views.xml',
    ],
    'tests': [
        'tests/test_calendar_event_orca.py',
    ],
    'installable': True,
    'auto_install': False,
}
