from __future__ import annotations

import contextlib
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


@dataclass
class CheckResult:
    name: str
    url: str
    ok: bool
    detail: str


def build_driver(*, map_orca_to_localhost: bool = False, download_dir: str | None = None) -> webdriver.Chrome:
    options = Options()
    options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1280,900")
    if map_orca_to_localhost:
        options.add_argument(
            "--host-resolver-rules=MAP orca.getupsoft.com 127.0.0.1,MAP orca.getupsoft.com.do 127.0.0.1"
        )
    if download_dir:
        options.add_experimental_option(
            "prefs",
            {
                "download.default_directory": download_dir,
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safebrowsing.enabled": True,
            },
        )
    return webdriver.Chrome(options=options)


def start_tunnel() -> subprocess.Popen[str]:
    return subprocess.Popen(
        ["ssh", "-N", "-L", "18080:127.0.0.1:80", "ssh.getupsoft.com.do"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=True,
    )


def check_text(driver: webdriver.Chrome, name: str, url: str, expected: str) -> CheckResult:
    try:
        driver.get(url)
        time.sleep(1)
        body = driver.find_element(By.TAG_NAME, "body").text
        if expected in body:
            return CheckResult(name, url, True, f"found {expected!r}")
        return CheckResult(name, url, False, f"body did not contain {expected!r}; body={body[:180]!r}")
    except WebDriverException as exc:
        return CheckResult(name, url, False, exc.msg.splitlines()[0])


def check_download(driver: webdriver.Chrome, name: str, page_url: str, download_dir: Path) -> CheckResult:
    try:
        target = download_dir / "orca-clap-plugin.zip"
        if target.exists():
            target.unlink()
        driver.get(page_url)
        time.sleep(1)
        driver.find_element(By.CSS_SELECTOR, "a[href='/downloads/orca-clap-plugin.zip']").click()
        deadline = time.time() + 15
        while time.time() < deadline:
            if target.exists() and target.stat().st_size > 500:
                return CheckResult(name, page_url, True, f"downloaded {target.name} ({target.stat().st_size} bytes)")
            time.sleep(0.5)
        files = [path.name for path in download_dir.iterdir()]
        return CheckResult(name, page_url, False, f"zip was not downloaded; files={files}")
    except WebDriverException as exc:
        return CheckResult(name, page_url, False, exc.msg.splitlines()[0])


def check_command_ui_interaction(driver: webdriver.Chrome, name: str, url: str) -> CheckResult:
    try:
        driver.get(url)
        time.sleep(2)
        user_input = driver.find_element(By.ID, "user-id")
        user_input.clear()
        user_input.send_keys(f"selenium-{int(time.time())}")
        driver.find_element(By.ID, "save-user").click()
        time.sleep(1)

        chat_input = driver.find_element(By.ID, "chat-input")
        chat_input.clear()
        chat_input.send_keys("Crear un flujo QA para validar el frontend de Orca")
        driver.find_element(By.ID, "send-chat").click()
        time.sleep(3)

        body = driver.find_element(By.TAG_NAME, "body").text
        if "Blueprint guardado" in body and "Orca Jarvis" in body:
            return CheckResult(name, url, True, "chat created and saved a frontend blueprint")
        return CheckResult(name, url, False, f"frontend interaction did not save blueprint; body={body[:220]!r}")
    except WebDriverException as exc:
        return CheckResult(name, url, False, exc.msg.splitlines()[0])


def main() -> int:
    tunnel = start_tunnel()
    time.sleep(2)
    results: list[CheckResult] = []

    try:
        public_driver = build_driver()
    except Exception as exc:
        tunnel.terminate()
        print(f"SELENIUM_PUBLIC_START_FAILED: {exc}")
        return 2

    try:
        public_checks = [
            ("public .com health", "https://orca.getupsoft.com/health", "ok"),
            ("public .do health", "https://orca.getupsoft.com.do/health", "ok"),
        ]
        for name, url, expected in public_checks:
            results.append(check_text(public_driver, name, url, expected))
    finally:
        with contextlib.suppress(Exception):
            public_driver.quit()

    with TemporaryDirectory() as temp_dir:
        try:
            driver = build_driver(map_orca_to_localhost=True, download_dir=temp_dir)
            with contextlib.suppress(Exception):
                driver.execute_cdp_cmd("Page.setDownloadBehavior", {"behavior": "allow", "downloadPath": temp_dir})
            with contextlib.suppress(Exception):
                driver.execute_cdp_cmd("Browser.setDownloadBehavior", {"behavior": "allow", "downloadPath": temp_dir})
        except Exception as exc:
            tunnel.terminate()
            print(f"SELENIUM_TUNNEL_START_FAILED: {exc}")
            return 2

        tunnel_checks = [
            ("tunnel .com health", "http://orca.getupsoft.com:18080/health", "ok"),
            ("tunnel .com command UI", "http://orca.getupsoft.com:18080/", "Orca Command"),
            ("tunnel .do command UI", "http://orca.getupsoft.com.do:18080/", "Orca Command"),
            ("tunnel .do plugin", "http://orca.getupsoft.com.do:18080/plugin", "Orca Clap Launcher"),
        ]
        try:
            for name, url, expected in tunnel_checks:
                results.append(check_text(driver, name, url, expected))
            results.append(
                check_command_ui_interaction(
                    driver,
                    "tunnel .do command UI interaction",
                    "http://orca.getupsoft.com.do:18080/",
                )
            )
            results.append(
                check_download(
                    driver,
                    "tunnel .com plugin zip download",
                    "http://orca.getupsoft.com:18080/plugin",
                    Path(temp_dir),
                )
            )
        finally:
            with contextlib.suppress(Exception):
                driver.quit()
            tunnel.terminate()
            with contextlib.suppress(Exception):
                tunnel.wait(timeout=5)

    for result in results:
        status = "PASS" if result.ok else "FAIL"
        print(f"{status} | {result.name} | {result.url} | {result.detail}")

    return 0 if all(result.ok for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
