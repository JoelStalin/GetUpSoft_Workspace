# Prompt para Claude — Modificar bot existente con Selenium, Chrome profile local, demo visible y pruebas funcionales

## Uso previsto
Este prompt está optimizado para que Claude **empiece a implementar de inmediato** una versión **segura y permitida** del bot existente.

**Alcance permitido:**
- reutilizar un perfil local de Chrome para **navegación asistida**;
- abrir páginas autorizadas en modo visible;
- detectar nombre visible de una página/perfil cargado;
- construir un **borrador** de mensaje personalizado;
- ubicar el área de texto, cuando exista, **sin enviar**;
- mostrar pruebas funcionales **en vivo** con Selenium;
- registrar logs, capturas y resultados PASS/FAIL.

**Fuera de alcance:**
- envío automático de mensajes privados;
- follows automáticos;
- invitaciones automáticas;
- cualquier táctica para evadir límites, detección, CAPTCHA o políticas de plataforma;
- uso del perfil para operar cuentas autenticadas sin revisión humana.

---

## Instrucciones para Claude

Quiero que modifiques un bot existente en **Python + Selenium** para convertirlo en una herramienta de **navegación asistida y prueba funcional visible**, con foco en trazabilidad, seguridad y revisión manual.

No me des solo recomendaciones. **Empieza a implementar directamente** con estructura de proyecto, archivos, código, plan de ejecución y criterios de aceptación.

Trabaja con estas reglas:

1. **Nunca envíes mensajes automáticamente.**
2. **Nunca automatices follows, likes, comentarios, invitaciones ni DMs.**
3. **Nunca implementes evasión de detección, rate limits, bloqueos, CAPTCHA o restricciones de plataforma.**
4. Usa un **perfil local existente de Chrome** solo para navegación asistida, cargándolo con:
   - `--user-data-dir`
   - `--profile-directory`
5. Ejecuta todo en **modo visible**; no headless.
6. El usuario debe poder **ver en vivo** cada paso que Selenium realice.
7. Toda acción sensible debe quedar en **`dry_run=true`** por defecto.
8. Si detectas que el perfil está en uso o bloqueado, **aborta con error claro**.
9. Si no puedes detectar un nombre confiable, usa fallback neutral y marca el caso para revisión manual.
10. Toda interacción sensible debe detenerse **antes de cualquier envío**.

---

## Objetivo funcional

Modificar el bot para que haga este flujo:

1. Cargar configuración local.
2. Abrir Chrome con un perfil local existente.
3. Navegar a una URL permitida.
4. Esperar a que la página cargue visualmente.
5. Extraer:
   - nombre visible;
   - username o identificador visible, si existe;
   - URL actual;
   - timestamp;
6. Generar un borrador de mensaje personalizado con el nombre detectado.
7. Mostrar ese mensaje en consola y en un archivo de salida.
8. Intentar ubicar el campo de texto o zona de interacción **solo como prueba funcional**.
9. Precargar el borrador **solo si existe confirmación humana explícita**, pero **sin enviarlo**.
10. Pausar y detenerse antes de cualquier acción irreversible.
11. Tomar capturas y registrar logs estructurados de todo el flujo.
12. Emitir un reporte de prueba con estado por paso: `PASS`, `FAIL`, `SKIPPED`.

---

## Contexto de negocio que debes preservar

El mensaje que se quiere preparar como borrador es este, personalizado con el nombre detectado:

```text
¡Hola, {nombre_persona}! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi {nombre_persona}! I hope you're doing well. It's Daniello from the jewelry store. 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
Facebook: https://www.facebook.com/profile.php?id=61574429843836
Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea
```

Si no hay nombre confiable, usa esta versión:

```text
¡Hola! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi! I hope you're doing well. It's Daniello from the jewelry store. 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
Facebook: https://www.facebook.com/profile.php?id=61574429843836
Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea
```

---

## Alcance de pruebas permitido

Puedes usar páginas/perfiles abiertos por el operador **solo para validación visual y extracción de datos visibles**, sin envío de mensajes. En particular, el sistema debe soportar pruebas funcionales sobre páginas como:

