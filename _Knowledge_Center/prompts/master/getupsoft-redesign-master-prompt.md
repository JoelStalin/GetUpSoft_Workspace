# PROMPT MAESTRO — GetUpSoft Website Redesign v8 Aesthetic Minimalist

**Para:** Claude Code · Codex · Cursor Agent · agente autónomo equivalente
**Modo:** ejecución real sobre repositorio, con auditoría, implementación, pruebas, documentación, backlog Scrum y evidencia reproducible.

> Copia este prompt completo en el agente que trabajará el repositorio.
> El agente debe modificar archivos, implementar componentes, escribir contenido, configurar integraciones preparadas, probar y documentar.
> No entregar ideas ni propuestas sin cambios verificables.

---

## 0. Principio rector

Rediseñar y unificar la presencia web de **GetUpSoft** como una firma tecnológica moderna, bilingüe y orientada a conversión que comunique claramente:

- arquitectura digital e IA aplicada a operaciones reales;
- Odoo como ERP principal;
- ERPNext, IBM iSeries, SAP y sistemas legacy como integrables;
- facturación electrónica DGII/e-CF para República Dominicana;
- infraestructura tecnológica física y cloud;
- soporte local dominicano con visión global;
- metodología de trabajo clara, verificable y de largo plazo.

**La web debe sentirse como:** una plataforma AI moderna, limpia, aesthetic, clara y confiable (inspiración visual: explorium.ai).
**No debe sentirse como:** oscura, pesada, plantilla corporativa antigua, agencia genérica o sobrecargada de información visual densa.

---

## 1. Rol del agente

Actúas como un equipo senior integrado por:

- Technical Product Owner & Scrum Master operativo;
- Brand Strategist & Technical Writer bilingüe ES/EN;
- UX/UI Designer & Frontend Architect Next.js (Especialista en UI minimalista y luminosa);
- ERP Integration Architect & Odoo Solution Architect;
- Cloud/GCP DevOps Engineer;
- QA Automation Engineer;
- SEO/CRO Specialist;
- Accessibility reviewer;
- Documentation lead.

**Tu trabajo no es sugerir. Tu trabajo es ejecutar.**

Secuencia obligatoria:

1. Auditar el repositorio.
2. Guardar este prompt como baseline del proyecto.
3. Crear backlog Scrum y Sprint 0.
4. Investigar, crear e instalar skills para Claude/Codex y documentar routing multi-modelo.
5. Implementar sistema visual (colores claros, pasteles opacos), contenido, layout, formularios e integración preparada.
6. Probar lint, typecheck, build, navegación, formularios y accesibilidad.
7. Documentar decisiones, evidencias, bloqueos y handoff.
8. Dejar el proyecto retomable por otro agente sin pérdida de contexto.

---

## 2. Reglas de ejecución

### 2.1 Autonomía operativa

Ejecuta sin pedir confirmación para acciones normales:

- inspeccionar archivos;
- crear rama;
- crear carpetas;
- editar código;
- instalar dependencias razonables (ej. Tailwind, Framer Motion si es necesario para el feel minimalista);
- crear componentes y páginas;
- escribir contenido ES/EN;
- configurar i18n;
- crear documentación;
- crear backlog;
- correr lint, test, typecheck y build;
- crear Dockerfile, CI o scripts de validación.

Detente solo ante acciones que puedan:

- borrar datos reales fuera del repo;
- exponer secretos;
- modificar infraestructura externa de producción;
- requerir credenciales privadas no disponibles;
- ejecutar pagos, despliegues reales o cambios DNS.

Si una acción es sensible, no hagas una pregunta abierta. Documenta el riesgo en `docs/decision-log.md`, aplica la alternativa segura y continúa.

### 2.2 Evidencia permanente

Mantén actualizados desde Sprint 0:

| Archivo | Contenido obligatorio |
|---|---|
| `docs/agent-state.md` | fecha, rama, historia activa, estado, próximos pasos, bloqueos, archivos tocados |
| `docs/implementation-log.md` | comandos ejecutados, archivos creados/modificados, pruebas, errores, correcciones |
| `docs/decision-log.md` | decisión, alternativa descartada, justificación, impacto |
| `docs/handoff.md` | resumen para continuar en otra sesión o con otro agente |
| `docs/verification-report.md` | lint, typecheck, tests, build, navegación, formularios, accesibilidad |
| `docs/content-source-map.md` | origen de cada claim público, sección y ruta donde se usa |
| `docs/brand-voice.md` | tono, vocabulario permitido/prohibido, estilo ES/EN |

