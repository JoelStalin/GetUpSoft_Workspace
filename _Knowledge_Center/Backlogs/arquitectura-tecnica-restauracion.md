# Arquitectura Técnica: Proyecto QR Tables & KDS

## 1. Visión General
El sistema se divide en tres componentes principales: el **Núcleo QR (SaaS)**, el **Módulo de Cocina (KDS)** y el **Odoo Bridge**. Esta separación permite que el producto sea vendible de forma independiente (sin Odoo) o integrado (con Odoo POS).

---

## 2. QR Tables (Core SaaS)
### Stack Tecnológico
- **Frontend (Cliente)**: Next.js + Tailwind CSS (PWA para acceso instantáneo vía QR).
- **Backend**: FastAPI (Python) por su alta velocidad y manejo asíncrono de pedidos.
- **Base de Datos**: PostgreSQL para transacciones financieras y estados de mesa.
- **Cache/Real-time**: Redis + WebSockets (Socket.io) para notificaciones instantáneas.

### Lógica de "Mesa Inteligente" y Cuentas Separadas
1. **Identificación**: Cada QR contiene una URL única con un `table_uuid`.
2. **Session Management**: Al escanear, el sistema detecta si hay una `TableSession` activa.
    - Si no existe: Se crea la sesión y el primer usuario es el "Admin de Mesa".
    - Si existe: El usuario se une a la sesión con un `client_uuid` único.
3. **Cuentas Individuales**: Cada pedido (`OrderLine`) se marca con el `client_uuid`. El sistema mantiene el balance individual y el balance total del grupo.
4. **Cierre de Cuenta**:
    - **Pago Separado**: El sistema genera N comprobantes basados en el consumo de cada `client_uuid`.
    - **Pago Único**: Se consolidan todas las líneas de la `TableSession` en un solo comprobante.

---

## 3. Módulo de Cocina (KDS)
### Funcionamiento
- **Interface**: Panel web optimizado para tablets de 10"+.
- **Ruteo de Platos**: Las órdenes se dividen por "Estaciones" (Parrilla, Fríos, Bar, etc.) basándose en la categoría del producto.
- **Gestión de Tiempos**: Cada plato inicia un cronómetro al entrar. El sistema alerta visualmente si un plato supera el "Tiempo de Preparación Promedio".
- **Interacción**: "Bump" táctil para mover platos de 'Pendiente' a 'En Preparación' y 'Listo'.

---

## 4. Integración con Odoo (The Bridge)
Para los clientes que ya usan Odoo (como Chefalitas), el sistema no duplica la base de datos, sino que actúa como un **Terminal Remoto**.

### Flujo de Integración
1. **Sincronización de Productos**: El sistema QR importa el catálogo de Odoo (nombres, precios, stock) vía API.
2. **Push de Órdenes**: Cuando se confirma un pedido en el QR, el "Bridge" crea una orden en `pos.order` en estado 'draft' o 'waiting'.
3. **Cierre en Caja**: El cajero en Odoo POS puede ver la mesa, ver los pagos realizados en el QR (si se integró pasarela) y cerrar la factura fiscal en Odoo para contabilidad.

---

## 5. Ventaja Comercial (Product-as-a-Service)
- **Standalone**: Se puede vender a un restaurante pequeño con su propia pasarela de pago (Stripe) y su propia impresora térmica.
- **Integrated**: Se vende como el complemento perfecto para Odoo, eliminando la necesidad de meseros tomando pedidos manualmente.