- `https://galantesjewelry.com`
- una página/perfil cargado por el usuario en navegador visible

Si el operador decide abrir páginas de Instagram o Facebook para la demo, el bot solo podrá:
- verificar carga visual;
- extraer nombre visible;
- generar borrador;
- localizar, si existe, un campo de interacción;
- detenerse antes de enviar.

---

## Requisitos técnicos obligatorios

### Stack
- Python 3.11+
- Selenium
- Chrome / Chromium
- ChromeDriver vía Selenium Manager o equivalente
- `logging`
- `pathlib`
- `dataclasses` o `pydantic` para configuración/resultados
- `pytest` para pruebas unitarias mínimas

### Modo de ejecución
- `dry_run=true` por defecto
- `live_demo=true` habilitable por config
- `manual_approval_required=true` obligatorio
- `headless=false` obligatorio
- `send_message=false` fijo

### Configuración
Implementa un `config.json` o `.env` con al menos:

```json
{
  "chrome_user_data_dir": "<ruta_local>",
  "chrome_profile_directory": "<perfil_local>",
  "allowed_domains": ["galantesjewelry.com"],
  "dry_run": true,
  "live_demo": true,
  "manual_approval_required": true,
  "step_delay_ms": 1200,
  "screenshots_enabled": true,
  "artifacts_dir": "./artifacts",
  "output_dir": "./output"
}
```

### Seguridad operativa
- Validar que la URL objetivo pertenece a `allowed_domains` o fue aprobada explícitamente por el operador.
- Validar que Chrome no esté usando simultáneamente el mismo perfil; si lo está, abortar.
- Nunca leer contraseñas ni automatizar login.
- Nunca mutar configuración del navegador para reducir controles de seguridad.
- Nunca añadir flags orientados a ocultar automatización o evadir detección.

---

## Entregables que debes producir

Claude debe devolver una propuesta **implementable ya**, con:

1. **Estructura de proyecto**.
2. **Archivos a crear o modificar**.
3. **Código inicial completo** para los módulos principales.
4. **Plan de implementación por fases**.
5. **Checklist de aceptación**.
6. **Comandos de ejecución local**.
7. **Estrategia de pruebas**.
8. **Manejo de errores**.
9. **Formato de logs y evidencias**.
10. **Supuestos explícitos**.

---

## Estructura objetivo sugerida

```text
bot/
  main.py
  config.py
  browser.py
  navigator.py
  extractors.py
  message_builder.py
  interaction_probe.py
  approvals.py
  reporter.py
  models.py
  utils/
    waits.py
    screenshots.py
    logging_setup.py
    validators.py
tests/
  test_message_builder.py
  test_validators.py
artifacts/
output/
config.example.json
README.md
```

---

## Diseño funcional esperado

### 1) `config.py`
Debe:
- cargar configuración;
- validar paths;
- validar banderas obligatorias;
- exponer una clase `AppConfig`.

### 2) `browser.py`
Debe:
- crear el driver de Chrome;
- aplicar `--user-data-dir`;
- aplicar `--profile-directory`;
- forzar modo visible;
- configurar timeouts razonables;
- devolver un wrapper de sesión.

### 3) `navigator.py`
Debe:
- navegar a una URL;
- esperar estabilidad básica del DOM;
- verificar dominio permitido;
- registrar evento y captura.

### 4) `extractors.py`
Debe:
- intentar detectar nombre visible de la página/perfil;
- intentar detectar username visible;
- exponer nivel de confianza;
- usar selectores escalonados y fallback por heurística;
- registrar qué selector funcionó.

### 5) `message_builder.py`
Debe:
- recibir `nombre_persona`;
- sanitizar espacios y caracteres raros;
- construir mensaje final;
- aplicar fallback si el nombre no es confiable.

### 6) `interaction_probe.py`
Debe:
- buscar áreas de input o interacción;
- resaltar visualmente el elemento encontrado;
- opcionalmente precargar el borrador **solo con aprobación humana**;
- detenerse antes de cualquier envío;
- no hacer click en botones de enviar.

