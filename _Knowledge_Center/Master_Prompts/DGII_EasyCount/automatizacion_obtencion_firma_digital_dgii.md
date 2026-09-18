# Automatización del proceso para obtener y activar la firma digital válida ante DGII
**Versión:** 1.0  
**Fecha:** 2026-03-26  
**Objetivo:** automatizar todo lo automatizable del proceso de adquisición, validación, resguardo y activación del certificado digital para procesos tributarios exigido por la DGII, dejando explícitas las tareas que siguen siendo humanas o legales.

---

## 1) Alcance real: qué sí y qué no se puede automatizar

### No se puede automatizar al 100%
La **emisión** del certificado digital no puede cerrarse totalmente por código porque normalmente involucra:
- selección de una **PSC / entidad autorizada**;
- validación de identidad y/o representación;
- aceptación contractual;
- pago;
- emisión por tercero autorizado;
- entrega del certificado al titular/delegado autorizado.

### Sí se puede automatizar
1. **Prevalidación interna** del contribuyente y del delegado.  
2. **Recolección estructurada** de datos y documentos requeridos.  
3. **Comparación de opciones** de PSC.  
4. **Creación del expediente** para compra/solicitud.  
5. **Seguimiento de estados** del trámite.  
6. **Alertas y recordatorios** de tareas humanas pendientes.  
7. **Recepción controlada** del `.p12/.pfx`.  
8. **Validación técnica automática** del certificado recibido.  
9. **Carga segura** en secret manager / vault.  
10. **Pruebas automáticas** de firmado e integración.  
11. **Monitoreo de expiración** y renovación.

---

## 2) Base regulatoria y operativa que este flujo asume

Este plan asume que:
- la DGII exige un **certificado digital para procesos tributarios** emitido por una **prestadora de servicios de confianza autorizada por INDOTEL** y que corresponda a la persona delegada del contribuyente;
- la solicitud para ser Emisor Electrónico se realiza por **Oficina Virtual** y, si es aprobada, la DGII remite una URL al **Portal de Certificación** para autenticación y pruebas;
- la ventana de certificados gratuitos de la DGII para el Facturador Gratuito ya no aplica al flujo general porque estaba limitada y temporal.

---

## 3) Objetivo del workflow automatizado

Construir un flujo limpio que logre esto:

```text
Validar empresa/delegado
  -> reunir documentos y metadatos
  -> crear expediente de compra/solicitud
  -> registrar estado por PSC
  -> recordar tareas humanas
  -> recibir certificado emitido
  -> validar .p12/.pfx automáticamente
  -> cargarlo a vault/secret manager
  -> ejecutar smoke tests de firmado
  -> marcar integración lista para DGII
```

---

## 4) Arquitectura operativa recomendada

### Componentes
1. **Formulario de intake**  
   Recoge datos del contribuyente, delegado y preferencia de PSC.

2. **Motor de workflow**
   Puede ser implementado con:
   - n8n,
   - Zapier,
   - Make,
   - Temporal,
   - GitHub Actions + scripts,
   - o backend propio con cola/jobs.

3. **Store de estados**
   Base de datos con estas entidades:
   - `contributors`
   - `delegates`
   - `psc_requests`
   - `certificate_artifacts`
   - `workflow_events`
   - `reminders`
   - `certificate_validations`

4. **Validador de certificado**
   Script/servicio que inspecciona `.p12/.pfx`:
   - existencia;
   - password;
   - clave privada;
   - subject;
   - serial;
   - vigencia;
   - huella;
   - correspondencia con RNC/delegado esperado.

5. **Secret Manager / Vault**
   Para almacenar:
   - certificado;
   - contraseña;
   - metadata;
   - fecha de expiración;
   - alias;
   - hash.

6. **Módulo de integración DGII**
   El certificado validado se conecta luego al flujo de:
   - firmado XML;
   - firma de semilla;
   - autenticación;
   - envío;
   - consulta de `TrackId`.

---

## 5) Datos de entrada obligatorios

### 5.1 Datos del contribuyente
- RNC
- razón social
- tipo de contribuyente
- correo principal
- teléfono
- estado de alta NCF
- estado como postulante / emisor electrónico
- acceso a Oficina Virtual

