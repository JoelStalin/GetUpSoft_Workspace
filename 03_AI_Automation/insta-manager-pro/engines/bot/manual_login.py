import subprocess
import os

def open_manual_chrome():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data = r"C:\selenium\perfil_bot"
    
    print("="*60)
    print("INSTRUCCIONES DE LOGIN MANUAL")
    print("="*60)
    print("1. Se abrirá una ventana de Chrome.")
    print("2. Entra en Facebook.com e Instagram.com.")
    print("3. Inicia sesión con tus credenciales.")
    print("4. Si aparece un CAPTCHA, resuélvelo manualmente.")
    print("5. Una vez dentro de tu cuenta, puedes cerrar la ventana.")
    print("6. ¡El bot ahora tendrá acceso total sin bloqueos!")
    print("="*60)
    
    cmd = [
        chrome_path,
        f"--user-data-dir={user_data}",
        "--start-maximized",
        "https://www.facebook.com"
    ]
    
    subprocess.Popen(cmd)
    print("\n[INFO] Chrome abierto. Ve a la ventana para loguearte.")

if __name__ == "__main__":
    open_manual_chrome()
