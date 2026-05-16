import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def test_native_profile():
    print("Iniciando prueba con perfil nativo...")
    options = Options()
    
    user_data_dir = "C:/Users/yoeli/AppData/Local/Google/Chrome/User Data"
    profile_dir = "Profile 9"
    
    print(f"--user-data-dir={user_data_dir}")
    print(f"--profile-directory={profile_dir}")
    
    options.add_argument(f"user-data-dir={user_data_dir}")
    options.add_argument(f"profile-directory={profile_dir}")
    options.add_argument("--start-maximized")
    
    # Sometimes extensions get in the way of Selenium
    # options.add_argument("--disable-extensions") 

    print("Llamando a webdriver.Chrome()... Puede tardar por el tamaño del perfil.")
    try:
        driver = webdriver.Chrome(service=Service(), options=options)
        print("Driver iniciado correctamente.")
        
        target = "https://www.instagram.com/galantesjewelry/"
        print(f"Navegando a {target} ...")
        
        # We can set page load timeout to avoid hanging forever
        driver.set_page_load_timeout(30)
        
        try:
            driver.get(target)
            print("Navegacion iniciada o completada.")
        except Exception as e:
            print(f"¡Excepción durante driver.get! -> {e}")
            
        time.sleep(10)
        print("Cerrando driver...")
        driver.quit()
        
    except Exception as e:
        print(f"¡Fallo al crear ChromeDriver! -> {e}")

if __name__ == "__main__":
    test_native_profile()
