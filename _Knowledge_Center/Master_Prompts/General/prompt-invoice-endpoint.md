# Prompt: Modificación de Endpoint de Facturas — Odoo 15 + Angular

> **Dirigido a:** ChatGPT / Codex  
> **Proyecto:** Módulo de contabilidad Odoo 15 con frontend Angular  
> **Ambientes SSH:** `contabilidad` (producción) · `contabilidadtest` (test)  
> **Objetivo:** Extender el endpoint de carga de facturas para soportar CREATE y UPDATE, con pruebas funcionales, monitoreo de logs y documentación de integración para el equipo mobile.

---

## 🧠 ROL

Eres un **senior backend developer, QA engineer y technical writer** con experiencia profunda en:
- Odoo 15 (Python, ORM, controladores HTTP JSON-RPC)
- Angular (HttpClient, servicios, modelos TypeScript)
- Administración de servidores Linux con acceso por SSH
- Redacción de documentación técnica de APIs para equipos de integración mobile

---

## ⚠️ PASO OBLIGATORIO ANTES DE ESCRIBIR CUALQUIER CÓDIGO

**No modifiques nada sin antes completar este análisis de contexto completo.**

### 1. Conectarse a `contabilidadtest` y mapear el proyecto

```bash
ssh contabilidadtest
```

Ejecuta los siguientes comandos para entender la estructura real antes de tocar nada:

```bash
# Localizar el módulo personalizado que contiene la ruta
find /odoo /opt/odoo /home/odoo -name "*.py" 2>/dev/null | xargs grep -l "invoicesList" 2>/dev/null

# Leer el archivo del controlador completo
cat <ruta_encontrada>

# Ver el manifiesto del módulo
cat <directorio_del_modulo>/__manifest__.py

# Verificar que el módulo está instalado
sudo -u odoo psql -d <nombre_db> -c \
  "SELECT name, state FROM ir_module_module WHERE name ILIKE '%exo%' OR name ILIKE '%invoice%';"

# Ver los modelos disponibles relacionados con facturas
sudo -u odoo psql -d <nombre_db> -c \
  "SELECT model, name FROM ir_model WHERE model = 'account.move';"
```

### 2. Localizar y leer el servicio Angular

```bash
# En el servidor o en el repositorio local
find . -name "*.service.ts" | xargs grep -l "invoicesList" 2>/dev/null
cat <ruta_del_servicio_angular>
```

Identifica y documenta:
- Nombre exacto del método que hace el POST
- Interfaz/modelo TypeScript del payload
- Cómo se construye `httpOptions` (headers, auth token, etc.)
- URL base `App.host` y cómo se configura por ambiente

### 3. Revisar el estado actual de los logs (baseline)

```bash
# Últimos 100 errores ANTES de cualquier cambio
sudo tail -n 200 /var/log/odoo/odoo.log | grep -E "ERROR|WARNING" | tail -50

# Verificar que la ruta actual responde correctamente
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "http://localhost:8069/exo/load/invoicesList/TEST_RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{"params": {"load_ids": [], "exo_invoice_list_id": 1, "sequence_number": "TEST"}}'
```

### 4. Registrar el estado de producción para comparar después

```bash
ssh contabilidad
cat <ruta_controlador_produccion> | md5sum   # guardar este hash para comparar al final
```

> ✅ **Solo cuando los pasos 1–4 estén completos, avanza al desarrollo.**

---

## 📋 CONTEXTO — CÓDIGO EXISTENTE

### Angular — Llamada actual al endpoint

```typescript
const url = `${App.host}/exo/load/invoicesList/${info.RNC_no}/odoo-accounting`;

try {
  return this.httpClient
    .post(
      url,
      {
        params: {
          load_ids: listID,
          exo_invoice_list_id: info.idList,
          sequence_number: info.sequenceNumber,
        },
      },
      this.httpOptions
    );
} catch (error) {
  // manejo de error existente
}
```

### Odoo — Ruta a modificar

```
POST /exo/load/invoicesList/<rnc_no>/odoo-accounting
type: json
auth: user
```

---

## 🛠️ REQUERIMIENTOS — QUÉ CONSTRUIR

### 1. CAMBIOS EN ANGULAR (Frontend)

Modifica el método del servicio para soportar dos operaciones:

#### Firma del método actualizado

```typescript
loadInvoicesList(
  info: InvoiceInfo,
  listID: number[],
  invoice_id?: number   // NUEVO: opcional para UPDATE
): Observable<InvoiceResponse>
```

