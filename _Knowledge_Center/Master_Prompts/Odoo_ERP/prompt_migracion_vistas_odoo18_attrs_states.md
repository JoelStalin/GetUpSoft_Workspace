# Prompt – Migrar vistas de `attrs`/`states` a Odoo 18  
(error: “Since 17.0, the *attrs* and *states* attributes are no longer used”)

> **Contexto real del error**  
> Odoo 18 lanza (mensaje heredado del cambio introducido en 17.0):  
> `odoo.tools.convert.ParseError: while parsing /mnt/extra-addons/extra/api_views/views/delivery_stock_picking_batch/stock_picking_views.xml:3  
> Since 17.0, the "attrs" and "states" attributes are no longer used.  
> View: stock.picking.form.batch.report in api_views/views/delivery_stock_picking_batch/stock_picking_views.xml`

---

## 1. Rol que debes adoptar

Actúa como **desarrollador/a senior de Odoo especializado en migraciones de vistas a Odoo 18**.  
Tu objetivo es **eliminar el uso de `attrs` y `states` en XML** y reemplazarlos por la nueva sintaxis de Odoo 18, **sin cambiar la lógica funcional**.

---

## 2. Código y repositorio a considerar

- El código está en el repositorio:  
  `https://github.com/DevJoelStalin/cell_odoo`  
  Rama: `test`  
- El error se produce en el módulo extra:  
  - Ruta en el servidor: `/mnt/extra-addons/extra/api_views/`  
  - Vista problemática (al menos): `views/delivery_stock_picking_batch/stock_picking_views.xml`  
  - Vista: `stock.picking.form.batch.report`

> Si tienes acceso directo al repo (GitHub o copia local), úsalo para buscar **todas** las vistas que aún usen `attrs` o `states`.  
> Si no tienes acceso al repo, trabaja con el/los fichero(s) XML que te pegue el usuario.

---

## 3. Regla técnica clave en Odoo 18

En Odoo 18 (cambio introducido a partir de 17.0):

- **Ya no se permite el atributo `attrs` en vistas XML.**
- **Ya no se usa `states` en vistas XML para controlar visibilidad/readonly/etc.**  
- Los modificadores se definen **directamente** en los atributos `invisible`, `readonly`, `required`, `column_invisible`, etc., usando **expresiones evaluables (tipo Python)** que el cliente web entiende.

Ejemplo conceptual típico de migración:

Antes (Odoo 16):

```xml
<field name="demo"
       attrs="{'invisible': [('state', '!=', 'draft')], 'readonly': [('state', '=', 'done')]}"/>
```

Después (Odoo 18):

```xml
<field name="demo"
       invisible="state != 'draft'"
       readonly="state == 'done'"/>
```

Otro ejemplo (cuando antes se usaba `states`):

Antes:

```xml
<field name="field_b" states="draft"/>
```

Después:

```xml
<field name="field_b" invisible="state != 'draft'"/>
```

---

## 4. Reglas de transformación que debes aplicar

### 4.1. Sustitución de `attrs` en vistas XML

Para cada nodo que tenga `attrs="..."`:

1. **Identifica las claves del diccionario `attrs`**:
   - `invisible`
   - `readonly`
   - `required`
   - (y en vistas tree, posibles casos relacionados con columnas, p. ej. `column_invisible`)

2. **Transforma cada entrada de `attrs` a atributos directos**:

   - `attrs="{'invisible': [('state', '!=', 'draft')]}"`  
     → `invisible="state != 'draft'"`

   - `attrs="{'readonly': [('state', 'in', ['done', 'cancel'])]}"`  
     → `readonly="state in ['done', 'cancel']"`

   - Si hay varias condiciones en dominio:
     - Operadores:
       - `&` → `and`
       - `|` → `or`
       - `!` → `not`
     - Ejemplo:  
       `attrs="{'invisible': ['|', ('state', '=', 'done'), ('state', '=', 'cancel')]}"`  
       → `invisible="state == 'done' or state == 'cancel'"`

3. **Si ya existe un atributo directo (p. ej. `readonly="..."`)**:
   - Combina lo que estaba en `attrs` con lo que ya había usando `and` / `or`, manteniendo la lógica original.
   - No simplifiques la condición si no estás 100% seguro de la equivalencia.

4. **Elimina por completo el atributo `attrs`** una vez migradas sus condiciones.

---

### 4.2. Sustitución de `states` en vistas XML

Para cualquier nodo con `states="..."` en la vista:

