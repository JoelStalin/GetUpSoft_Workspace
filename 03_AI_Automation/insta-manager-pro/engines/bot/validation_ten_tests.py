import sys
import logging
import time
from bot.config import get_config
from bot.browser import Browser
from bot.extractors import Extractor
from bot.main import main as run_individual_bot

def run_ten_tests():
    # 1. Configurar y Conectar
    config = get_config("config_instagram.json")
    browser = Browser(config)
    driver = browser.start()
    extractor = Extractor(driver)
    
    print("\n=== INICIANDO PLAN DE VALIDACIÓN: 10 CASOS DE PRUEBA ===")
    
    # 2. Capturar 10 prospectos frescos (que no sigamos)
    # Navegamos a la lista de seguidores de Galante
    driver.get("https://www.instagram.com/galantesjewelrybythesea/followers/")
    time.sleep(10)
    
    # Extraer lista masiva para encontrar 10 candidatos
    all_targets = extractor.get_instagram_followers(limit=40)
    
    # Filtrar para obtener 10 que realmente no hayamos procesado o que sepamos sean variados
    test_targets = all_targets[:10]
    
    print(f"[INFO] Seleccionados {len(test_targets)} objetivos para la auditoría.")
    
    results_matrix = []
    
    for user in test_targets:
        try:
            print(f"\n>>> [AUDITORÍA] Procesando caso: {user}".encode('utf-8', errors='ignore').decode('utf-8'))
        except:
            print(f"\n>>> [AUDITORÍA] Procesando caso: (Special Chars User)")
            
        target_url = f"https://www.instagram.com/{user}/?hl=en"
        
        # Simular llamada a bot.main para cada uno
        sys.argv = ["bot.main", target_url, "config_instagram.json"]
        
        try:
            start_time = time.time()
            run_individual_bot()
            duration = time.time() - start_time
            results_matrix.append({
                "user": user,
                "status": "SUCCESS",
                "notes": f"Proceso completo en {duration:.1f}s"
            })
        except Exception as e:
            results_matrix.append({
                "user": user,
                "status": "FAIL/SKIP",
                "notes": str(e)
            })
        
        # Pausa para visibilidad y seguridad
        print("[WAIT] Pausa de auditoría (30s)...")
        time.sleep(30)
    
    # 3. Reporte de Auditoría
    print("\n" + "="*50)
    print("      RESUMEN DE AUDITORÍA DE CASOS DE USO")
    print("="*50)
    for res in results_matrix:
        print(f"[{res['status']}] {res['user']} | {res['notes']}")
    print("="*50)

if __name__ == "__main__":
    run_ten_tests()
