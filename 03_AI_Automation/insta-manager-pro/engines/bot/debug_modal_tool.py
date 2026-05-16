from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os

def debug_modal():
    options = Options()
    options.debugger_address = "127.0.0.1:9222"
    driver = webdriver.Chrome(options=options)
    
    print("[STEP] Abriendo perfil Galante...")
    driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
    time.sleep(10)
    
    print("[STEP] Buscando enlace de seguidores...")
    try:
        # Intentar múltiples XPATHs
        selectors = [
            "//a[contains(@href, '/followers/')]",
            "//li[contains(., 'followers')]//a",
            "//span[contains(text(), 'followers')]/ancestor::a"
        ]
        link = None
        for sel in selectors:
            try:
                link = driver.find_element(By.XPATH, sel)
                print(f"[PASS] Encontrado con: {sel}")
                break
            except: continue
            
        if link:
            driver.execute_script("arguments[0].click();", link)
            print("[PASS] Clic ejecutado.")
            time.sleep(10)
            
            # Guardar captura
            os.makedirs("artifacts", exist_ok=True)
            driver.save_screenshot("artifacts/debug_modal_final.png")
            
            # Inyectar Extracción Nuclear JS (Modo Texto Puro)
            usernames = driver.execute_script("""
                let results = [];
                let container = document.querySelector('div[role="dialog"]');
                if (container) {
                    // Obtener todos los spans
                    let spans = Array.from(container.querySelectorAll('span'));
                    spans.forEach(s => {
                        let t = s.innerText.trim();
                        if (t.length > 3 && t.length < 30 && !t.includes(' ') && !t.includes('\\n')) {
                            results.push(t);
                        }
                    });
                    // Fallback: todos los textos de divs
                    let divs = Array.from(container.querySelectorAll('div[class*="x"]'));
                    divs.forEach(d => {
                        if (d.children.length === 0) {
                            let t = d.innerText.trim();
                            if (t.length > 3 && t.length < 30 && !t.includes(' ')) {
                                results.push(t);
                            }
                        }
                    });
                }
                return Array.from(new Set(results));
            """)
            
            print(f"[SUCCESS] {len(usernames)} prospectos crudos detectados.")
            print(f"[RAW LIST] {usernames}")
            
            with open("artifacts/debug_modal_final.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("[FINISHED] Diagnóstico guardado en artifacts/")
        else:
            print("[FAIL] No se encontró el enlace de seguidores.")
            
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    debug_modal()
