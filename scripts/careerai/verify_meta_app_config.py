import json
import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def get_driver(profile_cmd="Default"):
    options = Options()
    user_data_dir = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data")
    options.add_argument(f"user-data-dir={user_data_dir}")
    options.add_argument(f"profile-directory={profile_cmd}")
    options.add_argument("--start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    try:
        return webdriver.Chrome(options=options)
    except Exception as exc:
        if "already in use" in str(exc).lower() or "user data directory" in str(exc).lower():
            print("Chrome está usando el perfil Default. Cierra Chrome manualmente y vuelve a ejecutar.")
        else:
            print(f"No se pudo iniciar Chrome: {exc}")
        return None


def main():
    url = "https://developers.facebook.com/apps/1692260748714378/settings/advanced/?business_id=221609695287997"
    driver = get_driver()
    if driver is None:
        return 2
    try:
        driver.get(url)
        time.sleep(8)
        result = {
            "url": driver.current_url,
            "title": driver.title,
            "text": driver.find_element("tag name", "body").text,
            "links": [a.get_attribute("href") for a in driver.find_elements("tag name", "a") if a.get_attribute("href")],
        }
        out = Path(".artifacts/meta-app-default-profile.json")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        driver.save_screenshot(str(out.with_suffix(".png")))
        print(json.dumps({"url": result["url"], "title": result["title"], "artifact": str(out), "screenshot": str(out.with_suffix('.png'))}, ensure_ascii=False))
        print(result["text"][:12000])
        return 0
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
