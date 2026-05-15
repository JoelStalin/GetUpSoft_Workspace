# ISP Odoo 19 + MikroTik + ONU + Portal Cautivo — Master Plan (Casos de Uso + Matriz + Selenium + Preloader)

## 0) Propósito
Este documento define el alcance funcional y técnico para un sistema ISP sobre **Odoo 19** integrado con **MikroTik RouterOS**, con gestión de **ONU/ONT**, **Portal Cautivo (Hotspot)**, facturación, suspensión/reconexión automática y trazabilidad operacional.

Incluye:
- Casos de uso (CU)
- Roles/permisos
- Matriz de implementación (Modelos / Jobs / RouterOS / Vistas / Seguridad / Tests)
- Estrategia de pruebas funcionales con Selenium
- Script de “preloader” para automatizar onboarding de nuevos MikroTik, asociados a sector/ubicación

---

## 1) Módulos Odoo (Addons)
- `isp_core`:
  - dominio base (cliente, contrato, planes, sector/ubicación, dispositivos, jobs, auditoría)
- `isp_mikrotik`:
  - integración RouterOS y orquestación de provisioning
- `isp_onu`:
  - inventario ONU/ONT + asignación a contratos
- `isp_captive_portal`:
  - gestión vouchers / hotspot / walled-garden
- `isp_billing`:
  - facturación recurrente + suspensión por mora + reconexión por pago
- `isp_portal`:
  - portal cliente (self-service)

---

## 2) Roles y permisos (Grupos)
Definir grupos Odoo:
1. `ISP Admin`: control total
2. `NOC Operator`: provisioning, sesiones, gestión dispositivos (sin contabilidad avanzada)
3. `Field Technician`: ONU + asignación + activaciones limitadas
4. `Customer Support`: ver cliente/contrato + suspender/reconectar manual (sin ver credenciales RouterOS)
5. `Billing`: facturación, cobranza, suspensión automática
6. `Portal Customer`: solo portal web

Recomendación de enfoque:
- Credenciales/secretos RouterOS: visibles solo a `ISP Admin` y `NOC Operator`
- Acciones críticas (suspender/reconectar/cambio plan): registradas en `isp.audit_log`

---

## 3) Entidades (Modelos) propuestos (Base)
### 3.1 Sector / Ubicación (OBLIGATORIO)
- `isp.sector`:
  - `name`
  - `code` (único)
  - `city`, `zone`, `address` (opcional)
  - `gps_lat`, `gps_lng` (opcional)
  - `notes`
- `isp.network_site` (si lo separas de sector):
  - `name`, `sector_id`, `tags`, `notes`

> Regla: **cada MikroTik debe estar asociado a un `isp.sector`** (y/o site).

### 3.2 Dispositivos y RouterOS
- `isp.device`:
  - `name`
  - `device_type` (mikrotik/olt/other)
  - `sector_id` (Many2one a `isp.sector`) **OBLIGATORIO para mikrotik**
  - `mgmt_ip`, `mgmt_port`
  - `status` (draft/active/maintenance/retired)
  - `tags`
- `isp.mikrotik.router` (si lo separas por claridad):
  - `device_id` (link a isp.device)
  - `api_user` (guardado en system parameters o en campos cifrados según tu estrategia)
  - `auth_method` (api/ssh)
  - `routeros_version` (read-only, opcional)
  - `last_healthcheck_at`, `last_healthcheck_status`

### 3.3 Cliente, planes, contrato
- `isp.service_plan`:
  - `name`, `type` (pppoe/dhcp/hotspot)
  - `down_mbps`, `up_mbps`
  - `price`, `currency`, `taxes`
  - `mikrotik_profile` (mapeo a RouterOS)
  - `qos_policy` (opcional)
  - `suspend_after_days` (int)
- `isp.subscription`:
  - `partner_id` (res.partner)
  - `plan_id`
  - `sector_id`
  - `onu_assignment_id` (si aplica)
  - `state` (draft/active/suspended/terminated)
  - `start_date`, `next_invoice_date`, `last_invoice_id`
  - `pppoe_username`, `pppoe_password` (si PPPoE; idealmente generados y protegidos)
  - `service_ip` (si static)
  - `notes`

### 3.4 ONU / asignación
- `isp.onu`:
  - `serial` (único), `vendor`, `model`
  - `sector_id`, `olt_ref`, `pon_port`
  - `vlan`, `status` (stock/installed/faulty)
