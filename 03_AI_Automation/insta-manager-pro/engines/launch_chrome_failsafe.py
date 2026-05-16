import os
import subprocess
import time
import socket
from pathlib import Path

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def launch():
    print("Cerrando todas las instancias de Chrome...")
    subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], capture_output=True)
    time.sleep(2)
    
    # RUTA CRÍTICA: Cambiada a la del bot para usar la sesión guardada
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data = r"C:\selenium\perfil_bot"
    profile = "Default"
    
    cmd = [
        chrome_path,
        f"--remote-debugging-port=9222",
        f"--user-data-dir={user_data}",
        f"--profile-directory={profile}",
        "--disable-blink-features=AutomationControlled",
        "--no-first-run",
        "--no-default-browser-check",
        "--start-maximized"
    ]
    
    print(f"Lanzando Chrome con puerto 9222 y perfil {user_data}...")
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print("Esperando a que el puerto 9222 esté disponible...")
    for i in range(30):
        if is_port_open(9222):
            print("¡Puerto 9222 abierto y listo!")
            return True
        time.sleep(1)
        if i % 5 == 0:
            print(f"Reintentando... ({i}/30)")
            
    print("ERROR: No se pudo abrir el puerto de depuración en 30 segundos.")
    return False

if __name__ == "__main__":
    launch()
