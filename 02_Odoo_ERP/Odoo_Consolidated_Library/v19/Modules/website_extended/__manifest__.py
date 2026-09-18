{
    'name': 'Website Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Website',
    'depends': ['base_orca_integration', 'website'],
    'data': [
        'security/ir.model.access.csv',
        'views/website_page_orca_log_views.xml',
    ],
    'tests': [
        'tests/test_website_page_orca.py',
    ],
    'installable': True,
    'auto_install': False,
}