- `isp.onu.assignment`:
  - `onu_id`, `subscription_id`
  - `active` boolean + fechas `assigned_at`, `unassigned_at`
  - parámetros técnicos (perfil/vlan/etc.)

### 3.5 Jobs y auditoría
- `isp.provisioning_job`:
  - `job_type` (activate/suspend/reconnect/change_plan/captive_user_create/etc.)
  - `subscription_id`, `device_id`, `sector_id`
  - `state` (queued/running/success/failed)
  - `attempts`, `max_attempts`
  - `error_message`, `traceback` (cuidado con datos sensibles)
  - `requested_by`, `requested_at`, `executed_at`
- `isp.audit_log`:
  - `action`, `model`, `record_ref`
  - `user_id`, `timestamp`
  - `details` (texto estructurado)

---

## 4) Casos de Uso (CU)
### Dominio / ventas
- CU-01 Alta de cliente ISP
- CU-02 Creación de plan de servicio
- CU-03 Crear contrato/suscripción
- CU-04 Validar elegibilidad (cobertura/recursos/estado cliente)

### Inventario técnico
- CU-05 Registrar ONU/ONT
- CU-06 Crear perfil técnico ONU
- CU-07 Asignar ONU a contrato
- CU-08 Reasignación ONU

### MikroTik / RouterOS
- CU-09 Registrar MikroTik gestionado
- CU-10 Healthcheck diagnóstico MikroTik
- CU-11 Aprovisionar PPPoE
- CU-12 Aprovisionar DHCP (pool/reservas)
- CU-13 Aplicar QoS / colas
- CU-14 Activación completa contrato (orquestación)
- CU-15 Modificar plan (upgrade/downgrade)
- CU-16 Desaprovisionar / baja técnica

### Operación / soporte
- CU-17 Consultar sesiones activas
- CU-18 Forzar desconexión
- CU-19 Suspensión manual (soporte)
- CU-20 Reconexión manual
- CU-21 Ticket/avería (placeholder)

### Portal cautivo
- CU-22 Crear voucher / usuario cautivo
- CU-23 Login portal cautivo
- CU-24 Suspender voucher
- CU-25 Gestionar walled garden
- CU-26 Consultar sesiones cautivo

### Facturación / suspensión automática
- CU-27 Factura recurrente
- CU-28 Registrar pago
- CU-29 Suspensión automática por mora
- CU-30 Reconexión automática por pago
- CU-31 Notificaciones (opcional)

### Administración / auditoría / multi-sitio
- CU-32 Roles y permisos
- CU-33 Auditoría técnica y negocio
- CU-34 Bitácora de jobs provisioning
- CU-35 Gestión multi-sitio/sector

### Reportes / exportación
- CU-36 Reporte contratos por estado
- CU-37 Reporte cartera y morosidad
- CU-38 Reporte suspensiones y reconexiones
- CU-39 Reporte inventario ONU
- CU-40 Exportación técnica (inventario/config lectura)

---

## 5) Matriz CU → (Modelos / Jobs / RouterOS / Vistas / Seguridad / Tests)
**Convenciones:**
- RouterOS commands: se listan como “rutas” y operaciones típicas; la librería (ej. `librouteros`) traduce a llamadas API.
- Tests:
  - Unit: pytest + mocks (cliente RouterOS)
  - Integration: Odoo test framework (`--test-enable`)
  - Functional: Selenium (UI end-to-end)

> Nota: Algunos CUs comparten modelos/jobs. Aquí se especifica lo “mínimo” para evitar inventar.

### CU-01 Alta de cliente ISP
- Modelos: `res.partner` (extend), `isp.customer` (si haces wrapper)
- Jobs: —
- RouterOS: —
- Vistas: form/list cliente, campos ISP
- Seguridad: Support/Billing/NOC lectura; Admin full
- Tests:
  - Unit: validaciones de campos
  - Functional (Selenium): crear partner + marcar como cliente ISP

### CU-02 Creación plan
- Modelos: `isp.service_plan`
- Jobs: —
- RouterOS: —
- Vistas: plan form/list
- Seguridad: Admin/NOC/Billing write, Support read
- Tests: Selenium crear plan, validar campos obligatorios

