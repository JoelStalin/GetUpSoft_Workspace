# 📑 Content Architecture — GetUpSoft Website Redesign

**Version:** 1.0  
**Status:** Reference for Phase 2+ implementation  
**Reference:** Master Prompt §9 (content per page)  
**Last Updated:** 2026-05-19

---

## Overview

Content architecture defines:
1. **URL routing** (Global vs. RD; English vs. Spanish)
2. **Page structure** (sections, components, CTAs per page)
3. **SEO metadata** (title, description, og:*, schema.org)
4. **Content source** (where copy comes from; verification in docs/content-source-map.md)

**Multilingual Strategy:**
- Global site: `/en/*` (English) and `/es/*` (Spanish)
- RD-specific: `/es/rd/*` (Spanish only; no English equivalent)
- Region selector: Toggle Global ↔ RD (affects home + some service pages)

---

## 1. Route Map

### Global Routes (International)

| Route | Name | Language(s) | Type | Owned By | CTA Destinations |
|-------|------|-------------|------|----------|------------------|
| `/en` | Home Global | English | Hero + 5 sections | ChatGPT | Strategy Session, Methodology |
| `/es` | Home Global | Spanish | Hero + 5 sections | ChatGPT | Sesión Estratégica, Metodología |
| `/en/ai-agents` | AI Agents | English | Features + use cases | ChatGPT | Learn More, Request Demo |
| `/es/ai-agents` | Agentes IA | Spanish | Features + use cases | ChatGPT | Saber Más, Solicitar Demo |
| `/en/integrations` | Integrations | English | Pattern cards + examples | ChatGPT | View Integrations, API Docs |
| `/es/integraciones` | Integraciones | Spanish | Pattern cards + examples | ChatGPT | Ver Integraciones, Docs API |
| `/en/erp-and-billing` | ERP & Billing | English | Capability cards + DGII | ChatGPT | Evaluate, Schedule Audit |
| `/es/erp-y-facturacion` | ERP y Facturación | Spanish | Capability cards + DGII | ChatGPT | Evaluar, Agendar Auditoría |
| `/en/infrastructure` | Infrastructure | English | Cloud, networks, support | ChatGPT | Consult, View Solutions |
| `/es/infraestructura` | Infraestructura | Spanish | Cloud, networks, support | ChatGPT | Consultar, Ver Soluciones |
| `/en/industries` | Industries | English | 6 industry cards | ChatGPT | Explore, Request Solution |
| `/es/sectores` | Sectores | Spanish | 6 industry cards | ChatGPT | Explorar, Solicitar Solución |
| `/en/products` | Products | English | ORCA, AIHub, GetUpBuilder | ChatGPT | View Features, Start Free Trial |
| `/es/productos` | Productos | Spanish | ORCA, AIHub, GetUpBuilder | ChatGPT | Ver Características, Empezar |
| `/en/methodology` | Methodology | English | 4-step process | ChatGPT | Book Session, View Case Study |
| `/es/metodologia` | Metodología | Spanish | 4-step process | ChatGPT | Reservar Sesión, Ver Caso |
| `/en/about` | About | English | Vision, values, team | ChatGPT | Contact Us, Meet the Team |
| `/es/about` | Acerca De | Spanish | Vision, values, team | ChatGPT | Contáctenos, Conozca el Equipo |
| `/en/contact` | Contact | English | Contact form + info | Codex | Submit Form |
| `/es/contacto` | Contacto | Spanish | Contact form + info | Codex | Enviar Formulario |
| `/en/diagnostic` | Diagnostic | English | Diagnostic form + questions | Codex | Submit Diagnostic |
| `/es/diagnostico` | Diagnóstico | Spanish | Diagnostic form + questions | Codex | Enviar Diagnóstico |

### RD-Specific Routes (Dominican Republic)

