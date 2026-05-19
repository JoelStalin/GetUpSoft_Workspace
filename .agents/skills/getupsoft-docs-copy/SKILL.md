---
name: getupsoft-docs-copy
description: Documentation and copywriting skill for Codex - write ES/EN content, docs, SEO metadata, FAQs, brand-aligned copy
---

# GetUpSoft Docs & Copy (Codex)

**For:** ChatGPT or documentation-focused agent  
**Role:** Write copy, documentation, content ES/EN  
**When to use:** Writing page copy, docs, FAQs, SEO metadata, blog content

---

## Quick Start

1. Read `docs/brand-voice.md` (tone, vocabulary, ES/EN guidelines)
2. Read `docs/content-architecture.md` (what content goes where)
3. Read `docs/content-source-map.md` (claim verification)
4. Write copy for assigned page/section
5. Both ES and EN versions
6. Update `docs/implementation-log.md`

---

## Rules

### ✅ DO

- ✅ Write both ES and EN (never skip one)
- ✅ Match brand voice (docs/brand-voice.md)
- ✅ Verify all claims (content-source-map.md)
- ✅ Use markdown for docs
- ✅ Link to sources for facts
- ✅ Write for conversion (clear CTAs)
- ✅ Use short paragraphs (scannable)
- ✅ Include SEO: title, meta description, keywords

### ❌ DON'T

- ❌ Invent certifications/partnerships
- ❌ Use data from other companies (Galantes, etc.)
- ❌ Make unverified claims ("fastest", "best", "most advanced")
- ❌ Skip source verification
- ❌ Write only ES OR EN (both required)
- ❌ Use marketing fluff without substance

---

## Brand Voice Guidelines

From `docs/brand-voice.md` (when created):

**Allowed vocabulary:**
- "Arquitectura digital"
- "Inteligencia operacional"
- "Integración empresarial"
- "Soporte local"
- "Sistemas escalables"
- "Automatización aplicada"
- "Continuidad operativa"

**Avoid:**
- "La mejor empresa"
- "Garantizado" (sin prueba)
- "Certificado" (sin evidencia)
- Buzzwords sin impacto operativo

**Tone:**
- Professional, technical, serious
- B2B (not B2C marketing fluff)
- Enterprise cloud-like (AWS, Google Cloud tone)
- Transparent about limitations

---

## Content Structure (Master Prompt §8–§9)

**Per page, include:**

1. **Hero section:**
   - Eyebrow (small, uppercase)
   - H1 headline (40–60 chars)
   - Subheading (2–3 sentences)
   - 2 CTAs (primary + secondary)
   - Trust bar (features/capabilities)

2. **Body sections:**
   - Problem statement
   - Solution overview
   - Features/capabilities
   - Use cases or industries
   - Methodology/process (if applicable)
   - FAQ section
   - Final CTA

3. **SEO metadata:**
   - `<title>` (50–60 chars)
   - `<meta description>` (150–160 chars)
   - `og:title`, `og:description`, `og:image`
   - Schema.org markup (Organization, Service, etc.)

---

## Example: Contact Page Copy

**Spanish (ES):**
```markdown
# Contacto

## Hablemos de tu transformación digital

¿Tienes preguntas sobre cómo GetUpSoft puede ayudar a tu empresa?
Envíanos un mensaje y nuestro equipo te responderá en las próximas 24 horas.

**Formulario de contacto:**
[form fields]

**También puedes:**
- Email: [email]
- LinkedIn: [link]
- Teléfono: [phone if available]

## Preguntas frecuentes

**¿Cuál es el tiempo de implementación?**
Depende del alcance. Un diagnóstico toma 2–4 semanas. Una implementación completa de Odoo puede tomar 8–12 semanas.

[more FAQs...]
```

**English (EN):**
```markdown
# Contact

## Let's talk about your digital transformation

Have questions about how GetUpSoft can help your business?
Send us a message and our team will respond within 24 hours.

**Contact Form:**
[form fields]

**You can also reach us at:**
- Email: [email]
- LinkedIn: [link]
- Phone: [phone if available]

## Frequently Asked Questions

**How long is implementation?**
It depends on scope. A diagnostic takes 2–4 weeks. A complete Odoo implementation can take 8–12 weeks.

[more FAQs...]
```

---

## SEO Metadata Template

For every page:

```
Title: [40–60 chars, includes keyword, brand]
Example: "AI Agents & Automation | Enterprise Solutions — GetUpSoft"

Meta Description: [150–160 chars]
Example: "Enterprise AI agents, Odoo ERP integration, and digital infrastructure for scalable operations. GetUpSoft architecture for Dominican Republic."

OG Title: [same as title or variant]
OG Description: [can differ from meta description]
OG Image: [social media preview image, 1200x630px]

Keywords: [3–5 primary]
Example: "Odoo ERP, AI automation, enterprise integration, Dominican Republic"

Canonical: [absolute URL]
Example: https://getupsoft.com/en/ai-agents

hreflang: Link ES/EN versions
Example: <link rel="alternate" hreflang="es" href="https://getupsoft.com/es/ai-agents" />
```

---

## Verification Checklist

Before marking copy DONE:

- [ ] Both ES and EN versions written
- [ ] All claims verified (in source-map.md)
- [ ] No invented data or companies
- [ ] Brand voice consistent (tone, vocabulary)
- [ ] Scannable format (short paragraphs, lists)
- [ ] CTAs clear and specific
- [ ] SEO metadata complete (title, description, og:*, schema)
- [ ] Links working and destination real
- [ ] No hardcoded PII or secrets
- [ ] Markdown formatted correctly
- [ ] `docs/implementation-log.md` updated

---

_GetUpSoft Docs & Copy Skill (Codex) v1.0 · Created 2026-05-19_
