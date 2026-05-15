# LocalPrinterAgent (Windows) – Diagnóstico y correcciones para: “se cierra”, UAC y ventana CMD

## Modo
AUTO

## Resumen del entendimiento
Tienes un ejecutable/script Python (Tkinter + Windows Service + WebSocket) para que **Odoo (POS u otro módulo)** pueda:
- **Listar impresoras** del cliente.
- **Enviar tickets** (RAW/ESC-POS) a la impresora local.
- Controlar instalación/arranque/parada del servicio desde una GUI.

Problemas reportados:
1) **La app se cierra** “cada vez que se ejecuta una acción”.
2) Se abre una **ventana CMD innecesaria** (parpadea o queda abierta).
3) Objetivo: que Odoo vea/controle impresoras vía el agente local.

---

## Estado de evidencias
**Provistas:**
- Código completo del componente (GUI + servicio + agente WS).

**No provistas (faltan para cerrar diagnóstico al 100%):**
- Traceback/log exacto cuando “se cierra”.
- Versión de Windows, cómo lo ejecutas (doble click .py, python.exe, pyinstaller .exe).
- Si las acciones que cierran son exactamente: instalar servicio / iniciar / detener / firewall, etc.

---

## Diagnóstico (por qué “se cierra”)
En tu código, esto es lo más probable:

### Causa A (muy probable): `require_admin_or_relaunch()` destruye la GUI
Cuando pulsas acciones que requieren admin (instalar/actualizar servicio, iniciar/detener, firewall, eliminar), se llama:

```py
ok = relaunch_as_admin()
...
self.destroy()
return False
```

Esto **cierra intencionalmente** la instancia actual para que la nueva instancia (elevada) continúe.  
Si el usuario cancela UAC, o si el relanzamiento falla, el cierre se percibe como “se cierra al ejecutar”.

✅ Solución: **No destruir** la GUI automáticamente, o separar “modo admin” con un botón “Reabrir como administrador”.

### Causa B (común): excepción no capturada en callbacks de Tkinter
Si ocurre un error en un handler (por ejemplo `pip install` con fallo, `sc` devuelve error y algo intenta parsear), Tkinter a veces termina si no se captura y no se loguea.

✅ Solución: envolver callbacks con try/except + logging consistente.

### Causa C (UX): acciones largas bloquean la GUI y Windows “mata” o el usuario la cierra
`ensure_dependencies()` ejecuta `pip install` en el hilo principal. Eso congela la ventana. No es “crash”, pero se siente como cierre/colgado.

✅ Solución: ejecutar tareas largas en **thread**.

---

## Diagnóstico (por qué abre ventana CMD)
Esto depende de cómo lo ejecutes:

- Si lo ejecutas como `.py` con `python.exe` (o desde consola), **siempre** habrá consola.
- Si lo compilas con PyInstaller sin `--noconsole/--windowed`, abre consola.
- Incluso con GUI, **subprocess** puede abrir una ventana cuando invocas comandos (`sc`, `netsh`, `pip`) si no ocultas la ventana.

✅ Solución: usar **pythonw.exe** / PyInstaller `--noconsole` y, además, ocultar ventanas en `subprocess.run`.

---

## Cambios recomendados (rápidos, de alto impacto)

### 1) Evitar que la app se cierre al pedir UAC
Opción simple (recomendada para estabilidad):  
**No relanzar automáticamente**. En su lugar:
- Mostrar estado “No admin”.
- Incluir botón “Abrir como administrador”.
- Las acciones admin muestran aviso y cancelan (sin cerrar GUI).

#### Parche sugerido (mínimo)
Reemplaza `require_admin_or_relaunch()` por:

```py
def require_admin_or_relaunch(self, reason: str) -> bool:
    if is_admin():
        return True
    messagebox.showwarning(
        "Permisos requeridos",
        f"Para {reason} se requieren permisos de Administrador.\n"
        f"Ejecuta la aplicación como Administrador (clic derecho → Run as administrator)."
    )
    self.log(f"Permisos insuficientes para: {reason}. No se cerró la app.")
    return False
```

> Esto elimina el “cierre automático”.  
> Si quieres mantener relanzamiento, hazlo **sin destruir** la instancia, o destruye solo cuando confirmes que el proceso elevado arrancó y el usuario lo ve.

---

### 2) Ocultar la ventana CMD de subprocess (sc/netsh/pip)
Modifica `run()` para Windows:

```py
def run(cmd: list[str], cwd: Optional[str] = None, timeout: Optional[int] = None) -> Tuple[int, str]:
    kwargs = dict(capture_output=True, text=True, cwd=cwd, timeout=timeout)
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        si.wShowWindow = 0  # SW_HIDE
        kwargs["startupinfo"] = si
    p = subprocess.run(cmd, **kwargs)
    out = (p.stdout or "") + "\n" + (p.stderr or "")
    return p.returncode, out.strip()
```

✅ Esto reduce muchísimo el “parpadeo” de CMD cuando pulsas botones.

---

### 3) No instalar dependencias en runtime (producción)
`pip install` en el cliente suele ser fuente #1 de fallos (permisos, proxy, sin internet, antivirus).

