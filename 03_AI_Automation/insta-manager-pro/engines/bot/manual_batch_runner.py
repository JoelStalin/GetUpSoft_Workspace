import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bot.main import main as run_individual_bot
from bot.config import get_config
from bot.browser import Browser
import sys

# Lista de objetivos a procesar manualmente (Ejemplos o extraídos)
# Si el usuario quiere, puede añadir más aquí
TARGETS = [
    "https://www.instagram.com/93_stalin/",
    "https://www.instagram.com/zalesjewelers/",
    "https://www.instagram.com/kayjewelers/"
]

def run_manual_batch():
    print("=== INICIANDO LOTE MANUAL COORDINADO PARA GALANTE'S JEWELRY ===")
    
    # 1. Asegurar puerto 9222 (Conectarse a la sesión del usuario)
    print("[STEP] Conectando a la ventana de Chrome donde hiciste login...")
    
    for url in TARGETS:
        print(f"\n>>> PROCESANDO OBJETIVO: {url}")
        try:
            # Ejecutar el flujo de main.py para este URL específico
            # Pasamos la URL y el config_instagram.json
            sys.argv = ["bot.main", url, "config_instagram.json"]
            run_individual_bot()
            
            print(f"[SUCCESS] Ciclo completado para {url}")
            print("[WAIT] Esperando 60 segundos antes del siguiente para evitar bloqueos...")
            time.sleep(60)
            
        except Exception as e:
            print(f"[ERROR] Fallo en {url}: {e}")
            continue

if __name__ == "__main__":
    run_manual_batch()
