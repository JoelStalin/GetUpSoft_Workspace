# VS Code + Continue + Ollama

## Arquitectura

Esta configuración conecta VS Code con la extensión Continue usando el endpoint local de Ollama en http://localhost:11434. La ruta de configuración usada por Continue es:

- C:\Users\<usuario>\.continue\config.yaml

## Requisitos

- Windows 10 o 11
- PowerShell 5+ o 7+
- VS Code instalado con la CLI de `code`
- Ollama escuchando en localhost:11434
- Extensión Continue.continue

## Extensión utilizada

- Identificador: Continue.continue

## Configuración aplicada

El archivo de configuración contiene un modelo llamado `Llama 3 Local` con:

- provider: ollama
- model: llama3:latest
- apiBase: http://localhost:11434

## Validación de la API

```powershell
curl.exe http://localhost:11434/api/tags
```

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:11434/api/tags'
```

## Prueba de generación

```powershell
$body = @{
    model = 'llama3:latest'
    prompt = 'Responde exactamente: Ollama funciona correctamente'
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:11434/api/generate' -ContentType 'application/json' -Body $body
```

## Solución para `ollama` no reconocido

Continue no necesita que el ejecutable `ollama.exe` esté en el PATH para funcionar, porque la integración usa HTTP. Si el ejecutable existe pero PowerShell no lo detecta, se puede añadir manualmente al PATH del usuario.

## Selección del modelo en Continue

1. Abrir el panel de Continue.
2. Abrir el selector de modelos.
3. Seleccionar `Llama 3 Local`.

## Ejecución del script automatizado

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup_continue_ollama.ps1
```

## Errores comunes

- YAML inválido: revisar indentación y que `models` sea una lista.
- Extensión sin activar: abrir el panel de Continue y verificar que el modelo esté disponible.
- Ollama sin respuesta: comprobar que el proceso escuche en localhost:11434.