### 5.2 Datos del delegado / representante
- nombre completo
- cédula / identificación
- correo
- teléfono
- cargo
- evidencia de representación o delegación
- confirmación de que será la persona asociada al certificado

### 5.3 Datos operativos
- ambiente objetivo: test / certificación / producción
- stack técnico
- repositorio
- secret manager a usar
- persona responsable de TI
- persona responsable fiscal

### 5.4 Documentos
- constancia societaria o documento equivalente
- documentos del delegado
- autorización interna o poder si aplica
- evidencia de inscripción/condición tributaria si aplica
- comprobantes del trámite con la PSC

---

## 6) Estados del workflow

Usa esta máquina de estados:

```text
DRAFT
  -> INTAKE_COMPLETED
  -> PRECHECK_FAILED
  -> PRECHECK_OK
  -> PSC_SELECTED
  -> HUMAN_SUBMISSION_PENDING
  -> HUMAN_SUBMISSION_DONE
  -> PSC_UNDER_REVIEW
  -> PSC_NEEDS_CORRECTION
  -> PSC_APPROVED
  -> CERTIFICATE_RECEIVED
  -> CERTIFICATE_VALIDATION_FAILED
  -> CERTIFICATE_VALIDATED
  -> SECRET_STORED
  -> SMOKE_TEST_FAILED
  -> READY_FOR_DGII
  -> IN_PRODUCTION_USE
  -> RENEWAL_PENDING
  -> RENEWED
```

---

## 7) Qué debe hacer cada agente

### 7.1 Codex
**Rol:** implementar automatización, scripts, validadores y persistencia.

Debe producir:
- modelos de datos;
- endpoints o comandos CLI;
- script de validación de `.p12/.pfx`;
- integración con secret manager;
- notificaciones;
- pruebas automáticas;
- documentación técnica.

### 7.2 Claude
**Rol:** revisar consistencia del flujo, cobertura de riesgos, criterios de aceptación y claridad operativa.

Debe producir:
- revisión de requisitos;
- validación de huecos del proceso;
- matriz de errores;
- checklist legal/operativo;
- refinamiento de prompts y runbooks.

### 7.3 Cursor
**Rol:** aplicar cambios directamente sobre el repositorio siguiendo el plan.

Debe producir:
- archivos concretos;
- refactors mínimos;
- tests;
- wiring de configuración;
- documentación dentro del repo.

---

## 8) Workflow limpio por fases

### Fase 0 — Preparación
#### Objetivo
Dejar listo el entorno de automatización.

#### Entregables
- tabla/colección de workflow;
- `.env.example`;
- esquema de configuración;
- directorio `docs/certificados/`;
- runbook de operadores.

#### Acciones
1. Crear entidad `psc_request`.
2. Crear entidad `certificate_validation`.
3. Crear entidad `workflow_event`.
4. Crear estados y transiciones.
5. Crear plantillas de correo y recordatorio.
6. Crear política de secretos.
7. Crear política de retención de artefactos.

### Fase 1 — Intake automatizado
#### Objetivo
Recolectar datos completos sin depender de cadenas de correos informales.

#### Campos mínimos del formulario
```json
{
  "rnc": "",
  "razon_social": "",
  "tipo_contribuyente": "",
  "delegado_nombre": "",
  "delegado_identificacion": "",
  "delegado_correo": "",
  "delegado_telefono": "",
  "delegado_cargo": "",
  "psc_preferida": "",
  "usa_facturador_gratuito": false,
  "ofv_habilitada": false,
  "alta_ncf_habilitada": false,
  "responsable_ti": "",
  "responsable_fiscal": ""
}
```

#### Automatizaciones
- validar campos obligatorios;
- normalizar RNC;
- normalizar correo y teléfono;
- rechazar intake incompleto;
- crear caso con `case_id`;
- emitir checklist faltante.

### Fase 2 — Precheck interno
#### Objetivo
No enviar a PSC ni a DGII un caso que ya viene roto.

#### Reglas automáticas
- `RNC` no vacío y con formato esperado;
- delegado identificado;
- correo del delegado presente;
- `ofv_habilitada == true`;
- `alta_ncf_habilitada == true` o marcar advertencia;
- PSC elegida dentro de catálogo autorizado interno;
- ambiente definido;
- responsable TI definido.

