# PROMPT MAESTRO -- REPORTE CONTABLE COMPLETO ODOO 15 (ANÁLISIS TOTAL DEL REPOSITORIO LOCAL)

------------------------------------------------------------------------

## 1. OBJETIVO GENERAL

Actuar como **Arquitecto Senior de Odoo 15**, especializado en
**Contabilidad, Reporting, Auditoría de Código y Análisis de
Repositorios Locales**, para diseñar, adaptar o reconstruir un **reporte
contable personalizado**, integrado nativamente en:

> **Contabilidad → Informes (Accounting → Reports)**

El reporte debe incluir **EL 100% DE LOS CAMPOS DEFINIDOS EN EL
DOCUMENTO FUENTE**, sin omisiones, y adaptarse completamente al
**repositorio local existente**.

------------------------------------------------------------------------

## 2. CONTEXTO OBLIGATORIO DEL PROYECTO

-   Versión objetivo: **Odoo 15 (estricto)**
-   Módulo base: `account`
-   Fuente funcional:
    -   Excel con **estructura completa de campos**
    -   Excel con **datos reales de ejemplo**
-   Infraestructura:
    -   Repositorio local completo de Odoo
    -   Módulos estándar + personalizados
-   Restricción crítica:
    -   ❌ Prohibido Odoo 16+
    -   ❌ Prohibido inventar campos

------------------------------------------------------------------------

## 3. PASO PREVIO CRÍTICO (NO OPCIONAL)

Antes de proponer **cualquier línea de código**, DEBES:

1.  Analizar **TODO el repositorio local**, incluyendo:

        addons/
        addons_custom/
        odoo/addons/
        models/
        views/
        reports/
        security/

2.  Identificar y documentar:

    -   Reportes contables existentes
    -   Herencias de `account.move` y `account.move.line`
    -   Campos personalizados ya definidos
    -   Overrides y hooks existentes
    -   Reglas de seguridad relevantes

3.  Analizar los **archivos Excel**:

    -   Extraer **TODOS los campos**
    -   Identificar tipos de datos
    -   Detectar relaciones contables implícitas

------------------------------------------------------------------------

## 4. LISTA OBLIGATORIA DE CAMPOS DEL REPORTE

### Regla absoluta:

> ❗ **Si un campo existe en el Excel y no aparece aquí, el trabajo es
> inválido.**

Debes construir una tabla como la siguiente (ejemplo base, debe
ampliarse):

  ----------------------------------------------------------------------------------------------
  \#   Campo funcional     Nombre técnico        Tipo        Modelo              Origen
  ---- ------------------- --------------------- ----------- ------------------- ---------------
  1    Fecha contable      date                  date        account.move        Estándar

  2    Diario              journal_id            many2one    account.move        Estándar

  3    Número asiento      name                  char        account.move        Estándar

  4    Referencia          ref                   char        account.move        Estándar

  5    Empresa             company_id            many2one    account.move        Multi-company

  6    Cuenta              account_id            many2one    account.move.line   Estándar

  7    Débito              debit                 monetary    account.move.line   Estándar

  8    Crédito             credit                monetary    account.move.line   Estándar

  9    Balance             balance               monetary    account.move.line   Calculado

  10   Partner             partner_id            many2one    account.move.line   Estándar

  11   RNC/NIT             vat                   char        res.partner         Fiscal

  12   Producto            product_id            many2one    account.move.line   Opcional

  13   Analítica           analytic_account_id   many2one    account.move.line   Analítica

  14   Moneda              currency_id           many2one    account.move        Multi-moneda

  15   Estado              state                 selection   account.move        Flujo
  ----------------------------------------------------------------------------------------------

👉 **La tabla debe contener TODOS los campos reales del Excel, sin
límite.**

------------------------------------------------------------------------

## 5. RESTRICCIONES TÉCNICAS NO NEGOCIABLES

-   ORM-only (`self.env[...]`)
-   Respeto total de:
    -   ACLs
    -   Record Rules
    -   Multi-company
-   `sudo()` solo con justificación escrita
-   Overrides SIEMPRE con `super()`
-   No duplicar lógica existente
-   No romper reportes estándar

------------------------------------------------------------------------

## 6. ARQUITECTURA DEL REPORTE

Debes definir y documentar:

1.  Tipo de reporte:
    -   QWeb PDF
    -   XLSX (si aplica)
2.  Modelo(s) usados
3.  Métodos de agregación
4.  Agrupaciones
5.  Totales y subtotales
6.  Filtros contables (fechas, diarios, compañías)

------------------------------------------------------------------------

## 7. INTEGRACIÓN FUNCIONAL

El reporte debe aparecer en: \> **Contabilidad → Informes**

Incluyendo: - Acción (`ir.actions.client` o `ir.actions.report`) - Menú
adecuado - Permisos correctos

------------------------------------------------------------------------

## 8. ENTREGABLES OBLIGATORIOS

Devuelve **UN SOLO ARCHIVO `.md`** con:

1.  Análisis del repositorio
2.  Campos completos del reporte
3.  Evidencias o supuestos adoptados
4.  Código Python
5.  Código XML
6.  QWeb (si aplica)
7.  Riesgos
8.  Checklist final

------------------------------------------------------------------------

## 9. CHECKLIST FINAL DE VALIDACIÓN

-   [ ] Repositorio local analizado completamente
-   [ ] Campos del Excel = campos del reporte
-   [ ] Ningún campo omitido
-   [ ] Visible en Contabilidad → Informes
-   [ ] Odoo 15 compatible
-   [ ] Multi-company
-   [ ] Listo para producción

------------------------------------------------------------------------

## 10. CONDICIÓN FINAL

No se permite entregar soluciones parciales. Si falta información, debes
declararlo explícitamente.
