// Shared design tokens injected into every Stitch prompt
export const DESIGN_SYSTEM = `
DESIGN SYSTEM — apply to every screen:

Colors:
- Background deep: #0F1115
- Background surface: #161920
- Background elevated: #1C2028
- Text main: #E2E8F0
- Text muted: #64748B
- Text soft: #94A3B8
- Global accent (pastel indigo): #A5B4FC
- RD accent (mint teal): #99F6E4
- Border subtle: rgba(255,255,255,0.07)
- Border mid: rgba(255,255,255,0.12)

Typography:
- Display/headings: Space Grotesk, light weight (300), tight tracking
- Body: Plus Jakarta Sans, 400/300 weight, relaxed line-height
- Mono labels/tags: IBM Plex Mono, 10px, uppercase, tracking-widest

Components:
- Glass cards: bg rgba(22,25,32,0.7), backdrop-blur, border border-subtle
- Buttons primary: rounded-full, uppercase, tracking-[0.2em], bold
- Tags/badges: rounded-full, font-mono, 10px, uppercase
- Sections: max-width 7xl, 6rem padding top/bottom

Aesthetic:
- Enterprise AI architecture
- Dark, premium, sober — NOT neon gamer, NOT startup colorful
- Inspired by Palantir, IBM, Linear, Vercel
- Subtle gradients, controlled glow, no loud animations
- Sections flow: label → headline (italic accent word) → subtext → content
`;

export const GLOBAL_CONTEXT = `
Portal: GetUpSoft Global (getupsoft.com)
Language: English
Brand: Enterprise AI Architecture firm
Tagline: "Architectural Intelligence for the Modern Enterprise"
Accent color: #A5B4FC (pastel indigo/blue)
`;

export const RD_CONTEXT = `
Portal: GetUpSoft RD (getupsoft.com.do)
Language: Spanish
Brand: Local tech partner for Dominican companies
Tagline: "Infraestructura y gestión para el éxito local"
Accent color: #99F6E4 (mint/teal)
`;
