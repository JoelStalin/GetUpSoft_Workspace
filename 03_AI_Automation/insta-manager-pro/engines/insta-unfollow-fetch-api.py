import os
import time
import json
import sys
import requests
import random
from dotenv import load_dotenv

load_dotenv()

COOKIES_FILE = "ig_cookies_for_requests.json"

# Delays configurables para evitar detección
DELAY_BETWEEN_REQUESTS = (3, 7)
DELAY_AFTER_PAGE = (8, 15)
PAUSE_EVERY_N_PAGES = 20
LONG_PAUSE_SECONDS = (300, 600)

HEADERS = {
    "User-Agent": "Instagram 219.0.0.12.117 Android",
    "Accept": "*/*",
    "Accept-Language": "en-US",
    "X-IG-App-ID": "936619743392459"
}

def cargar_cookies():
    if not os.path.exists(COOKIES_FILE):
        raise Exception("No se encontró el archivo de cookies.")
    with open(COOKIES_FILE, "r", encoding="utf-8") as f:
        content = f.read().strip()
        if not content:
            raise Exception("El archivo de cookies está vacío.")
        cookies = json.loads(content)
    cookie_str = "; ".join([f"{k}={v}" for k, v in cookies.items()])
    HEADERS["Cookie"] = cookie_str
    return cookies

def obtener_user_id(cookies):
    ds_user_id = cookies.get("ds_user_id")
    if not ds_user_id:
        raise Exception("No se pudo extraer ds_user_id de las cookies.")
    print(f"✅ USER_ID detectado: {ds_user_id}")
    return ds_user_id

def cargar_resultados_previos(tipo):
    archivo = f"{tipo}.json"
    if not os.path.exists(archivo):
        return [], set()
    with open(archivo, "r", encoding="utf-8") as f:
        try:
            datos = json.load(f)
        except json.JSONDecodeError:
            return [], set()
    pk_set = {user["pk"] for user in datos}
    print(f"📂 {len(datos)} registros previos en {archivo}.")
    return datos, pk_set

def fetch_paginated_list(user_id, tipo, total_expected):
    results, seen = cargar_resultados_previos(tipo)
    max_id = ""
    page_count = 0
    count_per_page = 12 if tipo == "followers" else 100

    while len(results) < total_expected:
        base_url = f"https://www.instagram.com/api/v1/friendships/{user_id}/{tipo}/?count={count_per_page}"
        url = f"{base_url}&max_id={max_id}" if max_id else base_url
        print(f"🔄 Consultando: {url}")
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            print(f"⚠️ Error HTTP {response.status_code}")
            break

        try:
            data = response.json()
        except json.JSONDecodeError:
            print("❌ Error decodificando la respuesta JSON.")
            break

        users = data.get("users", [])

        nuevos = 0
        for user in users:
            if user["pk"] not in seen:
                results.append(user)
                seen.add(user["pk"])
                nuevos += 1
                if len(results) >= total_expected:
                    break
            time.sleep(round(random.uniform(*DELAY_BETWEEN_REQUESTS), 2))

        print(f"➕ Añadidos {nuevos} nuevos | Total: {len(results)}")

        max_id = str(data.get("next_max_id", ""))
        if not max_id:
            break

        time.sleep(round(random.uniform(*DELAY_AFTER_PAGE), 2))

        page_count += 1
        if page_count % PAUSE_EVERY_N_PAGES == 0:
            pause = random.randint(*LONG_PAUSE_SECONDS)
            print(f"🛑 Pausa larga de {pause} segundos tras {page_count} páginas.")
            time.sleep(pause)

    with open(f"{tipo}.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"✅ Guardado {len(results)} en {tipo}.json")

def main():
    if len(sys.argv) < 3:
        print("⚠️ Debes pasar followers_count y following_count como argumentos.")
        return

    try:
        followers_count = int(sys.argv[1])
        following_count = int(sys.argv[2])
    except ValueError:
        print("⚠️ Los argumentos deben ser enteros.")
        return

    cookies = cargar_cookies()
    user_id = obtener_user_id(cookies)

    fetch_paginated_list(user_id, "followers", followers_count)
    fetch_paginated_list(user_id, "following", following_count)

if __name__ == "__main__":
    main()
