# Design Toolchain Status

## Required Tools

This redesign uses three mandatory tools:

- Google Stitch: `https://stitch.withgoogle.com/`
- Anime.js: `https://animejs.com/`
- Google Flow project: `https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f`

## Current Status

| Tool | Status | Evidence |
|---|---|---|
| Stitch | Generated | `pnpm run stitch:manifest` reports 10/10 complete |
| Anime.js | Integrated in React app | `src/animations/HeroCoreAnime.tsx`, `src/animations/RDCommandAnime.tsx`, `src/animations/useAnimeScroll.ts` |
| Flow | Export pipeline ready; assets pending | `pnpm run flow:prepare` creates folders/checklist; `pnpm run flow:check` lists missing exports |

## Stitch

Run from project root:

```bash
pnpm run stitch:dry-run
pnpm run stitch:generate
pnpm run stitch:generate:global
pnpm run stitch:generate:rd
```

Generation requires either:

```bash
STITCH_API_KEY=...
```

or a valid Stitch access token. The generated screen exports are already present in `stitch/output/`.

Canonical screen prompts:

- `stitch/design-system.ts`
- `stitch/screens.ts`

Generated outputs:

- `stitch/output/global/`
- `stitch/output/rd/`
- `stitch/output/manifest.json`

## Anime.js

Anime.js is used for runtime UI motion:

- Global intelligence core: `HeroCoreAnime`
- RD operational command center: `RDCommandAnime`
- Scroll reveal and progress effects: `useAnimeScroll`

Required behavior:

- Respect `prefers-reduced-motion`.
- Keep motion subtle and enterprise-grade.
- Use Flow video as background/asset layer and Anime.js as UI/data-line layer.

## Flow

Flow assets must be generated in the required project:

```txt
https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f
```

Run:

```bash
pnpm run flow:prepare
pnpm run flow:checklist
pnpm run flow:check
```

Prompts:

- `stitch/flow-prompts.md`

Export checklist:

- `docs/manifests/flow-export-checklist.md`
- `docs/manifests/flow-export-checklist.json`

Expected folders:

- `public/assets/global/hero/`
- `public/assets/global/og/`
- `public/assets/global/product/`
- `public/assets/rd/hero/`
- `public/assets/rd/og/`
- `public/assets/rd/case_study/`

## Current Local Validation

```txt
pnpm run build          PASS
pnpm run stitch:dry-run PASS
pnpm run stitch:manifest PASS, 10/10 complete
pnpm run flow:check    FAILS until Flow exports are saved locally
```
