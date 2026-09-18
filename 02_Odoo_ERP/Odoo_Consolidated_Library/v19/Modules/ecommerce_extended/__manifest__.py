{
    'name': 'Ecommerce Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Sales/eCommerce',
    'depends': ['base_orca_integration', 'sale', 'website_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/product_orca_log_views.xml',
    ],
    'tests': [
        'tests/test_product_orca.py',
    ],
    'installable': True,
    'auto_install': False,
}
