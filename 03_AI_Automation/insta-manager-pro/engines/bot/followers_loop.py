import sys
import logging
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

def run_loop():
    # Permitir especificar el archivo de config por parámetro: python -m bot.followers_loop config_instagram.json
    config_file = sys.argv[1] if len(sys.argv) > 1 else "config.json"
    
    config = get_config(config_file)
    logger = setup_logging(config.artifacts_dir)
    db = DBManager()
    builder = MessageBuilder()
    
    # Detección de plataforma basada en el archivo de configuración o su contenido
    platform = "Instagram"
    if "facebook" in config_file.lower():
        platform = "Facebook"
    elif "instagram" in config_file.lower():
        platform = "Instagram"
    elif "facebook.com" in config.allowed_domains and "instagram.com" not in config.allowed_domains:
        platform = "Facebook"
    
    logger.info(f"=== INICIANDO BUCLE DE AUTOMATIZACIÓN MASIVA: {platform} ===")
    
    # Configuración de Paginación Persistente v14.0
    next_max_id = None
    total_processed = 0
    current_mode = "followers" # followers | following
    
    while True:
        try:
            browser = Browser(config)
            driver = browser.start()
            navigator = Navigator(driver, config)
            extractor = Extractor(driver)
            probe = InteractionProbe(driver, config)
            
            # Navegar al punto de partida para reactivar el contexto de Instagram
            navigator.navigate("https://www.instagram.com/galantesjewelrybythesea/")
            short_delay()

            # BUCLE INTERNO DE PROSPECCIÓN
            while True:
                # A. Extraer lote (20 objetivos) con REINTENTOS v11.9
                targets = []
                retry_count = 0
                while retry_count < 3:
                    try:
                        if platform == "Instagram":
                            if current_mode == "followers":
                                targets, next_max_id = extractor.get_instagram_followers(max_id=next_max_id)
                            else:
                                targets, next_max_id = extractor.get_instagram_following(max_id=next_max_id)
                        else:
                            targets = extractor.get_facebook_friends(limit=50)
                            if not targets:
                                targets = extractor.get_facebook_followers(limit=50)
                            next_max_id = None
                        
                        if targets: break
                        
                        if platform == "Instagram" and next_max_id:
                            raise Exception("Lote vacío inesperado")
                        else:
                            break
                    except Exception as e:
                        retry_count += 1
                        logger.warning(f"[RETRY {retry_count}/3] Error de API: {e}. Refrescando...")
                        navigator.navigate("https://www.instagram.com/galantesjewelrybythesea/")
                        time.sleep(30 * retry_count)
                
                if not targets:
                    if platform == "Instagram" and current_mode == "followers":
                        logger.info("=== Bucle de Seguidores agotado. Iniciando barrido de SIGUIENDO (Following) v14.0 ===")
                        current_mode = "following"
                        next_max_id = None # Reset cursor para la nueva lista
                        continue 
                    else:
                        logger.info("=== BUCLE MASIVO FINALIZADO EXITOSAMENTE (Fin de todas las listas) ===")
                        return 

                logger.info(f"[INFO] Lote de {len(targets)} objetivos capturado. Cursor: {next_max_id}")
                
                # B. Procesar Lote
                for ident in targets:
                    try:
                        if db.is_processed(ident, platform):
                            logger.info(f"[SKIPPED] {ident} ya procesado.")
                            continue
                            
                        logger.info(f"\n[PROCESANDO] {ident} ({platform})")
                        
                        # B.1 Navegación y Viabilidad
                        target_url = f"https://www.instagram.com/{ident}/?hl=en"
                        if not navigator.navigate(target_url):
                            continue
                        
                        data = extractor.extract_all()
                        
                        msg_xpath = "//*[self::div or self::button][contains(translate(@aria-label, 'MESSAGE', 'message'), 'message') or contains(translate(@aria-label, 'MENSAJE', 'mensaje'), 'mensaje') or contains(text(), 'Message') or contains(text(), 'Enviar mensaje') or contains(text(), 'Mensaje')]"
                        try:
                            WebDriverWait(driver, 7).until(EC.presence_of_element_located((By.XPATH, msg_xpath)))
                        except:
                            logger.warning(f"[SKIP] {ident} tiene mensajes bloqueados.")
                            continue

                        # B.2 El Escudo Transaccional (v11.8)
                        if not probe.follow_user():
                            logger.info(f"[SKIP] No se pudo confirmar seguimiento para {ident}.")
                            continue
                        
                        # B.3 Chat e Historial
                        logger.info(f"[STEP] Transicionando al chat...")
                        try:
                            msg_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, msg_xpath)))
                            driver.execute_script("arguments[0].click();", msg_btn)
                            time.sleep(5) 
                        except:
                            logger.error(f"[FAIL] Bloqueo al entrar al chat para {ident}")
                            continue

                        if probe.has_chat_history():
                            logger.warning(f"[ABORT] {ident} ya tiene historial.")
                            db.mark_processed(ident, platform)
                            continue

                        # B.4 El Envío en Cascada (v11.7)
                        message_parts = builder.build_split(data)
                        for part in message_parts:
                            if probe.type_message(part):
                                if not probe.click_send():
                                    logger.warning(f"[RETRY] Reintentando envío de burbuja...")
                                    probe.click_send()
                                time.sleep(1.5)
                        
                        db.mark_processed(ident, platform)
                        total_processed += 1
                        logger.info(f"[SUCCESS] Ciclo completado para {ident} (Total: {total_processed})")
                        
                        navigator.navigate("https://www.instagram.com/galantesjewelrybythesea/")
                        random_delay(30, 60)

                    except Exception as e:
                        logger.error(f"Error procesando a {ident}: {e}")
                        if "session" in str(e).lower() or "connected" in str(e).lower():
                            raise e # Propagar para reinicio de navegador
                        continue

                # C. Descanso entre lotes
                if next_max_id:
                    logger.info("[PAUSE] Lote acabado. Descansando 2 min para la siguiente página...")
                    time.sleep(120)
                else: break

        except Exception as fatal_e:
            logger.error(f"!!! FALLO FATAL DEL NAVEGADOR (Fénix v11.10) !!!: {fatal_e}")
            try: driver.quit()
            except: pass
            logger.info("Reiniciando navegador en 30 segundos para continuar la prospección...")
            time.sleep(30)
            continue # Reiniciar el bucle de Browser

    logger.info("=== BUCLE MASIVO FINALIZADO EXITOSAMENTE ===")

    logger.info("=== BUCLE FINALIZADO ===")

if __name__ == "__main__":
    import time
    run_loop()
