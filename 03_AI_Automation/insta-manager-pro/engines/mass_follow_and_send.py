"""
mass_follow_and_send.py
========================
Flujo masivo CONFIRMADO:
  1. Ir a galantesjewelrybythesea/followers/
  2. Encontrar seguidores sin seguir de vuelta
  3. Hacer Follow
  4. Navegar a su perfil
  5. Abrir chat → escribir mensaje completo → enviar
  6. Esperar 60-120s anti-ban entre mensajes
  7. Guardar progreso (no repite enviados)

USO:
    python mass_follow_and_send.py
    python mass_follow_and_send.py --limit 20     # máximo 20 por sesión
    python mass_follow_and_send.py --delay 90     # delay fijo en segundos
"""
import sys
import time
import json
import random
import argparse
import traceback
import pyperclip
from pathlib import Path
from datetime import datetime

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

from bot.config import get_config
from bot.browser import Browser
from bot.message_builder import MessageBuilder
from bot.models import ExtractionResult
from bot.utils.logging_setup import setup_logging

# ── Parámetros ───────────────────────────────────────────────
OWN_ACCOUNT   = "galantesjewelrybythesea"
PROGRESS_FILE = Path("output/mass_progress.json")
DELAY_MIN     = 75    # segundos mínimo entre mensajes
DELAY_MAX     = 135   # segundos máximo
BATCH_SIZE    = 8     # mensajes por tanda (reducido para más seguridad)
BATCH_PAUSE   = (2100, 2700)  # 35-45 min entre tandas


# ── Comportamiento humano ─────────────────────────────────────
def human_pause(min_s=0.5, max_s=2.0):
    """Pausa corta aleatoria entre acciones — simula comportamiento humano."""
    time.sleep(random.uniform(min_s, max_s))


def human_scroll(driver, times=None):
    """Scroll aleatorio en la página actual — simula lectura humana."""
    n = times or random.randint(1, 3)
    for _ in range(n):
        px = random.randint(200, 600)
        driver.execute_script(f"window.scrollBy(0, {px});")
        time.sleep(random.uniform(0.4, 1.2))
    # A veces scroll hacia arriba también
    if random.random() < 0.3:
        driver.execute_script(f"window.scrollBy(0, -{random.randint(100, 300)});")
        time.sleep(random.uniform(0.3, 0.8))


def human_mouse_move(driver, element=None):
    """Mueve el mouse aleatoriamente antes de hacer click en un elemento."""
    try:
        actions = ActionChains(driver)
        if element:
            # Mover primero a zona aleatoria, luego al elemento
            actions.move_by_offset(random.randint(-50, 50), random.randint(-30, 30))
            actions.pause(random.uniform(0.2, 0.6))
            actions.move_to_element(element)
            actions.pause(random.uniform(0.1, 0.4))
        else:
            actions.move_by_offset(random.randint(50, 300), random.randint(50, 300))
        actions.perform()
    except Exception:
        pass


# ── Helpers de progreso ───────────────────────────────────────
def load_done() -> set:
    PROGRESS_FILE.parent.mkdir(exist_ok=True)
    if not PROGRESS_FILE.exists():
        return set()
    try:
        data = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        return {r["username"] for r in data if r.get("sent")}
    except Exception:
        return set()


def save_result(username: str, sent: bool, error: str | None = None):
    PROGRESS_FILE.parent.mkdir(exist_ok=True)
    existing = []
    if PROGRESS_FILE.exists():
        try:
            existing = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    existing.append({
        "username": username,
        "sent": sent,
        "error": error,
        "timestamp": datetime.now().isoformat(),
    })
    PROGRESS_FILE.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def ss(driver, name: str):
    p = f"artifacts/{name}.png"
    try:
        driver.save_screenshot(p)
    except Exception:
        pass


