# Orca - Configuración de Proveedores de IA desde el Frontend

## 🎯 Vista General

La nueva sección **AI Providers** en Orca te permite conectar y gestionar los modelos de IA de pago directamente desde la interfaz web, sin necesidad de variables de entorno ni edición de archivos.

## 🚀 Cómo Acceder

1. Abre Orca: http://localhost:8015
2. Haz clic en el botón **AI Providers** en la barra lateral izquierda (ícono 📋)
3. Verás el panel de configuración de proveedores

## 📋 Proveedores Soportados

### 1. 🤖 OpenAI (GPT-4o)
**Para**: Documentación, textos SEO, contenido técnico

| Aspecto | Detalle |
|--------|---------|
| Modelos | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo |
| Costo | $5-15 por millón de tokens |
| URL | https://platform.openai.com/api/keys |

**Pasos de configuración:**
1. Ve a https://platform.openai.com/api/keys
2. Haz clic en "Create new secret key"
3. Copia la clave API
4. Pégala en el campo "API Key" en Orca
5. Haz clic en "Connect"
6. Opcional: Haz clic en "Test" para validar

### 2. 🧠 Claude 3.5 Sonnet (Anthropic)
**Para**: Planificación, revisión de código, arquitectura

| Aspecto | Detalle |
|--------|---------|
| Modelos | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku |
| Costo | $3-15 por millón de tokens |
| URL | https://console.anthropic.com/account/keys |

**Pasos de configuración:**
1. Ve a https://console.anthropic.com/account/keys
2. Haz clic en "Create Key"
3. Copia la clave API
4. Pégala en Orca
5. Haz clic en "Connect"

### 3. 🎨 Google Gemini
**Para**: Generación de imágenes, diseño de UI con Stitch/Figma

| Aspecto | Detalle |
|--------|---------|
| Modelos | Gemini 2.0 Flash, Gemini 1.5 Pro, Imagen-3 |
| Costo | Gratis + uso pago adicional |
| URL | https://cloud.google.com |

**Pasos de configuración:**
1. Ve a https://cloud.google.com
2. Crea un nuevo proyecto
3. Busca "Gemini API" y habilítala
4. Ve a "Credenciales" y crea una API Key
5. Copia y pega en Orca
6. Haz clic en "Connect"

### 4. 📱 Manus AI
**Para**: Automatización de redes sociales, programación de contenido

| Aspecto | Detalle |
|--------|---------|
| Modelos | Integraciones de redes sociales |
| Costo | Gratis + tiers Premium |
| URL | https://manus.ai |

**Pasos de configuración:**
1. Ve a https://manus.ai
2. Crea una cuenta
3. Genera una API Key en tu dashboard
4. Copia y pega en Orca
5. Haz clic en "Connect"

## 💡 Cómo Usar

### Conectar un Proveedor

```
1. Encuentra la tarjeta del proveedor
2. Pega tu API Key en el campo (aparecerá como puntitos por seguridad)
3. Haz clic en "Connect"
4. ¡Listo! Verás el ícono verde "CONNECTED ✓"
```

### Probar la Conexión

- Haz clic en **"Test"** para validar la API Key
- ✓ Verde = API Key válida
- ✗ Rojo = Error en la validación
- ⚠ Amarillo = Ingresa una key primero

### Desconectar un Proveedor

- Haz clic en **"Clear"**
- Se eliminará la credencial del sistema
- Puedes volver a conectar en cualquier momento

### Ver Estado de Conexión

- **Verde "CONNECTED ✓"** = Proveedor listo para usar
- **Gris "DISCONNECTED"** = Necesita configuración
- El contador en la parte superior muestra "X / 4 CONNECTED"

## 🎯 Selección de Modelo por Tarea

| Tarea | Proveedor Recomendado | Costo |
|------|----------------------|-------|
| 📄 Documentación | OpenAI GPT-4o | $5-15 |
| 🔧 Planificación y Review | Claude 3.5 Sonnet | $3-15 |
| 🎨 Diseño de UI e Imágenes | Gemini 2.0 Flash | Gratis + |
| 📱 Redes Sociales | Manus AI | Gratis + |

