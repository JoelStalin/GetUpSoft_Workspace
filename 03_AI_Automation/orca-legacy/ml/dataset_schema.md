# Dataset Schema

El dataset base del clasificador local usa las siguientes columnas:

- `text`: ejemplo textual de la solicitud
- `intent`: etiqueta objetivo
- `priority`: prioridad orientativa
- `scrum_phase`: fase Scrum sugerida

## Reglas

- `intent` debe ser una de:
  - `feature`
  - `bugfix`
  - `refactor`
  - `research`
  - `documentation`
  - `test`
  - `deployment`
  - `scrum-management`
- `text` debe ser suficientemente descriptivo.
- El dataset puede crecer sin cambiar el código del clasificador.
