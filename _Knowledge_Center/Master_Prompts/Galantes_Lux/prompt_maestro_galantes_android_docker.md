# Prompt maestro para refactorización integral, corrección del panel admin, persistencia de sesión, dockerización total, despliegue orientado a Android, pruebas Selenium y memoria técnica de largo plazo

## Rol y modo de ejecución obligatorio

Vas a trabajar sobre este repositorio:

**https://github.com/JoelStalin/Galantesjewerly.git**

Tu trabajo no es opinar ni sugerir. Tu trabajo es **auditar, refactorizar, implementar, probar, documentar y dejar evidencia reproducible**.

No cierres la tarea con explicaciones blandas. No termines hasta haber ejecutado los pasos, producido cambios concretos, corrido pruebas verificables y generado documentación técnica persistente.

---

## Contexto técnico ya detectado del repositorio

Debes partir de este contexto base y verificarlo en el repo antes de modificar código:

- Proyecto sobre **Next.js 16.2.1**, **React 19.2.4**, **TypeScript**, **Tailwind**.
- El repo ya tiene **Dockerfile**, **docker-compose.yml** y `next.config.ts` con `output: "standalone"`.
- El `README.md` indica infraestructura con **Docker + Nginx + Cloudflare Tunnel** y una memoria operativa en `/context`.
- A simple vista, las dependencias visibles no muestran todavía una solución clara de auth robusta, gestión de sesión persistente, subida de imágenes ni storage dedicado, así que debes verificar si el panel admin está incompleto, mal integrado o roto.

Debes validar y ampliar esta base con una auditoría real del proyecto.

---

## Objetivo final no negociable

Debes dejar el proyecto con una solución completa y reproducible para lo siguiente:

1. Reparar el panel admin donde las fotos no cargan y no se guardan.
2. Implementar persistencia de sesión real hasta logout manual.
3. Proteger correctamente todas las rutas del admin.
4. Garantizar que el flujo de imágenes funcione extremo a extremo.
5. Refactorizar lo necesario para que el proyecto quede **totalmente dockerizado**.
6. Revisar todas las dependencias y añadir sólo las estrictamente necesarias.
7. Adaptar el diseño de despliegue para un entorno orientado a **Android**.
8. Crear pruebas funcionales reales con **Selenium + Chrome** usando perfil persistente o clonado.
9. Generar una **memoria técnica de largo plazo** extremadamente detallada, consistente y actualizable.
10. Dejar un checklist final firmado por evidencia, no por afirmaciones.

---

## Restricción crítica sobre Android

Este servicio será desplegado en un entorno **Android**. No asumas sin verificar que Docker funciona nativamente igual que en una distro Linux de servidor.

Debes analizar este punto con seriedad y actuar de esta forma:

1. Determinar si el destino Android corre:
   - Docker nativo o equivalente real.
   - Termux.
   - Proot.
   - VM Linux sobre Android.
   - Orquestación remota desde Android hacia un host Docker.
   - Entorno alterno compatible con contenedores.
2. Si el objetivo Android **no soporta Docker de forma nativa y segura**, no ignores el requisito: debes dejar el proyecto **dockerizado igualmente**, pero además documentar una estrategia de despliegue viable para Android, separando:
   - desarrollo local
   - build de imágenes
   - ejecución real del contenedor
   - limitaciones del host Android
   - workaround recomendado
3. Debes producir una arquitectura de despliegue clara para Android que indique cuál de estas opciones es la recomendada:
   - Android como cliente/controlador de despliegue y el contenedor corriendo en host Linux remoto.
   - Android con VM Linux local donde sí corra Docker.
   - Android con entorno compatible limitado y ajustes necesarios.
4. Nunca maquilles una incompatibilidad real. Si Android impone límites, documéntalos y resuelve el despliegue con la opción más robusta disponible.

---

## Resultado exigido

Quiero que ejecutes este trabajo en fases obligatorias. Cada fase debe dejar entregables reales.

---

# FASE 0 — Auditoría exhaustiva del repo y de dependencias

