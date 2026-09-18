# Prompt maestro para Copilot — **Agent Continuity Hub**

## Nombre propuesto del proyecto
**Agent Continuity Hub**

### Descripción breve
Extensión para VS Code orientada a **centralizar conversaciones entre distintos agentes de IA**, mantener **memoria de largo plazo por workspace/proyecto**, convertir conversaciones en **tareas accionables**, reconstruir el contexto de trabajo al volver a un proyecto y mantener un **log de cambios auditable** donde quede claro **qué agente cambió qué, cuándo y por qué**.

---

## Instrucción principal para el agente
Actúa como un **staff engineer / principal engineer** experto en:
- TypeScript
- VS Code Extension API
- arquitectura de plugins y adaptadores
- persistencia local
- indexación semántica
- SQLite
- sistemas de memoria de largo plazo
- task extraction
- trazabilidad / auditoría de cambios
- integración realista con asistentes de IA

Quiero que diseñes e implementes una extensión de VS Code **real, robusta, extensible y ejecutable**, no una demo superficial.

Tu trabajo es construir la extensión **Agent Continuity Hub**, con foco en continuidad conversacional entre agentes, memoria por proyecto, tareas derivadas de chats, skills reutilizables, reconstrucción de contexto y un sistema de auditoría de cambios.

---

## Objetivo principal
Crear una extensión de VS Code que:
1. Guarde y centralice conversaciones provenientes de distintos agentes de IA.
2. Cree una memoria de largo plazo separada por workspace/proyecto/directorio.
3. Permita retomar una conversación o línea de trabajo sin importar el agente utilizado.
4. Extraiga tareas desde prompts y respuestas ya procesados.
5. Inyecte automáticamente contexto útil al iniciar un nuevo chat.
6. Detecte el workspace según el **path real** del proyecto o directorio abierto.
7. Aproveche proyectos recientes para sugerir contexto, skills y continuidad operativa.
8. Mantenga un **log de cambios** auditable, identificando **qué agente cambió qué y por qué**.

---

## Restricción crítica de realismo
No inventes APIs inexistentes ni capacidades mágicas.

Si un agente externo no ofrece una API pública o integración oficial usable desde VS Code, no debes fingir acceso directo a sus conversaciones privadas. En esos casos, diseña una arquitectura por adaptadores con estos modos:
- integración oficial, si existe;
- importación manual de conversaciones;
- captura de prompts/respuestas cuando el flujo se inicia desde la propia extensión;
- importadores para logs/exports locales configurables;
- stubs documentados para futuras integraciones.

Quiero una solución **realista**, **segura**, **local-first** y **extensible**.

---

## Requisitos funcionales detallados

### 1. Memoria por workspace / proyecto
La extensión debe crear un perfil de memoria por proyecto usando el **path absoluto normalizado** del workspace.

Debe soportar:
- single-folder workspace;
- multi-root workspaces;
- carpetas sueltas;
- reapertura del mismo proyecto en sesiones futuras;
- proyectos con rutas renombradas o movidas, cuando sea posible resolverlo sin comprometer consistencia.

Cada workspace debe tener separado:
- historial de conversaciones;
- memoria resumida;
- tareas;
- skills activas;
- decisiones técnicas;
- changelog / auditoría;
- configuración contextual.

---

### 2. Centralización de chats
Debes guardar conversaciones en un formato canónico, independiente del agente.

#### Modelo mínimo por mensaje
- `id`
- `conversationId`
- `workspaceId`
- `agentId`
- `adapterId`
- `role` (`user`, `assistant`, `system`, `tool`)
- `timestamp`
- `content`
- `attachments`
- `references`
- `tags`
- `summary`
- `embedding` opcional
- `sourceAdapter`
- `sourceMetadata`

#### Modelo mínimo por conversación
- `conversationId`
- `title`
- `workspaceId`
- `linkedAgents`
- `createdAt`
- `updatedAt`
- `status`
- `summary`
- `extractedTasks`
- `relatedFiles`
- `relatedSkills`
- `origin`
- `sourceCapabilities`

La extensión debe permitir buscar conversaciones por:
- agente;
- proyecto;
- fecha;
- texto;
- archivos relacionados;
- tags;
- estado;
- tareas asociadas;
- similitud semántica si el modo vectorial está activo.

