# Secret Handling

## Observación

El repositorio contiene archivos locales de entorno como `.env`. No deben imprimirse, copiarse a documentación ni publicarse a remotos.

## Reglas

- no mostrar secretos en logs ni reportes;
- no incluir credenciales en pruebas;
- usar `.env.example` como referencia pública;
- revisar cualquier cambio antes de `git add`.

## Recomendación

Si una credencial real fue usada o compartida fuera del entorno local, rotarla.