Antes de tocar código, inspecciona el repositorio completo y construye un mapa técnico verificable.

### Debes localizar exactamente

- Estructura real del proyecto.
- Rutas públicas.
- Rutas admin.
- Componentes del panel admin.
- Layouts relevantes.
- Formularios del admin.
- Server actions.
- Route handlers.
- Middleware.
- Gestión de cookies.
- Uso de localStorage/sessionStorage si existe.
- Fuentes de datos del admin.
- Flujo de login.
- Flujo de logout.
- Estrategia actual de persistencia de sesión.
- Estrategia actual de subida de imágenes.
- Cómo se almacenan las imágenes hoy.
- Cómo se renderizan las imágenes hoy.
- Dependencias instaladas.
- Dependencias faltantes.
- Dependencias obsoletas o innecesarias.
- Docker actual.
- Compose actual.
- Compatibilidad del Docker actual con el flujo real de la app.
- Compatibilidad del build standalone con la app real.

### Auditoría de dependencias obligatoria

Debes analizar todas las dependencias del proyecto y clasificarlas en:

- esenciales y correctamente usadas
- esenciales pero mal usadas
- ausentes pero necesarias
- presentes pero innecesarias
- candidatas a reemplazo
- incompatibles o riesgosas para el objetivo actual

Debes prestar especial atención a dependencias relacionadas con:

- auth
- cookies
- storage
- uploads
- imágenes
- formularios
- validación
- E2E testing
- Selenium
- Docker
- Nginx
- despliegue
- Android constraints

### Entregables obligatorios de esta fase

Debes generar una auditoría inicial que incluya:

- mapa del repo
- flujo actual detectado
- síntomas reproducibles
- causa raíz principal preliminar
- causas secundarias preliminares
- lista exacta de archivos implicados
- deuda técnica visible
- riesgos visibles
- decisión de stack que vas a usar para reparar el sistema

**No empieces a editar sin haber completado y documentado esta fase.**

---

# FASE 1 — Reparación integral del panel admin y flujo de imágenes

Debes reparar el panel admin donde actualmente las fotos no cargan y no se guardan.

## Resultado mínimo obligatorio

Debe quedar funcionando este flujo completo:

1. Crear registro desde admin.
2. Seleccionar imagen.
3. Validar imagen.
4. Subir imagen.
5. Guardar registro con referencia persistente.
6. Mostrar la imagen guardada.
7. Recargar y seguir viendo la imagen.
8. Editar el registro.
9. Reemplazar imagen sin romper el registro.
10. Mostrar errores claros si algo falla.

## Debes revisar y corregir según corresponda

- `input type=file`
- bindings del formulario
- `FormData`
- route handlers
- server actions
- parsing del body
- límites de tamaño
- validación MIME
- validación de extensión
- persistencia de la ruta o URL
- normalización de nombres de archivo
- almacenamiento local o remoto
- render con `next/image` o `img`
- caché o revalidación
- actualización de UI tras guardar
- edición de imagen existente
- borrado o sustitución segura
- manejo de fallback
- errores de permisos o paths
- diferencias entre entorno local y contenedor

## Si el proyecto no tiene storage sólido

Debes implementar una solución mínima pero correcta y documentar:

- por qué la elegiste
- limitaciones
- cómo funciona en local
- cómo funciona en Docker
- cómo funcionaría en producción
- cómo migrar a una opción más robusta si aplica

---

# FASE 2 — Persistencia de sesión real hasta logout manual

Debes corregir o implementar el sistema de autenticación y sesión del admin.

## Requisitos obligatorios

La sesión debe mantenerse activa cuando:

- se refresca la página
- se navega entre rutas
- se recarga el contenedor
- se cierra y reabre el navegador usando el mismo perfil de prueba
- se entra directamente a una ruta admin protegida

Y debe cerrarse cuando:

- el usuario hace logout manual
- la sesión expira según política definida
- se invalida explícitamente

## Implementación requerida

Debes revisar o crear:

