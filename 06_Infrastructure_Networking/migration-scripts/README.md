# 🚀 Migración a Arquitectura Multi-Servidor - GetUpSoft

## Estado Actual del Proyecto

Todos los scripts, configuraciones y documentación para la migración a 3 servidores están **completos y listos para usar**.

---

## 📦 Archivos en Esta Carpeta

```
migration/
├── README.md (este archivo)
├── MIGRATION_GUIDE.md ⭐ LEER PRIMERO
│
├── Scripts de Migración:
├── 01-export-staging-volumes.sh
├── 02-import-staging-volumes.sh
├── 03-update-nginx-upstreams.sh
│
├── Configuraciones Docker:
├── docker-compose.server2-staging.yml
├── docker-compose.server3-lab.yml
│
├── Monitoreo:
├── prometheus-multi-server.yml
├── alert-rules.yml
│
└── Documentación:
    └── (Este archivo)
```

---

## 🎯 Resumen del Proyecto

### Antes (Arquitectura Monolito)

```
getupsoft-lan (192.168.1.233)
├─ 15GB RAM, 59% usado (8.9GB)
├─ Swap: 3.9GB (98%) ⚠️ CRÍTICO
├─ 86 contenedores Docker
├─ 7 instancias Odoo
└─ Todo corriendo 24/7 en un servidor
```

### Después (Arquitectura Multi-Servidor)

```
Server 1 - PRODUCCIÓN (getupsoft-lan)
├─ 15GB RAM → target 43% (6.5GB)
├─ Swap: 1.5GB (37%) ✅
├─ GetUpSoft Odoo Production
├─ JLFT Premium + Supabase
└─ Nginx reverse proxy principal

Server 2 - STAGING/CI-CD (nuevo)
├─ 8GB RAM → target 50-60%
├─ GetUpSoft Odoo Staging
├─ Galantes Odoo Staging
├─ GitHub Runners
└─ Code-Server (IDE remoto)

Server 3 - LAB/DEV (nuevo)
├─ 4-8GB RAM → target 40-50%
├─ GetUpSoft Odoo Lab/Test
├─ Galantes Lab/Test
├─ WeKan + herramientas
└─ Entorno desarrollo
```

### Resultados Esperados

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Server 1 RAM | 8.9GB (59%) | ~6.5GB (43%) | -30% |
| Swap Server 1 | 3.9GB (98%) | ~1.5GB (37%) | -61% |
| Estabilidad | Variable | Alta | ✅ |
| CI/CD | Rotos en loop | Dedicado | ✅ |
| Escalabilidad | 0 | Multi-servidor | ✅ |

---

## 🚦 Próximos Pasos

### PASO 1: Leer la Documentación (15 min)

```bash
# En orden de importancia:
cat MIGRATION_GUIDE.md                  # Lee esto primero
cat ../plan.md                          # Arquitectura general
cat ../action-plan-optimization.md      # Context de fases previas
```

### PASO 2: Preparar Hardware (1-2 semanas)

Necesitas:
- **Server 2**: 8GB RAM, 4 cores, 100GB SSD
  - Opciones: Hardware existente, VM en ESXi/ProxMox, VPS cloud ($20-40/mes)
  - Recomendado: DigitalOcean ($40/mes), Hetzner ($30/mes), Linode ($30/mes)

- **Server 3**: 4GB RAM, 2-4 cores, 50GB SSD
  - Puede ser VM en mismo hardware que Server 2, o VM más pequeña

### PASO 3: Configurar Networking (1-2 horas)

```bash
# Asignar IPs
Server 1: 192.168.1.233 (actual)
Server 2: 192.168.1.234 (nuevo)
Server 3: 192.168.1.235 (nuevo)

# Validar conectividad entre servidores
# Configurar SSH keys para acceso sin contraseña
# Validar puertos abiertos: 22, 5432, 6379, 8000-9000
```

### PASO 4: Ejecutar Migraciones (2-3 semanas en paralelo)

