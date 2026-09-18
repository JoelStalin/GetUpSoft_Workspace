import subprocess
import time
import socket
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bot.config import AppConfig

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex(('127.0.0.1', port)) == 0

import logging
import subprocess

logger = logging.getLogger("insta_bot")

class Browser:
    def __init__(self, config: AppConfig):
        self.config = config
        self.driver = None

    def is_port_open(self, port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1.0)
            return s.connect_ex(('127.0.0.1', port)) == 0

    def start(self):
        print(f"[STEP] Abriendo Chrome con perfil: {self.config.chrome_user_data_dir}")
        
        # 1. Comando de lanzamiento (Usando Profile 9 verificado)
        user_data = self.config.chrome_user_data_dir
        profile = self.config.chrome_profile_directory
        
        # Forzar visibilidad y puerto 9222
        cmd = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            f"--remote-debugging-port=9222",
            f"--user-data-dir={user_data}",
            f"--profile-directory={profile}",
            "--start-maximized",
            "--no-first-run"
        ]
        
        if not self.is_port_open(9222):
            logger.info(f"[STEP] Abriendo Chrome VISIBLE con perfil: {profile}")
            # Usar DEVNULL y DETACHED_PROCESS para evitar bloqueos en Windows
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, shell=False, creationflags=0x00000008)
            
            # Esperar a que el puerto abra
            for _ in range(15):
                if self.is_port_open(9222):
                    logger.info("[PASS] Navegador abierto y puerto detectado.")
                    break
                time.sleep(1)
            else:
                logger.warning("[FAIL] El puerto 9222 nunca abrió tras 15 segundos.")
        
        # 2. Conectar Selenium
        try:
            options = Options()
            options.debugger_address = "127.0.0.1:9222"
            logger.warning("[DEBUG] Intentando enlazar a " + options.debugger_address)
            self.driver = webdriver.Chrome(options=options)
            logger.warning("[DEBUG] ¡Enlazado completado!")
            logger.info("[PASS] Selenium conectado exitosamente.")
            return self.driver
        except Exception as e:
            print(f"[FAIL] Error al conectar Selenium: {e}")
            raise

    def stop(self):
        if self.driver:
            print("[STEP] Cerrando conexión Selenium (dejando Chrome abierto)")
            # No cerramos el navegador completo por política de "navegación asistida"
            # pero cerramos la conexión del script.
            # self.driver.quit()
            pass
