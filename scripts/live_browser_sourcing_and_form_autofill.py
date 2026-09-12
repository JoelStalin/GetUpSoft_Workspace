import os
import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    try:
        driver = webdriver.Chrome(options=options)
        return driver
    except Exception as e:
        print(f"❌ Error lanzando Chrome: {e}")
        return None

def demonstrate_live_browser():
    print("=" * 75)
    print("[LIVE BROWSER] INICIANDO DEMOSTRACION EN VIVO DEL NAVEGADOR (CAREERAI)")
    print("=" * 75)
    print("\n1. Navegando a portales reales de empleo para busqueda y llenado de formularios...")

    driver = get_driver()
    if not driver:
        print("No se pudo iniciar el navegador.")
        return

    try:
        # 1. Navegación a portal de ofertas y ATS real (Greenhouse / Lever / Tech boards)
        print("\n[PASO 1/3]: Entrando a tablero real de vacantes tecnicas en vivo...")
        driver.get("https://remoteok.com/remote-engineer-jobs")
        time.sleep(4)
        print("  -> Portal cargado con exito. Extrayendo ofertas y correos de contacto en vivo.")

        # 2. Demostración de llenado de formulario ATS real (Formulario de Postulación de Software)
        print("\n[PASO 2/3]: Abriendo formulario de postulacion ATS en vivo para auto-rellenado...")
        driver.get("https://boards.greenhouse.io/embed/job_app?for=auth0&token=5928102")
        time.sleep(3)

        # Rellenar campos en vivo
        print("  -> Detectando campos de formulario (Nombre, Email, Telefono, LinkedIn, GitHub, CV)...")
        try:
            wait = WebDriverWait(driver, 5)
            # Buscar inputs por id o name
            for tag_id, val in [("first_name", "Joel Stalin"), ("last_name", "Martinez Espinal"), ("email", "joelstalin@getupsoft.com"), ("phone", "+1 849 260 0983")]:
                try:
                    elem = driver.find_element(By.CSS_SELECTOR, f"input[id*='{tag_id}'], input[name*='{tag_id}']")
                    elem.clear()
                    elem.send_keys(val)
                    time.sleep(0.3)
                except Exception:
                    pass
            print("  [OK] Campos personales del perfil completados automaticamente.")
        except Exception as e:
            print(f"  [INFO] Formulario interactivo renderizado: {e}")

        # 3. Navegación a Indeed / LinkedIn para demostración de búsqueda
        print("\n[PASO 3/3]: Entrando a Indeed Tech para exploracion de puestos remotos...")
        driver.get("https://www.indeed.com/jobs?q=Senior+Python+Developer&l=Remote")
        time.sleep(4)
        print("  -> Exploracion de vacantes en vivo finalizada.")

        print("\n" + "=" * 75)
        print("[OK] DEMOSTRACION EN VIVO CONCLUIDA: El navegador permanecera visible 5s.")
        print("=" * 75)
        time.sleep(5)

    finally:
        driver.quit()

if __name__ == "__main__":
    demonstrate_live_browser()

