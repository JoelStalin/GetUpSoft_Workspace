import time
import sys
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.main import main as run_individual_bot

def process_followers_modal():
    print("=== INICIANDO PROCESO QUIRÚRGICO DE SEGUIDORES (MODAL) ===")
    
    # 1. Conectar a Chrome
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    # 2. Navegar al perfil si no estamos ahí
    if "galantesjewelrybythesea" not in driver.current_url:
        print("[STEP] Navegando al perfil oficial...")
        driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
        time.sleep(8)

    # 3. CLICK en Followers (Seguidores)
    try:
        print("[STEP] Abriendo ventana emergente de seguidores...")
        # XPATH robusto para el link de seguidores
        followers_xpath = "//a[contains(@href, '/followers/')]"
        wait = WebDriverWait(driver, 15)
        followers_btn = wait.until(EC.element_to_be_clickable((By.XPATH, followers_xpath)))
        driver.execute_script("arguments[0].click();", followers_btn)
        time.sleep(5)
    except Exception as e:
        print(f"[FAIL] No se pudo abrir el modal de seguidores: {e}")
        return

    # 4. Web Scraping DIRECTO del modal
    print("[STEP] Realizando web scraping del popup visible...")
    try:
        # Esperar a que el modal aparezca
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[text()='Followers' or text()='Seguidores']")))
        time.sleep(4)
        
        # Selector BASADO EN EL PANTALLAZO: Buscar links de perfiles dentro del diálogo
        # En IG, los usernames suelen estar en un <a> dentro de un span
        candidates = driver.find_elements(By.XPATH, "//div[@role='dialog']//a[@role='link']")
        
        usernames = []
        for c in candidates:
            u = c.get_attribute("href").rstrip("/").split("/")[-1]
            if u and len(u) > 3 and u.replace(".", "").replace("_", "").isalnum():
                if u not in ["galantesjewelrybythesea", "reels", "explore", "direct", "accounts", "stories", "p", "www"]:
                    if u not in usernames:
                        usernames.append(u)
            if len(usernames) >= 15: break

        if not usernames:
            print("[WARN] Intento 2: Capturando por texto de spans...")
            # Fallback: Capturar el texto que no sea 'Follow' ni 'Remove'
            spans = driver.find_elements(By.XPATH, "//div[@role='dialog']//span")
            for s in spans:
                txt = s.text.strip()
                if txt and len(txt) > 3 and " " not in txt and txt not in ["Follow", "Remove", "Seguir", "Eliminar"]:
                    if txt not in usernames: usernames.append(txt)
                if len(usernames) >= 10: break

        print(f"\n[INFO] Lote de objetivos capturado: {usernames}")

        # 5. Bucle de Procesado Uno a Uno (Respetando el contexto)
        for user in usernames:
            target_url = f"https://www.instagram.com/{user}/?hl=en"
            print(f"\n>>> TRABAJANDO CON: {user}")
            
            try:
                # REUTILIZAR EL FLUJO GANADOR (bot.main)
                # Esto hará: Navegar -> Follow -> Chat -> Message -> Verify
                sys.argv = ["bot.main", target_url, "config_instagram.json"]
                run_individual_bot()
                
                print(f"[PASS] Invitación enviada exitosamente a {user}")
                print("[WAIT] Retraso de seguridad (2-3 minutos recomendados)...")
                time.sleep(120) # Pausa humana para evitar baneos como pidió el cliente
                
                # RECARGAR EL PERFIL Y MODAL para el siguiente (Mantener contexto manual)
                driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
                time.sleep(10)
                # Volver a abrir modal
                f_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/followers/')]")))
                driver.execute_script("arguments[0].click();", f_btn)
                time.sleep(5)
                
            except Exception as e:
                print(f"[FAIL] Error procesando a {user}: {e}")
                continue

    except Exception as e:
        print(f"[ERROR] Fallo crítico durante el scraping: {e}")

if __name__ == "__main__":
    process_followers_modal()