#### Resultado
- `PRECHECK_OK` o `PRECHECK_FAILED`.

#### Ejemplo de respuesta de precheck
```json
{
  "case_id": "PSC-2026-00017",
  "status": "PRECHECK_FAILED",
  "errors": [
    "Falta evidencia de delegación",
    "No se ha confirmado acceso a OFV",
    "No se ha definido PSC"
  ],
  "next_actions": [
    "Subir documento de delegación",
    "Confirmar acceso OFV",
    "Seleccionar PSC autorizada"
  ]
}
```

### Fase 3 — Selección de PSC y expediente
#### Objetivo
Generar el paquete listo para solicitud.

#### Catálogo inicial
Mantén un catálogo configurable:
```json
[
  { "code": "AVANSI", "name": "Avansi", "active": true },
  { "code": "CCPSD", "name": "Cámara de Comercio y Producción de Santo Domingo", "active": true },
  { "code": "NOVOSIT", "name": "Novosit", "active": true }
]
```

#### Tareas automáticas
- generar expediente ZIP o carpeta estructurada;
- generar hoja resumen del caso;
- generar lista de documentos pendientes;
- asignar responsable;
- programar recordatorios.

#### Estructura sugerida del expediente
```text
expedientes/
  PSC-2026-00017/
    01-resumen-caso.md
    02-datos-contribuyente.json
    03-datos-delegado.json
    04-checklist-documental.md
    05-evidencias/
    06-seguimiento/
    07-certificado/
```

### Fase 4 — Tarea humana obligatoria
#### Objetivo
Ejecutar la parte no automatizable del proceso.

#### Esta parte sigue siendo humana
- escoger PSC final;
- aceptar términos;
- pagar;
- pasar verificación de identidad;
- firmar documentos requeridos;
- recibir el certificado emitido.

#### Qué sí automatizar alrededor
- recordatorio de vencimiento de tarea;
- seguimiento por SLA;
- registro de evidencias;
- actualización de estado;
- alarmas por bloqueo del caso.

#### Plantilla de control
```json
{
  "case_id": "PSC-2026-00017",
  "current_status": "HUMAN_SUBMISSION_PENDING",
  "owner": "fiscal@empresa.com",
  "human_tasks": [
    "Completar solicitud con PSC",
    "Adjuntar documentos del delegado",
    "Realizar pago",
    "Confirmar emisión del certificado"
  ],
  "sla_hours": 72
}
```

### Fase 5 — Recepción del certificado
#### Objetivo
Ingerir el `.p12/.pfx` sin exponerlo ni degradarlo.

#### Reglas
- aceptar únicamente `.p12` o `.pfx`;
- tamaño máximo configurable;
- password obligatoria;
- carga solo por canal seguro;
- no enviar el certificado por chats no aprobados;
- registrar hash del archivo;
- guardar artefacto temporal en storage seguro.

#### Metadatos a registrar
- nombre original del archivo;
- hash SHA-256;
- timestamp de carga;
- operador que cargó;
- case_id;
- PSC;
- password recibida por canal seguro separado si la política lo exige.

### Fase 6 — Validación automática del certificado
#### Objetivo
Bloquear certificados defectuosos antes de llegar a la integración DGII.

#### Validaciones mínimas
1. el archivo abre;
2. la password funciona;
3. hay clave privada;
4. hay certificado X.509;
5. el certificado no está vencido;
6. el certificado ya está vigente;
7. se puede extraer subject;
8. se puede extraer serial;
9. el subject coincide con el delegado esperado;
10. el RNC esperado coincide con la política interna si aplica;
11. el certificado no fue cargado previamente por error;
12. se calcula fingerprint;
13. se registra fecha de expiración;
14. se clasifica ambiente/uso;
15. se emite veredicto `VALID` / `INVALID`.

#### Resultado
```json
{
  "case_id": "PSC-2026-00017",
  "validation_status": "VALID",
  "subject": "CN=Juan Perez, O=Empresa Demo SRL, ...",
  "serial_number": "12AB34CD56EF",
  "not_before": "2026-03-20T00:00:00Z",
  "not_after": "2027-03-20T23:59:59Z",
  "has_private_key": true,
  "fingerprint_sha256": "....",
  "warnings": []
}
```

