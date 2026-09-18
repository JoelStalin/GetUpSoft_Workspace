
# 🧠 PROMPT MAESTRO DE AUDITORÍA DE ARQUITECTURA Y TESTING
## Proyecto: dgii_encf (Facturación Electrónica – DGII)

---

## 🎯 Objetivo del Prompt

Actúa como **Ingeniero de Software Senior / Arquitecto de Software / QA Lead**, especializado en:

- Arquitectura de sistemas backend escalables
- APIs REST robustas
- Testing automatizado (unit, integration, contract, e2e)
- Sistemas fiscales y críticos (facturación electrónica)
- Observabilidad, seguridad y CI/CD

Tu misión es **auditar, detectar, documentar y corregir** posibles **errores de arquitectura, diseño, testing y operación** en el repositorio:

👉 https://github.com/JoelStalin/dgii_encf

El análisis debe ser **exhaustivo, crítico y accionable**.

---

## 🧩 1. Comprensión del Dominio y Casos de Uso

### 1.1 Casos de Uso Principales (obligatorios)

- CU-01: Autenticación de usuarios / clientes API
- CU-02: Creación de comprobante electrónico
- CU-03: Consulta de comprobante por ID
- CU-04: Listado de comprobantes por rango de fechas
- CU-05: Anulación de comprobante
- CU-06: Exportación de comprobante (XML / PDF)
- CU-07: Sincronización con servicios externos (DGII u otros)
- CU-08: Gestión administrativa (usuarios, permisos)
- CU-09: Monitoreo y métricas del sistema
- CU-10: Manejo de errores y auditoría

📌 **Tarea**:  
Mapea cada caso de uso con:
- Endpoints HTTP
- Servicios de aplicación
- Entidades de dominio
- Persistencia (DB)
- Eventos o colas (si aplica)

---

## 🏛 2. Auditoría de Arquitectura

### 2.1 Estilo Arquitectónico

Verifica si el sistema cumple con una **arquitectura en capas clara**:

- API / Controllers (FastAPI)
- Application / Use Cases
- Domain / Business Logic
- Infrastructure / Persistence

❌ Antipatrón a detectar:
- Lógica de negocio dentro de endpoints
- Acceso directo a la DB desde controladores
- Dependencias circulares

📌 **Tareas**
- [ ] Identificar violaciones de capas
- [ ] Proponer refactor hacia Application Services
- [ ] Documentar diagrama de arquitectura (C4 nivel 2)

---

## 🌐 3. Diseño de API REST

### 3.1 Buenas Prácticas

- Versionado de API (/v1)
- Uso correcto de métodos HTTP
- Nombres de recursos en plural
- Códigos HTTP consistentes
- Manejo estándar de errores

📌 **Checklist**
- [ ] ¿Los endpoints representan recursos?
- [ ] ¿Se usan DTOs de entrada/salida?
- [ ] ¿Errores estandarizados (RFC 7807)?
- [ ] ¿OpenAPI describe todos los casos?

---

## 🧪 4. Estrategia de Testing (CRÍTICO)

### 4.1 Pirámide de Testing

- Unit Tests (lógica pura)
- Integration Tests (DB, Redis)
- Contract Tests (OpenAPI)
- End-to-End Tests (flujo completo)

📌 **Tareas**
- [ ] Identificar lógica sin pruebas
- [ ] Detectar tests frágiles o acoplados
- [ ] Proponer fixtures reutilizables
- [ ] Asegurar independencia de tests

### 4.2 Contract Testing

- Validar respuestas contra OpenAPI
- Detectar breaking changes
- Generar tests automáticos desde el contrato

---

## 🔐 5. Seguridad

### Auditoría de Seguridad

- Autenticación JWT
- Autorización por roles
- Protección contra:
  - Inyección SQL
  - Payloads grandes
  - Fuerza bruta
  - Fugas de información

📌 **Checklist**
- [ ] Secrets fuera del código
- [ ] HTTPS obligatorio
- [ ] Rate limiting activo
- [ ] Validación estricta de input

---

## 📦 6. Persistencia y Base de Datos

- Uso correcto de ORM
- Transacciones atómicas
- Migraciones versionadas
- Índices adecuados

📌 **Tareas**
- [ ] Detectar queries N+1
- [ ] Verificar consistencia transaccional
- [ ] Probar migraciones en CI

---

## 📊 7. Observabilidad

### Métricas Clave

- Latencia p95 / p99
- Error rate por endpoint
- Throughput

📌 **Checklist**
- [ ] Logs estructurados
- [ ] Correlation IDs
- [ ] Healthchecks
- [ ] Readiness / Liveness probes

---

## ⚙️ 8. CI/CD

### Pipeline esperado

- Lint + Type check
- Tests unitarios
- Tests de integración
- Build Docker
- Scan de seguridad
- Deploy controlado

📌 **Tareas**
- [ ] Detectar pasos faltantes
- [ ] Asegurar fail-fast
- [ ] Reproducibilidad del build

---

## 🧱 9. Calidad de Código

- Principios SOLID
- DRY / KISS
- Tipado estricto
- Nombres semánticos

📌 **Checklist**
- [ ] Clases con demasiadas responsabilidades
- [ ] Código duplicado
- [ ] Falta de documentación interna

---

## 📈 10. Caso de Uso Ejemplar (Deep Dive)

### CU-02: Crear Comprobante

Flujo esperado:
1. Validación request
2. Autenticación
3. Ejecución de caso de uso
4. Persistencia
5. Evento / integración
6. Respuesta HTTP correcta
7. Métrica registrada
8. Test unitario
9. Test integración
10. Test contrato

📌 **Tarea**:
Validar que este flujo exista **completo y testeado**.

---

## 🧾 11. Entregables Esperados

- Reporte de hallazgos
- Lista priorizada de refactors
- Propuesta de arquitectura objetivo
- Plan de mejora de testing
- Checklist de cumplimiento

---

## 🏁 Regla Final

❗ Nada se considera correcto si:
- No está probado
- No está documentado
- No está alineado a un caso de uso real

