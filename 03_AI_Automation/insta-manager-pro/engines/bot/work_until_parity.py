import time
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.main import main as run_individual_bot

def get_counts(driver):
    """Obtiene los números de seguidores y seguidos usando JS."""
    try:
        counts = driver.execute_script("""
            return Array.from(document.querySelectorAll('header span'))
                .map(s => s.innerText.replace(/[,.]/g, ''))
                .filter(t => /^\d+$/.test(t))
                .map(t => parseInt(t));
        """)
        # El primer número suele ser publicaciones, el segundo seguidores, tercero seguidos
        if len(counts) >= 3:
            return counts[1], counts[2]
        return 0, 0
    except:
        return 0, 0

def work_until_parity():
    print("=== INICIANDO OPERACIÓN PARIDAD: SEGUIDORES == SEGUIDOS ===")
    
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    while True:
        # 1. Comprobar paridad
        driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
        time.sleep(10)
        
        followers, following = get_counts(driver)
        print(f"\n[STATUS] Seguidores: {followers} | Seguidos: {following}")
        
        if following >= followers and followers > 0:
            print("[SUCCESS] Objetivo de paridad alcanzado.")
            break
            
        # 2. Abrir Modal de Followers
        try:
            print("[STEP] Abriendo ventana de seguidores para buscar nuevos objetivos...")
            f_btn = WebDriverWait(driver, 15).until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/followers/')]")))
            driver.execute_script("arguments[0].click();", f_btn)
            time.sleep(6)
            
            # SCROLL para cargar más
            modal = driver.find_element(By.XPATH, "//div[@role='dialog']")
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
            time.sleep(4)
            
            # 3. Scraping UNIVERSAL del modal (Popup) usando JS
            print("[STEP] Realizando scraping profundo de la lista vía JS...", flush=True)
            usernames = driver.execute_script("""
                return Array.from(document.querySelectorAll('div[role="dialog"] a[role="link"]'))
                    .map(a => a.href.split('/').filter(p => p).pop().split('?')[0])
                    .filter(u => u.length > 3 && !['reels', 'p', 'explore', 'direct'].includes(u));
            """)
            
            # Limpiar duplicados y vacíos
            usernames = list(dict.fromkeys([u for u in usernames if u]))
            
            # Fallback a spans si el modal es distinto
            if not usernames:
                 usernames = driver.execute_script("""
                    return Array.from(document.querySelectorAll('div[role="dialog"] span'))
                        .map(s => s.innerText.trim())
                        .filter(u => u.length > 3 && !u.includes(' ') && !['Follow', 'Remove', 'Seguir'].includes(u));
                 """)
                 usernames = list(dict.fromkeys([u for u in usernames if u]))

            print(f"[INFO] Se detectaron {len(usernames)} objetivos potenciales.", flush=True)
            usernames = usernames[:15]
            
            # Limitar lote para evitar fatiga
            usernames = usernames[:15]
            
            # 4. Procesar
            for user in usernames:
                target_url = f"https://www.instagram.com/{user}/?hl=en"
                print(f"\n>>> PROCESANDO EN BUCLE DE PARIDAD: {user}")
                
                # Ejecutar el flujo ganador
                sys.argv = ["bot.main", target_url, "config_instagram.json"]
                try:
                    run_individual_bot()
                    print(f"[PASS] {user} procesado exitosamente.")
                except:
                    print(f"[FAIL] Error procesando {user}")
                
                # Pausa anti-bot
                print("[WAIT] Pausa humana (90-120 seg)...")
                time.sleep(100)
                
                # Re-validar paridad ocasionalmente dentro del sub-bucle no vale la pena, mejor terminar lote
            
        except Exception as e:
            print(f"[ERROR] Fallo en ciclo de paridad: {e}")
            time.sleep(30)
            continue

if __name__ == "__main__":
    # Asegurar que los logs se vean inmediatamente
    import sys
    work_until_parity()
