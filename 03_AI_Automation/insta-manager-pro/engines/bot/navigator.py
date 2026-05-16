import time
import logging
from urllib.parse import urlparse
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bot.config import AppConfig

logger = logging.getLogger("insta_bot")

class Navigator:
    def __init__(self, driver, config: AppConfig):
        self.driver = driver
        self.config = config

    def navigate(self, url: str):
        # 1. Validar dominio
        domain = urlparse(url).netloc
        if not any(allowed in domain for allowed in self.config.allowed_domains):
            logger.warning(f"[FAIL] Dominio no permitido: {domain}")
            return False

        logger.info(f"[STEP] Navigating to target URL: {url}")
        self.driver.get(url)
        
        # 2. Esperar carga visual
        time.sleep(self.config.step_delay_ms / 1000.0)
        self.wait_for_stability()
        
        return True

    def wait_for_stability(self):
        # Espera simple por readyState
        for _ in range(10):
            state = self.driver.execute_script("return document.readyState")
            if state == "complete":
                break
            time.sleep(1)
        logger.info("[PASS] Página cargada visualmente.")
