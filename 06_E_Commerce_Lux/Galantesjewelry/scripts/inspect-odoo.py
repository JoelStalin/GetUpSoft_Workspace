import requests
import json

def debug_odoo_product():
    URL = os.environ.get('URL', "http://odoo:8069/jsonrpc")
    DB = "galantes_db"
    USER = "admin"
    PASS = "Galantesjewelry"

    # 1. Authenticate
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {
            "service": "common",
            "method": "login",
            "args": [DB, USER, PASS]
        },
        "id": 1
    }
    
    try:
        response = requests.post(URL, json=payload)
        uid = response.json().get('result')
        if not uid:
            print(f"Auth failed: {response.json()}")
            return

        # 2. Read product 12
        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [DB, uid, PASS, 'product.template', 'read', [[12], ['name', 'image_1920', 'image_1024', 'image_512', 'image_256', 'image_128', 'product_variant_ids']]]
            },
            "id": 2
        }
        response = requests.post(URL, json=payload)
        result = response.json().get('result')
        if result:
            p = result[0]
            print(f"Product: {p['name']}")
            for k, v in p.items():
                if k.startswith('image_'):
                    print(f"{k}: {bool(v)} (len={len(v) if v else 0})")
            print(f"Variants: {p['product_variant_ids']}")
            
            # Check first variant
            if p['product_variant_ids']:
                vid = p['product_variant_ids'][0]
                payload['params']['args'] = [DB, uid, PASS, 'product.product', 'read', [[vid], ['name', 'image_1920', 'image_256']]]
                response = requests.post(URL, json=payload)
                vresult = response.json().get('result')
                if vresult:
                    pv = vresult[0]
                    print(f"\nVariant {vid}: {pv['name']}")
                    print(f"image_1920: {bool(pv['image_1920'])} (len={len(pv['image_1920']) if pv['image_1920'] else 0})")
                    print(f"image_256: {bool(pv['image_256'])} (len={len(pv['image_256']) if pv['image_256'] else 0})")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_odoo_product()
