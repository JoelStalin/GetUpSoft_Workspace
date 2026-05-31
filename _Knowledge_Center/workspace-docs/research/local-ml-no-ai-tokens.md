# Local ML Without AI Tokens

## Pregunta

¿Cómo interpretar solicitudes humanas sin consumir tokens de IA remota y manteniendo suficiente estructura para un flujo Scrum?

## Conclusión

La combinación más pragmática para el bootstrap es:

- reglas determinísticas para señales duras;
- diccionarios de intención para pistas semánticas rápidas;
- `TF-IDF + LogisticRegression` como clasificador base;
- traducción offline o traducción mínima por diccionario;
- speech-to-text offline encapsulado detrás de una interfaz opcional.

## Razones

### Reglas determinísticas

- son trazables;
- explican decisiones;
- reducen dependencia del dataset inicial.

### ML clásico

- entrena localmente;
- no requiere GPUs;
- funciona bien con pocos datos para clasificación textual base;
- entrega una métrica y una confianza utilizable.

### Wrappers opcionales

- `Argos Translate` puede no estar instalado;
- `Vosk` puede requerir modelos externos locales;
- el sistema debe seguir funcionando aunque esas piezas falten.

## Riesgos

- dataset pequeño produce confianza inestable;
- traducción mínima por diccionario no cubre todos los casos;
- audio offline depende de modelos disponibles en disco.

## Mitigaciones

- fallback por reglas;
- confianza mínima configurable;
- pruebas unitarias sobre escenarios ambiguos;
- backlog explícito para evolución de datasets, modelos y audio.
