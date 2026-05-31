{
    'name': 'Website Form Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'website_form'],
    'data': ['security/ir.model.access.csv', 'views/website_form_orca_log_views.xml'],
    'tests': ['tests/test_website_form_orca.py'],
    'installable': True,
    'auto_install': False,
}
