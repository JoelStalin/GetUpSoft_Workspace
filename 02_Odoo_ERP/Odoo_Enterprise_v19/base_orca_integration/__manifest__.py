{
    'name': 'Base ORCA Integration - Universal Module',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Technical',
    'summary': 'Universal ORCA audit logging and EasyCount fiscal operations framework',
    'description': '''
        Base ORCA Integration module for Odoo 19.

        Features:
        - OrcaUniversalMixin: Automatic field detection and change tracking for any model
        - EasyCount ERP-agnostic core: FiscalOperation abstraction for multi-ERP support
        - ORCA Rules Engine: Reactive compliance enforcement and validation
        - Dynamic audit logging: Tier-based logging (CRITICAL, HIGH, MEDIUM, OPTIONAL)
        - Multi-tenant isolation: Project-based segregation

        Integrates with:
        - ORCA NestJS backend (POST /api/orca/audit-log)
        - EasyCount fiscal operations platform
        - DGII, AEAT, SAT tax authorities
    ''',
    'depends': ['base', 'account'],
    'data': [
        'security/ir.model.access.csv',
        'data/orca_config_data.xml',
    ],
    'installable': True,
    'auto_install': False,
    'post_init_hook': '_post_init_orca_config',
}