#### Lógica de operación

```typescript
const operation = invoice_id ? 'update' : 'create';

const url = `${App.host}/exo/load/invoicesList/${info.RNC_no}/odoo-accounting`;

return this.httpClient.post<InvoiceResponse>(
  url,
  {
    params: {
      load_ids: listID,
      exo_invoice_list_id: info.idList,
      sequence_number: info.sequenceNumber,
      operation: operation,          // NUEVO: 'create' | 'update'
      invoice_id: invoice_id ?? null, // NUEVO: null en create, entero en update
    },
  },
  this.httpOptions
);
```

#### Modelo de respuesta TypeScript (nuevo)

```typescript
export interface InvoiceResponse {
  success: boolean;
  invoice_id?: number;   // presente en CREATE y UPDATE exitosos
  error?: string;        // presente en respuestas de error
}
```

#### Reglas de uso del `invoice_id` devuelto

- En **CREATE**: capturar y persistir el `invoice_id` devuelto (localStorage, store, o estado del componente según la arquitectura del proyecto)
- En **UPDATE**: usar el `invoice_id` previamente almacenado como parámetro de entrada
- **Nunca** llamar UPDATE sin un `invoice_id` válido — validar antes de hacer la llamada

---

### 2. CAMBIOS EN EL CONTROLADOR ODOO 15 (Backend)

#### Ruta principal

```python
@http.route(
    '/exo/load/invoicesList/<string:rnc_no>/odoo-accounting',
    type='json',
    auth='user',
    methods=['POST'],
    csrf=False,
)
def load_invoices_list(self, rnc_no, **kwargs):
    _logger = logging.getLogger(__name__)
    params = request.jsonrequest.get('params', {})

    operation     = params.get('operation', 'create')
    invoice_id    = params.get('invoice_id')
    load_ids      = params.get('load_ids', [])
    list_id       = params.get('exo_invoice_list_id')
    seq_number    = params.get('sequence_number')

    try:
        if operation == 'update':
            return self._update_invoice(
                rnc_no, invoice_id, load_ids, list_id, seq_number
            )
        else:
            return self._create_invoice(
                rnc_no, load_ids, list_id, seq_number
            )
    except Exception as e:
        _logger.exception("Error inesperado en load_invoices_list: %s", str(e))
        return {'success': False, 'error': 'Internal server error'}
```

#### Método CREATE

```python
def _create_invoice(self, rnc_no, load_ids, list_id, seq_number):
    _logger = logging.getLogger(__name__)

    # Buscar partner por RNC
    partner = request.env['res.partner'].search(
        [('vat', '=', rnc_no)], limit=1
    )
    if not partner:
        return {'success': False, 'error': f'Partner con RNC {rnc_no} no encontrado'}

    # Construir valores de la factura — adaptar campos según el modelo real del proyecto
    invoice_vals = {
        'move_type': 'out_invoice',
        'partner_id': partner.id,
        'ref': seq_number,
        # Agregar aquí los demás campos requeridos por el módulo
    }

    new_invoice = request.env['account.move'].create(invoice_vals)

    _logger.info("Factura creada: id=%s, partner=%s", new_invoice.id, rnc_no)
    return {'success': True, 'invoice_id': new_invoice.id}
```

#### Método UPDATE

```python
def _update_invoice(self, rnc_no, invoice_id, load_ids, list_id, seq_number):
    _logger = logging.getLogger(__name__)

    if not invoice_id:
        return {'success': False, 'error': 'invoice_id es requerido para actualizar'}

    invoice = request.env['account.move'].browse(int(invoice_id))

    # Validar existencia
    if not invoice.exists():
        return {'success': False, 'error': 'Factura no encontrada'}

    # Validar que la factura pertenece al RNC recibido
    if invoice.partner_id.vat != rnc_no:
        return {
            'success': False,
            'error': 'La factura no corresponde al RNC indicado'
        }

    # Si está en estado "posted", volver a borrador antes de editar
    if invoice.state == 'posted':
        invoice.button_draft()
        _logger.info("Factura id=%s regresada a draft para edición", invoice_id)

    # Aplicar cambios — adaptar campos según modelo real
    update_vals = {
        'ref': seq_number,
        # Agregar aquí los demás campos a actualizar
    }
    invoice.write(update_vals)

    _logger.info("Factura actualizada: id=%s, partner=%s", invoice_id, rnc_no)
    return {'success': True, 'invoice_id': invoice.id}
```

