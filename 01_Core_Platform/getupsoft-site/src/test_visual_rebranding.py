import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def run_visual_test():
    # Configuración de Chrome
    chrome_options = Options()
    # chrome_options.add_argument("--headless") # Lo mantenemos visible para que el usuario vea la ventana
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    base_path = r"C:\Users\yoeli\Documents\GetUpSoft_Workspace\01_Core_Platform\getupsoft-site\src"
    evidence_path = os.path.join(base_path, "evidence")
    if not os.path.exists(evidence_path):
        os.makedirs(evidence_path)
        
    sites = [
        {"name": "getupsoft_do", "path": os.path.join(base_path, "do", "index.html")},
        {"name": "getupsoft_global", "path": os.path.join(base_path, "global", "index.html")}
    ]
    
    try:
        for site in sites:
            file_url = "file:///" + site["path"].replace("\\", "/")
            print(f"Probando: {site['name']} en {file_url}")
            
            driver.get(file_url)
            time.sleep(5) # Tiempo para que el usuario vea la ventana
            
            screenshot_file = os.path.join(evidence_path, f"{site['name']}_evidence.png")
            driver.save_screenshot(screenshot_file)
            print(f"Evidencia guardada: {screenshot_file}")
            
        print("\nPrueba funcional completada. Las ventanas se cerrarán en 3 segundos.")
        time.sleep(3)
        
    except Exception as e:
        print(f"Error durante la prueba: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_visual_test()
