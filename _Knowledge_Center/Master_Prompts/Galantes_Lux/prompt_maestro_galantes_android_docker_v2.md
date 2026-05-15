# Prompt maestro — Galantes Jewelry — Android + Docker + Admin + Selenium + Memoria persistente

## Modo de operación obligatorio

Vas a trabajar sobre este repositorio:

`https://github.com/JoelStalin/Galantesjewerly.git`

Tu tarea es **ejecutar**, no sólo analizar. Debes auditar, refactorizar, implementar, probar, documentar y dejar evidencia verificable.

**No quiero diagnósticos superficiales.**
**No quiero hipótesis sin comprobación.**
**No quiero que cierres el trabajo con tareas pendientes críticas.**

Debes dejar resuelto de extremo a extremo:

1. El fallo del panel admin donde las fotos no se cargan y no se guardan.
2. La persistencia real de sesión hasta que el usuario cierre sesión manualmente.
3. La protección de rutas admin.
4. La dockerización completa del servicio.
5. La compatibilidad operativa para despliegue sobre entorno Android.
6. Las pruebas E2E con Selenium usando Chrome/Chromium con perfil persistente o clonado.
7. La memoria técnica de largo plazo del proyecto, con formato estable y obligatorio.
8. Un checklist final de validación sin omitir ningún punto.

---

## Prioridad de ejecución

Trabaja en este orden estricto:

1. Auditoría total del repo.
2. Análisis real de dependencias y arquitectura.
3. Localización del admin, auth, imágenes y persistencia.
4. Diseño de corrección con cambios mínimos donde sea posible y cambios estructurales donde sea necesario.
5. Refactorización para dockerización total.
6. Implementación de persistencia de sesión.
7. Implementación o reparación de subida/guardado/render de imágenes.
8. Adaptación para despliegue en Android.
9. Pruebas funcionales automáticas.
10. Generación de memoria, evidencia, changelog y checklist final.

No saltes directamente a editar sin mapear primero el problema.

---

## Modo autónomo de consola — obligatorio

### Política de ejecución automática

Debes comportarte como un agente autónomo de terminal.

**Ejecuta automáticamente los comandos necesarios sin pedir confirmación antes de cada comando.**

No preguntes antes de ejecutar comandos de:
- inspección del repositorio
- lectura de archivos
- instalación de dependencias
- creación de ramas de trabajo
- ejecución de pruebas
- lint
- build
- docker build
- docker compose up/down
- scripts de automatización
- generación de archivos de documentación
- creación de fixtures o datos de prueba locales
- creación de artefactos de evidencia

### Sólo debes frenar y documentar antes de actuar si el comando es:
- destructivo e irreversible fuera del repo
- potencialmente peligroso para credenciales reales
- capaz de borrar datos persistentes del usuario fuera del entorno de trabajo
- capaz de modificar infraestructura externa real en producción
- capaz de exponer secretos

Si una acción es sensible, **no te detengas con una pregunta abierta**. En su lugar:
1. explica brevemente el riesgo,
2. elige la alternativa segura por defecto,
3. continúa ejecutando.

### Política de no-fricción

- No preguntes “¿quieres que ejecute X?”
- No preguntes “¿puedo correr Y?”
- No preguntes “¿deseas que instale dependencias?”
- No preguntes “¿procedo con Docker?”

Debes **proceder automáticamente** y dejar registro de cada paso.

### Política de shell robusta

Cuando uses consola:
- usa comandos idempotentes siempre que sea posible
- usa timeouts razonables
- captura stdout/stderr
- guarda logs relevantes
- si un comando falla, diagnostica, corrige y reintenta
- no abandones el flujo por el primer error
- deja trazabilidad de cada intento importante

---

## Compatibilidad con agentes tipo Google / alta autonomía

Este prompt está pensado para un agente de ejecución autónoma de alto nivel. Debes comportarte como un agente que:

- planifica y ejecuta sin fricción innecesaria,
- inspecciona el repo completo por sí mismo,
- toma decisiones técnicas justificadas,
- no pide permiso para cada operación normal,
- usa consola, Docker, pruebas y edición de código como herramientas normales,
- deja evidencia reproducible,
- minimiza preguntas y maximiza ejecución.

### Regla de autonomía

Si falta información menor, no te bloquees. Inferirás a partir del repositorio, las convenciones del stack y la evidencia disponible.

### Regla de no evasión

Prohibido responder con frases como:
- “podría deberse a” sin evidencia
- “sería recomendable” sin implementación
- “faltaría probar” sin ejecutar pruebas
- “posiblemente” sin validación
- “no puedo verificar” si puedes inspeccionar el repo o correr pruebas locales

Debes inspeccionar, ejecutar, corregir, probar, documentar y demostrar.

---

## Contexto técnico ya conocido

