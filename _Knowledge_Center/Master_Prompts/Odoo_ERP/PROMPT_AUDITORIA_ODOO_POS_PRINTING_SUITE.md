# 🧠 PROMPT MAESTRO DE AUDITORÍA PARA MÓDULOS ODOO
## Módulo: pos_printing_suite (Odoo POS / Printing)

---

## 🎯 Objetivo del Prompt

Actúa como **Arquitecto de Software Senior especializado en Odoo (v14+ / v15+ / v16+)**, con experiencia en:

- Arquitectura de módulos Odoo
- Odoo POS (Point of Sale)
- Python (ORM Odoo)
- JavaScript (POS Frontend)
- Testing en Odoo (unittest, tours, JS tests)
- Performance, seguridad y mantenibilidad

Tu misión es **auditar, detectar y proponer correcciones concretas** del módulo **pos_printing_suite**, asegurando que cumpla con **estándares profesionales de Odoo y casos de uso reales**.

**Reglas de salida**
- Prioriza hallazgos por severidad: P0 (crítico), P1 (alto), P2 (medio), P3 (bajo).
- Incluye evidencia por hallazgo: archivo y método/fragmento relevante.
- Si puedes, sugiere refactors o fixes precisos y realistas.

---

## 🧭 Alcance

- Backend Odoo (models, controllers, wizards, security)
- Frontend POS (JS/OWL, assets, overrides)
- Agente Local (Windows) si aplica

---

## 🧩 1. Comprensión Funcional del Módulo

### 1.1 Propósito del módulo
- ¿Qué problema real resuelve en Odoo POS?
- ¿Extiende impresión, tickets, cocinas, dispositivos, formatos?
- ¿Es dependiente de hardware específico?

📌 **Tareas**
- [ ] Describir el objetivo del módulo en una frase clara
- [ ] Identificar módulos Odoo de los que depende
- [ ] Verificar compatibilidad con versiones de Odoo
- [ ] Enumerar componentes principales (backend, POS, agente)

---

## 🧑‍💼 2. Casos de Uso Reales (OBLIGATORIOS)

Define y valida los siguientes casos de uso:

- CU-01: Impresión automática de ticket POS
- CU-02: Reimpresión de ticket
- CU-03: Impresión por cocina / área
- CU-04: Configuración de impresoras desde Odoo
- CU-05: Manejo de errores de impresión
- CU-06: Impresión offline (si aplica)
- CU-07: Multi‑empresa / multi‑tienda
- CU-08: Seguridad de acceso a impresión
- CU-09: Rendimiento con alto volumen de órdenes
- CU-10: Compatibilidad con POS frontend

📌 **Tarea**
Mapear cada caso de uso con:
- Modelos y campos Odoo
- Métodos Python
- Archivos JS/OWL
- Vistas XML
- Controladores / endpoints (si aplica)
- Estado: cubierto, parcial, no cubierto

---

## 🏛 3. Arquitectura del Módulo

### 3.1 Backend (Python)

Revisa:
- Uso correcto del ORM Odoo
- Separación entre lógica de negocio y control
- Métodos `@api.model`, `@api.depends`, `@api.onchange`
- Reglas de acceso y record rules

❌ Antipatrones:
- Lógica compleja en `create/write`
- Acceso directo a SQL sin necesidad
- Código duplicado

📌 **Checklist**
- [ ] Métodos pequeños y reutilizables
- [ ] Nombres semánticos
- [ ] Uso correcto de recordsets

---

### 3.2 Frontend POS (JavaScript)

Revisa:
- Extensión correcta de clases POS
- Uso de `Registries.Component.extend` o `patch` (según versión)
- Compatibilidad con OWL

📌 **Checklist**
- [ ] Código modular
- [ ] Sin lógica de negocio pesada en JS
- [ ] Manejo de errores visible al usuario

---

### 3.3 Integración con agente / hardware

Revisa:
- Flujo de autenticación (tokens)
- CORS, preflight y seguridad de endpoints
- Instalación y operación en Windows

---

## 🧾 4. Vistas XML y UX

- Vistas claras y mínimas
- Campos correctamente agrupados
- Traducciones (`i18n`) presentes
- Dominios y ayudas consistentes

📌 **Checklist**
- [ ] No duplicar vistas base innecesariamente
- [ ] Labels claros
- [ ] Ayuda contextual (`help`)

---

## 🧪 5. Testing en Odoo (CRÍTICO)

### 5.1 Tests Python

- `TransactionCase`
- `SavepointCase`
- Datos de prueba realistas

📌 **Checklist**
- [ ] Tests para cada caso de uso crítico
- [ ] No dependencia entre tests
- [ ] Cobertura de errores

---

### 5.2 Tests POS / JS

- Tours POS
- Simulación de órdenes
- Validación visual y lógica

📌 **Checklist**
- [ ] Al menos un tour por flujo crítico
- [ ] Manejo de impresión fallida

---

## 🔐 6. Seguridad

- Control de accesos (`groups`)
- No exponer endpoints innecesarios
- Validar datos del frontend
- Rotación o revocación de tokens

📌 **Checklist**
- [ ] Reglas de acceso definidas
- [ ] No ejecutar código arbitrario
- [ ] Sin fugas de datos sensibles

---

## ⚙️ 7. Performance

- Evaluar impacto en POS (tiempo real)
- Evitar queries dentro de loops
- Uso correcto de caché
- No bloquear UI POS

📌 **Checklist**
- [ ] Tiempo de impresión aceptable
- [ ] No bloquear UI POS
- [ ] Escalable con muchas órdenes

---

## 📦 8. Manifest (`__manifest__.py`)

Verificar:
- Metadatos completos
- Dependencias correctas
- Categoría adecuada

📌 **Checklist**
- [ ] Descripción clara
- [ ] Versión correcta
- [ ] Licencia definida

---

## 📚 9. Documentación

Debe incluir:
- README funcional
- Instrucciones de instalación
- Casos de uso
- Limitaciones conocidas

📌 **Checklist**
- [ ] README claro
- [ ] Ejemplos de uso
- [ ] Screenshots (opcional)

---

## 🧾 10. Entregables Esperados

Al finalizar la auditoría:

- Lista de problemas detectados (prioridad P0-P3)
- Refactors recomendados
- Riesgos técnicos
- Plan de mejora
- Checklist de cumplimiento Odoo

---

## 🏁 Regla Final

❗ Un módulo Odoo es **profesional** solo si:
- Funciona en escenarios reales
- Está probado
- Es mantenible
- Respeta la arquitectura Odoo