# ── Abrir modal de seguidores ─────────────────────────────────
def open_followers_modal(driver, logger) -> bool:
    logger.info("Abriendo modal de seguidores...")
    try:
        # Múltiples selectores para el link de seguidores
        fl = None
        xpaths = [
            "//a[contains(@href,'/followers/')]",
            "//a[contains(@href,'followers')]",
            "//span[contains(text(),'followers') or contains(text(),'seguidores')]"
            "/ancestor::a",
            "//li//a[contains(@href,'followers')]",
        ]
        for xp in xpaths:
            try:
                els = WebDriverWait(driver, 8).until(
                    EC.presence_of_all_elements_located((By.XPATH, xp))
                )
                if els:
                    fl = els[0]
                    logger.info("  Link seguidores encontrado con: %s", xp)
                    break
            except Exception:
                continue

        # Último fallback: JS busca cualquier link con 'follower' en href
        if not fl:
            fl = driver.execute_script("""
                var links = Array.from(document.querySelectorAll('a'));
                for (var l of links) {
                    if ((l.href || '').includes('follower')) return l;
                }
                return null;
            """)

        if not fl:
            logger.error("  Link de seguidores no encontrado en la página")
            return False

        driver.execute_script("arguments[0].click();", fl)
        # Esperar hasta 8s a que aparezca el modal
        for _ in range(16):
            time.sleep(0.5)
            modal = driver.find_elements(By.XPATH, "//div[@role='dialog']")
            if modal:
                logger.info("Modal abierto OK")
                return True
        logger.warning("Modal no apareció tras el click")
        return False
    except Exception as e:
        logger.error("Error abriendo modal: %s", e)
        return False


# ── Scroll del modal para cargar más seguidores ───────────────
def scroll_followers_modal(driver):
    driver.execute_script("""
        var dialog = document.querySelector("div[role='dialog']");
        if (!dialog) return;
        var scrollable = dialog.querySelector("div[style*='overflow']") || dialog;
        scrollable.scrollTop += 600;
    """)
    time.sleep(1.5)


# ── Obtener siguiente seguidor sin seguir ─────────────────────
def get_next_unfollowed(driver, already_done: set, skip_users: set) -> dict | None:
    result = driver.execute_script("""
        var skip = arguments[0];
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
                        return {
                            username: m[1],
                            url: 'https://www.instagram.com/' + m[1] + '/',
                            btn_index: btns.indexOf(btn)
                        };
                    }
                }
            }
        }
        return {error: 'no valid target', count: btns.length};
    """, list(skip_users))
    return result


# ── Hacer Follow en el modal ──────────────────────────────────
def follow_in_modal(driver, username: str) -> bool:
    clicked = driver.execute_script("""
        var username = arguments[0];
        var dialog = document.querySelector("div[role='dialog']");
        if (!dialog) return false;

        var btns = Array.from(dialog.querySelectorAll('button')).filter(function(b) {
            var t = b.innerText.trim();
            return t === 'Follow' || t === 'Seguir';
        });

        for (var btn of btns) {
            var node = btn;
            for (var i = 0; i < 12; i++) {
                node = node.parentElement;
                if (!node) break;
                var links = node.querySelectorAll('a');
                for (var l of links) {
                    if ((l.href || '').includes(username)) {
                        btn.click();
                        return true;
                    }
                }
            }
        }
        // Fallback: click en el primer botón Follow visible
        if (btns.length > 0) { btns[0].click(); return true; }
        return false;
    """, username)
    return bool(clicked)


# ── Helpers de escritura/envío ────────────────────────────────
def _find_textbox(driver):
    return WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[@role='textbox' and @contenteditable='true']")
        )
    )


