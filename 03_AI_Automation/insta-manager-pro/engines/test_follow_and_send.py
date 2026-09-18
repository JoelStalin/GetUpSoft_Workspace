"""
test_follow_and_send.py
Flujo completo: abrir seguidores → seguir → enviar mensaje
"""
import sys
import time
import json
import pyperclip
from pathlib import Path
from bot.config import get_config
from bot.browser import Browser
from bot.message_builder import MessageBuilder
from bot.models import ExtractionResult
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def ss(driver, name):
    p = f"artifacts/{name}.png"
    driver.save_screenshot(p)
    print(f"[screenshot] {p}")

def main():
    config = get_config("config.json")
    browser = Browser(config)
    driver = browser.start()

    try:
        # 1. Activar modo DM navegando a inbox primero
        print("[1] Abriendo inbox...")
        driver.get("https://www.instagram.com/direct/inbox/")
        time.sleep(4)
        print("    URL:", driver.current_url)

        # 2. Ir al perfil propio
        print("[2] Perfil galantesjewelrybythesea...")
        driver.get("https://www.instagram.com/galantesjewelrybythesea/?hl=en")
        time.sleep(5)
        ss(driver, "1_profile")

        # 3. Abrir modal de seguidores con JS click
        print("[3] Abriendo modal de seguidores...")
        fl = driver.find_element(By.XPATH, "//a[contains(@href,'/followers/')]")
        driver.execute_script("arguments[0].click();", fl)
        time.sleep(5)
        ss(driver, "2_modal")

        # 4. Encontrar y seguir primer usuario disponible (JS atómico)
        print("[4] Buscando usuario para seguir...")
        result = driver.execute_script("""
            var skip = ['galantesjewelrybythesea','93_stalin'];
            var dialog = document.querySelector("div[role='dialog']");
            if (!dialog) return {error: 'no dialog'};

            var btns = Array.from(dialog.querySelectorAll('button')).filter(function(b) {
                var t = b.innerText.trim();
                return t === 'Follow' || t === 'Seguir';
            });
            if (!btns.length) return {error: 'no follow btns', count: 0};

            for (var btn of btns) {
                var node = btn;
                for (var i = 0; i < 12; i++) {
                    node = node.parentElement;
                    if (!node) break;
                    var links = node.querySelectorAll('a');
                    for (var l of links) {
                        var href = l.href || '';
                        var m = href.match(/instagram\\.com\\/([^/?#]+)/);
                        if (m && m[1] && skip.indexOf(m[1]) === -1 && m[1].length > 2) {
                            btn.click();
                            return {username: m[1], url: 'https://www.instagram.com/' + m[1] + '/'};
                        }
                    }
                }
            }
            return {error: 'no valid username found'};
        """)
        print("    JS result:", json.dumps(result, ensure_ascii=False))

        if "error" in result:
            print("ERROR:", result["error"])
            return

        target = result["username"]
        profile_url = result["url"]
        print(f"    Siguiendo: @{target}")
        time.sleep(3)
        ss(driver, "3_followed")

        # 5. Navegar al perfil del usuario
        print(f"[5] Navegando a perfil: {profile_url}")
        driver.get(profile_url)
        time.sleep(4)
        ss(driver, "4_target_profile")
        print("    URL:", driver.current_url)

        # 6. Click en botón Message
        print("[6] Buscando botón Message...")
        msg_btn = None

        for xpath in [
            "//div[@role='button'][.//div[text()='Message']]",
            "//div[@role='button'][.//div[text()='Mensaje']]",
            "//button[normalize-space(text())='Message']",
        ]:
            els = driver.find_elements(By.XPATH, xpath)
            if els:
                msg_btn = els[0]
                print(f"    Encontrado con: {xpath}")
                break

        if not msg_btn:
            msg_btn = driver.execute_script("""
                var btns = document.querySelectorAll('div[role=button], button');
                for (var b of btns) {
                    var t = b.innerText.trim();
                    if (t === 'Message' || t === 'Mensaje') return b;
                }
                return null;
            """)
            if msg_btn:
                print("    Encontrado via JS")

        if not msg_btn:
            print("ERROR: no se encontró botón Message")
            ss(driver, "error_no_msg_btn")
            return

        msg_btn.click()
        print("    Click realizado, esperando 5s...")
        time.sleep(5)
        ss(driver, "5_after_msg_click")

        # 7. Verificar hilo real /direct/t/ — si abrió como panel, forzar via /direct/new/
        print("[7] Verificando hilo DM real...")
        on_real_thread = any("/direct/t/" in driver.current_url
                             for _ in [driver.switch_to.window(h) or driver.current_url
                                       for h in driver.window_handles])
        # Re-switch en orden correcto
        for h in driver.window_handles:
            driver.switch_to.window(h)
            if "/direct/t/" in driver.current_url:
                on_real_thread = True
                print(f"    Hilo real: {driver.current_url}")
                break

        if not on_real_thread:
            print("    Chat abrió como panel — forzando /direct/new/")
            driver.get("https://www.instagram.com/direct/new/")
            time.sleep(3)

            # Buscar input
            try:
                search = WebDriverWait(driver, 8).until(
                    EC.presence_of_element_located(
                        (By.XPATH, "//input[@placeholder='Search...' or @placeholder='Buscar...' "
                                   "or @name='queryBox' or @aria-label='Search' or @aria-label='Buscar']")
                    )
                )
                search.click()
                time.sleep(0.5)
                search.send_keys(target)
                time.sleep(2.5)
                # Click en el resultado
                clicked = driver.execute_script("""
                    var user = arguments[0];
                    var items = document.querySelectorAll('div[role="button"], li, div[tabindex]');
                    for (var item of items) {
                        if ((item.innerText || '').includes(user)) { item.click(); return true; }
                    }
                    return false;
                """, target)
                if not clicked:
                    search.send_keys(Keys.ENTER)
                time.sleep(1.5)
                # Click en Chat/Next
                for label in ["Chat", "Chatear", "Next", "Siguiente"]:
                    btns = driver.find_elements(By.XPATH,
                        f"//div[@role='button'][.//div[text()='{label}']] | //button[normalize-space(text())='{label}']")
                    if btns:
                        btns[0].click()
                        print(f"    Click en '{label}'")
                        time.sleep(3)
                        break
                # Esperar URL real
                for _ in range(8):
                    if "/direct/t/" in driver.current_url:
                        print(f"    Hilo real obtenido: {driver.current_url}")
                        break
                    time.sleep(1)
                else:
                    print("    ADVERTENCIA: no se llegó a /direct/t/")
            except Exception as e:
                print(f"    ERROR en /direct/new/: {e}")

        time.sleep(2)
        ss(driver, "6_dm_window")
        print(f"    URL DM: {driver.current_url}")

        # 8. Construir y dividir mensaje
        print("[8] Construyendo mensaje...")
        dummy = ExtractionResult(
            visible_name=target,
            username=target,
            url=profile_url,
            timestamp=datetime.now().isoformat(),
            confidence=1.0,
            selector_used="followers_flow",
        )
        full_message = MessageBuilder().build(dummy)
        print(f"    Mensaje total: {len(full_message)} chars")

        # Dividir texto de links
        text_part = full_message
        links_part = None
        for marker in ["Acá te dejo los enlaces", "Here are the links:"]:
            if marker in full_message:
                idx = full_message.index(marker)
                text_part = full_message[:idx].rstrip()
                links_part = full_message[idx:].strip()
                break
        print(f"    Texto: {len(text_part)} chars | Links: {len(links_part) if links_part else 0} chars")

        def find_tb():
            return WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//div[@role='textbox' and @contenteditable='true']")
                )
            )

        def paste_send(tb, text):
            tb.click(); time.sleep(0.4)
            tb.send_keys(Keys.CONTROL, "a"); tb.send_keys(Keys.DELETE); time.sleep(0.3)
            pyperclip.copy(text); time.sleep(0.4)
            tb.send_keys(Keys.CONTROL, "v"); time.sleep(1.2)
            content = driver.execute_script("return arguments[0].innerText || arguments[0].value || '';", tb)
            if not content or len(content.strip()) < 5:
                return False
            send_btns = driver.find_elements(By.XPATH,
                "//div[@role='button' and (@aria-label='Send' or @aria-label='Enviar')]")
            if send_btns:
                send_btns[0].click(); print("    → Send via botón")
            else:
                tb.send_keys(Keys.ENTER); print("    → Send via ENTER")
            time.sleep(2)
            final = driver.execute_script("return arguments[0].innerText || arguments[0].value || '';", tb)
            return not final or len(final.strip()) == 0

        # 9. Enviar texto principal
        print("[9] Enviando texto principal...")
        try:
            tb = find_tb()
            ok = paste_send(tb, text_part)
            ss(driver, "7_text_sent")
            if ok:
                print("    ✓ Texto enviado correctamente")
            else:
                print("    ⚠ Textbox no quedó vacío tras texto")
        except Exception as e:
            print(f"    ERROR textbox: {e}")
            ss(driver, "error_no_textbox")
            return

        # 10. Enviar links
        if links_part:
            print("[10] Enviando links...")
            time.sleep(1.5)
            try:
                tb2 = find_tb()
                paste_send(tb2, links_part)
                ss(driver, "8_links_sent")
                print("    ✓ Links enviados")
            except Exception as e:
                print(f"    ⚠ Links no enviados: {e}")

        print()
        print("=" * 50)
        print(f"  EXITO: mensaje enviado a @{target}")
        print("=" * 50)

    except Exception as e:
        import traceback
        print("EXCEPCION:", e)
        traceback.print_exc()
        try:
            ss(driver, "exception")
        except Exception:
            pass
    finally:
        browser.stop()


if __name__ == "__main__":
    main()