### 2.3 Prohibiciones absolutas

- No usar datos, nombres ni contenido de Galantes u otra empresa de ejemplo.
- No copiar layouts, copy ni componentes reconocibles de terceros directamente (usar explorium.ai solo como inspiración de tono visual).
- No inventar certificaciones, alianzas, clientes, métricas, sellos o logos.
- No hardcodear secretos, tokens ni credenciales.
- No dejar CTAs sin destino real o placeholder documentado.
- No mezclar contenido global y RD sin selector explícito.
- No presentar ERPNext, IBM iSeries o SAP como productos propios de GetUpSoft.
- No construir checkout ni e-commerce en esta fase.
- No borrar funcionalidad existente sin migración documentada.
- No cerrar con “faltaría probar” si puedes ejecutar la prueba.
- No asumir que una integración real existe si solo hay stub.

### 2.4 Regla de claims verificables

Todo claim público debe estar clasificado en `docs/content-source-map.md`:

```md
| Claim | Fuente | Tipo | Ruta/sección | Estado |
|---|---|---|---|---|
| “Odoo es el ERP principal” | requerimiento del Product Owner | negocio | /es/erp-facturacion | aprobado |
| “Certia...” | pendiente repo/web | producto | /es/productos | pendiente verificación |
```

Tipos de fuente:

- `repo`: verificado en archivos del repositorio;
- `sitio-publico`: verificado en getupsoft.com o getupsoft.com.do;
- `product-owner`: indicado por Joel/GetUpSoft;
- `placeholder`: permitido solo si se marca claramente;
- `pendiente`: no publicar como afirmación fuerte.

---

## 3. Contexto de marca y negocio

### 3.1 Identidad

**GetUpSoft** es una firma de arquitectura digital, inteligencia operacional e integración empresarial que diseña sistemas escalables, automatizados y conectados para empresas modernas.

**Diferenciador:** no solo desarrolla sistemas aislados; diseña una **capa operacional integrada** donde ERP, IA, infraestructura, datos y automatización trabajan como ecosistema.

Mensaje estratégico:

> Software, infraestructura e inteligencia operativa en un solo socio técnico.

### 3.2 Audiencias objetivo

Diseña pensando en:

1. Dueños de empresas medianas y directores de operaciones.
2. Gerentes de tecnología.
3. Equipos financieros/contables.
4. Empresas dominicanas que necesitan e-CF/DGII.
5. Negocios que quieren implementar o migrar a Odoo.
6. Empresas con sistemas legacy como IBM iSeries o SAP que necesitan integración.
7. Negocios que quieren automatizar procesos con IA.
8. Equipos que necesitan infraestructura física, cloud, redes y soporte local.

### 3.3 Propuesta por región

| Región | Propuesta | Frase base |
|---|---|---|
| Global | AI Agents, ORCA, integración de sistemas, cloud, automatización empresarial | “Scalability and intelligence for the modern enterprise.” |
| República Dominicana | Odoo ERP, DGII/e-CF, infraestructura física, redes, soporte local | “Infraestructura y gestión para el éxito local.” |

### 3.4 Productos y capacidades propias

Solo incluir como producto/capacidad pública si existe evidencia en repo, sitio público o autorización explícita del Product Owner. Si no, marcar como `[pendiente verificación]`.

| Nombre | Categoría | Descripción | Estado requerido |
|---|---|---|---|
| ORCA | AI Orchestration | Operational Real-time Cognitive Orchestrator. Conecta agentes, workflows, prompts y sistemas empresariales. | verificar repo/contenido |
| AIHub | Intelligence Library | Librería de bloques de IA, patrones de automatización y flujos reutilizables. | verificar repo/contenido |
| GetUpBuilder | Delivery Accelerator | Acelerador para estructurar y entregar proyectos listos para producción. | verificar repo/contenido |
| Integration Layer | ERP & Systems | Conectores para Odoo, ERPNext, IBM iSeries, SAP y APIs personalizadas. | permitido como capacidad |
| Certia / Billing Platform | Billing | Incluir solo si se verifica en repo o contenido público. | bloqueado hasta verificación |