| Route | Name | Language | Type | Owned By | CTA Destinations |
|-------|------|----------|------|----------|------------------|
| `/es/rd` | Home RD | Spanish | RD-focused hero + 3 sections | ChatGPT | Diagnóstico, Servicios |
| `/es/rd/servicios` | RD Servicios | Spanish | Odoo, DGII, Infrastructure, Support | ChatGPT | Evaluar, Auditoría, Consultar |
| `/es/rd/sectores` | RD Sectores | Spanish | Retail, Restaurants, Distribution, etc. | ChatGPT | Solicitar, Contactar |
| `/es/rd/soporte` | RD Support | Spanish | Local contact + phone | Codex | Llamar, Chat en Vivo |

---

## 2. Page Templates by Type

### Template A: Hero + Sections (Content Pages)

**Used by:** Home Global, Home RD, AI Agents, ERP & Billing, Integrations, Infrastructure, Industries, Products, Methodology, About

**Structure:**
```
┌─────────────────────────────────┐
│ Hero Section                    │
│ ├─ Eyebrow (category label)     │
│ ├─ H1 (headline)                │
│ ├─ Subheading (2–3 lines)       │
│ ├─ CTA 1 (primary button)       │
│ ├─ CTA 2 (secondary button)     │
│ └─ Trust bar / Visual           │
├─────────────────────────────────┤
│ Section 1 (Problem / Overview)  │
│ ├─ H2                           │
│ ├─ Body text + visual           │
│ └─ Optional: CTA button         │
├─────────────────────────────────┤
│ Section 2 (Capabilities / Features) │
│ ├─ H2                           │
│ ├─ 3–4 service/feature cards    │
│ └─ Optional: Learn more CTA     │
├─────────────────────────────────┤
│ Section 3 (Social Proof / Stats) │
│ ├─ H2                           │
│ ├─ Metrics, testimonials, or    │
│ │  partner logos                │
│ └─ CTA                          │
├─────────────────────────────────┤
│ Section 4 (Related Products)    │
│ ├─ H2                           │
│ ├─ Product cards (3–4)          │
│ └─ Explore button               │
├─────────────────────────────────┤
│ Final CTA Section               │
│ ├─ H2 (closing statement)       │
│ ├─ 2 main CTAs (primary + secondary) │
│ └─ Optional: FAQ accordion      │
└─────────────────────────────────┘
```

### Template B: Form Page (Contact, Diagnostic, etc.)

**Used by:** Contact, Diagnostic, Strategy Session booking

**Structure:**
```
┌─────────────────────────────────┐
│ Hero / Header                   │
│ ├─ Eyebrow                      │
│ ├─ H1 (form title)              │
│ ├─ Brief description            │
│ └─ Optional: Subheading         │
├─────────────────────────────────┤
│ Two-Column Layout (Desktop)     │
│ ├─ Left: Form fields            │
│ │  ├─ Name, Email, Phone        │
│ │  ├─ Message / Diagnostic      │
│ │  ├─ Submit button             │
│ │  └─ Privacy notice            │
│ └─ Right: Supportive content    │
│    ├─ Expected next steps       │
│    ├─ FAQ items                 │
│    ├─ Contact info              │
│    └─ Trust elements            │
└─────────────────────────────────┘
```

### Template C: Listing Page (Integrations, Industries, Services)

**Used by:** Integrations, Industries, RD Services

**Structure:**
```
┌─────────────────────────────────┐
│ Header with Filters (optional)  │
│ ├─ H1                           │
│ ├─ Search / Category filters    │
│ └─ Count of results             │
├─────────────────────────────────┤
│ Card Grid (3–4 columns)         │
│ ├─ Card 1                       │
│ │  ├─ Icon/visual               │
│ │  ├─ Title                     │
│ │  ├─ Description (2–3 lines)   │
│ │  ├─ Feature list (bullets)    │
│ │  └─ CTA link/button           │
│ ├─ Card 2                       │
│ └─ ... (more cards)             │
├─────────────────────────────────┤
│ Optional: Comparison Table      │
│ (if showing alternatives)       │
├─────────────────────────────────┤
│ Final CTA Section               │
│ ├─ "Ready to get started?"      │
│ ├─ Primary + secondary CTA      │
│ └─ Optional: Contact            │
└─────────────────────────────────┘
```

---

## 3. Page Specifications

### Home Global (/en, /es)

