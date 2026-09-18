{
    'name': 'HR Organization Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Human Resources',
    'depends': ['base_orca_integration', 'hr'],
    'data': [
        'security/ir.model.access.csv',
        'views/department_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
