# HULL GEOMETRY REVISION — docs/HULL_GEOMETRY_REVISION.md
## Revisión Geométrica Completa: Modelo → Embarcación Real

---

## 1. Motivación

El modelo 3D previo tenía un perfil de casco Deep-V con altura total de 3.21 m
que no correspondía a la embarcación real fotografiada — una **lancha panga**
de fondo casi plano con hard chine, bordo ~0.88 m, típica de uso pesquero/recreativo
en el Caribe/Latinoamérica.

---

## 2. Perfil del Casco Real (Panga/Hard Chine)

| Característica | Valor |
|---|---|
| Tipo | Panga / Lancha plana con hard chine |
| LOA | 8.84 m |
| Beam (Manga) | 2.80 m |
| Puntal de bordo (Freeboard) | 0.88 m |
| Ancho fondo plano (midship) | ~1.50 m |
| Altura quilla dura (chine) Z | 0.22 m |
| Waterline (flotación) Z | 0.18 m |
| Número de estaciones de cuaderna | 8 |
| Vértices hull | 40 |
| Caras hull | 32 |

### Secciones de cuaderna (estaciones)

| Estación X | Beam chine | Beam gunwale | Z fondo | Z chine | Z bordo |
|---|---|---|---|---|---|
| -4.42 (popa) | 0.00 | 0.40 | 0.52 | 0.52 | 0.88 |
| -3.50 | 0.80 | 1.10 | 0.20 | 0.30 | 0.88 |
| -2.00 | 1.32 | 1.40 | 0.05 | 0.22 | 0.88 |
|  0.00 (midship) | 1.38 | 1.40 | 0.00 | 0.22 | 0.88 |
|  1.50 | 1.30 | 1.40 | 0.00 | 0.20 | 0.88 |
|  3.00 | 1.00 | 1.25 | 0.08 | 0.25 | 0.88 |
|  4.00 | 0.50 | 0.75 | 0.28 | 0.38 | 0.88 |
|  4.42 (proa) | 0.00 | 0.10 | 0.55 | 0.55 | 0.88 |

---

## 3. Compartimentos Interiores Reales

| ID | Nombre | X_min | X_max | Y_half | Z_range | Uso |
|---|---|---|---|---|---|---|
| A | COMP_BOW_LOCKER | 2.50 | 4.20 | ±1.10 | 0.02–0.85 | Bodega/ancla de proa |
| B | COMP_WORK_AREA | 0.80 | 2.50 | ±1.28 | 0.02–0.85 | Zona de pesca/trabajo |
| C | COMP_CONSOLE_ZONE | -0.30 | 0.80 | ±1.35 | 0.02–0.85 | Zona cabina/consola |
| D | COMP_BATTERY_ZONE | -3.00 | -0.30 | ±1.30 | 0.02–0.72 | Bajo cubierta baterías |
| E | COMP_ENGINE_ROOM | -4.20 | -3.00 | ±1.00 | 0.02–0.72 | Compartimento motor |

---

## 4. Posicionamiento de Componentes (Geometría Real)

### Sistema de Baterías (COMP_D)
| Módulo | X | Y | Z |
|---|---|---|---|
| BAT_MOD_01 | -2.70 | -0.55 | 0.10 |
| BAT_MOD_02 | -2.70 | +0.55 | 0.10 |
| BAT_MOD_03 | -1.85 | -0.55 | 0.10 |
| BAT_MOD_04 | -1.85 | +0.55 | 0.10 |
| BAT_MOD_05 | -1.00 | -0.55 | 0.10 |
| BAT_MOD_06 | -1.00 | +0.55 | 0.10 |

- Dimensiones por módulo: 0.70 × 0.50 × 0.32 m
- Gap lateral de servicio: 0.30 m por lado
- Clearance techo: 0.30 m hasta cubierta

### Propulsión (COMP_E)
| Componente | X | Y | Z | Dims |
|---|---|---|---|---|
| INBOARD_MOTOR | -3.70 | 0.0 | 0.28 | 0.65×0.48×0.55 m |
| SHAFT_MAIN | -4.05 | 0.0 | 0.18 | 0.50×0.06×0.06 m |
| PROPELLER | -4.35 | 0.0 | 0.10 | — |
| OUTBOARD_ELECTRIC_MOTOR | -4.42 | 0.0 | 0.55 | 0.45×0.38×0.90 m |