- login
- logout
- persistencia con cookie segura y adecuada si el stack lo permite
- validación del lado servidor
- middleware o guard de rutas
- sincronización cliente-servidor
- restauración de sesión al cargar
- manejo de sesión vencida
- UI visible de sesión activa
- botón funcional de cerrar sesión

## Restricciones

- No uses sólo estado React para auth.
- No dependas de localStorage como mecanismo principal de seguridad si existe una opción más correcta.
- Prioridad: cookie persistente segura, validación del servidor y guardas de ruta reales.

---

# FASE 3 — Refactorización para dockerización total

Quiero que refactorices el proyecto para que quede **totalmente dockerizado**.

## Debes verificar y corregir

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- variables de entorno
- estrategia de volúmenes
- manejo de uploads dentro de contenedor
- compatibilidad del build standalone
- runtime no root cuando aplique
- healthchecks
- readiness del servicio
- exposición de puertos
- compatibilidad con reverse proxy
- compatibilidad con Nginx
- compatibilidad con Cloudflare Tunnel si sigue siendo parte del diseño
- persistencia de archivos si las imágenes se guardan localmente

## Resultado esperado

Debe existir una estructura dockerizada clara para:

- desarrollo local
- producción o preproducción
- ejecución del web app
- reverse proxy si aplica
- persistencia de storage si aplica
- variables de entorno seguras
- tests reproducibles

## Si el diseño actual no es suficiente

Debes refactorizarlo.

Eso incluye, si hace falta:

- separar compose de desarrollo y producción
- crear volumen persistente para assets subidos
- ajustar Nginx
- ajustar puertos
- ajustar Dockerfile multi-stage
- añadir scripts de build/run/test
- documentar cómo levantar el stack completo

---

# FASE 4 — Adaptación de arquitectura para despliegue en Android

Quiero una estrategia concreta para que este servicio pueda ser usado en contexto Android.

## Debes resolver técnicamente

- si Android será el host real del contenedor o sólo el operador del despliegue
- si el almacenamiento de imágenes debe vivir dentro del contenedor o fuera
- si la sesión persistente depende de cookie del navegador Android
- si Chrome/Chromium Android participa en pruebas o sólo en uso real
- cómo se reproducirá el entorno de despliegue

## Debes producir como mínimo

1. **Matriz de viabilidad Android**:
   - Android + Docker nativo
   - Android + VM Linux
   - Android + Termux/proot
   - Android como cliente a host Docker remoto
2. **Recomendación final** con justificación técnica.
3. **Arquitectura de despliegue seleccionada**.
4. **Pasos reproducibles de despliegue** para esa arquitectura.
5. **Riesgos específicos de Android**:
   - almacenamiento
   - permisos
   - recursos limitados
   - background process killing
   - compatibilidad con Docker
   - persistencia de volúmenes

---

# FASE 5 — Pruebas funcionales con Selenium y perfil persistente de Chrome

Debes crear pruebas E2E reales con Selenium.

## Requisito central

Las pruebas deben mantener la sesión entre ejecuciones usando un **perfil de Chrome persistente o clonado**, sin usar directamente un perfil principal en vivo si está abierto.

## Debes implementar

- estrategia de perfil Chrome para pruebas
- script de preparación del perfil
- copia segura de perfil base a carpeta de trabajo
- arranque de Chrome con `--user-data-dir`
- selección de perfil con `--profile-directory` si aplica
- manejo de locks y perfiles en uso
- documentación de limitaciones del perfil clonado

## Casos E2E obligatorios

1. login exitoso
2. acceso al admin autenticado
3. refresh manteniendo sesión
4. cierre y reapertura del navegador manteniendo sesión con el mismo perfil de pruebas
5. creación de registro con imagen
6. guardado exitoso
7. visualización posterior de imagen guardada
8. edición del registro
9. reemplazo de imagen
10. logout manual
11. verificación de acceso denegado tras logout

## Requisitos técnicos de las pruebas

