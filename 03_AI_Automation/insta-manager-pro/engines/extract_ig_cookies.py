import os
import json
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

WAIT_TIME = 5
SESSION_FILE = "ig_cookies_for_requests.json"

# Cargar usuario y contraseña desde .env
load_dotenv()
USERNAME = os.getenv("IG_USERNAME")
PASSWORD = os.getenv("IG_PASSWORD")

def iniciar_driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(WAIT_TIME)
    return driver

def login_y_guardar_cookies():
    if os.path.exists(SESSION_FILE):
        print(f"🟢 Ya existe una sesión activa en {SESSION_FILE}, no se requiere login.")
        return

    driver = iniciar_driver()
    driver.get("https://www.instagram.com/accounts/login/")
    time.sleep(WAIT_TIME)

    print("ℹ️ Iniciando sesión con credenciales de .env...")
    driver.find_element(By.NAME, "username").send_keys(USERNAME)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.NAME, "password").send_keys(Keys.RETURN)

    print("⚠️ Si se solicita el código 2FA, introdúcelo manualmente en el navegador.")
    input("Presiona ENTER cuando hayas completado el 2FA y cargado tu feed de Instagram...")

    cookies = driver.get_cookies()
    cookie_dict = {cookie['name']: cookie['value'] for cookie in cookies}
    with open(SESSION_FILE, "w") as f:
        json.dump(cookie_dict, f, indent=2)
    print(f"✅ Cookies guardadas en {SESSION_FILE}")
    driver.quit()

if __name__ == "__main__":
    login_y_guardar_cookies()
