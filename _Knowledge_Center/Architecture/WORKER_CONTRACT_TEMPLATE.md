# Worker Contract — <Worker Name>

## Classification
ai_worker | odoo_worker | payment_worker | notification_worker | scraping_worker | sync_worker | document_worker | reporting_worker | infrastructure_worker | printer_worker | data_migration_worker | network_worker

## Purpose
<Qué tarea específica ejecuta este worker>

## Trigger
cron | queue | webhook | cli | api | event | manual | scheduler

## Input contract
<Esquema de entrada esperado: parámetros, tipos, validaciones>

## Output contract
<Salida esperada: schema, archivo, cambio en DB, mensaje, side effect>

## Idempotency
<Cómo se maneja la ejecución duplicada>

## Retry policy
<Número de reintentos, backoff, comportamiento dead-letter>

## Error handling
<Errores esperados y cómo se reportan>

## Logging and audit
<Destino de logs y qué debe registrarse obligatoriamente>

## Dependencies
<Dependencias internas y externas>

## Secrets policy
No secrets committed. Use environment variables or vault references.

## Security boundaries
<Qué puede y qué no puede acceder este worker>

## Consumers
<Products / Client Solutions que usan este worker>

## Tests
<Expectativas de unit / integration / e2e>

## Deployment
<local | Docker | Odoo cron | n8n | VPS | Cloudflare Worker | etc.>
