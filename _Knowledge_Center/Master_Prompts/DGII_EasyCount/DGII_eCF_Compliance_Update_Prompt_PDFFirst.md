
# 📦 Prompt de Actualización — Cumplimiento DGII e‑CF (PDF‑First, `docs/official/`) — Repo: `JoelStalin/dgii_encf`

**Objetivo:** Actualizar el repositorio cumpliendo estrictamente **DGII** (e‑CF, **ARECF**, **ACECF**, **ANECF**, **RFCE**) y reforzar **seguridad/observabilidad**. **Antes de cualquier cambio de código**, el implementador **debe leer y tomar nota de los requisitos** desde `docs/official/` (PDF/XSD) y producir evidencia (“PDF Check”). Entrega vía **PR único** con CI en verde.

---

## 0) Fase PDF‑First (obligatoria, *antes de tocar código*)

**Entrada:** Todo lo ubicado en `docs/official/` (p. ej., *Guía Básica*, *Proceso de Certificación*, *Autorización/Certificación PSFE*, *Descripción técnica / URLs*, *Firmado e‑CF*, *Tablas e‑CF*, *Formatos ARECF/ACECF/ANECF/RFCE*, XSDs por tipo e‑CF).  
**Salida:** Carpeta de evidencia + notas de requisitos, con citas por página.

### 0.1 Descubrimiento
- Listar **todos** los archivos PDF/XSD en `docs/official/` con: nombre, versión, fecha y hash (SHA‑256).
- Identificar **tipos de e‑CF** cubiertos (31/32/33/34/41/43/44/45/46/47) y artefactos de receptor (**ARECF/ACECF/ANECF**) y **RFCE**.

### 0.2 Extracción
- Extraer **texto por página** (y tablas/figuras relevantes). Usar OCR si el PDF es escaneado.
- Capturar **catálogos** y **reglas** (obligatoriedad/condicionalidad, longitudes, formatos, decimales con punto, TZ/UTC).

### 0.3 Mapeo de Requisitos (Checklist)
- **Firma XMLDSig**: `RSA‑SHA256`, `DigestMethod=SHA256`, `Reference URI=""` (documento completo), **C14N**, sin comentarios.
- **XSD**: validar **cada** tipo e‑CF (31…47) y mensajes **ARECF/ACECF/ANECF/RFCE**. Mantener versiones y checksums.
- **RI/QR**: todos los campos marcados **“I/P”** presentes; URL y **código de seguridad** correctos.
- **Mensajería Receptor**: obligación de **ARECF** (siempre), **ACECF** (aplica, con copia a DGII), **ANECF** según flujo de anulación.
- **RFCE**: umbral (< RD$ 250,000), estructura, longitudes, validaciones y envío a DGII.
- **Servicios DGII**: **semilla → token → envío**, **consultas** (directorio, track, resultado, resúmenes).
- **Secuencias/“reutilizar eNCF”**: reglas y casos límite.
- **Ambientes**: **pre‑cert** (retención 60 días), **certificación** y **producción**; URLs independientes.
- **Nombres de archivo y codificación**: estándar oficial, **UTF‑8**.
- **Seguridad PSFE**: políticas, contingencia, privacidad (Ley 172‑13), soporte/SLA, contacto DGII, backups, bitácora.
- **No conformidades**: tags vacíos, longitudes fuera de rango, formatos inválidos → **rechazar**.

### 0.4 Conflictos / Gaps
- Si dos PDFs discrepan, prevalece el **más reciente** y/o el que indique **versión**. Documentar la decisión.
- Registrar **faltantes** (p. ej., anexos, tablas maestras, ejemplos de XML).

### 0.5 Evidencia a generar (repositorio)
Crear `docs/official/_evidencia/` con:
- `PDF_CHECK.md`: **índice** de documentos con versión/fecha/hash y **resumen por PDF (1‑3 líneas)** + **citas por página**: `[Nombre.pdf, p.X]`.
- `REQUISITOS_DGII.md`: **checklist consolidado** (lo anterior) con matriz “Requisito → Fuente [PDF, p.X] → Estado (OK/Pendiente) → Comentario”.
- `pdf_index.json`: lista de archivos con metadatos (nombre, tamaño, fecha, hash, páginas).
- `xsd_inventory.json`: inventario de XSD (tipo, versión, hash).
> **Regla:** Si `PDF_CHECK.md` o `REQUISITOS_DGII.md` **no existen o están incompletos**, **no continuar** con la fase de código.

### 0.6 Criterios de aceptación — Fase 0
- Todos los documentos en `docs/official/` están **inventariados** con versión/fecha/hash.
- Existen `PDF_CHECK.md` y `REQUISITOS_DGII.md` con **citas por página** y **matriz de requisitos**.
- Conflictos resueltos y **gaps** reportados con plan de mitigación.
- Inventarios `pdf_index.json` y `xsd_inventory.json` generados y versionados.

> **Sugerencia (opcional):** incluir un script `tools/pdf_check.py` que rellene estos artefactos automáticamente.

---

## ✅ Alcance (qué debe quedar funcionando — fase de implementación)

