import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bot.main import main as run_individual_bot
from bot.extractors import Extractor
import sys

def process_followers_manually():
    print("=== INICIANDO EXTRACCIÓN Y PROCESADO MANUAL COORDINADO ===")
    
    # 1. Conectar a Chrome abierto
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    # 2. Navegar a tus seguidores si no estamos ahí
    if "followers" not in driver.current_url:
        print("[STEP] Navegando a tu lista de seguidores...")
        driver.get("https://www.instagram.com/galantesjewelrybythesea/followers/")
        # ESPERAR MUCHO MÁS (Instagram es lento en Profiles pesados)
        print("[WAIT] Esperando carga completa de lista (20 segundos)...")
        time.sleep(20)
    
    # 3. Extraer solo 10 para esta prueba manual coordinada
    print("[STEP] Extrayendo lista visible...")
    # Intento de scroll para despertar el DOM
    driver.execute_script("window.scrollBy(0, 300);")
    time.sleep(2)
    
    links = driver.find_elements(By.XPATH, "//div[@role='dialog']//a[@role='link'] | //a[contains(@href, '/')]")
    usernames = []
    for link in links:
        href = link.get_attribute("href")
        if href and "instagram.com" in href and "/p/" not in href and "/reels/" not in href:
            # Extraer solo el último segmento limpio
            u = href.rstrip("/").split("/")[-1].split("?")[0]
            # Validar que sea un username (alfanumérico + . + _) y no una URL o palabra clave
            if u and len(u) > 3 and u.replace(".", "").replace("_", "").isalnum():
                if u not in ["galantesjewelrybythesea", "reels", "explore", "direct", "accounts", "stories", "p", "www", "instagram", "facebook"]:
                    if u not in usernames:
                        usernames.append(u)
        if len(usernames) >= 10: break

    if not usernames:
        print("[WARN] No se detectaron usuarios. Intentando selector de modal directo...")
        links = driver.find_elements(By.XPATH, "//div[@role='dialog']//a")
        for link in links:
             href = link.get_attribute("href")
             if href:
                 u = href.rstrip("/").split("/")[-1].split("?")[0]
                 if len(u) > 3 and u.replace(".", "").replace("_", "").isalnum() and u not in usernames:
                     usernames.append(u)
             if len(usernames) >= 5: break
    
    print(f"\n[INFO] Objetivos detectados: {usernames}")
    
    # 4. Procesar cada uno con el flujo 'bot.main' que FUNCIONA
    for user in usernames:
        target_url = f"https://www.instagram.com/{user}/"
        print(f"\n>>> INICIANDO PROCESO MANUAL PARA: {user}")
        
        try:
            # Reutilizamos bot.main pasándole la URL y el config de Instagram
            sys.argv = ["bot.main", target_url, "config_instagram.json"]
            run_individual_bot()
            
            print(f"[SUCCESS] Invitación enviada a {user}. Esperando pausa de seguridad...")
            time.sleep(30) # Pausa entre envíos
            
            # Volver a la lista de seguidores para no perder el contexto
            driver.get("https://www.instagram.com/galantesjewelrybythesea/followers/")
            time.sleep(5)
            
        except Exception as e:
            print(f"[FAIL] Error procesando a {user}: {e}")
            continue

if __name__ == "__main__":
    process_followers_manually()