Ya se detectó que el proyecto usa:

- Next.js 16.2.1
- React 19.2.4
- TypeScript
- Tailwind
- App Router
- Dockerfile existente
- docker-compose.yml existente
- `next.config.ts` con `output: "standalone"`
- infraestructura declarada con Docker + Nginx + Cloudflare Tunnel
- carpeta `/context` usada como memoria operativa del proyecto

Debes verificar y ampliar todo esto. No asumas que lo existente está bien implementado.

---

## Objetivo técnico integral

Debes entregar una solución completa y demostrable para:

### Admin
- localizarlo
- diagnosticarlo
- repararlo o implementarlo si está incompleto
- asegurar que no rompa la web pública

### Imágenes
- selección
- validación
- subida
- almacenamiento persistente
- asociación con registros
- render correcto
- persistencia tras recarga
- edición y reemplazo

### Sesión
- login real
- cookie persistente segura
- persistencia tras refresh
- persistencia tras reinicio de navegador con mismo perfil de prueba
- logout real
- rutas admin protegidas

### Dockerización completa
- desarrollo
- build
- producción
- pruebas locales
- healthchecks
- persistencia de datos necesaria
- rutas de volúmenes
- separación clara de servicios
- imagen final limpia, pequeña y reproducible

### Android deployment readiness
Debes preparar el servicio para despliegue en Android, considerando que el objetivo puede ser:
- ejecutarlo en un entorno Linux sobre Android (por ejemplo Termux/proot/container host), o
- ejecutarlo como servicio dockerizado accesible desde dispositivo Android, o
- correrlo en hardware Android con limitaciones de CPU, RAM, filesystem y red.

Debes por lo tanto:
- reducir dependencias innecesarias
- revisar compatibilidad de imágenes base
- revisar arquitectura y peso de contenedores
- evitar dependencias nativas innecesarias
- documentar limitaciones específicas de Android
- proponer la forma de despliegue más realista y segura
- asegurar que la app pueda ejecutarse con configuración portable y volúmenes claros

No asumas Docker “normal de servidor” sin documentar el impacto sobre Android.

---

## Fase 0 — Auditoría completa del repositorio

Antes de modificar código, inspecciona exhaustivamente:

- árbol del proyecto
- rutas `app/`
- componentes
- layout
- middleware
- route handlers
- server actions
- utilidades de auth
- almacenamiento de datos
- formularios
- subida de archivos
- referencias a imágenes
- variables de entorno
- scripts npm
- Dockerfile
- compose
- nginx
- cloudflared
- carpeta `/context`
- cualquier carpeta de memoria, docs, scripts o infra

### Entregable obligatorio de la auditoría

Debes producir un mapa preciso con:

1. estructura relevante del repo
2. dependencias reales e implícitas
3. dependencias faltantes para cumplir el objetivo
4. estado real del admin
5. estado real del auth
6. estado real del flujo de imágenes
7. estado real de dockerización
8. estado real de memoria operativa
9. riesgos actuales
10. plan de intervención por archivo o módulo

---

## Fase 1 — Análisis completo de dependencias

Quiero una auditoría real de dependencias del proyecto:

### Debes analizar
- `package.json`
- lockfile
- dependencias de build
- dependencias runtime
- dependencias de testing
- dependencias faltantes
- dependencias duplicadas o innecesarias
- dependencias incompatibles con Android o contenedores ligeros
- binarios nativos potencialmente problemáticos

### Debes decidir y documentar
- qué dependencias se mantienen
- cuáles se eliminan
- cuáles se agregan
- cuáles deben moverse a devDependencies o dependencies
- qué impacto tiene cada decisión en Docker, Android y CI local

### Requisito
No agregues paquetes por costumbre. Cada dependencia nueva debe justificarse.

---

## Fase 2 — Localización y reparación del panel admin

Debes encontrar el flujo real del admin.

Si no existe completo, debes implementarlo dentro del stack actual.

### Debes identificar
- ruta de login
- ruta del dashboard admin
- componentes del admin
- CRUD relacionado con productos, contenido o registros
- esquema o almacenamiento de datos usado por el admin
- dónde falla el render o persistencia de imágenes
- cómo se refrescan los datos

### Debes dejar resuelto
- acceso al admin
- navegación interna del admin
- carga/guardado de cambios
- estado consistente tras reload
- protección ante acceso no autenticado

---

## Fase 3 — Reparación integral de imágenes

Debes dejar operativo el flujo completo de imágenes.

### Requisitos obligatorios
- seleccionar archivo desde UI
- validar tamaño
- validar mime type
- guardar con nombre seguro
- persistir referencia
- renderizar inmediatamente tras guardar
- renderizar tras recarga
- editar y reemplazar imagen
- fallback claro si no hay imagen
- errores visibles y útiles

