# Worker-First Architecture

## 1. Qué significa worker-first en GetUpSoft Workspace

Un workspace worker-first significa que la lógica técnica reutilizable se extrae en componentes autónomos (`workers`) con contratos explícitos antes de ser embebida en productos o soluciones de clientes. Esto reduce acoplamiento, facilita reutilización y permite que múltiples productos y client solutions compartan la misma lógica.

## 2. Diferencia entre dominios

| Dominio | Descripción |
|---|---|
| Product | Producto propio de GetUpSoft con usuarios finales definidos |
| Client Solution | Solución construida por GetUpSoft para un cliente externo específico |
| Worker | Componente técnico autónomo con contrato explícito |
| Shared Library | Código reutilizable sin ejecución propia |
| Infrastructure | Redes, servidores, Cloudflare, Docker, VPN |
| ERP/Odoo | Módulos, versiones y customizaciones del ERP |
| Knowledge Center | Prompts, memoria, arquitectura, decisiones |

## 3. Flujo recomendado

```text
Client Solution / Product
  -> Worker Contract (define entrada, salida, retry, logs)
  -> Worker Runtime (ejecuta la tarea)
  -> Logs / Audit (registra resultado)
  -> Result (retorna a consumer)
```

## 4. Patrones recomendados

- Worker Pattern
- Adapter Pattern
- Strategy Pattern
- Command Pattern
- Queue Consumer Pattern
- Scheduler Pattern
- Idempotency Key Pattern
- Retry with Backoff
- Dead Letter Queue
- Hexagonal Architecture
- Clean Architecture
- Repository Pattern
- Policy Gate Pattern
- Circuit Breaker Pattern
- Outbox Pattern
- Saga Pattern

## 5. Anti-patrones a evitar

- Código de cliente dentro de worker genérico
- Workers sin logs
- Workers sin idempotencia
- Workers que dependen de la UI
- Workers con secretos embebidos
- Workers que escriben en producción sin modo dry-run
- Mezcla de vendor code con código propio
- Carpetas con nombres ambiguos o duplicados
- Duplicar workers por cliente sin extraer lógica reutilizable
- Usar prompts como documentación única sin contrato técnico
- Mantener dos carpetas del mismo producto sin unificar su nombre canónico

## 6. Ejemplo de unificación de producto (EasyCount)

EasyCount y EasyCounting son el mismo producto. El nombre canónico es `EasyCount`. La existencia de dos carpetas separadas (`easycount-core/` y `Easycouting_Refactor/`) es deuda arquitectónica y debe resolverse consolidando ambas en `02_Products/EasyCount/` en una migración controlada, previa auditoría de dependencias.

## 7. Ejemplos del workspace

- `EasyCount` puede consumir workers como `e-CF worker`, `Odoo sync worker`, `document generation worker` y `reporting worker`.
- `GalantesJewelry` y `ChefAlitas` deben consumir workers reutilizables, pero su lógica específica de cliente debe seguir fuera del worker genérico.
- `local_printer_agent` es un caso claro donde hoy existe mezcla entre runtime reusable y acoplamiento a una client solution.
