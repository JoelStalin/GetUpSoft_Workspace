"""
sender.py — Send a DM on Instagram or Facebook via Selenium.

Strategy for Lexical/contenteditable editors (Instagram, Facebook):
  - Click Message button on profile page
  - Focus the text composer
  - Inject text via clipboard (Ctrl+V) — most reliable for React/Lexical
  - Fallback: document.execCommand('insertText')
  - Click Send button
  - Verify sent
"""

from __future__ import annotations
import logging
import time
import pyperclip
from typing import Optional

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, ElementNotInteractableException
)

from bot.utils.screenshots import take_screenshot
from bot.utils.waits import step_pause

log = logging.getLogger("bot")

# ---------------------------------------------------------------------------
# Instagram selectors
# ---------------------------------------------------------------------------
IG_MESSAGE_BTN = [
    "div[role='button'] div:contains('Message')",   # text-based (via JS)
    "//div[@role='button'][.//div[text()='Message']]",   # XPath
    "//div[@role='button'][.//div[text()='Mensaje']]",   # XPath ES
    "//a[contains(@href,'/direct/')]",
]

IG_COMPOSER = [
    "div[role='textbox'][aria-label]",
    "div[data-lexical-editor='true']",
    "div[contenteditable='true']",
    "textarea[placeholder*='essage']",
    "textarea[placeholder*='Mensaje']",
]

IG_SEND_BTN = [
    "//div[@role='button'][.//div[text()='Send']]",
    "//div[@role='button'][.//div[text()='Enviar']]",
    "//button[@type='button'][.//div[text()='Send']]",
    "div[role='button'][aria-label*='Send']",
    "div[role='button'][aria-label*='Enviar']",
]

# ---------------------------------------------------------------------------
# Facebook selectors
# ---------------------------------------------------------------------------
FB_MESSAGE_BTN = [
    "//a[contains(@href,'messenger') and contains(@aria-label,'Message')]",
    "//div[@role='button'][contains(.,'Message')]",
    "//div[@role='button'][contains(.,'Mensaje')]",
    "//span[text()='Message']/ancestor::div[@role='button']",
]

FB_COMPOSER = [
    "div[role='textbox'][aria-label*='message' i]",
    "div[role='textbox'][aria-label*='mensaje' i]",
    "div[contenteditable='true'][data-lexical-editor]",
    "div[contenteditable='true']",
]

FB_SEND_BTN = [
    "div[aria-label='Press Enter to send'][role='button']",
    "//div[@aria-label='Send'][contains(@role,'button')]",
    "//div[@aria-label='Enviar'][contains(@role,'button')]",
    "button[type='submit']",
]


def _find_by_xpath(driver: WebDriver, xpaths: list[str], timeout: int = 8):
    for xpath in xpaths:
        try:
            el = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, xpath))
            )
            if el:
                return el
        except (TimeoutException, Exception):
            continue
    return None


def _find_by_css(driver: WebDriver, selectors: list[str], timeout: int = 8):
    for sel in selectors:
        try:
            el = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, sel))
            )
            if el and el.is_displayed():
                return el
        except (TimeoutException, Exception):
            continue
    return None


def _type_in_composer(driver: WebDriver, element, message: str) -> bool:
    """
    Type text into a Lexical/contenteditable composer using clipboard paste.
    Falls back to execCommand if clipboard fails.
    """
    try:
        element.click()
        time.sleep(0.8)

        # Method 1: clipboard paste (most reliable for Lexical/React)
        try:
            pyperclip.copy(message)
            element.send_keys(Keys.CONTROL, 'v')
            time.sleep(1.0)
            # Check if text landed
            content = element.text or driver.execute_script(
                "return arguments[0].innerText;", element
            )
            if content and len(content.strip()) > 10:
                log.passed("Text injected via clipboard paste")
                return True
        except Exception as e:
            log.debug("Clipboard method failed: %s", e)

        # Method 2: execCommand insertText
        try:
            driver.execute_script(
                "arguments[0].focus();"
                "document.execCommand('selectAll', false, null);"
                "document.execCommand('insertText', false, arguments[1]);",
                element, message
            )
            time.sleep(0.8)
            content = element.text or driver.execute_script(
                "return arguments[0].innerText;", element
            )
            if content and len(content.strip()) > 10:
                log.passed("Text injected via execCommand")
                return True
        except Exception as e:
            log.debug("execCommand method failed: %s", e)

        # Method 3: ActionChains send_keys character by character (slow but reliable)
        try:
            driver.execute_script("arguments[0].focus();", element)
            ActionChains(driver).click(element).send_keys(message).perform()
            time.sleep(0.8)
            log.passed("Text injected via ActionChains")
            return True
        except Exception as e:
            log.debug("ActionChains method failed: %s", e)

        return False

    except Exception as exc:
        log.error("Could not type in composer: %s", exc)
        return False


