# 🧠 GetUpSoft Knowledge & Intelligence Protocol
## v1.0 | CEO: Joel Stalin Martinez Espinal

Este documento es de **lectura obligatoria** para cualquier agente de IA (Gemini CLI, Codex, Claude Code, etc.) que opere dentro de este Workspace.

---

### 1. Arquitectura de Inteligencia
Toda la "sabiduría" operativa de GetUpSoft se almacena en este directorio raíz para evitar la fragmentación:
- `/_Knowledge_Center/Agents_Skills`: Habilidades técnicas especializadas.
- `/_Knowledge_Center/Long_Term_Memory`: Contexto histórico, reglas de negocio y decisiones arquitectónicas por proyecto.
- `/_Knowledge_Center/Master_Prompts`: Librería de ingeniería de prompts estandarizada.
- `/_Knowledge_Center/Shared_Tests`: Suites de validación cross-project.

### 2. Mandato para Agentes
Antes de iniciar cualquier tarea en un sub-proyecto (ej. `/01_Core_Platform/getupsoft-site`), el agente DEBE:
1. **Cargar Contexto:** Consultar `Long_Term_Memory/[Proyecto]` para entender las reglas vigentes.
2. **Aplicar Estándares:** Usar los prompts de `Master_Prompts` para mantener la calidad de código y documentación.
3. **Validación Cruzada:** Asegurar que los cambios no rompan integraciones documentadas en la memoria de otros proyectos (ej. Integración Odoo-DGII).

### 3. Reglas de Oro de GetUpSoft
- **Naming:** Siempre `kebab-case` para repositorios y carpetas.
- **Silo DGII:** Toda la lógica fiscal dominicana reside **exclusivamente** en `easycount-core`. Otros proyectos deben usar el SDK o APIs para interactuar con ella.
- **Seguridad:** Prohibido el uso de secretos hardcoded. Toda configuración sensible debe ser inyectada vía variables de entorno.
- **Calidad:** Cada commit o cambio debe ser validado contra los `Shared_Tests` correspondientes.

### 4. Actualización de Memoria
Los agentes deben actualizar los archivos en `Long_Term_Memory` tras finalizar hitos importantes para asegurar que el conocimiento "no se pierda" entre sesiones.

---
**"Standardizing Intelligence for Infinite Scalability"**
