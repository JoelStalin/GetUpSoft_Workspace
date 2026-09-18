# Prompt maestro (completo) para desarrollar en Odoo 19
**Proyecto:** ISP Billing + Portal Cautivo + Cambios de plan + Pagos por transferencia (con validación 24/48h) + Dashboards ISP + Averías + Geolocalización + Preparación para pasarela de tarjeta.

---

## Instrucciones globales para el implementador
- Ejecuta las tareas completas sin pedir confirmación.
- Si faltan datos, asume valores razonables y documenta los supuestos.
- Elige opciones basadas en recomendaciones de la documentación oficial y mejores prácticas del sector ISP.
- Prioriza módulos nativos de Odoo cuando existan y estén disponibles en la edición usada.
- Aplica clean code, patrones estándar de Odoo 19 y multiempresa si aplica.

## Decisiones por defecto (asumidas y configurables)
- Autenticación cliente: `dhcp` con `dhcp_mode=dynamic`.
- Cambio de plan: requiere aprobación interna; fecha efectiva por defecto = próximo ciclo; prorrateo desactivado.
- Cambio de plan inmediato: solo para rol Admin/NOC con confirmación explícita.
- Pago por transferencia: SLA de validación 48h; alerta interna a las 24h si sigue `in_review`.
- Mora y suspensión: días de gracia 5; suspensión automática al día 10 de atraso; reconexión automática al normalizar cartera.
- Tickets: SLA objetivo por prioridad (low=72h, normal=48h, high=24h, urgent=8h).
- Geolocalización: GPS requerido para instalaciones nuevas; editable solo por técnico o admin.
- Portal: acceso solo lectura a datos financieros; adjuntos de pago obligatorios para transferencias.
- Seguridad PPPoE: contraseña visible solo para `isp.group_isp_admin`; enmascarada para otros roles.

## Rol que debes asumir (ChatGPT / equipo de desarrollo)
Actúa como **Arquitecto Funcional + Arquitecto Técnico de Odoo 19** (con experiencia real en ISPs), y entrega una propuesta **implementable** con:
- diseño funcional (flujos, estados, validaciones),
- modelo de datos (modelos Odoo, campos, relaciones),
- seguridad (ACL + record rules),
- vistas (form/list/kanban/pivot/graph),
- portal (website/portal, controladores y plantillas),
- automatizaciones (cron, notificaciones),
- y un roadmap por fases (MVP y evolución).

> Contexto técnico de red del ISP: **Starlink (upstream/backhaul) + MikroTik (edge/BNG/QoS) + OLT Stick (cabecera PON) + ONU/ONT (cliente)**.  
> El acceso es **FTTH-PON** y la salida a Internet es **Starlink**.

---

## Objetivo
Implementar una solución en Odoo 19 para gestionar el ciclo completo de un ISP:
1) clientes y servicios (con datos de red y ubicación GPS),
2) facturación recurrente por plan,
3) portal cautivo para autogestión (cambio de plan y pagos por transferencia con soporte),
4) validación y conciliación de pagos en 24/48 horas,
5) dashboards operativos y financieros,
6) reportes de averías/tickets con estadísticas por sector,
7) preparación para futura pasarela de pago con tarjeta (crédito/débito).

---

# A. Alcance funcional (requerimientos)

## A1) Portal cautivo (zona cliente)
Implementar un portal para clientes que permita:

### A1.1) Login / acceso
- Acceso por usuario portal (Odoo portal).
- Recuperación de contraseña.
- Visualización solo de información propia (record rules).

### A1.2) Estado del servicio y cuenta
Mostrar en el portal:
- Plan actual y velocidad contratada (ej. 50/10 Mbps).
- Estado: **Al día / En atraso / Suspendido**.
- Facturas: emitidas, vencidas, descargables.
- Pagos: histórico, estado de confirmación de pagos por transferencia.
- Fecha de corte / vencimiento (reglas de negocio definidas por configuración).
- Avisos: “Pago en revisión”, “Pago rechazado”, “Servicio suspendido”, etc.