def _close_ig_modal(driver: WebDriver) -> bool:
    """
    Close Instagram's signup/login modal if present.
    Instagram places aria-label='Close' on the SVG inside a div[role='button'],
    so we search the ancestor div.
    """
    # Try up to 3 times in case Instagram re-opens the modal
    for attempt in range(3):
        try:
            # Find the div that contains a Close SVG
            closed = driver.execute_script("""
                // Find any button-like element containing an SVG with aria-label Close
                var xpaths = [
                    ".//div[@role='button'][.//*[@aria-label='Close']]",
                    ".//button[.//*[@aria-label='Close']]",
                    ".//*[@aria-label='Close']"
                ];
                var res = null;
                for (var x of xpaths) {
                    try {
                        var found = document.evaluate(
                            x, document, null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE, null
                        ).singleNodeValue;
                        if (found && found.offsetParent !== null) { res = found; break; }
                    } catch(e) {}
                }
                if (res) { res.click(); return true; }
                return false;
            """)
            if closed:
                time.sleep(1.5)
                # Verify modal is gone
                modal_gone = driver.execute_script("""
                    return !document.querySelector(
                        "div[role='dialog'], div[class*='modal'], div[class*='Modal']"
                    );
                """)
                if modal_gone:
                    log.info("Instagram modal closed successfully")
                    return True
                # Modal still there — try ESC
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                time.sleep(1)
        except Exception as e:
            log.debug("Modal close attempt %d failed: %s", attempt + 1, e)

        # Fallback: ESC key
        try:
            driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
            time.sleep(1)
        except Exception:
            pass

    return False


def _check_ig_logged_in(driver: WebDriver) -> bool:
    """
    Return True only if Instagram shows clear logged-in indicators.
    Uses multiple signals to avoid false positives.
    """
    try:
        # Signal 1: Direct inbox link (only visible when logged in)
        inbox = driver.find_elements(By.CSS_SELECTOR, "a[href='/direct/inbox/']")
        if inbox:
            return True

        # Signal 2: "New post" button or profile nav icon
        new_post = driver.find_elements(By.CSS_SELECTOR,
            "svg[aria-label='New post'], a[href='/accounts/activity/']"
        )
        if new_post:
            return True

        # Signal 3: Check via JavaScript — Instagram stores viewer info in localStorage
        viewer = driver.execute_script("""
            try {
                // Modern Instagram stores session in a cookie or meta tag
                var metas = document.querySelectorAll('meta');
                for (var m of metas) {
                    if (m.name === 'instagram:user' || m.name === 'user_id') return true;
                }
                // Check for logged-in nav elements
                var nav = document.querySelector('nav');
                if (!nav) return false;
                // Logged-in users see "Home", "Search", "Explore", "Reels", "Messages", "Notifications", "Profile"
                var navLinks = nav.querySelectorAll('a');
                return navLinks.length >= 5;
            } catch(e) { return false; }
        """)
        if viewer:
            return True

        # Signal 4: No signup/login form present
        login_form = driver.find_elements(By.CSS_SELECTOR,
            "input[name='username'], form[action*='login'], #loginForm"
        )
        signup_modal = driver.find_elements(By.XPATH,
            "//button[contains(text(),'Sign up')] | //a[contains(text(),'Sign up')]"
        )
        if not login_form and not signup_modal:
            # Ambiguous — check nav link count
            nav_links = driver.find_elements(By.CSS_SELECTOR, "nav a, nav [role='link']")
            return len(nav_links) >= 4

        return False
    except Exception:
        return False


