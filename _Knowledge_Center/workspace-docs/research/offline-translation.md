# Offline Translation

## Objetivo

Traducir prompts a un lenguaje canónico sin enviar texto a proveedores remotos.

## Estrategia del bootstrap

- detección ligera `es/en` por marcadores;
- traducción mínima por diccionario para casos técnicos frecuentes;
- wrapper preparado para `Argos Translate` cuando el entorno lo tenga instalado.

## Riesgos

- cobertura limitada en la traducción mínima;
- falta de modelos Argos locales;
- pérdida de matices en prompts largos.

## Próximo incremento

- catálogo de pares de idioma soportados;
- configuración de paquetes Argos por proyecto;
- pruebas de regresión multilenguaje.
