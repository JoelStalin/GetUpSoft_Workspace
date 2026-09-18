import xmlrpc.client
import os

# Configuration from .env.prod (manual extraction for the script)
URL = "http://localhost:8069" # Switch to localhost for local testing if needed
DB = "galantes_db"
USER = "admin"
PASS = "Galantesjewelry"

def check_images():
    try:
        common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
        uid = common.authenticate(DB, USER, PASS, {})
        models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
        
        # 1. Check Product Templates
        products = models.execute_kw(DB, uid, PASS, 'product.template', 'search_read', [
            [('available_on_website', '=', True)],
            ['id', 'name', 'image_1920', 'image_256']
        ])
        
        print(f"--- Product Templates ({len(products)}) ---")
        for p in products:
            img_1920_size = len(p.get('image_1920') or '')
            img_256_size = len(p.get('image_256') or '')
            print(f"Template {p['id']} ({p['name']}): 1920={img_1920_size} chars, 256={img_256_size} chars")

        # 2. Check Product Variants (some might have images here)
        variants = models.execute_kw(DB, uid, PASS, 'product.product', 'search_read', [
            [('available_on_website', '=', True)],
            ['id', 'product_tmpl_id', 'image_1920', 'image_256']
        ])
        print(f"\n--- Product Variants ({len(variants)}) ---")
        for v in variants:
            img_1920_size = len(v.get('image_1920') or '')
            img_256_size = len(v.get('image_256') or '')
            tmpl_id = v.get('product_tmpl_id')[0] if v.get('product_tmpl_id') else 'N/A'
            print(f"Variant {v['id']} (Template {tmpl_id}): 1920={img_1920_size} chars, 256={img_256_size} chars")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_images()
