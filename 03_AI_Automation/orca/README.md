# AI Automation Orchestrator

Base en Python para generar con IA:

- flujos de prueba para proyectos
- automatizaciones operativas
- scripts de interaccion para usuarios y clientes
- monitoreo grafico de workflows en ejecucion

La arquitectura ya viene preparada para **agregar mas modelos despues** sin rehacer el servicio.

## Lo que incluye

- Catalogo de modelos en `config/models.example.json`
- Proveedor inicial compatible con `OpenAI()` usando NVIDIA API Gateway
- CLI para:
  - listar modelos
  - generar flujos de prueba
  - generar automatizaciones
  - generar scripts de interaccion
- API HTTP y dashboard web para monitoreo
- Separacion entre:
  - configuracion
  - proveedores
  - generadores
  - CLI

## Estructura

```text
config/
  models.example.json
src/ai_automation_orchestrator/
  cli.py
  config.py
  jobs.py
  service.py
  webapp.py
  generators/
    automation_flows.py
    interaction_scripts.py
    test_flows.py
  providers/
    base.py
    nvidia_openai.py
tests/
```

## Configuracion

1. Crea un entorno virtual.
2. Instala el proyecto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

3. Copia el catalogo de modelos:

```powershell
Copy-Item .\config\models.example.json .\config\models.json
```

4. Configura la variable de entorno del proveedor:

```powershell
$env:NVIDIA_API_KEY="tu_api_key"
$env:NVIDIA_API_KEY_KIMI="tu_api_key_para_kimi"
$env:NVIDIA_API_KEY_GEMMA="tu_api_key_para_gemma"
```

## Uso rapido

Listar modelos disponibles:

```powershell
ai-orchestrator list-models
```

Levantar API + dashboard:

```powershell
ai-orchestrator serve --host 0.0.0.0 --port 8015
```

Luego abre:

- `http://localhost:8015/` para el dashboard
- `http://localhost:8015/docs` para la documentacion interactiva

Modelos integrados actualmente:

- `deepseek-v4-pro`
- `kimi-k2-6`
- `gemma-4-31b-it`
- `minimax-m2-7`
- `phi-4-multimodal-instruct`
- `llama-4-maverick-17b-128e-instruct`

## Catalogo NVIDIA Build gratuito

Orca ahora incluye dos artefactos para el catalogo gratuito de `build.nvidia.com`:

- `config/nvidia_build_free_models.json`: snapshot crudo obtenido con Selenium.
- `config/models.nvidia-free.generated.json`: catalogo transformado a formato Orca.

Refrescar el snapshot y regenerar el catalogo:

```powershell
ai-orchestrator sync-nvidia-build-free-models
```

Abrir Chrome visible para depuracion:

```powershell
ai-orchestrator sync-nvidia-build-free-models --headed
```

Usar el catalogo generado completo:

```powershell
$env:AI_ORCHESTRATOR_CONFIG_PATH="C:\Users\yoeli\Documents\GetUpSoft_Workspace\03_AI_Automation\orca\config\models.nvidia-free.generated.json"
ai-orchestrator list-models
```

Notas de compatibilidad:

- El snapshot captura todos los modelos `Free Endpoint` visibles al momento de la ejecucion.
- El catalogo generado filtra endpoints especializados no compatibles con el flujo actual de `chat.completions`, por ejemplo detectores, rerankers, OCR, safety-only, embeddings y TTS.
- `config/models.json` y `config/models.example.json` se mantienen como seleccion curada y estable.

Generar un flujo de pruebas:

```powershell
ai-orchestrator generate-test-flow `
  --project "Portal de clientes" `
  --context "Frontend React, API REST, login, pagos y reportes" `
  --model "kimi-k2-6" `
  --output .\outputs\portal-clientes-pruebas.md
```

Generar una automatizacion:

```powershell
ai-orchestrator generate-automation-flow `
  --goal "Automatizar onboarding de nuevos clientes" `
  --systems "CRM, correo, facturacion y Slack" `
  --context "Debe incluir validaciones y puntos de aprobacion" `
  --model "gemma-4-31b-it" `
  --output .\outputs\onboarding-clientes.md
```

Generar un script de interaccion:

```powershell
ai-orchestrator generate-interaction-script `
  --audience "Clientes enterprise" `
  --objective "Guiar la activacion inicial del servicio" `
  --tone "Profesional y cercano" `
  --context "Incluir objeciones comunes y respuestas" `
  --output .\outputs\script-activacion.md
```

