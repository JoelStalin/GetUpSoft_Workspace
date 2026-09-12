# Catalogo de 05_Backups (R02) — solo lectura, nada movido

**Fecha:** 2026-09-11
**Metodo:** conteo de archivos a profundidad 3, sin abrir ni leer contenido de ningun
archivo. Cero movimientos, cero lecturas de contenido.

## Por que se detuvo aqui

El mapa de reorg (seccion 2.2 del diseno integral) dice explicitamente para
`05_Backups`: **"Catalogar primero; backups a almacenamiento restringido y fuentes
historicas a archives."** Esta carpeta contiene una entrada llamada literalmente
**`secrets_recovery`** -- moverla, indexarla o incorporarla al git corporativo sin
autorizacion explicita del usuario seria exactamente el tipo de accion irreversible
que este proyecto ha evitado consistentemente durante toda la sesion (mismo criterio
aplicado a `hyperframes/captures`, `apps/site/tests/e2e/.runtime`, perfiles de Chrome
en `data/orca/`, etc.).

## Catalogo (conteo de archivos, profundidad 3)

| Carpeta | Archivos (aprox., profundidad 3) |
|---|---|
| `ai-automation-orchestrator_plus` | 0 |
| `cell_odoo_bk` | 51 |
| `clutter` | 391 |
| `deploy-staging` | 10 |
| `docker-volumes-migration` | 42 |
| `docker-volumes-migration;C` (nombre con `;C` sospechoso, revisar origen) | 0 |
| `folders_recovery` | 1062 |
| `Galantesjewelry-main-publish` | 83 |
| `Galantesjewelry-sanitize` | 337 |
| `general_backup` | 0 |
| `images` | 0 |
| `insta-unfollow-bot-controlado_copy` | 18 |
| `logs_and_certs` | 5 |
| `odoocontability-main` | 39 |
| `onedrive_recovery` | 22 |
| `onedrive_recovery_back_l10` | 109 |
| `onedrive_recovery_extra` | 22 |
| `onedrive_recovery_IBM` | 11 |
| `onedrive_recovery_odoocontability_bk` | 0 |
| `onedrive_recovery_odoocontability_bk2` | 0 |
| `onedrive_recovery_pytest` | 1 |
| `onedrive_recovery_SideSync` | 0 |
| `onedrive_recovery_test` | 13 |
| `onedrive_recovery_versionado` | 8 |
| `re-build` | 67 |
| `sandbox` | 26 |
| **`secrets_recovery`** | 0 a profundidad 3 (puede tener contenido mas profundo -- NO investigado) |
| `tuto_chefalitas` | 2 |

## Que falta para completar esta tarea (fuera de alcance de esta sesion sin autorizacion)

1. Confirmar con el usuario que `secrets_recovery` es un backup legitimo (¿de que
   sistema? ¿por que ese nombre?) antes de decidir su tratamiento.
2. Decidir el "almacenamiento restringido" real para los backups (¿una ubicacion
   fuera del workspace? ¿cifrado? ¿quien tiene acceso?) -- el diseno no especifica
   la ubicacion exacta, solo dice que no debe ser el git corporativo normal.
3. Los `onedrive_recovery_*` (9 carpetas) parecen recuperaciones de sincronizacion de
   OneDrive -- varias estan vacias (`bk`, `bk2`, `SideSync`), sugiriendo que fueron
   creadas y nunca pobladas, o que ya se vaciaron en una operacion anterior.
4. `Galantesjewelry-main-publish` y `Galantesjewelry-sanitize` posiblemente se
   solapan con el checkout canonico ya reubicado a `client-solutions/galantes-jewelry/`
   -- requeriria la misma comparacion cuidadosa hecha con los otros duplicados de
   Galantes en este bloque.

**Ninguna accion se tomo sobre `05_Backups` en esta pasada.** Sigue exactamente donde
estaba, sin modificar.