#### Restricciones de compatibilidad con Odoo 15

| ❌ NO usar | ✅ Usar en su lugar |
|-----------|---------------------|
| `account.invoice` | `account.move` |
| Campo `number` | Campo `name` |
| `account.invoice.line` | `account.move.line` |
| `sudo()` sin justificación | Permisos correctos con `auth='user'` |
| `invoice_id` como campo de FK | `move_id` en líneas |

- Respetar la máquina de estados: `draft → posted`; usar `button_draft()` para revertir
- Usar `with_context(...)` si se requiere contexto de moneda o posición fiscal
- Registrar siempre con `_logger.info(...)` y `_logger.exception(...)` para trazabilidad

---

## 🚀 PROCEDIMIENTO DE DESPLIEGUE POR SSH

### FASE 1 — Despliegue en `contabilidadtest` ÚNICAMENTE

```bash
ssh contabilidadtest

# 1. Hacer backup del controlador actual
BACKUP_NAME="controller_$(date +%Y%m%d_%H%M%S).py.bak"
cp /ruta/al/controlador/controllers.py /ruta/al/controlador/$BACKUP_NAME
echo "Backup creado: $BACKUP_NAME"

# 2. Transferir el archivo modificado
# Opción A — desde máquina local:
# scp controllers.py contabilidadtest:/ruta/al/controlador/controllers.py

# Opción B — editar directamente:
# nano /ruta/al/controlador/controllers.py

# 3. Verificar sintaxis Python antes de reiniciar
python3 -m py_compile /ruta/al/controlador/controllers.py && echo "✅ Sintaxis OK" || echo "❌ Error de sintaxis"

# 4. Reiniciar el servicio Odoo
sudo systemctl restart odoo
sleep 5

# 5. Verificar que el servicio arrancó correctamente
sudo systemctl status odoo | grep -E "Active|Main PID|Error"

# 6. Confirmar que la ruta responde
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8069/exo/load/invoicesList/TEST/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{"params": {"operation": "create", "invoice_id": null}}'
```

### FASE 2 — Despliegue Angular en `contabilidadtest`

```bash
# En máquina local — build para test
ng build --configuration=test

# Transferir dist al servidor
scp -r dist/nombre-app/* contabilidadtest:/var/www/html/app/

# Verificar en test
ssh contabilidadtest
ls -la /var/www/html/app/
```

### FASE 3 — Producción (`contabilidad`) — SOLO DESPUÉS DE QUE TEST PASE AL 100%

```bash
ssh contabilidad

# Backup
cp /ruta/controlador/controllers.py /ruta/controlador/controllers_$(date +%Y%m%d_%H%M%S).bak

# Transferir desde local o desde contabilidadtest
scp contabilidadtest:/ruta/al/controlador/controllers.py /ruta/controlador/controllers.py

# Verificar sintaxis
python3 -m py_compile /ruta/controlador/controllers.py && echo "✅ OK"

# Reiniciar
sudo systemctl restart odoo
sleep 5
sudo systemctl status odoo

# Monitorear 10 minutos post-deploy
sudo tail -f /var/log/odoo/odoo.log | grep -E "ERROR|WARNING|exo|invoice"
```

---

## 🧪 PRUEBAS FUNCIONALES — EJECUTAR EN `contabilidadtest`

> Ejecutar en el orden indicado. Cada prueba debe pasar antes de continuar con la siguiente.

### Variables reutilizables para los tests

```bash
BASE_URL="http://localhost:8069"
RNC="123456789"          # RNC de un partner real en la DB de test
HEADERS='-H "Content-Type: application/json"'
CREATED_INVOICE_ID=""    # Se llena después de T01
```

---

### T01 — CREATE: Flujo feliz

```bash
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "load_ids": [1, 2],
      "exo_invoice_list_id": 1,
      "sequence_number": "TEST-001",
      "operation": "create",
      "invoice_id": null
    }
  }'
```

**Resultado esperado:**
```json
{ "success": true, "invoice_id": <entero_positivo> }
```

**Verificación adicional:**
```bash
# Confirmar en DB que el registro existe
sudo -u odoo psql -d <db> -c \
  "SELECT id, name, state, partner_id FROM account_move WHERE id = <invoice_id_recibido>;"
```

**✅ PASS si:** `success: true`, `invoice_id` es un entero válido, el registro existe en DB.

---

### T02 — CREATE: IDs únicos sin colisión

