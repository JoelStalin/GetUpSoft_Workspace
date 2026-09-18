{
    'name': 'Digest Extended',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'depends': ['base_orca_integration', 'digest'],
    'data': ['security/ir.model.access.csv', 'views/digest_orca_log_views.xml'],
    'tests': ['tests/test_digest_orca.py'],
    'installable': True,
    'auto_install': False,
}
