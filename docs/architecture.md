# Architecture

## Resumen

La nueva base ORCA vive en la raíz del repositorio y se separa deliberadamente del módulo histórico `03_AI_Automation/orca`, ya que este último incorpora proveedores remotos y objetivos distintos.

## Capas

### 1. Input

- `CLI`
- archivo de texto o script
- audio offline

### 2. Interpretación local

- `OfflineTranslator`
- `PromptNormalizer`
- `RuleExtractor`
- `IntentClassifier`
- `SkillRouter`
- `ScrumMapper`

### 3. Salida estructurada

- JSON validado con Pydantic
- prompts para modelo pago
- prompts de continuación para modelo gratuito

### 4. Gobernanza

- backlog YAML
- skills YAML
- ADRs
- pruebas automatizadas
- CI

## Pipeline

```text
InputCollector
  -> AudioTranscriber
  -> LanguageDetector
  -> OfflineTranslator
  -> PromptNormalizer
  -> RuleExtractor
  -> IntentClassifier
  -> SkillRouter
  -> ScrumMapper
  -> PromptBuilder
  -> ErrorPromptGenerator
  -> InterpretationResult JSON
```

## Decisiones clave

- Python es el lenguaje principal del núcleo.
- `pydantic` define el contrato de salida.
- `scikit-learn` soporta clasificación local con TF-IDF.
- `spaCy` se usa como dependencia preparada para tokenización y patrones, pero el MVP no requiere modelos pesados descargados.
- `Argos Translate` y `Vosk` son integraciones opcionales y desacopladas mediante wrappers.
- `SQLite` queda reservado para el siguiente incremento; el bootstrap usa YAML y CSV versionados.

## Aislamiento del legado

No se modifica la arquitectura previa de `03_AI_Automation/orca`. La nueva base:

- no importa paquetes del legado;
- no usa proveedores remotos;
- no reutiliza contratos del servicio histórico;
- mantiene compatibilidad futura mediante prompts ya normalizados.
