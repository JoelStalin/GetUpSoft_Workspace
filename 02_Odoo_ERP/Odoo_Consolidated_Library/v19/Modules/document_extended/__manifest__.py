{
    'name': 'Document Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'document'],
    'data': ['security/ir.model.access.csv', 'views/document_orca_log_views.xml'],
    'tests': ['tests/test_document_orca.py'],
    'installable': True,
    'auto_install': False,
}
