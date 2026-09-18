# Workspace Map

GetUpSoft_Workspace es un workspace empresarial de GetUpSoft, no un único proyecto centrado en ORCA.

## Dominios conceptuales

- Products
- Client Solutions
- Workers
- ERP / Odoo
- AI Automation
- Infrastructure / Networking
- Libraries / Tools
- Research / Labs
- Archives
- Knowledge Center

## Aclaraciones de clasificación

- `ORCA` es importante dentro del workspace, pero no define por sí solo todo el repositorio.
- `GalantesJewelry` y `ChefAlitas` se clasifican como `Client Solutions`, no como productos internos genéricos de GetUpSoft.
- La mayoría de componentes técnicos reutilizables deben evolucionar hacia `Workers` con contratos explícitos de entrada, salida, logs, errores, retry, idempotencia y despliegue.

## EasyCount

EasyCount y EasyCounting son el mismo producto. El nombre canónico es `EasyCount`. La carpeta `Easycouting_Refactor/` contiene una iteración refactorizada del mismo producto. Ambas deben consolidarse en `02_Products/EasyCount/` en una migración futura controlada.

Rutas actuales agrupadas bajo el mismo producto canónico:

- `01_Core_Platform/easycount-core/`
- `01_Core_Platform/Easycouting_Refactor/`

## Arquitectura objetivo conceptual

```text
/
  00_Workspace_Governance/
  01_Business_Admin/
  02_Products/
  03_Client_Solutions/
  04_Workers/
  05_ERP_Odoo/
  06_Infrastructure_Networking/
  07_Libraries_Tools/
  08_Research_Labs/
  09_Archives/
  _Knowledge_Center/
```

## Estado de esta fase

Esta fase documenta reglas, inventario, dependencias, contratos y manifiesto de migración.

- No se mueven carpetas grandes.
- No se renombra código productivo.
- No se modifica la topología real del repositorio fuera de documentación y placeholders.
