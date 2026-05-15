
"""
Bot de Tinder personalizado para Joel
Modificado por ChatGPT - Loop infinito tras ajuste de distancia + Recs reset + Control de errores
"""

import requests
import time
import keyboard
from tinderbotz.session import Session
from tinderbotz.helpers.constants_helper import *

def get_current_location():
    try:
        response = requests.get("https://ipinfo.io/json")
        data = response.json()
        loc = data.get("loc")  # Formato: "lat,long"
        if loc:
            latitude, longitude = map(float, loc.split(','))
            return latitude, longitude
    except Exception as e:
        print("⚠️ Error obteniendo la ubicación automática:", e)
    return 25.7617, -80.1918  # Fallback: Miami

if __name__ == "__main__":
    session = Session(store_session=True)

    lat, lon = get_current_location()
    print(f"🌎 Ubicación detectada: {lat}, {lon}")
    try:
        session.set_custom_location(latitude=lat, longitude=lon)
    except Exception as e:
        print("❌ Error al establecer la ubicación:", e)

    print("🔐 Abriendo Tinder. Inicia sesión manualmente...")
    session.browser.get("https://tinder.com")
    input("Presiona ENTER cuando hayas iniciado sesión correctamente...")

    print("♻️ Iniciando ciclo infinito. Presiona 'q' para detener.")
    try:
        while True:
            if keyboard.is_pressed('q'):
                print("🛑 Bot detenido por el usuario.")
                break

            try:
                session.browser.get("https://tinder.com/app/recs")
            except Exception as e:
                print("❌ Error al cargar /app/recs:", e)

            try:
                session.like(amount=10, ratio="72.5%", sleep=1)
                session.dislike(amount=1)
                session.superlike(amount=1)
            except Exception as e:
                print("❌ Error durante likes/dislikes/superlikes:", e)

            try:
                session.set_distance_range(km=150)
                session.set_age_range(18, 55)
                session.set_sexuality(Sexuality.WOMEN)
                session.set_global(True)
            except Exception as e:
                print("❌ Error configurando preferencias:", e)

            try:
                for match in session.get_messaged_matches():
                    session.store_local(match)
            except Exception as e:
                print("❌ Error guardando mensajes antiguos:", e)

            try:
                new_matches = session.get_new_matches(amount=10, quickload=False)
                pickup_line = "Hey {}! You. Me. Pizza? O no te gusta la pizza?"
                for match in new_matches:
                    name = match.get_name()
                    chat_id = match.get_chat_id()
                    print(f"💬 Enviando mensaje a: {name}")
                    session.send_message(chatid=chat_id, message=pickup_line.format(name))
                    session.send_gif(chatid=chat_id, gifname="")
                    session.send_song(chatid=chat_id, songname="")
                    session.send_socials(chatid=chat_id, media=Socials.INSTAGRAM, value="Fredjemees")
            except Exception as e:
                print("❌ Error enviando mensajes a nuevos matches:", e)

            try:
                for _ in range(5):
                    geomatch = session.get_geomatch(quickload=False)
                    session.store_local(geomatch)
                    session.dislike()
            except Exception as e:
                print("❌ Error con geomatches:", e)

            time.sleep(5)

    except KeyboardInterrupt:
        print("🛑 Bot detenido con Ctrl+C")
    except Exception as e:
        print(f"❌ Error general en el ciclo principal: {e}")
