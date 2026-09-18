# Prompt para Codex (GPT‑5.2) — Arreglar MSI que no funciona (pos_printing_suite)

## Objetivo
Tienes un repo de Odoo (Chefalitas) y un módulo/carpeta **pos_printing_suite/** que incluye o depende de un **instalador MSI** (Windows). El usuario reporta: **“el instalador MSI no funciona”**.
**Instrucción prioritaria:** corrige completamente los fixes necesarios y ejecuta todas las tareas del prompt hasta dejar el MSI funcionando, aunque tome el tiempo que haga falta.


Tu misión es:
1) Localizar exactamente el/los proyectos del instalador (WiX / Burn / Advanced Installer / Inno+MSI / MSIX / electron-builder MSI, etc.).
2) Reproducir el fallo o, si no puedes ejecutar, **diagnosticarlo leyendo código + scripts + pipeline**.
3) Aplicar correcciones en el repo (cambios de código y/o scripts) con enfoque de **clean code**, y dejar el instalador **reproducible**.
4) Entregar un PR/commit con:
   - Fix(es) del instalador
   - Documentación: cómo compilar y cómo obtener logs
   - (Opcional) CI para build artefactos
   - Notas de release y checklist de verificación.

---

## Entrada (lo que debes asumir)
- Repo local ya clonado: `Chefalitas/`
- El módulo está en `addons/pos_printing_suite/` o ruta similar.
- El instalador MSI puede estar dentro de ese módulo o en otra carpeta (ej. `installer/`, `windows/`, `build/`, `setup/`, `client/`, `pos_printing_suite/tools/`).

---

## Paso 0 — Descubrir dónde vive el MSI y cómo se construye
### 0.1 Buscar artefactos típicos de MSI/WiX
Ejecuta búsquedas en el repo:
- `*.wxs`, `*.wxi`, `*.wxl`, `*.wixproj`, `*.msi`, `*.msm`, `*.exe` (bootstrapper)
- `Burn`, `Bundle`, `candle.exe`, `light.exe`, `heat.exe`, `dark.exe`
- `ProductCode`, `UpgradeCode`, `Package`, `MajorUpgrade`, `MediaTemplate`
- `AdvancedInstaller`, `aip`
- `electron-builder`, `appId`, `msi`, `nsis`, `squirrel`, `msix`
- `setup.ps1`, `build.ps1`, `build.yml`, `release.yml`, `msbuild`, `dotnet publish`, `signtool`

### 0.2 Identificar el “entrypoint” de build
Encuentra:
- scripts de build (PowerShell/Bash)
- GitHub Actions / pipelines
- README o docs del instalador
- archivos `.sln/.csproj` si hay servicio Windows, .NET, etc.

Resultado esperado: una lista clara:
- **Ruta del proyecto instalador**
- **Comando exacto para build**
- **Qué binarios se empacan** (exe, dll, service, config, drivers, certificados, etc.)

---

## Paso 1 — Reproducir/diagnosticar el fallo “MSI no funciona”
### 1.1 Si tienes acceso a Windows para correrlo
Reproduce y genera log MSI (esto debe quedar documentado en el repo):
```bat
msiexec /i "ruta\instalador.msi" /L*V "%TEMP%\pos_printing_suite_install.log"
```
Y para desinstalar:
```bat
msiexec /x "ruta\instalador.msi" /L*V "%TEMP%\pos_printing_suite_uninstall.log"
```

### 1.2 Si NO puedes ejecutar
Entonces debes inferir el fallo por:
- Problemas clásicos de WiX/MSI (ver checklist abajo)
- Errores de configuración en Custom Actions
- Rutas hardcodeadas que no existen en runtime
- Mala definición de arquitectura (x86/x64)
- Prerrequisitos ausentes (.NET Desktop Runtime, VC++ redistributable, WebView2, etc.)
- Component GUIDs / KeyPath / files de usuario (self-repair)
- UAC/permisos (InstallScope, InstallPrivileges)
- Servicios Windows mal instalados/registrados
- Firma digital (SmartScreen / políticas)

---

## Paso 2 — Checklist de fallos típicos y cómo corregirlos (aplícalo al repo)
> Aplica solo los cambios que correspondan al caso real del repo.

### 2.1 Arquitectura incorrecta (x86 vs x64)
- Si el MSI es x64, asegúrate de `Package/@Platform="x64"` y `ProgramFiles64Folder`.
- No mezclar componentes 32-bit en carpeta 64-bit.
- Evitar validar/build x64 en entorno x86.

### 2.2 Upgrade/Versioning roto (MSI no actualiza o rompe upgrades)
- Implementar `MajorUpgrade` (WiX) o tablas equivalentes.
- Asegurar que `ProductVersion` cumple reglas MSI (x.y.z[.w]) y se incrementa correctamente.
- Mantener `UpgradeCode` estable entre versiones.

### 2.3 Custom Actions frágiles (principal causa de “no instala”)
- Minimizar Custom Actions.
- Si son obligatorias, usar:
  - `Deferred` + `NoImpersonate` para operaciones privilegiadas
  - Condiciones correctas `NOT Installed`, `REMOVE="ALL"`, etc.
- Nunca depender de paths temporales no garantizados.
- Loggear explícitamente (propiedades MSI + stdout/stderr) para diagnóstico.

### 2.4 Archivos/config por usuario (HKCU) o “self-repair”
- Evitar instalar config mutable como parte de componentes con KeyPath que luego cambian.
- Si necesitas configs editables, instalarlas como recursos iniciales y copiar/crear en runtime.

### 2.5 Prerrequisitos no gestionados
- Si la app requiere .NET runtime/VC++/WebView2:
  - Preferir bootstrapper (WiX Burn) o docs claras.
  - O incluir chequeo + mensaje de error legible (no crashear).

### 2.6 Servicios Windows
- Si hay un servicio:
  - Usar `ServiceInstall` + `ServiceControl` (WiX) correctamente
  - Asegurar permisos y cuenta de servicio
  - Manejar stop/start en upgrade/uninstall

### 2.7 Firma digital y políticas
- Si el instalador es bloqueado en ciertos equipos:
  - Agregar paso de signing en pipeline con `signtool`
  - Documentar requisitos de trust chain

---

## Paso 3 — Entregables (cambios en el repo)
### 3.1 Cambios de código
- Corrige lo que impida instalar/ejecutar.
- Ajusta rutas, permisos, servicios, prereqs, etc.
- Limpia scripts y agrega validaciones (fail fast con errores claros).

### 3.2 Documentación
Crea/actualiza:
- `addons/pos_printing_suite/INSTALLER.md` con:
  - build step-by-step (Windows)
  - prereqs
  - cómo generar logs MSI
  - troubleshooting por códigos MSI comunes

### 3.3 CI (si aplica)
- GitHub Actions:
  - build MSI en runner Windows
  - subir artefactos
  - (opcional) signing step

### 3.4 Evidencia mínima
Incluye en el PR:
- breve “Root cause”
- qué archivos tocaste y por qué
- cómo validar

---

## Paso 4 — “Definition of Done”
El trabajo está completo cuando:
- El MSI instala, repara y desinstala sin error en al menos:
  - Windows 10/11 (x64)
- La app/servicio incluido en pos_printing_suite arranca correctamente post-install
- Existen logs reproducibles y docs para diagnóstico
- El versionado/upgrade funciona (instala v1 → actualiza a v2 sin romper)

---

## Notas: referencias útiles (para guiar tu criterio)
- Para interpretar códigos MSI y mensajes: Windows Installer error messages.
- Problemas típicos de WiX/MSI (self-repair, configs, custom actions, per-user data).
- Errores comunes de x64 validation y paquetes no válidos.
- Logs de Burn / bootstrapper cuando aplique.

(Usa estas referencias solo como guía; la fuente de verdad es el repo.)

---
## Instrucción final
Trabaja de forma iterativa:
1) identifica dónde está el instalador
2) determina la causa raíz más probable con evidencia (código, scripts, pipeline)
3) aplica el fix mínimo pero robusto
4) agrega documentación y verificación


## Instrucción final
No omitas tareas ni simplifiques: ejecuta todos los pasos y corrige todos los fixes hasta que el MSI funcione.
