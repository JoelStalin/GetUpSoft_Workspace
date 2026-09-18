# instagram_api.py

import os
import time
import json
import requests
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

# --- Constantes de Anti-Detección ---
USER_AGENTS = [
    "Instagram 278.0.0.12.117 Android (29/10; 420dpi; 1080x2150; Google; Pixel 4; flame; anubis; en_US; 454350434)",
    "Instagram 277.0.0.13.117 Android (31/12; 440dpi; 1080x2340; samsung; SM-G991U; o1s; o1s; en_US; 452222372)",
    "Instagram 276.0.0.14.118 Android (28/9; 320dpi; 720x1440; LGE; LM-Q720; hiy; ms__us; en_US; 449833832)"
]
COOL_DOWN_MIN_SECONDS = 15 * 60
COOL_DOWN_MAX_SECONDS = 30 * 60

# --- Constantes Generales ---
IG_APP_ID = "936619743392459"
COOKIES_FILE = "ig_cookies_for_api.json"
UNFOLLOWED_LOG_FILE = "unfollowed_api_done.json"
LONG_PAUSE_SECONDS = (45, 75)

class InstagramAPI:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = requests.Session()
        chosen_user_agent = random.choice(USER_AGENTS)
        print(f"🤖 Usando el User-Agent: {chosen_user_agent}")
        self.session.headers.update({
            "User-Agent": chosen_user_agent, "Accept": "*/*", "Accept-Language": "en-US", "X-IG-App-ID": IG_APP_ID
        })
        self.user_id = None

    def _make_api_request(self, url):
        try:
            response = self.session.get(url)
            if response.status_code == 429:
                cool_down_time = random.uniform(COOL_DOWN_MIN_SECONDS, COOL_DOWN_MAX_SECONDS)
                print(f"🔴 LÍMITE DE PETICIONES ALCANZADO (Error 429).")
                print(f"🥶 Entrando en modo de enfriamiento por {cool_down_time / 60:.1f} minutos.")
                time.sleep(cool_down_time)
                response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"⚠️ Error de red durante la petición a la API: {e}"); return None
        except json.JSONDecodeError:
            print(f"⚠️ Error decodificando la respuesta JSON de la API."); return None

    def _save_cookies_to_file(self):
        with open(COOKIES_FILE, "w", encoding="utf-8") as f:
            json.dump(self.session.cookies.get_dict(), f, indent=2)
        print("✅ Cookies de sesión para la API guardadas en archivo.")

    def _load_cookies_from_file(self):
        if os.path.exists(COOKIES_FILE):
            if os.path.getsize(COOKIES_FILE) == 0:
                print(f"⚠️ ADVERTENCIA: El archivo de cookies '{COOKIES_FILE}' está vacío."); return False
            try:
                with open(COOKIES_FILE, "r", encoding="utf-8") as f:
                    cookies = json.load(f)
                    self.session.cookies.update(cookies)
                    self.user_id = self.session.cookies.get("ds_user_id")
                    if self.user_id:
                        print(f"✅ Sesión de API cargada desde archivo. USER_ID: {self.user_id}"); return True
            except json.JSONDecodeError:
                print(f"⚠️ ADVERTENCIA: El archivo de cookies '{COOKIES_FILE}' está corrupto."); return False
        return False

    def ensure_session(self):
        if self._load_cookies_from_file(): return True
        print("INFO: No se encontró una sesión válida. Se requiere un nuevo login.")
        options = Options()
        driver = webdriver.Chrome(options=options)
        try:
            driver.get("https://www.instagram.com/accounts/login/")
            time.sleep(5)
            driver.find_element(By.NAME, "username").send_keys(self.username)
            driver.find_element(By.NAME, "password").send_keys(self.password)
            driver.find_element(By.NAME, "password").send_keys(Keys.RETURN)
            print("\n" + "="*50 + "\n⏳ ACCIÓN REQUERIDA ⏳")
            print("Por favor, completa el login en el navegador (incluyendo 2FA si se solicita).")
            input("➡️  Una vez que hayas iniciado sesión y veas tu feed, PRESIONA ENTER AQUÍ para continuar...\n" + "="*50)
            print("✅ ¡Perfecto! Capturando la sesión...")
            selenium_cookies = driver.get_cookies()
            if not any(cookie['name'] == 'sessionid' for cookie in selenium_cookies):
                print("❌ No se pudo capturar la cookie de sesión."); return False
            for cookie in selenium_cookies:
                self.session.cookies.set(cookie['name'], cookie['value'], domain=cookie['domain'])
            self._save_cookies_to_file()
            self.user_id = self.session.cookies.get("ds_user_id")
            return True
        finally:
            print("INFO: Cerrando el navegador de login."); driver.quit()

    def get_counters(self):
        if not self.session.cookies.get('sessionid'):
            print("❌ No hay una sesión válida para obtener los contadores."); return 0, 0
        print("🤖 Abriendo navegador temporal para obtener contadores...")
        options = Options()
        driver = webdriver.Chrome(options=options)
        try:
            driver.get("https://www.instagram.com/")
            time.sleep(2)
            for cookie_name, cookie_value in self.session.cookies.items():
                driver.add_cookie({'name': cookie_name, 'value': cookie_value, 'domain': '.instagram.com'})
            print(f"🔎 Navegando al perfil de {self.username}...")
            driver.get(f"https://www.instagram.com/{self.username}/")
            time.sleep(5)
            print("INFO: Buscando contadores con el método preciso basado en enlaces 'href'.")
            
            time.sleep(random.uniform(0.2, 0.6))
            followers_link = driver.find_element(By.XPATH, f"//a[contains(@href, '/{self.username}/followers/')]")
            time.sleep(random.uniform(0.1, 0.4))
            followers_span = followers_link.find_element(By.XPATH, ".//span[@title]")
            followers_text = followers_span.get_attribute("title")
            
            time.sleep(random.uniform(0.2, 0.5))
            following_link = driver.find_element(By.XPATH, f"//a[contains(@href, '/{self.username}/following/')]")
            following_text = following_link.text.split(" ")[0]

            if not followers_text or not following_text:
                raise ValueError("No se pudo encontrar el texto de seguidores o seguidos.")

            followers_count = int(followers_text.replace(",", "").replace(".", ""))
            following_count = int(following_text.replace(",", "").replace(".", ""))
            
            print(f"📊 Extraídos del perfil: {followers_count} seguidores / {following_count} seguidos")
            return followers_count, following_count
        except Exception as e:
            print(f"⚠️ Error extrayendo contadores: {e}"); return 0, 0
        finally:
            print("INFO: Cerrando el navegador de contadores."); driver.quit()

    def fetch_paginated_list(self, list_type, total_count):
        if not self.user_id: print("❌ USER_ID no encontrado."); return
        
        file_path = f"{list_type}.json"
        results, seen_pks, max_id = [], set(), ""
        
        page_counter, pages_until_long_pause = 0, random.randint(3, 5)
        consecutive_empty_fetches, STALL_THRESHOLD = 0, 3
        
        print(f"🔄 Empezando la descarga de la lista de '{list_type}'...")
        while len(results) < total_count:
            url = f"https://www.instagram.com/api/v1/friendships/{self.user_id}/{list_type}/?count=200&max_id={max_id}"
            
            data = self._make_api_request(url)
            if data is None: break

            users = data.get("users", [])
            if not users: print("INFO: No se encontraron más usuarios en la página devuelta por la API."); break
            
            new_users_count = 0
            for user in users:
                if user['pk'] not in seen_pks:
                    results.append(user); seen_pks.add(user['pk']); new_users_count += 1
            
            if new_users_count == 0:
                consecutive_empty_fetches += 1
            else:
                consecutive_empty_fetches = 0

            print(f"➕ {new_users_count} usuarios nuevos añadidos. Total actual: {len(results)}/{total_count}")
            
            if consecutive_empty_fetches >= STALL_THRESHOLD:
                print(f"\n⚠️ DETECTOR DE ESTANCAMIENTO: No se encontraron usuarios nuevos en {STALL_THRESHOLD} intentos. Finalizando descarga."); break

            max_id = data.get("next_max_id")
            if not max_id: print("✅ Se ha llegado al final de la lista."); break
            
            time.sleep(random.uniform(5, 12))
            page_counter += 1
            if page_counter >= pages_until_long_pause:
                long_pause_time = random.uniform(*LONG_PAUSE_SECONDS)
                print(f"\n--- ⏳ PAUSA ESTRATÉGICA: Descansando por {long_pause_time:.1f} segundos. ---\n")
                time.sleep(long_pause_time)
                page_counter, pages_until_long_pause = 0, random.randint(3, 5)
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"✅ Descarga completada. Se guardaron {len(results)} usuarios en '{file_path}'.")

    def unfollow_user(self, user_to_unfollow_id, username):
        url = f"https://www.instagram.com/api/v1/friendships/destroy/{user_to_unfollow_id}/"
        try:
            self.session.headers.update({'x-csrftoken': self.session.cookies.get('csrftoken')})
            response = self.session.post(url)
            response.raise_for_status()
            if response.status_code == 200:
                print(f"🚫 Dejado de seguir a: {username}"); self._log_unfollowed_user(username); return True
        except requests.RequestException as e:
            print(f"❌ Error al dejar de seguir a {username}: {e}"); return False
    
    def _log_unfollowed_user(self, username):
        data = []
        if os.path.exists(UNFOLLOWED_LOG_FILE):
            with open(UNFOLLOWED_LOG_FILE, "r", encoding="utf-8") as f:
                try: data = json.load(f)
                except json.JSONDecodeError: pass
        data.append(username)
        with open(UNFOLLOWED_LOG_FILE, "w", encoding="utf-8") as f: json.dump(data, f, indent=2)

    def get_unfollowed_log(self):
        if not os.path.exists(UNFOLLOWED_LOG_FILE): return []
        with open(UNFOLLOWED_LOG_FILE, "r", encoding="utf-8") as f:
            try: return json.load(f)
            except json.JSONDecodeError: return []