# Preparación de Unreal Engine para GetUpSoft Boat

## Estado verificado del equipo

- CPU: AMD Ryzen 5 3500U, 4 núcleos y 8 hilos.
- RAM: 29.9 GB.
- GPU: AMD Radeon Vega 8 integrada.
- VRAM reportada: 2 GB.
- Sistema: Windows 11 Home Insider Preview, build 26220.
- Epic Games Launcher: instalado y verificado, versión 20.2.9.
- Unreal Engine: 5.8.2, build 56702186, instalación y prerrequisitos verificados.
- Proyecto base: `ElectricBoatDigitalTwin` creado en disco y asociado a UE 5.8.
- Blender: 5.2.1 LTS portable instalado dentro del proyecto, checksum oficial validado y arranque en segundo plano verificado.

Epic recomienda 32 GB de RAM y 8 GB o más de memoria gráfica para UE5. Este equipo se acerca a la RAM recomendada, pero su GPU queda muy por debajo de la recomendación. Por eso el preset activo prioriza estabilidad del editor: DirectX 11, calidad escalable, 50 % de resolución interna, sin Lumen, ray tracing ni Nanite.

## Perfiles

`presets/render-profiles.json` mantiene dos destinos:

1. `vega8_editor`: perfil activo para construir y probar la lógica del gemelo digital en este equipo.
2. `rtx_digital_twin`: perfil futuro para una estación NVIDIA RTX, DirectX 12, SM6, Lumen y DLSS.

El paquete oficial DLSS 4.5 v8.7.2 para UE 5.8 está descargado y verificado, pero permanece deshabilitado: DLSS requiere hardware NVIDIA RTX. El manifiesto `vendor-manifest.json` conserva ruta, tamaño y SHA-256 del artefacto.

## Física y fidelidad

- Unreal Water, Chaos y un sistema multipunto de flotabilidad producirán la simulación interactiva.
- El perfil local usa substepping síncrono con paso máximo de 1/60 s y hasta 4 substeps. El perfil `DefaultPhysics.high-fidelity.ini` permite 1/120 s y hasta 8 substeps en hardware más potente, después de medir el coste.
- El centro de masa y las masas de componentes procederán del modelo maestro de Blender.
- Los coeficientes de empuje y flotabilidad empezarán como `ASSUMPTION` y deberán calibrarse contra hidrostática y CFD.
- El océano visual de Unreal no probará resistencia, estabilidad ni seguridad naval.
- La malla de colisión será independiente de la malla visual de alta resolución.

## Orden de instalación

1. Mantener `ElectricBoatDigitalTwin` en Desktop + Scalable y Starter Content desactivado.
2. Water, Buoyancy, Chaos Vehicles y Modeling Tools están habilitados y se validaron durante el arranque.
3. Aplicar el perfil físico de alta fidelidad únicamente después de perfilar el escenario completo.
4. Medir FPS, memoria, errores de shaders y estabilidad con el mapa marítimo cuando exista.
5. Con una estación RTX disponible, habilitar `rtx_digital_twin` e instalar el plugin DLSS ya descargado.

## Fuentes oficiales

- Epic Games: https://dev.epicgames.com/documentation/unreal-engine/hardware-and-software-specifications-for-unreal-engine
- Epic Games: https://dev.epicgames.com/documentation/unreal-engine/install-unreal-engine
- NVIDIA DLSS: https://developer.nvidia.com/rtx/dlss