## 💰 Estimación de Costos Mensuales

### Presupuesto Conservador: $75-85/mes
- Usa tiers gratis
- Uso limitado de APIs pagadas
- Perfecto para aprender

### Presupuesto Moderado: $260/mes
- Uso regular de todos los proveedores
- Generación de contenido profesional
- Para equipos pequeños

### Presupuesto Empresarial: $530+/mes
- Uso de alto volumen
- Todas las características habilitadas
- Para entornos de producción

## 🔒 Notas de Seguridad

✅ **Almacenamiento Local**: Las claves se guardan localmente en la BD de Orca  
✅ **Campos Protegidos**: Las claves se muestran como puntitos  
⚠️ **Nunca Compartas**: No compartas tus API Keys con nadie  
🔄 **Rotación**: Cambia tus claves cada 3-6 meses  

## 🔗 Integración en Flujos

Una vez conectado, el proveedor está disponible para:

- **Flujos n8n**: Selecciona el proveedor en los nodos
- **Automation Flows**: Enruta tareas a proveedores específicos
- **Test Flows**: Usa modelos específicos para testing
- **Professional Page Design**: Mejor calidad de salida

### Ejemplo: Usar OpenAI en un Flujo

```json
{
  "goal": "Generar documentación profesional",
  "systems": "technical-documentation, code-examples",
  "context": "...",
  "model": "openai/gpt-4o"
}
```

## ⚠️ Solución de Problemas

### "API key is invalid"
→ Verifica que copiaste la clave completa (sin espacios)  
→ Genera una nueva clave y prueba de nuevo

### "Connection timeout"
→ Verifica tu conexión a internet  
→ Chequea si el API del proveedor está operativo  
→ Intenta de nuevo en unos momentos

### "No puedo recuperar mi API Key"
→ Orca no guarda claves recuperables por seguridad  
→ Genera una nueva clave en el dashboard del proveedor  
→ Cópiala y pégala en Orca

## 📌 Mejores Prácticas

### 1. Usa Variables de Entorno en Producción
```bash
export OPENAI_API_KEY=sk-proj-...
export ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Configura Alertas de Presupuesto
- Ve al dashboard de billing de cada proveedor
- Establece límites mensuales
- Habilita alertas por email

### 3. Monitorea el Uso
- Revisa periódicamente cada dashboard
- Verifica costos antes de acumular
- Optimiza selección de modelos

### 4. Configura Modelos de Fallback
- Los modelos NVIDIA libres actúan como fallback automático
- Si un API de pago no está disponible, usa fallback
- Zero interruption en tus workflows

### 5. Prueba Primero
- Usa "Test" antes de desplegar completamente
- Corre flujos pequeños para verificar calidad
- Verifica costos en pruebas antes de escalar

## 🚀 Próximos Pasos

1. ✅ Obtén las API Keys de los proveedores que necesites
2. ✅ Conéctalos usando este dashboard
3. ✅ Prueba cada uno con el botón "Test"
4. ✅ Configura enrutamiento en flujos n8n
5. ✅ Monitorea costos y ajusta según sea necesario
6. ✅ Configura fallback a modelos gratuitos

## 📚 Referencia de APIs

También puedes gestionar proveedores programáticamente:

```bash
# Listar proveedores
GET /api/providers

# Obtener detalles de un proveedor
GET /api/providers/{provider}

# Validar API Key
POST /api/providers/{provider}/validate

# Conectar proveedor
POST /api/providers/{provider}/connect

# Desconectar proveedor
DELETE /api/providers/{provider}/disconnect

# Estado de todos los proveedores
GET /api/providers/status?user_id=default
```

---

**Versión**: 1.0  
**Actualizado**: 19/05/2026  
**Estado**: ✅ Listo para Producción  

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección "Solución de Problemas"
2. Verifica el estado de los APIs: https://status.openai.com
3. Consulta la documentación oficial de cada proveedor
