import sqlite3
import os
import shutil
import json
import tempfile
from pathlib import Path

def extract_cookies():
    profile_path = os.path.join(os.environ['APPDATA'], r"Mozilla\Firefox\Profiles\99pc1oym.dev-edition-default")
    cookies_db = os.path.join(profile_path, "cookies.sqlite")
    
    temp_db = os.path.join(tempfile.gettempdir(), "cookies_temp.sqlite")
    shutil.copy2(cookies_db, temp_db)
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    cursor.execute("SELECT host, name, value, path, expiry FROM moz_cookies WHERE host LIKE '%edx.org%' OR host LIKE '%2u.com%' OR host LIKE '%google.com%'")
    
    cookies = []
    for row in cursor.fetchall():
        cookies.append({
            'domain': row[0],
            'name': row[1],
            'value': row[2],
            'path': row[3],
            'expires': row[4]
        })
    
    conn.close()
    os.remove(temp_db)
    return cookies

if __name__ == "__main__":
    c = extract_cookies()
    with open("edx_cookies.json", "w") as f:
        json.dump(c, f, indent=2)
    print(f"✅ Extraídas {len(c)} cookies.")