### A1.3) Cambio de plan (solicitud)
Desde el portal, el cliente puede solicitar un cambio de plan:
- Selecciona nuevo plan.
- Selecciona fecha efectiva (opciones): **inmediato** o **próximo ciclo** (configurable).
- Reglas a definir:
  - ¿Hay prorrateo? (sí/no; estrategia).
  - ¿Requiere aprobación interna? (sí/no; por defecto sí).
- Estados de solicitud:
  - `draft` → `submitted` → `approved`/`rejected` → `applied`
- Notificaciones:
  - Al enviar solicitud: notificar a backoffice.
  - Al aprobar/rechazar/aplicar: notificar al cliente.

### A1.4) Pago por transferencia (fase 1)
El cliente reporta pagos por transferencia:
- Formulario portal:
  - Banco, referencia, monto, fecha/hora, nota.
  - Subida de soporte (captura PDF/JPG/PNG) como attachment.
  - Selección de factura(s) a pagar (si aplica).
- Al enviar, el sistema crea:
  1) un registro de **Solicitud de Pago por Transferencia**,
  2) y una **Orden de Pago / Registro de pago pendiente** en contabilidad (según diseño elegido),
  3) en estado “En revisión”.
- Validación interna en **24/48 horas**:
  - Aprobado: se aplica a factura(s) y se concilia.
  - Rechazado: se solicita corrección (razón obligatoria).
- Estados sugeridos:
  - `draft` (borrador portal) → `in_review` → `approved`/`rejected` → `applied` (conciliado)

### A1.5) Pasarela de tarjeta (fase 2 futura)
Arquitectura preparada para integrar pagos con tarjeta:
- Método de pago “card_gateway” (plug-in).
- Confirmación automática (webhooks).
- Conciliación automática contra facturas.
- UI portal: botón “Pagar con tarjeta” (fase 2).

---

## A2) Administración en Odoo (Backoffice ISP)

### A2.1) Dashboard ISP (cobros + operación)
Crear un dashboard accionable con KPIs:
- Clientes en atraso
- Clientes al día
- Clientes suspendidos
- MRR / Ingresos del mes
- Facturación emitida (mes/semana)
- Pagos por transferencia pendientes de validar
- Top sectores con morosidad
- Tickets avería abiertos vs cerrados
- Tiempo promedio de resolución (SLA)
- Tendencia mensual de averías
- Filtros: rango fecha, sector, plan, técnico, estado

**Accionable** = clic en KPI abre lista filtrada.

### A2.2) Gestión de clientes y “servicio de red”
En el registro del cliente y su servicio:
- Sector (normalizado)
- Latitud / longitud GPS (obligatorio para instalaciones)
- Dirección completa
- Tecnología de acceso: **FTTH-PON**
- Upstream/backhaul: **Starlink**
- Nodo/POP
- MikroTik (equipo/ubicación) asociado (opcional)
- OLT (OLT Stick) y puerto PON
- ONU/ONT serial + MAC + modelo + estado
- IP (si aplica)
- Plan/velocidad contratada
- Fecha instalación, técnico asignado
- Estado servicio (activo / suspendido / cancelado)

### A2.3) Autenticación de clientes (DHCP por defecto + PPPoE opcional)
El sistema debe soportar ambos métodos con default DHCP.

Campo:
- `auth_method`: `dhcp` (default) / `pppoe`

**DHCP (default)**
- `dhcp_mode`: `dynamic` (default) / `static`
- `mac_address` (recomendado)
- `ip_address` (requerido si static)
- DNS opcional

**PPPoE**
- `pppoe_username` (único)
- `pppoe_password` (restringido por permisos)
- `pppoe_profile` (opcional)
- IP fija opcional