1) **e‑CF (31/32/33/34/41/43/44/45/46/47)**  
   - Validación **XSD** (últimos esquemas) en **build** y en **runtime** (pre‑envío).  
   - Firma **XMLDSig RSA‑SHA256** con `Reference URI=""`, `DigestMethod sha256`, **C14N**, y **sello de tiempo (UTC)**.  
   - **Obligatoriedad/condicionalidad** por tablas; **rechazo** de tags vacíos/longitudes inválidas.  
   - **Nombre de archivo** y **codificación UTF‑8** según estándar.  
   - **RI (Representación Impresa)** con campos “I/P” y **QR** con código de seguridad correcto.

2) **Mensajería Receptor**  
   - **ARECF**: endpoint de recepción + emisor de acuse.  
   - **ACECF**: endpoint de recepción + **copia DGII**.  
   - **RFCE (< RD$ 250,000)**: generación y **envío a DGII** (campos y validaciones).

3) **Cliente DGII**  
   - Flujo **semilla → token → envíos**, con **reintentos exponenciales**, **idempotencia**, **timeouts** y **circuit‑breaker**.  
   - **Consultas**: Directorio (RNC), TrackIds/Resultado, **Resúmenes**; manejo de **“reutilizar eNCF”**.  
   - **Ambientes**: pre‑cert (retención 60 días), certificación, producción.

4) **Seguridad y Cumplimiento PSFE**  
   - `docs/compliance/`: **Política de Seguridad**, **Contingencia**, **Privacidad (172‑13)**, **Soporte/SLA**, **Contacto DGII**, **Bitácora**, **Backup/Restore**.  
   - **WORM**/inmutabilidad para XML/Acuses; **auditoría hash encadenado**.  
   - **Rate‑limit**, **CORS** granular, **rotación de JWT**, **secretos fuera del repo**.  
   - **Logging estructurado**, **trazabilidad**, **métricas Prometheus**.

5) **Calidad/DevOps**  
   - **OpenAPI 3.1** sincronizado con routers.  
   - **CI**: `ruff`, `mypy`, **tests contractuales** e integración (≥ **85%**).  
   - **Dockerfile** reproducible + **docker‑compose** (web/nginx/postgres/redis) con **healthchecks**.  
   - **Tests** para RI/QR, XSD, firma, flujos ARECF/ACECF/RFCE y “reutilización de eNCF”.

---

## 🛠️ Cambios específicos (paso a paso)

### A) Validación & Firma
- [ ] Sincronizar `xsd/` con e‑CF 31…47 + ARECF + ACECF + **ANECF** + RFCE (desde `docs/official/`).  
- [ ] Validador XSD central `app/dgii/validation.py` + **tests parametrizados** por tipo.  
- [ ] **XMLDSig RSA‑SHA256**: `SignatureMethod rsa‑sha256`, `Digest sha256`, `Reference URI=""`, **C14N**, sin comentarios.  
- [ ] **Sello de tiempo** ISO‑8601 (UTC) y validación de zonas.  
- [ ] Rechazar **tags vacíos** y **longitudes** fuera de rango.  
- [ ] Estándares de **nombres de archivo** y **UTF‑8**.

### B) Reglas de Negocio e‑CF
- [ ] Obligatoriedad/condicionalidad por tablas (Encabezado, Detalle, Subtotales, Descuentos, Paginación, Referencia).  
- [ ] **32 & 34**: reglas especiales (p. ej., secuencias y vencimientos).  
- [ ] Catálogos: **TipoPago**, **Formas de Pago**, **TipoIngresos**.  
- [ ] **Indicadores** (envío diferido, monto gravado, nota > 30 días).  
- [ ] **RI**: plantillas con todos los “I/P”; **QR** con URL válida y código de seguridad.

### C) Receptor (ARECF/ACECF/ANECF) & RFCE
- [ ] Endpoints `/receptor/acuse` (ARECF), `/receptor/aprobacion` (ACECF) con **copia a DGII** y `/receptor/anulacion` (ANECF) si aplica.  
- [ ] Endpoint `/rfce/enviar` (< 250k) con validación completa y respuesta DGII.  
- [ ] **Firma digital** y **XSD** para ARECF/ACECF/ANECF/RFCE.  
- [ ] Pruebas: estados válidos y rechazos (eNCF inexistente/duplicado, incoherencias RNC/eNCF, etc.).

### D) Cliente DGII
- [ ] SDK `DGIIClient`: `get_semilla()`, `get_token()`, `enviar_ecf()`, `consulta_directorio(rnc)`, `consulta_resumen(...)`, `consulta_trackid(...)`, `consulta_resultado(...)`.  
- [ ] **Idempotencia** (`Idempotency‑Key` + persistencia), **reintentos exponenciales**, **timeouts**, **circuit‑breaker**.  
- [ ] Manejo de **“reutilizar eNCF”**.  
- [ ] **Ambientes** por variables; tests de **pre‑cert (60 días)**.

