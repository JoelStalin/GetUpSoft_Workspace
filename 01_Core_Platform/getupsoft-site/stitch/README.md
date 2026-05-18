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

---

## Flow (video/animation generation)

Flow is browser-only. Open: https://labs.google/fx/tools/flow

Prompts are in: `stitch/flow-prompts.md`

Copy each prompt and generate. Save outputs to: `public/assets/videos/`

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