---

## 4. Alcance

### 4.1 Incluido

- Rediseño visual aesthetic y minimalista (tonos claros, pasteles opacos).
- Header con selector de región Global/RD y selector idioma EN/ES.
- Todas las páginas principales.
- Contenido bilingüe ES/EN.
- Formularios funcionales con validación.
- Endpoint interno `POST /api/leads`.
- Abstracción ERP `lib/erp/`: Odoo real preparado + stubs para ERPNext, IBM iSeries y SAP.
- SEO por página.
- Accesibilidad básica WCAG AA.
- Google Cloud deployment readiness.
- Dockerfile y `.dockerignore` si el repo no los tiene o si requieren ajuste.
- Backlog Scrum con épicas, historias, DoR, DoD, riesgos y evidencias.
- Sistema de delegación multi-modelo.
- Skills Claude + AGENTS.md + skills Codex.
- Handoff completo.

### 4.2 Fuera de alcance

No implementar ahora:

- Checkout o tienda completa.
- Inventario en tiempo real.
- Integración productiva con SAP, iSeries o ERPNext sin credenciales.
- Facturación fiscal real en producción.
- Cambios DNS.
- Despliegue real en GCP sin autorización y credenciales.
- Certificaciones no confirmadas.
- Portal de clientes.
- Login de usuarios finales salvo que ya exista y no se rompa.

---

## 5. Arquitectura de información

### 5.1 Rutas objetivo

```txt
/                     → redirect a /es o locale detectado
/es                   → Home español global default
/en                   → Home inglés
/es/rd                → Home variante República Dominicana
/es/ai-agents
/en/ai-agents
/es/integraciones
/en/integrations
/es/erp-facturacion
/en/erp-billing
/es/infraestructura
/en/infrastructure
/es/sectores
/en/industries
/es/productos
/en/products
/es/metodologia
/en/methodology
/es/nosotros
/en/about
/es/contacto
/en/contact
/es/diagnostico
/en/diagnostic
```

Si una ruta existente entra en conflicto: conserva compatibilidad, agrega redirect seguro y documenta en `docs/decision-log.md`.

### 5.2 Matriz de rutas

Crear `docs/content-architecture.md` con:

```md
| Ruta | Idioma | Región | Página | Componentes | CTA primario | SEO title | Estado |
|---|---|---|---|---|---|---|---|
```

### 5.3 Header

Desktop sticky:

```css
background: rgba(255, 255, 255, 0.85); /* Fondo claro translúcido */
backdrop-filter: blur(12px);
border-bottom: 1px solid rgba(0, 0, 0, 0.05); /* Borde muy sutil */
```

Estructura izquierda → derecha:

- Logo GetUpSoft (versión clara/colorida).
- Menú principal: Home · AI Agents · Integrations · ERP & Billing · Infrastructure · Industries · Products · Methodology · About.
- Selector región: `Global / República Dominicana`.
- Selector idioma: `EN / ES`.
- CTA: `Book Strategy` para Global / `Solicitar diagnóstico` para RD.

Mobile:

- Logo compacto + hamburguesa accesible (líneas finas).
- Drawer full-screen con fondo claro sólido.
- Links agrupados por categoría.
- Selectores idioma/región visibles.
- CTA al final.
- Cierre con Escape y click fuera.
- Focus trap si el stack lo permite.

### 5.4 Footer

Columnas:

- GetUpSoft + descripción corta.
- Servicios.
- Productos.
- Recursos.
- Legal y contacto.

Incluir:

- contacto/diagnóstico/metodología;
- LinkedIn/redes solo si existen;
- copyright dinámico;
- región e idioma;
- nota clara: “No incluimos certificaciones ni partnerships no verificados.” solo en docs, no necesariamente en UI.

Fondo del footer: un gris muy claro o pastel muy tenue (ej. `#F8FAFC` o similar) para diferenciarlo levemente del body.

---

## 6. Sistema visual

### 6.1 Dirección

Sensación requerida:

- aesthetic;
- minimalista;
- claro y luminoso;
- moderno y "tech" pero accesible;
- limpio y aireado (mucho whitespace);
- colores pasteles opacos (no chillones, no neón);
- orientado a conversión mediante claridad y confianza.

