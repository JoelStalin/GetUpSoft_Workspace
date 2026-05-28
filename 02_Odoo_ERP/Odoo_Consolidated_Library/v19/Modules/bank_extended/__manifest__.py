{
    'name': 'Bank ORCA Integration',
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
        'views/bank_statement_orca_log_views.xml',
    ],
    'assets': {},
    'summary': 'ORCA audit logging for Bank Statements and Reconciliation',
    'description': 'Automatically logs all bank statement create/write/unlink operations to ORCA audit trail.',
}