**Owned by:** ChatGPT (copy), Codex (implementation), Gemini (hero visual)

**Hero:**
- Eyebrow: "ENTERPRISE AI ARCHITECTURE" (EN) / "ARQUITECTURA DE IA EMPRESARIAL" (ES)
- H1: "Scalability and intelligence for the modern enterprise." (40 words max)
- Sub: 2–3 sentences on integrated solutions
- CTA 1: "Book Strategy Session" (primary)
- CTA 2: "Explore Methodology" (secondary)
- Trust Bar: "AI Agents · ERP Integrations · Cloud Infrastructure · Operational Intelligence"
- Visual: Two-column (desktop); ArchitectureMap with nodes (ORCA, ERP, CRM, BI, Data, Infrastructure)

**Sections:**
1. **Enterprise Problem** — Pain points: scattered systems, slow integration, lack of visibility
2. **Capabilities** — 3 cards: AI Strategy & Agents, System Integration, Digital Infrastructure
3. **Product Ecosystem** — 4 cards: ORCA, AIHub, GetUpBuilder, Integration Layer
4. **Methodology Preview** — 4 steps: Audit → Design → Delivery → Scale
5. **Final CTA** — "Ready to transform?" + Book Session + Explore

**SEO Metadata:**
- Title: "Enterprise AI Automation & Integration | GetUpSoft"
- Description: "Scalable AI agents, Odoo ERP, and cloud infrastructure for modern enterprises. Book strategy session."
- og:title, og:description, og:image (hero visual)
- schema.org: Organization + Service

### Home RD (/es/rd)

**Owned by:** ChatGPT (copy), Codex (implementation)

**Hero:**
- Eyebrow: "SOLUCIONES TANGIBLES · SOFTWARE + HARDWARE"
- H1: "Infraestructura y gestión para el éxito local."
- Sub: Odoo, facturación, infraestructura empresarial
- CTA 1: "Solicitar Diagnóstico" (primary)
- CTA 2: "Ver Servicios" (secondary)
- Trust Bar: "Odoo ERP · DGII/e-CF · Redes Empresariales · Soporte Local RD"

**Sections:**
1. **Local Problems** — Inventory control, manual invoicing, disconnected systems, unstable networks
2. **RD Services** — 4 cards: Odoo ERP, DGII/e-CF Billing, Infrastructure, Local Support
3. **RD Industries** — 6 cards: Retail, Restaurants, Distribution, Logistics, Professional Services, Healthcare
4. **Final CTA** — "Agendar Diagnóstico" + Contact Local Support

**SEO Metadata:**
- Title: "Odoo ERP, Facturación DGII y Soluciones Empresariales | GetUpSoft RD"
- Description: "Implementamos Odoo, facturación electrónica e infraestructura empresarial en República Dominicana."
- Hreflang: Only Spanish; no English equivalent

### AI Agents Page (/en/ai-agents, /es/ai-agents)

**Owned by:** ChatGPT, Codex

**Hero:**
- Eyebrow: "AUTONOMOUS INTELLIGENCE" / "INTELIGENCIA AUTÓNOMA"
- H1: "AI agents that understand your business."
- Sub: Explains ORCA orchestration, agent capabilities, integration with existing systems

**Sections:**
1. **Why AI Agents?** — Business case + ROI
2. **ORCA Capabilities** — 4 agent types: Strategy, Integration, Operations, Support
3. **Use Cases** — 6 cards: Document automation, Invoice processing, Customer triage, Inventory management, Report generation, Sales forecasting
4. **Integration Readiness** — How agents connect to ERP, CRM, databases
5. **Final CTA** — "Schedule AI Strategy" + "View ORCA Docs"

### Contact & Diagnostic Forms (/en/contact, /es/contacto, /en/diagnostic, /es/diagnostico)

**Owned by:** Codex (implementation), ChatGPT (copy)

**Form Fields (Contact):**
- Name (required, text)
- Email (required, email validation)
- Phone (optional, tel)
- Company (optional, text)
- Message (required, textarea)
- Region selector: Global / RD (affects routing for follow-up)
- Privacy checkbox: "I agree to privacy policy"