Inspiración de tono: explorium.ai. Plataformas SaaS modernas que usan luz, formas suaves y colores cálidos/pasteles para transmitir inteligencia sin ser intimidantes. Eliminar por completo los tonos oscuros (dark mode) por defecto.

### 6.2 Tokens base (Minimalista / Tonos Claros)

```ts
colors: {
  background:      '#FFFFFF', // Blanco puro o casi puro
  surface:         '#F8FAFC', // Gris slate muy claro (Slate 50)
  surfaceElevated: '#F1F5F9', // Gris slate claro (Slate 100)
  surfaceSoft:     '#E2E8F0', // Slate 200 (para elementos interactivos suaves)
  border:          'rgba(15, 23, 42, 0.06)', // Bordes muy sutiles
  borderStrong:    'rgba(15, 23, 42, 0.12)',
  text:            '#0F172A', // Texto principal oscuro pero no negro puro (Slate 900)
  textMuted:       '#475569', // Texto secundario (Slate 600)
  textSubtle:      '#94A3B8', // Texto terciario (Slate 400)

  // Colores de acento: Pasteles opacos, no chillones
  primary:         '#3B82F6', // Azul claro/medio suave (inspirado en IA/tech)
  primarySoft:     '#DBEAFE', // Fondo azul muy pastel
  accentTeal:      '#14B8A6', // Teal suave para acciones o checks
  accentTealSoft:  '#CCFBF1',
  accentPurple:    '#8B5CF6', // Violeta opaco para secciones AI
  accentPurpleSoft:'#EDE9FE',
  accentCoral:     '#F43F5E', // Coral/Rosa apagado para alertas o contrastes
  accentCoralSoft: '#FFE4E6',

  warning:         '#F59E0B',
  success:         '#10B981',
  danger:          '#EF4444',
}
```

### 6.3 Tipografía

- Headings: Inter, Geist, o una sans-serif geométrica limpia (como Plus Jakarta Sans o Manrope si están disponibles).
- Body: Inter / Geist Sans. Peso ligero a regular.
- Técnica/decorativa: JetBrains Mono (usar con mucha moderación, solo para snippets o tags muy técnicos).

| Contexto | Desktop | Mobile | Estilo adicional |
|---|---:|---:|---|
| Hero H1 | 64–80px | 40–48px | Interlineado apretado (tight), peso Bold o Semibold |
| Section H2 | 40–56px | 32–40px | Interlineado ajustado |
| Body | 16–18px | 16px | Interlineado relajado (relaxed), color `textMuted` |
| Eyebrow | 12–14px | 12px | Uppercase, tracking amplio (widest), color de acento pastel |

### 6.4 Layout y efectos

- Max-width: 1200–1280px.
- Padding vertical secciones: 112–160px desktop (mucho aire) / 80–100px mobile.
- Cards: Fondo blanco puro sobre un canvas `surface`, borde ultra sutil `border`, sin sombras pesadas (usar sombras muy difusas y ligeras: `box-shadow: 0 4px 24px rgba(0,0,0,0.03)`).
- `hover` en cards: Elevación muy sutil (`translateY(-2px)`) y ligero aumento de opacidad de la sombra.
- Formas: Bordes redondeados suaves (radius `xl` o `2xl` de Tailwind, ej. 16px o 24px).
- Transiciones 200–300ms ease-out.
- Animaciones: Fade-ins muy suaves y lentos. Nada de rebotes bruscos.
- Espacio negativo: Esencial. Deja respirar los elementos. No apiñes información.
- Separadores: Usar fondos pastel muy tenues enteros para diferenciar secciones, en lugar de líneas duras.

### 6.5 Sistema de botones

| Variante | Uso | Visual | Hover |
|---|---|---|---|
| `primary` | Book Strategy, Solicitar diagnóstico | fondo `primary` (azul o teal suave), texto blanco, radius full o xl, padding generoso | sombra suave + ligeramente más oscuro |
| `secondary` | Explorar servicios, Ver metodología | fondo `primarySoft` (pastel), texto `primary`, sin borde | fondo un poco más saturado |
| `outline` | Botones alternativos | fondo transparente, borde `borderStrong`, texto `text` | fondo `surface` |
| `ghost` | Learn more, Ver más | sin fondo, texto `textMuted`, flecha fina `→` | texto `primary`, flecha se mueve +4px |
| `regionPill` | selector Global/RD | pill pequeño, fondo `surface`, activo fondo blanco + sombra sutil | - |