---

### 3. Memoria de largo plazo
A partir del historial de conversaciones, extrae y persiste:
- decisiones técnicas;
- contexto funcional del proyecto;
- restricciones del repositorio;
- bugs detectados;
- TODOs no resueltos;
- preferencias del usuario;
- patrones repetidos;
- comandos frecuentes;
- convenciones de código;
- información útil para reanudar el trabajo.

#### Estructura sugerida para la memoria del proyecto
- `projectFacts`
- `decisions`
- `codingConventions`
- `preferredTools`
- `openTasks`
- `recurringTasks`
- `recentContext`
- `knownConstraints`
- `importantFiles`
- `agentUsagePatterns`

La memoria debe actualizarse de forma incremental, con estrategias de:
- merge inteligente;
- versionado;
- pruning;
- resúmenes jerárquicos;
- control de duplicados.

---

### 4. Conversión de prompts procesados a tareas
Cada vez que exista una conversación nueva o actualizada, la extensión debe intentar extraer tareas accionables.

#### Modelo de tarea
- `id`
- `workspaceId`
- `title`
- `description`
- `sourceConversationId`
- `sourceMessageId`
- `status` (`pending`, `in_progress`, `done`, `cancelled`)
- `priority`
- `tags`
- `relatedFiles`
- `createdAt`
- `updatedAt`
- `assignedAgent` opcional
- `taskType`
- `reasoningSummary`

Debes distinguir entre:
- consulta informativa;
- decisión cerrada;
- tarea operativa;
- follow-up;
- recordatorio;
- deuda técnica;
- investigación pendiente.

Las tareas pendientes deben mostrarse en una vista de VS Code y participar en la inyección automática de contexto.

---

### 5. Inyección de contexto en nuevos chats
Cada vez que se inicie un nuevo chat con un agente soportado, la extensión debe construir un `context packet` con:
- resumen del proyecto;
- decisiones recientes;
- tareas pendientes;
- archivos clave;
- skills activas;
- memoria reciente relevante;
- restricciones del proyecto;
- changelog reciente relevante;
- conversaciones relacionadas.

Debe existir modo:
- automático;
- sugerido;
- manual.

El sistema debe evitar explosión de tokens y priorizar contenido por:
- workspace actual;
- archivos abiertos;
- recencia;
- tareas abiertas;
- similitud semántica;
- agente seleccionado;
- skills activas;
- cambios recientes.

---

### 6. Skills por agente y por proyecto
Implementa un sistema de skills reutilizables:
- prompts base;
- reglas;
- checklists;
- snippets;
- workflows;
- políticas de estilo;
- convenciones por stack.

Las skills deben poder activarse según:
- lenguaje;
- framework;
- tipo de repositorio;
- agente actual;
- historial del proyecto;
- tareas activas.

Debe haber al menos estas categorías:
- `react`
- `node`
- `python`
- `testing`
- `debugging`
- `refactor`
- `documentation`
- `api-design`
- `database`

#### Resolución de skills
Diseña un motor que combine:
- global skills;
- workspace skills;
- agent-specific skills;
- context-triggered skills.

Si hay conflictos, resuélvelos por prioridad configurable y reglas explícitas.

---

### 7. Proyectos recientes
La extensión debe revisar proyectos recientes visibles de forma segura desde el entorno de VS Code o una fuente local/configurable.

Usos esperados:
- sugerir continuidad entre proyectos relacionados;
- ofrecer importar memoria o skills relevantes;
- detectar patrones de trabajo recientes;
- proponer conversaciones relacionadas.

No mezcles memoria automáticamente entre proyectos sin una regla explícita o confirmación clara.
El aislamiento por workspace es el comportamiento por defecto.

---

### 8. Arquitectura por adaptadores de agentes
Debes diseñar una arquitectura plugin/adapters con una interfaz como esta o mejor:

- `getAgentMetadata()`
- `listCapabilities()`
- `startConversation()`
- `captureConversation()`
- `importConversation()`
- `buildContextPayload()`
- `injectContext()`
- `normalizeConversation()`
- `supportsRealtimeCapture()`
- `supportsImport()`

Quiero:
- una arquitectura base limpia;
- un adapter funcional mínimo;
- uno o más adapters stub, muy bien documentados;
- separación clara entre core y adapters.