**Form Fields (Diagnostic):**
- Name (required)
- Email (required)
- Company (required)
- Industry (required, dropdown: Retail, Restaurant, Distribution, Logistics, Services, Other)
- Current ERP? (radio: Odoo, ERPNext, SAP, iSeries, Other, None)
- Pain Points (checkboxes: Inventory, Reporting, Integration, Scalability, Compliance, Cost)
- Budget Range (radio: < $5K, $5K–$25K, $25K–$100K, > $100K)
- Message (textarea)
- Privacy checkbox

**Submission Behavior:**
- Client-side validation (Zod schema)
- Submit to `POST /api/leads` (implemented in Phase 3)
- Default mock provider (development/demo)
- Success message: "Thank you. We'll contact you within 24 hours."
- Error message: "Please check the form. Try again."

---

## 4. SEO Metadata Template

### For Every Page:

```html
<!-- Basic -->
<meta name="title" content="[Page Title]" />
<meta name="description" content="[160 chars max, includes primary keyword]" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- OpenGraph (social media preview) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="[canonical URL]" />
<meta property="og:title" content="[Page Title]" />
<meta property="og:description" content="[Description]" />
<meta property="og:image" content="[Hero image URL, 1200x630px]" />
<meta property="og:site_name" content="GetUpSoft" />

<!-- Twitter Card -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="[canonical URL]" />
<meta property="twitter:title" content="[Page Title]" />
<meta property="twitter:description" content="[Description]" />
<meta property="twitter:image" content="[Hero image URL]" />

<!-- Canonical (prevent duplicate content) -->
<link rel="canonical" href="[canonical URL]" />

<!-- Hreflang (language alternates) -->
<link rel="alternate" hreflang="en" href="https://getupsoft.com/en/[path]" />
<link rel="alternate" hreflang="es" href="https://getupsoft.com/es/[path]" />
<link rel="alternate" hreflang="x-default" href="https://getupsoft.com/en/[path]" />

<!-- Schema.org (structured data) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GetUpSoft",
  "url": "https://getupsoft.com",
  "logo": "https://getupsoft.com/logo.png",
  "description": "Enterprise AI automation and ERP integration platform",
  "sameAs": [
    "https://linkedin.com/company/getupsoft",
    "https://twitter.com/getupsoft"
  ]
}
</script>
```

### SEO by Page

| Page | Title (60 chars) | Description (160 chars) | Primary Keywords |
|------|------------------|------------------------|------------------|
| Home Global | "Enterprise AI Automation & ERP Integration" | "Scalable AI agents, Odoo integration, cloud infrastructure for modern enterprises. Book strategy." | AI automation, ERP integration, Odoo, cloud infrastructure |
| Home RD | "Odoo ERP, DGII Facturación y Soluciones Empresariales" | "Implementamos Odoo, facturación electrónica DGII e infraestructura en República Dominicana." | Odoo RD, DGII, facturación electrónica, infraestructura RD |
| AI Agents | "Autonomous AI Agents & ORCA Orchestration Platform" | "Deploy autonomous AI agents for document automation, invoice processing, customer triage, and more. " | AI agents, automation, ORCA, intelligent automation |
| ERP & Billing | "Odoo ERP, ERPNext, SAP Integration & Billing Solutions" | "Multi-ERP integration, DGII compliance, accounting, and financial automation for enterprises." | ERP integration, Odoo, ERPNext, billing automation |
| Integrations | "Multi-System Integration Platform & API Solutions" | "Connect Odoo, CRM, cloud services, and legacy systems. Seamless integration layer." | API integration, system integration, middleware, iPaaS |
| Infrastructure | "Cloud, Networks, DevOps & Security Infrastructure" | "Enterprise cloud deployment, network design, security, and managed infrastructure support." | cloud infrastructure, DevOps, security, managed services |
| Industries | "Retail, Logistics, Restaurants, Distribution Solutions" | "Industry-specific ERP and AI solutions for retail, logistics, distribution, and professional services." | retail software, logistics ERP, restaurant management |
| Products | "ORCA, AIHub, GetUpBuilder: Enterprise Platforms" | "Autonomous AI agents, integration hub, and low-code builder for digital transformation." | automation platform, integration tools, low-code builder |
| Methodology | "Enterprise Digital Transformation Methodology" | "4-step approach: Audit, Design, Delivery, Scale. Proven methodology for enterprise modernization." | digital transformation, enterprise strategy, ERP audit |
| About | "About GetUpSoft: Our Team, Vision, and Values" | "Who we are: A team building enterprise AI and integration solutions for the modern business." | about company, team, mission, company culture |
| Contact | "Get in Touch | GetUpSoft" | "Contact our team. Request a strategy session, get support, or ask questions." | contact, support, inquiry |
| Diagnostic | "Free Enterprise Systems Diagnostic" | "Assess your ERP, integrations, and infrastructure readiness. Get personalized recommendations." | assessment, audit, ERP readiness, system evaluation |