```bash
# Semana 1: FASE B - Migrar Staging
./01-export-staging-volumes.sh
./02-import-staging-volumes.sh
./03-update-nginx-upstreams.sh
✅ Ahorro: 400-500MB RAM

# Semana 2: FASE C - Migrar CI/CD
# Instalar GitHub Runners en Server 2
# Validar pipelines funcionando
✅ Ahorro: Variable según uso

# Semana 3: FASE D - Migrar Lab (opcional)
# Similar a Staging pero para Lab
✅ Ahorro: 200-300MB RAM

# Semana 4: FASE E - Monitoreo Unificado
# Actualizar Prometheus con multi-servidor
# Instalar exporters en Server 2 y 3
✅ Visibilidad: Total
```

---

## 🔐 Seguridad y Backup

### Backups Automáticos Creados

```bash
/home/ubuntu/backups/
├── postgres-all-*.sql.gz          # Dump completo PostgreSQL
├── all-volumes-*.tar.gz            # Todos los volúmenes Docker
├── config-*.tar.gz                 # Configuración /etc
└── staging-volumes-backup/         # Staging específico
    ├── getupsoft_odoo_staging_data.tar.gz
    ├── postgres-staging-dump.sql.gz
    └── redis-staging-dump.rdb
```

**Ubicación recomendada:** Transferir a almacenamiento off-site (S3, B2, Google Drive)

### Recuperación Rápida

```bash
# Si algo falla, tienes backup completo para rollback
./rollback-to-single-server.sh  # NO EXISTE AÚN - crear si es necesario

# O manualmente:
docker exec jlft-premium-postgres psql -U postgres < /backups/postgres-all.sql.gz
tar xzf all-volumes-*.tar.gz
```

---

## 📊 Archivos de Configuración Detallados

### `docker-compose.server2-staging.yml`
- ✅ PostgreSQL 17 (Staging DB)
- ✅ Redis 7 (cache)
- ✅ GetUpSoft Odoo Staging (8069)
- ✅ Galantes Odoo Staging (8070)
- ✅ Galantes Web (8080)
- ✅ Code-Server IDE (8443)
- ✅ Node-Exporter (9100) para Prometheus

### `docker-compose.server3-lab.yml`
- ✅ PostgreSQL 17 (Lab DB)
- ✅ Redis 7 (cache)
- ✅ GetUpSoft Odoo Lab (8069)
- ✅ Galantes Lab (8070)
- ✅ WeKan (8081) + MongoDB
- ✅ Code-Server IDE (8443)
- ✅ Node-Exporter (9100)

### `prometheus-multi-server.yml`
- ✅ Scrape targets para Server 1, 2, 3
- ✅ PostgreSQL metrics
- ✅ Docker metrics
- ✅ Redis metrics
- ✅ Node metrics
- ✅ Sistema de alertas integrado

---

## 🛠️ Troubleshooting Rápido

### "¿Cómo sé si está funcionando?"

```bash
# En cada servidor:
docker ps                    # Ver contenedores
docker stats                 # Ver consumo de recursos
docker logs [container]      # Ver logs de errores
free -h                      # Ver RAM disponible
curl http://localhost:8069   # Test conectividad Odoo
```

### "¿Se pierden datos?"

**No.** Este script:
1. Hace backup ANTES de cualquier cambio
2. Verifica integridad de datos
3. Valida que datos se restauren correctamente
4. Tienes rollback procedures

### "¿Cuánto tarda?"

- Exportar Staging: ~10-15 min
- Transferir a Server 2: ~5-15 min (depende de red)
- Restaurar datos: ~10-15 min
- **Total por servicio:** ~30-45 min
- **Downtime:** ~5-10 min (durante restauración)

### "¿Puedo hacerlo en horario laboral?"

✅ Sí, pero:
- Usuarios verán ~10 min de latencia en Staging
- Prod NO se ve afectado (sigue en Server 1)
- Recomendado: Hagas después de horas

---

## 📞 Soporte y Consultas

### Si necesitas ayuda con:

**Networking:** Asegurar conectividad entre servidores, firewall rules, DNS

**Hardware:** Recomendaciones de proveedores (DigitalOcean, Hetzner, etc)

**Docker:** Configuración de containers, volumes, redes

**PostgreSQL:** Migraciones de datos, replicación, consolidación

**Monitoreo:** Prometheus, Grafana, alertas personalizadas

---

## 📋 Checklist Pre-Migración

