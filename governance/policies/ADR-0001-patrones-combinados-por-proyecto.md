# ADR-0001: Arquitectura federada con patrones combinados por proyecto

**Estado:** Aceptado
**Fecha:** 2026-09-09
**Task:** G03 (plan tecnico integral GetUpSoft + ORCA)

## Contexto

GetUpSoft opera varios productos con necesidades y madurez muy distintas (ORCA/CareerAI en
desarrollo activo, Chefalitas y Galantes en produccion real, EasyCount con su propia stack
FastAPI ya funcionando, ERPs Odoo en multiples versiones activas simultaneamente). Forzar
un unico framework o patron arquitectonico sobre todos ellos reescribiria sistemas que ya
funcionan en produccion sin necesidad real, con alto riesgo de romperlos.

## Decision

Se adopta una **arquitectura federada de proyectos independientes**, coordinada por un
bootstrap corporativo declarativo (ver `tools/workspace-cli/`). Cada proyecto conserva el
patron arquitectonico mas adecuado a su funcion real (registrado en
`governance/registry/projects/<slug>.json`, generado por G03 desde el inventario real de
G01 — no desde supuestos). ORCA coordina conocimiento y automatizacion via contratos; no
absorbe las bases de datos ni la logica interna de los demas productos.

## Consecuencias

- La migracion de ORCA hacia NestJS/hexagonal **no implica** reescribir EasyCount, Odoo ni
  ningun otro sistema Python — se conservan tal cual estan.
- Cada proyecto mantiene su propia autoridad de despliegue (`deploymentAuthority`); el
  workspace corporativo no despliega directamente a produccion de un cliente.
- El catalogo (`governance/registry/projects/`) es la fuente de verdad de "quien es dueno
  de que" — antes de mover o tocar cualquier directorio, se consulta ese catalogo.
- Verificado contra G01 (real, no supuesto): de 18 productos catalogados, solo 1 es
  actualmente un checkout Git independiente con remoto propio dentro de este arbol
  (`temp-deploy-clone` -> `Galantesjewerly.git`). El resto vive mezclado en el workspace
  monolitico actual — la conciliacion de fuente canonica por proyecto es trabajo de G02,
  no de este ADR, y se hara producto por producto, nunca en bloque.

## Alternativas descartadas

- **Monorepo unico con un solo framework:** descartado — forzaria reescribir Odoo/Chefalitas/
  EasyCount sin beneficio real, contradice la instruccion explicita de no romper productos
  activos como CareerAI.
- **Migracion big-bang de directorios:** descartada — el propio diseno original la prohibe
  explicitamente (seccion 2.2: "No se eliminara automaticamente ningun original"); la
  reorganizacion de rutas (R01/R02) es una wave tardia del plan, posterior a que el bootstrap
  y las pruebas de regresion por producto existan.

## Referencias

- `governance/migration/inventory/workspace-inventory.json` (G01)
- `governance/registry/projects/*.json` (G03, este ADR)
- Documento original del usuario: "Diseño técnico integral de GetUpSoft Workspace y ORCA",
  seccion 1.2 (tabla de patron por proyecto) y seccion 5.1 (secuencia G01→P02).
