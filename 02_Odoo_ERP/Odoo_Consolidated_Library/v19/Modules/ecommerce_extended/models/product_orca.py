from odoo import models, fields, api


class OrcaEcommerceLog(models.Model):
    _name = 'orca.ecommerce.log'
    _description = 'Ecommerce Product ORCA Audit Log'
    _inherit = 'orca.log'

    product_name = fields.Char(string='Product Name')
    product_sku = fields.Char(string='Product SKU')
    is_ecommerce = fields.Boolean(string='Ecommerce Available')
    product_price = fields.Float(string='Product Price')
    website_id = fields.Char(string='Website ID')
    category_name = fields.Char(string='Category Name')
    purchase_count = fields.Integer(string='Purchase Count')


class ProductTemplate(models.Model):
    _inherit = ['product.template', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.ecommerce.log'
    _orca_tracked_fields = ['name', 'default_code', 'list_price', 'active', 'is_published', 'categ_id', 'sale_ok']
