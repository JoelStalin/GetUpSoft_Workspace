from odoo import fields, models


class OrcaAssetLog(models.Model):
    _name = 'account.asset.orca.log'
    _description = 'Asset ORCA Audit Log'
    _inherit = 'orca.log'

    asset_name = fields.Char(
        string='Asset Name',
        help='Asset name at time of log'
    )
    asset_code = fields.Char(
        string='Asset Code',
        help='Asset code at time of log'
    )
    gross_value = fields.Float(
        string='Gross Value',
        help='Gross asset value at time of log'
    )
    book_value = fields.Float(
        string='Book Value',
        help='Book value at time of log'
    )
    asset_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('open', 'Running'),
            ('close', 'Closed'),
            ('paused', 'Paused'),
        ],
        string='Asset State',
        help='Asset state at time of log'
    )


class AccountAsset(models.Model):
    _inherit = ['account.asset', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'account.asset.orca.log'
