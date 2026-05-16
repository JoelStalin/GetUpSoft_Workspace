import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from bot.config import AppConfig

logger = logging.getLogger("insta_bot")

class InteractionProbe:
    def __init__(self, driver, config: AppConfig):
        self.driver = driver
        self.config = config
        self.last_message = ""
        self._last_textbox = None

    def follow_user(self):
        logger.info("[STEP] Attempting to follow user")
        if self.config.dry_run:
            logger.info("[SKIPPED] Dry-run active. No se hará click en Follow.")
            return True
            
        try:
            # Selectores ultra-robustos para Seguir/Follow
            selectors = [
                "//button[.//div[text()='Follow' or text()='Seguir']]",
                "//button[text()='Follow' or text()='Seguir']",
                "//div[text()='Follow' or text()='Seguir']/ancestor::button",
                "//button[contains(., 'Follow') or contains(., 'Seguir')]",
                "//button[contains(@class, '_acan') and contains(@class, '_acap')]" # Botón principal IG
            ]
            
            from selenium.webdriver.common.action_chains import ActionChains
            for sel in selectors:
                buttons = self.driver.find_elements(By.XPATH, sel)
                if buttons and buttons[0].is_displayed():
                    text_lower = buttons[0].text.lower()
                    # [V11.1] Detección de 'Follow Back' según pantallazos del usuario
                    is_new_follow = any(k in text_lower for k in ["follow back", "seguir también", "follow", "seguir"])
                    is_already_following = "following" in text_lower or "siguiendo" in text_lower
                    
                    if is_new_follow and not is_already_following:
                        # Ráfaga de interacción: Actions + JS Fallback
                        try:
                            actions = ActionChains(self.driver)
                            actions.move_to_element(buttons[0]).click().perform()
                        except:
                            self.driver.execute_script("arguments[0].click();", buttons[0])
                        
                        logger.info(f"[PASS] Clicked Follow button using: {sel}")
                        
                        # [V11.4] VERIFICACIÓN TRANSACCIONAL POST-CLICK
                        # Esperamos a que Instagram procese la acción y verificamos que el botón cambie de estado.
                        time.sleep(4.0)
                        try:
                            # Re-localizar el botón para ver su nuevo estado
                            btn_recheck = self.driver.find_elements(By.XPATH, sel)
                            if btn_recheck:
                                new_text = btn_recheck[0].text.lower()
                                if any(k in new_text for k in ["following", "siguiendo", "requested", "solicitado"]):
                                    logger.info(f"[CONFIRMED] El seguimiento se registró con éxito: {new_text}")
                                    return True
                        except:
                            pass
                        
                        # Si no se pudo confirmar, intentamos un último click JS
                        logger.warning("[RETRY] El estado no cambió. Intentando click JS final...")
                        self.driver.execute_script("arguments[0].click();", buttons[0])
                        time.sleep(3.0)
                        
                        # V9.1: SINCRONIZACIÓN HUMANA FINAL
                        logger.info("[ANTI-BOT] Estabilizando interfaz tras seguimiento (5s)...")
                        time.sleep(2.0)
                        
                        # [V11.8] RE-VERIFICACIÓN FINAL DE SEGURIDAD
                        # Si tras el reintento NO estamos siguiendo, abortamos transaccionalmente.
                        try:
                            btn_final = self.driver.find_elements(By.XPATH, sel)
                            if btn_final:
                                final_text = btn_final[0].text.lower()
                                if any(k in final_text for k in ["following", "siguiendo", "requested", "solicitado"]):
                                    return True
                        except: pass
                        
                        logger.error("[FAIL] No se pudo confirmar el seguimiento tras reintento. Abortando flujo comercial.")
                        return False
            
            # Selectores FB adicionales
            fb_selectors = [
                "//div[@aria-label='Follow' or @aria-label='Seguir']",
                "//div[@role='button' and .//span[text()='Follow' or text()='Seguir']]"
            ]
            for sel in fb_selectors:
                btns = self.driver.find_elements(By.XPATH, sel)
                if btns:
                    actions = ActionChains(self.driver)
                    actions.move_to_element(btns[0]).click().perform()
                    logger.info(f"[PASS] Clicked FB Follow button: {sel}")
                    return True

            logger.info("[INFO] User is already followed or button not found.")
            return False # Retornar False para indicar que NO hubo un nuevo seguimiento
        except Exception as e:
            logger.warning(f"[FAIL] Error clicking follow: {e}")
            return False

    def probe_and_prepare(self, message: str):
        logger.info("[STEP] Probing message field")
        selectors = [
            "//div[@role='textbox' and @contenteditable='true']",
            "//div[contains(@aria-label, 'Message') or contains(@aria-label, 'Mensaje')]",
            "//textarea",
            "//div[@contenteditable='true']"
        ]
        
        text_area = None
        for sel in selectors:
            try:
                text_area = self.driver.find_element(By.XPATH, sel)
                if text_area:
                    logger.info(f"[PASS] Interaction field found: {sel}")
                    break
            except:
                continue
        
        if not text_area:
            return False

        self.driver.execute_script("arguments[0].style.border='3px solid blue'", text_area)
        return True

    def type_message(self, message: str):
        """
        Escribe el mensaje usando clipboard paste via JS (bypassa el error 'not interactable').
        Guarda referencia al textbox para click_send.
        """
        self._last_textbox = None
        try:
            # Encontrar el div editable REAL del DM (V6: Búsqueda Recursiva)
            text_area = None
            direct_selectors = [
                 "//div[@role='textbox' and @contenteditable='true']",
                 "//div[@contenteditable='true' and contains(@aria-label, 'Message')]",
                 "//div[@contenteditable='true' and contains(@aria-label, 'Mensaje')]",
                 "//div[@data-lexical-editor='true']",
                 "//p[contains(@class, 'xdj266r')]/parent::div", # Selector profundo de párrafo en IG
                 "//div[@contenteditable='true']",
                 "//textarea"
            ]
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.action_chains import ActionChains
            
            for sel in direct_selectors:
                try:
                    el = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((By.XPATH, sel))
                    )
                    if el and el.is_displayed():
                        # CLICK FÍSICO REAL para activar el campo
                        try:
                            actions = ActionChains(self.driver)
                            actions.move_to_element(el).click().perform()
                            time.sleep(0.5)
                        except:
                            self.driver.execute_script("arguments[0].click();", el)
                        
                        text_area = el
                        logger.info(f"[INFO] Textbox V6 localizado: {sel}")
                        break
                except Exception:
                    continue

            if not text_area:
                # Fallback JS sin checks estrictos
                text_area = self.driver.execute_script("""
                    var els = document.querySelectorAll('div[contenteditable="true"], textarea');
                    return els.length > 0 ? els[0] : null;
                """)

            if not text_area:
                logger.error("[FAIL] No se encontró textbox interactable.")
                return False

            # Método 0: FOCO AGRESIVO (V5)
            self.driver.execute_script("""
                var el = arguments[0];
                el.focus();
                el.click();
                // Eliminar posibles capas bloqueantes
                var rect = el.getBoundingClientRect();
                var over = document.elementFromPoint(rect.left + 5, rect.top + 5);
                if (over && over !== el && !el.contains(over)) {
                    over.style.display = 'none';
                    console.log('Removed blocking layer');
                }
            """, text_area)
            time.sleep(1.0)

            tag = self.driver.execute_script("return arguments[0].tagName + ' aria=' + (arguments[0].getAttribute('aria-label') || '');", text_area)
            logger.info(f"[INFO] Textbox enfocado (V5): {tag}")

            # Método 1: Búsqueda de Foco y Escritura Estándar (V10.1)
            try:
                # Primero intentamos inyectar el texto directamente para velocidad y precisión
                self.driver.execute_script("""
                    var el = arguments[0];
                    var msg = arguments[1];
                    el.focus();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                    document.execCommand('insertText', false, msg);
                """, text_area, message)
                time.sleep(1.0)
                
                content = self.driver.execute_script("return (arguments[0].innerText || arguments[0].innerHTML || '').trim();", text_area)
                if len(content) > 5:
                    logger.info("[PASS] Mensaje escrito exitosamente (v10.1).")
                    self._last_textbox = text_area
                    return True
            except Exception as e:
                logger.warning(f"[INFO] Inyección de texto falló: {e}")

            # Método 2: execCommand insertText (funciona en muchos editores React/Lexical)
            try:
                self.driver.execute_script("""
                    var el = arguments[0];
                    var msg = arguments[1];
                    el.focus();
                    // Limpiar
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                    // Insertar
                    document.execCommand('insertText', false, msg);
                """, text_area, message)
                time.sleep(0.8)
                content = self.driver.execute_script(
                    "return arguments[0].innerText || arguments[0].value || '';", text_area
                )
                if content and len(content.strip()) > 5:
                    self.last_message = message
                    self._last_textbox = text_area
                    logger.info("[PASS] Mensaje escrito via execCommand insertText.")
                    return True
            except Exception as e:
                logger.warning(f"[INFO] execCommand falló: {e}")

            # Método 3: DataTransfer + paste event (más cercano a comportamiento humano)
            try:
                self.driver.execute_script("""
                    var el = arguments[0];
                    var text = arguments[1];
                    el.focus();
                    var data = new DataTransfer();
                    data.setData('text/plain', text);
                    var event = new ClipboardEvent('paste', {
                        clipboardData: data,
                        bubbles: true,
                        cancelable: true
                    });
                    el.dispatchEvent(event);
                """, text_area, message)
                time.sleep(1.0)
                content = self.driver.execute_script(
                    "return arguments[0].innerText || arguments[0].value || '';", text_area
                )
                if content and len(content.strip()) > 5:
                    self.last_message = message
                    self._last_textbox = text_area
                    logger.info("[PASS] Mensaje escrito via DataTransfer paste event.")
                    return True
            except Exception as e:
                logger.warning(f"[INFO] DataTransfer falló: {e}")

            logger.error("[FAIL] No se pudo escribir el mensaje por ningún método.")
            return False

        except Exception as e:
            logger.error(f"[FAIL] Error al escribir: {e}")
            return False

    def click_send(self):
        """
        Envía el mensaje. Usa el textbox guardado por type_message para ENTER,
        o busca el botón Send visualmente.
        Retorna True SOLO si se confirma envío (textbox vacío después).
        """
        logger.info("[STEP] Attempting to SEND message")
        if self.config.dry_run:
            logger.info("[SKIPPED] Dry-run active. No se enviará el mensaje.")
            return True

        try:
            self.close_modals()
            time.sleep(0.5)

            # 1. Botón Send visual (Instagram lo muestra cuando hay texto)
            send_selectors = [
                "//div[@role='button' and (text()='Send' or text()='Enviar')]",
                "//div[@role='button' and (@aria-label='Send' or @aria-label='Enviar')]",
                "//button[text()='Send' or text()='Enviar']",
                "//div[text()='Send' or text()='Enviar']",
            ]
            for sel in send_selectors:
                btns = self.driver.find_elements(By.XPATH, sel)
                if btns:
                    target = btns[0]
                    self.driver.execute_script("arguments[0].scrollIntoView();", target)
                    time.sleep(0.4)
                    try:
                        target.click()
                    except Exception:
                        self.driver.execute_script("arguments[0].click();", target)
                    time.sleep(2)
                    # Verificar que el textbox quedó vacío
                    if self._verify_textbox_empty():
                        logger.info(f"[PASS] Mensaje ENVIADO via botón: {sel}")
                        return True
                    
                    # Ráfaga de seguridad: Si el click no lo vació, probamos ENTER múltiple y Clicks forzados
                    logger.warning(f"[INFO] Click inicial fallido para vaciar textbox. Iniciando RÁFAGA DE ENVÍO v10.3...")
                    for i in range(5):
                        try:
                            # 1. Click JS en el botón (si existe y cambió)
                            btns_recheck = self.driver.find_elements(By.XPATH, sel)
                            if btns_recheck:
                                self.driver.execute_script("arguments[0].click();", btns_recheck[0])
                            # 2. Teclado ENTER
                            self.driver.execute_script("arguments[0].dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter', 'which': 13, 'keyCode': 13, 'bubbles': true}));", self._last_textbox)
                            time.sleep(1.0)
                            if self._verify_textbox_empty(): 
                                logger.info(f"[PASS] Mensaje ENVIADO tras ráfaga {i+1}.")
                                return True
                        except:
                            continue
                    
                    if self._verify_textbox_empty():
                        logger.info(f"[PASS] Mensaje ENVIADO (verificado tras ráfaga).")
                        return True

            # 2. ENTER en el textbox guardado (más confiable en IG/FB)
            logger.info("[INFO] Enviando con ENTER en textbox...")
            textbox = getattr(self, '_last_textbox', None)
            if textbox:
                try:
                    textbox.click()
                    time.sleep(0.3)
                    # Forzar ráfaga de ENTER keys
                    for _ in range(3):
                        textbox.send_keys(Keys.ENTER)
                        time.sleep(0.8)
                        if self._verify_textbox_empty():
                            logger.info("[PASS] Mensaje ENVIADO via ráfaga ENTER en textbox.")
                            return True
                    
                    logger.warning("[INFO] ENTER enviado pero textbox aún no vacío.")
                except Exception as e:
                    logger.warning(f"[INFO] ENTER en textbox guardado falló: {e}")

            # 3. ENTER en cualquier textbox activo
            for sel in ["//div[@role='textbox' and @contenteditable='true']",
                        "//div[contains(@aria-label,'Message') or contains(@aria-label,'Mensaje')]"]:
                els = self.driver.find_elements(By.XPATH, sel)
                if els:
                    try:
                        els[0].click()
                        time.sleep(0.3)
                        els[0].send_keys(Keys.ENTER)
                        time.sleep(2)
                        if self._verify_textbox_empty():
                            logger.info("[PASS] Mensaje ENVIADO via ENTER (fallback).")
                            return True
                    except Exception:
                        continue

            logger.error("[FAIL] No se pudo confirmar el envío.")
            return False

        except Exception as e:
            logger.error(f"[FAIL] Error en click_send: {e}")
            return False

    def _verify_textbox_empty(self) -> bool:
        """Verifica que el textbox quedó vacío — señal real de envío exitoso."""
        try:
            for sel in [
                "//div[@role='textbox' and @contenteditable='true']",
                "//div[contains(@aria-label,'Message') or contains(@aria-label,'Mensaje')]"
            ]:
                els = self.driver.find_elements(By.XPATH, sel)
                if els:
                    content = self.driver.execute_script(
                        "return arguments[0].innerText || arguments[0].value || '';", els[0]
                    )
                    return not content or len(content.strip()) == 0
        except Exception:
            pass
        return False

    def verify_sent(self, message_text: str = "") -> bool:
        """
        Verifica que el mensaje realmente se haya enviado buscando la burbuja en el historial.
        """
        logger.info("[STEP] Verificando entrega real en el historial de chat burbuja...")
        
        # 0. Check for E2EE Lock
        if self.is_e2ee_locked():
            logger.error("[STALEMATE] Messenger PIN Required detected during verification.")
            return False

        time.sleep(5) # Esperar sync
        
        # 1. Comprobar vaciado de caja
        box_empty = False
        box_selectors = ["//div[@role='textbox']", "//textarea", "//*[contains(@class, 'notranslate')]"]
        for sel in box_selectors:
            try:
                el = self.driver.find_element(By.XPATH, sel)
                content = el.text or el.get_attribute("value")
                if not content or len(content.strip()) == 0:
                    box_empty = True
                    break
            except:
                continue
        
        if not box_empty:
            logger.warning("[INFO] La caja sigue conteniendo el borrador.")
            return False

        # 2. Comprobar burbuja de chat REAL (fuera de textbox, barra lateral o navegación)
        snippet = message_text[:20].strip() if message_text else ""
        if snippet:
            bubble_xpath = f"//*[contains(text(), '{snippet}') and not(ancestor-or-self::*[@role='textbox' or @role='combobox' or @role='navigation' or contains(@aria-label, 'Draft') or contains(@aria-label, 'Borrador')])]"
            try:
                bubbles = self.driver.find_elements(By.XPATH, bubble_xpath)
                if bubbles and bubbles[0].is_displayed():
                    logger.info(f"[PASS] Burbuja de chat REAL detectada: {snippet}")
                    return True
            except:
                pass
        
        return False

    def check_for_draft(self) -> bool:
        """Revisa si la conversación actual aparece con etiqueta de Borrador."""
        try:
            draft_selectors = [
                 "//span[contains(text(), 'Draft') or contains(text(), 'Borrador')]",
                 "//div[@aria-label='Delete draft' or @aria-label='Eliminar borrador']"
            ]
            for sel in draft_selectors:
                if self.driver.find_elements(By.XPATH, sel):
                    logger.warning(f"[INFO] Estado de BORRADOR detectado en barra lateral.")
                    return True
            return False
        except:
            return False
            
    def is_e2ee_locked(self) -> bool:
        """Detecta si el cifrado E2EE (PIN) está bloqueando la visibilidad/envío."""
        lock_selectors = [
            "//*[contains(text(), 'Enter your PIN') or contains(text(), 'Ingresa tu PIN')]",
            "//*[contains(text(), 'Chat history missing') or contains(text(), 'Historial de chat faltante')]"
        ]
        for sel in lock_selectors:
            if self.driver.find_elements(By.XPATH, sel):
                logger.warning(f"[STALEMATE] Cifrado E2EE detectado: {sel}")
                return True
        return False

    def has_chat_history(self) -> bool:
        """
        [V8 BLINDAJE MAESTRO] Detecta si ya existen mensajes previos en el chat.
        Si hay burbujas de mensaje, significa que el usuario ya fue contactado.
        """
        logger.info("[STEP] Auditando historial de chat para evitar duplicados...")
        history_selectors = [
            "//div[@role='row']", # Filas de mensaje en IG Web
            "//div[contains(@class, 'x78zum5')]//div[contains(@dir, 'auto')]", # Burbujas genéricas
            "//span[contains(@class, 'x1lliihq') and (contains(text(), 'Today') or contains(text(), 'Hoy'))]", # Separadores de fecha
            "//div[contains(@aria-label, 'Mensaje') or contains(@aria-label, 'Message')]//ancestor::div[1]//div[@role='none']"
        ]
        
        for sel in history_selectors:
            try:
                elements = self.driver.find_elements(By.XPATH, sel)
                # [V11] REFINAMIENTO: Ignorar mensajes de sistema y avatars
                # Un chat con historial real suele tener más de 5-6 elementos de estructura.
                if len(elements) > 5:
                    # Validación de Texto: ¿Contiene algo que Daniello haya enviado?
                    full_text = self.driver.execute_script("return document.body.innerText;").lower()
                    keywords = ["galante", "jewelry", "daniello", "facebook", "tienda"]
                    found_keywords = [k for k in keywords if k in full_text]
                    
                    if len(found_keywords) >= 1:
                        logger.warning(f"[ABORT] Historial CONFIRMADO con palabras clave: {found_keywords}")
                        return True
                    else:
                        logger.info("[INFO] Elementos detectados pero sin palabras clave de prospección. Asumiendo chat vacío de sistema.")
            except:
                continue
        
        logger.info("[PASS] Chat limpio detectado. Procediendo con prospección.")
        return False

    def close_modals(self):
        """Intenta cerrar modales de seguridad o avisos que bloquean el envío."""
        logger.info("[STEP] Buscando modales bloqueantes...")
        modal_close_selectors = [
            "//div[@aria-label='Close' or @aria-label='Cerrar']",
            "//div[text()='Not now' or text()='Ahora no']",
            "//button[text()='Not now' or text()='Ahora no']",
            "//*[contains(text(), 'Historial de chat')]/ancestor::div//div[@role='button']"
        ]
        for sel in modal_close_selectors:
            try:
                btns = self.driver.find_elements(By.XPATH, sel)
                for btn in btns:
                    if btn.is_displayed():
                        btn.click()
                        logger.info(f"[INFO] Modal cerrado con: {sel}")
            except:
                continue
