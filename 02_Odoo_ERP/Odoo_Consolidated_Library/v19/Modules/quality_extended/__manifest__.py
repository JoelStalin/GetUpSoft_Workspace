{
    'name': 'Quality Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Manufacturing',
    'depends': ['base_orca_integration', 'quality'],
    'data': [
        'security/ir.model.access.csv',
        'views/quality_check_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
