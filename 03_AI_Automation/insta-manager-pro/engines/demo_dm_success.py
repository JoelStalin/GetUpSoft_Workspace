import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_demo():
    print("=== DEMO: AUTOMATIZACIÓN DE INSTAGRAM DM (MODO SEGURO) ===")
    
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    
    try:
        driver = webdriver.Chrome(service=Service(), options=options)
        print("Conectado exitosamente al navegador logueado.")
        
        target_profile = "https://www.instagram.com/galantesjewelrybythesea/"
        print(f"1. Navegando al perfil: {target_profile}")
        driver.get(target_profile)
        
        wait = WebDriverWait(driver, 20)
        
        # 2. Extraer nombre
        print("2. Extrayendo nombre del perfil...")
        try:
            # Selector más robusto para el nombre visible en IG
            name_element = wait.until(EC.presence_of_element_located((By.XPATH, "//header//section//span")))
            profile_name = name_element.text
            print(f"   Nombre detectado: {profile_name}")
        except:
            profile_name = "Joyero/a"
            print("   No se pudo detectar el nombre exacto, usando genérico.")

        # 3. Ir a Mensajes
        print("3. Abriendo ventana de mensajes...")
        try:
            message_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[text()='Message' or text()='Enviar mensaje']")))
            message_btn.click()
            time.sleep(5) # Esperar carga de chat
        except Exception:
            print("   No se encontró el botón de mensaje directo.")

        # 4. Construir y escribir mensaje (SIN ENVIAR - MODO DRY RUN)
        message = f"Hola {profile_name}, ¡un gusto saludarte! Te escribo de Galante's Jewelry para invitarte a conocer nuestra nueva colección."
        print(f"4. Escribiendo borrador: {message}")
        
        try:
            # Localizar el área de texto del chat (div editable)
            text_area = wait.until(EC.presence_of_element_located((By.XPATH, "//div[@role='textbox' and @contenteditable='true']")))
            text_area.click()
            time.sleep(1)
            
            for char in message:
                text_area.send_keys(char)
                time.sleep(0.05)
                
            print("\n>>> ¡PRUEBA FUNCIONAL COMPLETADA CON ÉXITO! <<<")
            print("El mensaje ha sido redactado pero NO enviado para tu revisión manual.")
            
            # Tomar evidencia
            driver.save_screenshot("artifacts/dm_draft_success.png")
            print("Captura de pantalla guardada en artifacts/dm_draft_success.png")
            
        except Exception as e:
            print(f"   Error al escribir el mensaje: {e}")
            driver.save_screenshot("artifacts/dm_error.png")

    except Exception as e:
        print(f"Error de conexión: {e}")
    finally:
        print("Terminando demo. El navegador sigue abierto.")

if __name__ == "__main__":
    run_demo()