def _paste_and_send(driver, tb, text, logger):
    """Escribe `text` en tb via clipboard y envía. Retorna True si textbox quedó vacío."""
    human_mouse_move(driver, tb)
    tb.click()
    human_pause(0.4, 0.9)
    tb.send_keys(Keys.CONTROL, "a")
    tb.send_keys(Keys.DELETE)
    human_pause(0.3, 0.7)
    pyperclip.copy(text)
    human_pause(0.4, 0.9)
    tb.send_keys(Keys.CONTROL, "v")
    human_pause(1.2, 2.0)

    content = driver.execute_script(
        "return arguments[0].innerText || arguments[0].value || '';", tb
    )
    if not content or len(content.strip()) < 5:
        return False

    # Pausa breve antes de enviar — humano revisa el mensaje
    human_pause(0.8, 2.0)

    # Intentar botón Send primero
    send_btns = driver.find_elements(
        By.XPATH,
        "//div[@role='button' and (@aria-label='Send' or @aria-label='Enviar')]",
    )
    if send_btns:
        human_mouse_move(driver, send_btns[0])
        send_btns[0].click()
        logger.info("    → Send via botón")
    else:
        tb.send_keys(Keys.ENTER)
        logger.info("    → Send via ENTER")

    time.sleep(random.uniform(2.0, 3.5))
    final = driver.execute_script(
        "return arguments[0].innerText || arguments[0].value || '';", tb
    )
    return not final or len(final.strip()) == 0


# ── Obtener thread URL real via /direct/new/ ──────────────────
def open_dm_via_new(driver, username: str, logger) -> bool:
    """
    Navega a /direct/new/, busca el usuario y abre el hilo.
    Garantiza URL /direct/t/... (mensaje real, no panel).
    Retorna True si se llegó al textbox del hilo.
    """
    logger.info("  Abriendo DM via /direct/new/ para @%s", username)
    driver.get("https://www.instagram.com/direct/new/")
    time.sleep(4)  # esperar que la SPA cargue completamente

    # Buscar input de búsqueda — re-find cada vez para evitar stale
    def get_search():
        xpaths = [
            "//input[@name='queryBox']",
            "//input[@aria-label='Search' or @aria-label='Buscar']",
            "//input[@placeholder='Search...' or @placeholder='Buscar...']",
            "//input[@type='text']",
        ]
        for xp in xpaths:
            els = driver.find_elements(By.XPATH, xp)
            if els and els[0].is_displayed():
                return els[0]
        return None

    search = get_search()
    if not search:
        logger.warning("  Input de búsqueda no encontrado en /direct/new/")
        return False

    try:
        search.click()
        time.sleep(0.5)
        search.send_keys(username)
    except Exception:
        # Re-find si se volvió stale
        time.sleep(1)
        search = get_search()
        if not search:
            return False
        search.click()
        time.sleep(0.5)
        search.send_keys(username)

    # Esperar a que aparezcan resultados de búsqueda
    time.sleep(3.5)

    # Click en primer resultado visible — el username fue tecleado exacto
    # así que el primer resultado siempre es el correcto
    clicked = driver.execute_script("""
        var user = arguments[0].toLowerCase();

        // 1. Intentar con role=option (lista dropdown típica)
        var opts = Array.from(document.querySelectorAll('div[role="option"]'));
        var visible = opts.filter(function(el) { return el.offsetParent !== null; });
        if (visible.length > 0) {
            visible[0].click();
            return 'option:' + (visible[0].innerText || '').trim().substring(0,40);
        }

        // 2. Buscar en listbox
        var listboxes = document.querySelectorAll('div[role="listbox"]');
        for (var lb of listboxes) {
            var children = Array.from(lb.children).filter(function(c){ return c.offsetParent !== null; });
            if (children.length > 0) { children[0].click(); return 'listbox:' + (children[0].innerText||'').substring(0,40); }
        }

        // 3. Buscar span/div con el username exacto
        var all = Array.from(document.querySelectorAll('span, div'));
        for (var el of all) {
            var t = (el.innerText || '').trim().toLowerCase();
            if (t === user && el.offsetParent !== null) {
                var btn = el.closest('div[role="button"]') || el.parentElement;
                if (btn) { btn.click(); return 'exact:' + t; }
            }
        }

        // 4. Cualquier elemento que contenga el username y sea clickable
        for (var el of all) {
            var t = (el.innerText || '').trim().toLowerCase();
            if (t.includes(user) && t.length < 60 && el.offsetParent !== null
                && el.children.length === 0) {
                var btn2 = el.closest('div[role="button"]') || el.parentElement;
                if (btn2) { btn2.click(); return 'contains:' + t; }
            }
        }

        return false;
    """, username)
    logger.info("  Resultado click: %s", clicked)

    if not clicked:
        logger.warning("  No se encontró resultado para @%s en búsqueda", username)
        return False

    time.sleep(1.5)

    # Click en "Chat" / "Next" para confirmar y abrir el hilo
    for label in ["Chat", "Chatear", "Next", "Siguiente"]:
        btns = driver.find_elements(
            By.XPATH,
            f"//div[@role='button'][.//div[text()='{label}']]"
            f" | //div[@role='button' and normalize-space(text())='{label}']"
            f" | //button[normalize-space(text())='{label}']",
        )
        if btns:
            human_mouse_move(driver, btns[0])
            human_pause(0.3, 0.7)
            btns[0].click()
            logger.info("  Click en botón '%s'", label)
            time.sleep(3)
            break

    # Esperar URL de hilo real
    for _ in range(10):
        if "/direct/t/" in driver.current_url:
            logger.info("  URL de hilo: %s", driver.current_url)
            return True
        time.sleep(1)

    logger.warning("  No se llegó a /direct/t/ — URL actual: %s", driver.current_url)
    # Si hay textbox visible, intentar igual
    return bool(driver.find_elements(By.XPATH, "//div[@role='textbox' and @contenteditable='true']"))