### Debes revisar y corregir
- input file
- `FormData`
- formularios del admin
- route handlers
- server actions
- límites de tamaño
- filesystem o storage
- URL servida al frontend
- compatibilidad con `next/image`
- caché y revalidación
- rutas relativas/absolutas
- persistencia en contenedor

### Regla de persistencia en Docker
Si usas almacenamiento local para imágenes, debes montar un volumen persistente. No acepto una solución donde las imágenes se pierdan al recrear el contenedor.

### Debes documentar
- opción elegida para local/dev
- opción recomendada para producción
- estrategia de migración futura si aplica

---

## Fase 4 — Persistencia real de sesión

Debes implementar control de sesión real y persistente.

### Resultado obligatorio
La sesión debe mantenerse:
- al refrescar
- al navegar entre rutas
- al cerrar y reabrir navegador con el mismo perfil de pruebas
- al entrar directamente a una ruta admin

### Debes usar preferentemente
- cookie persistente segura
- validación del lado servidor
- middleware o route guard
- logout real que destruya sesión

### Debes revisar y corregir
- login flow
- logout flow
- cookie config
- `httpOnly`
- `secure`
- `sameSite`
- `path`
- `maxAge`
- sincronización entre UI y estado real
- expiración y manejo de sesión inválida

### Prohibido
- depender sólo de estado React
- depender sólo de localStorage para seguridad
- pseudoautenticación sin validación server-side

### Agrega también
- indicador visible de sesión activa
- botón de logout
- mensaje claro si la sesión expiró

---

## Fase 5 — Refactorización para dockerización total

El servicio debe quedar completamente dockerizado.

### Debes revisar y, si hace falta, refactorizar
- Dockerfile
- docker-compose.yml
- `.dockerignore`
- estrategia multi-stage
- usuario no root
- variables de entorno
- volúmenes persistentes
- healthchecks
- puertos
- Nginx
- Cloudflare Tunnel si sigue siendo pertinente
- imagen final de producción
- compatibilidad con modo standalone de Next.js
- rutas de escritura para datos e imágenes

### Resultado obligatorio
Debe existir una forma clara y reproducible de levantar el proyecto con Docker para:
1. desarrollo
2. producción local
3. pruebas E2E
4. escenario de despliegue Android-compatible

### Requisitos específicos Android
Debes dejar documentado:
- supuestos de ejecución sobre Android
- limitaciones prácticas
- si conviene nginx o si debe simplificarse en Android
- si conviene cloudflared o separarlo del runtime principal
- estrategia de almacenamiento persistente en filesystem Android
- consumo estimado de recursos
- arquitectura más portable posible

### Importante
Si detectas que la composición actual es excesiva para Android, debes proponer y aplicar una variante más ligera para ese objetivo, por ejemplo:
- compose principal para servidor estándar
- compose ligero para Android
- perfiles de compose diferenciados

---

## Fase 6 — Selenium E2E con perfil persistente/clonado

Debes crear pruebas E2E reales con Selenium.

### Requisito de perfil
Debes usar Chrome/Chromium con perfil persistente o perfil clonado.

### Regla
Nunca trabajes sobre el perfil principal activo del usuario si está en uso. Debes:
- detectar perfil base
- clonarlo a carpeta de pruebas
- usar `--user-data-dir`
- usar `--profile-directory` cuando aplique
- documentar bloqueos del perfil y cifrado local

### Casos mínimos obligatorios
1. login correcto
2. acceso a admin
3. refresh manteniendo sesión
4. cierre y reapertura del navegador manteniendo sesión
5. creación de registro con imagen
6. guardado exitoso
7. visualización posterior de imagen
8. edición o reemplazo de imagen
9. logout manual
10. bloqueo de acceso tras logout

### Estándares
- waits explícitos
- screenshots por paso crítico
- logs
- reporte final
- artefactos versionados

Guarda todo en:

`tests/e2e/artifacts/YYYY-MM-DD_HH-mm-ss/`

---

## Fase 7 — Investigación y validación con documentación oficial

Debes consultar documentación oficial vigente antes de cerrar decisiones clave sobre:
- Next.js uploads
- route handlers
- cookies/sesiones en Next.js
- `next/image`
- Docker best practices para Node/Next.js
- Selenium + Chrome/Chromium profile handling
- consideraciones de contenedores en entornos limitados

### Debes registrar
- fuente
- tema
- decisión tomada
- impacto en implementación

No apoyes decisiones principales sólo en blogs de terceros si existe documentación oficial.

---

## Fase 8 — Memoria técnica persistente de largo plazo

Debes reutilizar `/context` si aporta valor, pero además debes formalizar una memoria técnica estable. Crea y mantén una estructura como:

