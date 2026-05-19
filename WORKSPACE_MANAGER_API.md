# 🎛️ Workspace Manager API — Control Total de GetUpSoft Workspace

**Status:** ✅ Implementado  
**Fecha:** 2026-05-19

---

## Descripción

Orca ahora puede **leer, escribir, modificar y controlar completamente** el workspace GetUpSoft a través de una API centralizada segura. Esto permite:

- 📁 **Leer/Escribir/Eliminar archivos** — modificar código, configuración, documentación
- 🔄 **Operaciones Git** — commit, push, pull, ver estado
- ⚙️ **Ejecutar comandos** — npm, python, docker, make, etc.
- 📊 **Historial completo** — log de todas las operaciones realizadas

---

## Endpoints API

### Workspace Status
```
GET /api/workspace/status
```
Retorna el estado del workspace y git:
```json
{
  "workspace_root": "/path/to/GetUpSoft_Workspace",
  "initialized": true,
  "git": {
    "branch": "main",
    "changes": ["M src/file.py", "?? new_file.txt"],
    "unpushed_commits": ["abc1234 feat: new feature"],
    "has_changes": true
  }
}
```

---

### File Operations

#### Listar Archivos
```
GET /api/workspace/files?path=03_AI_Automation/orca
```
Retorna lista de archivos/directorios en la ruta:
```json
{
  "path": "03_AI_Automation/orca",
  "files": [
    {"name": "src", "path": "03_AI_Automation/orca/src", "type": "dir"},
    {"name": "pyproject.toml", "path": "03_AI_Automation/orca/pyproject.toml", "type": "file", "size": 2345}
  ]
}
```

#### Leer Archivo
```
POST /api/workspace/files/read
Content-Type: application/json

{
  "path": "03_AI_Automation/orca/pyproject.toml"
}
```
Retorna:
```json
{
  "path": "03_AI_Automation/orca/pyproject.toml",
  "content": "[build-system]\nrequires = [\"setuptools\"]..."
}
```

#### Escribir/Modificar Archivo
```
POST /api/workspace/files/write
Content-Type: application/json

{
  "path": "nuevoproyecto/README.md",
  "content": "# Nuevo Proyecto\n\nDescripción aquí...",
  "create_dirs": true
}
```
Retorna:
```json
{
  "success": true,
  "path": "nuevoproyecto/README.md"
}
```

#### Eliminar Archivo
```
POST /api/workspace/files/delete
Content-Type: application/json

{
  "path": "archivo_obsoleto.txt"
}
```

---

### Git Operations

#### Ver Estado
```
GET /api/workspace/status
```
(Incluye git status — ver arriba)

#### Commit
```
POST /api/workspace/git/commit
Content-Type: application/json

{
  "message": "feat: add new feature",
  "files": ["src/file.py", "tests/test_file.py"]  // null = todos los cambios
}
```
Retorna:
```json
{
  "success": true,
  "message": "[main abc1234] feat: add new feature\n 2 files changed...",
  "error": null
}
```

#### Push
```
POST /api/workspace/git/push
Content-Type: application/json

{
  "branch": "main",
  "force": false
}
```

#### Pull
```
POST /api/workspace/git/pull
Content-Type: application/json

{
  "branch": "main"
}
```

---

### Command Execution

#### Ejecutar Comando
```
POST /api/workspace/execute
Content-Type: application/json

{
  "command": "npm install",
  "cwd": "01_Core_Platform/getupsoft-site",
  "timeout": 300
}
```
Retorna:
```json
{
  "success": true,
  "returncode": 0,
  "stdout": "up to date...",
  "stderr": ""
}
```

**Comandos permitidos (whitelist):**
- npm, pnpm, yarn
- python, pip
- git, docker
- make, bash, sh

---

### Logs

