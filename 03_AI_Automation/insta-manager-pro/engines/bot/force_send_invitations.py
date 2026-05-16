import time
import sys
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.main import main as run_individual_bot

def force_prospection():
    print("=== INICIANDO BOMBARDEO DE INVITACIONES FORZADO: GALANTE'S JEWELRY ===")
    
    # 1. Conectar a Chrome abierto
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    # 2. Navegar al perfil
    print("[STEP] Abriendo perfil oficial...")
    driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
    time.sleep(10)
    
    # 3. Abrir ventana de Seguidores
    try:
        print("[STEP] Abriendo modal de seguidores...")
        f_btn = WebDriverWait(driver, 15).until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/followers/')]")))
        driver.execute_script("arguments[0].click();", f_btn)
        time.sleep(8)
        
        # SCROLL para cargar usuarios de verdad (despertar el DOM)
        print("[STEP] Buscando contenedor scrolleable...")
        try:
            # Intentar encontrar el contenedor interno con scroll
            scrollable_div = driver.find_element(By.XPATH, "//div[@role='dialog']//div[contains(@class, 'xyi19m1') or @style='height: 400px;' or contains(@class, 'isgrP')]")
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scrollable_div)
        except:
            # Fallback al diálogo mismo
            print("[INFO] Usando fallback de scroll en el diálogo.")
            driver.execute_script("document.querySelector('div[role=\"dialog\"] div').scrollTop = 500;")
        time.sleep(5)
        
        # 4. SCRAPING NUCLEAR (Saneado para evitar sistema)
        print("[STEP] Ejecutando scraping nuclear saneado...")
        scraped = driver.execute_script("""
            let results = [];
            document.querySelectorAll('a').forEach(a => {
                let parts = a.href.split('/').filter(p => p);
                if (parts.length > 0) {
                    let u = parts.pop().split('?')[0].replace('@', '');
                    results.push(u);
                }
            });
            document.querySelectorAll('div[role="dialog"] span').forEach(s => {
                let t = s.innerText.trim().replace('@', '');
                if (t.length > 3 && !t.includes(' ')) results.push(t);
            });
            return Array.from(new Set(results));
        """)
        
        # Filtro QUIRÚRGICO de usuarios reales
        DISALLOWED = [
            "galantesjewelrybythesea", "galantesjewelersbythesea", "instagram", "facebook", "search", 
            "explore", "reels", "direct", "stories", "accounts", "www", "edit", "about", 
            "blog", "press", "api", "jobs", "privacy", "terms", "directory", "hashtags", "meta"
        ]
        
        usernames = []
        for u in scraped:
            u_clean = u.lower().strip()
            if u_clean and len(u_clean) > 3 and u_clean.replace('.', '').replace('_', '').isalnum():
                if not any(d in u_clean for d in DISALLOWED):
                    if u_clean not in usernames:
                        usernames.append(u_clean)
        
        print(f"\n[INFO] Lote de clientes capturado: {len(usernames)}", flush=True)
        if len(usernames) > 0:
            print(f"[DEBUG] Primeros objetivos: {usernames[:5]}", flush=True)
        else:
            print("[FAIL] No se encontraron clientes reales. ¿Está abierto el modal?", flush=True)
            return
        
        if not usernames:
            print("[FAIL] No se extrajeron usuarios. Asegúrese de que el modal está abierto y cargado.")
            return

        # 5. Bucle de Procesado (Ignorar paridad, SOLO ENVIAR)
        for user in usernames:
            target_url = f"https://www.instagram.com/{user}/?hl=en"
            print(f"\n>>> INICIANDO PROCESO PARA: {user}")
            
            try:
                # Actualizar argumentos y llamar a la lógica certificada
                sys.argv = ["bot.main", target_url, "config_instagram.json"]
                run_individual_bot()
                
                print(f"[SUCCESS] Invitación completada para {user}")
                print("[WAIT] Retraso de seguridad para evitar spam (120 seg)...")
                time.sleep(120)
                
                # RECARGAR CONTEXTO (Volver a abrir el modal)
                driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
                time.sleep(10)
                f_btn = WebDriverWait(driver, 15).until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/followers/')]")))
                driver.execute_script("arguments[0].click();", f_btn)
                time.sleep(5)
                
            except Exception as e:
                print(f"[FAIL] Error procesando a {user}: {e}")
                continue

    except Exception as e:
        print(f"[ERROR] Fallo crítico: {e}")

if __name__ == "__main__":
    force_prospection()
