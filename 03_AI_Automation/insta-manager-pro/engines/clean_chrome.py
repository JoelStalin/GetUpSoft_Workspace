import os
import glob
import subprocess
import time

def clean_and_run():
    print("Forzando cierre de Chrome...")
    subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], capture_output=True)
    subprocess.run(["taskkill", "/F", "/IM", "chromedriver.exe", "/T"], capture_output=True)
    
    time.sleep(2)
    
    user_data = r"C:\Users\yoeli\AppData\Local\Google\Chrome\User Data"
    
    # Eliminar locks
    locks = glob.glob(os.path.join(user_data, "Singleton*"))
    for lock in locks:
        try:
            os.remove(lock)
            print(f"Eliminado: {lock}")
        except Exception as e:
            print(f"No se pudo eliminar {lock}: {e}")
            
    print("Todo limpio. Listo para correr pytest.")

if __name__ == "__main__":
    clean_and_run()
