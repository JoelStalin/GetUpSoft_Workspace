{
    "name": "Electronic Fiscal Localization (Dominican Republic)",
    "author": "Joel S. Martinez <ceo@getupsoft.com.do>, Getupsoft",
    "website": "https://neotec.do/",
    "version": "18.0.1.0.0",
    "category": "Localization",
    "license": "LGPL-3",
    "depends": ["l10n_do_accounting"],
    "data": [
        "data/l10n_latam.document.type.csv",
        "data/account_fiscal_position_data.xml",
    ],
    "installable": True,
    "auto_install": False,
    "application": False,
    "post_init_hook": "_l10n_do_e_accounting_post_init",
}