def send_instagram_dm(
    driver: WebDriver,
    profile_url: str,
    message: str,
    artifacts_dir,
    step_delay_ms: int = 1500,
    dry_run: bool = False,
) -> dict:
    """
    Navigate to an Instagram profile, open DM, type message, send.
    Returns dict with result info.
    """
    result = {"sent": False, "error": None, "screenshot": None}

    # --- Check login status via direct inbox (most reliable) ---
    log.step("Checking Instagram login status")
    driver.get("https://www.instagram.com/direct/inbox/")
    time.sleep(4)
    # If we got redirected to login, we're not logged in
    current = driver.current_url
    logged_in = "direct/inbox" in current or "instagram.com/direct" in current

    if not logged_in:
        take_screenshot(driver, artifacts_dir, "ig_not_logged_in")
        log.warning(
            "\n" + "=" * 60 +
            "\n  Instagram: NO HAY SESION ACTIVA en este perfil de Chrome." +
            "\n  Por favor inicia sesion manualmente en la ventana de Chrome" +
            "\n  que esta abierta ahora, luego el bot continuara automaticamente." +
            "\n  Esperando hasta 3 minutos..." +
            "\n" + "=" * 60
        )
        # Navigate to login page to make it easy
        driver.get("https://www.instagram.com/accounts/login/")
        time.sleep(2)
        # Wait up to 3 minutes for manual login
        for i in range(36):
            time.sleep(5)
            if _check_ig_logged_in(driver):
                log.passed("Login detectado — continuando con el proceso")
                logged_in = True
                break
            if i % 6 == 5:
                mins_left = ((36 - i - 1) * 5) // 60
                log.info("Esperando login manual... %d min restantes", mins_left)
        if not logged_in:
            result["error"] = (
                "No se detectó sesión de Instagram. "
                "Inicia sesión manualmente en Chrome y vuelve a correr el bot."
            )
            return result
    else:
        log.passed("Instagram session activa — continuando")

    log.step("Navigating to Instagram profile: %s", profile_url)
    driver.get(profile_url)
    time.sleep(3)

    # Close any modal that pops up
    _close_ig_modal(driver)
    time.sleep(1)

    step_pause(step_delay_ms)

    shot = take_screenshot(driver, artifacts_dir, "ig_profile")
    result["screenshot"] = shot

    # --- Click Message button ---
    log.step("Looking for Message button")
    msg_btn = _find_by_xpath(driver, IG_MESSAGE_BTN[1:3], timeout=10)

    if not msg_btn:
        # Comprehensive JS search for Message button
        try:
            msg_btn = driver.execute_script("""
                var candidates = document.querySelectorAll(
                  "div[role='button'], button, a[role='button'], [role='button']"
                );
                for (var b of candidates) {
                    var t = (b.innerText || b.textContent || '').trim();
                    if (t === 'Message' || t === 'Mensaje' ||
                        t === 'Send message' || t === 'Enviar mensaje' ||
                        t === 'Message this account') {
                        // Make sure it's visible
                        var rect = b.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) return b;
                    }
                }
                // Check aria-label
                var all = document.querySelectorAll("[aria-label]");
                for (var el of all) {
                    var label = (el.getAttribute('aria-label') || '').toLowerCase();
                    if ((label === 'message' || label === 'send message' ||
                         label === 'mensaje' || label === 'enviar mensaje') &&
                        el.getBoundingClientRect().width > 0) {
                        return el;
                    }
                }
                return null;
            """)
        except Exception:
            pass

    if not msg_btn:
        result["error"] = "Message button not found on profile page"
        log.failed(result["error"])
        return result

    try:
        driver.execute_script("arguments[0].scrollIntoView(true);", msg_btn)
        time.sleep(0.5)
        msg_btn.click()
        log.passed("Message button clicked")
    except Exception as exc:
        result["error"] = f"Could not click Message button: {exc}"
        log.failed(result["error"])
        return result

    time.sleep(3)
    step_pause(step_delay_ms)
    take_screenshot(driver, artifacts_dir, "ig_dm_opened")

    # --- Find composer ---
    log.step("Looking for DM text composer")
    composer = _find_by_css(driver, IG_COMPOSER, timeout=12)

    if not composer:
        result["error"] = "DM composer not found"
        log.failed(result["error"])
        return result

    log.passed("DM composer found: %s", composer.tag_name)

    # Highlight composer
    driver.execute_script(
        "arguments[0].style.outline='3px solid #FF6B00';", composer
    )
    time.sleep(0.5)

    # --- Type message ---
    log.step("Typing draft message into composer")
    typed = _type_in_composer(driver, composer, message)

    if not typed:
        result["error"] = "Could not inject text into composer"
        log.failed(result["error"])
        return result

    time.sleep(1)
    take_screenshot(driver, artifacts_dir, "ig_message_typed")
    step_pause(step_delay_ms)

    # --- Click Send ---
    log.step("Looking for Send button")
    send_btn = _find_by_xpath(driver, IG_SEND_BTN[:2], timeout=8)

    if not send_btn:
        # Try by CSS
        send_btn = _find_by_css(driver, IG_SEND_BTN[2:], timeout=5)

    if not send_btn:
        # Last resort: look for button with aria-label containing send
        try:
            send_btn = driver.execute_script("""
                var btns = document.querySelectorAll("div[role='button'], button");
                for (var b of btns) {
                    var label = (b.getAttribute('aria-label') || '').toLowerCase();
                    var text  = b.innerText.trim().toLowerCase();
                    if (label.includes('send') || label.includes('enviar') ||
                        text === 'send' || text === 'enviar') return b;
                }
                return null;
            """)
        except Exception:
            pass

    if not send_btn:
        result["error"] = "Send button not found — message typed but not sent"
        log.warning(result["error"])
        take_screenshot(driver, artifacts_dir, "ig_send_btn_missing")
        return result

    if dry_run:
        log.info("Dry run enabled — skipping final Send click for Instagram")
        result["sent"] = False
        result["detail"] = "Message typed, skipped sending due to dry_run"
        return result

    try:
        driver.execute_script("arguments[0].style.outline='3px solid #00AA00';", send_btn)
        time.sleep(0.5)
        send_btn.click()
        log.passed("Send button clicked — message sent!")
        time.sleep(2)
        take_screenshot(driver, artifacts_dir, "ig_message_sent")
        result["sent"] = True
    except Exception as exc:
        result["error"] = f"Send button click failed: {exc}"
        log.failed(result["error"])

    return result