---

## 9) Script de validación automática de `.p12/.pfx` (Python)

> Este script no emite el certificado; valida el certificado ya recibido y deja el caso listo para integración.

```python
from __future__ import annotations

import argparse
import hashlib
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from cryptography.hazmat.primitives.serialization.pkcs12 import load_key_and_certificates


@dataclass
class ValidationResult:
    file_exists: bool
    password_ok: bool
    has_private_key: bool
    subject: Optional[str]
    serial_number: Optional[str]
    not_before: Optional[str]
    not_after: Optional[str]
    is_expired: bool
    is_not_yet_valid: bool
    sha256: Optional[str]
    valid: bool
    error: Optional[str] = None


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_p12(path: Path, password: str) -> ValidationResult:
    if not path.exists():
        return ValidationResult(
            file_exists=False,
            password_ok=False,
            has_private_key=False,
            subject=None,
            serial_number=None,
            not_before=None,
            not_after=None,
            is_expired=False,
            is_not_yet_valid=False,
            sha256=None,
            valid=False,
            error="Archivo no existe"
        )

    try:
        raw = path.read_bytes()
        private_key, certificate, additional = load_key_and_certificates(
            raw,
            password.encode("utf-8")
        )
    except Exception as exc:
        return ValidationResult(
            file_exists=True,
            password_ok=False,
            has_private_key=False,
            subject=None,
            serial_number=None,
            not_before=None,
            not_after=None,
            is_expired=False,
            is_not_yet_valid=False,
            sha256=sha256_file(path),
            valid=False,
            error=f"No se pudo abrir el PKCS#12: {exc}"
        )

    now = datetime.now(timezone.utc)
    not_before = certificate.not_valid_before_utc
    not_after = certificate.not_valid_after_utc

    is_expired = now > not_after
    is_not_yet_valid = now < not_before

    subject = certificate.subject.rfc4514_string()
    serial_number = format(certificate.serial_number, "X")

    valid = (
        private_key is not None
        and certificate is not None
        and not is_expired
        and not is_not_yet_valid
    )

    return ValidationResult(
        file_exists=True,
        password_ok=True,
        has_private_key=private_key is not None,
        subject=subject,
        serial_number=serial_number,
        not_before=not_before.isoformat(),
        not_after=not_after.isoformat(),
        is_expired=is_expired,
        is_not_yet_valid=is_not_yet_valid,
        sha256=sha256_file(path),
        valid=valid,
        error=None,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    result = validate_p12(Path(args.file), args.password)
    print(result)


if __name__ == "__main__":
    main()
```

### Requerimientos del script
```bash
pip install cryptography
```

---

## 10) Ejemplo de persistencia de estados

### Esquema SQL mínimo
```sql
CREATE TABLE psc_requests (
  id UUID PRIMARY KEY,
  case_id VARCHAR(50) NOT NULL UNIQUE,
  rnc VARCHAR(20) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  delegado_nombre VARCHAR(255) NOT NULL,
  delegado_identificacion VARCHAR(50) NOT NULL,
  psc_code VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE workflow_events (
  id UUID PRIMARY KEY,
  case_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE certificate_validations (
  id UUID PRIMARY KEY,
  case_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  sha256 VARCHAR(64) NOT NULL,
  subject TEXT,
  serial_number VARCHAR(255),
  not_before TIMESTAMP,
  not_after TIMESTAMP,
  has_private_key BOOLEAN NOT NULL,
  password_ok BOOLEAN NOT NULL,
  valid BOOLEAN NOT NULL,
  error TEXT,
  created_at TIMESTAMP NOT NULL
);
```

---

## 11) Ejemplo de `.env.example`

```env
APP_ENV=development

PSC_WORKFLOW_DB_URL=postgres://user:pass@localhost:5432/psc_workflow
PSC_STORAGE_PATH=/secure/psc-artifacts

PSC_ALLOWED_CODES=AVANSI,CCPSD,NOVOSIT

CERT_MAX_UPLOAD_MB=10
CERT_EXPIRATION_ALERT_DAYS=30

SECRET_PROVIDER=vault
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=***MASKED***
VAULT_CERT_SECRET_PREFIX=certificates/dgii

NOTIFY_EMAIL_FROM=no-reply@empresa.com
NOTIFY_SLACK_WEBHOOK=***MASKED***

DGII_EXPECTED_RNC=131234567
DGII_EXPECTED_DELEGATE_NAME=Juan Perez
DGII_EXPECTED_CERT_USAGE=tributario
```