- waits explícitos
- capturas de pantalla por paso crítico
- logs claros
- artefactos guardados por ejecución
- reporte resumido por caso
- selectores documentados
- URLs probadas documentadas

## Carpeta obligatoria de artefactos

`tests/e2e/artifacts/YYYY-MM-DD_HH-mm-ss/`

Debe incluir:

- screenshots
- reporte markdown o json
- errores si los hubo
- resultado pass/fail
- referencia al perfil usado

---

# FASE 6 — Investigación técnica basada en documentación oficial

Antes de cerrar el diseño final, debes consultar documentación oficial y actualizada sobre:

- Next.js App Router
- cookies y sessions en Next.js
- route handlers
- file uploads en Next.js
- `next/image`
- Docker multi-stage para Next.js standalone
- Nginx reverse proxy para Next.js
- Selenium + Chrome options + user data dir
- viabilidad del target Android y sus restricciones reales

## Regla de evidencia

Cada decisión técnica importante debe quedar asociada a:

- fuente
- fecha consultada
- tema
- conclusión práctica aplicada al proyecto

No uses fuentes dudosas como autoridad principal si existe documentación oficial.

---

# FASE 7 — Memoria técnica de largo plazo y contexto del agente

Debes crear una memoria técnica durable, detallada y consistente.

Si ya existe `/context`, audítalo y úsalo, pero no dependas sólo de él si no cubre la trazabilidad técnica.

## Debes crear o consolidar esta estructura

```text
project-memory/
  00-project-overview.md
  01-repo-map.md
  02-dependency-audit.md
  03-admin-audit.md
  04-root-cause.md
  05-change-log.md
  06-image-upload-architecture.md
  07-session-architecture.md
  08-docker-architecture.md
  09-android-deployment-strategy.md
  10-selenium-strategy.md
  11-chrome-profile-strategy.md
  12-env-template.md
  13-open-questions.md
  14-next-steps.md
  MEMORY_RULES.md
  templates/
    conversation-template.md
    decision-template.md
    change-entry-template.md
    test-run-template.md
  conversations/
    YYYY-MM-DD_agent-session_001.md
    YYYY-MM-DD_agent-session_002.md
  decisions/
    DEC-001-....md
    DEC-002-....md
    DEC-003-....md
  evidence/
    screenshots-index.md
    test-runs-index.md
```

## Contenido obligatorio

Debes registrar:

- estado inicial del repo
- mapa del sistema
- auditoría de dependencias
- problema reportado
- hipótesis evaluadas
- hallazgos
- causa raíz principal
- causas secundarias
- decisiones de arquitectura
- cambios exactos por archivo
- pruebas ejecutadas
- evidencias generadas
- riesgos pendientes
- deuda técnica
- siguientes pasos

---

# FASE 8 — Reglas permanentes para memoria y trazabilidad

Debes crear `project-memory/MEMORY_RULES.md` con reglas estrictas y obligatorias.

## Debe incluir como mínimo

- convención de nombres
- formato ISO para fechas
- orden fijo de secciones
- formato único para cambios
- formato único para decisiones
- formato único para conversaciones
- formato único para pruebas
- cómo enlazar archivos modificados con decisiones
- cómo enlazar pruebas con evidencias
- cómo marcar pendientes y resueltos
- cómo actualizar documentos existentes
- prohibición de formatos inconsistentes

Además debes crear plantillas obligatorias en `project-memory/templates/`.

---

# FASE 9 — Registro detallado de cambios “al milímetro”

En `05-change-log.md` debes registrar cada modificación con este nivel de precisión:

- timestamp ISO
- archivo
- función, módulo o bloque afectado
- estado anterior
- cambio aplicado
- motivo del cambio
- impacto esperado
- riesgo posible
- validación realizada
- evidencia asociada
- decisión relacionada
- prueba relacionada

No se acepta un changelog genérico.

---

# FASE 10 — Registro estructurado de conversaciones del agente

Cada sesión de trabajo del agente debe quedar registrada en `project-memory/conversations/`.

## Cada archivo de conversación debe incluir

