
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

WAIT_TIME = 5
INPUT_FILE = "not_following_back.json"
UNFOLLOWED_LOG = "unfollowed_done.json"
MAX_UNFOLLOWS = 10

def iniciar_driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(WAIT_TIME)
    return driver

def cargar_lista():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def guardar_unfollow(username):
    if not username:
        return
    data = []
    if os.path.exists(UNFOLLOWED_LOG):
        with open(UNFOLLOWED_LOG, "r", encoding="utf-8") as f:
            data = json.load(f)
    data.append(username)
    with open(UNFOLLOWED_LOG, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def ya_unfollowed(username):
    if not username or not os.path.exists(UNFOLLOWED_LOG):
        return False
    with open(UNFOLLOWED_LOG, "r", encoding="utf-8") as f:
        data = json.load(f)
    return username in data

def hacer_unfollow(driver, username):
    url = f"https://www.instagram.com/{username}/"
    driver.get(url)
    time.sleep(WAIT_TIME)

    try:
        seguir_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Siguiendo')]")
        seguir_btn.click()
        time.sleep(2)
        confirmar = driver.find_element(By.XPATH, "//button[contains(text(), 'Dejar de seguir')]")
        confirmar.click()
        print(f"🚫 Se dejó de seguir: {username}")
        guardar_unfollow(username)
        time.sleep(3)
        return True
    except Exception as e:
        print(f"⚠️ Error con {username}: {e}")
        return False

def main():
    driver = iniciar_driver()
    print("🔍 Cargando lista de usuarios a dejar de seguir...")
    usuarios = cargar_lista()
    contador = 0

    for usuario in usuarios:
        username = usuario["username"]
        if ya_unfollowed(username):
            print(f"⏭️ Ya procesado: {username}")
            continue
        if hacer_unfollow(driver, username):
            contador += 1
        if contador >= MAX_UNFOLLOWS:
            break

    driver.quit()
    print(f"✅ Se dejaron de seguir {contador} usuarios.")

if __name__ == "__main__":
    main()