### 7) `approvals.py`
Debe:
- pedir confirmación humana explícita para cualquier paso sensible;
- soportar aprobación por consola;
- registrar la decisión.

### 8) `reporter.py`
Debe:
- generar JSON o CSV con:
  - `platform`
  - `url`
  - `nombre_detectado`
  - `username_detectado`
  - `mensaje_generado`
  - `selector_exitoso`
  - `probe_result`
  - `screenshots`
  - `status_by_step`
  - `timestamp`
- generar un resumen legible en terminal.

---

## Experiencia visual en vivo

Implementa la demo para que el usuario vea claramente cada etapa:

- navegador visible;
- pausas entre pasos (`step_delay_ms`);
- logging en consola;
- resaltado temporal del elemento detectado con JavaScript permitido para debugging visual;
- captura de pantalla por hito;
- mensajes tipo:
  - `[STEP] Opening browser with configured profile`
  - `[STEP] Navigating to target URL`
  - `[PASS] Visible name detected: Joel`
  - `[STEP] Building draft message`
  - `[STEP] Probing message field`
  - `[SKIPPED] Send action intentionally disabled`

---

## Plan de implementación que debes seguir

### Fase 1 — Bootstrap
- Crear estructura de carpetas.
- Crear `config.example.json`.
- Implementar `AppConfig` y validaciones.
- Implementar `logging_setup.py`.

### Fase 2 — Browser session
- Implementar `browser.py`.
- Abrir Chrome con perfil local.
- Validar errores comunes de perfil en uso.

### Fase 3 — Navegación y evidencias
- Implementar `navigator.py`.
- Navegar a URL objetivo.
- Esperar carga.
- Tomar screenshot inicial.

### Fase 4 — Extracción
- Implementar `extractors.py`.
- Detectar nombre visible.
- Detectar identificador visible.
- Registrar confianza y selector usado.

### Fase 5 — Construcción de mensaje
- Implementar `message_builder.py`.
- Añadir pruebas unitarias del mensaje.

### Fase 6 — Prueba funcional asistida
- Implementar `interaction_probe.py`.
- Buscar input o caja de texto.
- Resaltar elemento.
- Precargar borrador solo si hay aprobación manual.
- Nunca enviar.

### Fase 7 — Reporte
- Implementar `reporter.py`.
- Exportar resultados y capturas.

### Fase 8 — CLI / main
- Orquestar todo desde `main.py`.
- Añadir opciones básicas por CLI.

---

## Criterios de aceptación

Claude debe construir la solución de forma que estas validaciones sean verdaderas:

1. El navegador abre con el perfil configurado en modo visible.
2. Si el perfil está en uso, el sistema falla con mensaje claro.
3. El bot solo navega a dominios permitidos o aprobados.
4. El sistema detecta un nombre visible cuando existe.
5. El mensaje personalizado se genera correctamente.
6. El sistema puede mostrar el flujo en vivo con pausas y logs.
7. Puede ubicar un campo de interacción cuando exista.
8. Puede precargar un borrador solo con aprobación manual.
9. Nunca presiona enviar.
10. Genera evidencias reproducibles: logs, screenshots y reporte estructurado.

---

## Formato de salida que quiero de Claude

Devuélveme la respuesta en este orden:

1. **Resumen ejecutivo** de lo que vas a implementar.
2. **Supuestos**.
3. **Árbol de archivos**.
4. **Código completo** de los archivos principales.
5. **Código de pruebas unitarias mínimas**.
6. **Ejemplo de `config.example.json`**.
7. **Comandos para ejecutar**.
8. **Qué queda pendiente**.
9. **Riesgos y límites**.

No me pidas confirmación para arrancar. Empieza por generar la estructura y el código base directamente.

---

## Nota final de cumplimiento

Este trabajo debe mantenerse estrictamente en una modalidad de:
- navegación asistida,
- pruebas funcionales visibles,
- generación de borradores,
- revisión humana,
- no envío,
- no automatización de interacción masiva.

Cualquier parte del bot que actualmente haga envío automático, follow automático o invitaciones automáticas debe ser **deshabilitada, removida o encapsulada detrás de una protección dura que impida su ejecución**.
