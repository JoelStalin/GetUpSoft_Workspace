import os
import subprocess
import time
import socket
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def fix_launch_and_login():
    print("=== FIX V3: LANZAMIENTO Y LOGIN DE INSTAGRAM (BOTÓN CLICK) ===")
    
    # 1. Limpieza total
    print("Cerrando Chrome...")
    subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], capture_output=True)
    time.sleep(2)
    
    user_data_dir = r"C:\selenium\perfil_bot"

    # 2. Lanzamiento
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    cmd = [
        chrome_path,
        "--remote-debugging-port=9222",
        f"--user-data-dir={user_data_dir}",
        "--profile-directory=Default",
        "--disable-blink-features=AutomationControlled",
        "--no-first-run",
        "--no-default-browser-check",
        "--start-maximized"
    ]
    
    print("Lanzando Chrome...")
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    ready = False
    for _ in range(20):
        if is_port_open(9222):
            ready = True
            break
        time.sleep(1)
    
    if not ready:
        print("ERROR: El puerto 9222 no se abrió.")
        return

    print("Conectando Selenium...")
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(service=Service(), options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        url = "https://www.instagram.com/accounts/login/"
        print(f"Navegando a {url}...")
        driver.get(url)
        
        wait = WebDriverWait(driver, 40)
        
        # 3. Manejo de Cookies
        print("Buscando cookies...")
        time.sleep(5)
        try:
            cookie_xpath = "//button[text()='Allow all cookies' or text()='Allow' or text()='Permitir todas las cookies' or text()='Permitir' or contains(text(), 'Aceptar')]"
            buttons = driver.find_elements(By.XPATH, cookie_xpath)
            if buttons:
                buttons[0].click()
                print("Cookies aceptadas.")
                time.sleep(2)
        except:
            pass

        # 4. Login
        print("Esperando formulario...")
        user_field = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='username']")))
        pass_field = driver.find_element(By.CSS_SELECTOR, "input[name='password']")
        
        print("Escribiendo credenciales...")
        user_field.send_keys("galantesjewelrybythesea")
        time.sleep(1)
        pass_field.send_keys("Galantesjewelry#33036")
        time.sleep(1)
        
        # CLICK EXPLÍCITO EN LOGIN
        print("Haciendo click en el botón de Login...")
        try:
            login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
        except:
            print("No se encontró el botón de submit, intentando con Enter...")
            pass_field.send_keys(Keys.ENTER)
        
        print("Login enviado. Monitoreando...")
        
        # 5. Monitoreo persistente
        for i in range(60): # 5 minutos (60 * 5s)
            curr = driver.current_url
            print(f"Estado [{i}]: {curr}")
            
            # Éxito
            if any(x in curr for x in ["/home/", "/direct/", "/galantesjewelrybythesea/"]):
                print(">>> ¡LOGIN COMPLETADO CON ÉXITO! <<<")
                time.sleep(10)
                break
                
            # Detección de código (2FA)
            if "checkpoint" in curr or driver.find_elements(By.XPATH, "//input[contains(@name, 'Code')]"):
                print("\n" + "!"*60)
                print("!!! INSTAGRAM SOLICITA CÓDIGO DE VERIFICACIÓN !!!")
                print("Por favor, introdúcelo manualmente en la ventana de Chrome.")
                print("!"*60 + "\n")
            
            # Guardar captura para reporte
            driver.save_screenshot(f"artifacts/login_step_{i}.png")
            time.sleep(5)
            
        print("Sesión configurada y guardada.")
        
    except Exception as e:
        print(f"Error: {e}")
        driver.save_screenshot("artifacts/final_error.png")
    finally:
        print("Cerrando Selenium. Chrome sigue abierto.")

if __name__ == "__main__":
    fix_launch_and_login()
