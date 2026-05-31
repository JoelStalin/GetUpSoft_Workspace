{
    'name': 'Website Sale Extended - ORCA Audit Logging',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Website/E-Commerce',
    'depends': [
        'base_orca_integration',
        'website_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/ecommerce_order_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