Validaciones:
- Si PPPoE: username/password obligatorios.
- Si DHCP static: IP obligatoria.
- Unicidad por: `pppoe_username` e IP fija.

### A2.4) Reportes de averías (tickets) + dashboard
Módulo de averías con:
- Registro desde portal y backoffice.
- Campos: cliente, servicio, sector, GPS, tipo avería, prioridad, descripción, adjuntos.
- Asignación a técnico, estados, tiempos.
- Dashboard:
  - averías por sector,
  - promedio resolución por sector/técnico,
  - top sectores con más incidencias,
  - tendencias por semana/mes.

Estados:
- `new` → `in_progress` → `waiting_customer` → `resolved` → `closed`

---

# B. Módulos Odoo recomendados
Selecciona según disponibilidad (Community/Enterprise) y prioriza nativos:
- **Contacts** (base)
- **Accounting / Invoicing**
- **Website + Portal**
- **Subscriptions** (facturación recurrente)
- **Helpdesk** (si está disponible en la edición)
- **Documents** (opcional, para gestión de soportes)
- **Studio** (opcional, si se decide configuración rápida; preferible código)

Si Subscriptions/Helpdesk no están disponibles, implementar recurrencias y tickets con modelos propios.

## B1) Recomendaciones basadas en documentación oficial
- Portal: el módulo de portal es nativo y los usuarios portal tienen acceso de solo lectura; úsalo para autoservicio del cliente y refuerza con record rules.
- Subscriptions: está diseñado para ingresos recurrentes y se integra con Invoicing, CRM, Sales y Helpdesk; úsalo como base de facturación recurrente cuando esté disponible.

---

# C. Modelo de datos (propuesta de modelos)

## C1) Catálogos
1) `isp.sector`
- name (Char, unique)
- code (Char, opcional)
- active (Boolean)

2) `isp.plan`
- name
- price_monthly
- download_mbps
- upload_mbps
- billing_cycle (monthly)
- active

3) `isp.network.pop`
- name
- address
- sector_id (opcional)

4) `isp.network.mikrotik`
- name
- model
- serial
- mgmt_ip
- pop_id

5) `isp.network.olt`
- name
- brand/model (Char)
- mgmt_ip (opcional)
- pop_id
- ports_count (Int)

6) `isp.network.pon_port`
- olt_id
- name/number
- active

7) `isp.network.ont`
- serial (unique)
- mac_address
- model
- status (installed/stock/faulty)
- notes

## C2) Servicio del cliente
`isp.service`
- partner_id (res.partner)
- plan_id (isp.plan)
- sector_id (isp.sector)
- gps_lat (Float) [required]
- gps_lng (Float) [required]
- address_text (Text)
- pop_id (isp.network.pop)
- mikrotik_id (isp.network.mikrotik)
- olt_id (isp.network.olt)
- pon_port_id (isp.network.pon_port)
- ont_id (isp.network.ont) (o serial/mac en campos)
- service_state (active/suspended/cancelled)
- auth_method (dhcp/pppoe) [default dhcp]
- DHCP fields: dhcp_mode, mac_address, ip_address
- PPPoE fields: pppoe_username, pppoe_password, pppoe_profile
- install_date (Date)
- technician_id (res.users o hr.employee)
- notes

Reglas:
- Un cliente puede tener varios servicios (multi-site).
- Un ont_id no debe asignarse a más de un servicio activo.

## C3) Solicitudes

### C3.1) Cambio de plan
`isp.plan.change.request`
- service_id
- partner_id (related)
- current_plan_id
- requested_plan_id
- effective_date_mode (immediate/next_cycle/custom)
- effective_date (Date)
- state (draft/submitted/approved/rejected/applied)
- requested_by (portal user)
- approved_by (user)
- rejection_reason (Text)

Al aplicar:
- actualizar `isp.service.plan_id`
- disparar lógica de facturación del próximo ciclo según configuración.