### E) Seguridad/Organización PSFE
- [ ] `docs/compliance/`: `SEGURIDAD.md`, `CONTINGENCIA.md`, `PRIVACIDAD_172‑13.md`, `SOPORTE_SLA.md`, `CONTACTO_DGII.md`, `BACKUP_RESTORE.md`, `BITACORA.md`.  
- [ ] **WORM** e inmutabilidad; **hash‑chain** de auditoría.  
- [ ] **Rate‑limit** (Redis), **CORS** whitelist, **JWT** rotados.  
- [ ] **Secretos** por entorno/vault.  
- [ ] Observabilidad: `/metrics`, trazas, logs JSON.

### F) OpenAPI, Tests, CI/CD
- [ ] Sincronizar `openapi/*.yaml` ↔ routers (`/api/dgii/*`, `/ri/*`, `/receptor/*`, `/rfce/*`).  
- [ ] **Tests** (Pytest + respx): XSD (31…47), firma, RI/QR, ARECF/ACECF/ANECF/RFCE, cliente DGII, “reutilizar eNCF”.  
- [ ] **Cobertura ≥ 85%**; workflow CI: `ruff`, `mypy`, `pytest`, `docker build`, publicación de artefactos.  
- [ ] **Docker Compose**: healthchecks, límites de recursos, `readiness` (DB/Redis + reachability DGII mock).

---

## 🧪 Criterios de Aceptación (globales)

- **Fase 0 (PDF‑First)** completada con `PDF_CHECK.md` y `REQUISITOS_DGII.md` (citas por página y matriz de requisitos).  
- Cualquier **e‑CF** generado **valida XSD** y pasa reglas de **obligatoriedad**.  
- **Firma**: `rsa‑sha256`, `Digest sha256`, `Reference URI=""`, **C14N**; verificación correcta.  
- **RI**: todos los “I/P”; **QR** decodifica a URL válida con **código de seguridad**.  
- **ARECF/ACECF/ANECF**: recepción/emisión y almacenamiento de firma/estatus.  
- **RFCE**: envío y consultas operativas.  
- **DGIIClient**: semilla/token/envíos/consultas con **reintentos** e **idempotencia**.  
- **Ambientes**: separados; en **pre‑cert** se respetan límites/retención.  
- **OpenAPI 3.1** válido y sincronizado.  
- **CI** en verde, cobertura ≥ **85%**.

---

## 📁 Estructura sugerida

```
docs/
  official/
    _evidencia/
      PDF_CHECK.md
      REQUISITOS_DGII.md
      pdf_index.json
      xsd_inventory.json
app/
  dgii/
    signing.py
    validation.py
    client.py
    receptor/
      arecf.py
      acecf.py
      anecf.py
    rfce/
      service.py
  ri/
    render.py
openapi/
  dgii.yaml
xsd/
  ecf31.xsd ... ecf47.xsd, arecf.xsd, acecf.xsd, anecf.xsd, rfce.xsd
docs/compliance/
  SEGURIDAD.md, CONTINGENCIA.md, PRIVACIDAD_172-13.md, SOPORTE_SLA.md, CONTACTO_DGII.md, BACKUP_RESTORE.md, BITACORA.md
tests/
  test_xsd_*.py, test_signing.py, test_ri_qr.py, test_arecf_acecf_anecf.py, test_rfce.py, test_dgii_client.py
tools/
  pdf_check.py   # (opcional) genera _evidencia automáticamente
```

---

## 🔐 Variables de entorno mínimas

```
DGII_BASE_URL=...
DGII_CLIENT_ID=...
DGII_CLIENT_SECRET=...
DGII_CERT_PATH=/secrets/cert.p12
DGII_CERT_PASS=change-me
DGII_AMBIENTE=precert|cert|prod
```

---

## 🧭 Plan de PR (mensaje sugerido)

> **feat(compliance): PDF‑First + DGII e‑CF hardening (XSD, XMLDSig, ARECF/ACECF/ANECF/RFCE, RI/QR, DGIIClient, OpenAPI, CI)**  
> - **Fase 0:** `docs/official/_evidencia/` con `PDF_CHECK.md` + `REQUISITOS_DGII.md` (citas por página)  
> - XSD sync + validador runtime/build  
> - Firma RSA‑SHA256 (C14N, URI vacía) + sello de tiempo  
> - ARECF/ACECF/ANECF/RFCE completos (XSD + firma + endpoints)  
> - DGIIClient (semilla/token/envíos/consultas), idempotencia y reintentos  
> - Estándares de nombre de archivo/UTF‑8; rechazo de tags vacíos  
> - RI con todos los campos I/P y QR conforme  
> - OpenAPI 3.1 actualizado; tests y cobertura ≥ 85%  
> - Seguridad/PSFE: WORM, hash‑chain, rate‑limit, CORS, JWT, secretos por entorno  
> - Docker/CI listos con healthchecks y límites de recursos

---

## 🔎 Notas

- Mantener **versionado** de XSD y documentar en `CHANGELOG.md`.  
- Adjuntar **evidencias** (XML de ejemplo, capturas de RI/QR, reportes de validación XSD).  
- No subir certificados reales; usar **mocks** y secretos locales/CI.  
