{
    'name': 'Invoice ORCA Integration',
    'version': '19.0.1.0.0',
    'category': 'Accounting',
    'sequence': 9,
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'depends': [
        'account',
        'base_orca_integration',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/invoice_line_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Invoice Lines',
    'description': 'Automatically logs all invoice line create/write/unlink operations to ORCA audit trail.',
}