#### Obtener Historial de Operaciones
```
GET /api/workspace/logs
```
Retorna:
```json
{
  "operations": [
    {
      "timestamp": "2026-05-19T15:30:00.123456",
      "type": "file",
      "operation": "write",
      "path": "nuevoproyecto/README.md",
      "success": true,
      "message": ""
    },
    {
      "timestamp": "2026-05-19T15:31:00.654321",
      "type": "git",
      "operation": "commit",
      "path": "main",
      "success": true,
      "message": "[main abc1234] feat: add new feature"
    }
  ]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear un Nuevo Proyecto
```bash
# 1. Crear directorio y archivo principal
curl -X POST http://localhost:8015/api/workspace/files/write \
  -H "Content-Type: application/json" \
  -d '{
    "path": "nuevoproyecto/main.py",
    "content": "print(\"Hola mundo\")",
    "create_dirs": true
  }'

# 2. Hacer commit
curl -X POST http://localhost:8015/api/workspace/git/commit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "init: create new project",
    "files": null
  }'

# 3. Push a GitHub
curl -X POST http://localhost:8015/api/workspace/git/push \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}'
```

### Ejemplo 2: Actualizar Dependencias
```bash
# 1. Ejecutar npm install
curl -X POST http://localhost:8015/api/workspace/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command": "npm install",
    "cwd": "01_Core_Platform/getupsoft-site"
  }'

# 2. Ver cambios en package-lock.json
curl -X POST http://localhost:8015/api/workspace/files/read \
  -H "Content-Type: application/json" \
  -d '{"path": "01_Core_Platform/getupsoft-site/package-lock.json"}'

# 3. Commit y push
curl -X POST http://localhost:8015/api/workspace/git/commit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "chore: update dependencies",
    "files": ["01_Core_Platform/getupsoft-site/package-lock.json"]
  }'
```

### Ejemplo 3: Automatizar Deploy con Versionado
```bash
# 1. Editar version en pyproject.toml
curl -X POST http://localhost:8015/api/workspace/files/read \
  -H "Content-Type: application/json" \
  -d '{"path": "03_AI_Automation/orca/pyproject.toml"}'

# ... procesar y actualizar versión...

curl -X POST http://localhost:8015/api/workspace/files/write \
  -H "Content-Type: application/json" \
  -d '{
    "path": "03_AI_Automation/orca/pyproject.toml",
    "content": "[build-system]..."
  }'

# 2. Commit y tag
curl -X POST http://localhost:8015/api/workspace/git/commit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "chore: bump version to 0.2.0",
    "files": ["03_AI_Automation/orca/pyproject.toml"]
  }'

# 3. Push
curl -X POST http://localhost:8015/api/workspace/git/push \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}'
```

---

## Seguridad

### 🔒 Medidas Implementadas

1. **Whitelist de Comandos** — Solo se pueden ejecutar comandos seguros (npm, python, git, docker, etc.)
2. **Path Validation** — Los archivos se acceden solo dentro del workspace root
3. **Non-force Git Push** — Se usa `--force-with-lease` en lugar de `--force` para prevenir sobrescrituras accidentales
4. **Timeout** — Todos los comandos tienen timeout máximo de 300s (5 minutos)
5. **Error Logging** — Todas las operaciones se registran con resultado (éxito/error)

### ⚠️ Consideraciones

- Los comandos se ejecutan con los permisos del usuario que corre Orca
- El token/credencial de GitHub debe estar configurado en el servidor para que git push funcione
- Se recomienda usar SSH keys en lugar de passwords para git operations
- El historial de operaciones está en memoria (persiste mientras Orca corre)

---

## Arquitectura

```
Orca FastAPI Server
    ↓
WorkspaceManager (workspace_manager.py)
    ├─ FileSystem Operations (read, write, delete, list)
    ├─ Git Operations (status, commit, push, pull)
    └─ Command Execution (subprocess with whitelist)
    ↓
WorkspaceEndpoints (workspace_endpoints.py)
    └─ FastAPI Endpoints + Request/Response Models
```

---

## Tests

Para ejecutar tests del Workspace Manager:
```bash
python -m pytest tests/test_workspace_manager.py -v
```

---

## Próximos Pasos (Futuros)

- [ ] Dashboard UI para File Explorer / Git Operations
- [ ] Autenticación para acceso seguro (requiere tokens)
- [ ] Persistencia de historial en base de datos
- [ ] Integración con Deploy Copilot
- [ ] Webhooks para cambios automáticos
- [ ] Multi-workspace support

---

**Implementado por:** Claude Haiku 4.5  
**Versión:** 1.0
