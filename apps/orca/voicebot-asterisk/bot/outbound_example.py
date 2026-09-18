import os
import logging
from dotenv import load_dotenv
import requests

load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(level=getattr(logging, LOG_LEVEL),
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ENABLE_OUTBOUND = os.getenv("ENABLE_OUTBOUND", "false").lower() == "true"
ALLOWED_OUTBOUND_NUMBERS = os.getenv("ALLOWED_OUTBOUND_NUMBERS", "").split(",")

ARI_URL = os.getenv("ARI_URL", "http://127.0.0.1:8088")
ARI_USER = os.getenv("ARI_USER", "voicebot")
ARI_PASSWORD = os.getenv("ARI_PASSWORD")
ARI_APP = os.getenv("ARI_APP", "voicebot-app")

def originate_call(number, endpoint_type="PJSIP"):
    """
    Inicia una llamada saliente hacia un número específico.
    ADVERTENCIA LEGAL: Asegúrese de tener el consentimiento del destinatario.
    No utilice este script para campañas masivas sin revisión de cumplimiento (TCPA/GDPR/etc).
    """
    if not ENABLE_OUTBOUND:
        logger.warning("Las llamadas salientes están deshabilitadas (ENABLE_OUTBOUND=false).")
        return

    if number not in ALLOWED_OUTBOUND_NUMBERS:
        logger.warning(f"Número {number} no está en la lista de números permitidos (ALLOWED_OUTBOUND_NUMBERS).")
        return

    logger.info(f"Iniciando llamada de prueba saliente a {number}...")

    # Uso de la API REST directamente como ejemplo de fallback sin usar ari-py
    url = f"{ARI_URL}/ari/channels"
    
    payload = {
        'endpoint': f"{endpoint_type}/{number}", # ej. PJSIP/1001 o PJSIP/número@provider-trunk
        'extension': '1000',
        'context': 'voicebot-internal',
        'priority': 1,
        'app': ARI_APP,
        'appArgs': 'outbound-test'
    }

    try:
        response = requests.post(url, auth=(ARI_USER, ARI_PASSWORD), data=payload)
        response.raise_for_status()
        logger.info(f"Llamada originada con éxito: {response.json()}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error originando llamada saliente: {e}")
        if e.response is not None:
            logger.error(f"Detalles: {e.response.text}")

if __name__ == "__main__":
    print("Este script es solo un ejemplo demostrativo de llamadas salientes controladas.")
    print("Configure ENABLE_OUTBOUND=true y ALLOWED_OUTBOUND_NUMBERS en su entorno para usarlo.")
    # originate_call("1001")