No acoples el sistema a un solo proveedor.

---

### 9. UI en VS Code
Crea una interfaz mínima funcional con Sidebar / Activity Bar que incluya:
- conversaciones recientes;
- tareas pendientes;
- memoria del proyecto;
- skills activas;
- agentes conectados;
- changelog reciente.

#### Comandos mínimos
- `Agent Continuity Hub: Open Project Memory`
- `Agent Continuity Hub: Start Contextual Chat`
- `Agent Continuity Hub: Import Conversation`
- `Agent Continuity Hub: Extract Tasks from Conversation`
- `Agent Continuity Hub: Show Pending Tasks`
- `Agent Continuity Hub: Show Change Log`
- `Agent Continuity Hub: Rebuild Memory Index`
- `Agent Continuity Hub: Refresh Skills`

Puedes añadir una Webview si mejora la usabilidad.

---

### 10. Persistencia
Usa persistencia local robusta.

Preferencia técnica:
- **SQLite** para conversaciones, tareas, memoria resumida, relaciones y changelog;
- **JSON** para export/import y configuración extendida;
- índice vectorial opcional si agregas búsqueda semántica local.

Debe existir:
- versionado de esquema;
- migraciones;
- seeds de ejemplo opcionales;
- manejo seguro de errores;
- índices de consulta apropiados.

---

### 11. Privacidad y control
Todo debe funcionar en local por defecto.

Debes incluir:
- exclusión de carpetas;
- exclusión de archivos sensibles;
- borrado por workspace;
- borrado total;
- exportación e importación;
- anonimización opcional de rutas;
- control de telemetría desactivada por defecto;
- políticas claras de qué datos se guardan y por qué.

---

### 12. Indexación y relevancia
Implementa búsqueda textual y deja preparado el sistema para búsqueda semántica.

El ranking debe poder ponderar:
- coincidencia textual;
- recencia;
- workspace actual;
- archivos relacionados;
- tareas abiertas;
- frecuencia de uso;
- relevancia semántica;
- agente actual.

---

### 13. Reconstrucción de contexto
Al abrir un proyecto, la extensión debe poder reconstruir un resumen operativo como:
- qué estaba haciendo;
- qué quedó pendiente;
- qué decisiones ya fueron tomadas;
- qué archivos estaban implicados;
- qué skills deberían activarse;
- qué conversaciones son más relevantes para continuar;
- qué cambios importantes ocurrieron recientemente.

---

## 14. Requisito nuevo obligatorio: log de cambios auditable por agente
La extensión debe incluir un sistema de **change log / audit trail** completo.

### Debe registrar
- cambios en memoria del proyecto;
- cambios en tareas;
- cambios en conversaciones;
- cambios en resúmenes;
- activación o desactivación de skills;
- cambios en configuración por workspace;
- reconstrucciones automáticas de contexto;
- merges o consolidaciones de memoria;
- importaciones manuales de conversaciones.

### Cada entrada del changelog debe incluir como mínimo
- `id`
- `workspaceId`
- `entityType` (`memory`, `task`, `conversation`, `skill`, `config`, `summary`, `contextPacket`)
- `entityId`
- `changeType` (`create`, `update`, `delete`, `merge`, `status_change`, `rebuild`, `import`, `resolve`)
- `changedByType` (`agent`, `user`, `system`, `adapter`)
- `changedById`
- `changedByName`
- `agentId` opcional
- `adapterId` opcional
- `timestamp`
- `reason`
- `reasonCategory`
- `sourceConversationId` opcional
- `sourceMessageId` opcional
- `beforeSnapshot` opcional
- `afterSnapshot` opcional
- `diffSummary`
- `relatedFiles`
- `tags`

### Reglas funcionales del changelog
1. Cada cambio importante debe quedar trazado.
2. Debe poder verse **qué agente realizó el cambio**.
3. Debe poder verse **por qué se realizó el cambio**.
4. Debe existir una razón legible por humano, no solo un código interno.
5. Cuando el cambio provenga de extracción automática, debe indicarse que fue un proceso automático.
6. Cuando el cambio sea manual, debe indicarse que fue hecho por el usuario.
7. Debe existir vista filtrable por:
   - agente,
   - fecha,
   - tipo de entidad,
   - tipo de cambio,
   - motivo,
   - workspace.
