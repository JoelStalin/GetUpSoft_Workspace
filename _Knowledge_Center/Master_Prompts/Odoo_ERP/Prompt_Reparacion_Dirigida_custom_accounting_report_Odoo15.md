# Prompt optimizado – Reparación y Optimización **DIRIGIDA** del módulo `custom_accounting_report` (Odoo 15)

## Modo
DETAIL

---

## Resumen del entendimiento
El objetivo **NO** es refactorizar todo el repositorio ni rediseñar la arquitectura global.  
Este prompt está **limitado explícitamente** al módulo adjunto:

> **`custom_accounting_report`**

El módulo:
- Ya funciona,
- Genera reportes **PDF y Excel**,
- Presenta **lentitud**, errores de salida y carencias funcionales en el wizard.

El trabajo debe centrarse **únicamente** en:
- Wizard del reporte,
- Métodos Python que generan datos,
- Templates QWeb del PDF,
- Lógica de generación Excel.

---

## Estado de evidencias
- ✔️ Módulo adjunto (`custom_accounting_report.zip`)
- ❌ No se han proporcionado aún:
  - Tracebacks,
  - Logs,
  - Ejemplos de salida incorrecta.

👉 Antes de proponer cambios definitivos, **analiza el código real del módulo**.

---

## Prompt optimizado (copiar y pegar)

```md
# Reparación y Optimización Dirigida – Módulo `custom_accounting_report` (Odoo 15)

## Rol
Actúa como **Arquitecto Senior de Odoo**, especialista en:
- Odoo 15 Community,
- Reportes contables,
- ORM y performance en PostgreSQL,
- QWeb PDF,
- Excel con `xlsxwriter`.

## Alcance ESTRICTO (NO VIOLAR)
- ❌ NO refactorizar todo el repositorio.
- ❌ NO cambiar otros módulos.
- ✅ Trabajar **solo** dentro del módulo:
  `custom_accounting_report`
- ✅ Modificar únicamente:
  - Wizard del reporte,
  - Métodos de obtención de datos,
  - Reporte PDF,
  - Reporte Excel.

## Paso previo obligatorio
1. Analiza el contenido real del módulo adjunto.
2. Identifica:
   - Wizard principal,
   - Método que construye el dataset,
   - Report action PDF,
   - Método Excel.
3. Indica si hay:
   - N+1 queries,
   - Loops con `search` repetidos,
   - Cálculos en QWeb,
   - Escritura Excel ineficiente.

Si faltan logs o tracebacks, declara los **supuestos técnicos**.

---

## Requerimientos técnicos

### 1. Optimización de lecturas (Odoo 15)
Optimizar **solo** el código del módulo usando enfoques válidos en Odoo 15.

#### Técnicas esperadas (sugerir código)
- Reemplazar múltiples `search()` por:
```python
records = self.env['account.move.line'].search(domain)
```

- Usar `read_group` para agregaciones:
```python
data = self.env['account.move.line'].read_group(
    domain,
    ['debit', 'credit', 'balance'],
    ['date:month']
)
```

- Evitar N+1:
```python
partners = records.mapped('partner_id')
```

- Precargar y luego filtrar en memoria **solo si el dominio es estable**.

Explica **por qué este enfoque es mejor en Odoo 15**.

---

### 2. Reparación del reporte PDF
Analizar el QWeb actual y corregir:

- Uso incorrecto de `docs`,
- Totales calculados en la vista,
- Errores por valores `None`.

#### Código sugerido (ejemplo)
```python
def _get_report_values(self, docids, data=None):
    return {
        'docs': data['lines'],
        'grouped': data['grouped'],
        'company': self.env.company,
    }
```

Mover cálculos **siempre a Python**, no a QWeb.

---

### 3. Reparación del reporte Excel
Optimizar el método Excel sin reescribir todo.

#### Código sugerido
```python
sheet.write_row(row, 0, [
    line['date'],
    line['partner'],
    line['amount'],
])
row += 1
```

- Reutilizar formatos,
- Evitar estilos dentro de loops,
- Escribir por filas, no celda por celda.

---

### 4. Wizard – mejoras puntuales (sin rediseño)
Modificar el wizard existente para:

#### Defaults
```python
show_products = fields.Boolean(default=True)
show_exempt = fields.Boolean(default=True)
```

#### Nuevas opciones
```python
group_by_month = fields.Boolean(string="Agrupar por mes")
year = fields.Integer(string="Año", required=False)
```

⚠️ No crear un wizard nuevo, **extender el existente**.

---

### 5. Agrupación por meses
Implementar agrupación **solo si el usuario la activa**.

#### Enfoque sugerido
- `read_group` con `date:month`, o
- Post-procesado controlado:

```python
from collections import defaultdict

grouped = defaultdict(list)
for line in lines:
    key = line['date'].strftime('%Y-%m')
    grouped[key].append(line)
```

---

## Entregable
Devuelve un único archivo `.md` con:
- Análisis del módulo `custom_accounting_report`,
- Evidencias reales encontradas en el código,
- Cambios propuestos **archivo por archivo**,
- Fragmentos de código sugeridos (NO refactor completo),
- Riesgos y validaciones.

---

## Checklist final
- [ ] Solo se modificó `custom_accounting_report`
- [ ] Menos queries a base de datos
- [ ] PDF sin cálculos en QWeb
- [ ] Excel optimizado
- [ ] Wizard con defaults correctos
- [ ] Agrupación mensual opcional
```

---

## Observaciones clave
- Este prompt **blinda el alcance**.
- Obliga a analizar el módulo real.
- Evita refactors peligrosos.
- Sugiere **código concreto**, no abstracto.
- Es 100 % compatible con Odoo 15.

---

## Pregunta obligatoria antes de ejecutar el prompt
¿Puedes compartir:
- El traceback del error PDF o Excel (si existe)?
- El tiempo actual vs esperado del reporte?
- Qué reporte falla más (PDF o Excel)?

Con eso el análisis será mucho más preciso.
