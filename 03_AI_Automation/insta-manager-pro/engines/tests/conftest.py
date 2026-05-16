import os
import pytest
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bot.config import get_config
from bot.utils.logging_setup import setup_logging

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "tests" / "artifacts"
ARTIFACTS.mkdir(parents=True, exist_ok=True)

@pytest.fixture(scope="session")
def app_config():
    # Usamos get_config que ya maneja la carga de config.json en el root
    config = get_config()
    setup_logging(config.artifacts_dir)
    return config

@pytest.fixture
def driver(app_config):
    """
    Returns an initialized WebDriver using a dedicated local profile.
    """
    options = Options()
    
    # Usamos el puerto de depuración 9222 para consistencia
    options.debugger_address = "127.0.0.1:9222"
    
    try:
        service = Service()
        drv = webdriver.Chrome(service=service, options=options)
        drv.implicitly_wait(10)
        
        yield drv
    except Exception as e:
        print(f"\n[Browser Error] FALLO AL CONECTAR CON CHROME (9222): {e}")
        raise e
