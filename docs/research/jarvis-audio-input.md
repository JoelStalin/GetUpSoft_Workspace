# Jarvis Audio Input

## Objetivo

Convertir audio offline a texto y pasarlo por el mismo pipeline que las entradas escritas.

## Estrategia del bootstrap

- interfaz `JarvisListener` desacoplada;
- error explícito si falta `Vosk`;
- pruebas con mocks para no depender de binarios ni modelos en CI.

## Requisitos futuros

- ruta configurable al modelo Vosk;
- soporte para lotes y streaming;
- validación de calidad de transcripción;
- almacenamiento opcional del transcript en SQLite u Obsidian.
