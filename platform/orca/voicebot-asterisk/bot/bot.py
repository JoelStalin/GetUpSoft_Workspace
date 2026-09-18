import os
import time
import logging
import ari
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(level=getattr(logging, LOG_LEVEL),
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ARI_URL = os.getenv("ARI_URL", "http://127.0.0.1:8088")
ARI_USER = os.getenv("ARI_USER", "voicebot")
ARI_PASSWORD = os.getenv("ARI_PASSWORD")
ARI_APP = os.getenv("ARI_APP", "voicebot-app")

if not ARI_PASSWORD:
    logger.error("ARI_PASSWORD no está definido en el archivo .env")
    exit(1)

# Handlers para Eventos
def on_stasis_start(channel, ev):
    """Manejador del evento StasisStart"""
    call_id = channel.json.get('id')
    caller_id = channel.json.get('caller', {}).get('number', 'Unknown')
    args = ev.get('args', [])
    
    logger.info(f"LLamada entrante - Call ID: {call_id} - Caller ID: {caller_id} - Args: {args}")

    try:
        # 1. Contestar la llamada
        logger.info(f"Contestando canal {call_id}")
        channel.answer()

        # [AQUÍ SE PODRÍA INTEGRAR LÓGICA DE CRM/LLM INICIAL]

        # 2. Reproducir un audio preexistente
        logger.info(f"Reproduciendo audio hello-world en canal {call_id}")
        playback = channel.play(media='sound:hello-world')
        
        # [AQUÍ SE PODRÍA INTEGRAR TTS DESPUÉS]
        
    except Exception as e:
        logger.error(f"Error procesando StasisStart para canal {call_id}: {e}")
        channel.hangup()

def on_playback_finished(playback, ev):
    """Manejador del evento PlaybackFinished"""
    logger.info(f"Reproducción finalizada. ID: {playback.json.get('id')}")
    # En este MVP, cuando el audio termina, colgamos.
    # En la siguiente fase aquí se iniciaría la grabación (STT) y el paso al LLM.
    try:
        channel_id = ev.get('playback', {}).get('target_uri', '').replace('channel:', '')
        if channel_id:
            logger.info(f"Colgando canal {channel_id}")
            client.channels.hangup(channelId=channel_id)
    except Exception as e:
        logger.error(f"Error colgando después del playback: {e}")

def on_stasis_end(channel, ev):
    """Manejador del evento StasisEnd"""
    call_id = channel.json.get('id')
    logger.info(f"Llamada finalizada - Call ID: {call_id}")
    # [AQUÍ SE PUEDE GUARDAR EL REGISTRO FINAL DE LA LLAMADA EN BD O CRM]

# Cliente ARI
try:
    logger.info(f"Conectando a Asterisk ARI en {ARI_URL}...")
    client = ari.connect(ARI_URL, ARI_USER, ARI_PASSWORD)
    
    # Registrar handlers
    client.on('StasisStart', on_stasis_start)
    client.on('PlaybackFinished', on_playback_finished)
    client.on('StasisEnd', on_stasis_end)

    logger.info(f"Registrado exitosamente en la aplicación Stasis '{ARI_APP}'")
    
    # Iniciar la escucha (se bloquea y mantiene viva la ejecución)
    client.run(apps=ARI_APP)

except Exception as e:
    logger.error(f"Error crítico en el cliente ARI: {e}")
    # Nota: Si la librería ari nativa da problemas, el fallback sería usar
    # requests para la API REST y websocket-client para conectarse a:
    # ws://127.0.0.1:8088/ari/events?api_key=voicebot:PASSWORD&app=voicebot-app
