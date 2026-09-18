
# 📦 Prompt de Actualización — Cumplimiento DGII e‑CF (Repo: `JoelStalin/dgii_encf`)

**Objetivo:** Actualizar el repositorio para cumplir de forma estricta con las normativas y formatos DGII (e‑CF, ARECF, ACECF, RFCE), reforzar seguridad/observabilidad y cerrar brechas de certificación (Emisor/Proveedor de Servicios). Entrega vía **PR único** con CI verde.

---

## ✅ Alcance (qué debe quedar funcionando)

1) **e‑CF (31/32/33/34/41/43/44/45/46/47)**  
   - Validación **XSD** (últimos esquemas del portal) en build y en runtime (pre‑envío).  
   - Firma **XMLDSig RSA‑SHA256** con `Reference URI=""`, `DigestMethod sha256`, **canonicalización C14N**, y sello de tiempo (UTC).  
   - Regla de **obligatoriedad y condicionalidad** de campos según tablas oficiales; rechazar XML con tags vacíos o longitudes inválidas.  
   - **Nombre de archivo XML** y **codificación** según estándar DGII.  
   - **RI (Representación Impresa)**: presencia de campos marcados como “I/P” y QR con código de seguridad correcto.

2) **Mensajería Receptor**  
   - **ARECF (Acuse de Recibo)**: endpoint de recepción y emisor de respuesta.  
   - **ACECF (Aprobación/Rechazo Comercial)**: endpoint de recepción + copia DGII.  
   - **RFCE (< DOP 250,000)**: generación y **envío a DGII** cumpliendo campos y validaciones.

3) **Cliente DGII (Autoridad Tributaria)**  
   - Flujo **semilla → token → envíos**, con **reintentos exponenciales**, **idempotencia**, timeouts, y circuit‑breaker.  
   - **Consulta Directorio** (por RNC), **Consulta TrackIds/Resultado**, **Consulta Resúmenes**; manejo de “**reutilizar eNCF**” cuando aplique.  
   - Separación estricta de **ambientes**: pre‑cert (retención 60 días), certificación, producción.

4) **Seguridad y Cumplimiento Proveedor de Servicios (PSFE)**  
   - Carpeta `docs/compliance/` con: **Política de Seguridad**, **Contingencia**, **Protección de Datos (172‑13)**, **Canales de Soporte (SLA)**, **Contacto DGII**, **Bitácora de cambios**, **Procedimientos de Backup/Restore**.  
   - **WORM / inmutabilidad** para XML firmados y acuses; **auditoría hash encadenado**.  
   - **Rate‑limit**, **CORS** granular, **rotación de JWT**, secretos fuera del repo.  
   - **Logging estructurado** + **trazabilidad distribuida** + **métricas Prometheus**.

5) **Calidad/DevOps**  
   - **OpenAPI 3.1** sincronizado con routers.  
   - **CI**: linters (ruff), type‑check (mypy), pruebas contractuales y de integración (≥ 85% cobertura).  
   - **Dockerfile** reproducible + **docker‑compose** (web/nginx/postgres/redis) con healthchecks.  
   - **Tests** para RI/QR, XSD, firma, flows ARECF/ACECF/RFCE y “reutilización de eNCF”.

---

## 🛠️ Cambios específicos (paso a paso)

### A) Validación & Firma
- [ ] Sincronizar `xsd/` con los esquemas e‑CF 31/32/33/34/41/43/44/45/46/47 + ARECF + ACECF + RFCE.  
- [ ] Implementar **validador XSD** central (`app/dgii/validation.py`) con tests parametrizados por tipo e‑CF.  
- [ ] Asegurar **XMLDSig RSA‑SHA256**: `SignatureMethod rsa‑sha256`, `DigestMethod sha256`, `Reference URI=""`, C14N, sin comentarios.  
- [ ] Agregar **sello de tiempo** ISO‑8601 (UTC) y validar **Timezone** consistente.  
- [ ] Rechazar **tags vacíos** y campos con **longitudes** fuera de rango.  
- [ ] Implementar **nombres de archivos** y **encoding** oficial (UTF‑8) para todos los envíos/descargas.

### B) Reglas de Negocio e‑CF
- [ ] Aplicar **obligatoriedad/condicionalidad** por tablas (Encabezado, Detalle, Subtotales, Descuentos, Paginación, Referencia).  
- [ ] **32 & 34**: respeto a reglas especiales (p.ej., vencimiento de secuencias/no vencimiento donde aplique).  
- [ ] **TipoPago / Formas de Pago / TipoIngresos** con catálogos y validaciones.  
- [ ] **Indicadores** (envío diferido, monto gravado, nota > 30 días) según especificación.  
- [ ] **RI**: plantillas que muestren todos los campos marcados “I/P”; QR con URL y código de seguridad correcto.

### C) Receptor (ARECF/ACECF) & RFCE
- [ ] Endpoints `/receptor/acuse` (ARECF) y `/receptor/aprobacion` (ACECF) + copia a DGII cuando corresponda.  
- [ ] Endpoint `/rfce/enviar` (< 250k) con validación completa y respuesta DGII.  
- [ ] **Firmas digitales** y **validación XSD** para ARECF/ACECF/RFCE.  
- [ ] Pruebas de negocio: estados válidos y rechazos (eNCF inexistente, eNCF ya recibido, incoherencias RNC/eNCF, etc.).