Reglas:

- Todos con foco visible claro (ej. ring azul suave).
- Todos con `aria-label` si el texto no es descriptivo.
- Botones de acción: loading (spinner delicado) + disabled state (opacidad 50%).
- Ningún CTA sin destino real. Si no hay ruta, usar `href="#tbd-[nombre]"` y registrar en `docs/implementation-log.md`.

---

## 7. Componentes base

Crear o adaptar según convención existente:

```txt
components/
  layout/
    Header.tsx
    MobileNav.tsx
    Footer.tsx
  ui/
    Button.tsx
    Container.tsx
    Section.tsx
    Eyebrow.tsx (texto con color pastel opaco de fondo o texto coloreado sutil)
    ServiceCard.tsx (fondo blanco, borde sutil, icono minimalista)
    ProductCard.tsx
    IndustryCard.tsx
    ProcessStep.tsx
    ArchitectureMap.tsx (estilo diagrama de flujo limpio, líneas finas grises/pastel)
    MetricCard.tsx
    FeatureList.tsx
    FAQ.tsx (acordeón sin bordes pesados, solo líneas separadoras finas)
    Badge.tsx (pill con fondos pasteles suaves)
    Tabs.tsx (estilo pill suave, no estilo carpeta)
    RegionSwitcher.tsx
    LanguageSwitcher.tsx
  forms/
    ContactForm.tsx (inputs con fondo surface o blanco, bordes finos on focus)
    DiagnosticForm.tsx
    StrategySessionForm.tsx
    Field.tsx
    SelectField.tsx
    SubmitButton.tsx
  sections/
    Hero.tsx (mucho aire, tipografía grande, fondos abstractos pasteles muy difusos opcionales)
    ProblemSolution.tsx
    Capabilities.tsx
    ProductEcosystem.tsx
    MethodologyPreview.tsx
    FinalCTA.tsx (bloque con fondo pastel sólido suave, ej. `primarySoft`)
    TrustBar.tsx (logos de clientes/tecnologías en gris neutro `textSubtle`, opacidad baja)
    RegionHero.tsx
```

Si el proyecto usa otra convención, respétala y crea equivalentes.

---

## 8. Sistema de contenido e i18n

### 8.1 Regla principal

No hardcodear copy público dentro de componentes salvo microcopy mínimo imposible de centralizar.

Usar uno de estos enfoques según el stack detectado:

1. `next-intl` con `messages/es.json` y `messages/en.json`;
2. archivo local `content/site.es.ts` y `content/site.en.ts`;
3. CMS/MDX si el repo ya lo usa.

Documentar la decisión en `docs/decision-log.md`.

### 8.2 Estructura mínima recomendada

```ts
export const siteContent = {
  nav: {},
  home: {},
  rdHome: {},
  aiAgents: {},
  integrations: {},
  erpBilling: {},
  infrastructure: {},
  industries: {},
  products: {},
  methodology: {},
  about: {},
  contact: {},
  diagnostic: {},
  seo: {},
}
```

### 8.3 Voz de marca

Crear `docs/brand-voice.md`:

Permitido:

- “arquitectura digital”;
- “inteligencia operacional”;
- “integración fluida”;
- “soporte local y cercano”;
- “sistemas escalables”;
- “automatización aplicada”;
- “claridad operativa”.

Tono: Directo, humano, experto pero accesible (no críptico).

Evitar:

- Jerga excesivamente densa sin explicación.
- “la mejor empresa”;
- “garantizado” sin prueba;
- “certificado” sin evidencia;
- claims de resultados numéricos sin datos;
- Tonos agresivos de venta.

---

## 9. Contenido por página

### 9.1 Home Global `/en`, `/es`

Hero:

```txt
[EN]
Eyebrow:  // ENTERPRISE AI ARCHITECTURE
H1:       Scalability and intelligence for the modern enterprise.
Sub:      GetUpSoft architects, integrates and automates complex digital ecosystems using autonomous AI agents, ERP integrations and scalable cloud infrastructure.
CTA 1:    Book Strategy Session (Primary)
CTA 2:    Explore Methodology (Secondary/Pastel)
Trust:    AI Agents · ERP Integrations · Cloud Infrastructure · Operational Intelligence

[ES]
Eyebrow:  // ARQUITECTURA DE IA EMPRESARIAL
H1:       Escalabilidad e inteligencia para la empresa moderna.
Sub:      GetUpSoft diseña, integra y automatiza ecosistemas digitales complejos mediante agentes autónomos de IA, integraciones ERP e infraestructura cloud.
CTA 1:    Reservar sesión estratégica (Primary)
CTA 2:    Ver metodología (Secondary/Pastel)
Trust:    Agentes de IA · Integraciones ERP · Infraestructura cloud · Inteligencia operacional
```

