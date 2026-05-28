from odoo import fields, models


class OrcaStockMoveLog(models.Model):
    _name = 'orca.stock.move.log'
    _description = 'Stock Move ORCA Audit Log'
    _inherit = 'orca.log'

    product_name = fields.Char(
        string='Product Name',
        help='Product name at time of log'
    )
    product_code = fields.Char(
        string='Product Code',
        help='Product code at time of log'
    )
    origin_location = fields.Char(
        string='Origin Location',
        help='Source location at time of log'
    )
    destination_location = fields.Char(
        string='Destination Location',
        help='Destination location at time of log'
    )
    quantity_moved = fields.Float(
        string='Quantity',
        help='Quantity moved at time of log'
    )
    move_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('confirmed', 'Confirmed'),
            ('assigned', 'Assigned'),
            ('done', 'Done'),
            ('cancel', 'Cancelled'),
        ],
        string='Move State',
        help='Stock move state at time of log'
    )


class StockMove(models.Model):
    _inherit = ['stock.move', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.stock.move.log'
