# GetUpSoft — Stitch + Flow Generation

## Stitch (UI generation)

**Auth — pick one:**

```bash
# Option A: API key (get from stitch.withgoogle.com/settings)
export STITCH_API_KEY="your-key-here"

# Option B: gcloud OAuth
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

**Install:**
```bash
cd stitch
npm install
```

**Run:**
```bash
# From project root
pnpm run stitch:dry-run
pnpm run stitch:generate
pnpm run stitch:generate:global
pnpm run stitch:generate:rd

# Or from stitch/
# All screens
npm run generate

# One portal only
npm run generate:global
npm run generate:rd

# Preview prompts without generating
npm run dry-run
```

**Output:**
- `stitch/output/global/*.html` — Global portal screens
- `stitch/output/global/*.png` — Global portal screenshots
- `stitch/output/rd/*.html` — RD portal screens
- `stitch/output/manifest.json` — Full run manifest
- `stitch/output/generated-screens.json` — Local consolidated manifest of all exported HTML/PNG files

---

## Flow (video/animation generation)

Flow is mandatory for this redesign. Use the specific project:

https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f

Prompts are in: `stitch/flow-prompts.md`

Copy each prompt and generate. Do not scrape Flow or bypass Google authentication. Export the generated assets locally using the manifest filenames.

```bash
# Create required folders and export checklist
pnpm run flow:prepare

# Rebuild checklist only
pnpm run flow:checklist

# Verify exported files exist
pnpm run flow:check
```

Checklist output:

- `docs/manifests/flow-export-checklist.md`
- `docs/manifests/flow-export-checklist.json`

Asset paths:

- `public/assets/global/...`
- `public/assets/rd/...`

---

## MCP (Stitch MCP Server)

Config is in `mcp-servers.shared.json`:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp-auto"],
      "env": {
        "STITCH_API_KEY": "your-key-here"
      }
    }
  }
}
```

Update `GOOGLE_CLOUD_PROJECT` or add `STITCH_API_KEY` to activate.