✅ Recomendación:
- Empaqueta en un `.exe` (PyInstaller) incluyendo `websockets` y `pywin32`.
- Elimina instalación dinámica o déjala solo como “modo dev”.

---

### 4) Listar impresoras: incluir impresoras de red / conexiones
En Windows estás usando solo `PRINTER_ENUM_LOCAL`. Eso omite impresoras conectadas por usuario o conexiones.

Mejor:

```py
printers = [p[2] for p in win32print.EnumPrinters(
    win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
)]
```

---

### 5) Servicio y visibilidad de impresoras
Ojo: un **Windows Service** corre típicamente como `LocalSystem`.  
- Ese usuario **no ve** impresoras “por usuario” (conexiones mapeadas).
- Resultado: Odoo “no ve” impresoras aunque existan para el usuario.

✅ Soluciones:
- Ejecutar el servicio con una **cuenta de usuario** (la del operador POS).
- O no usar servicio: usar **tray app** en sesión del usuario (más compatible con impresoras por usuario).
- O combinar: servicio para WS + instalador que configure “Log On As” con credenciales (más complejo).

---

## Arquitectura recomendada para Odoo (visión rápida)
- Odoo (POS Frontend) → JS → `ws://127.0.0.1:9089`
- Comandos:
  - `health`
  - `list_printers`
  - `print_receipt` (enviar ESC/POS o RAW)

Siguiente paso: crear un módulo Odoo v17+ que:
- Añada configuración de impresora por POS (modelo + settings).
- Use un “Printer Driver” JS que hable con el WebSocket.
- Tenga fallback / manejo de errores (agent offline, permisos, etc.).

---

## Prompt optimizado (copiar/pegar)
> Úsalo para pedir a otra IA (o a mí) un refactor completo, con enfoque producción.

```md
# Prompt optimizado – Refactor LocalPrinterAgent (Windows) para Odoo POS

## Rol
Actúa como Arquitecto Senior (Windows + Python + Odoo POS). Prioriza estabilidad, UX y despliegue.

## Evidencias provistas
- Código completo del agente (Tkinter + sc.exe + netsh + websockets + win32print).

## Evidencias faltantes (pídelas, pero no bloquees)
- Traceback/agent.log/gui_log cuando se “cierra”.
- Cómo se ejecuta (python.exe / pythonw.exe / PyInstaller).
- Usuario del servicio (LocalSystem vs usuario).

## Objetivo
1) Evitar que la app GUI se cierre al ejecutar acciones (especialmente por UAC).
2) Evitar abrir ventanas CMD al ejecutar subprocess (sc/netsh/pip).
3) Mejorar listado de impresoras (incluyendo conexiones de red).
4) Recomendación de despliegue (PyInstaller, sin pip runtime).
5) Definir estrategia compatible con impresoras por usuario (service vs tray app).
6) Entregar parche (diff) o código actualizado, y checklist de pruebas.

## Restricciones
- No usar hacks inseguros.
- Manejo robusto de errores + logging.
- Tareas largas no deben bloquear Tkinter (usar thread + cola).
- No depender de internet para instalar paquetes en producción.

## Entregables
- Diagnóstico concreto (con referencias a funciones/líneas).
- Cambios mínimos + cambios ideales.
- Snippets listos para copiar.
- Plan de empaquetado PyInstaller (comandos).
- Checklist de QA (acciones GUI, servicio, impresión, ws).

## Formato
Devuelve un único .md con secciones:
- Problemas → Causas → Fix
- Código (snippets)
- Checklist
```

---

## Mejoras clave incluidas
- Eliminación del cierre automático por UAC (o alternativa controlada).
- `subprocess` sin ventana (CREATE_NO_WINDOW / STARTUPINFO).
- Impresoras de red (ENUM_CONNECTIONS).
- Alertas sobre servicios y contexto de usuario (impresoras por usuario).
- Recomendación de empaquetado (sin pip runtime).

---

## Técnicas aplicadas
- Debugging por lectura de código y rutas de ejecución.
- Hardened subprocess en Windows.
- Principio “no bloquear UI”.
- Diseño orientado a despliegue (offline-friendly).

---

## Checklist de validación (rápido)
- [ ] Al pulsar “Instalar/Actualizar servicio” como usuario normal, **NO se cierra** la GUI.
- [ ] Ninguna acción abre ventana CMD visible.
- [ ] `list_printers` lista impresoras locales y de red.
- [ ] El servicio inicia y mantiene `agent.log` con eventos.
- [ ] Impresión RAW produce ticket correcto (acentos/encoding).
- [ ] Odoo POS detecta “Agent online” y puede imprimir.

---

## Pregunta obligatoria de evidencias (para cerrar el diagnóstico)
¿Dispones de alguna de estas evidencias para ajustar el fix exacto?
- Traceback completo o contenido de `agent_gui.log` justo al “cierre”.
- Tu método de ejecución (py doble click / acceso directo / .exe PyInstaller).
- `sc query LocalPrinterAgent` + `sc qc LocalPrinterAgent` (salidas).