## Agregar mas modelos

Solo necesitas:

1. agregar una nueva entrada en `config/models.json`
2. apuntarla a un `provider`
3. definir la variable de entorno de su API key

Ejemplo de nuevas entradas futuras:

- otro modelo de NVIDIA
- OpenAI directo
- Anthropic
- Azure OpenAI
- Ollama local

Si el proveedor nuevo requiere otra forma de autenticacion o cliente, se agrega otro archivo en `src/ai_automation_orchestrator/providers/`.

## Seguridad

- No guardes API keys en el codigo.
- Usa variables de entorno.
- Mantén `config/models.json` fuera de git si lo personalizas.

## Credenciales web por usuario

El dashboard web ahora incluye una seccion de credenciales para:

- `OpenAI / ChatGPT`
- `Gemini`
- `Claude`
- `Manus`

Comportamiento actual:

- permite guardar credenciales en scope `global` o `user`;
- la resolucion usa prioridad `user > global > environment`;
- los endpoints nunca devuelven el token completo, solo una version enmascarada;
- el almacenamiento actual usa `data/user_credentials.json` para desarrollo local;
- las variables de entorno siguen funcionando como fallback legacy.

Endpoints nuevos:

- `GET /api/credentials?user_id=...`
- `PUT /api/credentials/global`
- `PUT /api/credentials/user`
- `DELETE /api/credentials/global/{provider}`
- `DELETE /api/credentials/user/{provider}?user_id=...`

## Endpoints principales

- `GET /health`
- `GET /api/models`
- `GET /api/stats`
- `GET /api/workflows`
- `GET /api/workflows/{id}`
- `POST /api/workflows/test-flow`
- `POST /api/workflows/automation-flow`
- `POST /api/workflows/interaction-script`
- `GET /api/rowboat/status`
- `POST /api/rowboat/chat`

## Integracion con Rowboat

Rowboat corre como servicio externo y Orca lo consume por HTTP usando la API:

```text
POST {ROWBOAT_HOST}/api/v1/{ROWBOAT_PROJECT_ID}/chat
```

Variables requeridas:

```powershell
$env:ROWBOAT_HOST="http://localhost:3000"
$env:ROWBOAT_PROJECT_ID="tu_project_id"
$env:ROWBOAT_API_KEY="tu_api_key"
```

Validar configuracion:

```powershell
ai-orchestrator rowboat-status
```

Enviar un mensaje a Rowboat:

```powershell
ai-orchestrator rowboat-chat `
  --message "Prepara un resumen de mis pendientes de hoy"
```

Desde la API de Orca:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8015/api/rowboat/chat `
  -ContentType "application/json" `
  -Body '{"message":"Prepara un brief para mi proxima reunion"}'
```

El repositorio Rowboat fue clonado como referencia en:

```text
..\rowboat
```

Para correrlo localmente, usa su `docker-compose.yml` o su app de escritorio y configura `ROWBOAT_HOST` con la URL donde quede disponible.

## Plugin de aplauso para clientes

Orca expone un paquete descargable que escucha el microfono del cliente y abre Orca cuando detecta un aplauso:

```text
GET /plugin
GET /downloads/orca-clap-plugin.zip
```

Configura la URL publica que ira dentro del plugin:

```powershell
$env:ORCA_PUBLIC_URL="https://orca.getupsoft.com"
```

Uso del cliente:

1. Descargar `orca-clap-plugin.zip` desde `/plugin`.
2. Descomprimirlo.
3. Abrir `orca-clap-launcher.html`.
4. Hacer clic en `Activar escucha` y aceptar el microfono.
5. Dar un aplauso fuerte para abrir Orca.

## Despliegue

El repositorio incluye:

- `Dockerfile`
- `deploy/docker-compose.yml`
- `deploy/deploy.sh`
- `.github/workflows/deploy.yml`

El despliegue publica la app en `127.0.0.1:8015` y agrega un bloque `server_name` aislado al nginx existente del servidor para no mezclar este servicio con los demas.

### Secrets esperados en GitHub Actions

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_APP_PATH`
- `APP_DOMAIN`
- `NVIDIA_API_KEY`
- `NVIDIA_API_KEY_KIMI`
- `NVIDIA_API_KEY_GEMMA`