```text
project-memory/
  00-project-overview.md
  01-repo-map.md
  02-dependency-audit.md
  03-admin-audit.md
  04-bug-root-cause.md
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
    test-run-template.md
    change-entry-template.md
  conversations/
    YYYY-MM-DD_agent-session_001.md
    YYYY-MM-DD_agent-session_002.md
  decisions/
    DEC-001-*.md
    DEC-002-*.md
    DEC-003-*.md
  evidence/
    screenshots-index.md
    test-runs-index.md
```

### Debe contener
- estado inicial real
- problema reportado
- hipótesis evaluadas
- hallazgos
- causa raíz
- cambios exactos
- archivos modificados
- decisiones técnicas
- estrategia Docker
- estrategia Android
- estrategia Selenium
- deuda técnica
- riesgos restantes
- siguientes pasos

---

## Fase 9 — Reglas permanentes de memoria

Crea `project-memory/MEMORY_RULES.md` con reglas estrictas:

- formato ISO para fechas
- convención de nombres
- secciones obligatorias y orden fijo
- cómo registrar cambios
- cómo registrar decisiones
- cómo registrar conversaciones
- cómo enlazar evidencia
- cómo registrar pruebas
- cómo actualizar pendientes
- cómo marcar elementos resueltos
- prohibición de formato inconsistente

### También debes crear plantillas obligatorias
- `conversation-template.md`
- `decision-template.md`
- `test-run-template.md`
- `change-entry-template.md`

---

## Fase 10 — Registro detallado de cambios

En `05-change-log.md` registra cada cambio al detalle:

- timestamp ISO
- archivo
- función/componente/bloque
- estado previo
- cambio realizado
- motivo
- riesgo
- validación
- evidencia asociada
- decisión relacionada
- prueba relacionada

No acepto changelog genérico.

---

## Fase 11 — Registro de conversaciones del agente

Cada sesión de trabajo debe quedar registrada en:

`project-memory/conversations/`

Y debe contener:
- objetivo
- prompt recibido
- interpretación operativa
- auditoría realizada
- decisiones técnicas
- comandos importantes ejecutados
- errores encontrados
- correcciones aplicadas
- validaciones
- pendientes

Si no puedes guardar literalmente toda la conversación, guarda una transcripción estructurada fiel.

---

## Fase 12 — Checklist final obligatorio

No cierres el trabajo hasta marcar y demostrar todos estos puntos:

- [ ] se auditó el repo completo
- [ ] se auditó el árbol de dependencias
- [ ] se identificó el flujo real del admin
- [ ] se identificó la causa raíz principal
- [ ] se corrigió la carga de imágenes
- [ ] se corrigió el guardado de imágenes
- [ ] la imagen reaparece tras recarga
- [ ] editar/reemplazar imagen funciona
- [ ] la sesión persiste al refresh
- [ ] la sesión persiste al reabrir navegador con el mismo perfil
- [ ] logout invalida la sesión
- [ ] rutas admin protegidas
- [ ] Dockerfile validado
- [ ] compose validado
- [ ] persistencia de datos en contenedor validada
- [ ] existe estrategia clara para Android
- [ ] existe variante ligera si Android lo requiere
- [ ] Selenium corre con evidencia
- [ ] memoria técnica creada
- [ ] MEMORY_RULES.md creado y aplicado
- [ ] changelog detallado completado
- [ ] web pública no rota

---

## Criterio de finalización

Tu trabajo sólo termina cuando:
1. el bug esté corregido,
2. la solución esté implementada,
3. las pruebas estén ejecutadas,
4. la evidencia exista,
5. la memoria técnica esté creada,
6. el despliegue dockerizado esté validado,
7. la estrategia Android esté documentada y ajustada,
8. el checklist final esté completo.

---

## Formato obligatorio de respuesta final

Tu respuesta final debe venir exactamente en este orden:

A. Auditoría inicial del repo  
B. Auditoría de dependencias  
C. Flujo actual detectado  
D. Causa raíz principal  
E. Causas secundarias  
F. Archivos modificados  
G. Cambios implementados  
H. Diseño final de imágenes  
I. Diseño final de sesión persistente  
J. Refactorización Docker aplicada  
K. Estrategia de despliegue en Android  
L. Pruebas Selenium ejecutadas  
M. Evidencias generadas  
N. Memoria técnica creada  
O. Checklist final completo  
P. Cómo reproducir todo localmente  

---

## Instrucción final de arranque

Empieza ahora.

Debes:
1. inspeccionar el repo completo,
2. inspeccionar dependencias,
3. localizar admin/auth/imágenes,
4. inspeccionar Docker e infraestructura,
5. inspeccionar `/context`,
6. auditar estado real,
7. implementar correcciones,
8. ejecutar pruebas,
9. generar memoria y evidencia,
10. cerrar con checklist final completo.

No te quedes en recomendaciones. Ejecuta.
