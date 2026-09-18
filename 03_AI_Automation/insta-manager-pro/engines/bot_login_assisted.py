import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def assisted_login():
    print("=== ASISTENTE DE INICIO DE SESIÓN DE INSTAGRAM (VERSIÓN ROBUSTA) ===")
    
    options = Options()
    user_data_dir = r"C:\selenium\perfil_bot"
    options.add_argument(f"user-data-dir={user_data_dir}")
    options.add_argument("profile-directory=Default")
    options.add_argument("--start-maximized")
    
    # Desactivar flags de automatización
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)

    print(f"Iniciando Chrome en: {user_data_dir}...")
    driver = webdriver.Chrome(service=Service(), options=options)
    
    try:
        url = "https://www.instagram.com/accounts/login/"
        print(f"Navegando a {url}...")
        driver.get(url)
        
        wait = WebDriverWait(driver, 45) # Más tiempo
        
        # 1. Manejar Diálogo de Cookies (si aparece)
        try:
            print("Buscando diálogo de cookies...")
            cookie_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Permitir') or contains(text(), 'Allow')]")
            if cookie_buttons:
                cookie_buttons[0].click()
                print("Cookies permitidas.")
                time.sleep(2)
        except:
            pass

        # 2. Esperar al campo de usuario usando múltiples selectores
        print("Esperando a que cargue el formulario de login...")
        user_field = None
        selectors = [
            (By.NAME, "username"),
            (By.CSS_SELECTOR, "input[name='username']"),
            (By.XPATH, "//input[@aria-label='Phone number, username, or email']")
        ]
        
        for selector in selectors:
            try:
                user_field = wait.until(EC.presence_of_element_located(selector))
                if user_field:
                    print(f"Campo de usuario encontrado con selector: {selector}")
                    break
            except:
                continue
        
        if not user_field:
            raise Exception("No se pudo encontrar el campo de usuario.")

        pass_field = driver.find_element(By.NAME, "password")
        
        print("Introduciendo credenciales...")
        user_field.send_keys("galantesjewelrybythesea")
        time.sleep(1)
        pass_field.send_keys("Galantesjewelry#33036")
        time.sleep(1)
        pass_field.send_keys(Keys.ENTER)
        
        print("Login enviado. Esperando estado final o 2FA...")
        
        # 3. Ciclo de monitoreo de estado (5 minutos)
        start_time = time.time()
        while time.time() - start_time < 300:
            current_url = driver.current_url
            
            # ÉXITO: Home, Inbox o Perfil
            if any(path in current_url for path in ["/home/", "/direct/inbox/", "/galantesjewelrybythesea/"]):
                 print(f"¡Éxito! Logueado en: {current_url}")
                 time.sleep(10) # Dar tiempo a guardar sesión
                 break
            
            # 2FA / CHECKPOINT
            try:
                # Buscar inputs de código (generalmente tienen 'verification' o 'code')
                code_inputs = driver.find_elements(By.XPATH, "//input[contains(@name, 'verification') or contains(@name, 'Code')]")
                if code_inputs or "checkpoint" in current_url:
                    print("\n" + "!"*60)
                    print("ATENCIÓN: INSTAGRAM SOLICITA CÓDIGO DE VERIFICACIÓN.")
                    print(">>> POR FAVOR, INTRODÚCELO TÚ MISMO EN LA VENTANA DE CHROME <<<")
                    print("El bot esperará hasta que veas tu pantalla principal.")
                    print("!"*60 + "\n")
                    time.sleep(10)
                    continue
            except:
                pass
            
            # Error de password o similar
            if "login" in current_url and driver.find_elements(By.ID, "slfErrorAlert"):
                print("¡ERROR DE LOGIN! Verifica usuario/clave en la ventana.")
                time.sleep(10)

            time.sleep(5)
            
        print("Finalizando sesión de configuración...")
        time.sleep(2)
        
    except Exception as e:
        print(f"Fallo en el asistente: {e}")
        # Tomar captura de pantalla del error para depurar
        try:
            driver.save_screenshot("error_login.png")
            print("Captura de error guardada en error_login.png")
        except:
            pass
    finally:
        print("Cerrando navegador...")
        driver.quit()

if __name__ == "__main__":
    assisted_login()
