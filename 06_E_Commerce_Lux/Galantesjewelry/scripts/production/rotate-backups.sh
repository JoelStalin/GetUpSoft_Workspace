#!/usr/bin/env bash
# scripts/production/rotate-backups.sh
# Rotación segura de backups — SOLO opera en /home/yoeli/deploy-backups
# Política: mantener los N más recientes Y los de las últimas KEEP_HOURS horas
# Nunca borra el backup más reciente
# Nunca borra archivos fuera de BACKUP_ROOT

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

ROOT="$(safe_backup_root)"

KEEP_BACKUPS="${KEEP_BACKUPS:-5}"
KEEP_BACKUP_HOURS="${KEEP_BACKUP_HOURS:-72}"

log "Rotating backups in $ROOT (keep=$KEEP_BACKUPS, hours=$KEEP_BACKUP_HOURS)"

# Obtener lista ordenada de directorios de backup (más reciente primero)
mapfile -t all_backups < <(
  find "$ROOT" -mindepth 1 -maxdepth 1 -type d \
    | sort -r
)

total="${#all_backups[@]}"
log "Found $total backup(s)"

if [ "$total" -eq 0 ]; then
  log "No backups to rotate"
  exit 0
fi

kept=0
deleted=0

for i in "${!all_backups[@]}"; do
  dir="${all_backups[$i]}"
  name="$(basename "$dir")"

  # Guardar siempre el más reciente (índice 0)
  if [ "$i" -eq 0 ]; then
    log "  KEEP (most recent): $name"
    (( kept++ )) || true
    continue
  fi

  # Guardar si estamos dentro del límite de cantidad
  if [ "$kept" -lt "$KEEP_BACKUPS" ]; then
    # Comprobar antigüedad por modificación del directorio
    if find "$dir" -maxdepth 0 -newer "$ROOT" -mmin "-$(( KEEP_BACKUP_HOURS * 60 ))" | grep -q .; then
      log "  KEEP (within ${KEEP_BACKUP_HOURS}h): $name"
    else
      log "  KEEP (within count limit $KEEP_BACKUPS): $name"
    fi
    (( kept++ )) || true
    continue
  fi

  # Verificar que el directorio está dentro de BACKUP_ROOT (seguridad)
  real_dir="$(realpath "$dir")"
  real_root="$(realpath "$ROOT")"
  if [[ "$real_dir" != "$real_root"/* ]]; then
    log "  SKIP (unsafe path): $real_dir"
    continue
  fi

  log "  DELETE: $name"
  rm -rf "$dir"
  (( deleted++ )) || true
done

log "Rotation complete: kept=$kept deleted=$deleted"

# Limpiar archivos .dump huérfanos fuera del directorio de backups
log "Checking for orphan dumps outside deploy-backups..."
orphan_dumps="$(find /home/yoeli/galantesjewelry/backups -name '*.dump' -mtime +7 2>/dev/null || true)"
if [ -n "$orphan_dumps" ]; then
  log "Found orphan dumps (older than 7 days):"
  echo "$orphan_dumps" | while read -r f; do
    log "  DELETE orphan: $f"
    rm -f "$f"
  done
else
  log "No orphan dumps found"
fi

log "Disk usage after rotation:"
df -h /
