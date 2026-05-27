{
    'name': 'Dominican Point of Sale',
    'version': '19.0.2.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Point of Sale/Localization',
    'depends': [
        'point_of_sale',
        'base_orca_integration',
        'l10n_do_accounting',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_order_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
