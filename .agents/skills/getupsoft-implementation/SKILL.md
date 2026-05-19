---
name: getupsoft-implementation
description: Implementation skill for Codex - build React components, pages, forms, and integrations for GetUpSoft Website Redesign per design system and master prompt
---

# GetUpSoft Implementation (Codex)

**For:** Codex or equivalent backend/implementation agent  
**Role:** Build features, components, pages, forms  
**When to use:** Implementing React components, pages, forms, ERP integration, any TypeScript/JS code

---

## Quick Start

1. **Read these files** (in order):
   - `prompts/master/getupsoft-redesign-master-prompt.md` (spec)
   - `docs/agent-state.md` (current state)
   - `docs/scrum/sprint-[N].md` (what story to work on)

2. **Claim a "Ready" story** from the sprint board

3. **Follow Definition of Done** (master prompt §17.4)

4. **Update `docs/implementation-log.md`** when done

5. **Mark story DONE** in sprint board

---

## Rules

### ✅ DO

- ✅ Use TypeScript strict mode
- ✅ Follow design system tokens (colors, spacing, typography)
- ✅ Make UI responsive (mobile, tablet, desktop)
- ✅ Validate forms with Zod
- ✅ Pull copy from i18n system, not hardcoded
- ✅ Make everything WCAG AA accessible
- ✅ Add aria-labels where needed
- ✅ Test locally before marking DONE
- ✅ Document what you built in implementation-log.md

### ❌ DON'T

- ❌ Hardcode API keys or secrets
- ❌ Hardcode copy/text in components
- ❌ Use any as type (use proper TS types)
- ❌ Skip responsive design "for now"
- ❌ Skip accessibility "we'll fix later"
- ❌ Mark DONE if tests fail and fixes aren't documented
- ❌ Use real company data (Galantes, etc.)

---

## Tech Stack

- **React 18** (functional components, hooks)
- **TypeScript 5.4**
- **Vite** (build tool)
- **TailwindCSS 3.4** (styling)
- **React Router 6.22** (routing)
- **Zod** (form validation)

Commands:
```bash
cd apps/site
npm install
npm run dev          # Local dev
npm run build        # Production build (must succeed)
```

---

## Component Structure (from Master Prompt §7)

Create or modify components in:
```
apps/site/src/components/
  layout/
    Header.tsx
    MobileNav.tsx
    Footer.tsx
  ui/
    Button.tsx
    Container.tsx
    Section.tsx
    Card.tsx
  forms/
    ContactForm.tsx
    DiagnosticForm.tsx
    Field.tsx
```

All components:
- Use TypeScript interfaces for props
- Export as default or named
- Accept className prop for flexibility
- Document complex logic

---

## Pages Structure (from Master Prompt §9)

Pages go in:
```
apps/site/src/pages/
  Home.tsx                    # Home (bilingue detector)
  global/Home.tsx             # /en or /es (global)
  rd/Home.tsx                 # /es/rd (RD variant)
  AIAgents.tsx                # /en/ai-agents, /es/ai-agents
  Integrations.tsx
  ERPBilling.tsx
  Infrastructure.tsx
  Industries.tsx
  Products.tsx
  Methodology.tsx
  About.tsx
  Contact.tsx
  Diagnostic.tsx
```

Each page:
- Imports Header, Footer layouts
- Uses design system components
- Pulls copy from i18n system
- Has unique `<title>`, `<meta description>`, OpenGraph
- Is fully responsive

---

## Design System Integration

**Using tokens in Tailwind:**

```tsx
// ❌ DON'T
<div className="bg-[#070B12] text-[#5EEAD4]">

// ✅ DO (use Tailwind config with design system tokens)
<div className="bg-background text-primary">
```

**From master prompt §6.2, colors:**
- `background: #070B12`
- `text: #E5E7EB`
- `primary: #5EEAD4` (teal)
- `accentBlue: #60A5FA`
- etc.

Update `apps/site/tailwind.config.ts` to include these tokens.

---

## i18n / Content System

**Copy is NOT hardcoded:**

```tsx
// ❌ DON'T
<h1>Scalability and intelligence for the modern enterprise.</h1>

// ✅ DO (pull from content file)
import { siteContent } from '../content/site'

<h1>{siteContent.home.hero.title}</h1>
```

**Content structure (when Phase 2 content system created):**

```ts
// apps/site/src/content/site.es.ts
export const siteContent = {
  nav: { brand: 'GetUpSoft', home: 'Inicio', ... },
  home: { hero: { title: '...', subtitle: '...' }, ... },
  aiAgents: { hero: { title: '...', ... }, ... },
  // ... one object per page
}
```

**Both ES and EN must exist.** Use language detection or route to pick.

---

## Form Validation & Submission

**Example: Contact Form**

```tsx
import { z } from 'zod'

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message too short"),
})

export function ContactForm() {
  const [state, setState] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }
    
    try {
      const validated = ContactFormSchema.parse(payload)
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })
      
      if (response.ok) {
        setState('success')
      } else {
        setState('error')
      }
    } catch (err) {
      setState('error')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending...' : 'Send'}
      </button>
      {state === 'success' && <p>✅ Message sent!</p>}
      {state === 'error' && <p>❌ Error sending message</p>}
    </form>
  )
}
```

---

## Accessibility Checklist

For every component:

- [ ] Color contrast ≥ 4.5:1 (normal text) or 3:1 (large text)
- [ ] Focus states visible (`:focus-visible` in CSS)
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have `<label>` or `aria-label`
- [ ] Error messages use `aria-describedby`
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] No text-only color indication (red = error, but also include text)
- [ ] `prefers-reduced-motion` respected (no autoplay animations)

---

## Responsive Design

**Breakpoints (from Tailwind):**
- Mobile: < 768px (`sm` breakpoint)
- Tablet: 768px–1023px (`md` to `lg`)
- Desktop: ≥ 1024px (`lg` and up)

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

**Test with DevTools:**
- Chrome DevTools → Device Emulation (mobile, tablet, desktop)
- Verify layout, text readable, images scale, no horiz scroll

---

## Definition of Done

Before marking story DONE, verify:

- [ ] Code written and tested locally
- [ ] `npm run build` succeeds (zero errors)
- [ ] TypeScript strict mode passes (`tsc --noEmit`)
- [ ] No console errors in dev or build
- [ ] UI responsive (mobile, tablet, desktop)
- [ ] Accessibility checked (contrast, focus, labels)
- [ ] Forms validate and submit (or documented reason)
- [ ] Copy ES/EN present (not hardcoded, from i18n)
- [ ] No hardcoded secrets or sensitive data
- [ ] All public claims in content-source-map.md
- [ ] `docs/implementation-log.md` updated
- [ ] Story marked DONE in sprint board

---

## Getting Help

| Question | File |
|---|---|
| What should I build? | `docs/scrum/sprint-[N].md` |
| What does it need to look like? | `docs/design-system.md` |
| What copy should it have? | `docs/content-architecture.md` or `docs/brand-voice.md` |
| Why was something decided that way? | `docs/decision-log.md` |
| How do I set up the repo? | `docs/agent-state.md` |
| What are the rules? | `.agents/AGENTS.md` or `prompts/master/...` §2 |

---

_GetUpSoft Implementation Skill (Codex) v1.0 · Created 2026-05-19_
