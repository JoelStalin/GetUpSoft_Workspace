import time
import sys
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.main import main as run_individual_bot

QUEUE_FILE = "bot/db/prospection_queue.json"

def save_queue(users):
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    with open(QUEUE_FILE, "w") as f:
        json.dump(users, f, indent=4)

def load_queue():
    if os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE, "r") as f:
            return json.load(f)
    return []

def deep_follower_scraping(driver):
    """Realiza scroll profundo en el modal asegurando la apertura física."""
    print("[STEP] Iniciando captura masiva de la audiencia (1,641 seguidores)...")
    driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
    time.sleep(15) # Espera robusta para carga de perfil
    
    try:
        # 1. Hacer clic físico en el enlace de seguidores
        print("[STEP] Intentando clic físico en contadores...")
        f_selectors = [
            "//a[contains(@href, '/followers/')]",
            "//li[contains(., 'followers')]//a",
            "//a[span[contains(text(), 'followers')]]"
        ]
        clicked = False
        for sel in f_selectors:
            try:
                btn = driver.find_element(By.XPATH, sel)
                driver.execute_script("arguments[0].scrollIntoView();", btn)
                driver.execute_script("arguments[0].click();", btn)
                print(f"[PASS] Modal activado con: {sel}")
                clicked = True
                break
            except: continue
            
        if not clicked:
            print("[FAIL] No se pudo abrir el modal de seguidores.")
            return []

        time.sleep(10) # Espera para que el modal pop-up se renderice
        
        all_found = set()
        print("[STEP] Iniciando Scrolls Masivos (x15)...")
        for i in range(15):
            # Scroll usando JS a cualquier contenedor con scroll en el modal
            driver.execute_script("""
                let m = document.querySelector('div[role="dialog"] div[style*="overflow-y: auto"]') 
                        || document.querySelector('div[role="dialog"] div.xyi19m1')
                        || document.querySelector('div[role="dialog"] div[style*="height"]');
                if (m) m.scrollTop = m.scrollHeight;
                else window.scrollBy(0, 500);
            """)
            time.sleep(4)
            
            # Raspado Híbrido: Modal o Página Completa
            current_batch = driver.execute_script("""
                let container = document.querySelector('div[role="dialog"]') || document.body;
                return Array.from(container.querySelectorAll('a'))
                    .map(a => a.href.split('/').filter(p => p).pop()?.split('?')[0])
                    .filter(u => u && u.length > 3 && !['reels', 'p', 'explore', 'direct', 'stories', 'accounts', 'www', 'legal', 'help'].includes(u));
            """)
            if current_batch:
                all_found.update(current_batch)
            print(f"   - Scroll {i+1}: {len(all_found)} posibles clientes capturados...", flush=True)
            
        DISALLOWED = ["galantesjewelrybythesea", "instagram", "facebook", "search", "edit", "about", "blog"]
        targets = [u.lower().strip() for u in all_found if u.lower().strip() not in DISALLOWED]
        return targets
    except Exception as e:
        print(f"[ERROR] Fallo crítico en captura masiva: {e}")
        return []

def industrial_prospection():
    print("=== Suite de Prospección Industrial: Galante's Jewelry ===")
    
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    # 1. Cargar o Crear Cola
    queue = load_queue()
    if not queue:
        print("[INFO] Cola vacía. Generando nueva lista de objetivos...")
        queue = deep_follower_scraping(driver)
        save_queue(queue)
    
    print(f"\n[INFO] OBJETIVOS TOTALES EN COLA: {len(queue)}")
    
    # 2. Bucle de ejecución continua
    while queue:
        user = queue[0]
        print(f"\n>>> [PROCESANDO {len(queue)} RESTANTES] Objetivo: {user}")
        
        target_url = f"https://www.instagram.com/{user}/?hl=en"
        sys.argv = ["bot.main", target_url, "config_instagram.json"]
        
        try:
            # Ejecutar lógica infalible
            run_individual_bot()
            print(f"[SUCCESS] {user} completado.")
        except Exception as e:
            print(f"[FAIL] Error procesando a {user}: {e}")
        
        # Rotar cola
        queue.pop(0)
        save_queue(queue)
        
        # Pausa Humana de Seguridad (Importante para evitar bloqueos)
        wait_time = 130 # 2 minutos + buffer
        print(f"[WAIT] Pausa de seguridad industrial: {wait_time}s...")
        time.sleep(wait_time)
        
    print("\n[FIN] Operación completa. Toda la audiencia ha sido prospectada.")

if __name__ == "__main__":
    industrial_prospection()
