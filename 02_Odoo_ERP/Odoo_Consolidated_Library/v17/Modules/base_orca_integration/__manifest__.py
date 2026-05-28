{
    'name': 'Base ORCA Integration',
    'version': '17.0.1.1.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Technical',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'data/orca_config_data.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
    'summary': 'Base module for ORCA audit logging and integration across all Odoo modules',
}
