import requests
import time
import keyboard
import random
import sys
import io

print("🚀 Bot de Tinder iniciando...")

# Fix UnicodeEncodError on Windows terminals
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from tinderbotj.session import Session
from tinderbotj.helpers.constants_helper import *

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

import json
from tinderbotj.helpers.smart_filter import SmartFilter
from tinderbotj.assistant.billing import UsageLedger
from tinderbotj.assistant.orchestrator import AssistedReplyOrchestrator

# Archivo donde se guardarán los datos de entrenamiento
TRAINING_FILE = "training_data.json"

def save_training_data(bio, liked):
    """Guarda la biografía y la acción (Like/Dislike) para entrenamiento futuro."""
    try:
        data = []
        try:
            with open(TRAINING_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass

        entry = {"bio": bio, "liked": liked}
        data.append(entry)

        with open(TRAINING_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Error al guardar entrenamiento: {e}")

def run_training_mode(session):
    print("\n🎓 MODO ENTRENAMIENTO ACTIVADO")
    print("El bot te mostrará perfiles. Tú decides. Tus elecciones entrenarán al sistema.")
    print("Presiona 'y' para Like, 'n' para Dislike, 'q' para salir.")
    
    while True:
        try:
            geomatch = session.get_geomatch(quickload=False)
            if not geomatch:
                print("No hay más perfiles por ahora.")
                break
                
            print("\n------------------------------------------------")
            print(f"👤 Nombre: {geomatch.name}, Edad: {geomatch.age}")
            print(f"📖 Bio: {geomatch.bio}")
            # print(f"🖼️ Fotos: {len(geomatch.image_urls)}")
            
            # Simple keyword check check
            sf = SmartFilter()
            if sf.is_suspected_trans(geomatch.bio):
                print("⚠️  ALERTA: Posible perfil TRANS detectado por palabras clave.")
            
            action = input("¿Te gusta? (y/n/q): ").lower()
            
            if action == 'q':
                break
            elif action == 'y':
                session.like(amount=1, ratio="100%", sleep=0, randomize_sleep=False)
                save_training_data(geomatch.bio, True)
                print("✅ Like registrado. Bio guardada para entrenamiento.")
            elif action == 'n':
                session.dislike()
                save_training_data(geomatch.bio, False)
                print("❌ Dislike registrado.")
            else:
                print("Opción no válida. Saltando perfil...")
                session.dislike() # Default dislike to move on
                
        except Exception as e:
            print(f"Error en entrenamiento: {e}")
            time.sleep(2)

def run_auto_mode(session, smart=True):
    print("\n🤖 MODO AUTOMÁTICO INTELIGENTE ACTIVADO")
    sf = SmartFilter()
    
    while True:
        try:
            if keyboard.is_pressed('q'):
                print("🛑 Bot detenido por el usuario.")
                break

            # Posicionarse en la sección de recomendaciones
            if "recs" not in session.browser.current_url:
                 session.browser.get("https://tinder.com/app/recs")
                 time.sleep(2)

            # Smart Check before liking
            if smart:
                # Need to peek at current profile without liking immediately
                # Utilizing get_geomatch purely for analysis implies we look at the 'top' card
                try:
                    # Quick check of current card bio
                    # Note: get_geomatch usually likes/dislikes? No, it just scrapes.
                    geomatch = session.get_geomatch(quickload=True)
                    
                    if geomatch and sf.is_suspected_trans(geomatch.bio):
                        print(f"🚫 BIO SUSPECT: '{geomatch.name}' detectado como TRANS. Disliking...")
                        session.dislike()
                        continue
                    
                    # LLM / Compatibility Check stub
                    # score = sf.check_compatibility(geomatch.bio)
                    # if score < -5: ... dislike
                    
                except Exception as e:
                    print(f"⚠️ Error analizando bio: {e}")
                    # Continue safely

            # Acciones básicas
            session.like(amount=1, ratio="72.5%", sleep=1)
            
            # Ajustar preferencias esporádicamente (no en cada loop)
            # session.set_distance_range(km=150) 
            
            if random.random() < 0.05: # 5% chance
                print("💤 Pausa aleatoria para parecer humano...")
                time.sleep(random.uniform(5, 10))

        except KeyboardInterrupt:
            print("🛑 Bot detenido con Ctrl+C")
            break
        except Exception as e:
            print(f"❌ Error en la ejecución del ciclo: {e}")
            time.sleep(2)


def run_assisted_reply_mode(session):
    print("\n💬 MODO ASISTIDO IA ACTIVADO")
    print("Este modo solo sugiere respuestas. Nada se envia sin aprobacion humana.")
    orchestrator = AssistedReplyOrchestrator()
    ledger = UsageLedger()

    try:
        print("\nModelos disponibles:")
        for strategy in orchestrator.available_strategies():
            print(f"- {strategy}")

        strategy = input("Estrategia/modelo [cheap/balanced/premium] (default balanced): ").strip() or "balanced"
        chatid = input("Chat ID del match: ").strip()
        if not chatid:
            print("❌ Debes indicar un chat ID.")
            return

        goal = (
            input("Objetivo conversacional (enter para default): ").strip()
            or "Mantener una conversacion autentica, con interes genuino, y evaluar si vale la pena proponer continuar la conversacion fuera de la app."
        )
        notes = input("Notas de estilo o contexto extra (opcional): ").strip()

        estimate = orchestrator.estimate_reply_cost(
            session.get_match_context(chatid, quickload=True, include_history=True),
            strategy=strategy,
        )
        print(f"\n🧾 Estimado previo -> modelo: {estimate['model']} ({estimate['provider']})")
        print(f"   Costo proveedor: ${estimate['provider_cost_usd']:.6f}")
        print(f"   Fee servicio 50%: ${estimate['service_fee_usd']:.6f}")
        print(f"   Total estimado: ${estimate['total_price_usd']:.6f}")

        result = session.suggest_reply(
            chatid,
            orchestrator=orchestrator,
            strategy=strategy,
            user_goal=goal,
            user_notes=notes,
        )

        print(f"\n🧠 Modelo usado: {result.model} ({result.provider})")
        print(f"💵 Costo proveedor: ${result.provider_cost_usd:.6f}")
        print(f"💼 Fee servicio (50%): ${result.service_fee_usd:.6f}")
        print(f"💳 Total sugerencia: ${result.total_price_usd:.6f}")
        ledger_path = ledger.record_reply_suggestion(chatid, result)
        print(f"🧾 Ledger guardado en: {ledger_path}")
        print("\nSugerencias:")
        for index, suggestion in enumerate(result.suggestions, start=1):
            print(f"\n{index}. {suggestion.label}")
            print(f"   Mensaje: {suggestion.message}")
            print(f"   Motivo: {suggestion.why_it_works}")

        send_choice = input("\n¿Enviar alguna opcion? (numero / n): ").strip().lower()
        if send_choice.isdigit():
            selected = result.suggestions[int(send_choice) - 1]
            session.send_message(chatid, selected.message)
            print("✅ Mensaje enviado tras aprobación humana.")
        else:
            print("👍 No se envió ningún mensaje.")
    except Exception as e:
        print(f"❌ No se pudo generar la sugerencia: {e}")


if __name__ == "__main__":
    # Inicializar sesión explícitamente con headless=False para asegurar que se vea el proceso
    session = Session(headless=False, store_session=True)

    # Establecer ubicación
    lat, lon = get_current_location()
    print(f"🌎 Ubicación detectada: {lat}, {lon}")
    session.set_custom_location(latitude=lat, longitude=lon)

    # Login manual
    print("🔐 Abriendo Tinder...")
    session.browser.get("https://tinder.com")

    # Wait for login
    if session._is_logged_in():
        print("✅ Ya has iniciado sesión (Sesión recuperada).")
    else:
        print("👉 Por favor inicia sesión manualmente en la ventana del navegador.")
        print("   Esperando detección de login (máx 5 minutos)...")
        
        start_wait = time.time()
        logged_in = False
        while time.time() - start_wait < 300:
            try:
                if session._is_logged_in():
                    print("✅ Login verificado!")
                    logged_in = True
                    break
                time.sleep(2)
            except Exception as e:
                pass
        
        if not logged_in:
            print("❌ Tiempo de espera agotado. No se detectó inicio de sesión.")
            exit(1)

    auto_mode_arg = len(sys.argv) > 1 and sys.argv[1] == "auto"

    while True:
        if auto_mode_arg:
            print("\n[Auto-Start] Ejecutando Modo Automático directamente por argumento...")
            choice = '1'
            auto_mode_arg = False # Evitar loop infinito si regresa
        else:
            print("\nSelecciona el modo de operación:")
            print("1. 🤖 Modo Automático (Con filtro inteligente)")
            print("2. 🎓 Modo Entrenamiento (Tú decides, yo aprendo)")
            print("3. 💬 Modo Asistido IA (Sugerencias con aprobación humana)")
            print("4. ❌ Salir")
            
            choice = input("Opción (1/2/3/4): ")
        
        if choice == '1':
            run_auto_mode(session)
        elif choice == '2':
            run_training_mode(session)
        elif choice == '3':
            run_assisted_reply_mode(session)
        elif choice == '4':
            print("Adiós!")
            break
        else:
            print("Opción inválida.")
            
    # Clean exit
    try:
        session.browser.quit()
    except:
        pass