### Sistema HV (Mamparo COMP_D/E @ X=-3.0 m)
| Componente | X | Y | Z |
|---|---|---|---|
| HV_MAIN_FUSE | -3.10 | -0.35 | 0.50 |
| HV_CONTACTOR | -3.10 | 0.00 | 0.50 |
| HV_JUNCTION_BOX | -3.10 | +0.35 | 0.50 |
| BMS_CONTROLLER | -3.05 | 0.00 | 0.45 |
| INVERTER_INBOARD | -3.40 | 0.00 | 0.45 |
| HV_EMERGENCY_DISCONNECT | -3.20 | 0.00 | 0.65 |

---

## 5. Cabina/Consola (basada en foto de referencia)

| Componente | Descripción |
|---|---|
| CONSOLE_BODY | Cuerpo trapezoidal GRP — X=0.0→1.1m, Y=±0.65m, H=0.77m |
| CONSOLE_WINDSHIELD | Parabrisas vidrio inclinado — frontal |
| CONSOLE_CIRCULAR_HATCH | Escotilla circular Ø 0.36m en techo (como foto) |
| CONSOLE_DASHBOARD | Panel de instrumentos interior |

---

## 6. T-Top de Tubería Inox (como foto)

11 elementos de tubo Ø 50mm (radio 0.025m), material MAT_STAINLESS:

| Componente | P1 | P2 |
|---|---|---|
| TTOP_POST_FWD_PORT | (1.80, -1.15, 0.92) | (1.80, -1.15, 2.50) |
| TTOP_POST_FWD_STBD | (1.80, +1.15, 0.92) | (1.80, +1.15, 2.50) |
| TTOP_POST_AFT_PORT | (-0.40, -1.15, 0.92) | (-0.40, -1.15, 2.50) |
| TTOP_POST_AFT_STBD | (-0.40, +1.15, 0.92) | (-0.40, +1.15, 2.50) |
| TTOP_RAIL_PORT | (-0.40, -1.15, 2.50) | (1.80, -1.15, 2.50) |
| TTOP_RAIL_STBD | (-0.40, +1.15, 2.50) | (1.80, +1.15, 2.50) |
| TTOP_CROSS_FWD | (1.80, -1.15, 2.50) | (1.80, +1.15, 2.50) |
| TTOP_CROSS_AFT | (-0.40, -1.15, 2.50) | (-0.40, +1.15, 2.50) |
| TTOP_CROSS_MID | (0.70, -1.15, 2.50) | (0.70, +1.15, 2.50) |
| TTOP_DIAG_PORT | (-0.40, -1.15, 2.50) | (-0.90, -1.15, 1.22) |
| TTOP_DIAG_STBD | (-0.40, +1.15, 2.50) | (-0.90, +1.15, 1.22) |

---

## 7. Cubierta en Capas

| Nombre | Zona | Notas |
|---|---|---|
| DECK_BOW | Proa X=1.9→4.3m | Sólida, zona de trabajo |
| DECK_MID | Centro X=0.8→1.9m | Lateral a la consola |
| DECK_AFT | Popa X=-4.2→-0.3m | Sobre baterías+motor |
| DECK_HATCH_BATTERY | X=-2.6→-1.0m | Escotilla acceso baterías |
| DECK_HATCH_ENGINE | X=-4.1→-3.1m | Escotilla motor |
| TRANSOM_PANEL | X=-4.42m | Espejo de popa vertical |

---

## 8. Centro de Gravedad Recalculado

| Parámetro | Valor |
|---|---|
| Masa total | 1,202 kg |
| CG_X | -1.4998 m (66.0% desde popa) |
| CG_Y | 0.0000 m (simetría exacta) |
| CG_Z | 0.4168 m (bajo CG sobre quilla) |

---

*Revisión: 2026-08-08 | Script: 10_full_geometry_revision.py*
