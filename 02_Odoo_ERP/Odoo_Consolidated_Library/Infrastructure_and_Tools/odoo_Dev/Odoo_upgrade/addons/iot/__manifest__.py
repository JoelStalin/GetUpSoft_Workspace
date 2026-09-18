{
    'name': 'IoT Module',
    "version": "18.0.1.0.0",
    'category': 'Tools',
    'author': 'Joel S. Martínez',
    'website': 'https://www.getupdoft.com.do',
    'summary': 'IoT integration for Odoo',
    'depends': [
        'base',
        'web',  
    ],
    'data': [
        'security/iot_security.xml',
        'security/ir.model.access.csv',
        'views/iot_views.xml',
        'wizard/add_iot_box_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'iot/static/src/js/*.js',
            'iot/static/src/js/iot_box_kanban.js',
        ],
        'web.assets_qweb': [
            'iot/static/src/xml/*.xml',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
