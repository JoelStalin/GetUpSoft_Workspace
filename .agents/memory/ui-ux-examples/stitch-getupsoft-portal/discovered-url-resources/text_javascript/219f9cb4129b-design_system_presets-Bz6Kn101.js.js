import{Q as e,Z as t,nt as n,ot as r,st as i}from"./dist-opBtvj-3.js";var a=[{name:`assets/preset-alexandria`,version:0,designSystem:{displayName:`Alexandria`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.NOTO_SERIF,headlineFont:n.NOTO_SERIF,bodyFont:n.INTER,labelFont:n.PUBLIC_SANS,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_FOUR,preset:`custom`,customColor:`#3366cc`,saturation:i.LEVEL_2,description:``,namedColors:{background:`#faf9fa`,error:`#ba1a1a`,error_container:`#ffdad6`,inverse_on_surface:`#f2f0f1`,inverse_primary:`#b1c5ff`,inverse_surface:`#303031`,on_background:`#1b1c1d`,on_error:`#ffffff`,on_error_container:`#93000a`,on_primary:`#ffffff`,on_primary_container:`#e7ebff`,on_primary_fixed:`#001946`,on_primary_fixed_variant:`#00419d`,on_secondary:`#ffffff`,on_secondary_container:`#606569`,on_secondary_fixed:`#171c20`,on_secondary_fixed_variant:`#42474b`,on_surface:`#1b1c1d`,on_surface_variant:`#434653`,on_tertiary:`#ffffff`,on_tertiary_container:`#4a3f00`,on_tertiary_fixed:`#211b00`,on_tertiary_fixed_variant:`#524600`,outline:`#737784`,outline_variant:`#c3c6d5`,primary:`#094cb2`,primary_container:`#3366cc`,primary_fixed:`#d9e2ff`,primary_fixed_dim:`#b1c5ff`,secondary:`#5a5f63`,secondary_container:`#dfe3e8`,secondary_fixed:`#dfe3e8`,secondary_fixed_dim:`#c2c7cc`,surface:`#faf9fa`,surface_bright:`#faf9fa`,surface_container:`#efedee`,surface_container_high:`#e9e8e9`,surface_container_highest:`#e3e2e3`,surface_container_low:`#f5f3f4`,surface_container_lowest:`#ffffff`,surface_dim:`#dbdadb`,surface_tint:`#2259bf`,surface_variant:`#e3e2e3`,tertiary:`#6d5e00`,tertiary_container:`#bfab49`,tertiary_fixed:`#f9e37a`,tertiary_fixed_dim:`#dcc661`},designMd:`# Alexandria — High-End Editorial

## North Star: "The Digital Curator"
A scholarly, premium reading experience. Dense information made effortless through serif authority and generous whitespace.

## Colors
- **Primary (\`#094cb2\`):** Links, primary actions, focus states only.
- **Surface tiers** create hierarchy—no explicit borders. Use background shifts between \`surface-container-lowest\` → \`surface-dim\`.
- **Tertiary (\`#6d5e00\`):** Archival gold for highlights and badges.
- **No-Line Rule:** Never use 1px borders. Define boundaries through background color shifts.
- Use glassmorphism for floating menus (80% opacity + 20px backdrop-blur). Gradient CTAs from \`primary\` → \`primary_container\`.

## Typography
- **Headlines:** Noto Serif — large, authoritative, generous leading.
- **Body:** Inter — modern clarity for dense text.
- **Labels:** Public Sans — archival metadata feel.

## Elevation
- Depth through tonal layering, not shadows. Stack surface tokens for natural elevation.
- Modals: extra-diffused shadows (24-40px blur, 4-6% opacity, tinted \`on_surface\`).
- If borders needed: "Ghost Border" — \`outline_variant\` at 15% opacity.

## Components
- **Buttons:** Primary = gradient fill, Secondary = surface-high bg + primary text, Tertiary = text + hover underline.
- **Cards:** No divider lines. Use spacing or alternating surface colors.
- **Inputs:** White bg, ghost border, focus = primary border.

## Rules
- Use whitespace as structure. Serif for narrative text. One primary action per view.
- Never use sharp corners — minimum \`sm\` roundness.`,colorVariant:e.FIDELITY,overridePrimaryColor:`#3366cc`,overrideSecondaryColor:`#54595d`,overrideTertiaryColor:`#fee77e`,overrideNeutralColor:`#202122`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-bauhaus`,version:0,designSystem:{displayName:`Bauhaus`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.SPACE_GROTESK,headlineFont:n.SPACE_GROTESK,bodyFont:n.INTER,labelFont:n.SPACE_GROTESK,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_FOUR,preset:`custom`,customColor:`#1a1a1a`,saturation:i.LEVEL_1,description:``,namedColors:{background:`#f5f0e8`,error:`#cc0000`,error_container:`#ffdad6`,inverse_on_surface:`#f5f0e8`,inverse_primary:`#f5f0e8`,inverse_surface:`#1a1a1a`,on_background:`#1a1a1a`,on_error:`#ffffff`,on_error_container:`#93000a`,on_primary:`#ffffff`,on_primary_container:`#1a1a1a`,on_primary_fixed:`#1a1a1a`,on_primary_fixed_variant:`#1a1a1a`,on_secondary:`#1a1a1a`,on_secondary_container:`#1a1a1a`,on_secondary_fixed:`#1a1a1a`,on_secondary_fixed_variant:`#1a1a1a`,on_surface:`#1a1a1a`,on_surface_variant:`#4a4a4a`,on_tertiary:`#ffffff`,on_tertiary_container:`#1a1a1a`,on_tertiary_fixed:`#1a1a1a`,on_tertiary_fixed_variant:`#1a1a1a`,outline:`#1a1a1a`,outline_variant:`#d0cbc3`,primary:`#1a1a1a`,primary_container:`#ffcc00`,primary_fixed:`#ffcc00`,primary_fixed_dim:`#e6b800`,secondary:`#e63b2e`,secondary_container:`#ffdad6`,secondary_fixed:`#ffdad6`,secondary_fixed_dim:`#ffb3ab`,surface:`#f5f0e8`,surface_bright:`#faf7f2`,surface_container:`#eee9e0`,surface_container_high:`#e8e3da`,surface_container_highest:`#e2ddd4`,surface_container_low:`#f2ede5`,surface_container_lowest:`#ffffff`,surface_dim:`#d6d1c9`,surface_tint:`#1a1a1a`,surface_variant:`#e8e3da`,tertiary:`#0055ff`,tertiary_container:`#d6e3ff`,tertiary_fixed:`#d6e3ff`,tertiary_fixed_dim:`#a8c6ff`},designMd:`# Bauhaus — Neo-Brutalist

## North Star: "Form Follows Function"
Bold, raw, and unapologetic. Inspired by Bauhaus and brutalist architecture. High contrast, strong geometry, deliberate imperfection.

## Colors
- **Primary (\`#1a1a1a\`):** Near-black for text and primary elements.
- **Accent Yellow (\`#ffcc00\`):** High-energy highlight for CTAs and active states.
- **Accent Red (\`#e63b2e\`):** Destructive actions, alerts, and bold emphasis.
- **Accent Blue (\`#0055ff\`):** Links and interactive elements.
- **Background (\`#f5f0e8\`):** Warm off-white, like aged paper.
- Use flat, solid color blocks. No gradients on surfaces.

## Typography
- **Headlines:** Space Grotesk — geometric, bold, oversized. Use display sizes aggressively (3x+ body size).
- **Body:** Inter — functional and readable.
- Scale contrast is key: headlines should feel massive relative to body text.

## Elevation
- No drop shadows. Use **thick solid borders** (2-3px, \`#1a1a1a\`) instead.
- Depth via **offset shadows**: solid-color block offsets (4-6px down-right in \`#1a1a1a\`).

## Components
- **Buttons:** Solid fill, thick border, uppercase text. Hover = color invert.
- **Cards:** Thick black borders, no border-radius or minimal. Content-dense.
- **Inputs:** Thick bottom border only. No rounded corners.

## Rules
- Never use soft shadows or glassmorphism. Keep it raw and graphic.
- Embrace asymmetric layouts and oversized type.
- Limited palette: black + one accent per section.`,colorVariant:e.NEUTRAL,overridePrimaryColor:`#1a1a1a`,overrideSecondaryColor:`#e63b2e`,overrideTertiaryColor:`#0055ff`,overrideNeutralColor:`#4a4a4a`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-glacier`,version:0,designSystem:{displayName:`Glacier`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.DARK,font:n.INTER,headlineFont:n.INTER,bodyFont:n.INTER,labelFont:n.INTER,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_TWELVE,preset:`custom`,customColor:`#7dd3fc`,saturation:i.LEVEL_3,description:``,namedColors:{background:`#0a0e1a`,error:`#ff6b6b`,error_container:`#3d1414`,inverse_on_surface:`#0a0e1a`,inverse_primary:`#0a4c6e`,inverse_surface:`#e0e8f0`,on_background:`#e0e8f0`,on_error:`#1a0000`,on_error_container:`#ffb3b3`,on_primary:`#001f2e`,on_primary_container:`#c8eaff`,on_primary_fixed:`#001f2e`,on_primary_fixed_variant:`#004d73`,on_secondary:`#001f2e`,on_secondary_container:`#c0d8e8`,on_secondary_fixed:`#0d1f2b`,on_secondary_fixed_variant:`#2a4a5e`,on_surface:`#e0e8f0`,on_surface_variant:`#a0b4c4`,on_tertiary:`#1a002e`,on_tertiary_container:`#e8d0ff`,on_tertiary_fixed:`#1a002e`,on_tertiary_fixed_variant:`#4d2a73`,outline:`#4a6070`,outline_variant:`#2a3a48`,primary:`#7dd3fc`,primary_container:`#0e4d6e`,primary_fixed:`#c8eaff`,primary_fixed_dim:`#7dd3fc`,secondary:`#88b4cc`,secondary_container:`#1a3a4e`,secondary_fixed:`#c0d8e8`,secondary_fixed_dim:`#88b4cc`,surface:`#0f1524`,surface_bright:`#1a2438`,surface_container:`#141c2e`,surface_container_high:`#1a2438`,surface_container_highest:`#202c42`,surface_container_low:`#111828`,surface_container_lowest:`#0a0e1a`,surface_dim:`#0f1524`,surface_tint:`#7dd3fc`,surface_variant:`#1a2438`,tertiary:`#c8a0f0`,tertiary_container:`#3d2060`,tertiary_fixed:`#e8d0ff`,tertiary_fixed_dim:`#c8a0f0`},designMd:`# Glacier — Glassmorphism

## North Star: "Frozen Light"
Ethereal depth through layered translucent surfaces. Dark, atmospheric, and premium.

## Colors
- **Primary (\`#7dd3fc\`):** Ice-blue for interactive elements and accents.
- **Background (\`#0a0e1a\`):** Deep navy-black base.
- **Tertiary (\`#c8a0f0\`):** Soft lavender for secondary accents.
- All surface containers should feel like tinted glass layers.

## Glass Effect (Core Pattern)
- **Cards/Panels:** \`background: rgba(15, 21, 36, 0.6)\`, \`backdrop-filter: blur(16px)\`, \`border: 1px solid rgba(125, 211, 252, 0.1)\`.
- **Elevated glass:** Increase opacity to 0.75 and blur to 24px.
- **Borders:** Always use semi-transparent primary or white at 8-15% opacity.

## Typography
- **All fonts:** Inter for clean, modern readability.
- Headlines: semibold, slightly tracked. Body: regular weight.
- Text colors: \`on_surface\` for primary, \`on_surface_variant\` for secondary.

## Elevation
- Depth through blur intensity and opacity, not shadows.
- Layer 0: solid background. Layer 1: 60% opacity + 16px blur. Layer 2: 75% + 24px blur.
- Subtle glow effects: \`box-shadow: 0 0 30px rgba(125, 211, 252, 0.05)\`.

## Components
- **Buttons:** Primary = semi-transparent primary fill with border. Hover = increase opacity.
- **Cards:** Frosted glass with thin luminous border.
- **Inputs:** Glass background, thin border, glow on focus.

## Rules
- Never use opaque solid backgrounds on floating elements.
- Keep borders subtle — luminous, not structural.
- Limit glow effects to interactive states.`,colorVariant:e.VIBRANT,overridePrimaryColor:`#7dd3fc`,overrideSecondaryColor:`#88b4cc`,overrideTertiaryColor:`#c8a0f0`,overrideNeutralColor:`#1a2438`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-carbon`,version:0,designSystem:{displayName:`Carbon`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.IBM_PLEX_SANS,headlineFont:n.IBM_PLEX_SANS,bodyFont:n.IBM_PLEX_SANS,labelFont:n.IBM_PLEX_SANS,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_FOUR,preset:`custom`,customColor:`#0f62fe`,saturation:i.LEVEL_2,description:``,namedColors:{background:`#ffffff`,error:`#da1e28`,error_container:`#fff1f1`,inverse_on_surface:`#f4f4f4`,inverse_primary:`#78a9ff`,inverse_surface:`#393939`,on_background:`#161616`,on_error:`#ffffff`,on_error_container:`#750e13`,on_primary:`#ffffff`,on_primary_container:`#161616`,on_primary_fixed:`#001d6c`,on_primary_fixed_variant:`#0043ce`,on_secondary:`#ffffff`,on_secondary_container:`#525252`,on_secondary_fixed:`#161616`,on_secondary_fixed_variant:`#525252`,on_surface:`#161616`,on_surface_variant:`#525252`,on_tertiary:`#ffffff`,on_tertiary_container:`#044317`,on_tertiary_fixed:`#022d0d`,on_tertiary_fixed_variant:`#044317`,outline:`#8d8d8d`,outline_variant:`#e0e0e0`,primary:`#0f62fe`,primary_container:`#d0e2ff`,primary_fixed:`#d0e2ff`,primary_fixed_dim:`#78a9ff`,secondary:`#6f6f6f`,secondary_container:`#e0e0e0`,secondary_fixed:`#e0e0e0`,secondary_fixed_dim:`#c6c6c6`,surface:`#ffffff`,surface_bright:`#ffffff`,surface_container:`#f4f4f4`,surface_container_high:`#e0e0e0`,surface_container_highest:`#c6c6c6`,surface_container_low:`#f4f4f4`,surface_container_lowest:`#ffffff`,surface_dim:`#e0e0e0`,surface_tint:`#0f62fe`,surface_variant:`#f4f4f4`,tertiary:`#198038`,tertiary_container:`#a7f0ba`,tertiary_fixed:`#a7f0ba`,tertiary_fixed_dim:`#42be65`},designMd:`# Carbon — Enterprise System

## North Star: "Productive Clarity"
Clean, systematic, and accessible. Built for data-dense enterprise UIs. Every element earns its place.

## Colors
- **Primary (\`#0f62fe\`):** IBM Blue — buttons, links, active states.
- **Background (\`#ffffff\`):** Pure white for maximum contrast.
- **Gray scale:** \`#f4f4f4\` → \`#161616\` for layered hierarchy.
- **Success (\`#198038\`):** Data validation and positive states.
- **Danger (\`#da1e28\`):** Destructive actions and errors.
- Use semantic color roles strictly — never decorative.

## Typography
- **All fonts:** IBM Plex Sans — a single family for unity.
- Use weight (300/400/600) to create hierarchy rather than size.
- Body at 14px, labels at 12px, headings at 20-32px. 2px grid for spacing rhythm.

## Elevation
- Minimal shadow use. Level 1: \`0 2px 6px rgba(0,0,0,0.1)\`. Level 2: \`0 4px 12px rgba(0,0,0,0.12)\`.
- Use \`border-bottom: 1px solid #e0e0e0\` for section separation.
- Gray background shifts preferred over shadows.

## Components
- **Buttons:** Primary = solid blue fill. Secondary = outlined. Ghost = text only. 48px min touch target.
- **Cards:** \`#f4f4f4\` background, no border-radius. Minimal padding (16px).
- **Inputs:** Bottom-border style, 40px height, \`#f4f4f4\` background.
- **Data tables:** Zebra striping with \`#f4f4f4\` alternating rows.

## Rules
- Follow 8px spacing grid strictly. Never use decorative elements.
- High-contrast: WCAG AA minimum on all text. Use icons functionally, never ornamentally.
- Maximum information density without clutter.`,colorVariant:e.TONAL_SPOT,overridePrimaryColor:`#0f62fe`,overrideSecondaryColor:`#6f6f6f`,overrideTertiaryColor:`#198038`,overrideNeutralColor:`#525252`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-neon-tokyo`,version:0,designSystem:{displayName:`Neon Tokyo`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.DARK,font:n.SORA,headlineFont:n.SORA,bodyFont:n.INTER,labelFont:n.SPACE_GROTESK,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_FOUR,preset:`custom`,customColor:`#ff2d78`,saturation:i.LEVEL_4,description:``,namedColors:{background:`#0a0a12`,error:`#ff4444`,error_container:`#3d0f0f`,inverse_on_surface:`#0a0a12`,inverse_primary:`#8c0038`,inverse_surface:`#e8e0f0`,on_background:`#e8e0f0`,on_error:`#1a0000`,on_error_container:`#ffa0a0`,on_primary:`#1a0010`,on_primary_container:`#ffe0ec`,on_primary_fixed:`#3d0020`,on_primary_fixed_variant:`#8c0038`,on_secondary:`#001a1a`,on_secondary_container:`#c0fff4`,on_secondary_fixed:`#001a1a`,on_secondary_fixed_variant:`#004d4d`,on_surface:`#e8e0f0`,on_surface_variant:`#a098b0`,on_tertiary:`#1a1000`,on_tertiary_container:`#fff0c0`,on_tertiary_fixed:`#1a1000`,on_tertiary_fixed_variant:`#665200`,outline:`#5a5068`,outline_variant:`#302840`,primary:`#ff2d78`,primary_container:`#b3004e`,primary_fixed:`#ffe0ec`,primary_fixed_dim:`#ff80aa`,secondary:`#00ffcc`,secondary_container:`#004d3d`,secondary_fixed:`#c0fff4`,secondary_fixed_dim:`#00e6b8`,surface:`#0f0f1a`,surface_bright:`#1a1a2e`,surface_container:`#141422`,surface_container_high:`#1e1e30`,surface_container_highest:`#28283e`,surface_container_low:`#111118`,surface_container_lowest:`#0a0a12`,surface_dim:`#0f0f1a`,surface_tint:`#ff2d78`,surface_variant:`#1e1e30`,tertiary:`#ffe04a`,tertiary_container:`#665200`,tertiary_fixed:`#fff0c0`,tertiary_fixed_dim:`#ffe04a`},designMd:`# Neon Tokyo — Retro-Futurism

## North Star: "Electric Nightscape"
Cyberpunk-inspired. Moody dark backgrounds with neon accents that glow. Futuristic, immersive, and high-energy.

## Colors
- **Primary (\`#ff2d78\`):** Hot pink neon — CTAs, focus states, active elements.
- **Secondary (\`#00ffcc\`):** Cyan neon — links, secondary actions, data highlights.
- **Tertiary (\`#ffe04a\`):** Warm neon yellow — badges, warnings, emphasis.
- **Background (\`#0a0a12\`):** Near-black with blue undertone.
- Never use neon colors for large surface areas. They are accents only.

## Glow Effects (Core Pattern)
- **Neon glow:** \`text-shadow: 0 0 8px currentColor\` on accent text.
- **Button glow:** \`box-shadow: 0 0 16px rgba(255, 45, 120, 0.4)\` on hover.
- **Border glow:** \`border: 1px solid rgba(255, 45, 120, 0.5)\` with \`box-shadow: inset 0 0 12px rgba(255, 45, 120, 0.1)\`.
- Keep glows diffused (12-20px blur). Never harsh or tight.

## Typography
- **Headlines:** Sora — geometric and futuristic. Use bold weight.
- **Body:** Inter — reliable contrast against dark backgrounds.
- **Labels:** Space Grotesk — technical, monospaced feel.

## Elevation
- No traditional shadows. Use inner/outer glows with neon tint.
- Surface hierarchy via opacity: darkest base → lighter containers.
- Subtle scan-line or grid textures as background detail (CSS gradients).

## Components
- **Buttons:** Dark background, neon border, text glow on hover. No solid neon fill.
- **Cards:** \`surface_container\` with thin neon border at 30% opacity.
- **Inputs:** Dark fill, bottom neon border, glow on focus.

## Rules
- Maximum 2 neon accent colors per view. Use neutral text primarily.
- Neon on dark only — never on light backgrounds.
- Glows animate on interaction, not at rest.`,colorVariant:e.VIBRANT,overridePrimaryColor:`#ff2d78`,overrideSecondaryColor:`#00ffcc`,overrideTertiaryColor:`#ffe04a`,overrideNeutralColor:`#28283e`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-terra`,version:0,designSystem:{displayName:`Terra`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.NUNITO_SANS,headlineFont:n.LITERATA,bodyFont:n.NUNITO_SANS,labelFont:n.NUNITO_SANS,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_TWELVE,preset:`custom`,customColor:`#4a7c59`,saturation:i.LEVEL_2,description:``,namedColors:{background:`#faf6f0`,error:`#b83230`,error_container:`#ffdad8`,inverse_on_surface:`#f5f0e8`,inverse_primary:`#8ecf9e`,inverse_surface:`#2e3230`,on_background:`#2e3230`,on_error:`#ffffff`,on_error_container:`#690005`,on_primary:`#ffffff`,on_primary_container:`#d8f0de`,on_primary_fixed:`#002110`,on_primary_fixed_variant:`#2a6038`,on_secondary:`#ffffff`,on_secondary_container:`#5e5548`,on_secondary_fixed:`#1e1a13`,on_secondary_fixed_variant:`#4a4538`,on_surface:`#2e3230`,on_surface_variant:`#4a4e4a`,on_tertiary:`#ffffff`,on_tertiary_container:`#554020`,on_tertiary_fixed:`#221a05`,on_tertiary_fixed_variant:`#554020`,outline:`#74796e`,outline_variant:`#c4c8bc`,primary:`#4a7c59`,primary_container:`#78a886`,primary_fixed:`#c8e8d0`,primary_fixed_dim:`#8ecf9e`,secondary:`#6b6358`,secondary_container:`#f0e8db`,secondary_fixed:`#f0e8db`,secondary_fixed_dim:`#d4ccbf`,surface:`#faf6f0`,surface_bright:`#faf6f0`,surface_container:`#f0ece4`,surface_container_high:`#eae6de`,surface_container_highest:`#e4e0d8`,surface_container_low:`#f5f1ea`,surface_container_lowest:`#ffffff`,surface_dim:`#dbd7cf`,surface_tint:`#4a7c59`,surface_variant:`#e4e0d8`,tertiary:`#705c30`,tertiary_container:`#c4a66a`,tertiary_fixed:`#f8e0a8`,tertiary_fixed_dim:`#dcc48e`},designMd:`# Terra — Organic Design

## North Star: "Rooted Warmth"
Calm, grounded, and human. Earthy tones, soft shapes, and natural textures create a warm, approachable experience.

## Colors
- **Primary (\`#4a7c59\`):** Forest green — actions, navigation, interactive states.
- **Background (\`#faf6f0\`):** Warm cream — organic, never sterile white.
- **Tertiary (\`#705c30\`):** Warm amber — highlights, accents, badges.
- **Palette philosophy:** Earthy and desaturated. No neon or pure-hue colors.
- Use warm neutrals throughout — every gray should have a yellow/green undertone.

## Typography
- **Headlines:** Literata — warm serif with personality.
- **Body/Labels:** Nunito Sans — friendly, rounded letterforms.
- Generous line-height (1.6+ for body). Comfortable, unhurried reading.

## Elevation
- Very soft shadows only: \`0 4px 20px rgba(46, 50, 48, 0.06)\`.
- Prefer tonal separation over shadows — layer warm cream tones.
- Borders: \`outline_variant\` at low opacity when needed.

## Components
- **Buttons:** Primary = solid green, large border-radius (12px). Secondary = cream bg + green text + thin border.
- **Cards:** Warm cream fill, generous padding (24px), rounded corners (12px). No harsh borders.
- **Inputs:** Cream background, rounded, soft green focus ring.

## Rules
- Large touch targets, generous spacing. Design should feel breathable.
- Avoid sharp corners and hard contrasts. Everything should feel soft and approachable.
- Images should feel natural and warm — avoid clinical or tech-stock imagery.`,colorVariant:e.TONAL_SPOT,overridePrimaryColor:`#4a7c59`,overrideSecondaryColor:`#6b6358`,overrideTertiaryColor:`#c4a66a`,overrideNeutralColor:`#4a4e4a`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-silk`,version:0,designSystem:{displayName:`Silk`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.PLUS_JAKARTA_SANS,headlineFont:n.PLUS_JAKARTA_SANS,bodyFont:n.PLUS_JAKARTA_SANS,labelFont:n.PLUS_JAKARTA_SANS,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_TWELVE,preset:`custom`,customColor:`#6366f1`,saturation:i.LEVEL_2,description:``,namedColors:{background:`#e8eaf0`,error:`#dc2626`,error_container:`#fee2e2`,inverse_on_surface:`#e8eaf0`,inverse_primary:`#a5b4fc`,inverse_surface:`#2e3040`,on_background:`#2e3040`,on_error:`#ffffff`,on_error_container:`#991b1b`,on_primary:`#ffffff`,on_primary_container:`#e0e2ff`,on_primary_fixed:`#1e1b4b`,on_primary_fixed_variant:`#4338ca`,on_secondary:`#ffffff`,on_secondary_container:`#585a68`,on_secondary_fixed:`#1a1b26`,on_secondary_fixed_variant:`#404252`,on_surface:`#2e3040`,on_surface_variant:`#585a68`,on_tertiary:`#ffffff`,on_tertiary_container:`#3b1f63`,on_tertiary_fixed:`#2e1065`,on_tertiary_fixed_variant:`#5b21b6`,outline:`#8a8c9a`,outline_variant:`#d0d2dc`,primary:`#6366f1`,primary_container:`#818cf8`,primary_fixed:`#e0e2ff`,primary_fixed_dim:`#a5b4fc`,secondary:`#6c6e7e`,secondary_container:`#d8dae6`,secondary_fixed:`#d8dae6`,secondary_fixed_dim:`#b8baca`,surface:`#e8eaf0`,surface_bright:`#edeef4`,surface_container:`#e2e4ea`,surface_container_high:`#dcdee4`,surface_container_highest:`#d6d8de`,surface_container_low:`#e5e7ed`,surface_container_lowest:`#f0f2f8`,surface_dim:`#d4d6dc`,surface_tint:`#6366f1`,surface_variant:`#dcdee4`,tertiary:`#7c3aed`,tertiary_container:`#a78bfa`,tertiary_fixed:`#ede9fe`,tertiary_fixed_dim:`#c4b5fd`},designMd:`# Silk — Neomorphic / Soft UI

## North Star: "Extruded Light"
Soft, tactile, and dimensional. Elements appear pressed into or extruded from the surface. Minimal contrast, maximum depth feel.

## Colors
- **Primary (\`#6366f1\`):** Indigo — interactive elements and focus states.
- **Background (\`#e8eaf0\`):** Cool gray — the "clay" from which elements are molded.
- **Tertiary (\`#7c3aed\`):** Violet — secondary accents and highlights.
- All surfaces share the same color family. Depth comes from light and shadow, not color variation.

## Neomorphic Effect (Core Pattern)
- **Raised elements:** \`box-shadow: 6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6)\`.
- **Pressed/inset:** \`box-shadow: inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.5)\`.
- Background of element MUST match the parent surface color for the effect to work.
- Never combine with borders or gradients.

## Typography
- **All fonts:** Plus Jakarta Sans — geometric, friendly, modern.
- Use medium weight for body, semibold for headings. Avoid bold.
- Text color: \`on_surface\` for primary, \`on_surface_variant\` for secondary.

## Components
- **Buttons:** Raised neomorphic style. Active/pressed = inset shadow. Primary = indigo text/icon, raised surface.
- **Cards:** Raised neomorphic surface. Same background color as parent. Generous padding (20-24px).
- **Inputs:** Inset shadow style. Text input appears carved into the surface.
- **Toggles/Sliders:** Raised thumb on inset track.

## Rules
- Surface color must be consistent — the illusion breaks with color changes.
- Minimum 12px border-radius on all neomorphic elements.
- Never use flat design mixed with neomorphic. Commit fully to the style.`,colorVariant:e.TONAL_SPOT,overridePrimaryColor:`#6366f1`,overrideSecondaryColor:`#6c6e7e`,overrideTertiaryColor:`#7c3aed`,overrideNeutralColor:`#585a68`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-obsidian`,version:0,designSystem:{displayName:`Obsidian`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.DARK,font:n.GEIST,headlineFont:n.GEIST,bodyFont:n.GEIST,labelFont:n.GEIST,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_EIGHT,preset:`custom`,customColor:`#a78bfa`,saturation:i.LEVEL_3,description:``,namedColors:{background:`#09090b`,error:`#ef4444`,error_container:`#3b1111`,inverse_on_surface:`#09090b`,inverse_primary:`#5b21b6`,inverse_surface:`#fafafa`,on_background:`#fafafa`,on_error:`#1a0000`,on_error_container:`#fca5a5`,on_primary:`#0a0012`,on_primary_container:`#ede9fe`,on_primary_fixed:`#2e1065`,on_primary_fixed_variant:`#5b21b6`,on_secondary:`#09090b`,on_secondary_container:`#a1a1aa`,on_secondary_fixed:`#18181b`,on_secondary_fixed_variant:`#3f3f46`,on_surface:`#fafafa`,on_surface_variant:`#a1a1aa`,on_tertiary:`#001a12`,on_tertiary_container:`#bbf7d0`,on_tertiary_fixed:`#003318`,on_tertiary_fixed_variant:`#047857`,outline:`#52525b`,outline_variant:`#27272a`,primary:`#a78bfa`,primary_container:`#7c3aed`,primary_fixed:`#ede9fe`,primary_fixed_dim:`#c4b5fd`,secondary:`#71717a`,secondary_container:`#27272a`,secondary_fixed:`#a1a1aa`,secondary_fixed_dim:`#71717a`,surface:`#0c0c0f`,surface_bright:`#18181b`,surface_container:`#121215`,surface_container_high:`#18181b`,surface_container_highest:`#1e1e22`,surface_container_low:`#0f0f12`,surface_container_lowest:`#09090b`,surface_dim:`#0c0c0f`,surface_tint:`#a78bfa`,surface_variant:`#18181b`,tertiary:`#34d399`,tertiary_container:`#065f46`,tertiary_fixed:`#bbf7d0`,tertiary_fixed_dim:`#6ee7b7`},designMd:'# Obsidian — High-Contrast Dark\n\n## North Star: "Precision in Darkness"\nDeveloper-grade dark UI. Near-black surfaces, high-contrast text, and precise accent colors. Clean, fast-feeling, and functional.\n\n## Colors\n- **Primary (`#a78bfa`):** Soft violet — interactive elements, links, focus rings.\n- **Background (`#09090b`):** True near-black.\n- **Tertiary (`#34d399`):** Emerald green — success states, positive indicators, code highlights.\n- **Surface scale:** Zinc-based grays (`#0c0c0f` → `#27272a`). Very subtle increments.\n- Red (`#ef4444`) for errors only. No decorative color use.\n\n## Typography\n- **All fonts:** Geist — modern, clean, developer-friendly.\n- Tight letter-spacing on headings (-0.02em). Standard on body.\n- `#fafafa` for primary text, `#a1a1aa` for secondary. High contrast always.\n\n## Elevation\n- Minimal shadows. Use border-based separation: `1px solid #27272a`.\n- Active/hover states: subtle background shifts to next surface tier.\n- Focus rings: `2px solid #a78bfa` with `2px offset`.\n\n## Components\n- **Buttons:** Primary = solid violet fill. Secondary = transparent + border. Ghost = text only, visible on hover.\n- **Cards:** `surface_container` background, thin `outline_variant` border, 8px radius.\n- **Inputs:** `surface_container` fill, `outline_variant` border, violet focus ring.\n- **Code blocks:** `surface_container_lowest` background, monospace font.\n\n## Rules\n- Never use light backgrounds. Maintain zinc gray consistency.\n- Borders over shadows for separation. Keep the interface flat and precise.\n- Accent colors for function, never decoration.',colorVariant:e.TONAL_SPOT,overridePrimaryColor:`#a78bfa`,overrideSecondaryColor:`#71717a`,overrideTertiaryColor:`#34d399`,overrideNeutralColor:`#3f3f46`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-sahara`,version:0,designSystem:{displayName:`Sahara`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.MANROPE,headlineFont:n.EB_GARAMOND,bodyFont:n.MANROPE,labelFont:n.MANROPE,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_EIGHT,preset:`custom`,customColor:`#c2652a`,saturation:i.LEVEL_2,description:``,namedColors:{background:`#faf5ee`,error:`#c0392b`,error_container:`#fce4e0`,inverse_on_surface:`#faf5ee`,inverse_primary:`#f0a878`,inverse_surface:`#3a302a`,on_background:`#3a302a`,on_error:`#ffffff`,on_error_container:`#7a1a10`,on_primary:`#ffffff`,on_primary_container:`#fbe8d8`,on_primary_fixed:`#401a08`,on_primary_fixed_variant:`#8a4518`,on_secondary:`#ffffff`,on_secondary_container:`#605850`,on_secondary_fixed:`#2a2420`,on_secondary_fixed_variant:`#504840`,on_surface:`#3a302a`,on_surface_variant:`#605850`,on_tertiary:`#ffffff`,on_tertiary_container:`#3a2020`,on_tertiary_fixed:`#2e1515`,on_tertiary_fixed_variant:`#6e3030`,outline:`#9a9088`,outline_variant:`#d8d0c8`,primary:`#c2652a`,primary_container:`#e08850`,primary_fixed:`#fbe8d8`,primary_fixed_dim:`#f0a878`,secondary:`#78706a`,secondary_container:`#eae2da`,secondary_fixed:`#eae2da`,secondary_fixed_dim:`#cec6be`,surface:`#faf5ee`,surface_bright:`#faf5ee`,surface_container:`#f2ece4`,surface_container_high:`#ece6dc`,surface_container_highest:`#e6e0d6`,surface_container_low:`#f6f0e8`,surface_container_lowest:`#ffffff`,surface_dim:`#dcd6cc`,surface_tint:`#c2652a`,surface_variant:`#ece6dc`,tertiary:`#8c3c3c`,tertiary_container:`#d47070`,tertiary_fixed:`#fce0e0`,tertiary_fixed_dim:`#e8a0a0`},designMd:`# Sahara — Warm Minimalism

## North Star: "Sun-Baked Simplicity"
Luxurious warmth meets disciplined minimalism. Golden tones, editorial serif headings, and abundant whitespace.

## Colors
- **Primary (\`#c2652a\`):** Burnt sienna — warm, earthy CTAs and focus states.
- **Background (\`#faf5ee\`):** Warm linen — never cold white.
- **Tertiary (\`#8c3c3c\`):** Dusty rose — sparse accent for emphasis.
- Entire palette is warm-shifted. Even grays have warm undertones.

## Typography
- **Headlines:** EB Garamond — elegant, editorial serif. Large sizes with tight leading.
- **Body/Labels:** Manrope — geometric sans-serif, clean and modern contrast to the serif.
- The serif/sans pairing creates a luxury editorial feel.

## Elevation
- Ultra-soft shadows: \`0 2px 16px rgba(58, 48, 42, 0.04)\`. Barely visible.
- Prefer warm background tinting for hierarchy.
- Borders: thin and warm (\`#d8d0c8\` at 60% opacity).

## Components
- **Buttons:** Primary = solid sienna fill, 8px radius. Secondary = outlined with warm border. Text links underlined on hover.
- **Cards:** Warm white or \`surface_container_low\`, generous padding (28-32px). Minimal borders.
- **Inputs:** White background, warm gray border, sienna focus state.

## Rules
- Whitespace is the primary design tool. When in doubt, add more.
- Content should feel curated, not cluttered. Limit items per section.
- Photography should be warm-toned. Avoid cool/blue stock imagery.`,colorVariant:e.FIDELITY,overridePrimaryColor:`#c2652a`,overrideSecondaryColor:`#78706a`,overrideTertiaryColor:`#8c3c3c`,overrideNeutralColor:`#605850`,typography:{},spacing:{},components:{}}}},{name:`assets/preset-candy`,version:0,designSystem:{displayName:`Candy`,designTokens:``,styleGuidelines:``,theme:{colorMode:t.LIGHT,font:n.DM_SANS,headlineFont:n.DM_SANS,bodyFont:n.DM_SANS,labelFont:n.DM_SANS,headlineFontFamily:``,bodyFontFamily:``,labelFontFamily:``,roundness:r.ROUND_FULL,preset:`custom`,customColor:`#e040a0`,saturation:i.LEVEL_4,description:``,namedColors:{background:`#fef7ff`,error:`#e53e3e`,error_container:`#ffe8e8`,inverse_on_surface:`#fef7ff`,inverse_primary:`#f0a0cc`,inverse_surface:`#2e1a28`,on_background:`#2e1a28`,on_error:`#ffffff`,on_error_container:`#9b1c1c`,on_primary:`#ffffff`,on_primary_container:`#2e1a28`,on_primary_fixed:`#3d0028`,on_primary_fixed_variant:`#a02070`,on_secondary:`#ffffff`,on_secondary_container:`#2e2040`,on_secondary_fixed:`#1a1030`,on_secondary_fixed_variant:`#4a3068`,on_surface:`#2e1a28`,on_surface_variant:`#604868`,on_tertiary:`#ffffff`,on_tertiary_container:`#00334d`,on_tertiary_fixed:`#001a33`,on_tertiary_fixed_variant:`#005580`,outline:`#907898`,outline_variant:`#dcc8e0`,primary:`#e040a0`,primary_container:`#f080c0`,primary_fixed:`#ffd6ee`,primary_fixed_dim:`#f0a0cc`,secondary:`#7c52aa`,secondary_container:`#eedcff`,secondary_fixed:`#eedcff`,secondary_fixed_dim:`#c8a8e8`,surface:`#fef7ff`,surface_bright:`#fef7ff`,surface_container:`#f8eef8`,surface_container_high:`#f2e8f2`,surface_container_highest:`#ece2ec`,surface_container_low:`#fbf2fb`,surface_container_lowest:`#ffffff`,surface_dim:`#e0d6e0`,surface_tint:`#e040a0`,surface_variant:`#f2e8f2`,tertiary:`#0096cc`,tertiary_container:`#40c0ee`,tertiary_fixed:`#c8eaff`,tertiary_fixed_dim:`#80d0f0`},designMd:`# Candy — Playful & Vibrant

## North Star: "Joyful Pop"
Bold, fun, and energetic. Saturated colors, pill-shaped elements, and bouncy microinteractions. Designed to delight.

## Colors
- **Primary (\`#e040a0\`):** Hot pink — primary actions and brand identity.
- **Secondary (\`#7c52aa\`):** Purple — secondary elements, tags, categories.
- **Tertiary (\`#0096cc\`):** Sky blue — informational, links, highlights.
- **Background (\`#fef7ff\`):** Very light pink-white — warm and playful.
- Use all three accent colors freely but with purpose. This palette is expressive.

## Typography
- **All fonts:** DM Sans — rounded, friendly, modern.
- Use bold weight for headings, medium for labels. Generous line-height.
- Slightly larger base size (16px body) for friendliness.

## Shapes & Motion
- **Border radius:** Full/pill on buttons and badges. 16-20px on cards.
- **Microinteractions:** Bouncy hover transitions (\`transform: scale(1.03)\`, spring-like timing).
- **Shadows:** Colorful — use tinted shadows matching the element color at 15-20% opacity.
  Example: pink button gets \`box-shadow: 0 4px 16px rgba(224, 64, 160, 0.2)\`.

## Components
- **Buttons:** Pill-shaped, solid fill, tinted shadow. Hover = slight scale + deeper shadow.
- **Cards:** Large radius (16px), white fill, tinted shadow. Hover = lift animation.
- **Badges/Tags:** Pill-shaped, pastel fill (\`primary_fixed\`), bold text.
- **Inputs:** Rounded (full radius), light fill, pink focus ring.

## Rules
- Embrace color contrast and saturation. Nothing should feel washed out.
- Rounded shapes everywhere — no sharp corners in this system.
- Animations should feel bouncy and playful, not stiff. Use ease-out curves.`,colorVariant:e.EXPRESSIVE,overridePrimaryColor:`#e040a0`,overrideSecondaryColor:`#7c52aa`,overrideTertiaryColor:`#0096cc`,overrideNeutralColor:`#604868`,typography:{},spacing:{},components:{}}}}];export{a as DESIGN_SYSTEM_PRESETS};