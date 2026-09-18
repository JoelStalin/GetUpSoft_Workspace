import time
import random
import logging

logger = logging.getLogger(__name__)

def random_delay(min_sec=45, max_sec=90):
    """Espera un tiempo aleatorio para simular comportamiento humano."""
    delay = random.uniform(min_sec, max_sec)
    logger.info(f"[ANTI-BOT] Esperando {delay:.2f} segundos...")
    time.sleep(delay)

def short_delay():
    """Pausa pequeña para transiciones de UI."""
    time.sleep(random.uniform(2, 5))
