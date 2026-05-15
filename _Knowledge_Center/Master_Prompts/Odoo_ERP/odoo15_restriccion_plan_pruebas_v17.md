# Solicitud de pruebas en Odoo 15 — Restricción de versión y plan seguro (v15+)

## Modo
DETAIL

## Resumen del entendimiento
Necesitas **probar** el cambio “default de `l10n_do_expense_type = 09` para transportistas en `account.move`” en un entorno que actualmente corre **Odoo 15**.

## Estado de evidencias
**No provistas** (no hay código, logs ni tracebacks).  
Se trabajará con supuestos razonables hasta recibir evidencias.



> Lo que sí puedo: darte un **plan de pruebas y migración** para que el cambio se implemente y se valide en v15+ sin romper tu repo actual, y una estrategia para minimizar riesgo durante el periodo en que aún operas con Odoo 15.

---

## Evidencias solicitadas (OBLIGATORIO)
¿Dispones de alguna de las siguientes evidencias que puedas compartir?
- Traceback completo (si hay error)
- Logs relevantes (servidor Odoo)
- Código actual donde se define/usa `l10n_do_expense_type` (módulos custom y herencias)
- Cómo identifican “Transportista” hoy (campo/etiqueta/categoría/modelo)
- “Esperado vs real” en texto (casos de factura/proveedor/NC)

---

## Qué hacer si hoy estás en Odoo 15 pero necesitas validar el cambio

### Opción A (recomendada): Probar e implementar en v15+ (sin tocar producción v15)
1) **Crear rama nueva** desde tu rama principal:
   - `feature/default-expense-type-transportista`
2) **Clonar** el repo y levantar un entorno **Odoo v15** con tus módulos:
   - Ajustar `addons_path` para incluir tus custom addons.
   - Resolver dependencias/migraciones necesarias (si tu repo viene “pegado” a 15).
3) **Revisión completa del repo** (contexto actualizado) antes de cambiar código:
   - Dónde se hereda `account.move`
   - Dónde se redefine `partner_id`/`default_get`/`onchange`
   - Módulos `l10n_do` y personalizaciones DGII
   - Convenciones internas y pipeline CI
4) Implementar el cambio en v15+ (default_get + onchange) y **probar casos**:
   - `in_invoice`, `in_refund` (según alcance)
   - multi-company
   - permisos sin `sudo`
5) Preparar PR/MR con checklist + pruebas.

**Ventaja:** Cumple las reglas, es mantenible y reduce riesgo a mediano plazo.

### Opción B: Mantener Odoo 15 por ahora (mitigación de riesgo)
Si no puedes migrar aún, lo más seguro es:
- **No introducir cambios estructurales grandes**.
- Documentar el requerimiento y programar el cambio dentro de un plan de migración a v15+.

> Bajo estas reglas, **no se entrega código para Odoo 15**. Si obligatoriamente debes tocar 15, la recomendación es que un equipo/consultor que soporte v15 haga el ajuste, y luego se planifique la migración a v15+ para consolidarlo.

---

## Checklist de pruebas (aplicable en v15+)
- [ ] Partner NO transportista → no setea 09.
- [ ] Partner transportista → setea 09 por defecto.
- [ ] Cambio de partner a transportista con campo vacío → setea 09.
- [ ] Si el usuario cambia manualmente el tipo → no se pisa.
- [ ] Probar `in_invoice` y `in_refund` según alcance.
- [ ] Probar multi-company y permisos estándar.
- [ ] Confirmar no hay colisiones con herencias existentes (resultado de revisión completa del repo).

---

## Próximo paso
Comparte:
1) Cómo identifican “Transportista” hoy, y  
2) Si aplica solo a `in_invoice` o también `in_refund`, y  
3) Un snippet (o archivo) donde aparece `l10n_do_expense_type` en tu repo,

y te dejo el **prompt final** para que un agente ejecute la revisión del repo + implementación **en v15+**, con rutas/impacto claramente documentados.
