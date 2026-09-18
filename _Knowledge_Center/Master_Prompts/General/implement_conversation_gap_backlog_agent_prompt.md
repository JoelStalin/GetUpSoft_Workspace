# Prompt maestro para agente — Implementar backlog de proyectos desde conversaciones

## Rol del agente

Actua como un agente senior de arquitectura, documentacion tecnica y mantenimiento de repositorios para `JoelStalin/GetUpSoft_Workspace`.

Tu objetivo es implementar de forma segura el backlog importado desde conversaciones, convirtiendo ideas, proyectos parciales e incidentes tecnicos en documentacion accionable, runbooks, registros de proyectos y checklists dentro del workspace.

No debes borrar codigo, no debes mover proyectos existentes y no debes subir secretos.

## Repositorio objetivo

- Repository: `JoelStalin/GetUpSoft_Workspace`
- Branch base: `main`
- Working branch sugerida: `docs/implement-conversation-gap-backlog`
- Idioma operativo: espanol
- Codigo, nombres tecnicos y commits: ingles cuando aplique
- Commits: Conventional Commits

## Documento fuente principal

Lee primero:

```text
_Knowledge_Center/Long_Term_Memory/CONVERSATION_PROJECTS_GAP_IMPORT_2026-05-16.md
```

Ese archivo contiene el backlog maestro de brechas detectadas entre conversaciones previas y el contenido existente del workspace.

## Objetivo general

Implementar la estructura documental minima para que todos los proyectos, ideas e incidentes importantes queden integrados en `GetUpSoft_Workspace`, sin mezclar contenido casual, sin duplicar codigo y sin exponer datos sensibles.

## Reglas obligatorias de seguridad

1. No commitear credenciales, passwords, tokens, cookies, private keys, certificados privados, claves SSH, archivos `.env` reales, EIN completo, SSN, ITIN ni datos bancarios.
2. Si un documento necesita valores sensibles, usar placeholders como:
   - `<REPLACE_WITH_EIN_LAST_4_ONLY>`
   - `<REPLACE_WITH_PRIVATE_IP>`
   - `<REPLACE_WITH_PUBLIC_DOMAIN>`
   - `<REPLACE_WITH_SECRET_FROM_VAULT>`
   - `<REPLACE_WITH_OPENVPN_CA_BLOCK>`
   - `<REPLACE_WITH_OPENVPN_CERT_BLOCK>`
   - `<REPLACE_WITH_OPENVPN_KEY_BLOCK>`
3. No borrar repositorios, carpetas, archivos o historiales existentes.
4. No renombrar carpetas existentes sin crear primero una matriz de impacto.
5. No fusionar proyectos existentes sin mapa de dependencias.
6. No modificar codigo productivo salvo que el cambio sea estrictamente documental.
7. Si se detecta informacion sensible ya presente en el repo, documentar el hallazgo en un reporte privado/sanitizado y no reproducir el secreto en el output.
8. Todo cambio debe ser trazable y reversible.

## Alcance de implementacion

Crear o actualizar archivos Markdown de documentacion, inventario, runbook y backlog. No implementar servicios productivos todavia.

## Archivos/directorios esperados

Implementar los siguientes entregables:

### 1. GETUPSOFT LLC — administracion legal y cumplimiento

Crear:

```text
00_Business_Admin/GETUPSOFT_LLC/README.md
00_Business_Admin/GETUPSOFT_LLC/compliance_calendar.md
00_Business_Admin/GETUPSOFT_LLC/legal_metadata_sanitized.md
```

Contenido requerido:

- Nombre legal: `GETUPSOFT LLC`.
- Florida document number: `L26000266761`.
- Entity type: Multi Member LLC.
- State: Florida.
- Actividad: Consulting.
- Servicio principal: Software Development.
- Tax class: Partnership by default.
- Annual report window: Jan 1-May 1 beginning 2027.
- Form 1065 target due date: 2027-03-15.
- Checklist de cumplimiento anual.
- Nota explicita: no almacenar EIN completo ni datos fiscales privados.

### 2. GetUpSoft website/product catalog backlog

Crear:

```text
01_Core_Platform/getupsoft-site/PRODUCT_CATALOG_BACKLOG.md
01_Core_Platform/getupsoft-site/WEB_INCIDENT_LOG.md
```

Contenido requerido:

- Incidente HTTPS/502 para `getupsoft.com`.
- Incidente UTF-8/charset en `getupsoft.com.do`, con ejemplo sanitizado: `GestiÃ³n` debe verse como `Gestión`.
- Cards de producto con acciones: `Ver demo`, `Arquitectura`, `Casos de uso`.
- Productos a documentar:
  - Orca
  - AIHub
  - Odoo ERP
  - Facturacion electronica e-CF
  - Infrastructure/network/server services
  - Galantes Jewelry
  - Chef Alitas
  - GetUpNet
- Requerir previews: screenshots, videos o mockups.

### 3. AIHub / ai.getupsoft.com.do

Crear:

