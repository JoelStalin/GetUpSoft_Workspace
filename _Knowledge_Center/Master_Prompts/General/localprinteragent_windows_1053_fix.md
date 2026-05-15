# LocalPrinterAgent en Windows: por qué falla con **[SC] StartService FAILED 1053** y cómo dejarlo 100% compatible

## Modo
AUTO

## Resumen del entendimiento
Tienes un agente local (WebSocket + impresión RAW con `pywin32`) y una GUI en Tkinter para:
- instalar/actualizar un “servicio”,
- iniciarlo/detenerlo,
- abrir firewall,
- listar/usar impresoras para que **Odoo** pueda imprimir en las impresoras del cliente.

Ahora Windows muestra **StartService FAILED 1053** (“The service did not respond…”) y además quieres:
- **evitar la ventana CMD**, y
- que no se **cierre** la app al ejecutar acciones (UAC, instalaciones, etc.).

## Estado de evidencias
**Provistas:** captura del error 1053 + tu código completo (GUI + “service” por `sc.exe`).  
**Faltan (muy útiles):** contenido de `agent.log` y `agent_gui.log` al fallar, y el **Event Viewer** (Visor de eventos) del servicio.

---

## Diagnóstico (causa raíz)
### 1) Por qué aparece 1053 en tu caso
Tu “servicio” se instala con `sc create ... binPath= "<python/pythonw o exe> script.py --service ..."`.  
Eso **NO** convierte tu proceso en un “Windows Service real”. El Service Control Manager espera que el proceso:
- se registre con el **Service Control Dispatcher** y
- reporte estado **START_PENDING/RUNNING** correctamente.

Si el binario no implementa el protocolo de servicio, Windows suele terminar mostrando **1053** (o el proceso muere) porque el servicio **no responde a los controles**. Este patrón aparece frecuentemente al intentar correr un `.exe` o script común como servicio usando solo `sc create`. citeturn2view0

> Nota: 1053 también puede ocurrir por “startup lento” y timeouts, y Windows sugiere `ServicesPipeTimeout`, pero eso es un *workaround* para servicios reales que tardan en levantar; no arregla un binario que no es service. citeturn1search3turn1search0

### 2) Por qué “se cierra” o se comporta raro con acciones
- Tu GUI usa elevación (UAC). Si relanzas otra instancia con admin, es normal que la primera quede “sin propósito”. Si además destruyes la ventana, se percibe como “se cierra solo”.
- Instalar dependencias vía pip en el hilo de GUI puede congelar la interfaz (ya empezaste a moverlo a `threading`, bien).

### 3) Por qué aparece una ventana CMD
- Si ejecutas con `python.exe` o un `.exe` “console”, Windows abre consola.
- Los `subprocess.run()` (pip, sc, netsh) pueden abrir consola si no ocultas explícitamente (ya agregaste `creationflags=CREATE_NO_WINDOW`, bien para esos procesos).
- El modo correcto de distribución suele ser **PyInstaller --noconsole** (GUI) o separar binarios.

---

## Soluciones 100% compatibles con Windows (elige 1)
### Opción A (recomendada si quieres “servicio real” sin herramientas externas): **Implementar Windows Service con pywin32**
Ya dependes de `pywin32` por impresión; úsalo también para el servicio.

Ventajas:
- `services.msc`, `sc start/stop`, recovery, delayed start: todo funciona “nativo”.
- Adiós 1053 por “no ser servicio”.

Base de referencia: ejemplo mínimo de servicio con pywin32 + dispatcher y `HandleCommandLine`. citeturn2view2

#### Cambios clave
1) Agrega imports (solo en Windows):
```py
import win32serviceutil
import win32service
import win32event
import servicemanager
```

2) Crea una clase de servicio:
```py
class LocalPrinterAgentService(win32serviceutil.ServiceFramework):
    _svc_name_ = "LocalPrinterAgent"
    _svc_display_name_ = "LocalPrinterAgent"
    _svc_description_ = "LocalPrinterAgent WebSocket printing service for Odoo/POS."

    def __init__(self, args):
        super().__init__(args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)

    def SvcDoRun(self):
        servicemanager.LogInfoMsg("LocalPrinterAgent starting...")
        # Arranca el servidor en un hilo/loop y espera stop_event
        host = DEFAULT_HOST
        port = DEFAULT_PORT
        t = threading.Thread(target=run_agent_service, args=(host, port), daemon=True)
        t.start()
        win32event.WaitForSingleObject(self.stop_event, win32event.INFINITE)
        servicemanager.LogInfoMsg("LocalPrinterAgent stopping...")
        # Aquí deberías señalizar al loop asyncio para cerrar el server limpiamente
```

3) Cambia el `__main__` para que Windows pueda invocar el dispatcher:
```py
if __name__ == "__main__":
    if is_windows() and len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(LocalPrinterAgentService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(LocalPrinterAgentService)
```

