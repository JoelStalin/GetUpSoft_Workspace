{
    'name': 'Website Survey Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'survey'],
    'data': ['security/ir.model.access.csv', 'views/website_survey_orca_log_views.xml'],
    'tests': ['tests/test_website_survey_orca.py'],
    'installable': True,
    'auto_install': False,
}
