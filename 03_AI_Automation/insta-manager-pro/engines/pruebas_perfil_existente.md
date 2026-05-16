# Pruebas con Perfil Existente

Para realizar pruebas funcionales preservando la sesión de usuario (lo cual evita bloqueos de Cloudflare y mantiene los inicios de sesión de Instagram y Facebook), se debe lanzar Google Chrome conectándose a un puerto de depuración y utilizando el directorio de usuario y perfil específicos.

## Comando de Lanzamiento
El comando correcto para iniciar Chrome con el perfil "JOEL STALIN" (Profile 9) y abrir el puerto de depuración 9222 es el siguiente:

```bat
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 "--user-data-dir=C:\Users\yoeli\AppData\Local\Google\Chrome\User Data" "--profile-directory=Profile 9" --no-first-run --no-default-browser-check --start-maximized
```

### Detalles Clave:
1. **Comillas en las Rutas (`--user-data-dir` y `--profile-directory`)**: Todo el argumento debe ir entre comillas para que Windows procese correctamente los espacios. Ejemplo: `"--user-data-dir=C:\Ruta\Hasta\User Data"`. 
2. **Puerto `9222`**: Se abre el `remote-debugging-port` para que Selenium pueda interactuar con la sesión sin ejecutar una nueva instancia efímera de navegador.
3. **Cierre previo**: Se debe garantizar que todas las instancias de Chrome bajo ese mismo perfil estén cerradas (`taskkill /F /IM chrome.exe /T`) antes de lanzar el comando de arriba, de lo contrario Chrome simplemente enviará la señal al proceso existente y no abrirá el puerto.

## Ejecución con Selenium (Python/Pytest)
Una vez abierto este Chrome, `conftest.py` se conecta configurando las opciones de Chromium con el puerto de depuración local:

```python
from selenium.webdriver.chrome.options import Options
options = Options()
options.debugger_address = "127.0.0.1:9222"
driver = webdriver.Chrome(service=Service(), options=options)
```

Esto reutiliza las cookies y la sesión activa del usuario.
