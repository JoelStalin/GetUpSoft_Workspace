# -*- coding: utf-8 -*-
{
    "name": "POS Printing Suite",
    "version": "18.0.2.0.0",
    "author": "getupsoft",
    "website": "https://getupsoft.com/",
    "license": "LGPL-3",
    "category": "Sales/Point of Sale",
    "summary": "Unified POS printing: Local Agent (Windows), HW Proxy, Self-Order",
    "depends": ["point_of_sale", 'pos_self_order', 'base_orca_integration'],
    "post_init_hook": "post_init_hook",
    "assets": {
        # Legacy compatibility: /pos/web (older POS route) may rely on this bundle key.
        "point_of_sale.assets": [
            "pos_printing_suite/static/src/**/*.js",
        ],
        "point_of_sale._assets_pos": [
            "pos_printing_suite/static/src/**/*.js",
        ],
        "pos_self_order.assets": [
            "pos_printing_suite/static/src/app/printers/*.js",
            "pos_printing_suite/static/src/overrides/self_order_service_patch.js",
        ],
    },
    "data": [
        "security/ir.model.access.csv",
        "security/security.xml",
        "security/pos_printing_orca_access.csv",
        "views/pos_config_views.xml",
        "views/agent_install_wizard_views.xml",
        "views/pos_printing_orca_log_views.xml",
    ],
    "installable": True,
    "application": False,
}