# ── Enviar DM al perfil ───────────────────────────────────────
def send_dm(driver, username: str, profile_url: str, logger) -> tuple[bool, str]:
    """
    Navega al perfil, abre DM en URL real /direct/t/, escribe y envía.
    Envía el texto primero y los links después para que ambas burbujas
    sean visibles en la app móvil.
    Retorna (sent, error).
    """

    # Cerrar pestañas /direct/ previas
    current = driver.current_window_handle
    for h in list(driver.window_handles):
        if h == current:
            continue
        driver.switch_to.window(h)
        if "/direct/" in driver.current_url:
            driver.close()
    driver.switch_to.window(current)

    # ── Paso 1: Intentar abrir DM desde el perfil ──────────────
    logger.info("  Navegando a %s", profile_url)
    driver.get(profile_url)
    # Espera variable — simula tiempo de carga real
    time.sleep(random.uniform(3.5, 6.0))

    # Detectar perfil no disponible (página 404 / eliminada / suspendida)
    page_error = driver.execute_script("""
        var body = document.body.innerText || '';
        return body.includes("Sorry, this page") ||
               body.includes("Lo sentimos, esta página") ||
               body.includes("isn't available") ||
               body.includes("no está disponible");
    """)
    if page_error:
        return False, "Perfil no disponible (eliminado o suspendido)"

    # URL sanity check — si no llegamos al perfil correcto, saltar
    current_url = driver.current_url
    if username.lower() not in current_url.lower() and "/profile.php" in current_url:
        return False, f"URL inesperada al cargar perfil: {current_url[:60]}"

    # Scroll leve en el perfil antes de interactuar
    human_scroll(driver, times=random.randint(1, 2))
    human_pause(0.5, 1.5)

    msg_btn = None
    for xpath in [
        "//div[@role='button'][.//div[text()='Message']]",
        "//div[@role='button'][.//div[text()='Mensaje']]",
        "//button[normalize-space(text())='Message']",
        "//button[normalize-space(text())='Mensaje']",
    ]:
        els = driver.find_elements(By.XPATH, xpath)
        if els:
            msg_btn = els[0]
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

    if not msg_btn:
        return False, "Botón Message no encontrado (cuenta privada o restringida)"

    human_mouse_move(driver, msg_btnP)
    human_pause(0.3, 0.8)
    msg_btn.click()
    time.sleep(random.uniform(4.5, 7.0))

    # ── Paso 2: Verificar si llegamos a hilo real ──────────────
    on_real_thread = False
    for h in list(driver.window_handles):
        try:
            driver.switch_to.window(h)
            if "/direct/t/" in driver.current_url:
                on_real_thread = True
                break
        except Exception:
            pass

    # ── Paso 3: Si no hay hilo real, usar /direct/new/ ─────────
    if not on_real_thread:
        logger.info("  Chat abrió como panel — forzando hilo real via /direct/new/")
        ok = open_dm_via_new(driver, username, logger)
        if not ok:
            return False, "No se pudo abrir hilo DM real (/direct/t/)"

    # ── Paso 4: Construir mensaje y dividirlo ──────────────────
    dummy = ExtractionResult(
        visible_name=username,
        username=username,
        url=profile_url,
        timestamp=datetime.now().isoformat(),
        confidence=1.0,
        selector_used="mass_flow",
    )
    full_message = MessageBuilder().build(dummy)

    # Separar texto de links: dividir por "Acá te dejo" / "Here are the links"
    split_markers = ["Acá te dejo los enlaces", "Here are the links:"]
    text_part = full_message
    links_part = None
    for marker in split_markers:
        if marker in full_message:
            idx = full_message.index(marker)
            text_part = full_message[:idx].rstrip()
            links_part = full_message[idx:].strip()
            break

    # ── Paso 5: Enviar texto principal ────────────────────────
    try:
        tb = _find_textbox(driver)
    except Exception:
        return False, "Textbox no encontrado en el hilo DM"

    sent_text = _paste_and_send(driver, tb, text_part, logger)
    if not sent_text:
        return False, "No se pudo enviar la parte de texto del mensaje"
    logger.info("  ✓ Texto enviado")

    # ── Paso 6: Enviar links como segundo mensaje ─────────────
    if links_part:
        time.sleep(1.5)
        try:
            tb2 = _find_textbox(driver)
            _paste_and_send(driver, tb2, links_part, logger)
            logger.info("  ✓ Links enviados")
        except Exception as e:
            logger.warning("  ⚠ Links no enviados: %s", e)
            # No es error fatal — el texto principal ya se envió

    return True, ""