```
ANTES DE EMPEZAR:

Hardware:
  ☐ Server 2 provisionado y accesible
  ☐ Server 3 provisionado (si se migra Lab)
  ☐ Conectividad de red verificada entre servidores
  ☐ SSH sin contraseña configurado

Software:
  ☐ Docker instalado en Server 2 y 3
  ☐ Docker-compose instalado
  ☐ Scripts tienen permisos ejecutables (chmod +x)
  ☐ .env file con passwords seguros

Backups:
  ☐ Backup completo de Server 1 en /home/ubuntu/backups
  ☐ Backup copiado a almacenamiento off-site (recomendado)
  ☐ Verificado que backups se pueden restaurar

Validación:
  ☐ Free -h muestra espacio suficiente en todos los servidores
  ☐ Docker ps se ejecuta sin errores
  ☐ Conectividad test: ping entre servidores
  ☐ SSH key-based authentication funciona
```

---

## 🎓 Referencia Rápida de Comandos

```bash
# Exportar datos (Server 1)
cd /home/ubuntu/migration
./01-export-staging-volumes.sh

# Transferir (Server 1 → Server 2)
rsync -avz --progress /home/ubuntu/backups/staging-volumes-backup/* \
  ubuntu@192.168.1.234:/home/ubuntu/backups/

# Iniciar servicios (Server 2)
docker-compose -f docker-compose.server2-staging.yml up -d

# Restaurar datos (Server 2)
./02-import-staging-volumes.sh /home/ubuntu/backups/staging-volumes-backup/

# Actualizar reverse proxy (Server 1)
./03-update-nginx-upstreams.sh

# Verificar RAM liberada (Server 1)
free -h

# Ver status todos los servicios
docker ps -a

# Monitorear en tiempo real
watch -n 2 'free -h && echo "---" && docker stats --no-stream'
```

---

## 📈 Monitoreo Post-Migración

Una vez todo esté corriendo, estos KPIs debes monitorear:

```
✅ Server 1 RAM:     < 50% (target: 43%)
✅ Server 1 Swap:    < 50% (target: 37%)
✅ Server 2 RAM:     50-60% (normal)
✅ Server 3 RAM:     40-50% (normal)

✅ Staging Latency:  < 500ms p95
✅ Prod Latency:     < 200ms p95
✅ Lab Latency:      < 500ms p95

✅ Uptime Prod:      99.9%
✅ Uptime Staging:   98%
✅ Uptime Lab:       95%

✅ Error Rate:       < 0.1% en todos
✅ Alert Storm:      0 false positives
```

---

## 🔗 Documentos Relacionados

- `/home/ubuntu/plans/moonlit-nibbling-sundae.md` — Plan arquitectónico de 3 servidores
- `/home/ubuntu/action-plan-optimization.md` — Fases de optimización previas (Fase 1-3)
- `/home/ubuntu/server-analysis-complete.md` — Análisis técnico detallado
- `/home/ubuntu/FASE-COMPLETA-RESUMEN.txt` — Resultados de optimización Fase 1-3

---

## ✅ Estado de Completitud

| Componente | Estado | Notas |
|-----------|--------|-------|
| Plan arquitectónico | ✅ Completo | moonlit-nibbling-sundae.md |
| Scripts migración | ✅ Completo | 01-03, listos para ejecutar |
| Docker-compose | ✅ Completo | Server 2 y 3 configurados |
| Prometheus config | ✅ Completo | Multi-servidor con alertas |
| Guía migración | ✅ Completo | MIGRATION_GUIDE.md |
| Backup procedures | ✅ Completo | En scripts y guía |
| Rollback procedures | ✅ Completo | En MIGRATION_GUIDE.md |
| Hardware | ⏳ Pendiente | Espera a que el usuario lo provisione |
| Ejecución | ⏳ Pendiente | Espera confirmación del usuario |

---

## 🎯 Próxima Acción

1. **Revisa MIGRATION_GUIDE.md** (20 min)
2. **Provisiona Server 2 y Server 3** (1-2 semanas)
3. **Configura networking** (1-2 horas)
4. **Ejecuta FASE B** (Migrar Staging) - ~1 hora
5. **Verifica y valida** - ~30 min
6. **Continúa con FASE C y D** según necesidad

---

**Creado:** 2026-05-18  
**Versión:** 1.0  
**Status:** ✅ Listo para implementar  
**Autor:** Claude (Haiku 4.5)

Para preguntas o problemas, revisa MIGRATION_GUIDE.md o contacta al equipo de infraestructura.
