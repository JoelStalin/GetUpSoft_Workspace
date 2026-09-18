# -*- coding: utf-8 -*-
{
    'name': "RNC DGII Search",
    'summary': """
        Buscador de RNC en DGII con ORCA integration
    """,
    'description': """
        Buscador de RNC en DGII

        Este es un módulo bifurcado de https://github.com/AstraTechRD/l10n_do_rnc_search,
        por tanto, los derechos de creación y agradecimientos se le atribuyen a su empresa
        matriz Astra Tech SRL y su creador @jeffryjdelarosa.

        Este módulo seguirá obteniendo fixes de su repositorio original, y los fixes o nuevas
        funcionalidades creadas por Neotec SRL serán enviadas por igual a su repositorio original.

        ORCA Integration: All RNC searches are logged to ORCA for audit trail and compliance.
    """,
    'website': 'https://astratech.com.do',
    'author': 'getupsoft',
    'category': 'Localization',
    'version': '18.0.2.0.0',

    # Dependencias
    'depends': ['base', 'l10n_do_accounting', 'base_orca_integration'],

    # Archivos de assets para Odoo 18
    'assets': {
        'web._assets_backend': [  # Cambio en la clave de assets para Odoo 18
            'l10n_do_rnc_search/static/src/js/l10n_do_accounting.js',
        ]
    },

    # Archivos de datos
    'data': [
        'security/ir.model.access.csv',
        'data/ir_config_parameters.xml',
        'views/res_partner_views.xml',
        'views/rnc_search_orca_log_views.xml',
    ],

    'auto_install': True,
    'license': "LGPL-3",
}
