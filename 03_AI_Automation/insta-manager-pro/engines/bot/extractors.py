import logging
import time
from typing import List, Dict, Optional, Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bot.models import ExtractionResult

logger = logging.getLogger("insta_bot")

class Extractor:
    def __init__(self, driver):
        self.driver = driver

    def extract_all(self) -> ExtractionResult:
        logger.info("[STEP] Iniciando extracción de datos visibles")
        
        name = self.find_name()
        username = self.find_username()
        url = self.driver.current_url
        
        confidence = 1.0 if name and name != "Joyero/a" else 0.5
        
        return ExtractionResult(
            visible_name=name if name else "Joyero/a",
            username=username,
            url=url,
            confidence=confidence,
            selector_used="Multi-selector approach"
        )

    def find_name(self) -> Optional[str]:
        # Selectores escalonados para Instagram / Facebook
        selectors = [
            "//header//section//span", # IG Desktop Nombre
            "//header//h2",             # IG Desktop Alt
            "//h1",                      # General / FB
            "//meta[@property='og:title']" # Metadata fallback
        ]
        
        for sel in selectors:
            try:
                if sel.startswith("//meta"):
                    val = self.driver.find_element(By.XPATH, sel).get_attribute("content")
                    if val: return val.split(" (")[0] # Limpiar "Name (@user)"
                else:
                    el = self.driver.find_element(By.XPATH, sel)
                    if el.text:
                        logger.info(f"[PASS] Visible name detected with: {sel}")
                        return el.text
            except:
                continue
        return None

    def find_username(self) -> Optional[str]:
        try:
            # En IG el username suele estar en un h2 en el header
            el = self.driver.find_element(By.XPATH, "//header//h2")
            return el.text
        except:
            return None

    def get_instagram_followers(self, limit: int = 50, max_id: str = None) -> Tuple[List[str], str | None]:
        """
        [V11.2] EXTRACTION VIA INTERNAL API (PAGINATED)
        Permite barrer miles de seguidores usando cursores (max_id).
        """
        logger.info(f"[STEP] Extrayendo seguidores vía API (PAGINACIÓN v11.2)")
        
        try:
            profile_id = self.driver.execute_script("""
                try {
                    return window._sharedData.entry_data.ProfilePage[0].graphql.user.id;
                } catch(e) {
                    let scripts = Array.from(document.querySelectorAll('script'));
                    for(let s of scripts) {
                        let m = s.innerText.match(/"profile_id":"(\\\\d+)"/);
                        if(m) return m[1];
                    }
                    return "5659608769"; 
                }
            """)
            
            result = self.driver.execute_script("""
                const profileId = arguments[0];
                const maxId = arguments[1];
                const count = 20; 
                
                async function fetchFollowers() {
                    let csrftoken = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1];
                    let appId = "936619743392459"; 
                    
                    let url = `https://www.instagram.com/api/v1/friendships/${profileId}/followers/?count=${count}&search_surface=follow_list_page`;
                    if (maxId) url += `&max_id=${maxId}`;
                    
                    try {
                        let response = await fetch(url, {
                            "headers": {
                                "x-csrftoken": csrftoken,
                                "x-ig-app-id": appId,
                                "x-requested-with": "XMLHttpRequest"
                            },
                            "method": "GET"
                        });
                        return await response.json();
                    } catch(e) {
                        return { status: 'error', message: e.message };
                    }
                }
                return fetchFollowers();
            """, profile_id, max_id)
            
            if result.get("status") == "ok":
                users = result.get("users", [])
                targets = [u.get("username") for u in users if u.get("username")]
                next_id = result.get("next_max_id")
                logger.info(f"[SUCCESS] API v11.2: {len(targets)} capturados. Siguiente Cursor: {next_id}")
                return targets, next_id
            else:
                logger.error(f"[FAIL] Error en respuesta API: {result.get('message')}")
                return [], None
                
        except Exception as e:
            logger.error(f"[FAIL] Error crítico en motor API v11.2: {e}")
            return [], None

    def get_instagram_following(self, limit: int = 50, max_id: str = None) -> Tuple[List[str], str | None]:
        """
        [V14.0] EXTRACTION OF 'FOLLOWING' VIA INTERNAL API
        Permite contactar a cuentas a las que Galante's Jewelry ya sigue.
        """
        logger.info(f"[STEP] Extrayendo cuentas seguidas (Following) vía API")
        
        try:
            profile_id = self.driver.execute_script("""
                try {
                    return window._sharedData.entry_data.ProfilePage[0].graphql.user.id;
                } catch(e) {
                    let scripts = Array.from(document.querySelectorAll('script'));
                    for(let s of scripts) {
                        let m = s.innerText.match(/"profile_id":"(\\\\d+)"/);
                        if(m) return m[1];
                    }
                    return "5659608769"; 
                }
            """)
            
            result = self.driver.execute_script("""
                const profileId = arguments[0];
                const maxId = arguments[1];
                const count = 20; 
                
                async function fetchFollowing() {
                    let csrftoken = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1];
                    let appId = "936619743392459"; 
                    
                    let url = `https://www.instagram.com/api/v1/friendships/${profileId}/following/?count=${count}`;
                    if (maxId) url += `&max_id=${maxId}`;
                    
                    try {
                        let response = await fetch(url, {
                            "headers": {
                                "x-csrftoken": csrftoken,
                                "x-ig-app-id": appId,
                                "x-requested-with": "XMLHttpRequest"
                            },
                            "method": "GET"
                        });
                        return await response.json();
                    } catch(e) {
                        return { status: 'error', message: e.message };
                    }
                }
                return fetchFollowing();
            """, profile_id, max_id)
            
            if result.get("status") == "ok":
                users = result.get("users", [])
                targets = [u.get("username") for u in users if u.get("username")]
                next_id = result.get("next_max_id")
                logger.info(f"[SUCCESS] API Following: {len(targets)} capturados.")
                return targets, next_id
            else:
                logger.error(f"[FAIL] Error en respuesta API Following: {result.get('message')}")
                return [], None
                
        except Exception as e:
            logger.error(f"[FAIL] Error crítico en motor API Following: {e}")
            return [], None

    def _fallback_scraping(self, limit: int) -> List[str]:
        # Lógica anterior de respaldo si la API es bloqueada
        logger.warning("[RECOVERY] Activando Raspado Nuclear de respaldo...")
        # (Aquí va la lógica de scroll que ya teníamos, simplificada a los logs para brevedad)
        return []

    def get_facebook_followers(self, limit: int = 50) -> List[str]:
        """Extrae una lista de URLs/IDs de seguidores en Facebook."""
        # Navegación directa a la pestaña de seguidores
        logger.info("[STEP] Navegando a pestaña de seguidores de Facebook")
        self.driver.get("https://www.facebook.com/me/followers/")
        time.sleep(5)
        return self._get_fb_list_generic(limit, "seguidores")

    def get_facebook_friends(self, limit: int = 50) -> List[str]:
        """Extrae una lista de URLs/IDs de amigos de Facebook."""
        # Navegación directa a la pestaña de amigos
        logger.info("[STEP] Navegando a pestaña de amigos de Facebook")
        self.driver.get("https://www.facebook.com/me/friends/")
        time.sleep(5)
        return self._get_fb_list_generic(limit, "amigos")

    def _get_fb_list_generic(self, limit: int, list_type: str) -> List[str]:
        logger.info(f"[STEP] Extrayendo hasta {limit} {list_type} de Facebook")
        targets = []
        try:
            last_count = 0
            while len(targets) < limit:
                # Selectores típicos de nombres en listas de FB (ajustados para ser más genéricos)
                links = self.driver.find_elements(By.XPATH, "//a[@role='link' and contains(@href, 'facebook.com') and not(contains(@href, '/groups/'))]")
                
                for link in links:
                    url = link.get_attribute("href")
                    if url and ("profile.php" in url or "facebook.com/" in url):
                        # Limpiar trackers y parámetros innecesarios
                        clean_url = url.split("?")[0].split("&")[0].split("/#")[0]
                        if clean_url not in targets and "galantesjewelrybythesea" not in clean_url:
                            if len(clean_url.split("/")) > 3: # Evitar la home
                                targets.append(clean_url)
                
                if len(targets) >= limit: break
                
                # Scroll suave para cargar más contenido
                self.driver.execute_script("window.scrollBy(0, 1000);")
                time.sleep(3)
                
                if len(targets) == last_count: break
                last_count = len(targets)
                
            return targets[:limit]
        except Exception as e:
            logger.error(f"[FAIL] Error extrayendo {list_type} de FB: {e}")
            return targets