1. Interpreta `states="draft,done"` como “este elemento sólo está activo/visible en esos estados”.
2. Convierte eso en condiciones explícitas usando `invisible`, `readonly` o el modificador que corresponda:

   - Botones que antes dependían de `states`:
     - Antes: `<button ... states="draft"/>`  
     - Después (visible sólo en borrador): `invisible="state != 'draft'"`

   - Páginas/pestañas:
     - Antes: `<page string="X" states="draft,done"/>`  
     - Después: `invisible="state not in ['draft', 'done']"`

3. Si el nodo ya tiene un `invisible` o `readonly`, **combina** las condiciones con `and` / `or` sin perder la lógica previa.

---

### 4.3. Vistas tipo tree (lista): `invisible` vs `column_invisible`

En Odoo 18:

- `invisible="..."` en un `<field>` de una vista tree **oculta la celda**, no necesariamente la columna completa.
- Para ocultar **la columna completa**, se debe usar `column_invisible="..."`.

Regla:

- Si el comportamiento original de `attrs` hacía que una columna completa desapareciera, migra a:
  - `column_invisible="expresión"`  
  y no a `invisible`, salvo que explícitamente sólo se quisiera ocultar algunas celdas.

---

## 5. Criterios arquitectónicos que debes respetar

Integra estas buenas prácticas mientras haces la migración:

1. **No alteres la lógica de negocio en Python salvo que el error lo exija.**  
   La corrección debe ser **principalmente de vistas XML**.
2. **Respeta el ORM de Odoo en todo momento.**  
   No introduzcas SQL directo ni cambios estructurales de modelos que no sean imprescindibles.
3. **Respeta el patrón MVC de Odoo**:  
   - La lógica de negocio en modelos/controladores.  
   - Las vistas sólo con lógica declarativa (modificadores `readonly`, `invisible`, etc.).
4. **Compatibilidad de datos y permisos**:  
   No modifiques ACLs ni reglas de registro desde estas vistas.
5. **Cambios mínimos y reversibles**:  
   Haz cambios localizados sólo donde sea necesario para eliminar `attrs`/`states`.
6. **Legibilidad del código**:  
   Prefiere expresiones claras (`state == 'done'`, `state in [...]`, etc.) frente a condiciones demasiado compactas.

---

## 6. Flujo de trabajo que debes seguir

1. **Localizar vistas afectadas**
   - Buscar en el proyecto todas las ocurrencias de:
     - `attrs="`
     - ` states="`
   - Priorizar:
     - `api_views/views/delivery_stock_picking_batch/stock_picking_views.xml`
     - Cualquier otra vista relacionada con `stock.picking.batch`, `delivery` o `stock` que pueda causar errores similares.

2. **Analizar cada `attrs` / `states`**
   - Para cada caso:
     - Determinar la intención funcional.
     - Identificar si controla visibilidad, readonly o required.
     - Ver si hay condicionantes adicionales (contexto, campos relacionados, etc.).

3. **Proponer la migración**
   - Para cada fragmento de vista:
     - Muestra el bloque **ANTES** y **DESPUÉS** de la migración.
     - Explica brevemente qué hiciste (1–3 frases).

4. **Aplicar cambios de forma consistente**
   - Una vez definidas las reglas de transformación con 2–3 ejemplos, aplícalas al resto de vistas sin romper la coherencia.

5. **Validación lógica (a nivel de análisis estático)**
   - Verifica que:
     - Cada antiguo `attrs` tiene una traducción 1:1 a atributos directos.
     - Cada `states` tiene una condición equivalente en `invisible` / `readonly` / `required`.
     - No quedan restos de `attrs` ni `states` en XML.

6. **Entrega de resultados**
   - Entrega tu respuesta en este formato:

     1. **Resumen de la estrategia aplicada** (lista corta de puntos).
     2. **Tabla o lista de vistas afectadas**:
        - Nombre de vista (`<record id="..." model="ir.ui.view">`)
        - Ruta del fichero
     3. **Bloques XML migrados**:
        - `ANTES:` (código original)
        - `DESPUÉS:` (código nuevo compatible con Odoo 18)
     4. **Checklist final**:
        - Confirmación de que no quedan `attrs` ni `states` en XML.
        - Notas sobre cualquier caso especial (p. ej. uso de `column_invisible` en tree views).

---

## 7. Qué te voy a proporcionar yo (usuario)

Asume lo siguiente:

- Te daré:
  - Fragmentos de XML de las vistas que fallan **o**
  - El contenido completo del fichero `stock_picking_views.xml` y otros afectados.
- Tu tarea será:
  - Reescribir esos fragmentos de XML usando las reglas anteriores.
  - Devolverme fragmentos listos para pegar en el módulo Odoo 18.

Cuando estés listo, empieza por la vista:

- `stock.picking.form.batch.report` en `api_views/views/delivery_stock_picking_batch/stock_picking_views.xml`.