### C3.2) Pago por transferencia
`isp.bank.transfer.payment`
- partner_id
- service_id (opcional)
- invoice_ids (account.move) (many2many)
- bank_name
- reference
- amount
- transfer_datetime
- attachment_ids (ir.attachment)
- state (draft/in_review/approved/rejected/applied)
- reviewer_id
- review_deadline (Datetime) = transfer_datetime + 48h (configurable 24/48)
- rejection_reason
- accounting_payment_id (account.payment) (si se crea)
- notes

Reglas:
- Al aprobar: crear/confirmar `account.payment` y conciliar con facturas seleccionadas.
- Si el monto no coincide: permitir “saldo a favor” o “pago parcial” según configuración.

## C4) Averías
`isp.fault.ticket`
- name/sequence
- partner_id
- service_id
- sector_id (related o editable)
- gps_lat/gps_lng (related del servicio, editable si se detecta error)
- fault_type (catálogo)
- priority (low/normal/high/urgent)
- description
- attachment_ids
- state (new/in_progress/waiting_customer/resolved/closed)
- assigned_to (técnico)
- opened_at, closed_at
- resolution_time_hours (compute)
- sla_target_hours (por prioridad)

---

# D. Flujos de proceso (pseudo-BPMN)

## D1) Cambio de plan
Cliente (portal) → crea solicitud → Estado `submitted`  
Backoffice → revisa → `approved` o `rejected`  
Si approved:
- aplicar en `effective_date`:
  - actualizar plan del servicio,
  - recalcular próximos cargos,
  - notificar cliente,
  - registrar auditoría (`mail.thread`).

## D2) Pago por transferencia (24/48)
Cliente → envía formulario + adjunto → `in_review`  
Sistema:
- registra deadline 24/48 (config)
- notifica a “Cobros”
Cobros:
- valida soporte y monto
- si OK → `approved` y crea/valida pago contable
- concilia con factura(s) → `applied`
- notifica cliente
Si NO:
- `rejected` + razón obligatoria
- notifica cliente para reintentar

## D3) Mora y suspensión
Cron diario:
- detectar facturas vencidas + días de gracia
- marcar servicio “in_arrears” (campo o estado)
- opcional: suspender tras X días → `suspended`
Al aplicarse pago:
- reactivar automáticamente si ya no hay atraso.

## D4) Averías
Cliente o Call Center crea ticket → `new`
Asignar técnico → `in_progress`
Si requiere info cliente → `waiting_customer`
Resolución → `resolved` y luego cierre → `closed`
Métricas: tiempo total, SLA, ranking por sector.

---

# E. Portal (páginas y endpoints)

## E1) Menú portal
- Mi cuenta (resumen)
- Mi servicio (plan/estado)
- Mis facturas
- Reportar pago (transferencia)
- Solicitar cambio de plan
- Reportar avería
- Mis averías (historial)

## E2) Controladores (routes) sugeridos
- GET `/my/isp` resumen
- GET `/my/isp/service/<id>`
- GET `/my/isp/invoices`
- GET/POST `/my/isp/payments/transfer`
- GET/POST `/my/isp/plan/change`
- GET/POST `/my/isp/faults/new`
- GET `/my/isp/faults`

Requisitos:
- Validar ownership (solo registros del usuario portal).
- Subida segura de attachments.
- Mensajes de estado claros.

---

# F. Dashboards y reportes

## F1) Dashboard Cobros
- KPIs: al día / atraso / suspendidos
- Pendientes de validación (transferencias)
- Aging report (0-30, 31-60, 61+)

## F2) Dashboard Averías
- Tickets abiertos/cerrados
- Tendencias por fecha
- Por sector y por técnico
- SLA promedio y cumplimiento

Implementación:
- vistas pivot/graph + acciones
- opcional: dashboard OWL si se requiere layout tipo “BI”.

---

# G. Seguridad (ACL + Record Rules)

