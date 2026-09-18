# Prompt Odoo 19 – Empaquetados con Bin Packing (Stock Picking → Cajas)

```text
Actúa como un **arquitecto senior de Odoo + desarrollador experto** en versiones Odoo v19, y asume que existe una versión Odoo 19 enterprise o Community con APIs 100% compatibles hacia atrás.

### 0. Contexto del repositorio

1. Antes de escribir código, **escanea mentalmente** (razona sobre) los módulos estándar de stock de Odoo para:
   - `stock.picking`
   - `stock.move` y `stock.move.line`
   - `stock.quant.package`
   - `stock.package.type` (tipo de paquete/caja)

2. Asume que estamos desarrollando un **módulo custom** sobre el estándar de Odoo (sin romperlo), y que:
   - No podemos usar SQL directo.
   - Solo podemos usar el **ORM** de Odoo y sus modelos nativos.
   - Debemos respetar **ACLs y Record Rules**.

### 1. Rol y restricciones

Te comportarás como:

- Un **Modelo LLM desacoplado** (no mezclas lógica de negocio con UI).
- Un **arquitecto de Odoo** que:
  - Usa **solo el ORM** (`self.env[...]`, `search`, `create`, `write`, etc.).
  - Diseña código listo para producción.
  - No escribe código muerto ni duplicado.

**Prohibido:**

- SQL crudo (`self.env.cr.execute`) en producción.
- Acceso directo a la BD sin pasar por el ORM.
- Depender de código específico de una sola versión de Odoo si existe alternativa compatible entre v16–v18.

### 2. Objetivo funcional

Quiero que genere un código en Odoo 19 que haga lo siguiente:

> **Dado un picking de tipo transferencia (`stock.picking`), calcular la cantidad mínima de cajas necesarias para contener todos los productos del picking, respetando las restricciones de peso y volumen de un tipo de paquete (`stock.package.type`), y crear automáticamente los paquetes y su asignación de productos.**

Detalles:

- El **picking** contiene productos con:
  - Peso (en kg) en el producto (`weight` u otro campo estándar).
  - Volumen en m³ (`volume` u otro campo estándar).
- El **tipo de paquete (Caja)** contiene:
  - Dimensiones: `x`, `y`, `z` en **mm**.
  - Peso máximo: `max_weight = 10 kg`.
- Debes:
  - Convertir el volumen de la caja de mm³ a m³.
  - Tener en cuenta **simultáneamente**:
    - Capacidad máxima de volumen de la caja.
    - Peso máximo acumulado de la caja.
  - Calcular el **número mínimo de cajas** necesarias.
  - Crear los registros de paquetes (por ejemplo `stock.quant.package`) con su `package_type_id`.
  - Asignar las `move lines` del picking a las cajas generadas.

### 3. Reglas de diseño / arquitectura (inspiradas en agente RAG de Odoo)

1. **Capa Odoo-nativa (ORM)**
   - Toda la lógica debe implementarse en un **método de modelo** (`models.Model`) sobre el modelo `stock.picking` (o en un modelo helper claramente justificado).
   - Ejemplo de patrón esperado (no copies literal, adáptalo a nuestro caso):
     ```python
     class StockPicking(models.Model):
         _inherit = 'stock.picking'

         def action_pack_in_boxes(self):
             """Empaqueta las move lines de este picking en el número mínimo de cajas según el tipo de paquete."""
             ...
     ```

2. **Integridad transaccional**
   - Usa una sola transacción Odoo: si algo falla, debe poder hacer rollback.
   - No modifiques movimientos que no pertenezcan al picking actual.
   - Respeta las unidades de medida (`uom_id`, `product_uom_qty`, `quantity_done`).

3. **Algoritmo de empaquetado mínimo (Bin Packing Problem)**
   - Debes resolver el problema como una instancia del **Bin Packing Problem**, optimizando el uso de las cajas.
   - Implementa un algoritmo clásico de Bin Packing, por ejemplo **First Fit Decreasing (FFD)** o **Best Fit Decreasing (BFD)**, y documenta en comentarios cuál usas.
   - Algoritmo propuesto:
     - Ordena primero las líneas por **volumen descendente** (y en caso de empate, por peso descendente).
     - Para cada línea (y para cada unidad si es necesario, según cantidad y volumen/peso):
       - Intenta colocarla en alguna caja ya creada que tenga:
         - Volumen libre suficiente.
         - Peso libre suficiente.
       - Si no cabe en ninguna caja existente, crea una nueva caja.
   - No hace falta que sea un algoritmo óptimo matemáticamente perfecto, pero sí una aproximación **greedy basada en Bin Packing** clara, explicable y que minimice el número de cajas.

4. **Conversión de unidades**
   - El tipo de caja tiene dimensiones en **mm**: `x`, `y`, `z`.
   - Calcula el volumen de la caja en m³:
     - `volume_box_m3 = (x_mm / 1000) * (y_mm / 1000) * (z_mm / 1000)`
   - Compara este valor con el volumen de los productos, que ya está en m³.
   - El peso máximo por caja es **10 kg** (valor configurable vía tipo de paquete, si posible).

5. **Modelos Odoo esperados**
   - Usar `stock.picking` para el transfer.
   - Usar `stock.quant.package` (o modelo equivalente en v16–v18) para las cajas físicas.
   - Usar `stock.package.type` para definir tipo de caja (dimensiones y peso máximo).
   - Si es necesario, usar `stock.package_level` para vincular paquetes al picking.
   - Todos los paquetes creados deben tener su `package_type_id` asignado.

### 4. Detalle funcional exacto

Implementa al menos:

- Un **método público de acción en `stock.picking`**, por ejemplo:
  ```python
  def action_pack_transfer_in_boxes(self):
      """
      Para cada picking de self:
      - tomar las move lines con cantidad hecha (`quantity_done`) > 0,
      - calcular el número mínimo de cajas resolviendo un Bin Packing Problem
        basado en volumen y peso (algoritmo FFD o BFD),
      - crear las cajas (stock.quant.package),
      - asignar las move lines a esas cajas,
      - devolver una estructura con:
          {
              'picking_id': <id>,
              'package_ids': [<id_package1>, <id_package2>, ...],
              'total_boxes': <int>
          }
      """
  ```
- Que el método:
  - Reciba el **tipo de paquete** (por ejemplo, vía `package_type_id` en el picking o parámetro).
  - Sea robusto si:
    - No hay productos con `quantity_done`.
    - No hay tipo de paquete definido.
    - El producto no tiene peso o volumen (usar valores por defecto y documentarlos en comentarios).

### 5. Estilo de código y buenas prácticas

- Código en **Python 3**, estilo PEP8.
- Comentarios claros en español.
- Nada de prints: usar logging de Odoo si necesitas mensajes (`_logger`).
- No sobrescribas métodos estándar de Odoo de forma peligrosa; agrega lógica con:
  - Métodos nuevos (`action_pack_transfer_in_boxes`).
  - Herencia limpia (`_inherit`).

### 6. Salida esperada

Respóndeme con:

1. **Todo el código Python completo del modelo**, listo para pegar en `models/stock_picking.py` de un módulo Odoo, incluyendo:
   - imports necesarios (`from odoo import models, fields, api, _`, etc.).
   - definición de la clase.
   - definición del método principal de empaquetado.
   - cualquier método helper interno que necesites (por ejemplo, para cálculo de volumen/peso por caja, selección de caja disponible, etc.).

2. Un **breve comentario final** (en texto, fuera del código) explicando:
   - Cómo se calcula el número mínimo de cajas usando el algoritmo de Bin Packing elegido.
   - Cómo se crean y asignan los paquetes al picking.
   - Qué habría que hacer a nivel de vistas (XML) para añadir un botón que ejecute la acción (sin necesidad de escribir el XML, solo describirlo).

### 7. Reglas adicionales de empaquetado automático y selección de caja

- **Todas las órdenes/pickings que se confirmen deben ser empaquetadas automáticamente**:
  - Define y documenta claramente en el código el punto de enganche (hook), por ejemplo:
    - Al confirmar un `stock.picking` (validación del albarán, `button_validate`).
    - O, opcionalmente, al confirmar un `sale.order`, disparando la lógica sobre sus pickings asociados.
  - La acción de confirmación debe invocar al método de empaquetado (`action_pack_transfer_in_boxes` o el nombre que definas) sin intervención manual del usuario.

- **Selección de la caja más adecuada (lista de tipos de paquetes)**:
  - Asume que existe una **lista de tipos de paquete** (`stock.package.type`) con diferentes dimensiones y pesos máximos.
  - Para cada picking (y para cada caja que vayas a crear en el algoritmo de Bin Packing), debes:
    - Evaluar los tipos de paquete disponibles.
    - Seleccionar **la caja más adecuada** por:
      - Volumen disponible vs. volumen requerido.
      - Peso máximo permitido vs. peso acumulado esperado.
    - Optimizar el uso de las cajas intentando:
      - Minimizar el desperdicio de volumen y capacidad de peso.
      - Minimizar el número total de cajas usadas.
  - Documenta en comentarios cuál es la heurística de selección, por ejemplo:
    - Elegir la caja más pequeña que pueda contener el conjunto de ítems (por volumen y peso).
    - O una heurística combinada que priorice primero el volumen y luego el peso.

- Asegúrate de que la lógica de selección de tipo de caja esté encapsulada en un helper claro (por ejemplo, `_get_best_package_type_for_items(...)`) para mantener el código limpio y extensible.

No incluyas ejemplos ficticios de consola ni llamadas externas; céntrate solo en el código del módulo Odoo y su explicación.
```