### CU-03 Crear contrato
- Modelos: `isp.subscription`, `isp.sector`, `isp.service_plan`
- Jobs: `isp.provisioning_job` (solo si activas directo)
- RouterOS: —
- Vistas: contrato form/list, smart buttons (jobs, facturas)
- Seguridad: Support write limitado, Billing write, Admin full
- Tests: Selenium crear contrato en estado draft

### CU-04 Validar elegibilidad
- Modelos: `isp.subscription`, `isp.sector`, `isp.device`, `isp.mikrotik.router`
- Jobs: opcional `eligibility_check`
- RouterOS: healthcheck si aplica
- Vistas: wizard “check eligibility”
- Seguridad: NOC/Support
- Tests: Unit lógica elegibilidad + Selenium wizard

### CU-05 Registrar ONU/ONT
- Modelos: `isp.onu`, `isp.sector`
- Jobs: —
- RouterOS: —
- Vistas: ONU form/list
- Seguridad: Field Tech write, NOC/Admin full
- Tests: Selenium crear ONU (serial único)

### CU-06 Perfil técnico ONU
- Modelos: `isp.onu.profile`
- Jobs: —
- RouterOS: —
- Vistas: perfil form/list
- Seguridad: NOC/Admin
- Tests: Unit validación perfil + Selenium

### CU-07 Asignar ONU a contrato
- Modelos: `isp.onu.assignment`, `isp.onu`, `isp.subscription`
- Jobs: `provisioning_job` (activate/reconfigure)
- RouterOS: depende plan (pppoe/dhcp)
- Vistas: wizard asignación, historial asignaciones
- Seguridad: Field Tech write limitado, NOC/Admin full
- Tests:
  - Integration: constraint “ONU solo 1 activa”
  - Selenium: asignar ONU desde contrato

### CU-08 Reasignación ONU
- Modelos: `isp.onu.assignment`
- Jobs: `change_onu_job`
- RouterOS: reprovision (pppoe secret/queue update)
- Vistas: wizard reasignación + motivo
- Seguridad: NOC/Admin, Field Tech con aprobación opcional
- Tests: Integration historial + Selenium reasignación

### CU-09 Registrar MikroTik gestionado
- Modelos: `isp.device`, `isp.mikrotik.router`, `isp.sector`
- Jobs: —
- RouterOS: —
- Vistas: dispositivo form/list, sector requerido
- Seguridad: NOC/Admin write
- Tests: Selenium crear mikrotik asociado a sector

### CU-10 Healthcheck MikroTik
- Modelos: `isp.mikrotik.router`, `isp.audit_log`
- Jobs: `healthcheck_job` (cron)
- RouterOS:
  - `/system/resource/print`
  - `/system/identity/print`
- Vistas: botón “Healthcheck”, dashboard estado
- Seguridad: NOC/Admin
- Tests:
  - Unit: cliente routeros mock
  - Selenium: click healthcheck y ver resultado

### CU-11 Aprovisionar PPPoE
- Modelos: `isp.subscription`, `isp.service_plan`, `isp.mikrotik.router`, `isp.provisioning_job`
- Jobs: `job_activate_pppoe`
- RouterOS:
  - `/ppp/secret/add name=<user> password=<pass> profile=<profile> service=pppoe`
  - `/ppp/secret/set [find name=<user>] disabled=no profile=<profile>`
- Vistas: smart button “Provisioning Jobs”, estado técnico
- Seguridad: NOC/Admin; Support solo “solicitar”
- Tests:
  - Unit: construir comandos
  - Integration: transiciones estado contrato
  - Selenium: activar contrato → job en success (mock env)

### CU-12 Aprovisionar DHCP
- Modelos: `isp.subscription`, `isp.mikrotik.router`
- Jobs: `job_activate_dhcp`
- RouterOS:
  - Pools: `/ip/pool/add name=<sector_pool> ranges=<range>`
  - Reservations (si): `/ip/dhcp-server/lease/add address=<ip> mac-address=<mac> comment=<sub>`
- Vistas: contrato (ip/mac), sector pools
- Seguridad: NOC/Admin
- Tests: Unit + Selenium (creación contrato DHCP)

### CU-13 QoS / colas
- Modelos: `isp.service_plan`, `isp.subscription`
- Jobs: `job_ensure_queue`
- RouterOS:
  - `/queue/simple/add target=<ip>/32 max-limit=<down>/<up> comment=<sub>`
  - `/queue/simple/set [find comment=<sub>] max-limit=...`