## G1) Grupos sugeridos
- `isp.group_portal_customer`
- `isp.group_billing_agent`
- `isp.group_support_agent`
- `isp.group_technician`
- `isp.group_isp_admin`

## G2) Reglas clave
- Portal: solo sus servicios, facturas, pagos reportados, tickets.
- Cobros: ver/validar pagos transferencia, ver facturas, cambiar estado servicio.
- Soporte: gestionar tickets.
- Técnico: ver tickets asignados, actualizar notas y GPS (si autorizado).
- Admin: todo.

Campos sensibles:
- `pppoe_password` visible solo Admin/TI.

---

# H. Automatizaciones (cron y notificaciones)

1) Cron “Vencimientos” (diario)
- marcar clientes en atraso
- suspender tras X días (si habilitado)

2) Cron “Transferencias vencidas” (cada hora)
- si `in_review` y excede deadline → alerta interna / escalación
- opcional: auto-cambiar a “requires_attention”

3) Notificaciones
- email (básico) o WhatsApp (fase futura)
- notificar cambios de estado en pagos, planes y tickets

---

# I. Roadmap por fases

## Fase 1 (MVP)
- Modelos: servicio, sector, plan, pago transferencia, cambio plan, averías
- Portal: reportar pago transferencia + cambio plan + averías
- Validación y conciliación manual en Odoo
- Dashboards con pivot/graph + acciones
- Seguridad y auditoría

## Fase 2
- Integración MikroTik API (opcional) para:
  - crear PPPoE secrets/perfiles
  - colas DHCP por IP/MAC
  - suspensión/reactivación automática
- Pasarela de pago con tarjeta (webhooks)
- Mapa/geomapas (si se habilita) y analítica avanzada

---

# J. Criterios de aceptación (testable)
1) Un cliente portal puede:
- ver estado de servicio, facturas
- solicitar cambio de plan
- reportar pago por transferencia con soporte
- crear ticket de avería

2) Backoffice puede:
- ver dashboard y listas filtradas
- validar pago por transferencia y conciliar
- aprobar/rechazar cambios de plan
- ver estadísticas de averías por sector

3) Seguridad:
- portal no puede ver datos de otros
- password PPPoE no visible a roles no autorizados

4) SLA 24/48:
- la transferencia en revisión muestra deadline y genera alertas al vencer

---

# L. Entorno local, precarga MikroTik y pruebas (testing)

## L1) Ejecución en local (desarrollo y QA)
El proyecto debe poder **correr localmente** para desarrollo y pruebas funcionales, con un procedimiento reproducible.

Requerimientos:
- Documentar un **setup local** (Windows/Linux) para Odoo 19 + PostgreSQL.
- Proveer una opción con **Docker Compose** (recomendado) y otra opción “nativo” (opcional).
- Incluir:
  - archivo(s) de configuración (`odoo.conf`),
  - dependencias Python (`requirements.txt` si aplica),
  - módulos en un repositorio con estructura estándar de addons,
  - datos demo opcionales para pruebas (clientes, planes, tickets, facturas, etc.).

Entregables mínimos:
- `docker-compose.yml` (odoo + postgres)
- `odoo.conf` ejemplo
- README con pasos exactos para:
  1) levantar servicios,
  2) crear DB,
  3) instalar módulo ISP,
  4) cargar datos demo,
  5) correr test.

## L2) Precarga de configuración MikroTik (equipo en LAN, “factory default”)
Se requiere una funcionalidad para **precargar una configuración base** en un MikroTik conectado a la red local, que viene **configurado de fábrica**.

Alcance:
- Diseñar un **asistente de provisión** (wizard) en Odoo para:
  1) detectar/seleccionar el MikroTik en LAN (por IP),
  2) conectarse usando credenciales suministradas por el operador,
  3) aplicar una **configuración base** (plantilla) para operación inicial del ISP,
  4) guardar en Odoo un “snapshot”/resumen de lo aplicado (auditable).