8. Debe ser posible abrir una entrada y ver el antes/después cuando aplique.
9. Debe existir una política para no registrar contenido excesivamente sensible si el usuario lo desactiva.

### Casos de uso del changelog
- “Qué tareas agregó este agente y por qué.”
- “Qué resumen cambió ayer y de qué conversación salió.”
- “Qué skill se activó automáticamente para este repo.”
- “Qué memoria fue actualizada por una importación manual.”
- “Qué decisión del proyecto fue introducida por un agente específico.”

---

## Arquitectura solicitada
Organiza la solución con capas claras.

```text
src/
  extension/
  commands/
  core/
  adapters/
  memory/
  tasks/
  skills/
  changelog/
  context/
  storage/
  services/
  models/
  ui/
  utils/
  tests/
```

### Separaciones importantes
- `core`: contratos, interfaces y orquestación base.
- `adapters`: integración con agentes externos.
- `memory`: consolidación, resumen, recuperación.
- `tasks`: extracción y lifecycle de tareas.
- `skills`: registro, matching y resolución.
- `changelog`: auditoría, snapshots, diff summaries y consulta.
- `context`: armado del packet contextual.
- `storage`: SQLite, repositorios, migraciones.
- `ui`: TreeViews, providers, webviews.

---

## Stack técnico preferido
- TypeScript
- VS Code Extension API
- SQLite
- `zod` para validación
- `vitest` o `jest` para tests
- `eslint`
- `prettier`

Si eliges librerías adicionales, justifica por qué.

---

## Segmento bibliográfico obligatorio / ruta de investigación para ejemplos, skills y arquitectura
Antes de implementar, debes consultar y usar como referencia **fuentes oficiales o ampliamente reconocidas**. No codifiques a ciegas.

### Prioridad 1 — documentación oficial obligatoria
Debes revisar primero documentación y ejemplos oficiales sobre:
1. **VS Code Extension API**
   - activation events
   - commands
   - Tree View API
   - Webview / Webview View API
   - workspace API
   - window API
   - storage (`globalState`, `workspaceState`, `SecretStorage` cuando aplique)
   - configuration contribution
   - tasks API si aporta valor
   - file system watching
   - extension packaging / publishing

2. **Repositorio oficial de ejemplos de extensiones de VS Code**
   Busca samples equivalentes a:
   - tree view sample
   - webview sample
   - custom editor / view samples si ayudan
   - status bar sample
   - command samples
   - workspace / file watcher samples

3. **Documentación oficial de SQLite**
   Para:
   - esquema,
   - índices,
   - migraciones,
   - transacciones,
   - rendimiento,
   - normalización razonable.

4. **Documentación oficial de Zod**
   Para validación de:
   - entidades,
   - configuración,
   - import/export,
   - adapters.

5. **Documentación oficial de testing**
   - Vitest o Jest
   - pruebas unitarias
   - pruebas de servicios puros
   - estrategias para testear lógica desacoplada de VS Code.

### Prioridad 2 — referencias de arquitectura y ejemplos de proyectos similares
Busca ejemplos reales y patrones de implementación en proyectos abiertos que resuelvan partes del problema, especialmente:
- extensiones de VS Code con sidebar compleja;
- extensiones con persistencia local;
- extensiones con chat o integración con asistentes de IA;
- herramientas con memory/context orchestration;
- sistemas con audit log o history tracking;
- repositorios con arquitectura por adapters/providers.

Patrones a investigar:
- chat normalization;
- adapter pattern;
- repository pattern;
- service layer;
- event-driven updates;
- background indexing controlado;
- diff tracking;
- project-scoped memory.