```bash
# Crear segunda factura
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "load_ids": [3, 4],
      "exo_invoice_list_id": 2,
      "sequence_number": "TEST-002",
      "operation": "create",
      "invoice_id": null
    }
  }'
```

**✅ PASS si:** El `invoice_id` devuelto es distinto al de T01.

---

### T03 — UPDATE: Factura en estado `draft`

```bash
# Usar el invoice_id obtenido en T01
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "load_ids": [1, 2],
      "exo_invoice_list_id": 1,
      "sequence_number": "TEST-001-MOD",
      "operation": "update",
      "invoice_id": <ID_DE_T01>
    }
  }'
```

**Verificación:**
```bash
sudo -u odoo psql -d <db> -c \
  "SELECT ref FROM account_move WHERE id = <ID_DE_T01>;"
# Debe mostrar "TEST-001-MOD"
```

**✅ PASS si:** `success: true`, el campo actualizado refleja el nuevo valor en DB.

---

### T04 — UPDATE: Factura en estado `posted`

```bash
# Postear la factura manualmente
sudo -u odoo python3 -c "
import odoo
odoo.tools.config.parse_config([])
with odoo.api.Environment.manage():
    env = odoo.api.Environment(odoo.registry('<db>').cursor(), 1, {})
    inv = env['account.move'].browse(<ID_DE_T01>)
    inv.action_post()
    env.cr.commit()
    print('Estado:', inv.state)
"

# Luego intentar actualizar vía endpoint
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "load_ids": [1, 2],
      "exo_invoice_list_id": 1,
      "sequence_number": "TEST-001-POSTED-MOD",
      "operation": "update",
      "invoice_id": <ID_DE_T01>
    }
  }'
```

**✅ PASS si:** El endpoint llama `button_draft()` automáticamente, aplica el cambio y devuelve `success: true`.

---

### T05 — UPDATE: ID de factura inexistente

```bash
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "operation": "update",
      "invoice_id": 999999999,
      "sequence_number": "NO-EXISTE"
    }
  }'
```

**✅ PASS si:** `{ "success": false, "error": "Factura no encontrada" }` — sin excepción en logs.

---

### T06 — UPDATE: RNC no coincide con la factura

```bash
curl -s -X POST "$BASE_URL/exo/load/invoicesList/RNC_INCORRECTO/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "operation": "update",
      "invoice_id": <ID_DE_T01>,
      "sequence_number": "MISMATCH"
    }
  }'
```

**✅ PASS si:** `{ "success": false, "error": "La factura no corresponde al RNC indicado" }`

---

### T07 — CREATE: Campos requeridos faltantes

```bash
curl -s -X POST "$BASE_URL/exo/load/invoicesList/$RNC/odoo-accounting" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "operation": "create"
    }
  }'
```

**✅ PASS si:** Respuesta de error controlada (no un `500 Internal Server Error` crudo de Odoo).

---

### Tabla resumen de pruebas — completar antes de pasar a producción

| ID | Descripción | Resultado esperado | ¿Pasó? | Notas |
|----|-------------|-------------------|--------|-------|
| T01 | CREATE happy path | `success: true` + `invoice_id` entero | ☐ | |
| T02 | IDs únicos sin colisión | IDs distintos en dos creates | ☐ | |
| T03 | UPDATE en estado draft | Campo actualizado en DB | ☐ | |
| T04 | UPDATE en estado posted | Auto-draft + actualización exitosa | ☐ | |
| T05 | UPDATE ID inexistente | Error controlado 404 | ☐ | |
| T06 | UPDATE RNC incorrecto | Error controlado 400 | ☐ | |
| T07 | CREATE sin campos | Error controlado, no crash | ☐ | |

> **Criterio de paso a producción:** Los 7 tests deben mostrar ✅

---

## 📡 MONITOREO DE LOGS — PERÍODO DE OBSERVACIÓN OBLIGATORIO

Después del despliegue en `contabilidadtest`, monitorear durante **mínimo 15 minutos** con 3 terminales en paralelo:

### Terminal 1 — Logs de Odoo en tiempo real

```bash
ssh contabilidadtest
sudo tail -f /var/log/odoo/odoo.log \
  | grep --line-buffered -E "ERROR|WARNING|exo|account\.move|invoicesList"
```

### Terminal 2 — Tracebacks del sistema

```bash
ssh contabilidadtest
sudo journalctl -u odoo -f --since "1 minute ago" \
  | grep --line-buffered -E "Traceback|Exception|Error"
```

### Terminal 3 — Estado de facturas en DB

