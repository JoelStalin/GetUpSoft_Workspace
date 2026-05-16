import sys
import logging
import time
import random
from bot.config import get_config
from bot.browser import Browser
from bot.navigator import Navigator
from bot.extractors import Extractor
from bot.interaction_probe import InteractionProbe
from bot.message_builder import MessageBuilder
from bot.utils.db.manager import DBManager
from bot.utils.anti_bot import random_delay, short_delay
from bot.utils.logging_setup import setup_logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_corrective():
    config_file = sys.argv[1] if len(sys.argv) > 1 else "config.json"
    config = get_config(config_file)
    logger = setup_logging(config.artifacts_dir)
    db = DBManager()
    builder = MessageBuilder()
    
    platform = "Instagram"
    logger.info("=== INICIANDO MISIÓN CORRECTIVA v12.0: Galante's Jewelry ===")
    
    # 1. Obtener usuarios a corregir
    # Usamos los usuarios de la DB principal que NO están en la de corrección
    all_users = db.get_all_processed()
    targets = [u.split(":")[1] for u in all_users if u.startswith(f"{platform}:")]
    
    # [v12.0] FILTRO DE SEGURIDAD: Solo usuarios previos al link profesional
    # Como la DB es cronológica, podemos limitar a los primeros N o procesar todos con cautela
    
    browser = Browser(config)
    driver = browser.start()
    navigator = Navigator(driver, config)
    extractor = Extractor(driver)
    probe = InteractionProbe(driver, config)
    
    total_corrected = 0
    
    for ident in targets:
        try:
            if db.is_corrective_processed(ident, platform):
                logger.info(f"[SKIPPED] {ident} ya recibió corrección.")
                continue
            
            # [v12.0] MÁXIMO DIARIO: Evitar bloqueos (Lote de 50)
            if total_corrected >= 50:
                logger.info("=== LOTE DIARIO DE CORRECCIÓN COMPLETADO (50) ===")
                break

            logger.info(f"\n[CORRIGIENDO] {ident}")
            
            # Navegación Directa al Perfil
            target_url = f"https://www.instagram.com/{ident}/?hl=en"
            if not navigator.navigate(target_url): continue
            
            # Extracción básica para el saludo
            data = extractor.extract_all()
            
            # Transición al chat
            msg_xpath = "//*[self::div or self::button][contains(translate(@aria-label, 'MESSAGE', 'message'), 'message') or contains(translate(@aria-label, 'MENSAJE', 'mensaje'), 'mensaje') or contains(text(), 'Message') or contains(text(), 'Enviar mensaje') or contains(text(), 'Mensaje')]"
            try:
                msg_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, msg_xpath)))
                driver.execute_script("arguments[0].click();", msg_btn)
                time.sleep(5) 
            except:
                logger.error(f"[FAIL] No se pudo entrar al chat de {ident}")
                continue

            # Envío del Mensaje Correctivo v12.0
            message_parts = builder.build_corrective(data)
            for part in message_parts:
                if probe.type_message(part):
                    if not probe.click_send():
                        probe.click_send()
                    time.sleep(2.0)
            
            db.mark_corrective_processed(ident, platform)
            total_corrected += 1
            logger.info(f"[SUCCESS] Corrección entregada a {ident} ({total_corrected}/50)")
            
            # Pausa de seguridad industrial (Sincronización Humana)
            random_delay(60, 90)

        except Exception as e:
            logger.error(f"Error en corrección para {ident}: {e}")
            if "session" in str(e).lower(): break
            continue

    logger.info(f"=== MISIÓN CORRECTIVA FINALIZADA: {total_corrected} usuarios rectificados ===")
    driver.quit()

if __name__ == "__main__":
    run_corrective()
