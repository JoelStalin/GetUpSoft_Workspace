import sys
import logging
import time
from bot.config import get_config
from bot.browser import Browser
from bot.navigator import Navigator
from bot.extractors import Extractor
from bot.interaction_probe import InteractionProbe
from bot.message_builder import MessageBuilder
from bot.utils.db.manager import DBManager
from bot.utils.logging_setup import setup_logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_test(target_username="93_stalin"):
    """
    Ejecuta un flujo de prueba controlado para validar la robustez v10.
    """
    config = get_config("config_instagram.json")
    logger = setup_logging(config.artifacts_dir)
    db = DBManager()
    builder = MessageBuilder()
    
    logger.info(f"=== INICIANDO TEST DE DIAGNÓSTICO v10: {target_username} ===")
    
    browser = Browser(config)
    driver = browser.start()
    navigator = Navigator(driver, config)
    extractor = Extractor(driver)
    probe = InteractionProbe(driver, config)
    
    try:
        # A. Navegar al perfil de prueba
        target_url = f"https://www.instagram.com/{target_username}/?hl=en"
        logger.info(f"[TEST] Navegando a perfil de prueba: {target_url}")
        if not navigator.navigate(target_url):
            logger.error("[FAIL] No se pudo navegar al perfil de prueba.")
            return

        # B. FILTRO DE VIABILIDAD v10: ¿Existe el botón de mensaje?
        logger.info("[TEST] Verificando disponibilidad de chat (Pre-Follow)...")
        msg_xpath = "//*[self::div or self::button][contains(translate(@aria-label, 'MESSAGE', 'message'), 'message') or contains(translate(@aria-label, 'MENSAJE', 'mensaje'), 'mensaje') or contains(text(), 'Message') or contains(text(), 'Enviar mensaje') or contains(text(), 'Mensaje')]"
        try:
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, msg_xpath)))
            logger.info("[PASS] Canal de mensaje abierto detectado.")
        except:
            logger.warning("[ABORT] El canal de mensaje parece cerrado para este perfil. No se realizaría el Follow.")
            # En el test forzamos para ver si aparece tras el follow si el usuario quiere, 
            # pero el bot industrial abortaría aquí.
        
        # C. Proceso de Seguimiento
        logger.info("[TEST] Ejecutando Follow...")
        probe.follow_user()
        time.sleep(5) # Pausa humana v9.1

        # D. Transición al Chat
        logger.info("[TEST] Intentando entrar al chat...")
        try:
            msg_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, msg_xpath)))
            driver.execute_script("arguments[0].click();", msg_btn)
            time.sleep(5)
        except Exception as e:
            logger.error(f"[FAIL] Bloqueo detectado al entrar al chat: {e}")
            driver.save_screenshot("artifacts/test_v10_error.png")
            return

        # E. Auditoría de Historial
        if probe.has_chat_history():
             logger.info("[INFO] Historial detectado en test. Limpiando para el envío de prueba...")
        
        # F. Envío de las 4 Burbujas (Incluyendo Link FB solicitado)
        data = extractor.extract_all()
        message_parts = builder.build_split(data)
        
        logger.info(f"[TEST] Enviando {len(message_parts)} burbujas de invitación...")
        for part in message_parts:
            if probe.type_message(part):
                probe.click_send()
                logger.info(f"[SENT] Burbuja entregada: {part[:30]}...")
                time.sleep(2)
        
        logger.info("=== TEST FINALIZADO EXITOSAMENTE ===")
        logger.info("Por favor, verifica en tu móvil si los links son clickeables.")

    except Exception as e:
        logger.error(f"[CRITICAL ERROR] Fallo en el diagnóstico: {e}")
        driver.save_screenshot("artifacts/test_v10_critical.png")
    finally:
        # No cerramos el browser para que el usuario pueda ver el resultado final en pantalla
        pass

if __name__ == "__main__":
    # Usamos el perfil '93_stalin' (Joel) para la prueba inicial si es posible
    run_test("93_stalin")
