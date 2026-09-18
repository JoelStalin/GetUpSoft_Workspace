# Normalización de Directorios - Checklist

## ✅ COMPLETADO EN LOCAL
- [x] Estructura MVC creada: apps/, libs/, infra/, docs/

## 📋 PENDIENTE EN SERVIDOR
Después de que Node.js esté instalado y FLAI desvinculado:

### Paso 1: Crear estructura MVC
```bash
mkdir -p apps/{site,easycount,orca,chatbot}
mkdir -p libs/{auth,database,common}
mkdir -p infra/{kubernetes,docker,terraform}
mkdir -p docs/{architecture,api,deployment}
mkdir -p scripts/{deploy,setup,migrate}
mkdir -p archive/{deprecated,research}
```

### Paso 2: Mover con git mv (preserva historial)
```bash
# Proyectos
git mv 01_Core_Platform/getupsoft-site apps/site
git mv 03_AI_Automation/orca apps/orca

# Infraestructura
git mv 02_Cloud_Infrastructure/* infra/kubernetes/
git mv deploy/* infra/docker/

# Documentación
git mv _Knowledge_Center/* docs/

# Archive
git mv 04_Archive_Legacy/* archive/deprecated/
```

### Paso 3: Actualizar referencias
```bash
# En docker-compose
sed -i 's|01_Core_Platform/getupsoft-site|apps/site|g' docker-compose*.yml
sed -i 's|03_AI_Automation/orca|apps/orca|g' docker-compose*.yml

# En .github/workflows
find .github/workflows -type f -exec sed -i 's|01_Core_Platform|apps|g' {} \;
```

### Paso 4: Commit
```bash
git add -A
git commit -m "refactor: normalize directory structure to MVC pattern"
```

## 📊 Mapeo Completo

| Antigua Ruta | Nueva Ruta | Tipo |
|---|---|---|
| `01_Core_Platform/getupsoft-site` | `apps/site` | Frontend App |
| `01_Core_Platform/easycount-api` | `apps/easycount` | Backend App |
| `03_AI_Automation/orca` | `apps/orca` | AI App |
| `02_Cloud_Infrastructure` | `infra/kubernetes` | K8s |
| `deploy/` | `infra/docker` | Docker |
| `_Knowledge_Center` | `docs` | Documentación |
| `04_Archive_Legacy` | `archive/deprecated` | Legacy |

## ✋ IMPORTANTE
- Cambios más significativos:
  1. Desvinculación de FLAI (✓ EN SERVIDOR)
  2. Node.js instalado (⏳ ESPERANDO)
  3. Normalización MVC (⏳ PENDIENTE)

