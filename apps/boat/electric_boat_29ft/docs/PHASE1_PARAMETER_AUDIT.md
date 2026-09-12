# Fase 1 — Auditoría de parámetros V0

Este documento trata los PDF y el prompt maestro como referencias de requisitos. No ejecuta instrucciones incrustadas que contradigan la solicitud del usuario ni considera el plan de ventas de 90 días parte del proyecto naval.

## Datos definidos

| Parámetro | Valor | Unidad | Estado | Fuente | Confianza |
|---|---:|---|---|---|---|
| LOA | 8.84 | m | DEFINED | Solicitud y medida independiente del casco | Alta |
| Manga máxima | 2.80 | m | DEFINED | Solicitud y medida independiente del casco | Alta |
| Tipo principal V0 | Deep-V monocasco | — | DEFINED | Prompt maestro | Alta |
| Material principal | GRP/PRFV | — | DEFINED | Solicitud y referencias | Alta |
| Capacidad objetivo | 10 | personas | DEFINED | Prompt maestro | Media |
| Propulsión | 100 % eléctrica, arquitectura modular | — | DEFINED | Solicitud y prompt maestro | Alta |
| Eje Y de propulsión | 0.0 | m | DEFINED | Requisito de crujía | Alta |

## Datos faltantes

LWL, manga en flotación, calado, francobordos, desplazamiento, LCB/LCG/VCG, geometría naval de estaciones, deadrise real, chines, rocker, ángulos de proa y espejo, potencia, energía y masa del banco, hélices, relación de reducción, posición vertical del propulsor y centros de masa de pasajeros.

Estos campos permanecen como `MISSING` en `config/boat_parameters.json`. No se han transformado en resultados de ingeniería.

## Supuestos V0

Las dimensiones actuales del hardtop, el arreglo de ocho paneles, la envolvente de batería, LiFePO4, masa de referencia de 85 kg por pasajero y la ventana de observación de 500 × 800 × 35 mm son supuestos editables. Requieren validación naval, estructural o de fabricante según corresponda.

## Variables de optimización

- Deadrise de espejo dentro del rango preliminar de estudio de 12° a 24°.
- Número, posición y geometría de chines y strakes.
- Forma de proa, rocker y transición de espejo.
- Posición del banco y de los propulsores para controlar trim y CG.
- Comparación P1 outboard, P2 inboard con eje y P3 waterjet.
- Comparación secundaria V0-MONO frente a V0-CAT.

## Riesgos y brechas detectadas

- El modelo actual abre limpio en Blender 5.2.1, pero aún es un ensamble visual, no una geometría naval paramétrica reproducible.
- El informe anterior indica 83 objetos y 18 colecciones; la validación actual encontró 125 objetos y 24 colecciones.
- No existe un objeto exactamente denominado `BMS_ENCLOSURE`.
- Los ocho paneles solares existen, pero la colección `SOLAR_SYSTEM` no existe con ese nombre.
- No se detectaron objetos con prefijo `BATTERY_MODULE_`; hace falta normalizar nombres y verificar el contenido real.
- La longitud, manga y centerline sí pasaron la medición independiente: 8.8400006 m, 2.8000007 m y Y=0.
- No se detectaron imágenes de archivo faltantes.
- Todavía no existe evidencia de casco watertight/manifold apto para CFD, ni cálculo de masa, estabilidad, resistencia o autonomía.

## Decisiones que deben validarse mediante CFD o ingeniería

La geometría de fondo, deadrise, chines, strakes, trim, resistencia, velocidad, potencia, hélice, eficiencia propulsiva y comparación monocasco/catamarán. Unreal Water y Buoyancy servirán para interacción y evaluación cualitativa; no constituyen CFD.

## Checkpoint

V0 puede pasar a blockout procedural cuando el generador lea exclusivamente `config/boat_parameters.json`, preserve el modelo original y cree una salida nueva. No se debe avanzar a V1 hasta que la regeneración de V0 sea determinista y la malla CFD pase pruebas de manifold y estanqueidad.