# ── Countdown visible ─────────────────────────────────────────
def countdown(seconds: int, logger, interval: int = 30):
    remaining = seconds
    while remaining > 0:
        chunk = min(interval, remaining)
        time.sleep(chunk)
        remaining -= chunk
        if remaining > 0:
            logger.info("  ⏳ %dm %ds restantes...", remaining // 60, remaining % 60)


# ── Main ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=999, help="Máximo de mensajes por sesión")
    parser.add_argument("--delay", type=int, default=0, help="Delay fijo en segundos (0=aleatorio)")
    args = parser.parse_args()

    config = get_config("config.json")
    logger = setup_logging(config.artifacts_dir)

    logger.info("=" * 60)
    logger.info("  ENVÍO MASIVO — mass_follow_and_send.py")
    logger.info("  Límite sesión: %d | Delay: %s",
                args.limit, f"{args.delay}s" if args.delay else f"{DELAY_MIN}-{DELAY_MAX}s")
    logger.info("=" * 60)

    done = load_done()
    skip = done | {OWN_ACCOUNT, "93_stalin"}
    logger.info("Ya enviados anteriormente: %d", len(done))

    browser = Browser(config)
    driver = browser.start()

    total_sent = 0
    total_failed = 0
    total_skipped = 0
    session_count = 0

    try:
        # Activar modo DM
        logger.info("Activando modo DM (inbox)...")
        driver.get("https://www.instagram.com/direct/inbox/")
        time.sleep(4)

        # Ir al perfil propio
        logger.info("Navegando al perfil propio...")
        driver.get(f"https://www.instagram.com/{OWN_ACCOUNT}/?hl=en")
        time.sleep(5)

        # Abrir modal de seguidores
        if not open_followers_modal(driver, logger):
            logger.error("No se pudo abrir el modal de seguidores.")
            return

        scroll_count = 0
        consecutive_no_target = 0

        while session_count < args.limit:
            # Buscar siguiente target
            target_info = get_next_unfollowed(driver, done, skip)

            if target_info.get("error"):
                err = target_info["error"]
                btns = target_info.get("count", 0)
                logger.info("Sin targets disponibles (%s, btns=%d) — scrolleando modal...",
                            err, btns)
                scroll_followers_modal(driver)
                scroll_count += 1
                consecutive_no_target += 1

                if consecutive_no_target >= 10:
                    logger.info("Ningún nuevo target después de 10 scrolls — terminando.")
                    break
                continue

            consecutive_no_target = 0
            username = target_info["username"]
            profile_url = target_info["url"]

            if username in skip:
                skip.add(username)
                continue

            logger.info("")
            logger.info("─" * 50)
            logger.info("[%d] @%s", session_count + 1, username)

            # Follow en el modal — con pausa humana previa
            human_pause(0.8, 2.0)
            followed = follow_in_modal(driver, username)
            if followed:
                logger.info("  ✓ Follow realizado")
            else:
                logger.warning("  ⚠ Follow falló — continuando igual")
            skip.add(username)  # no intentar de nuevo en esta sesión
            # Pausa post-follow variable
            time.sleep(random.uniform(2.5, 5.0))

            # Enviar DM
            sent, error = send_dm(driver, username, profile_url, logger)

            if sent:
                total_sent += 1
                session_count += 1
                logger.info("  ✓ MENSAJE ENVIADO a @%s", username)
                save_result(username, True)
                done.add(username)
                ss(driver, f"sent_{username[:20]}")
            else:
                total_failed += 1
                logger.warning("  ✗ FALLO @%s — %s", username, error)
                # Marcar como done también los fallos por cuenta privada/restringida
                # para no perder tiempo reintentando los que nunca van a funcionar
                if "privada" in error or "restringida" in error or "Message" in error:
                    done.add(username)
                save_result(username, False, error)

            # Volver al modal y al perfil propio para continuar
            logger.info("  Volviendo al modal de seguidores...")
            current = driver.current_window_handle
            for h in list(driver.window_handles):
                if h == current:
                    continue
                try:
                    driver.switch_to.window(h)
                    if "/direct/" in driver.current_url:
                        driver.close()
                except Exception:
                    pass
            driver.switch_to.window(current)

            # Pausa anti-ban PRIMERO (antes de navegar — el modal se pierde igual)
            if session_count < args.limit:
                delay = args.delay if args.delay else random.randint(DELAY_MIN, DELAY_MAX)

                if total_sent > 0 and total_sent % BATCH_SIZE == 0:
                    pause = random.randint(*BATCH_PAUSE)
                    logger.info("")
                    logger.info("━" * 50)
                    logger.info("  PAUSA ENTRE TANDAS: %.0f minutos", pause / 60)
                    logger.info("  Enviados hasta ahora: %d", total_sent)
                    logger.info("━" * 50)
                    countdown(pause, logger)
                else:
                    logger.info("  Esperando %ds antes del siguiente...", delay)
                    countdown(delay, logger)

            # Después de la pausa: reabrir el perfil + modal con reintentos
            logger.info("  Reabriendo perfil y modal...")
            human_pause(1.0, 2.0)
            driver.get(f"https://www.instagram.com/{OWN_ACCOUNT}/?hl=en")
            time.sleep(random.uniform(4.0, 6.0))

            # Reintentar abrir el modal hasta 3 veces
            modal_ok = False
            for attempt in range(3):
                if open_followers_modal(driver, logger):
                    modal_ok = True
                    break
                logger.warning("  Modal no abrió (intento %d/3) — recargando...", attempt + 1)
                driver.refresh()
                time.sleep(random.uniform(3.0, 5.0))

            if not modal_ok:
                logger.error("  No se pudo reabrir el modal tras 3 intentos — terminando sesión.")
                break

            # Scroll para aproximarse a donde estábamos
            for _ in range(min(scroll_count, 8)):
                scroll_followers_modal(driver)

    except KeyboardInterrupt:
        logger.info("Interrumpido por el usuario.")
    except Exception as e:
        logger.error("ERROR INESPERADO: %s", e)
        traceback.print_exc()
        ss(driver, "mass_exception")
    finally:
        browser.stop()

    logger.info("")
    logger.info("=" * 60)
    logger.info("  SESIÓN TERMINADA")
    logger.info("  ✓ Enviados  : %d", total_sent)
    logger.info("  ✗ Fallidos  : %d", total_failed)
    logger.info("  Progreso    : %s", PROGRESS_FILE)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