def send_facebook_dm(
    driver: WebDriver,
    profile_url: str,
    message: str,
    artifacts_dir,
    step_delay_ms: int = 1500,
    dry_run: bool = False,
) -> dict:
    """
    Navigate to a Facebook profile/page, open Messenger, type and send message.
    """
    result = {"sent": False, "error": None, "screenshot": None}

    log.step("Navigating to Facebook profile: %s", profile_url)
    driver.get(profile_url)
    time.sleep(3)
    step_pause(step_delay_ms)

    shot = take_screenshot(driver, artifacts_dir, "fb_profile")
    result["screenshot"] = shot

    # --- Click Message button ---
    log.step("Looking for Message button on Facebook")
    msg_btn = _find_by_xpath(driver, FB_MESSAGE_BTN, timeout=10)

    if not msg_btn:
        try:
            msg_btn = driver.execute_script("""
                var btns = document.querySelectorAll("div[role='button'], a[role='button']");
                for (var b of btns) {
                    var text = b.innerText.trim().toLowerCase();
                    if (text === 'message' || text === 'mensaje' || text.includes('send message')) return b;
                }
                return null;
            """)
        except Exception:
            pass

    if not msg_btn:
        result["error"] = "Message button not found on Facebook profile"
        log.failed(result["error"])
        return result

    try:
        driver.execute_script("arguments[0].scrollIntoView(true);", msg_btn)
        time.sleep(0.5)
        msg_btn.click()
        log.passed("Facebook Message button clicked")
    except Exception as exc:
        result["error"] = f"Could not click Message button: {exc}"
        log.failed(result["error"])
        return result

    time.sleep(3)
    step_pause(step_delay_ms)
    take_screenshot(driver, artifacts_dir, "fb_messenger_opened")

    # --- Find composer ---
    log.step("Looking for Messenger text composer")
    composer = _find_by_css(driver, FB_COMPOSER, timeout=12)

    if not composer:
        result["error"] = "Facebook Messenger composer not found"
        log.failed(result["error"])
        return result

    log.passed("Messenger composer found")
    driver.execute_script("arguments[0].style.outline='3px solid #FF6B00';", composer)
    time.sleep(0.5)

    # --- Type message ---
    log.step("Typing message into Facebook Messenger")
    typed = _type_in_composer(driver, composer, message)

    if not typed:
        result["error"] = "Could not inject text into Facebook composer"
        log.failed(result["error"])
        return result

    time.sleep(1)
    take_screenshot(driver, artifacts_dir, "fb_message_typed")
    step_pause(step_delay_ms)

    # --- Send ---
    log.step("Looking for Send button in Messenger")
    send_btn = _find_by_xpath(driver, FB_SEND_BTN[:2], timeout=8)

    if not send_btn:
        send_btn = _find_by_css(driver, FB_SEND_BTN[2:], timeout=5)

    if not send_btn:
        try:
            # Try pressing Enter in the composer
            composer.send_keys(Keys.ENTER)
            log.passed("Message sent via Enter key")
            time.sleep(2)
            take_screenshot(driver, artifacts_dir, "fb_message_sent")
            result["sent"] = True
            return result
        except Exception:
            pass

        result["error"] = "Facebook Send button not found"
        log.warning(result["error"])
        return result

    if dry_run:
        log.info("Dry run enabled — skipping final Send click for Facebook")
        result["sent"] = False
        result["detail"] = "Message typed, skipped sending due to dry_run"
        return result

    try:
        driver.execute_script("arguments[0].style.outline='3px solid #00AA00';", send_btn)
        time.sleep(0.5)
        send_btn.click()
        log.passed("Facebook message sent!")
        time.sleep(2)
        take_screenshot(driver, artifacts_dir, "fb_message_sent")
        result["sent"] = True
    except Exception as exc:
        result["error"] = f"Facebook Send failed: {exc}"
        log.failed(result["error"])

    return result
