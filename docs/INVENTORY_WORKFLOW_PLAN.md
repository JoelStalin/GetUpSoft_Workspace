# Plan de Ejecución: Sincronización Completa de Inventario Galantes Jewelry ➔ Odoo Producción

Este documento detalla la auditoría, limpieza de inventario en producción y publicación del catálogo sincronizado mediante los **10 nodos del pipeline de Orca**, garantizando cero errores, trazabilidad en Google Sheets y evidencias E2E.

---

## 🏗️ Nodos del Workflow de Orca (Trazabilidad 100%)

1. **Nodo 1: Captura de Imágenes (`drive:scan`, `drive:download`)**
   - Descarga e ingesta incremental desde el lote de Google Drive (`1JzM1wpBtvM8ILEnYu0t5qBtG8pMYh`).
   - Conversión automática de formatos HEIC/PNG a JPEG/WebP optimizados.

2. **Nodo 2: Identificación del Objeto (`vision:yolo-classify`)**
   - Detección de piezas de joyería aislando fondo y clasificando coordenadas mediante el modelo `yolov8n.pt`.

3. **Nodo 3: Clasificación del Producto (`image:features`)**
   - Extracción de características vectoriales de color, bordes y hashes perceptuales (`dhash`).

4. **Nodo 4: Categorización (`product:cluster`, `review:seed-estimates`)**
   - Agrupamiento en categorías estándar (bridal, cadenas, anillos, dijes, pulseras, custom).

5. **Nodo 5: Edición de Imágenes (`image:enhance`)**
   - Optimización visual, ajuste de brillo/contraste y normalización de fondo usando Nano Banana / Local Enhancer.

6. **Nodo 6: Generación de Descripción (`description:generate`, `gemini:product-metadata`)**
   - Generación de descripciones de producto enriquecidas en español con detalles de material y estilo.

7. **Nodo 7: Armado del Carrusel de Imágenes (`cluster:review`, `build-gallery-ready-manifest.mjs`)**
   - Agrupación de todas las imágenes pertenecientes al **mismo producto físico** (`sameProduct: true`).
   - Generación de `gallery-ready-products.json` (51 productos multi-imagen con 134 fotos de galería).

8. **Nodo 8: Registro de Parámetros (`review:sheet-export`, `review:export`)**
   - Registro de parámetros de cada producto en la hoja de control (`review-queue.csv` y Google Sheets) con trazabilidad de precios, costo y stock.

9. **Nodo 9: Validación DTO para Odoo Producción (`odoo:dry-run`, `odoo-dto.mjs`)**
   - Validación estricta con `ProductPublicationDTO` contra el esquema ORM de Odoo (`product.template` y `product.product`).
   - Eliminación de prefijos basura como `Product 008` vía `cleanProductName`.

10. **Nodo 10: Publicación a Producción & Verificación QA (`odoo:publish`, `qa:selenium-profile9`)**
    - Purga e ingesta limpia en la base de datos de producción (`galantes_prod`).
    - Verificación proactiva E2E en `https://galantesjewelry.com/shop` con Selenium (Perfil 9) y capturas de pantalla de evidencia.

---

## 📋 Fases del Plan de Ejecución

### Fase 1: Limpieza del Inventario en Producción
- [x] Ejecutar copia de seguridad de predepliegue (`pg_dump`) en `galantes-prod-vm`.
- [x] Limpiar registros huérfanos o duplicados en la base de datos `galantes_prod`.

### Fase 2: Ejecución del Pipeline Orca & Manifiesto Listo
- [x] Ejecutar la revisión de 1,131 clusters (1,063 de imagen única y 68 multi-imagen).
- [x] Generar el manifiesto de carruseles `data/inventory-agent/manifests/gallery-ready-products.json`.
- [x] Ejecutar `odoo:dry-run` para validar 1,131 productos contra `ProductPublicationDTO` (0 errores).

### Fase 3: Exportación de Parámetros a Sheets
- [x] Actualizar `review-queue.csv` y generar exportación estructurada de parámetros (`review:sheet-export`).

### Fase 4: Despliegue & Evidencia Selenium E2E
- [ ] Ejecutar la sincronización limpia a la base de datos de producción Odoo.
- [ ] Ejecutar script de pruebas Selenium (`verify_production_image_console_profile9.py`) en `https://galantesjewelry.com/shop`.
- [ ] Capturar y guardar evidencias visuales de la tienda con la barra de navegación a la izquierda y carruseles activos.