---

## 12) Ejemplo de secret payload recomendado

```json
{
  "certificate_base64": "<BASE64_P12>",
  "certificate_password": "<MASKED>",
  "subject": "CN=Juan Perez, O=Empresa Demo SRL",
  "serial_number": "12AB34CD56EF",
  "fingerprint_sha256": "....",
  "not_after": "2027-03-20T23:59:59Z",
  "psc": "AVANSI",
  "delegate_name": "Juan Perez",
  "rnc": "131234567"
}
```

---

## 13) Reglas de seguridad obligatorias

- no guardar `.p12/.pfx` en el repositorio;
- no mandar password por el mismo canal que el archivo si la política interna lo prohíbe;
- no loguear password;
- no loguear private key;
- no dejar certificados en carpetas temporales no cifradas;
- no permitir acceso frontend al material criptográfico;
- registrar huella SHA-256 del archivo;
- registrar quién cargó el certificado;
- habilitar alertas 30/15/7 días antes del vencimiento;
- versionar metadatos, no el secreto en sí;
- destruir temporales tras cargar a vault.

---

## 14) Checklist operativo completo

### Tramo A — Antes de pedir el certificado
- [ ] Confirmar RNC activo.
- [ ] Confirmar acceso a OFV.
- [ ] Confirmar alta NCF.
- [ ] Confirmar delegado autorizado.
- [ ] Confirmar responsable TI.
- [ ] Confirmar responsable fiscal.
- [ ] Seleccionar PSC.
- [ ] Crear expediente del caso.
- [ ] Completar intake.
- [ ] Ejecutar precheck.

### Tramo B — Solicitud / compra
- [ ] Completar formulario o proceso de la PSC.
- [ ] Adjuntar identidad y representación.
- [ ] Realizar pago si aplica.
- [ ] Registrar número de caso externo.
- [ ] Registrar fecha esperada de respuesta.
- [ ] Programar recordatorio.

### Tramo C — Recepción del certificado
- [ ] Recibir `.p12/.pfx`.
- [ ] Recibir password.
- [ ] Cargar archivo por canal seguro.
- [ ] Registrar hash.
- [ ] Ejecutar validación automática.
- [ ] Revisar vigencia.
- [ ] Revisar subject.
- [ ] Revisar serial.
- [ ] Confirmar clave privada.

### Tramo D — Activación técnica
- [ ] Cargar a vault.
- [ ] Actualizar metadata.
- [ ] Probar lectura desde vault.
- [ ] Ejecutar smoke test de firma local.
- [ ] Preparar integración DGII.
- [ ] Registrar caso como `READY_FOR_DGII`.

### Tramo E — Continuidad
- [ ] Alertas de expiración activas.
- [ ] Runbook de renovación listo.
- [ ] Validación de rotación documentada.
- [ ] Pruebas automáticas en CI activas.

---

## 15) Pruebas automáticas mínimas

### Unit tests
- archivo inexistente -> falla controlada;
- password incorrecta -> falla controlada;
- certificado sin clave privada -> inválido;
- certificado vencido -> inválido;
- certificado vigente -> válido.

### Integration tests
- carga desde storage seguro;
- carga desde vault;
- persistencia de validación;
- notificación por fallo;
- recordatorio por SLA vencido.

### Functional tests
- caso completo desde intake hasta `READY_FOR_DGII`;
- corrección de expediente incompleto;
- recarga de certificado corregido;
- alerta de expiración.

---

## 16) Casos de error que el workflow debe manejar

### Error: intake incompleto
**Detección:** faltan campos obligatorios  
**Respuesta:** bloquear creación del caso o marcar `PRECHECK_FAILED`

### Error: PSC no seleccionada
**Detección:** `psc_code` nulo  
**Respuesta:** impedir avance a expediente final

