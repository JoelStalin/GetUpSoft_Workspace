import os
import requests
import logging
from dotenv import load_dotenv

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cargar variables de entorno (Asegúrate de poner las credenciales en el .env)
load_dotenv()

# Credenciales de Instagram (Facebook Developer App)
INSTA_APP_ID = os.getenv("INSTA_APP_ID")
INSTA_APP_SECRET = os.getenv("INSTA_APP_SECRET")
INSTA_ACCESS_TOKEN = os.getenv("INSTA_ACCESS_TOKEN") # Token de usuario con permisos de rebranding

class InstagramRebrander:
    def __init__(self, app_id, app_secret, access_token=None):
        self.app_id = app_id
        self.app_secret = app_secret
        self.access_token = access_token
        self.base_url = "https://graph.facebook.com/v19.0"
        self.target_username = "getupsoft_"

    def verify_account(self, instagram_business_id):
        """Verifica que el ID de cuenta corresponda al username 'getupsoft_'."""
        url = f"{self.base_url}/{instagram_business_id}"
        params = {
            'fields': 'username',
            'access_token': self.access_token
        }
        try:
            # response = requests.get(url, params=params)
            # data = response.json()
            # current_user = data.get('username')
            current_user = "getupsoft_" # Simulado para este paso
            
            if current_user == self.target_username:
                logger.info(f"Cuenta verificada: {current_user}. Procediendo...")
                return True
            else:
                logger.error(f"¡ADVERTENCIA! La cuenta detectada ({current_user}) no coincide con '{self.target_username}'. Operación cancelada.")
                return False
        except Exception as e:
            logger.error(f"Error al verificar la cuenta: {e}")
            return False

    def update_profile_bio(self, instagram_business_id, new_bio):
        if not self.verify_account(instagram_business_id):
            return
        
        logger.info(f"Actualizando biografía para la cuenta oficial {self.target_username}...")
        
        # Endpoint conceptual (La API de Instagram Business varía según el nivel de partner)
        url = f"{self.base_url}/{instagram_business_id}"
        payload = {
            'biography': new_bio,
            'access_token': self.access_token
        }
        
        try:
            # En un entorno real, aquí se realizaría el POST
            # response = requests.post(url, data=payload)
            # response.raise_for_status()
            logger.info("Bio actualizada exitosamente (Simulado).")
            print(f"Nueva Bio: {new_bio}")
        except Exception as e:
            logger.error(f"Error al actualizar la bio: {e}")

    def generate_auth_url(self):
        """Genera la URL para obtener el código de autorización del usuario."""
        redirect_uri = "https://getupsoft.com/auth/callback" # Cambiar por tu URL real
        url = (f"https://www.facebook.com/v19.0/dialog/oauth?"
               f"client_id={self.app_id}&"
               f"redirect_uri={redirect_uri}&"
               f"scope=instagram_basic,instagram_manage_insights,instagram_manage_comments")
        return url

if __name__ == "__main__":
    # Rebranding Context
    NEW_BIO = (
        "Getupsoft | Enterprise AI & Infrastructure\n"
        "🚀 Scalability & Intelligence for Modern Enterprise.\n"
        "🇩🇴 Aliados en Odoo, Redes y Soporte en RD.\n"
        "🔗 getupsoft.com | getupsoft.com.do"
    )

    rebrander = InstagramRebrander(INSTA_APP_ID, INSTA_APP_SECRET, INSTA_ACCESS_TOKEN)
    
    if not INSTA_ACCESS_TOKEN:
        print("Falta el Access Token. Genera la URL de autorización para el usuario:")
        print(rebrander.generate_auth_url())
    else:
        # Aquí se ejecutaría la lógica con un ID de cuenta real
        # rebrander.update_profile_bio("INSTAGRAM_BUSINESS_ACCOUNT_ID", NEW_BIO)
        pass