```bash
ssh contabilidadtest
# Ejecutar cada 2 minutos durante las pruebas
watch -n 120 "sudo -u odoo psql -d <db> -c \
  \"SELECT id, name, state, write_date FROM account_move ORDER BY write_date DESC LIMIT 5;\""
```

### Criterios de aprobación del monitoreo

- [ ] **Cero líneas `ERROR`** relacionadas con `exo`, `invoicesList`, o `account.move`
- [ ] **Cero tracebacks** de Python sin manejar durante el período de observación
- [ ] **Cero registros corruptos** o con `state` inesperado en la DB
- [ ] El servicio Odoo se mantiene **activo y estable** sin reinicios automáticos
- [ ] Los `invoice_id` generados son **únicos y secuenciales** como se espera en Odoo

> ⛔ Si algún criterio falla → **DETENER**, diagnosticar, corregir, redesplegar en test y reiniciar el período de monitoreo.

---

## 📄 DOCUMENTO DE INTEGRACIÓN — PARA EL EQUIPO MOBILE

> Generar este documento una vez que todos los tests pasen y el monitoreo sea limpio.  
> Formato: Markdown listo para exportar a PDF o Notion.

---

### Integration Guide: Invoice Endpoint v2.0

**Versión:** 2.0  
**Fecha:** `<fecha de entrega>`  
**Autor:** `<nombre del desarrollador>`  
**Estado:** Listo para integración  

---

#### 1. Resumen del Cambio

El endpoint de facturas fue extendido para soportar dos operaciones desde una única URL:

- **CREATE** — crea una nueva factura en Odoo y devuelve su ID único
- **UPDATE** — actualiza una factura existente usando su ID único

El `invoice_id` devuelto en CREATE debe ser persistido por el cliente mobile y reutilizado en llamadas de UPDATE.

---

#### 2. Ambientes

| Ambiente | URL Base | Uso |
|----------|----------|-----|
| Test | `https://contabilidadtest.getupsoft.com.do` | QA y desarrollo |
| Producción | `https://contabilidad.getupsoft.com.do` | Usuarios finales |

---

#### 3. Autenticación

- Tipo: `Session Cookie` (Odoo session) o `Bearer Token` según configuración del módulo
- Header requerido: `Content-Type: application/json`
- Si se usa token: `Authorization: Bearer <token>`

> Contactar al equipo backend para obtener credenciales de prueba.

---

#### 4. Endpoint

```
POST /exo/load/invoicesList/{rnc_no}/odoo-accounting
```

| Parámetro URL | Tipo | Descripción |
|---------------|------|-------------|
| `rnc_no` | string | RNC del contribuyente (identificador fiscal dominicano) |

---

#### 5. Payload — Operación CREATE

