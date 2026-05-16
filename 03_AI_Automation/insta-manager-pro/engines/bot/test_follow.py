import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def test_follow():
    print(">>> INICIANDO DIAGNÓSTICO DE FOLLOW FÍSICO")
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    driver.get("https://www.instagram.com/angelya_0203/?hl=en")
    time.sleep(6)
    
    # Buscar botón de seguir
    selectors = [
        "//button[.//div[text()='Follow' or text()='Seguir']]",
        "//button[text()='Follow' or text()='Seguir']",
        "//button[contains(., 'Follow') or contains(., 'Seguir')]",
        "//button[contains(@class, '_acan') and contains(@class, '_acap')]"
    ]
    
    found = False
    for sel in selectors:
        try:
            btns = driver.find_elements(By.XPATH, sel)
            if btns:
                print(f"[PASS] Botón encontrado con: {sel}")
                # Intentar Click
                driver.execute_script("arguments[0].scrollIntoView();", btns[0])
                time.sleep(1)
                driver.execute_script("arguments[0].click();", btns[0])
                print("[SUCCESS] Click ejecutado vía JS.")
                found = True
                break
        except: continue
        
    if not found:
        print("[FAIL] No se encontró el botón de Follow en la página.")
        
    time.sleep(5)
    driver.save_screenshot("./artifacts/test_follow_result.png")
    print(">>> FIN DEL DIAGNÓSTICO. Revisa el pantallazo.")

if __name__ == "__main__":
    test_follow()