4) **Tu GUI ya no debe usar `sc create`** para “crear” el servicio.
En su lugar, desde la GUI (en admin) ejecuta:
- `LocalPrinterAgent.exe install`
- `LocalPrinterAgent.exe start`
- `LocalPrinterAgent.exe stop`
- `LocalPrinterAgent.exe remove`

Y para leer estado puedes seguir usando `sc query`, o usar win32serviceutil.

> Importante: al correr como servicio (LocalSystem), un **venv** no siempre aplica y dependencias pueden “no existir”. Es un problema común: el servicio corre bajo otra cuenta y no ve el entorno donde instalaste paquetes. citeturn1search1  
> Por eso, para producción: **empaca** todo en un `.exe` (PyInstaller) o instala dependencias “global” en el Python que usa el servicio.

#### Cierre limpio del WebSocket (para evitar corrupción)
Actualmente tu `asyncio.run(start_agent(...))` no tiene forma de recibir “stop”.  
Recomendación: construir un “stop flag” (thread-safe) y cerrar el server:

- En `start_agent(...)` guarda el objeto server retornado por `websockets.serve(...)`.
- Usa un `asyncio.Event` para señalizar parada.
- En `SvcStop`, dispara el evento mediante `loop.call_soon_threadsafe(...)`.

(Esto lo puedo dejar ya implementado si me pasas tu `agent.log`/event viewer y confirmas si el servicio debe correr bajo LocalSystem o un usuario específico).

---

### Opción B (muy práctica, sin tocar pywin32 service): **Usar WinSW (wrapper de servicio)**
WinSW es un wrapper que “envuelve” cualquier ejecutable como servicio de Windows. citeturn2view1  
Instalas el servicio con `winsw install` y WinSW se encarga de hablar con SCM.

Esto elimina 1053 porque **WinSW sí es un service real** y lanza tu app como child process.

Ejemplo conceptual:
- `LocalPrinterAgent.exe` (tu binario) corre en modo “headless”: `--agent`
- `winsw.exe` + `LocalPrinterAgent.xml` (config) => servicio nativo.

---

### Opción C (simple): **NSSM**
NSSM hace algo similar: instala un servicio que ejecuta un programa/script y maneja stdout/stderr. Se usa mucho para Python. citeturn0search2turn0search8

---

## Recomendación final (para tu caso Odoo + impresoras)
- **Producción**: Opción A (pywin32 service) o B (WinSW).
- Evita `pip install` en runtime. Empaca con PyInstaller o instala en el Python “global” del servicio.
- GUI separada del service:
  - `LocalPrinterAgentService.exe` (sin GUI)
  - `LocalPrinterAgentGUI.exe` (con GUI)
  Esto reduce bugs y elimina consola.

---

## Checklist de validación (Windows)
- [ ] En **Visor de eventos** → Windows Logs → Application: ¿hay traceback del servicio?
- [ ] `sc qc LocalPrinterAgent` muestra el binPath correcto (si usas WinSW/NSSM, apunta a esos).
- [ ] El servicio queda en estado RUNNING y responde a `sc stop`.
- [ ] `agent.log` se escribe en una ruta con permisos (ideal: `%ProgramData%\\LocalPrinterAgent\\agent.log`).
- [ ] No aparece CMD al abrir la GUI (PyInstaller `--noconsole` o ejecutar con `pythonw.exe`).
- [ ] El WebSocket responde a `{"command":"health"}` desde Odoo.

---

## Pregunta obligatoria de evidencias (para cerrarlo al 100%)
¿Dispones de alguna de las siguientes evidencias que puedas pegar (texto)?
- **Event Viewer**: el error/stacktrace del servicio al iniciar (Application log).
- Contenido de `agent.log` y `agent_gui.log` justo después del 1053.
- Resultado de: `sc query LocalPrinterAgent` y `sc qc LocalPrinterAgent`.
- ¿Lo ejecutas como `.py` o como `.exe` (PyInstaller)? ¿Qué versión de Windows?

---

## Prompt optimizado (para depuración guiada, copiar/pegar)
```md
Actúa como ingeniero senior de Windows Services y Python.

Contexto:
- Tengo un agente LocalPrinterAgent que expone WebSocket (websockets) y hace impresión RAW con pywin32 (win32print).
- Actualmente lo instalo como servicio usando sc.exe con binPath apuntando a python/script o a un exe.
- Al iniciar en services.msc obtengo: StartService FAILED 1053.
- Quiero cero ventanas CMD y compatibilidad total Windows.

Evidencias (pegar):
1) Event Viewer → Windows Logs → Application (entradas del servicio)
2) agent.log y agent_gui.log
3) sc query LocalPrinterAgent
4) sc qc LocalPrinterAgent
5) Cómo fue empaquetado (py / exe, PyInstaller flags)

Tarea:
1) Diagnosticar causa del 1053 basado en evidencias.
2) Proponer la solución más robusta: (A) servicio real con pywin32, o (B) wrapper WinSW/NSSM.
3) Entregar parches concretos de código y comandos de instalación.
4) Asegurar que no se abra CMD (subprocess flags + empaquetado).
```