- Vistas: contrato, sección “QoS”
- Seguridad: NOC/Admin
- Tests: Unit generación max-limit + Selenium update plan

### CU-14 Activación completa contrato
- Modelos: `isp.subscription`, `isp.onu.assignment`, `isp.provisioning_job`
- Jobs: `job_activate_subscription` (orquestador)
- RouterOS: combina CU-11/12/13 + validaciones
- Vistas: botón “Activate”, job timeline
- Seguridad: NOC/Admin, Field Tech opcional
- Tests:
  - Integration: estado draft→active
  - Selenium: activar desde UI

### CU-15 Modificar plan
- Modelos: `isp.subscription`, `isp.service_plan`, `isp.provisioning_job`
- Jobs: `job_change_plan`
- RouterOS: actualizar secret profile y/o queue max-limit
- Vistas: wizard cambio plan
- Seguridad: Support (solicitar), Billing/NOC ejecuta
- Tests: Selenium cambio plan + ver job success

### CU-16 Desaprovisionar / baja
- Modelos: `isp.subscription`, `isp.provisioning_job`
- Jobs: `job_terminate_subscription`
- RouterOS:
  - disable/remove secret: `/ppp/secret/set [find name=<user>] disabled=yes`
  - remove queue: `/queue/simple/remove [find comment=<sub>]`
- Vistas: botón “Terminate”, confirm wizard
- Seguridad: Admin/NOC
- Tests: Selenium terminate + estado terminated

### CU-17 Consultar sesiones activas
- Modelos: `isp.subscription`, `isp.mikrotik.router`
- Jobs: opcional cron “sync sessions”
- RouterOS:
  - PPPoE: `/ppp/active/print`
  - Hotspot: `/ip/hotspot/active/print`
- Vistas: pestaña “Sessions”, list view
- Seguridad: NOC/Admin, Support read parcial
- Tests: Unit parse sessions + Selenium ver lista

### CU-18 Forzar desconexión
- Modelos: `isp.subscription`, `isp.provisioning_job`, `isp.audit_log`
- Jobs: `job_disconnect_session`
- RouterOS:
  - PPPoE: `/ppp/active/remove [find name=<user>]`
  - Hotspot: `/ip/hotspot/active/remove [find user=<u>]`
- Vistas: botón “Disconnect”
- Seguridad: NOC/Admin
- Tests: Selenium disconnect + auditoría creada

### CU-19 Suspensión manual
- Modelos: `isp.subscription`, `isp.provisioning_job`
- Jobs: `job_suspend_subscription`
- RouterOS:
  - disable secret + optionally queue limit 0
- Vistas: botón “Suspend” + motivo
- Seguridad: Support (si permites), NOC/Admin
- Tests: Selenium suspender + estado suspended

### CU-20 Reconexión manual
- Modelos: `isp.subscription`, `isp.provisioning_job`
- Jobs: `job_reconnect_subscription`
- RouterOS: enable secret + ensure queue
- Vistas: botón “Reconnect”
- Seguridad: Support/Billing/NOC según política
- Tests: Selenium reconectar + estado active

### CU-21 Ticket/avería (placeholder)
- Modelos: `isp.ticket` (o `helpdesk.ticket` integración)
- Jobs: —
- RouterOS: —
- Vistas: tickets list/form
- Seguridad: Support, Portal Customer
- Tests: Selenium crear ticket desde portal (si implementas)

### CU-22 Crear voucher / usuario cautivo
- Modelos: `isp.captive.user`, `isp.mikrotik.router`
- Jobs: `job_captive_user_create`
- RouterOS:
  - `/ip/hotspot/user/add name=<u> password=<p> profile=<profile> disabled=no comment=<sector>`
- Vistas: voucher wizard + print
- Seguridad: Support/NOC/Admin
- Tests: Selenium crear voucher

### CU-23 Login portal cautivo
- Modelos: `isp.captive.user`, `isp.captive.session`
- Jobs: opcional “sync sessions”
- RouterOS: login/authorize (depende integración portal)
- Vistas: website login page + terms
- Seguridad: Portal public
- Tests: Selenium flujo login + aceptación términos

### CU-24 Suspender voucher
- Modelos: `isp.captive.user`, `isp.audit_log`
- Jobs: `job_captive_user_disable`
- RouterOS:
  - `/ip/hotspot/user/set [find name=<u>] disabled=yes`
