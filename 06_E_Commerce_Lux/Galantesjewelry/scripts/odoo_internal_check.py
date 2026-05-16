import odoo
from odoo import api, SUPERUSER_ID

def check_data():
    db = 'galantes_db'
    registry = odoo.registry(db)
    with registry.cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})
        products = env['product.template'].search([('available_on_website','=',True)])
        print(f"Total published products: {len(products)}")
        for p in products:
            has_img = bool(p.image_1920)
            has_variant_img = any(bool(v.image_1920) for v in p.product_variant_ids)
            print(f"ID {p.id}: {p.name} | template_img={has_img}, variant_img={has_variant_img}")

if __name__ == "__main__":
    check_data()
