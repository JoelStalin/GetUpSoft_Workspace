# 🧠 Modelo GPT-5 — Odoo Architect: Agente de IA Cross-Versión (v15-v18)

## I. Misión Arquitectónica
Diseñar un **Agente de Inteligencia Artificial desacoplado**, seguro y compatible entre versiones Odoo **v15 a v18**, mediante un **Modelo de Tres Capas** que garantice:
- **Persistencia funcional** frente a los cambios de API entre versiones.
- **Integridad transaccional** mediante uso exclusivo del ORM nativo.
- **Orquestación inteligente** de acciones a través de *Function Calling* seguro.

---

## II. Arquitectura General del Agente Odoo (RAG Agentic)

### 1. Capa LLM (Lenguaje)
- Independiente de Odoo, conectable a **OpenAI, Mistral, Anthropic u Ollama**.
- Eficiencia optimizada mediante **prompting estructurado y reducción de tokens**.
- Control centralizado de **latencia y costos** mediante la Capa Agente.

### 2. Capa de Orquestación (Agente Cerebral)
- Basada en **LangChain/LlamaIndex**.
- Decide cuándo realizar:
  - **Consultas RAG** (recuperación de conocimiento).
  - **Acciones transaccionales ORM** (Tooling seguro).
- Incluye:
  - Motor de razonamiento.
  - Historial contextual.
  - Análisis semántico de intenciones (Intent Parser).

### 3. Capa Odoo-Nativa (Módulo Delgado)
- Responsabilidad mínima:
  - Recepción de la orden estructurada del Gateway.
  - Ejecución del método ORM bajo contexto de seguridad.
- **Versionado dinámico** vía `odoo.release.version_info`.

---

## III. API Gateway Uniforme (v15 → v18)

| Métrica | v15/v16 | v18 | Adaptación Arquitectónica |
|----------|----------|-----|---------------------------|
| **Protocolo** | JSON-RPC / XML-RPC | REST, GraphQL, WebSockets | Traducción RPC ↔ REST |
| **Autenticación** | API Key / Sesión | OAuth2 / Token | Centralización en Gateway |
| **Seguridad LLM** | Credenciales expuestas | Tokens aislados | Aislamiento del Agente |
| **Gestión de errores** | RPC crudo | JSON limpio | Normalización uniforme |

> 🔒 El **Gateway** actúa como mediador de seguridad:
> - Implementa **OAuth2 y gestión de sesiones**.
> - Traduciendo y unificando protocolos.
> - Filtra y valida todas las solicitudes del Agente.

---

## IV. Estrategia de Datos y RAG

### A. Integridad Transaccional (ORM)
- Cualquier acción CRUD debe ejecutarse por el ORM:
  ```python
  record = self.env['sale.order'].create(vals)
  ```
- Garantiza **ACLs**, *Record Rules* y consistencia.

### B. Pipeline ETL Asíncrono (para RAG)
- **Extract:** Obtiene datos por ORM o réplica PostgreSQL controlada.
- **Transform:** Fragmenta documentos (“chunking”) y los estandariza.
- **Load:** Vectoriza embeddings en **pgvector / ChromaDB / Qdrant**.
- **Prohibición absoluta de SQL directo** en producción.

---

## V. Tooling Seguro y Function Calling

### A. Generación de Esquemas Dinámicos
1. **AST Analysis (Python):** `ast.parse()` para obtener firma y docstring.  
2. **Correlación XML/ORM:** introspección de `ir.model.fields` y metadatos.  
3. **Validación ACLs:** `check_access_rights()` según permisos del usuario.  

Resultado:  
Un **JSON schema dinámico** que el LLM puede consumir para invocar funciones con semántica y tipos válidos.

### B. Ejemplo de Tool Seguro
```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def llm_create_order(self, partner_id: int, product_ids: list):
        """Crea una orden de venta para el cliente indicado."""
        self.check_access_rights('create')
        vals = {'partner_id': partner_id, 'order_line': [(0, 0, {'product_id': pid}) for pid in product_ids]}
        return self.create(vals).id
```

---

## VI. Infraestructura y Despliegue

### A. Microservicios Desacoplados
- Cada capa (LLM, Agente, Vector DB) corre en **contenedores Docker/K8s**.
- Escalado horizontal independiente del ERP.
- Tareas de IA largas → **procesamiento asíncrono (Celery/ir.cron)**.

### B. Estrategia CI/CD y Testing Multiversión
- **Pruebas paralelas** contra instancias v15, v16, v17, v18.
- El módulo Odoo solo adapta pequeñas diferencias; el **Gateway absorbe la complejidad**.
- Soporte proyectado para **GraphQL y WebSockets** (v18+).

---

## VII. Hoja de Ruta Recomendada

| Fase | Objetivo | Entregables |
|------|-----------|-------------|
| **I. Infraestructura** | Desplegar Gateway + Vector DB | Docker/K8s, API REST estándar |
| **II. RAG y Datos** | Construir ETL asíncrono + indexación inicial | Pipelines de extracción y embeddings |
| **III. Tooling IA** | Analizador AST/XML + Módulo ORM delgado | Llamadas seguras y dinámicas del Agente |

---

## VIII. Conclusiones

1. **Desacoplamiento total:** El Agente IA no depende del ciclo de actualización de Odoo.  
2. **Seguridad asegurada:** Credenciales y ejecución se aíslan por capas.  
3. **Compatibilidad garantizada:** El API Gateway neutraliza el delta entre versiones.  
4. **Escalabilidad asegurada:** Arquitectura de microservicios lista para IA generativa.
