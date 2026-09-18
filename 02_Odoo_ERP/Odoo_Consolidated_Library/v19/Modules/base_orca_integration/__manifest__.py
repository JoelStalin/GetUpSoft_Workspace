{
    'name': 'Base ORCA Integration',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Technical',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/orca_log_views.xml',
        'data/orca_config_data.xml',
    ],
    'installable': True,
    'auto_install': False,
    'external_dependencies': {
        'python': [],
    },
}