- Vistas: botón disable
- Seguridad: Support/NOC/Admin
- Tests: Selenium disable voucher

### CU-25 Walled garden
- Modelos: `isp.captive.walled_garden`
- Jobs: `job_apply_walled_garden`
- RouterOS:
  - `/ip/hotspot/walled-garden/add dst-host=<domain>`
- Vistas: list/form dominios permitidos
- Seguridad: NOC/Admin
- Tests: Unit generate rules + Selenium add domain

### CU-26 Sesiones cautivo
- Modelos: `isp.captive.session`
- Jobs: cron “sync hotspot active”
- RouterOS:
  - `/ip/hotspot/active/print`
- Vistas: sesiones list
- Seguridad: NOC/Admin
- Tests: Unit parse + Selenium view

### CU-27 Factura recurrente
- Modelos: `account.move`, `isp.subscription`
- Jobs: cron `job_generate_invoices`
- RouterOS: —
- Vistas: facturas, smart button en contrato
- Seguridad: Billing/Admin
- Tests: Integration generar factura + Selenium ver invoice creada

### CU-28 Registrar pago
- Modelos: `account.payment`, `isp.subscription`
- Jobs: —
- RouterOS: —
- Vistas: pago y conciliación
- Seguridad: Billing/Admin
- Tests: Selenium registrar pago y ver contrato actualizado (si aplica)

### CU-29 Suspensión automática por mora
- Modelos: `isp.subscription`, `account.move`, `isp.provisioning_job`
- Jobs: cron `job_suspend_overdue`
- RouterOS: disable secret/queue
- Vistas: report mora + logs job
- Seguridad: Billing/NOC/Admin
- Tests: Integration simular vencida + job → suspended; Selenium ver estado

### CU-30 Reconexión automática por pago
- Modelos: `isp.subscription`, `account.payment`, `isp.provisioning_job`
- Jobs: `job_reconnect_on_payment`
- RouterOS: enable secret + ensure queue
- Vistas: historial reconexión
- Seguridad: Billing/NOC/Admin
- Tests: Integration pago → active; Selenium

### CU-31 Notificaciones (opcional)
- Modelos: `mail.mail`/`mail.template`
- Jobs: cron notify
- RouterOS: —
- Vistas: plantillas y logs
- Seguridad: Admin/Billing
- Tests: Unit render templates

### CU-32 Roles y permisos
- Modelos: security XML + access CSV
- Jobs: —
- RouterOS: —
- Vistas: —
- Seguridad: (este CU es la seguridad)
- Tests: Integration “access rights” + Selenium (menús visibles)

### CU-33 Auditoría
- Modelos: `isp.audit_log`
- Jobs: hooks en acciones críticas
- RouterOS: —
- Vistas: auditoría list + filtros por acción/usuario
- Seguridad: Admin/NOC read; Support read parcial
- Tests: Integration al suspender crea audit_log

### CU-34 Bitácora de jobs
- Modelos: `isp.provisioning_job`
- Jobs: (este es el sistema de jobs)
- RouterOS: —
- Vistas: kanban/list jobs, reintentos
- Seguridad: NOC/Admin
- Tests: Integration reintentos y estado

### CU-35 Multi-sitio/sector
- Modelos: `isp.sector`, record rules
- Jobs: —
- RouterOS: —
- Vistas: sectores + relación con dispositivos y contratos
- Seguridad: record rules por sector si aplica
- Tests: Integration record rules

### CU-36 Reporte contratos por estado
- Modelos: `isp.subscription`
- Jobs: —
- RouterOS: —
- Vistas: pivot/graph/list + filtros
- Seguridad: Billing/Support/NOC read
- Tests: Selenium abrir reporte y filtrar

### CU-37 Reporte morosidad
- Modelos: `account.move`, `isp.subscription`
- Jobs: —
- RouterOS: —
- Vistas: pivot morosidad
- Seguridad: Billing/Admin
- Tests: Selenium reporte

### CU-38 Reporte suspensiones/reconexiones
- Modelos: `isp.audit_log`, `isp.subscription`
- Jobs: —
- RouterOS: —
- Vistas: reporte basado en auditoría/jobs
- Seguridad: Admin/NOC/Billing
- Tests: Selenium reporte