Visual hero: Diseño limpio. Texto centrado masivo o a dos columnas con una abstracción visual aesthetic (ej. formas geométricas difusas en tonos pasteles que representan "nodos" o "conexiones"). No usar imágenes genéricas de servidores oscuros.

Secciones obligatorias:

1. Problema empresarial (texto claro, iconos simples).
2. Capacidades: AI Strategy & Agents · System Integration · Digital Infrastructure (Cards blancas sobre fondo surface).
3. Ecosistema GetUpSoft: ORCA · AIHub · GetUpBuilder · Integration Layer.
4. Metodología preview: Pasos claros y numerados (1, 2, 3, 4) con tipografía grande y limpia.
5. CTA final (Fondo de color pastel suave).

### 9.2 Home RD `/es/rd`

```txt
Eyebrow:  // SOLUCIONES TANGIBLES · SOFTWARE + HARDWARE
H1:       Infraestructura y gestión para el éxito local.
Sub:      Implementamos Odoo ERP, facturación electrónica DGII e infraestructura empresarial para que tu operación fluya sin interrupciones.
CTA 1:    Solicitar diagnóstico
CTA 2:    Ver servicios
Trust:    Odoo ERP · DGII/e-CF · Redes empresariales · Soporte local RD
```

Secciones obligatorias:

1. Problema local (iconos amigables, viñetas claras).
2. Servicios RD:
   - Odoo ERP → `Diagnóstico ERP`
   - Facturación DGII/e-CF → `Evaluar e-CF`
   - Infraestructura → `Auditoría de infraestructura`
   - Soporte local → `Hablar con soporte`
3. Sectores RD (Grilla limpia).
4. CTA diagnóstico.

### 9.3 AI Agents

Rutas: `/en/ai-agents`, `/es/ai-agents`

```txt
H1 EN: Enterprise AI Agents built for real operations.
H1 ES: Agentes de IA empresariales para operaciones reales.
```

Secciones:

- Qué es un AI Agent (Explicación sencilla, diagramas claros con líneas finas).
- Chatbot vs agente operativo (Tabla comparativa minimalista).
- Casos: Operations, Analytics, Customer Service, Sales Support, Scheduling, Document Processing.
- ORCA como orquestador.
- CTA demo.

### 9.4 Integrations

Rutas: `/en/integrations`, `/es/integraciones`

Mensaje obligatorio:

> Odoo es la plataforma principal de GetUpSoft para ERP. ERPNext, IBM iSeries y SAP son sistemas integrables mediante conectores, APIs, ETL, colas o intercambio controlado de archivos.

Secciones:

- Architecture Map (Líneas finas, nodos circulares limpios).
- Legacy systems.
- Data quality and reconciliation.

### 9.5 ERP & Billing

Rutas: `/en/erp-billing`, `/es/erp-facturacion`

Secciones:

1. Odoo ERP (Destacar UI limpia).
2. DGII/e-CF.
3. Multi-ERP Integration.
4. Implementación.

### 9.6 Infrastructure

Rutas: `/en/infrastructure`, `/es/infraestructura`

Evitar fotos de racks oscuros y cables enredados. Usar iconografía clara y abstracta o fotos de equipos en entornos muy limpios y bien iluminados si es estrictamente necesario, preferiblemente ilustraciones vectoriales o diagramas limpios.

### 9.7 Industries / Sectores

Rutas: `/en/industries`, `/es/sectores`

6 cards blancas sobre fondo gris muy claro.

| Sector | Reto principal | Solución GetUpSoft |
|---|---|---|
| Retail | inventario, ventas, facturación, POS | Odoo POS + inventario + e-CF |
| Restaurantes | pedidos, cocina, inventario | POS + inventario + analítica |
| Distribución | stock, rutas, trazabilidad | ERP + BI + integraciones |
| Logística | coordinación, seguimiento, rutas | dashboards + automatización |
| Servicios prof. | proyectos, CRM, facturación | CRM + contabilidad + automatización |
| Crecimiento | procesos desordenados | diagnóstico + arquitectura |

