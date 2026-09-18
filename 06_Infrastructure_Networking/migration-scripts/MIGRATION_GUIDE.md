# 📖 GUÍA COMPLETA: Migración a Arquitectura Multi-Servidor

## 📋 Tabla de Contenidos

1. [Pre-Requisitos](#pre-requisitos)
2. [Arquitectura Objetivo](#arquitectura-objetivo)
3. [FASE A: Preparación](#fase-a-preparación)
4. [FASE B: Migración de Staging](#fase-b-migración-de-staging)
5. [FASE C: Migración de CI/CD](#fase-c-migración-de-cicd)
6. [FASE D: Migración de Lab](#fase-d-migración-de-lab)
7. [FASE E: Monitoreo Unificado](#fase-e-monitoreo-unificado)
8. [Validación y Testing](#validación-y-testing)
9. [Rollback y Recuperación](#rollback-y-recuperación)

---

## Pre-Requisitos

### Hardware Requerido

**Server 2 (Staging/CI-CD):**
- Mínimo: 8GB RAM, 4 cores CPU, 100GB SSD
- Recomendado: 16GB RAM, 8 cores, 200GB SSD
- Sistema: Ubuntu 20.04 LTS o 22.04 LTS

**Server 3 (Lab/Desarrollo):**
- Mínimo: 4GB RAM, 2 cores, 50GB SSD
- Recomendado: 8GB RAM, 4 cores, 100GB SSD
- Sistema: Ubuntu 20.04 LTS o 22.04 LTS

### Software Requerido

```bash
# En todos los servidores:
apt update
apt install -y \
  docker.io \
  docker-compose \
  curl \
  wget \
  git \
  ssh \
  rsync \
  htop \
  iotop

# Agregar usuario ubuntu a grupo docker
usermod -aG docker ubuntu
```

### Networking

- IP Server 1 (Prod): `192.168.1.233`
- IP Server 2 (Staging): `192.168.1.234`
- IP Server 3 (Lab): `192.168.1.235`
- Red privada: 192.168.1.0/24
- Firewall: Puertos 22 (SSH), 5432 (PostgreSQL), 6379 (Redis), 8000-9000 (servicios)

---

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────┐
│         INTERNET / USUARIOS EXTERNOS            │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │   Reverse Proxy (Server 1)  │
        │   Nginx + Let's Encrypt     │
        └──┬──────────────────────────┘
           │
    ┌──────┼──────────────┐
    │      │              │
┌───▼──┐┌──▼──┐       ┌──▼──┐
│ Prod ││ Stg ├──────┬┤ Lab │
│      ││     │      │└──────┘
└──────┘└─────┴──────┼───────┘
                     │
         [Server 2] [Server 3]
         Staging/CI  Lab/Dev
```

---

## FASE A: Preparación

### A1: Configurar Networking (30 min)

**En todos los servidores:**
```bash
# Verificar conectividad
ping 192.168.1.233
ping 192.168.1.234
ping 192.168.1.235

# Configurar DNS resolver
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# Verificar SSH entre servidores
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519 ubuntu@192.168.1.233
ssh-copy-id -i ~/.ssh/id_ed25519 ubuntu@192.168.1.234
ssh-copy-id -i ~/.ssh/id_ed25519 ubuntu@192.168.1.235
```

### A2: Preparar Server 2

```bash
ssh ubuntu@192.168.1.234 << 'EOF'
# Crear directorios
mkdir -p /home/ubuntu/{migration,backups,docker-volumes}

# Clonar este repositorio para tener los scripts
cd /home/ubuntu
git clone https://github.com/getupsoft/workspace.git
cd workspace/migration

# Crear archivo .env
cat > /home/ubuntu/.env << 'ENVEOF'
DB_PASSWORD=your_secure_password
ODOO_ADMIN=your_odoo_admin_password
CODE_SERVER_PASSWORD=your_code_server_password
ENVEOF

chmod 600 /home/ubuntu/.env
EOF
```

### A3: Preparar Server 3

```bash
ssh ubuntu@192.168.1.235 << 'EOF'
# Crear directorios
mkdir -p /home/ubuntu/{migration,backups,docker-volumes}

# Clonar repositorio
cd /home/ubuntu
git clone https://github.com/getupsoft/workspace.git
cd workspace/migration

# Crear archivo .env
cat > /home/ubuntu/.env << 'ENVEOF'
DB_PASSWORD=your_secure_password
ODOO_ADMIN=your_odoo_admin_password
CODE_SERVER_PASSWORD=your_code_server_password
ENVEOF

chmod 600 /home/ubuntu/.env
EOF
```

### A4: Backup Pre-Migración

```bash
# En Server 1 (Prod)
cd /home/ubuntu/migration

# Exportar TODOS los volúmenes (no solo staging)
docker run --rm -v /var/lib/docker/volumes:/volumes \
  -v /home/ubuntu/backups:/backup \
  alpine tar czf /backup/all-volumes-$(date +%Y%m%d).tar.gz /volumes

# Backup de todas las bases de datos
docker exec jlft-premium-postgres pg_dumpall -U postgres | \
  gzip > /home/ubuntu/backups/postgres-all-$(date +%Y%m%d).sql.gz

# Backup de configuración
tar czf /home/ubuntu/backups/config-$(date +%Y%m%d).tar.gz \
  /etc/nginx /etc/docker /etc/systemd

echo "✅ Backups completados en /home/ubuntu/backups/"
ls -lh /home/ubuntu/backups/
```

---

## FASE B: Migración de Staging

### B0: Validar Estado Actual

```bash
# En Server 1, verificar estado de staging
docker ps | grep staging
docker volume ls | grep staging
docker exec getupsoft-shared-postgres psql -U postgres -c "SELECT datname FROM pg_database WHERE datname LIKE '%staging%';"
```

### B1: Ejecutar Script de Exportación

```bash
# En Server 1
cd /home/ubuntu/migration
chmod +x 01-export-staging-volumes.sh
./01-export-staging-volumes.sh /home/ubuntu/backups

# Verificar archivos generados
ls -lh /home/ubuntu/backups/staging-volumes-backup/*/
```

**Salida esperada:**
```
✅ Backup completado
📦 getupsoft_odoo_staging_data.tar.gz
📦 galantes_stg_odoo_data.tar.gz
📦 postgres-staging-dump.sql.gz
📄 docker-compose-staging.yml
```

### B2: Transferir a Server 2

```bash
# Desde Server 1
BACKUP_DIR=$(ls -td /home/ubuntu/backups/staging-volumes-backup/* | head -1)
rsync -avz --progress $BACKUP_DIR ubuntu@192.168.1.234:/home/ubuntu/backups/

# Verificar en Server 2
ssh ubuntu@192.168.1.234 "du -sh /home/ubuntu/backups/staging-volumes-backup/"
```

### B3: Iniciar Services en Server 2

```bash
# En Server 2
cd /home/ubuntu
docker-compose -f migration/docker-compose.server2-staging.yml up -d

# Esperar a que PostgreSQL esté listo
sleep 30
docker exec getupsoft-shared-postgres pg_isready
```

### B4: Restaurar Datos

```bash
# En Server 2
cd /home/ubuntu
BACKUP_DIR=$(ls -td /home/ubuntu/backups/staging-volumes-backup/* | head -1)
migration/02-import-staging-volumes.sh $BACKUP_DIR

# Verificar restauración
docker exec getupsoft-shared-postgres psql -U postgres -c "SELECT datname FROM pg_database WHERE datname LIKE '%staging%';"
```

### B5: Iniciar Aplicaciones en Server 2

```bash
# En Server 2
docker-compose -f migration/docker-compose.server2-staging.yml restart getupsoft_odoo_staging
docker logs -f getupsoft_odoo_staging

# Esperar hasta que vea: "odoo: started"
```

### B6: Actualizar Reverse Proxy

```bash
# En Server 1
cd /home/ubuntu/migration
chmod +x 03-update-nginx-upstreams.sh
./03-update-nginx-upstreams.sh

# Validar cambios
sudo nginx -t

# Recargar
sudo systemctl reload nginx
```

### B7: Validar Migración

```bash
# Desde tu máquina
curl -H 'Host: staging.example.com' http://192.168.1.233

# Debe responder desde Server 2 (puerto 8069 en 192.168.1.234)
# Ver logs: ssh ubuntu@192.168.1.234 "docker logs getupsoft_odoo_staging"
```

### B8: Apagar Staging en Server 1

```bash
# En Server 1 - SOLO después de validar que funciona en Server 2
docker stop getupsoft_odoo_staging galantes_stg_odoo galantes_stg_web
docker rm getupsoft_odoo_staging galantes_stg_odoo galantes_stg_web

# Liberar espacio
docker system prune -f

# Verificar RAM liberada
free -h
```

**Ahorro esperado:** 400-500MB RAM en Server 1

---

## FASE C: Migración de CI/CD

### C1: Instalar GitHub Runners en Server 2

```bash
# En Server 2
cd /home/ubuntu
mkdir -p actions-runner && cd actions-runner

# Descargar runner
wget https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64-2.321.0.tar.gz

# Para cada repositorio de GetUpSoft:
./config.sh --url https://github.com/getupsoft/[REPO-NAME] --token [GITHUB-TOKEN]

# Instalar como servicio
./svc.sh install
./svc.sh start

# Verificar
./svc.sh status
```

### C2: Validar CI/CD en Server 2

```bash
# Disparar un workflow en GitHub
# Verificar que el runner es de Server 2
docker exec server-redis-1 redis-cli KEYS "*runner*"
```

---

## FASE D: Migración de Lab

Similar a FASE B pero para Lab:

```bash
# En Server 1
cd /home/ubuntu/migration
./01-export-staging-volumes.sh --lab /home/ubuntu/backups

# En Server 2, transferir
rsync -avz --progress /home/ubuntu/backups/lab-volumes-backup/* ubuntu@192.168.1.235:/home/ubuntu/backups/

# En Server 3
docker-compose -f migration/docker-compose.server3-lab.yml up -d
sleep 30
migration/02-import-staging-volumes.sh /home/ubuntu/backups/lab-volumes-backup/*/

# Validar
docker ps
```

---

## FASE E: Monitoreo Unificado

### E1: Actualizar Prometheus en Server 1

```bash
# En Server 1
cp migration/prometheus-multi-server.yml /etc/prometheus/prometheus.yml
cp migration/alert-rules.yml /etc/prometheus/alert_rules.yml

# Recargar Prometheus
docker restart prometheus

# Verificar
curl http://localhost:9090/-/healthy
```

### E2: Instalar Exporters en Server 2 y 3

```bash
# En Server 2 y Server 3
docker-compose -f migration/docker-compose.server[2-3]-*.yml up -d node-exporter

# Verificar
curl http://192.168.1.234:9100/metrics | head -20
curl http://192.168.1.235:9100/metrics | head -20
```

### E3: Verificar Dashboards

```bash
# Acceder a Grafana
http://192.168.1.233:3000

# Importar dashboard multi-servidor
# Settings > Data Sources > Prometheus
# Dashboard > Import > node-exporter-full.json
```

---

## Validación y Testing

### V1: Checklist Post-Migración

```bash
# ✅ Server 1 RAM reducido
ssh ubuntu@192.168.1.233 "free -h"
# Esperado: < 50%

# ✅ Staging funciona en Server 2
curl http://192.168.1.234:8069 -I
# Esperado: HTTP/1.1 200 OK

# ✅ Lab funciona en Server 3
curl http://192.168.1.235:8069 -I
# Esperado: HTTP/1.1 200 OK

# ✅ Datos sincronizados
ssh ubuntu@192.168.1.234 "docker exec getupsoft-shared-postgres psql -U postgres -c 'SELECT COUNT(*) FROM information_schema.tables;'"

# ✅ Reverse proxy redirige correctamente
curl -vvv -H 'Host: staging.example.com' http://192.168.1.233 2>&1 | grep -i "upstream"

# ✅ Monitoreo funciona
curl http://192.168.1.233:9090/api/v1/targets | jq '.data.activeTargets[].labels.server' | sort | uniq
# Esperado: "Lab", "Production", "Staging"
```

### V2: Test de Carga (Opcional)

```bash
# Instalar Apache Bench
sudo apt install apache2-utils

# Test Staging
ab -n 1000 -c 10 http://192.168.1.234:8069

# Test Lab
ab -n 500 -c 5 http://192.168.1.235:8069

# Verificar logs
ssh ubuntu@192.168.1.234 "docker stats"
```

---

## Rollback y Recuperación

### R1: Rollback Completo a Servidor Único

```bash
# ⚠️ SOLO en caso de emergencia

# Paso 1: Restaurar datos de backup
docker exec jlft-premium-postgres psql -U postgres << 'EOF'
DROP DATABASE IF EXISTS getupsoft_staging;
DROP DATABASE IF EXISTS galantes_staging;
EOF

gunzip -c /home/ubuntu/backups/postgres-staging-dump.sql.gz | \
  docker exec -i jlft-premium-postgres psql -U postgres

# Paso 2: Restaurar volúmenes
cd /home/ubuntu/backups
tar xzf all-volumes-$(ls -t *.tar.gz | head -1)

# Paso 3: Restaurar configuración Nginx
sudo rm -rf /etc/nginx
sudo tar xzf config-*.tar.gz -C /

# Paso 4: Revertir cambios de upstreams
sudo cp migration/nginx-backup-*/sites-available/* /etc/nginx/sites-available/
sudo systemctl reload nginx

# Paso 5: Reiniciar servicios en Server 1
docker-compose -f docker-compose.yml up -d getupsoft_odoo_staging galantes_stg_odoo

# Paso 6: Validar
docker ps | wc -l  # Debe ser > 80
free -h           # RAM será más alta
```

### R2: Recuperación Parcial

```bash
# Si solo Server 2 falla:

# En Server 1: revertir upstream
sudo sed -i 's/192.168.1.234/localhost/g' /etc/nginx/sites-available/*
sudo systemctl reload nginx

# Iniciar servicios localmente
docker-compose up -d getupsoft_odoo_staging

# Si solo Server 3 falla:
# Similar pero para Lab
```

### R3: Recuperación de Base de Datos

```bash
# Si PostgreSQL se corrompe:
docker stop getupsoft-shared-postgres
docker rm getupsoft-shared-postgres
docker volume rm getupsoft-shared-postgres-data

# Restaurar desde backup
gunzip -c /home/ubuntu/backups/postgres-staging-dump.sql.gz > /tmp/dump.sql
docker-compose up -d getupsoft-shared-postgres
docker exec -i getupsoft-shared-postgres psql -U postgres < /tmp/dump.sql
```

---

## Monitoreo Continuo

### M1: Alertas Configuradas

Las alertas en `alert-rules.yml` incluyen:
- ✅ RAM > 80% (Warning) / 95% (Critical)
- ✅ Swap > 70% (Warning) / 90% (Critical)
- ✅ CPU > 85% por 10 min
- ✅ Disco > 80% lleno
- ✅ Servidor DOWN (2 min sin respuesta)
- ✅ PostgreSQL no responde
- ✅ Redis no responde
- ✅ Contenedor en restart loop
- ✅ Nginx alta tasa de errores 5xx

### M2: Dashboard Recomendado

```
PROD          STAGING       LAB
┌────────┐   ┌────────┐   ┌────────┐
│ Memory │   │ Memory │   │ Memory │
│ 43%    │   │ 52%    │   │ 38%    │
└────────┘   └────────┘   └────────┘

┌────────────────────────────────────┐
│     Request Latency (p95)          │
│  Prod: 125ms │ Staging: 98ms       │
│  Lab: 45ms   │                     │
└────────────────────────────────────┘

Uptime: All servers ✅
Errors: 0 critical alerts
```

---

## Troubleshooting

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Staging lento | Latencia > 1s | Verificar CPU en Server 2, posible contención |
| Datos desincronizados | Cambios en Prod no aparecen en Staging | Restaurar dump de PostgreSQL, verificar replicación |
| Nginx no redirecciona | 502 Bad Gateway | Verificar que upstream IP sea correcta, firewall entre servidores |
| Redis vacío | Sesiones pierden datos | Restaurar dump de Redis desde backup |
| Lab no inicia | Container siempre restarting | Verificar logs: `docker logs [container]` |

---

## FAQ

**P: ¿Cuánto downtime implica la migración?**  
R: Para Staging → ~5-10 minutos. Para Lab → ~5-10 minutos. Prod no tiene downtime.

**P: ¿Se pierden datos?**  
R: No, si sigues este guía. Hacemos backup antes de cualquier cambio.

**P: ¿Puedo volver atrás?**  
R: Sí, tienes rollback procedures. Requiere ~30 min.

**P: ¿Qué pasa si Server 2 falla?**  
R: Staging va offline. Prod sigue funcionando. Tienes 2h para reparar Server 2 antes que surja impacto.

**P: ¿Necesito cambiar DNS?**  
R: No. Nginx en Server 1 sigue siendo el punto de entrada. Internamente redirige a Server 2/3.

---

**Última actualización:** 2026-05-18  
**Versión:** 1.0
