import xmlrpc.client
import os

def debug_product_24():
    URL = "http://localhost:8069" # Assuming running this where Odoo is accessible or via port forward
    DB = "galantes_db"
    USER = "admin"
    PASS = "Galantesjewelry"

    try:
        common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
        uid = common.authenticate(DB, USER, PASS, {})
        models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
        
        product = models.execute_kw(DB, uid, PASS, 'product.template', 'read', [[24], ['name', 'image_256', 'image_1920', 'available_on_website']])
        
        if not product:
            print("Product 24 not found in Odoo.")
            return

        p = product[0]
        print(f"Product: {p['name']}")
        print(f"Available on website: {p.get('available_on_website')}")
        print(f"Has image_256: {bool(p.get('image_256'))}")
        if p.get('image_256'):
            print(f"image_256 size: {len(p.get('image_256'))} chars")
        print(f"Has image_1920: {bool(p.get('image_1920'))}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_product_24()
