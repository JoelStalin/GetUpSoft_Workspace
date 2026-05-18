# Directory Rules

1. Si una carpeta representa una tarea técnica reutilizable automatizada, clasificar como `Worker`.
2. Si una carpeta representa una solución para cliente externo, clasificar como `Client Solution`.
3. Si una carpeta representa un producto propio de GetUpSoft, clasificar como `Product`.
4. Una `Client Solution` puede usar muchos `Workers`.
5. Un `Product` puede usar muchos `Workers`.
6. Un `Worker` no debe depender de una `Client Solution`.
7. Un `Worker` puede depender de `Shared Libraries`.
8. Un `Worker` puede tener adaptadores específicos de cliente, pero la lógica del cliente debe vivir fuera del worker genérico.
9. No mezclar credenciales ni configuraciones productivas dentro de workers.
10. Cada `Worker` debe tener contrato de entrada y salida documentado.
11. Cada `Product` debe tener `Product Card` antes de migración.
12. Cada `Client Solution` debe tener `Client Solution Card` antes de migración.
13. Cada migración de carpeta debe registrarse en `migration_manifest.md`.
14. No mover Odoo sin revisar `addon paths`, manifests, scripts, Docker y dependencias.
15. No mover carpetas grandes sin matriz de impacto documentada.
16. `EasyCount` es el nombre canónico del producto. Las carpetas `easycount-core/` y `Easycouting_Refactor/` pertenecen al mismo producto y deben consolidarse como `02_Products/EasyCount/` en migración futura. No tratar como productos separados.
[test]
