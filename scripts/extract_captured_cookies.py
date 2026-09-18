import sqlite3
import os
import json
import shutil

def extract_cookies_from_capture():
    cookies_db = r"03_AI_Automation\hyperframes\captures\interactive-chrome-profile1\Profile\Network\Cookies"
    if not os.path.exists(cookies_db):
        print(f"❌ No se encontró el archivo de cookies en: {cookies_db}")
        return None

    temp_db = "captured_cookies.sqlite"
    shutil.copy2(cookies_db, temp_db)
    
    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        # Chrome schema is different from Firefox
        cursor.execute("SELECT host_key, name, encrypted_value, path, expires_utc FROM cookies WHERE host_key LIKE '%edx.org%'")
        
        cookies = []
        for row in cursor.fetchall():
            # Encrypted value is hard to decrypt without key, but some are plaintext or we can use the whole DB
            cookies.append({
                'host': row[0],
                'name': row[1],
                'path': row[3],
                'expires': row[4]
            })
        
        conn.close()
        os.remove(temp_db)
        return cookies
    except Exception as e:
        print(f"❌ Error: {e}")
        if os.path.exists(temp_db): os.remove(temp_db)
        return None

if __name__ == "__main__":
    cookies = extract_cookies_from_capture()
    if cookies:
        print(f"✅ Se encontraron {len(cookies)} cookies de edX en el capturado.")
        for c in cookies[:5]:
            print(f" - {c['name']} ({c['host']})")
    else:
        print("⚠️ No se encontraron cookies de edX en el capturado.")
