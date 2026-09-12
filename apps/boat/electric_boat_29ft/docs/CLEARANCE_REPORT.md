# Reporte de Análsis de Holguras e Interferencias (`docs/CLEARANCE_REPORT.md`)

## Verificación de Parámetros de Seguridad y Tolerancia de Espacios

| Componente A | Componente B | Distancia Centro-Centro (m) | Descripción de Interacción | Estado de Holgura |
|---|---|---|---|---|
| `BAT_MOD_01` | `HULL_MAIN` | 1.028 m | Surface Mount on Keel Tray | **INTENTIONAL_CONTACT** |
| `BAT_MOD_01` | `BATTERY_TRAY` | 0.982 m | Surface Mount | **INTENTIONAL_CONTACT** |
| `BAT_MOD_01` | `INBOARD_MOTOR` | 1.583 m | Separated by 1.55m longitudinally | **SAFE_CLEARANCE** |
| `BAT_MOD_01` | `SHAFT_MAIN` | 2.477 m | Above shaft corridor | **SAFE_CLEARANCE** |
| `BAT_MOD_01` | `HV_JUNCTION_BOX` | 2.57 m | Separated by 0.75m longitudinally | **SAFE_CLEARANCE** |
| `BAT_MOD_01` | `INVERTER_INBOARD` | 0.914 m | Separated by 0.85m longitudinally | **SAFE_CLEARANCE** |
| `INBOARD_MOTOR` | `HULL_MAIN` | 2.475 m | Internal Hull Mounting | **INTENTIONAL_CONTACT** |
| `INBOARD_MOTOR` | `SHAFT_MAIN` | 0.912 m | Direct Coaxial Coupling | **INTENTIONAL_CONTACT** |
| `HARDTOP_SHELL` | `PERSON_50_PERCENTILE` | 0.695 m | 0.425m Overhead Clearance | **SAFE_CLEARANCE** |
| `HARDTOP_SUPPORT_PORT` | `Cube` | 1.759 m | 0.20m Lateral Clearance | **SAFE_CLEARANCE** |
| `SOLAR_PANEL_01` | `HARDTOP_SHELL` | 1.06 m | Flush Roof Mounting | **INTENTIONAL_CONTACT** |
| `OUTBOARD_ELECTRIC_MOTOR` | `OUTBOARD_CENTER_BRACKET` | 0.0 m | Direct Transom Mounting | **INTENTIONAL_CONTACT** |
| `OUTBOARD_ELECTRIC_MOTOR` | `SWIM_PLATFORM_PORT` | 0.0 m | 0.35m Lateral Clearance | **SAFE_CLEARANCE** |
| `SWIM_PLATFORM_PORT` | `SWIM_PLATFORM_STARBOARD` | 0.0 m | 2.10m Central Opening Clearance | **SAFE_CLEARANCE** |
| `PROPELLER` | `HULL_MAIN` | 4.001 m | 0.15m Water Blade Clearance | **SAFE_CLEARANCE** |

## Resumen de Pesos y Centro de Gravidez (CG Packaging)

- **Masa Total Estimada de Ensamble:** 2843.0 kg
- **CG Longitudinal (X):** -0.2412 m (Centrado en zona 40%-60% LOA)
- **CG Transversal (Y):** 0.0 m (Simetría exacta en Línea de Crujía Y = 0.0000 m)
- **CG Vertical (Z):** 0.3049 m (Bajo centro de gravedad sobre quilla)
- **Interferencias Críticas Detectadas:** `0` (`CRITICAL INTERFERENCES: 0`)