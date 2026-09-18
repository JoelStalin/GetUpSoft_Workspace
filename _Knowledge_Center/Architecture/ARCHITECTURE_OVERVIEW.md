# Architecture Overview — GetUpSoft Workspace

**Document ID:** ARCH-001
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** Active
**ISO Reference:** ISO/IEC/IEEE 42010:2011 — Architecture Description

---

## C4 Level 1 — System Context Diagram

```mermaid
C4Context
  title GetUpSoft — System Context

  Person(owner, "Joel Stalin (CEO)", "Product owner, architect, primary operator")
  Person(client_galantesjewelry, "GalantesJewelry Client", "E-commerce customer")
  Person(client_chefalitas, "ChefAlitas Client", "Restaurant operator")
  Person(end_user_easycount, "EasyCount User", "Accountant / Business owner (Dominican Republic)")

  System(orca, "ORCA Platform", "AI workflow orchestration platform — manages models, agents, workflows, and integrations")
  System(easycount, "EasyCount", "Accounting and fiscal compliance platform for the Dominican Republic (DGII)")
  System(getupsoft_site, "GetUpSoft Site", "Corporate marketing and product catalog website")
  System(odoo_erp, "Odoo ERP", "Enterprise resource planning — v15/v16/v17/v18/v19 — business operations")

  System_Ext(dgii, "DGII (Dominican Tax Authority)", "External: fiscal validation API")
  System_Ext(cloudflare, "Cloudflare", "External: CDN, DNS, Zero Trust, Pages")
  System_Ext(nvidia_api, "NVIDIA Build API", "External: cloud AI model inference")
  System_Ext(ollama, "Ollama LAN", "External (LAN): local AI model inference")
  System_Ext(n8n, "n8n Workflow Runtime", "Internal worker: automation workflows")

  Rel(owner, orca, "Builds and operates")
  Rel(owner, easycount, "Develops and uses")
  Rel(owner, odoo_erp, "Operates and customizes")
  Rel(owner, getupsoft_site, "Publishes")

  Rel(end_user_easycount, easycount, "Creates invoices, reports")
  Rel(client_galantesjewelry, getupsoft_site, "Views catalog")
  Rel(client_chefalitas, odoo_erp, "Uses POS + printing")

  Rel(easycount, dgii, "Validates RNC, NCF, ITBIS")
  Rel(orca, nvidia_api, "Calls cloud AI models")
  Rel(orca, ollama, "Calls local AI models (LAN)")
  Rel(orca, n8n, "Triggers automation workflows")
  Rel(getupsoft_site, cloudflare, "Served via CDN/Pages")
  Rel(easycount, cloudflare, "Protected by Zero Trust")
```

---

## C4 Level 2 — Container Diagram: ORCA Platform

```mermaid
C4Container
  title ORCA Platform — Container Diagram

  Person(operator, "Operator / Agent", "Human or AI agent")

  System_Boundary(orca_boundary, "ORCA Platform") {
    Container(workflow_editor, "Workflow Editor", "React + ReactFlow", "Visual workflow builder — drag-and-drop node editor, dark theme, responsive")
    Container(orca_backend, "ORCA Backend API", "NestJS (TypeScript)", "HTTP REST API — workflows, agents, models, integrations")
    Container(orca_python_core, "ORCA Python Core", "Python 3.11+", "AI agents, model routing, ORCA audit mixin, CLI tooling")
    Container(client_gateway, "ORCA Client Gateway", "Electron (desktop)", "Desktop gateway — bridges local services and cloud ORCA")
    Container(voicebot, "Voicebot Asterisk", "Python + Asterisk", "Voice automation integration")
    ContainerDb(orca_db, "ORCA Database", "PostgreSQL", "Workflow definitions, agent logs, execution history")
  }

  System_Ext(nvidia, "NVIDIA Build API", "Cloud AI models")
  System_Ext(ollama, "Ollama LAN Server", "Local AI models")
  System_Ext(odoo_api, "Odoo RPC API", "ERP data access")
  System_Ext(n8n_runtime, "n8n Worker Runtime", "Automation workflows")

  Rel(operator, workflow_editor, "Designs workflows", "HTTPS")
  Rel(operator, client_gateway, "Runs locally", "Electron IPC")
  Rel(workflow_editor, orca_backend, "API calls", "REST/JSON")
  Rel(client_gateway, orca_backend, "Proxies requests", "REST/JSON")
  Rel(orca_backend, orca_python_core, "Delegates AI tasks", "Internal Python")
  Rel(orca_backend, orca_db, "Reads/writes", "PostgreSQL")
  Rel(orca_python_core, nvidia, "Model inference", "HTTPS")
  Rel(orca_python_core, ollama, "Local inference", "HTTP LAN")
  Rel(orca_python_core, odoo_api, "ERP integration", "XML-RPC")
  Rel(orca_backend, n8n_runtime, "Triggers workflows", "Webhook/REST")
  Rel(orca_python_core, voicebot, "Voice commands", "Internal")
```

---

## C4 Level 2 — Container Diagram: EasyCount

