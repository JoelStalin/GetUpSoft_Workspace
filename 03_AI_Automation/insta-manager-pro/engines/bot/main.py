import sys
import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.config import get_config
from bot.browser import Browser
from bot.navigator import Navigator
from bot.extractors import Extractor
from bot.message_builder import MessageBuilder
from bot.interaction_probe import InteractionProbe
from bot.reporter import Reporter
from bot.models import StepStatus, FinalReport
from bot.utils.logging_setup import setup_logging
from bot.utils.screenshots import take_screenshot

def main():
    # Permitir especificar el archivo de config por parámetro: python -m bot.main [url] [json]
    config_file = sys.argv[2] if len(sys.argv) > 2 else "config.json"
    config = get_config(config_file)
    logger = setup_logging(config.artifacts_dir)
    steps = []
    
    logger.info("=== STARTING FULL AUTOMATED INVITATION BOT ===")
    
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.instagram.com/zalesjewelers/"
    
    browser = Browser(config)
    driver = None
    
    try:
        # 1. Inicio de Navegador
        driver = browser.start()
        steps.append(StepStatus("Browser Start", "PASS", "Chrome connected"))
        
        # 2. Navegación al Perfil
        navigator = Navigator(driver, config)
        if not navigator.navigate(target_url):
            steps.append(StepStatus("Navigation", "FAIL", "Domain blocked"))
            return
        steps.append(StepStatus("Navigation", "PASS", f"Arrived at {target_url}"))

        # 3. Extracción e Identidad
        extractor = Extractor(driver)
        result = extractor.extract_all()
        steps.append(StepStatus("Extraction", "PASS", f"Visible name: {result.visible_name}"))
        
        # 4. Acción: SEGUIR (Follow)
        probe = InteractionProbe(driver, config)
        if probe.follow_user():
            steps.append(StepStatus("Follow Action", "PASS", "User followed (or already following)"))
        else:
            steps.append(StepStatus("Follow Action", "FAIL", "Could not click Follow button"))

        # 5. Construcción del Mensaje Daniello CEO
        builder = MessageBuilder()
        message = builder.build(result)
        steps.append(StepStatus("Message Builder", "PASS", "Official professional draft ready"))

        # 6. Transición al Chat (Opcional según instrucción del usuario)
        logger.info("[STEP] Transicionando al chat...")
        can_message = False
        try:
            # Cerrar pestañas /direct/ previas para evitar enviar al chat equivocado
            profile_handle = driver.current_window_handle
            for handle in list(driver.window_handles):
                if handle == profile_handle:
                    continue
                driver.switch_to.window(handle)
                if "/direct/" in driver.current_url:
                    logger.info("[INFO] Cerrando pestaña DM anterior: %s", driver.current_url)
                    driver.close()
            driver.switch_to.window(profile_handle)
            time.sleep(0.5)

            wait = WebDriverWait(driver, 15)
            handles_before = set(driver.window_handles)

            msg_xpath = "//*[self::div or self::button][contains(translate(@aria-label, 'MESSAGE', 'message'), 'message') or contains(translate(@aria-label, 'MENSAJE', 'mensaje'), 'mensaje') or contains(text(), 'Message') or contains(text(), 'Enviar mensaje')]"
            msg_btn = wait.until(EC.element_to_be_clickable((By.XPATH, msg_xpath)))
            msg_btn.click()
            time.sleep(5)

            # Buscar ventana con /direct/ en todas las pestañas (nueva o misma)
            dm_found = False
            for _ in range(3):  # hasta 3 intentos con espera
                for handle in driver.window_handles:
                    driver.switch_to.window(handle)
                    if "/direct/" in driver.current_url:
                        logger.info("[INFO] Pestaña DM encontrada: %s", driver.current_url)
                        dm_found = True
                        break
                if dm_found:
                    break
                time.sleep(2)

            if not dm_found:
                logger.warning("[WARN] No se encontró URL /direct/ — puede que el DM abrió en popup. URL actual: %s", driver.current_url)
                # Intentar igual si hay textbox visible
                dm_found = True  # dejar que probe_and_prepare decida

            steps.append(StepStatus("Chat Transition", "PASS", f"DM window: {driver.current_url}"))
            can_message = True
        except Exception as e:
            logger.info("[INFO] Mensajes restringidos o botón no encontrado. Solo Follow. Error: %s", e)
            steps.append(StepStatus("Chat Transition", "SKIPPED", "Message button not found - Skipping message"))

        # 7. Redacción y Envío (Solo si can_message es True)
        if can_message:
            if probe.probe_and_prepare(message):
                # Escribir mensaje
                typed = probe.type_message(message)
                if typed:
                    steps.append(StepStatus("Type Message", "PASS", "Message drafted in textbox"))
                else:
                    steps.append(StepStatus("Type Message", "FAIL", "Could not inject text into composer"))

                # ENVÍO REAL (Controlado por dry_run)
                if typed:
                    if not config.dry_run:
                        if probe.click_send():
                            steps.append(StepStatus("Send Action", "PASS", "Message SENT to user"))
                        else:
                            steps.append(StepStatus("Send Action", "FAIL", "Send button click failed"))
                    else:
                        logger.info("[SKIPPED] Send action skipped (dry_run=true)")
                        steps.append(StepStatus("Send Action", "SKIPPED", "Action prevented by dry_run flag"))
            else:
                logger.info("[INFO] TextBox no encontrado. OMITIENDO ENVÍO.")
                steps.append(StepStatus("Interaction Probe", "SKIPPED", "Message textbox not found"))

        # 8. Reporte final
        final_report = FinalReport(
            platform="Facebook" if "facebook.com" in target_url.lower() else "Instagram",
            url=target_url,
            extraction=result,
            steps=steps,
            summary="Full automated invitation cycle completed."
        )
        reporter = Reporter(config)
        reporter.save_report(final_report)

    except Exception as e:
        logger.error(f"Critical failure: {e}")
        if driver:
            take_screenshot(driver, config.artifacts_dir, "automated_fail")
    finally:
        browser.stop()
        logger.info("=== FULL BOT EXECUTION FINISHED ===")

if __name__ == "__main__":
    main()