### D) Cliente DGII
- [ ] SDK interno `DGIIClient` con métodos: `get_semilla()`, `get_token()`, `enviar_ecf()`, `consulta_directorio(rnc)`, `consulta_resumen(...)`, `consulta_trackid(...)`, `consulta_resultado(...)`.  
- [ ] **Idempotencia** por `Idempotency‑Key` + persistencia; **reintentos exponenciales**; **timeouts** y **circuit‑breaker**.  
- [ ] Manejo del indicador **“reutilizar eNCF”**.  
- [ ] **Ambientes**: variables por entorno y **tests** que simulen precertificación (retención 60 días).

### E) Seguridad/Organización PSFE
- [ ] Añadir `docs/compliance/` con: `SEGURIDAD.md`, `CONTINGENCIA.md`, `PRIVACIDAD_172‑13.md`, `SOPORTE_SLA.md`, `CONTACTO_DGII.md`, `BACKUP_RESTORE.md`, `BITACORA.md`.  
- [ ] Activar **WORM** (inmutabilidad) para XML y respuestas; **hash‑chain** en auditoría.  
- [ ] **Rate‑limit** (Redis), **CORS** por lista blanca, **JWT** con rotación/expiración.  
- [ ] **Secretos** por variables de entorno / vault.  
- [ ] **Monitoreo**: `/metrics`, trazas, logs JSON.

### F) OpenAPI, Tests, CI/CD
- [ ] **Sincronizar** `openapi/*.yaml` ↔ routers (`/api/dgii/*`, `/ri/*`, `/receptor/*`, `/rfce/*`).  
- [ ] **Tests** (Pytest + respx): XSD (todos los tipos), firma, RI/QR, flujos ARECF/ACECF/RFCE, cliente DGII, “reutilizar eNCF”.  
- [ ] **Cobertura ≥ 85%** y **workflow CI** que corra: `ruff`, `mypy`, `pytest`, `docker build`, publish artifacts.  
- [ ] **Docker Compose**: healthchecks, límites de recursos, `readiness` que valide DB/Redis y reachability DGII (mock).

---

## 🧪 Criterios de Aceptación (resumen)

- Al generar cualquier **e‑CF**, el XML **valida XSD** y pasa reglas de **obligatoriedad**.  
- La **firma** se verifica con `rsa‑sha256` y `Digest sha256` sobre el **documento completo** (URI vacío).  
- La **RI** muestra todos los campos “I/P”; el **QR** se decodifica a una URL válida con el **código de seguridad**.  
- **ARECF** y **ACECF** pueden ser **recibidos** y **emitidos** (cuando aplique), guardando firma y estatus.  
- **RFCE** se **envía** y se **consulta** su estado.  
- **DGIIClient** soporta **semilla/token/envíos/consultas**, con **reintentos** e **idempotencia**.  
- **Ambientes** separados y configurables; en **pre‑cert** se respetan límites/retención.  
- **OpenAPI 3.1** describe todos los endpoints y pasa validación.  
- **CI** en verde con cobertura ≥ 85%.

---

## 📁 Estructura sugerida (si falta algo)

```
app/
  dgii/
    signing.py          # firma RSA‑SHA256 (XMLDSig)
    validation.py       # validación XSD + reglas
    client.py           # DGIIClient (semilla/token/envíos/consultas)
    receptor/
      arecf.py          # endpoints/servicios ARECF
      acecf.py          # endpoints/servicios ACECF
    rfce/
      service.py        # envío y validación RFCE
  ri/
    render.py           # plantillas + QR + PDF
openapi/
  dgii.yaml
xsd/
  ecf31.xsd ... ecf47.xsd, arecf.xsd, acecf.xsd, rfce.xsd
docs/compliance/
  SEGURIDAD.md, CONTINGENCIA.md, PRIVACIDAD_172‑13.md, SOPORTE_SLA.md, CONTACTO_DGII.md, BACKUP_RESTORE.md, BITACORA.md
tests/
  test_xsd_*.py, test_signing.py, test_ri_qr.py, test_arecf_acecf.py, test_rfce.py, test_dgii_client.py
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

## 🧭 Plan de PR (mensaje)

> **feat(compliance): DGII e‑CF full‑stack hardening (XSD, XMLDSig, ARECF/ACECF/RFCE, RI/QR, DGIIClient, OpenAPI, CI)**  
> - XSD sync + validador runtime/build  
> - Firma RSA‑SHA256 con C14N y sello de tiempo  
> - ARECF/ACECF + RFCE completos (XSD + firma + endpoints)  
> - Cliente DGII con semilla/token/envíos/consultas; idempotencia y reintentos  
> - Estándares de nombre de archivo/encoding; rechazo de tags vacíos  
> - RI con todos los campos I/P y QR conforme  
> - OpenAPI 3.1 actualizado; tests y cobertura ≥ 85%  
> - Seguridad/PSFE: WORM, hash‑chain, rate‑limit, CORS, JWT, secretos por entorno  
> - Docker/CI listos con healthchecks y límites de recursos

---

## 🔎 Notas

- Mantén **versionado** de XSD y documenta en `CHANGELOG.md`.  
- Adjunta **evidencias** (XML de ejemplo, capturas de RI/QR, reportes de validación XSD).  
- No subir certificados reales; usar **mocks** y secrets locales/CI.  