```json
{
  "params": {
    "load_ids": [1, 2, 3],
    "exo_invoice_list_id": 10,
    "sequence_number": "A-001",
    "operation": "create",
    "invoice_id": null
  }
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `load_ids` | `number[]` | ✅ | IDs de registros a cargar |
| `exo_invoice_list_id` | `number` | ✅ | ID de la lista EXO |
| `sequence_number` | `string` | ✅ | Número de secuencia de la factura |
| `operation` | `string` | ✅ | Debe ser `"create"` |
| `invoice_id` | `null` | ✅ | Debe ser `null` en CREATE |

---

#### 6. Payload — Operación UPDATE

```json
{
  "params": {
    "load_ids": [1, 2, 3],
    "exo_invoice_list_id": 10,
    "sequence_number": "A-001-REV",
    "operation": "update",
    "invoice_id": 452
  }
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `load_ids` | `number[]` | ✅ | IDs de registros a actualizar |
| `exo_invoice_list_id` | `number` | ✅ | ID de la lista EXO |
| `sequence_number` | `string` | ✅ | Nuevo número de secuencia |
| `operation` | `string` | ✅ | Debe ser `"update"` |
| `invoice_id` | `number` | ✅ | ID único de la factura a actualizar |

---

#### 7. Respuestas del Servidor

| Escenario | HTTP | Cuerpo |
|-----------|------|--------|
| CREATE exitoso | 200 | `{ "success": true, "invoice_id": 452 }` |
| UPDATE exitoso | 200 | `{ "success": true, "invoice_id": 452 }` |
| Factura no encontrada | 200* | `{ "success": false, "error": "Factura no encontrada" }` |
| RNC no coincide | 200* | `{ "success": false, "error": "La factura no corresponde al RNC indicado" }` |
| invoice_id faltante | 200* | `{ "success": false, "error": "invoice_id es requerido para actualizar" }` |
| Error de servidor | 500 | Envelope de error estándar de Odoo |

> *Odoo JSON-RPC siempre devuelve HTTP 200; los errores de negocio se indican con `"success": false` en el cuerpo.

---

#### 8. Flujo de Integración Mobile — Crear y Actualizar una Factura

```
┌─────────────────────────────────────────────────────┐
│                   FLUJO CREATE                       │
│                                                      │
│  1. App recopila datos de la factura                 │
│  2. Llama POST con operation="create", invoice_id=null│
│  3. Recibe { success: true, invoice_id: 452 }        │
│  4. ✅ Persistir invoice_id=452 localmente           │
│     (AsyncStorage / SQLite / Redux store)            │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   FLUJO UPDATE                       │
│                                                      │
│  1. App recupera invoice_id=452 del storage local    │
│  2. Llama POST con operation="update", invoice_id=452│
│  3. Recibe { success: true, invoice_id: 452 }        │
│  4. ✅ Factura actualizada correctamente             │
└─────────────────────────────────────────────────────┘
```

---

#### 9. Manejo de Errores Recomendado (Mobile)

```javascript
// Ejemplo en React Native / TypeScript
async function saveInvoice(data: InvoiceData, invoiceId?: number) {
  try {
    const response = await api.post(`/exo/load/invoicesList/${data.rnc}/odoo-accounting`, {
      params: {
        ...data,
        operation: invoiceId ? 'update' : 'create',
        invoice_id: invoiceId ?? null,
      }
    });

    if (!response.data.success) {
      // Error de negocio — mostrar mensaje al usuario
      showAlert('Error', response.data.error ?? 'Error desconocido');
      return null;
    }

    // Persistir el invoice_id para futuras actualizaciones
    await AsyncStorage.setItem(`invoice_${data.rnc}`, String(response.data.invoice_id));
    return response.data.invoice_id;

  } catch (networkError) {
    // Error de red — reintentar con backoff exponencial
    showAlert('Error de conexión', 'Verificar conexión a internet e intentar de nuevo.');
    return null;
  }
}
```

**Política de reintentos recomendada:**
- En errores `5xx`: reintentar hasta 3 veces con espera de 2s, 4s, 8s
- En `success: false`: NO reintentar — es un error de negocio que requiere corrección del payload
- En error de red: reintentar cuando se restaure la conectividad

---

#### 10. Datos de Prueba

| Campo | Valor de prueba |
|-------|----------------|
| Ambiente test | `https://contabilidadtest.getupsoft.com.do` |
| RNC válido en test | Solicitar al equipo backend |
| `exo_invoice_list_id` de prueba | Solicitar al equipo backend |
| Contacto para acceso | `<nombre y correo del responsable>` |

---

#### 11. Changelog

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | — | — | Endpoint original (solo CREATE implícito, sin retorno de ID) |
| 2.0 | `<fecha>` | `<autor>` | Soporte explícito para CREATE y UPDATE; retorno de `invoice_id`; compatibilidad Odoo 15 |

---

## ✅ CHECKLIST FINAL ANTES DE ENTREGAR

### Desarrollo
- [ ] Contexto completo del proyecto revisado por SSH antes de codificar
- [ ] Controlador Python modificado con soporte CREATE y UPDATE
- [ ] Servicio Angular actualizado con parámetro `invoice_id?` opcional
- [ ] Interfaz `InvoiceResponse` TypeScript creada
- [ ] Sintaxis Python verificada con `py_compile` antes de cada deploy

### Pruebas
- [ ] Los 7 tests (T01–T07) ejecutados en `contabilidadtest`
- [ ] Tabla resumen de pruebas completada con resultados reales
- [ ] Período de monitoreo de 15 min completado sin errores
- [ ] Ningún registro corrompido en la DB de test

### Despliegue
- [ ] Backup del controlador creado antes de cada deploy (test y prod)
- [ ] Despliegue en `contabilidadtest` validado completamente
- [ ] Despliegue en `contabilidad` (producción) realizado SOLO después de test OK
- [ ] Monitoreo post-deploy de 10 min en producción realizado

### Documentación
- [ ] Documento de integración generado con todas las secciones
- [ ] Tabla de changelog completada con fecha y autor real
- [ ] Datos de prueba para el equipo mobile incluidos o enlazados
- [ ] Documento entregado al equipo mobile en formato acordado (MD / PDF / Notion)
```