### Error: certificado corrupto
**Detección:** no abre PKCS#12  
**Respuesta:** marcar `CERTIFICATE_VALIDATION_FAILED`

### Error: password incorrecta
**Detección:** excepción al abrir PKCS#12  
**Respuesta:** pedir reingreso por canal seguro

### Error: certificado vencido
**Detección:** `now > not_after`  
**Respuesta:** bloquear activación técnica

### Error: subject inesperado
**Detección:** no coincide con delegado esperado  
**Respuesta:** revisión manual obligatoria

### Error: certificado duplicado
**Detección:** misma huella SHA-256 cargada dos veces  
**Respuesta:** bloquear duplicado y auditar

---

## 17) Workflow sugerido para n8n / Make / Zapier / backend propio

### Trigger 1 — Nuevo intake
- crear `case_id`
- guardar caso
- ejecutar precheck
- si falla -> notificar faltantes
- si pasa -> crear expediente

### Trigger 2 — Cambio de estado manual
- si pasa a `HUMAN_SUBMISSION_PENDING` -> enviar recordatorio al owner
- si pasan 72h sin cambio -> escalar
- si pasa a `PSC_APPROVED` -> solicitar carga segura del certificado

### Trigger 3 — Certificado cargado
- calcular hash
- validar `.p12/.pfx`
- persistir resultado
- si válido -> guardar en vault y marcar `CERTIFICATE_VALIDATED`
- si inválido -> notificar y bloquear

### Trigger 4 — Certificado validado
- ejecutar smoke test local
- si pasa -> marcar `READY_FOR_DGII`
- si falla -> abrir incidente técnico

---

## 18) Smoke test técnico recomendado después de recibir el certificado

### Objetivo
Demostrar que el certificado sí sirve para el flujo técnico.

### Pasos
1. leer el secreto desde vault;
2. abrir el `.p12`;
3. extraer certificado y clave;
4. firmar un XML de prueba;
5. verificar la firma localmente;
6. guardar evidencia del test.

### Criterio de aceptación
- el certificado abre correctamente;
- existe clave privada;
- la firma se genera;
- la verificación local pasa.

---

## 19) Prompt operativo para Codex / Claude / Cursor

```text
Implementa un workflow de automatización para la obtención y activación de certificado digital válido ante DGII.

Objetivo:
Automatizar intake, precheck, expediente, seguimiento, recepción segura del certificado, validación técnica del .p12/.pfx, almacenamiento en vault, smoke tests y alertas de expiración.

Restricciones:
- No automatizar la emisión legal del certificado ni intentar eludir PSC/validación humana.
- No guardar certificados ni passwords en el repo.
- No loguear secretos.
- Mantener trazabilidad por case_id.

Entregables obligatorios:
1. modelos de datos,
2. endpoints o CLI,
3. workflow states,
4. script validador de p12/pfx,
5. integración con secret manager,
6. notificaciones,
7. tests unitarios,
8. tests de integración,
9. tests funcionales,
10. documentación operativa.

Criterios de aceptación:
- caso pasa de intake a READY_FOR_DGII;
- certificados inválidos quedan bloqueados;
- certificados válidos quedan almacenados en vault;
- alertas de expiración funcionan;
- trazabilidad completa del workflow.
```

---

## 20) Qué sigue después de este workflow
Una vez el certificado esté en `READY_FOR_DGII`, el siguiente proyecto es:

1. firmar XML del e-CF;  
2. firmar semilla de autenticación DGII;  
3. obtener token;  
4. enviar e-CF;  
5. persistir `TrackId`;  
6. consultar estado;  
7. generar QR/código de seguridad;  
8. monitorear rechazos y reintentos.

---

## 21) Resultado esperado
Cuando este workflow esté implementado, tu organización tendrá:
- trazabilidad total del trámite del certificado;
- menos errores humanos;
- menor exposición de secretos;
- validación técnica temprana;
- activación más rápida del flujo DGII;
- base sólida para renovación futura.

---

## 22) Decisión ejecutiva
**Recomendación:** automatiza desde el intake hasta `READY_FOR_DGII`, y deja la emisión del certificado como una etapa humana auditada. Ese es el punto correcto entre cumplimiento, seguridad y velocidad.
