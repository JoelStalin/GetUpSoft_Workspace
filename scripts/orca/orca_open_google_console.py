"""Open Google Cloud Console in a visible Chrome Default-profile session for ORCA OAuth setup.

This helper deliberately does not read credentials, cookies, passwords, one-time codes,
or OAuth tokens. The administrator signs in and edits Google Cloud themselves.
"""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait


GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/apis/dashboard?project=orca-496917"
ORCA_OAUTH_URL = "http://127.0.0.1:4173/oauth"


def launch_normal_chrome(target: str, fresh_orca_profile: bool) -> int:
    """Launch user-controlled Chrome without WebDriver.

    Google can reject sign-ins from browser sessions driven by WebDriver. This mode
    intentionally gives control to the user and performs no browser automation.
    """
    candidates = [
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files")) / "Google" / "Chrome" / "Application" / "chrome.exe",
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")) / "Google" / "Chrome" / "Application" / "chrome.exe",
    ]
    chrome = next((path for path in candidates if path.exists()), None)
    if chrome is None:
        print("ERROR: No se encontró Google Chrome.")
        return 2

    command = [str(chrome)]
    if fresh_orca_profile:
        profile_dir = Path(__file__).resolve().parents[1] / "data" / "orca" / "interactive-chrome-profile"
        profile_dir.mkdir(parents=True, exist_ok=True)
        command.append(f"--user-data-dir={profile_dir}")
    command.extend(["--new-window", target])
    subprocess.Popen(command)
    print("Chrome normal abierto. Completa el login y consentimiento manualmente; ORCA no lee sesiones, cookies ni tokens.")
    return 0


def get_driver(profile_cmd: str = "Default", fresh_orca_profile: bool = False):
    options = webdriver.ChromeOptions()
    if fresh_orca_profile:
        user_data_dir = str(Path(__file__).resolve().parents[1] / "data" / "orca" / "selenium-chrome-profile")
        Path(user_data_dir).mkdir(parents=True, exist_ok=True)
    else:
        user_data_dir = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data")
    options.add_argument(f"user-data-dir={user_data_dir}")
    options.add_argument(f"profile-directory={profile_cmd}")
    options.add_argument("--start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    try:
        return webdriver.Chrome(options=options)
    except Exception as error:
        message = str(error).lower()
        if "already in use" in message or "session not created" in message or "chrome instance exited" in message:
            print("ERROR: Chrome está abierto. Ciérralo manualmente y vuelve a ejecutar este script para usar el perfil Default.")
        else:
            print(f"ERROR: no se pudo abrir Chrome: {error}")
        return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--oauth", action="store_true", help="Open ORCA's on-screen Google OAuth flow.")
    parser.add_argument("--profile", default="Default", help="Existing host Chrome profile to use.")
    parser.add_argument("--fresh-orca-profile", action="store_true", help="Create a persistent, visible ORCA-only Chrome profile for a user-initiated login.")
    parser.add_argument("--normal-browser", action="store_true", help="Open normal user-controlled Chrome instead of WebDriver; use this for Google sign-in.")
    args = parser.parse_args()

    target = ORCA_OAUTH_URL if args.oauth else GOOGLE_CONSOLE_URL
    if args.normal_browser:
        return launch_normal_chrome(target, args.fresh_orca_profile)

    driver = get_driver(args.profile, args.fresh_orca_profile)
    if driver is None:
        return 2

    try:
        driver.get(target)
        WebDriverWait(driver, 20).until(lambda browser: browser.current_url.startswith(("http://", "https://")))
        if args.oauth:
            print("ORCA OAuth está abierto. Elige Google, proyecto y usuario; luego completa el login y consentimiento tú mismo.")
            print("La conexión se guardará cifrada por proyecto/usuario; el script no lee sesiones, cookies, contraseñas ni tokens.")
        else:
            print("Google Cloud Console abierta. Inicia sesión y configura el cliente OAuth de ORCA manualmente.")
            print("Callback local de ORCA: http://127.0.0.1:8788/oauth/callback")
        print("Manteniendo Chrome abierto; presiona Ctrl+C en esta consola cuando termines.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        return 0
    finally:
        # Do not close the user-visible browser on normal completion; it contains the
        # administrator's active console session.
        pass


if __name__ == "__main__":
    sys.exit(main())