```mermaid
C4Container
  title EasyCount — Container Diagram

  Person(accountant, "Accountant / Business Owner", "Dominican Republic")

  System_Boundary(easycount_boundary, "EasyCount Platform") {
    Container(ec_frontend, "EasyCount Frontend", "React (SPA)", "Invoice creation, reports, DGII submissions")
    Container(ec_api, "EasyCount API", "Python (FastAPI legacy / NestJS target)", "Business logic, invoice workflows, DGII integration")
    Container(ec_core_lib, "easycount-core Library", "Python", "DGII fiscal engine: NCF sequences, ITBIS calculation, RNC validation, e-CF")
    ContainerDb(ec_db, "EasyCount Database", "PostgreSQL", "Invoices, customers, tax records, audit logs")
  }

  System_Ext(dgii_api, "DGII API", "Tax authority — RNC lookup, e-CF submission")
  System_Ext(sendgrid, "SendGrid", "Email delivery for invoices")
  System_Ext(mailcow, "Mailcow (LAN)", "Internal mail server")

  Rel(accountant, ec_frontend, "Uses", "HTTPS browser")
  Rel(ec_frontend, ec_api, "API calls", "REST/JSON")
  Rel(ec_api, ec_core_lib, "Uses fiscal logic", "Python import")
  Rel(ec_api, ec_db, "Reads/writes", "PostgreSQL")
  Rel(ec_core_lib, dgii_api, "Validates/submits", "HTTPS")
  Rel(ec_api, sendgrid, "Sends invoices", "SMTP/API")
  Rel(ec_api, mailcow, "Internal mail", "SMTP LAN")
```

---

## Domain View

```mermaid
graph TD
  subgraph GOV["00 Workspace Governance"]
    G1[Architecture Rules]
    G2[Migration Manifest]
    G3[ISO Traceability]
  end

  subgraph PROD["02 Products"]
    P1[ORCA Platform]
    P2[EasyCount]
    P3[GetUpSoft Site]
  end

  subgraph CLIENT["03 Client Solutions"]
    C1[GalantesJewelry]
    C2[ChefAlitas]
  end

  subgraph WORKER["04 Workers"]
    W1[Workflow Runtime n8n]
    W2[Printer Workers]
    W3[Social Workers]
    W4[AI Agent Workers]
    W5[Data Workers]
  end

  subgraph ERP["05 ERP Odoo"]
    E1[Odoo v19 Active]
    E2[Odoo v15-v18 Archive]
    E3[DGII Modules]
    E4[ORCA Audit Mixin]
  end

  subgraph INFRA["06 Infrastructure"]
    I1[Cloudflare CDN/ZT]
    I2[OpenVPN]
    I3[Docker Compose]
    I4[Mail Server]
  end

  subgraph LIB["07 Libraries"]
    L1[easycount-core - DGII Silo]
    L2[traffic-control]
  end

  subgraph KNOW["_Knowledge Center"]
    K1[ADRs]
    K2[Agent Memory]
    K3[Component Cards]
  end

  PROD --> WORKER
  PROD --> LIB
  CLIENT --> WORKER
  CLIENT --> ERP
  ERP --> LIB
  INFRA --> PROD
  INFRA --> CLIENT
  GOV --> KNOW
```

---

## Workers View

```mermaid
graph LR
  subgraph CONSUMERS["Consumers"]
    P[Products]
    CS[Client Solutions]
  end

  subgraph WORKERS["04 Workers"]
    direction TB
    W1["n8n Runtime\n(Workflow Automation)"]
    W2["local-printer-agent\n(Thermal Printing)"]
    W3["printer-proxy\n(Print Routing)"]
    W4["insta-manager-pro\n(Social Automation)"]
    W5["scrapling\n(Web Data)"]
    W6["hermes-agent\n(AI Agent)"]
  end

  subgraph CONTRACTS["Worker Contracts"]
    WC1[Input Schema]
    WC2[Output Schema]
    WC3[Retry Policy]
    WC4[Audit Log]
  end

  P --> W1
  P --> W6
  CS --> W2
  CS --> W3
  CS --> W4
  W1 --> CONTRACTS
  W2 --> CONTRACTS
  W3 --> CONTRACTS
  W4 --> CONTRACTS
  W5 --> CONTRACTS
  W6 --> CONTRACTS
```

---

## Infrastructure View

```mermaid
graph TD
  subgraph CLOUD["Cloud Layer"]
    CF["Cloudflare\n(CDN, DNS, Zero Trust, Pages)"]
    NVIDIA["NVIDIA Build API\n(Cloud AI Models)"]
  end

  subgraph LAN["GetUpSoft LAN"]
    VPN["OpenVPN Server\n(getupsoft-lan)"]
    OLLAMA["Ollama\n(Local AI Models — 16GB RAM)"]
    MAIL["Mailcow\n(Internal Mail)"]
  end

  subgraph DOCKER["Docker Compose Services"]
    ORCA_D["ORCA Python Core"]
    NEST_D["backend-nest (NestJS)"]
    ODOO_D["Odoo v19"]
    PG_D["PostgreSQL 15"]
    EC_D["EasyCount API"]
  end

  CF --> NEST_D
  CF --> EC_D
  VPN --> LAN
  VPN --> DOCKER
  ORCA_D --> NVIDIA
  ORCA_D --> OLLAMA
  NEST_D --> PG_D
  ODOO_D --> PG_D
  EC_D --> PG_D
  MAIL --> EC_D
```

---

## Quality Attribute Summary (ISO 25010:2023)

| Quality Attribute | Implementation Evidence |
|---|---|
| Functional Suitability | EasyCount DGII modules, ORCA workflow engine, Odoo customizations |
| Performance Efficiency | Load tests (oo-021), ORCA model routing (cloud vs local), n8n async |
| Compatibility | NestJS REST API, ORCA XML-RPC Odoo bridge, n8n webhook integration |
| Interaction Capability | WCAG AA accessibility (ORCA Workflow Editor), keyboard navigation, ARIA |
| Reliability | SSH recovery guide, container remediation, ORCA retry patterns |
| Security | .gitignore secrets, Zero Trust (Cloudflare), ORCA audit mixin, access control |
| Maintainability | Worker-First architecture, ADRs, domain isolation, hexagonal patterns |
| Flexibility | Docker Compose, model-agnostic ORCA, Hexagonal/Clean architecture |

---

*Generated: 2026-05-31 | GetUpSoft Architecture Overview*
