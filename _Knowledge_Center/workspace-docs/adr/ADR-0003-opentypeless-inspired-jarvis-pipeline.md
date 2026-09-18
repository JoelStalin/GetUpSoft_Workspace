# ADR-0003: OpenTypeless-Inspired Jarvis Pipeline

- Fecha: 2026-05-16
- Estado: accepted

## Contexto

ORCA ya tiene un wrapper offline para audio, pero el pipeline Jarvis todavía es demasiado estrecho: parte de un archivo WAV y termina en texto. El repositorio público `tover0314-w/opentypeless` aporta patrones útiles de producto y runtime para entrada de voz de escritorio, incluyendo abstracción de STT, diccionario personalizado, historial local, output adapters y una separación explícita de pipeline.

OpenTypeless, sin embargo, está construido alrededor de Tauri, React, Rust, proveedores cloud de STT/LLM y salida a teclado/clipboard. Copiarlo de forma directa rompería la premisa de ORCA: Python-first, offline-first, sin consumo de tokens para la interpretación local y gobernado por Scrum.

## Decisión

ORCA adoptará un pipeline inspirado en OpenTypeless solo a nivel de contratos y adaptadores:

- `STTProvider` como interfaz estable;
- `MockSTTProvider` para pruebas sin audio real;
- `CustomDictionary` para correcciones previas a la clasificación;
- `VoiceCommandRouter` para separar wake word, comando e intención sugerida;
- `TranscriptHistory` local y desactivado por defecto;
- `OutputAdapter` desacoplado del runtime;
- integración de `JarvisListener` con `PromptInterpreter`.

No se integran en esta fase:

- Tauri, React o Rust;
- polish con LLM;
- hotkey global;
- captura real de micrófono;
- keyboard simulation o clipboard system-wide.

## Consecuencias

### Positivas

- ORCA gana una arquitectura Jarvis más extensible sin romper el core actual;
- las pruebas cubren voz simulada sin depender de binarios o servicios remotos;
- el backlog queda listo para fases futuras como hotkey, bridge desktop o providers reales;
- la inspiración externa se encapsula sin vendoring riesgoso.

### Negativas

- el MVP de voz sigue dependiendo de transcript ya disponible o `audio_ref` mockeado;
- la experiencia desktop real queda para sprints posteriores;
- coexistirá temporalmente el método `transcribe()` legado con el nuevo contrato de eventos Jarvis.

## Alternativas descartadas

### Hacer vendoring de OpenTypeless

Descartado por mezclar lenguajes, runtime y dependencias remotas ajenas al alcance del core ORCA.

### Esperar hasta tener captura de micrófono real

Descartado porque bloquearía el diseño del pipeline y retrasaría la cobertura de pruebas y backlog.

### Acoplar Jarvis directamente a Vosk

Descartado porque impediría conectar providers alternativos y dificultaría pruebas unitarias puras.
