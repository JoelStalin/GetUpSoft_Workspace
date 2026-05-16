"""
extract_followers.py — Extrae seguidores de Instagram y amigos de Facebook,
y los guarda en targets_mass.json para el envío masivo.

USO:
    python extract_followers.py                          # extrae 50 seguidores de IG
    python extract_followers.py --limit 200              # hasta 200
    python extract_followers.py --platform facebook      # amigos de FB
    python extract_followers.py --platform both          # IG + FB

REQUISITOS:
  - Chrome corriendo con --remote-debugging-port=9222
  - Sesión activa de IG / FB
"""
from __future__ import annotations

import argparse
import json
import time
import logging
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from bot.config import get_config
from bot.browser import Browser
from bot.extractors import Extractor
from bot.utils.logging_setup import setup_logging

OUTPUT_FILE = "targets_mass.json"


def extract_ig_followers(driver, ig_username: str, limit: int = 100) -> list[dict]:
    """Navega a /followers/ y extrae usernames."""
    logger = logging.getLogger("insta_bot")
    url = f"https://www.instagram.com/{ig_username}/followers/"
    logger.info("Extrayendo seguidores desde: %s (límite: %d)", url, limit)
    driver.get(url)
    time.sleep(5)

    followers = []
    seen = set()
    scroll_attempts = 0
    max_scroll = limit // 5 + 20

    while len(followers) < limit and scroll_attempts < max_scroll:
        # Extraer links de perfil del modal de seguidores
        links = driver.find_elements(By.XPATH,
            "//div[@role='dialog']//a[contains(@href,'/') and not(contains(@href,'#'))]"
        )
        for link in links:
            href = link.get_attribute("href") or ""
            if "instagram.com/" in href:
                parts = href.rstrip("/").split("/")
                uname = parts[-1] if parts else ""
                if uname and uname not in seen and uname != ig_username:
                    seen.add(uname)
                    followers.append({
                        "username": uname,
                        "platform": "instagram",
                        "nombre": None,
                        "url": f"https://www.instagram.com/{uname}/"
                    })

        # Scroll dentro del modal
        try:
            modal = driver.find_element(By.XPATH, "//div[@role='dialog']//div[contains(@style,'overflow')]")
            driver.execute_script("arguments[0].scrollTop += 500", modal)
        except Exception:
            # Fallback: scroll general
            driver.execute_script("window.scrollBy(0, 500)")
        time.sleep(1.5)
        scroll_attempts += 1

        if scroll_attempts % 10 == 0:
            logger.info("  Progreso IG: %d/%d extraídos...", len(followers), limit)

    logger.info("Instagram: %d seguidores extraídos", len(followers))
    return followers[:limit]


def extract_fb_friends(driver, limit: int = 100) -> list[dict]:
    """Extrae amigos de Facebook desde /friends/."""
    logger = logging.getLogger("insta_bot")
    url = "https://www.facebook.com/friends/"
    logger.info("Extrayendo amigos de Facebook (límite: %d)", limit)
    driver.get(url)
    time.sleep(5)

    friends = []
    seen = set()
    scroll_attempts = 0
    max_scroll = limit // 3 + 20

    while len(friends) < limit and scroll_attempts < max_scroll:
        # Buscar tarjetas de amigos con enlace al perfil
        links = driver.find_elements(By.XPATH,
            "//a[contains(@href,'facebook.com/') or starts-with(@href,'/')][@aria-label]"
        )
        for link in links:
            href = link.get_attribute("href") or ""
            label = link.get_attribute("aria-label") or ""
            # Filtrar perfiles reales (no páginas de FB)
            if "facebook.com/" in href and "/friends" not in href and "profile.php" not in href:
                parts = href.rstrip("/").split("/")
                uname = parts[-1] if parts else ""
                if uname and len(uname) > 2 and uname not in seen and uname not in ("friends","messages","marketplace"):
                    seen.add(uname)
                    nombre = label.strip() if label else None
                    friends.append({
                        "username": uname,
                        "platform": "facebook",
                        "nombre": nombre.split()[0] if nombre else None,
                        "url": href if href.startswith("http") else f"https://www.facebook.com{href}"
                    })

        driver.execute_script("window.scrollBy(0, 800)")
        time.sleep(2)
        scroll_attempts += 1

        if scroll_attempts % 10 == 0:
            logger.info("  Progreso FB: %d/%d extraídos...", len(friends), limit)

    logger.info("Facebook: %d amigos extraídos", len(friends))
    return friends[:limit]


def load_existing(path: str) -> tuple[list[dict], set[str]]:
    p = Path(path)
    if not p.exists():
        return [], set()
    data = json.load(open(p, encoding="utf-8"))
    existing_keys = {f"{t['platform']}:{t['username']}" for t in data}
    return data, existing_keys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=100, help="Máximo de targets a extraer")
    parser.add_argument("--platform", choices=["instagram", "facebook", "both"], default="instagram")
    parser.add_argument("--ig-user", default="galantesjewelrybythesea", help="Tu cuenta de Instagram")
    parser.add_argument("--output", default=OUTPUT_FILE)
    args = parser.parse_args()

    config = get_config("config.json")
    logger = setup_logging(config.artifacts_dir)

    logger.info("=" * 50)
    logger.info("  EXTRACTOR DE SEGUIDORES/AMIGOS")
    logger.info("  Platform: %s | Límite: %d", args.platform, args.limit)
    logger.info("=" * 50)

    browser = Browser(config)
    driver = browser.start()

    new_targets = []

    try:
        if args.platform in ("instagram", "both"):
            ig = extract_ig_followers(driver, args.ig_user, args.limit)
            new_targets.extend(ig)

        if args.platform in ("facebook", "both"):
            fb = extract_fb_friends(driver, args.limit)
            new_targets.extend(fb)

    finally:
        browser.stop()

    # Merge con existentes (sin duplicados)
    existing, existing_keys = load_existing(args.output)
    added = 0
    for t in new_targets:
        key = f"{t['platform']}:{t['username']}"
        if key not in existing_keys:
            existing.append(t)
            existing_keys.add(key)
            added += 1

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    logger.info("")
    logger.info("=" * 50)
    logger.info("  EXTRACCIÓN COMPLETA")
    logger.info("  Nuevos targets: %d", added)
    logger.info("  Total en %s: %d", args.output, len(existing))
    logger.info("  Ahora ejecuta: python run_mass.py")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
