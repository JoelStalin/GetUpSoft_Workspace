# Documento de Auditoría de Escena Original (`docs/SCENE_AUDIT.md`)

## Inventario Completo de Objetos y Asignación de Roles

| Objeto | Tipo | Rol Conceptual | Dimensiones [X,Y,Z] (m) | Ubicación [X,Y,Z] (m) | Verts / Polys | Materiales | Acción Recomendada |
|---|---|---|---|---|---|---|---|
| `BezierCurve` | `MESH` | Deck Stainless Guard Railing | [4.543, 0.064, 0.338] | [-0.964, 1.553, 1.25] | 437 / 405 | Material.009, Material.003 | **Keep** |
| `Camera` | `CAMERA` | Unknown | [0.0, 0.0, 0.0] | [0.732, 9.438, 3.286] | 0 / 0 | None | **Unknown** |
| `Cube` | `MESH` | Helm Console Unit | [2.444, 8.23, 1.212] | [0.0, 0.865, 0.317] | 402 / 346 | Material.002, Material.006 | **Keep & Upgrade** |
| `Cube.001` | `MESH` | Helm Controls, MFD Bracket & Hardware | [0.964, 0.498, 0.407] | [0.464, 2.612, -0.216] | 64 / 47 | Material.002 | **Keep** |
| `Cube.002` | `MESH` | Cockpit Seating & Bench Structure | [0.566, 0.872, 1.63] | [0.0, 5.246, -0.045] | 481 / 387 | Material.003 | **Keep** |
| `Cube.003` | `MESH` | Main Vessel Hull & Deck Structural Mesh | [2.63, 11.673, 4.238] | [-2.804, -11.753, 0.0] | 776 / 414 | Material.010 | **Keep (Rename HULL_MAIN)** |
| `Cube.004` | `MESH` | Helm Controls, MFD Bracket & Hardware | [0.296, 0.352, 0.564] | [0.1, 4.996, 0.221] | 84 / 80 | Material.003 | **Keep** |
| `Cube.005` | `MESH` | Helm Controls, MFD Bracket & Hardware | [0.251, 0.299, 0.425] | [0.0, 4.877, -0.026] | 102 / 89 | Material.003 | **Keep** |
| `Cylinder` | `MESH` | Base Marine Steering Wheel | [2.411, 2.737, 1.8] | [0.0, 0.865, 0.317] | 1138 / 962 | Material.001 | **Keep & Upgrade** |
| `Cylinder.001` | `MESH` | Base Shaft Propeller Hardware | [0.255, 0.194, 0.266] | [0.0, 5.492, -0.877] | 90 / 56 | Material.004 | **Modify** |
| `Cylinder.002` | `MESH` | Helm Controls, MFD Bracket & Hardware | [0.233, 0.19, 0.136] | [-0.98, 1.328, 0.877] | 588 / 466 | Material.009, Material.001, Material.006 | **Keep** |
| `Lamp` | `LIGHT` | Background Environment Prop / Water Grid / Rocks | [0.0, 0.0, 0.0] | [-3.92, 1.19, 4.9] | 0 / 0 | None | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `Lamp.001` | `LIGHT` | Background Environment Prop / Water Grid / Rocks | [0.0, 0.0, 0.0] | [-5.323, 18.452, 1.333] | 0 / 0 | None | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `Plane` | `MESH` | Console Windshield / Screen Frame | [1.709, 2.66, 0.076] | [0.0, 1.291, 2.078] | 16 / 9 | Material | **Keep** |
| `Plane.001` | `MESH` | Background Environment Prop / Water Grid / Rocks | [51.051, 52.206, 1.886] | [-0.188, 0.0, -0.551] | 2421 / 2299 | Material.007 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `Plane.002` | `MESH` | Background Environment Prop / Water Grid / Rocks | [2.0, 2.0, 0.0] | [0.0, 0.0, -1.608] | 4 / 1 | Material.008 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `Plane.003` | `MESH` | Background Environment Prop / Water Grid / Rocks | [2.0, 2.0, 0.175] | [0.0, -12.853, 0.143] | 2500 / 2401 | Material.008 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `Sphere` | `MESH` | Background Environment Prop / Water Grid / Rocks | [0.818, 0.818, 0.409] | [0.0, 0.0, -6.265] | 257 / 256 | Material.005 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `stone 1` | `MESH` | Background Environment Prop / Water Grid / Rocks | [1.336, 1.543, 2.132] | [0.0, -3.963, 0.0] | 12 / 20 | Material.013 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `stone2` | `MESH` | Background Environment Prop / Water Grid / Rocks | [2.2, 1.772, 1.588] | [0.0, 0.0, 0.0] | 12 / 20 | Material.012 | **Move to 00_ORIGINAL_UNUSED & Hide** |
| `stone3` | `MESH` | Background Environment Prop / Water Grid / Rocks | [1.949, 2.024, 1.562] | [0.0, 3.616, 0.0] | 12 / 20 | Material.011 | **Move to 00_ORIGINAL_UNUSED & Hide** |

## Estrategia de Preservación de Geometría Base
- Los 11 objetos pertenecientes a la embarcación (`Cube.003`, `Cube`, `Plane`, `Cylinder`, `BezierCurve`, `Cube.001`, `Cube.002`, `Cube.004`, `Cube.005`, `Cylinder.001`, `Cylinder.002`) se preservan de forma unificada sin destruir sus mapas UV ni materiales nativos.
- Los 10 objetos de entorno (`Sphere`, `Plane.001`, `Plane.002`, `Plane.003`, `stone 1`, `stone2`, `stone3`, `Lamp`, `Lamp.001`) se transfieren a la colección de aislamiento `00_ORIGINAL_UNUSED` con visibilidad desactivada.