### CU-39 Inventario ONU
- Modelos: `isp.onu`, `isp.onu.assignment`
- Jobs: —
- RouterOS: —
- Vistas: inventory list + status
- Seguridad: Field Tech/NOC/Admin
- Tests: Selenium filtros (stock/installed)

### CU-40 Exportación técnica (lectura)
- Modelos: `isp.mikrotik.router`
- Jobs: `job_export_config_snapshot` (read-only)
- RouterOS:
  - `/ppp/secret/print`
  - `/queue/simple/print`
  - (guardar snapshot en adjunto Odoo)
- Vistas: botón export + attachments
- Seguridad: Admin/NOC
- Tests: Unit export builder + Selenium descarga adjunto

---

## 6) Pruebas funcionales con Selenium (E2E)
### 6.1 Objetivo
Validar flujos reales en la UI de Odoo:
- Crear plan, contrato, sector, dispositivo MikroTik
- Registrar ONU y asignarla
- Activación → job
- Facturación → suspensión por mora → pago → reconexión
- Portal cautivo: crear voucher y deshabilitar

### 6.2 Recomendación técnica
- Ejecutar Selenium contra Odoo en Docker Compose.
- Usar Chrome en modo headless.
- Separar “test data” (fixtures) de los tests.

### 6.3 Suite de pruebas propuesta (mínimo)
1. `test_01_create_sector_and_mikrotik_device`
2. `test_02_create_plan_and_subscription_draft`
3. `test_03_register_onu_and_assign_to_subscription`
4. `test_04_activate_subscription_creates_success_job` (con entorno mock o routeros staging)
5. `test_05_generate_invoice_and_suspend_overdue`
6. `test_06_register_payment_and_reconnect`
7. `test_07_create_captive_voucher_and_disable`

### 6.4 Esqueleto de proyecto de Selenium (ejemplo)
Ubicación sugerida: `tests/selenium/`

Estructura:
- `tests/selenium/requirements.txt`
- `tests/selenium/pages/` (Page Object Model)
- `tests/selenium/test_flows.py`

#### 6.4.1 requirements.txt (selenium)
- selenium
- pytest
- webdriver-manager (opcional, si no montas driver fijo)

#### 6.4.2 Variables de entorno para tests
- `ODOO_BASE_URL=http://localhost:8069`
- `ODOO_DB=odoo`
- `ODOO_ADMIN_USER=admin`
- `ODOO_ADMIN_PASS=admin`

#### 6.4.3 Ejemplo de Page Object (pseudo-código)
```python
# tests/selenium/pages/login_page.py
from selenium.webdriver.common.by import By

class LoginPage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    def open(self):
        self.driver.get(f"{self.base_url}/web/login")

    def login(self, user, password):
        self.driver.find_element(By.NAME, "login").send_keys(user)
        self.driver.find_element(By.NAME, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
```

#### 6.4.4 Ejemplo de test funcional
```python
# tests/selenium/test_flows.py
import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pages.login_page import LoginPage

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    d = webdriver.Chrome(options=options)
    yield d
    d.quit()

def test_login_admin(driver):
    base_url = os.environ["ODOO_BASE_URL"]
    user = os.environ["ODOO_ADMIN_USER"]
    password = os.environ["ODOO_ADMIN_PASS"]

    page = LoginPage(driver, base_url)
    page.open()
    page.login(user, password)

    assert "web" in driver.current_url
```

> Nota práctica: Para flujos complejos de Odoo, usa selectores robustos (data-* si los agregas) y evita CSS frágil.

---

## 7) Script “Preloader” para configurar nuevos MikroTik automáticamente
### 7.1 Objetivo
Automatizar el onboarding de MikroTik nuevos a la red:
1. Descubrir MikroTik en un rango/subred
2. Conectarse con credenciales “bootstrap” (default o temporales)
3. Configurar:
   - Identity (nombre)
   - Habilitar API (si no está)
   - Crear usuario de gestión “odoo_noc” con permisos mínimos
   - Establecer firewall básico para permitir API solo desde IP de Odoo/NOC
   - (Opcional) set NTP, DNS, timezone
4. Asociarlo a un `sector`/ubicación
5. Registrarlo automáticamente en Odoo (`isp.device` + `isp.mikrotik.router`)

### 7.2 Consideraciones de seguridad (NO negociables)
- No guardar passwords en texto plano en git.
- El script debe leer secretos desde:
  - variables de entorno, o
  - archivo local `.secrets.env` fuera del repo
