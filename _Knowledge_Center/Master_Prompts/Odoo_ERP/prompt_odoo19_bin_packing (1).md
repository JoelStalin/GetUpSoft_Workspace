

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
