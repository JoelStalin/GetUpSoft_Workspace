"""
run_mass.py — Envío masivo de DMs usando el flujo confirmado de bot/main.py.

USO:
    python run_mass.py                        # usa targets_mass.json
    python run_mass.py mis_targets.json       # archivo personalizado

FORMATO targets_mass.json:
[
  {"username": "user1", "platform": "instagram", "nombre": "Juan", "url": null},
  {"username": "user2", "platform": "facebook",  "nombre": null,   "url": "https://facebook.com/user2/"}
]

REQUISITOS:
  - Chrome corriendo: chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\\selenium\\perfil_bot
  - Sesión activa de Instagram Y Facebook en ese Chrome
  - dry_run: false en config.json para enviar de verdad
"""
from __future__ import annotations

import json
import logging
import random
import sys
import time
from datetime import datetime
from pathlib import Path

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

# ── Config ─────────────────────────────────────────────────────
TARGETS_FILE  = sys.argv[1] if len(sys.argv) > 1 else "targets_mass.json"
CONFIG_FILE   = "config.json"
DELAY_MIN_S   = 60     # pausa mínima entre mensajes (segundos)
DELAY_MAX_S   = 120    # pausa máxima entre mensajes
BATCH_SIZE    = 10     # mensajes por tanda
BATCH_PAUSE_S = (1800, 2400)   # 30-40 min entre tandas


def load_targets(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_sent(output_dir: Path) -> set[str]:
    """Usuarios ya enviados exitosamente (para no duplicar)."""
    p = output_dir / "batch_progress.json"
    if not p.exists():
        return set()
    try:
        data = json.load(open(p, encoding="utf-8"))
        return {r["username"] for r in data if r.get("sent")}
    except Exception:
        return set()


def save_result(output_dir: Path, entry: dict) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    p = output_dir / "batch_progress.json"
    existing = []
    if p.exists():
        try:
            existing = json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    existing.append(entry)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)


def build_url(t: dict) -> str:
    if t.get("url"):
        return t["url"]
    if t["platform"] == "instagram":
        return f"https://www.instagram.com/{t['username']}/"
    return f"https://www.facebook.com/{t['username']}/"


def send_one(driver, config, target_url: str, logger) -> tuple[bool, str]:
    """
    Ejecuta el flujo completo confirmado de bot/main.py para un target.
    Retorna (sent: bool, message: str).
    """
    artifacts_dir = Path(config.artifacts_dir)
    steps = []

    try:
        # 1. Navegación
        navigator = Navigator(driver, config)
        if not navigator.navigate(target_url):
            return False, "Dominio bloqueado"
        steps.append("Navigation OK")

        # 2. Extracción
        extractor = Extractor(driver)
        result = extractor.extract_all()
        logger.info("  Nombre extraído: %s", result.visible_name)

        # 3. Follow
        probe = InteractionProbe(driver, config)
        probe.follow_user()

        # 4. Mensaje
        builder = MessageBuilder()
        message = builder.build(result)

        # 5. Abrir chat (botón Message)
        msg_xpath = (
            "//*[self::div or self::button]["
            "contains(translate(@aria-label,'MESSAGE','message'),'message') or "
            "contains(translate(@aria-label,'MENSAJE','mensaje'),'mensaje') or "
            "contains(text(),'Message') or contains(text(),'Mensaje') or "
            "contains(text(),'Enviar mensaje')]"
        )
        try:
            wait = WebDriverWait(driver, 15)
            msg_btn = wait.until(EC.element_to_be_clickable((By.XPATH, msg_xpath)))
            msg_btn.click()
            time.sleep(5)
        except Exception as e:
            return False, f"Botón Message no encontrado: {e}"

        # 6. Escribir y enviar
        if not probe.probe_and_prepare(message):
            return False, "Textbox no encontrado"

        probe.type_message(message)
        time.sleep(1)

        if config.dry_run:
            return False, "dry_run=True — no enviado"

        sent = probe.click_send()
        if sent:
            return True, "Mensaje enviado"
        else:
            return False, "click_send retornó False"

    except Exception as e:
        take_screenshot(driver, Path(config.artifacts_dir), "mass_error")
        return False, str(e)


def run():
    config = get_config(CONFIG_FILE)
    logger = setup_logging(config.artifacts_dir)
    output_dir = Path(config.output_dir)

    logger.info("=" * 60)
    logger.info("  ENVÍO MASIVO — run_mass.py")
    logger.info("  Targets: %s  |  dry_run: %s", TARGETS_FILE, config.dry_run)
    logger.info("=" * 60)

    all_targets = load_targets(TARGETS_FILE)
    done = load_sent(output_dir)
    pending = [t for t in all_targets if t["username"] not in done]

    logger.info("Total: %d | Ya enviados: %d | Pendientes: %d",
                len(all_targets), len(done), len(pending))

    if not pending:
        logger.info("Todos los targets ya procesados.")
        return

    browser = Browser(config)
    driver = browser.start()
    total_sent = 0
    total_failed = 0

    try:
        for batch_num, batch_start in enumerate(range(0, len(pending), BATCH_SIZE), start=1):
            batch = pending[batch_start:batch_start + BATCH_SIZE]
            logger.info("")
            logger.info("━" * 60)
            logger.info("  TANDA %d — %d targets", batch_num, len(batch))
            logger.info("━" * 60)

            for idx, t in enumerate(batch, start=1):
                username = t["username"]
                platform = t.get("platform", "instagram")
                url = build_url(t)

                logger.info("")
                logger.info("  [%d/%d] @%s (%s)",
                            batch_start + idx, len(pending), username, platform)

                sent, msg = send_one(driver, config, url, logger)

                status_str = "✓ ENVIADO" if sent else f"✗ FALLO ({msg})"
                logger.info("  → %s", status_str)

                if sent:
                    total_sent += 1
                else:
                    total_failed += 1

                save_result(output_dir, {
                    "username": username,
                    "platform": platform,
                    "sent": sent,
                    "error": None if sent else msg,
                    "timestamp": datetime.now().isoformat(),
                })

                # Pausa anti-ban entre mensajes
                if idx < len(batch):
                    delay = random.uniform(DELAY_MIN_S, DELAY_MAX_S)
                    logger.info("  Esperando %.0fs...", delay)
                    _countdown(int(delay), logger)

            # Pausa entre tandas
            if batch_start + BATCH_SIZE < len(pending):
                pause = random.uniform(*BATCH_PAUSE_S)
                logger.info("")
                logger.info("PAUSA ENTRE TANDAS: %.0f min", pause / 60)
                _countdown(int(pause), logger)

    finally:
        browser.stop()

    logger.info("")
    logger.info("=" * 60)
    logger.info("  MASIVO TERMINADO")
    logger.info("  ✓ Enviados : %d", total_sent)
    logger.info("  ✗ Fallidos : %d", total_failed)
    logger.info("=" * 60)


def _countdown(seconds: int, logger, interval: int = 30) -> None:
    remaining = seconds
    while remaining > 0:
        chunk = min(interval, remaining)
        time.sleep(chunk)
        remaining -= chunk
        if remaining > 0:
            logger.info("    ⏳ %dm %ds restantes", remaining // 60, remaining % 60)


if __name__ == "__main__":
    run()