- Permitir whitelist de IPs (Odoo host / NOC host)
- Rotar credenciales “bootstrap” una vez provisionado

### 7.3 Entrada del Preloader
- `sector_code`: código del sector al cual pertenece el MikroTik
- `mgmt_subnet`: rango a escanear (ej. `192.168.88.0/24`)
- `bootstrap_user`, `bootstrap_pass`: credenciales iniciales
- `odoo_url`, `odoo_db`, `odoo_user`, `odoo_pass` (para registrar en Odoo)
- `allowed_mgmt_ips`: lista de IPs permitidas para API

### 7.4 Output
- Lista de dispositivos detectados y configurados
- Registro en Odoo con:
  - `sector_id`
  - `mgmt_ip`, `mgmt_port`
  - estado `active`
  - audit log del onboarding

### 7.5 Ubicación recomendada
`tools/mikrotik_preloader/`
- `preloader.py`
- `config.example.yaml`
- `README.md`

### 7.6 Pseudo-implementación (Python)
Dependencias sugeridas:
- `librouteros` (RouterOS API)
- `pydantic` (config)
- `pyyaml` (config)
- `requests` o `xmlrpc.client` para Odoo (recomendado XML-RPC estable)

#### 7.6.1 config.example.yaml
```yaml
sector_code: "SEC-BOG-01"
mgmt_subnet: "192.168.88.0/24"
bootstrap:
  user: "admin"
  pass: "admin"
routeros:
  api_port: 8728
  mgmt_user: "odoo_noc"
  mgmt_pass_env: "MIKROTIK_MGMT_PASS"   # se lee desde env
  allowed_mgmt_ips:
    - "10.0.0.10"  # IP Odoo
    - "10.0.0.20"  # IP NOC
odoo:
  url: "http://localhost:8069"
  db: "odoo"
  user: "admin"
  pass_env: "ODOO_ADMIN_PASS"
naming:
  identity_prefix: "MT-"
  identity_format: "{prefix}{sector}-{ip_last_octet}"
```