- objetivo de la sesión
- prompt recibido
- interpretación operativa
- auditoría realizada
- decisiones tomadas
- acciones ejecutadas
- errores encontrados
- correcciones aplicadas
- validaciones ejecutadas
- pendientes resultantes

Si no puedes guardar literalmente toda la conversación, guarda una transcripción estructurada fiel.

---

# FASE 11 — Criterio de ejecución obligatorio

No se permite cerrar el trabajo con recomendaciones sueltas.

Debes **ejecutar** los pasos del prompt y demostrar cada resultado.

## Secuencia obligatoria de trabajo

1. Auditar el repo.
2. Auditar dependencias.
3. Localizar el admin real.
4. Localizar flujo real de imágenes.
5. Localizar flujo real de auth.
6. Detectar causa raíz.
7. Diseñar solución mínima robusta.
8. Implementar.
9. Refactorizar dockerización.
10. Ajustar estrategia para Android.
11. Crear pruebas Selenium.
12. Ejecutar pruebas.
13. Guardar evidencias.
14. Generar memoria técnica.
15. Completar checklist final.

---

# Criterio de finalización no negociable

No termines hasta verificar todo esto con evidencia:

- [ ] se auditó el repo completo
- [ ] se auditó el estado de dependencias
- [ ] se localizó el flujo real del admin
- [ ] se detectó la causa raíz real
- [ ] el admin carga correctamente
- [ ] la imagen se puede seleccionar
- [ ] la imagen se valida
- [ ] la imagen se sube
- [ ] la imagen se guarda de forma persistente
- [ ] la imagen reaparece tras recargar
- [ ] editar un registro no rompe la imagen
- [ ] reemplazar imagen funciona
- [ ] el login funciona
- [ ] la sesión persiste al refresh
- [ ] la sesión persiste al reabrir navegador con el mismo perfil de prueba
- [ ] el logout invalida la sesión
- [ ] las rutas admin están protegidas
- [ ] el proyecto queda totalmente dockerizado
- [ ] Dockerfile y compose fueron validados
- [ ] existe estrategia viable para despliegue orientado a Android
- [ ] Selenium fue ejecutado con evidencia
- [ ] los artefactos de pruebas fueron guardados
- [ ] existe memoria técnica persistente
- [ ] `MEMORY_RULES.md` fue creado y aplicado
- [ ] el changelog detallado quedó completo
- [ ] la web pública no quedó rota

---

# Formato de respuesta final obligatorio

Tu respuesta final debe venir exactamente en este orden:

## A. Auditoría inicial del repo
## B. Auditoría de dependencias
## C. Flujo actual detectado
## D. Causa raíz principal
## E. Causas secundarias
## F. Estrategia técnica elegida
## G. Archivos modificados
## H. Cambios implementados
## I. Diseño final de subida de imágenes
## J. Diseño final de sesión persistente
## K. Refactorización Docker realizada
## L. Estrategia final de despliegue para Android
## M. Pruebas Selenium ejecutadas
## N. Evidencias generadas
## O. Memoria técnica creada
## P. Riesgos pendientes
## Q. Checklist final completo
## R. Cómo reproducir todo localmente y en entorno orientado a Android

---

# Reglas de lenguaje y comportamiento

Queda prohibido cerrar con expresiones como:

- “podría deberse a”
- “sería recomendable”
- “una opción sería”
- “faltaría probar”
- “te sugiero”
- “posiblemente”
- “no puedo verificar”

En lugar de eso debes:

- inspeccionar
- demostrar
- corregir
- probar
- documentar
- evidenciar

---

# Inicio obligatorio

Empieza ya y trabaja en este orden exacto:

1. inspecciona el repo completo
2. identifica el admin real
3. identifica el flujo de imágenes
4. identifica el flujo de auth
5. audita dependencias
6. inspecciona Docker y compatibilidad con Android
7. entrega auditoría
8. implementa
9. prueba con Selenium
10. documenta
11. completa checklist final

No te quedes en recomendaciones. Ejecuta.
