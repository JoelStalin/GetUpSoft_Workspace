# Electric Boat 29ft — Scripts WAVE 0 y WAVE 1

Estos scripts implementan las primeras tareas del plan (`TASK-1` a `TASK-5`).
Deben ejecutarse **localmente**, en tu máquina Windows, desde:

```
C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat
```

Requieren `Motor Boat.zip` y `mcp-1.0.0.zip` presentes en ese directorio
(o pasa rutas explícitas con los parámetros del script).

## Orden de ejecución

### TASK-1 — Setup del proyecto
```powershell
.\01_setup_project.ps1 -MotorBoatZip ".\Motor Boat.zip" -McpZip ".\mcp-1.0.0.zip"
```
Crea el árbol de carpetas `electric_boat_29ft/`, copia `board.blend` como
`source/board_original.blend` (protegido, nunca se sobrescribe), crea la
copia de trabajo `blender/electric_boat_29ft.blend`, copia texturas y
extrae el addon MCP.

### TASK-2 — Verificar/instalar Blender ≥5.1.0
```powershell
.\02_verify_blender.ps1
```
Si Blender no está instalado o es una versión inferior, el script te dará
los pasos manuales (no descarga binarios automáticamente). Vuelve a
ejecutarlo tras instalar para confirmar `AC-2.1` y `AC-2.2`.

### TASK-3 — Instalar/habilitar el addon MCP
Manual por ahora (depende de la UI de preferencias de Blender):
1. Abre Blender 5.1+
2. Edit → Preferences → Add-ons → Install...
3. Selecciona `electric_boat_29ft/mcp/` (el .zip extraído o el archivo del addon)
4. Habilita el addon "MCP"
5. Configura host=`localhost`, port=`9876` en las preferencias del addon
6. Ejecuta el operador `blmcp.server_start` (Search → "MCP Server Start" en Blender)

### TASK-4 — Probar conexión MCP
Esto lo ejecuta el agente (Claude Code) conectándose al MCP ya corriendo,
confirmando las 5 operaciones: consultar escena, listar objetos, leer
transforms, ejecutar python, guardar el .blend.

### TASK-5 — Auditoría de la escena original
Una vez el MCP esté activo, ejecuta `scene_audit.py` dentro de Blender,
por ejemplo vía el operador de ejecución de Python del MCP, o directamente:

```powershell
blender --background "electric_boat_29ft\blender\electric_boat_29ft.blend" --python scene_audit.py
```//
(ejecutar desde el directorio del proyecto para que las rutas relativas
`electric_boat_29ft/docs/...` resuelvan bien; ajusta si tu working dir es otro)

Esto genera `electric_boat_29ft/docs/original_scene_audit.md` con el
inventario completo: collections, objetos, dimensiones, materiales,
texturas (incluye detección de texturas faltantes), cámaras, luces y
candidatos heurísticos a Hull/Deck/Console/etc. — todo marcado como
"candidato" para que TÚ confirmes, no como verdad asumida.

## Después de cada tarea

Dile a Claude (en el chat de planificación): `TASK-{n} lista para revisión`
para que el Authorizer Agent valide contra los criterios de aceptación
antes de desbloquear la siguiente wave.
