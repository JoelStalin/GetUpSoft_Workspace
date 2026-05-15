"""
Bot de Tinder personalizado y optimizado para Joel
"""

import time
import random
import requests
from .tinderbotz.session import Session
from tinderbotz.helpers.constants_helper import *

def get_current_location():
    """Obtiene la latitud y longitud actuales usando un servicio de geolocalización por IP."""
    try:
        print("🌎 Obteniendo ubicación automática...")
        response = requests.get("https://ipinfo.io/json", timeout=10)
        data = response.json()
        loc = data.get("loc")  # Formato: "lat,long"
        if loc:
            latitude, longitude = map(float, loc.split(','))
            print(f"📍 Ubicación detectada: Latitud {latitude}, Longitud {longitude}")
            return latitude, longitude
    except Exception as e:
        print(f"⚠️ Error obteniendo la ubicación automática: {e}. Usando ubicación de respaldo (Miami).")
    return 25.7617, -80.1918  # Fallback: Miami

def main():
    """
    Función principal para ejecutar el bot de Tinder.
    """
    # 1. Iniciar la sesión del navegador
    # store_session=True guarda las cookies para no tener que iniciar sesión siempre.
    print("🚀 Iniciando sesión de Tinderbotz...")
    session = Session(store_session=True)

    # 2. Manejo del Login
    # El script esperará a que inicies sesión manualmente en el navegador.
    print("\n" + "="*50)
    print("🔐 ACCIÓN REQUERIDA: Por favor, inicia sesión en Tinder en la ventana del navegador.")
    print("Puedes usar Google, Facebook, o el método que prefieras.")
    input("➡️  Una vez que hayas iniciado sesión y veas la pantalla principal, PRESIONA ENTER AQUÍ para continuar...")
    print("✅ ¡Perfecto! El bot tomará el control ahora.")
    print("="*50 + "\n")

    # 3. Establecer la ubicación y preferencias
    # Solo se ejecutan después de que el login ha sido confirmado.
    try:
        lat, lon = get_current_location()
        session.set_custom_location(latitude=lat, longitude=lon)

        session.set_distance_range(km=150)
        session.set_age_range(min=18, max=55)
        session.set_sexuality(Sexuality.WOMEN)
        # session.set_global(True) # Descomenta si quieres buscar globalmente

        print("⚙️ Preferencias de búsqueda actualizadas: Distancia a 150km, Edad 18-55, Mujeres.")

    except Exception as e:
        print(f"⚠️ Error al configurar las preferencias: {e}")

    # 4. Iniciar el ciclo de "Likes"
    # El bot dará likes de forma continua con una pequeña pausa.
    print("\n💘 Iniciando ciclo de 'Likes'. Presiona Ctrl+C en la terminal para detener el bot de forma segura.")
    try:
        like_count = 0
        while True:
            session.like(amount=1)
            like_count += 1
            print(f"👍 Like #{like_count}")
            # Pausa aleatoria entre 1 y 3 segundos para un comportamiento más humano
            time.sleep(random.uniform(1.0, 3.0))

    except KeyboardInterrupt:
        # Esto permite detener el bot de forma limpia con Ctrl+C
        print("\n\n🛑 Bot detenido por el usuario. ¡Hasta la próxima!")
    except Exception as e:
        print(f"\n⚠️ Un error inesperado ocurrió durante el ciclo de likes: {e}")

if __name__ == "__main__":
    main()