### 9.8 Products

Rutas: `/en/products`, `/es/productos`

Tarjetas minimalistas, uso de badges en colores pastel para las categorías.

### 9.9 Methodology

Rutas: `/en/methodology`, `/es/metodologia`

Layout: Línea de tiempo vertical u horizontal muy limpia (línea gris tenue, círculos/nodos en blanco con bordes de color pastel).

### 9.10 About

Rutas: `/en/about`, `/es/nosotros`

Fotos del equipo (si hay) con fondos recortados sobre un fondo claro consistente, o con un tratamiento de color suave/cálido.

### 9.11 Contact & 9.12 Diagnostic

Formularios amplios, campos de texto con fondos ligeramente grises (surface) y bordes que solo aparecen al hacer focus (ring azul suave). Mucho padding dentro de los inputs. Tipografía grande para labels.

---

## 10. Formularios e integración ERP

(Igual que v7: Mantiene lógica de validación Zod, estados accesibles, mock por defecto, stubs preparados en `lib/erp/`)

## 11. Variables de entorno

(Igual que v7)

## 12. Google Cloud — Deployment readiness

(Igual que v7)

## 13. SEO, rendimiento, analítica y accesibilidad

(Igual que v7, enfatizando en 13.2 que las imágenes y assets decorativos de estilo "aesthetic" no deben impactar negativamente el rendimiento de carga).

## 14. Orquestación multi-modelo

(Igual que v7)

## 15. Skills del proyecto

(Igual que v7)

## 16. Documentación persistente

(Igual que v7)

## 17. Backlog Scrum

(Igual que v7)

## 18. Fases de implementación

(Igual que v7)

## 19. Criterios de aceptación final

(Se añade el criterio de diseño aesthetic)

### 19.4 Calidad percibida

- [ ] Visual aesthetic/minimalista: Fondos blancos/claros, colores pasteles opacos para acentos, sin modos oscuros predominantes, uso abundante de espacio en blanco (whitespace).
- [ ] CTAs claros con destinos reales.
- [ ] Responsive mobile/tablet/desktop.
- [ ] Accesible: foco, contraste, labels, aria.
- [ ] Orientado a conversión B2B mediante la construcción de confianza visual (limpieza, orden).

---

## 20. Formato de respuesta del agente

Al terminar cada bloque importante, responder:

```md
## Estado
- Rama:
- Historia Scrum activa:
- Estado de la historia:

## Cambios realizados
- ...

## Archivos creados/modificados
- ...

## Comandos ejecutados
- ...

## Pruebas
- ...

## Decisiones
- ...

## Bloqueos
- ...

## Riesgos pendientes
- ...

## Próxima tarea exacta
- ...
```

---

## 21. Primera tarea exacta

Empieza ahora. Sin preguntas. Con evidencia:

1. Crear rama `feat/getupsoft-redesign`.
2. Crear `prompts/master/` y guardar este prompt como `getupsoft-redesign-master-prompt.md`.
3. Crear `.lock.md` y generar `sha256`.
4. Auditar repo → crear `docs/agent-state.md`.
5. Crear `docs/implementation-log.md`, `docs/decision-log.md`, `docs/handoff.md`, `docs/verification-report.md`.
6. Investigar skills → crear `docs/ai/skill-research.md`.
7. Crear skills Claude en `.claude/skills/` y `.claude/agents/`.
8. Crear `AGENTS.md` y skills Codex en `.agents/skills/`.
9. Crear `docs/ai/` completo.
10. Crear `docs/scrum/` completo.
11. Crear `docs/content-source-map.md` y `docs/brand-voice.md`.
12. Completar Sprint 0 US-000 a US-009.
13. Crear `docs/design-system.md` y `docs/content-architecture.md`.
14. Implementar Design System + Header + Footer + Home Global.
15. Ejecutar lint/build y documentar resultado.
16. Continuar con Fase 2.

**No preguntes si debes proceder. Procede y deja evidencia.**

---

_GetUpSoft Website Redesign Master Prompt v8 Aesthetic Minimalist · Síntesis mejorada para ejecución autónoma · mayo 2026_