### Prioridad 3 — búsqueda de “skills” y heurísticas reutilizables
Investiga ejemplos y convenciones para construir skills reutilizables a partir de:
- tipo de proyecto;
- frameworks detectados;
- lenguaje;
- scripts del `package.json`;
- presencia de archivos como `tsconfig.json`, `pyproject.toml`, `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `eslint.config.*`, `prettier.config.*`, `vite.config.*`, `next.config.*`, `jest.config.*`, `vitest.config.*`.

Debes derivar skills desde la estructura del proyecto y no solo desde una lista estática.

### Registro bibliográfico obligatorio dentro de tu entrega
Antes del código, genera una sección llamada:
**“Bibliografía técnica y mapa de referencias”**

En esa sección debes listar:
- fuente consultada;
- por qué es relevante;
- componente del proyecto que informa;
- si es fuente oficial o comunitaria;
- riesgos o limitaciones de esa referencia.

### Reglas del segmento bibliográfico
- Prioriza documentación oficial.
- No copies código ciegamente.
- No inventes APIs que no existan.
- Si una integración depende de una capacidad no documentada oficialmente, márcala como `stub` o `future integration`.
- Cada decisión técnica importante debe poder rastrearse a una referencia o razonamiento explícito.

---

## Decisiones técnicas esperadas
Quiero que tomes decisiones razonadas sobre:
- por qué SQLite vs alternativas;
- por qué TreeView + Webview o solo TreeView;
- cómo versionar migraciones;
- cómo separar memoria reciente y memoria consolidada;
- cómo evitar loops de actualización;
- cómo generar diffs para changelog;
- cómo limitar tokens en context packets;
- cómo aislar adapters;
- cómo tratar multi-root workspaces;
- cómo manejar import/export;
- cómo evitar contaminación cruzada entre proyectos.

---

## Entregables obligatorios
Genera:
1. resumen ejecutivo;
2. arquitectura propuesta;
3. decisiones técnicas;
4. bibliografía técnica y mapa de referencias;
5. estructura de carpetas y archivos;
6. código completo por archivos;
7. `package.json` completo con `contributes`, `commands`, `views`, `configuration`;
8. modelos y tipos;
9. servicios principales;
10. persistencia real;
11. sistema de tasks;
12. sistema de skills;
13. sistema de changelog;
14. adapter funcional mínimo;
15. adapters stub documentados;
16. UI básica funcional;
17. README detallado;
18. tests unitarios;
19. notas sobre limitaciones reales de integración.

---

## Criterios de aceptación
La solución se considera válida si:
- abre un proyecto y crea o recupera su memoria;
- guarda conversaciones por workspace;
- extrae tareas desde conversaciones;
- inyecta contexto útil en nuevos chats;
- muestra tareas pendientes automáticamente;
- mantiene separación estricta por workspace;
- registra cambios con agente, motivo y trazabilidad;
- permite consultar changelog por filtros;
- compila y puede ejecutarse como extensión en modo desarrollo;
- deja claras las integraciones reales vs abstraídas.

---

## Orden de trabajo obligatorio
Trabaja en este orden:
1. diseña la arquitectura;
2. define modelos de datos;
3. crea la estructura de carpetas;
4. implementa el núcleo funcional mínimo;
5. implementa persistencia;
6. implementa changelog;
7. implementa extracción de tareas;
8. implementa memoria y reconstrucción de contexto;
9. implementa UI;
10. documenta stubs y límites reales.

No saltes directo a escribir archivos sin justificar arquitectura y decisiones base.

---

## Requisitos de salida
Responde con este formato:
1. **Resumen ejecutivo**
2. **Bibliografía técnica y mapa de referencias**
3. **Arquitectura propuesta**
4. **Decisiones técnicas**
5. **Estructura de archivos**
6. **Código completo por archivos**
7. **Cómo ejecutar y probar**
8. **Integraciones reales vs stubs**
9. **Próximos pasos**

---

## Reglas de calidad
- No inventes APIs.
- No ocultes limitaciones.
- Prioriza robustez sobre demo visual.
- Mantén el código modular.
- Usa nombres consistentes.
- Aísla responsabilidades.
- Haz el MVP funcional, pero con arquitectura escalable.
- Marca TODOs solo donde dependan de integraciones externas reales.

---

## Instrucción final
No quiero solo ideas conceptuales.
Quiero una **base de extensión funcional**, con código real y una arquitectura que permita evolucionar hacia una solución de producción.

Si una parte no puede ser totalmente implementada por falta de API oficial, debes:
1. decirlo explícitamente,
2. dejar la abstracción correcta,
3. implementar el fallback o stub adecuado,
4. documentar cómo completarlo en el futuro.

Tu objetivo no es impresionar con texto; tu objetivo es entregar un proyecto serio, ejecutable y extensible.
