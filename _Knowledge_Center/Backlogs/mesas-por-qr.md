# Backlog: Proyecto Mesas por QR (QR Tables)

## Descripción
Sistema independiente de gestión de pedidos y cuentas por mesa mediante códigos QR. El sistema debe ser capaz de identificar la mesa automáticamente, gestionar cuentas individuales por cliente en una misma mesa y permitir pagos flexibles.

## Requerimientos Técnicos
- **Independencia de Odoo**: El núcleo del sistema debe funcionar de forma autónoma (SaaS o On-premise).
- **Integración con Odoo POS**: Sincronización perfecta de ventas y stock con el Punto de Venta de Odoo cuando sea necesario.
- **Identificación QR**: Cada mesa tiene un QR único que identifica la posición del cliente automáticamente.

## Historias de Usuario / Funcionalidades
- [ ] **QR-1: Identificación y Apertura**: El cliente escanea el QR y el sistema abre una cuenta vinculada a la mesa #X.
- [ ] **QR-2: Cuentas Individuales**: Cada cliente que escanea en la mesa puede abrir su propia "sub-cuenta" o unirse a la cuenta de la mesa.
- [ ] **QR-3: Gestión de Pedidos**: Los clientes pueden pedir desde su móvil y los pedidos se agrupan por mesa (y por cliente si aplica).
- [ ] **QR-4: Flexibilidad en el Pago**:
    - Opción de solicitar una sola cuenta para toda la mesa.
    - Opción de pagar por separado (cada cliente su consumo).
- [ ] **QR-5: Integración POS**: Botón de "Sincronizar con Odoo POS" para que el cajero pueda ver y cerrar la venta en Odoo.

## Modelo de Negocio
Producto diseñado para ser vendido como solución independiente a otros restaurantes.