---

## 5. Content Governance

### Copy Sources & Verification

**Every factual claim must be verified in `docs/content-source-map.md` with:**
- Claim (exact text)
- Source (URL, document, internal spec)
- Status: ✅ Verified / ⏳ Pending / ❌ Unverified (never publish)

**Forbidden Claims:**
- ❌ "GetUpSoft is the #1 / best / only..."
- ❌ Sample company data (Galantes, Starbucks, etc.)
- ❌ Invented team members
- ❌ Unverified certifications / partnerships

**Allowed Claims:**
- ✅ "GetUpSoft architects, integrates, automates..."
- ✅ "We serve 50+ organizations" (with data source)
- ✅ "Odoo is open-source, built on Python, used by 2M+ companies" (verified public fact)
- ✅ "DGII compliance required in Dominican Republic" (verified legal fact)

### Brand Voice

**Tone:** Professional, technical, trustworthy, direct (no fluff)

**Vocabulary (Preferred / Forbidden):**

| Preferred | Forbidden |
|-----------|-----------|
| "Scalability, architecture, integration" | "Best, unique, perfect" |
| "Autonomous agents, ORCA orchestration" | "Magic, revolutionary, game-changing" |
| "Enterprise, B2B, operational intelligence" | "Simple, easy, just click" |
| "Audit, design, delivery, scale" | "Guarantee, promise, always" |

### Content Maintenance

- **Quarterly review:** Update statistics, links, partnership info
- **Owner:** ChatGPT → content; Claude → architecture; Joel → business claims
- **Escalation:** If claim unverifiable, don't publish; escalate to Joel

---

## 6. Implementation Checklist

### Phase 2 (Page Build)

- [ ] All routes defined in router config (next.js pages/ or React Router)
- [ ] All pages responsive on mobile < 768px, tablet 768–1024px, desktop > 1024px
- [ ] All copy ES/EN sourced from i18n system (no hardcoding)
- [ ] All CTAs point to real pages or documented #tbd- placeholders
- [ ] All forms have validation + error messaging
- [ ] Region selector (Global/RD) functional; affects home + relevant services
- [ ] Language selector (EN/ES) functional on all pages
- [ ] SEO metadata unique per page (title, description, og:*)
- [ ] Schema.org JSON-LD added to all pages
- [ ] Canonical URLs correct
- [ ] Hreflang tags correct (language alternates)
- [ ] sitemap.xml generated

### Phase 3 (SEO & Forms)

- [ ] All form submissions captured (POST /api/leads)
- [ ] Mock provider by default (safe for dev)
- [ ] Form validation client + server
- [ ] Success / error states working
- [ ] Privacy policy + terms linked and acknowledged

---

## 7. Related Documents

- **Design System:** `docs/design-system.md` (colors, typography, components)
- **Content Source Map:** `docs/content-source-map.md` (claim verification)
- **Brand Voice:** `docs/brand-voice.md` (tone, vocabulary, examples)
- **Implementation Log:** `docs/implementation-log.md` (daily progress)
- **Product Backlog:** `docs/scrum/product-backlog.md` (story details)

---

_Content Architecture v1.0 · Created 2026-05-19 · Reference for Phase 2 page implementation_