Condiciones importantes:
- **No hardcodear credenciales.** El operador debe introducirlas en el wizard.
- Manejar el escenario típico de fábrica (por ejemplo IP por defecto y usuario admin), pero **siempre configurable** por el operador.
- Registrar logs de ejecución (qué se aplicó, cuándo y por quién).
- Implementar “modo simulación” (dry-run) para validar comandos sin aplicar (si es posible).

Contenido mínimo de la configuración base (plantilla “MikroTik Base ISP”):
- Identidad del router / nombre del equipo
- Configuración básica de WAN (Starlink como upstream) según interfaz elegida
- LAN / bridge básico
- DHCP server básico (si aplica)
- NAT básico hacia WAN
- Reglas mínimas de firewall (baseline seguro)
- Colas/QoS base (plantilla; vinculable a planes en fase 2)
- Objetos para operación:
  - listas (address-list) para “morosos/suspendidos” (aunque sea vacío en fase 1)
  - comentarios/convenciones de nombres (nomenclatura estándar)

Nota:
- La precarga debe ser **idempotente** en lo posible: si se corre 2 veces, no debe duplicar reglas/objetos.
- Permitir exportar/importar plantillas de configuración (por ejemplo JSON/YAML interno en Odoo) para evolucionarlas.

Integración técnica sugerida (definir por el implementador):
- MikroTik RouterOS API (preferido), o SSH (si aplica), con manejo de timeouts/reintentos.
- Separar en un submódulo `isp_mikrotik_provisioning` para mantener el código aislado.

## L3) Pruebas: testing técnico y pruebas funcionales (UAT)
El proyecto debe incluir un plan de pruebas y pruebas automatizadas donde aplique.

### L3.1) Testing técnico (automatizado)
- **Unit tests** para modelos:
  - validaciones de `auth_method` (DHCP/PPPoE),
  - reglas de unicidad (username PPPoE, IP fija),
  - estados y transiciones (pagos, cambios de plan, tickets).
- **Integration tests**:
  - creación de solicitud de transferencia desde portal (simulada),
  - aprobación y conciliación contable (si aplica),
  - generación de alertas por deadline 24/48.
- Si se incluye provisión MikroTik: tests de “mock” (no tocar equipo real en CI).

Ejecución:
- Incluir instrucciones para correr tests con el framework de Odoo (`--test-enable`) y/o pytest si se usa.

### L3.2) Pruebas funcionales (manuales)
Entregar un **script de pruebas UAT** con casos verificables, por roles:

- Portal Cliente:
  - ver facturas, ver estado, solicitar cambio de plan, reportar pago transferencia (con adjunto), crear avería.
- Cobros:
  - ver cola de transferencias, aprobar/rechazar con razón, conciliar y ver impacto en facturas/estado.
- Soporte:
  - crear/asignar tickets, cambiar estados, medir tiempos.
- Técnico:
  - ver tickets asignados, registrar resolución, ajustar GPS (si permitido).
- Admin:
  - ver dashboards, KPIs accionables, filtros por sector/plan.

Entorno:
- Correr todo en local con datos demo precargados.
- Incluir checklist para validar dashboards (pivots/graphs) y accesos (ACL/record rules).

---

# K. Entregables esperados del asistente/desarrollador
1) Documento funcional + técnico
2) Diccionario de datos (modelos, campos, relaciones)
3) Vistas y menús
4) Controladores portal + templates
5) Reglas de seguridad
6) Cron jobs y notificaciones
7) Plan de despliegue y pruebas

---

## Instrucción final para el implementador (ChatGPT / equipo)
Responde con:
1) arquitectura propuesta y módulos Odoo a usar,
2) ERD textual de modelos y relaciones,
3) flujos detallados por proceso,
4) estructura del módulo (carpetas/archivos),
5) endpoints portal y formularios,
6) roadmap por fases + riesgos y mitigaciones,
7) checklist de pruebas (UAT).

Fin del prompt.