#### 7.6.2 preloader.py (esqueleto)
```python
import os
import ipaddress
import socket
import yaml
from xmlrpc import client as xmlrpc_client
from librouteros import connect
from librouteros.exceptions import LibRouterosError

def load_config(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def scan_subnet_for_api(subnet: str, port: int, timeout: float = 0.5):
    net = ipaddress.ip_network(subnet, strict=False)
    for ip in net.hosts():
        ip_str = str(ip)
        s = socket.socket()
        s.settimeout(timeout)
        try:
            s.connect((ip_str, port))
            yield ip_str
        except Exception:
            pass
        finally:
            s.close()

def routeros_onboard(ip: str, cfg: dict):
    api_port = cfg["routeros"]["api_port"]
    boot_user = cfg["bootstrap"]["user"]
    boot_pass = cfg["bootstrap"]["pass"]

    mgmt_user = cfg["routeros"]["mgmt_user"]
    mgmt_pass = os.environ[cfg["routeros"]["mgmt_pass_env"]]
    allowed_ips = cfg["routeros"]["allowed_mgmt_ips"]

    # 1) connect bootstrap
    api = connect(host=ip, username=boot_user, password=boot_pass, port=api_port)

    # 2) identity
    identity_prefix = cfg["naming"]["identity_prefix"]
    sector = cfg["sector_code"]
    last_octet = ip.split(".")[-1]
    identity = cfg["naming"]["identity_format"].format(
        prefix=identity_prefix, sector=sector, ip_last_octet=last_octet
    )
    api("/system/identity/set", name=identity)

    # 3) ensure mgmt user
    # Create group with limited permissions (example; ajusta al mínimo real)
    # RouterOS groups/permissions varían por versión; mantén esto como plantilla controlada.
    try:
        api("/user/group/add", name="odoo_noc_group", policy="read,write,api,!local,!telnet,!ssh,!ftp,!reboot,!policy,!password,!sniff,!sensitive")
    except LibRouterosError:
        pass  # ya existe

    try:
        api("/user/add", name=mgmt_user, password=mgmt_pass, group="odoo_noc_group")
    except LibRouterosError:
        # si existe, actualiza password
        api("/user/set", **{"numbers": mgmt_user, "password": mgmt_pass, "group": "odoo_noc_group"})

    # 4) firewall allowlist para API (ejemplo básico)
    # Asegura permitir API solo desde allowed_ips
    for allow_ip in allowed_ips:
        try:
            api("/ip/firewall/filter/add", chain="input", src_address=allow_ip, protocol="tcp", dst_port=str(api_port), action="accept", comment="ALLOW ODOO/NOC API")
        except LibRouterosError:
            pass

    # Drop API from others (colócalo debajo de accept rules; usa comment para idempotencia)
    try:
        api("/ip/firewall/filter/add", chain="input", protocol="tcp", dst_port=str(api_port), action="drop", comment="DROP API OTHERS")
    except LibRouterosError:
        pass

    # 5) opcional: NTP, DNS, timezone
    # api("/system/ntp/client/set", enabled="yes", primary_ntp="...", secondary_ntp="...")

    return {"identity": identity, "ip": ip, "api_port": api_port}

def odoo_register_device(cfg: dict, onboarded: dict):
    odoo_url = cfg["odoo"]["url"]
    db = cfg["odoo"]["db"]
    user = cfg["odoo"]["user"]
    pwd = os.environ[cfg["odoo"]["pass_env"]]

    common = xmlrpc_client.ServerProxy(f"{odoo_url}/xmlrpc/2/common")
    uid = common.authenticate(db, user, pwd, {})
    models = xmlrpc_client.ServerProxy(f"{odoo_url}/xmlrpc/2/object")

    # 1) find sector by code
    sector_ids = models.execute_kw(db, uid, pwd, "isp.sector", "search", [[("code", "=", cfg["sector_code"])]], {"limit": 1})
    if not sector_ids:
        raise RuntimeError(f"Sector not found: {cfg['sector_code']}")

    sector_id = sector_ids[0]

    # 2) create isp.device (mikrotik)
    device_id = models.execute_kw(db, uid, pwd, "isp.device", "create", [{
        "name": onboarded["identity"],
        "device_type": "mikrotik",
        "sector_id": sector_id,
        "mgmt_ip": onboarded["ip"],
        "mgmt_port": onboarded["api_port"],
        "status": "active",
    }])

    # 3) create isp.mikrotik.router
    router_id = models.execute_kw(db, uid, pwd, "isp.mikrotik.router", "create", [{
        "device_id": device_id,
        "auth_method": "api",
        # NO guardar password aquí si tu estrategia es system parameters.
        # En su lugar, guarda referencia a un secreto o usa ir.config_parameter cifrado.
    }])

    return {"device_id": device_id, "router_id": router_id}

def main():
    cfg = load_config("config.yaml")
    api_port = cfg["routeros"]["api_port"]

    candidates = list(scan_subnet_for_api(cfg["mgmt_subnet"], api_port))
    print(f"Found candidates: {candidates}")

    for ip in candidates:
        try:
            onboarded = routeros_onboard(ip, cfg)
            created = odoo_register_device(cfg, onboarded)
            print(f"Onboarded {ip}: {onboarded['identity']} => Odoo {created}")
        except Exception as e:
            print(f"Failed {ip}: {e}")

if __name__ == "__main__":
    main()
```

### 7.7 Idempotencia (clave)
- El preloader debe ser “safe to run multiple times”:
  - si existe usuario/grupo/reglas, actualizar en vez de duplicar
  - usar `comment` único para reglas firewall y buscar antes de crear

---

## 8) Plan mínimo de implementación (para Codex sin inventar)
1. Implementar `isp.sector` + menú “Sectors”
2. Implementar `isp.device` con constraint: mikrotik requiere sector
3. Implementar `isp.mikrotik.router` + healthcheck
4. Implementar `isp.service_plan` y `isp.subscription`
5. Implementar `isp.provisioning_job` + worker (cron) + auditoría
6. Implementar ONU + asignación
7. Implementar PPPoE + queue como primer provisioning real (CU-11 + CU-13 + CU-14)
8. Implementar billing recurrente + suspensión/reconexión por mora
9. Implementar Selenium suite mínima (login + crear sector + crear mikrotik + crear plan + contrato + activar)

---

## 9) Checklist de “No se acepta” (calidad)
- Acciones críticas sin auditoría
- Credenciales en texto plano commiteadas
- Provisioning sin idempotencia
- No hay tests mínimos (unit + selenium smoke)
- MikroTik sin sector/ubicación

---
Fin del documento.
