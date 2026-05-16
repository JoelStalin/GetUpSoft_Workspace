# main_controller.py

import os
import time
import json
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from instagram_api import InstagramAPI
from compare_follow_data import main as compare_data

# --- CONFIGURACIÓN DE SESIONES AUTOMÁTICAS ---
SESSIONS_TO_RUN = 20
MAX_UNFOLLOWS_PER_SESSION = 200
WAIT_TIME_BETWEEN_SESSIONS_HOURS = (1.0, 2.0)

# --- Constantes de Archivos ---
NOT_FOLLOWING_BACK_FILE = "not_following_back.json"
SESSION_STATE_FILE = "session_state.json"

DELAY_BETWEEN_UNFOLLOWS = (20, 45)

def load_session_state():
    if os.path.exists(SESSION_STATE_FILE):
        try:
            with open(SESSION_STATE_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"current_session": 1}
    return {"current_session": 1}

def save_session_state(session_number):
    with open(SESSION_STATE_FILE, "w") as f:
        json.dump({"current_session": session_number}, f, indent=4)

def main():
    load_dotenv()
    username = os.getenv("IG_USERNAME")
    password = os.getenv("IG_PASSWORD")

    if not username or not password:
        print("❌ Por favor, configura tu usuario y contraseña."); return

    state = load_session_state()
    start_session = state.get("current_session", 1)

    api = InstagramAPI(username, password)
    print("--- PASO 1: Asegurando la sesión de Instagram ---")
    if not api.ensure_session():
        print("❌ No se pudo establecer una sesión. Abortando."); return

    for i in range(start_session, SESSIONS_TO_RUN + 1):
        save_session_state(i)
        print("\n" + "="*60)
        print(f"--- INICIANDO SESIÓN DE TRABAJO {i} de {SESSIONS_TO_RUN} ---")
        print(f"Hora de inicio: {datetime.now().strftime('%H:%M:%S')}")
        print("="*60 + "\n")

        print("--- PASO 2: Obteniendo contadores de seguidores/seguidos ---")
        followers_count, following_count = api.get_counters()
        if followers_count == 0 or following_count == 0:
            print("❌ No se pudieron obtener los contadores. Saltando esta sesión."); continue
            
        print("\n--- PASO 3: Descargando listas ---")
        api.fetch_paginated_list("followers", followers_count)
        api.fetch_paginated_list("following", following_count)
        
        print("\n--- PASO 4: Comparando listas ---")
        compare_data()

        try:
            with open(NOT_FOLLOWING_BACK_FILE, "r", encoding="utf-8") as f:
                users_to_unfollow = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print("\n✅ Tarea completada: No hay a quién dejar de seguir."); break
        if not users_to_unfollow:
            print("\n✅ Tarea completada: La lista de no-seguidores está vacía."); break

        already_unfollowed = api.get_unfollowed_log()
        unfollow_counter_this_session = 0
        
        print(f"\n--- Iniciando proceso de Unfollow (Máximo por sesión: {MAX_UNFOLLOWS_PER_SESSION}) ---")
        
        for user in list(users_to_unfollow):
            if unfollow_counter_this_session >= MAX_UNFOLLOWS_PER_SESSION:
                print(f"🏁 Límite de {MAX_UNFOLLOWS_PER_SESSION} unfollows alcanzado para esta sesión."); break
            
            user_id, user_name = user.get("pk"), user.get("username")
            if not user_id or not user_name: continue
            if user_name in already_unfollowed: continue

            pause_duration = random.uniform(*DELAY_BETWEEN_UNFOLLOWS)
            print(f"⏳ Pausando por {pause_duration:.1f}s antes de unfollow a {user_name}...")
            time.sleep(pause_duration)
            
            if api.unfollow_user(user_id, user_name):
                unfollow_counter_this_session += 1
                users_to_unfollow.remove(user)
                with open(NOT_FOLLOWING_BACK_FILE, "w", encoding="utf-8") as f:
                    json.dump(users_to_unfollow, f, indent=4)
        
        print(f"✅ Sesión {i} completada. {unfollow_counter_this_session} unfollows realizados.")

        if not users_to_unfollow:
            print("\n🎉 ¡Felicidades! Se ha completado toda la lista de unfollows."); break

        if i < SESSIONS_TO_RUN:
            wait_hours = random.uniform(*WAIT_TIME_BETWEEN_SESSIONS_HOURS)
            wait_seconds = wait_hours * 3600
            end_time = datetime.now() + timedelta(seconds=wait_seconds)
            
            print("\n" + "-"*60)
            print(f"🕒 El bot entrará en modo de descanso por {wait_hours:.1f} horas.")
            print(f"La próxima sesión ({i+1}) comenzará aprox. a las: {end_time.strftime('%H:%M:%S del %d/%m')}")
            print("-"*60)
            time.sleep(wait_seconds)
    
    print("\n\n" + "="*60)
    print("✅ Todas las sesiones programadas han finalizado.")
    save_session_state(1)
    print("="*60)

if __name__ == "__main__":
    main()