```text
03_AI_Automation/AIHub/README.md
03_AI_Automation/AIHub/ARCHITECTURE.md
03_AI_Automation/AIHub/ROADMAP.md
03_AI_Automation/AIHub/SECURITY_NOTES.md
```

Contenido requerido:

- Dominio/proyecto: `ai.getupsoft.com.do`.
- Proposito: preprocesar prompts antes de rutear a ChatGPT, Claude o Gemini basado en clasificacion de tarea.
- Stack preferido: FastAPI, Next.js, n8n, PostgreSQL, Cloudflare.
- Componentes minimos:
  - prompt intake
  - task classifier
  - provider router
  - audit log
  - cost/latency policy
  - fallback strategy
  - sensitive data redaction
- Relacionar con Orca y Agent Continuity Hub.

### 4. Server bootstrap / Ubuntu operations

Crear:

```text
04_Infrastructure/GetUpSoft_Server_Bootstrap/RUNBOOK.md
04_Infrastructure/GetUpSoft_Server_Bootstrap/SSH_HARDENING_CHECKLIST.md
04_Infrastructure/GetUpSoft_Server_Bootstrap/NETWORK_TROUBLESHOOTING.md
```

Contenido requerido:

- Hostname observado: `getupsoft`.
- NIC observada: `enp125s0` con estado DOWN.
- Errores DNS conocidos:
  - `Temporary failure resolving archive.ubuntu.com`
  - `Temporary failure resolving security.ubuntu.com`
- SSH key names usados localmente: `~/.ssh/getupsoft`, `~/.ssh/getupsoft.pub`.
- Error historico: `authorized_keys` fue escrito incorrectamente como `authrized_keys`.
- Permisos SSH esperados:
  - `~/.ssh` => `700`
  - `authorized_keys` => `600`
  - private key local => `600`
- No incluir claves privadas.

### 5. OpenVPN runbook

Crear:

```text
04_Infrastructure/OpenVPN/RUNBOOK.md
04_Infrastructure/OpenVPN/client-template.ovpn.example
```

Contenido requerido:

- Host/contexto: `getupsoft`.
- Cliente ejemplo: `getupsoft-client`.
- Puerto: `1194/UDP`.
- Checklist NAT/firewall para `1194/udp`.
- Template `.ovpn` con placeholders para:
  - `<ca>`
  - `<cert>`
  - `<key>`
  - `<tls-crypt>`
- No incluir material criptografico real.

### 6. GetUpNet router/network lab

Crear:

```text
05_Networking/GetUpNet_Router_Lab/README.md
05_Networking/GetUpNet_Router_Lab/mikrotik_template.rsc
05_Networking/GetUpNet_Router_Lab/TP_LINK_OMADA_NOTES.md
```

Contenido requerido:

- Hardware/contexto: MikroTik hAP lite, MikroTik, TP-Link Omada.
- WAN: `ether2`.
- LAN: `ether3`, `ether4`, `wlan1`.
- DHCP pool: `10.10.10.50-250`.
- Gateway: `10.10.10.1`.
- DNS: `8.8.8.8`, `1.1.1.1`.
- NAT masquerade on `ether2`.
- Cliente Windows en DHCP automatico para pruebas.
- No incluir password real de administrador; usar placeholder.

### 7. GetUpNet portal payments and Odoo 18 integration

Crear:

```text
01_Core_Platform/GetUpNet/PORTAL_PAYMENTS_ODDO18_BACKLOG.md
```

Contenido requerido:

- Portal compatible con MikroTik y TP-Link Omada.
- Integracion con Odoo 18.
- Pagos directos Visa/MasterCard.
- Marcar facturas de Odoo 18 como pagadas despues de confirmacion valida.
- Requerir validacion de webhooks.
- Requerir conciliacion de facturas.
- Tagline: `GetUpNet: conexión rápida, segura y confiable que te mantiene siempre en línea.`

Nota: si la carpeta exacta `01_Core_Platform/GetUpNet/` no existe, crearla. Si ya existe una estructura mejor, usarla y documentar la decision.

### 8. Workspace governance / external repository inventory

Crear:

```text
00_Workspace_Governance/repository_inventory.md
00_Workspace_Governance/repository_consolidation_rules.md
```

Contenido requerido:

Inventariar como pendientes de revision:

- `GetUpSoft/TaskManager`
- `GetUpSoft/GetUpBuilder`
- `GetUpSoft/TinderBot`
- `GetUpSoft/GetUpSoft`
- `getupsoft-infra`
- `getupsoft-web`
- `getupsoft-odoo-integration`
- `getupsoft-admin-portals`
- `getupnet`
- `getupnet-portal`
- `EasyCounting`
- `OdooSetup`
- `Odoo18-docker`
- `docker-odoo-16`
- `odoo_mig`
- `odoo_migf`

Columnas minimas:

- Repository
- Known purpose
- Owner/org
- Status
- Dependencies
- Secrets risk
- CI/CD state
- Recommended action: keep / archive / merge candidate / unknown
- Notes

Reglas:

- No deletion without approval.
- No rename without impact matrix.
- No merge without dependency mapping.

### 9. Product ideas backlog

Crear:

```text
00_Product_Ideas/IDEA_BACKLOG.md
00_Product_Ideas/IDEA_TRIAGE_RULES.md
```

Contenido requerido:

Incluir ideas como backlog, no como proyectos activos:

- No-code travel site.
- Agoda-style booking platform.
- ERP documentation site.
- Multi-feature code-quality extension.
- OpenClaw + Ollama multi-agent setup.
- RAG with LangChain.
- LangGraph graphs/agents.
- Embeddings/vector databases.
- MCP servers/clients.
- Telegram to MT5/NinjaTrader trading webhook.
- GoHighLevel migration with n8n.
- Google Ads GA4/GTM conversion tracking automation.
- RTSP camera ingestion and Leaflet/GPS live map.

Clasificar cada idea con:

- status: candidate / research / client-lead / discard
- priority: low / medium / high
- effort: small / medium / large
- monetization hypothesis
- next validation step

### 10. AI agent safety checklist

Crear:

```text
03_AI_Automation/AI_AGENT_SAFETY_CHECKLIST.md
```

Contenido requerido:

Cubrir riesgos:

- Agent-caused database deletion risk.
- Multi-agent coordination risk.
- Black-box drift.
- Browser-as-workspace security concerns.
- Endpoint deployment misconfiguration.
- Local compute/RAM constraints.

Controles minimos:

- dry-run obligatorio para operaciones destructivas
- rollback plan
- permission scoping
- audit logs
- approval gates
- data backup before mutation
- redaction of sensitive prompts/logs

### 11. Known issues registry

Crear o actualizar:

```text
_Knowledge_Center/Long_Term_Memory/KNOWN_ISSUES.md
```

Contenido requerido:

Agregar sin duplicar:

- PostgreSQL issues.
- Odoo XML/views issues.
- Invalid AWS region.
- `SerializationFailure` in `exo_api`.
- IA subscription/tooling problems.
- Ubuntu DNS/NIC down.
- SSH `authorized_keys` typo.
- GetUpSoft website HTTPS 502.
- GetUpSoft.com.do UTF-8 issue.

Cada issue debe tener:

- ID
- title
- project/area
- severity
- status
- first seen date if known
- evidence/source note
- next action

## Flujo de trabajo requerido

1. Crear una rama nueva desde `main`:

```bash
git checkout -b docs/implement-conversation-gap-backlog
```

2. Leer el archivo fuente:

```text
_Knowledge_Center/Long_Term_Memory/CONVERSATION_PROJECTS_GAP_IMPORT_2026-05-16.md
```

3. Antes de crear archivos, verificar si ya existen rutas equivalentes.

4. Si existe un archivo equivalente:
   - no sobrescribir ciegamente;
   - fusionar contenido de forma append-only o crear seccion fechada `2026-05-16 Conversation Gap Import`;
   - preservar contenido anterior.

5. Si no existe, crear el archivo con estructura clara.

6. Usar encabezados Markdown consistentes.

7. Agregar una seccion `Source` en cada archivo nuevo:

```markdown
## Source

Imported from conversation gap backlog on 2026-05-16. See:
`_Knowledge_Center/Long_Term_Memory/CONVERSATION_PROJECTS_GAP_IMPORT_2026-05-16.md`.
```

8. No agregar secretos.

9. Ejecutar una revision final:
   - buscar palabras como `password`, `secret`, `token`, `private key`, `BEGIN PRIVATE KEY`, `EIN`, `SSN`, `ITIN`;
   - asegurar que solo aparezcan placeholders o advertencias, no valores reales.

10. Crear commit usando Conventional Commit:

```bash
git add .
git commit -m "docs(workspace): implement conversation gap backlog"
```

11. Crear pull request contra `main` con resumen de cambios.

## Criterios de aceptacion

La implementacion se considera completa si:

- Todos los archivos listados fueron creados o actualizados de forma equivalente.
- `CONVERSATION_PROJECTS_GAP_IMPORT_2026-05-16.md` queda enlazado como fuente.
- No hay secretos reales en los archivos nuevos.
- El backlog separa claramente proyectos activos, ideas, incidentes e infraestructura.
- Los proyectos casuales o no accionables no se promueven a proyectos activos.
- Los documentos usan espanol operativo y terminologia tecnica consistente.
- El PR describe exactamente que se agrego y que queda pendiente.

## Output final esperado del agente

Responder con:

1. Lista de archivos creados.
2. Lista de archivos actualizados.
3. Riesgos o secretos potenciales detectados, sin revelar el valor sensible.
4. Decisiones tomadas cuando una ruta ya existia.
5. Comando de commit usado.
6. Link o numero de PR si aplica.
7. Pendientes recomendados para la siguiente fase.

## Prohibiciones finales

- No inventar datos legales o fiscales.
- No incluir transcripciones completas de conversaciones.
- No subir archivos ZIP de contexto al repo si contienen informacion personal no depurada.
- No mover codigo de Odoo, EasyCounting, Galantes, Chef Alitas, Orca, Hyperframes o n8n.
- No modificar configuraciones productivas.
- No ejecutar despliegues.
- No cerrar issues reales sin validacion.
