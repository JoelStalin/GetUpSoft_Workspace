import xmlrpc.client
import os

def check_odoo_images():
    URL = os.environ.get('ODOO_BASE_URL', 'http://localhost:8069')
    DB = os.environ.get('ODOO_DATABASE', 'galantes_db')
    USER = os.environ.get('ODOO_USERNAME', 'admin')
    PASS = os.environ.get('ODOO_PASSWORD', 'Galantesjewelry')

    try:
        common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
        uid = common.authenticate(DB, USER, PASS, {})
        models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
        
        products = models.execute_kw(DB, uid, PASS, 'product.template', 'search_read', [
            [('available_on_website', '=', True)],
            ['id', 'name', 'image_256', 'image_1920']
        ])
        
        print(f"Checking {len(products)} published products in Odoo...")
        for p in products:
            has_256 = bool(p.get('image_256'))
            has_1920 = bool(p.get('image_1920'))
            print(f"Product {p['id']} ({p['name']}): image_256={has_256}, image_1920={has_1920}")
            
    except Exception as e:
        print(f"Error connecting to Odoo: {e}")

if __name__ == "__main__":
    check_odoo_images()
