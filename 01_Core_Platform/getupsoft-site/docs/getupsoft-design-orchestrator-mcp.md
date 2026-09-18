# getupsoft-design-orchestrator-mcp

## Purpose

`getupsoft-design-orchestrator-mcp` coordinates UI generation, visual asset generation, bilingual content, SEO packages, asset manifests and development export for GetUpSoft Global and GetUpSoft RD.

If implemented as a real MCP server, it should be a TypeScript MCP server using Zod schemas and stdio transport. The first version can be read-only/generative: it returns specs, prompts and manifests without writing to external systems.

## Tool Design Principles

- Tools are workflow-level, not thin wrappers.
- Inputs always include `portal` and language where relevant.
- Outputs are structured enough for Stitch, Flow and frontend implementation.
- Errors should be actionable: identify missing portal, unsupported language or unknown page.
- Defaults should preserve brand rules and avoid prohibited public cases.

## Tools

### `generate_stitch_ui`

Input:

```json
{
  "portal": "global",
  "language": "en",
  "page": "home",
  "section": "hero",
  "design_system": {}
}
```

Output:

```json
{
  "ui_layout": {},
  "component_specs": {},
  "responsive_variants": {},
  "design_tokens": {},
  "stitch_ready_structure": {}
}
```

### `generate_flow_asset`

Input:

```json
{
  "asset_type": "hero",
  "portal": "global",
  "format": "16:9",
  "language": "no_text",
  "prompt": "Create a premium cinematic 3D enterprise intelligence core..."
}
```

Output:

```json
{
  "asset_prompt": "string",
  "render_specs": {
    "duration": "8-12s",
    "dimensions": "1920x1080",
    "outputs": ["mp4", "webm", "poster.avif"]
  },
  "motion_direction": "string",
  "optimization_notes": "string"
}
```

### `generate_i18n_content`

Input:

```json
{
  "source_language": "en",
  "target_language": "es",
  "portal": "global",
  "page": "home",
  "content_blocks": {}
}
```

Output:

```json
{
  "translated_content": {},
  "localized_seo_metadata": {},
  "localized_ctas": {},
  "hreflang_mapping": {}
}
```

### `generate_seo_package`

Input:

```json
{
  "portal": "rd",
  "page": "odoo-erp",
  "language": "es-DO",
  "target_keywords": ["Odoo República Dominicana", "Implementación Odoo RD"]
}
```

Output:

```json
{
  "title": "string",
  "meta_description": "string",
  "h1": "string",
  "h2_structure": ["string"],
  "faq": {},
  "json_ld": {},
  "canonical": "string",
  "hreflang": {},
  "og_tags": {},
  "twitter_card_tags": {}
}
```

### `generate_asset_manifest`

Input:

```json
{
  "portal": "global",
  "pages": ["home", "products"],
  "components": ["hero", "product-grid"]
}
```

Output:

```json
{
  "required_images": [],
  "required_videos": [],
  "required_icons": [],
  "alt_text": {},
  "filenames": [],
  "dimensions": {},
  "compression_strategy": "string",
  "loading_priority": {}
}
```

### `validate_brand_consistency`

Input:

```json
{
  "portal": "rd",
  "page": "home",
  "design_tokens": {},
  "copy": {},
  "assets": {}
}
```

Output:

```json
{
  "brand_consistency_report": {},
  "fixes": [],
  "warnings": [],
  "accessibility_notes": [],
  "seo_notes": []
}
```

### `export_development_spec`

Input:

```json
{
  "portal": "global",
  "pages": ["home", "ai-agents", "products", "contact"],
  "components": ["hero", "navbar", "footer", "form"],
  "assets": {}
}
```

Output:

```json
{
  "frontend_spec": {},
  "component_architecture": {},
  "route_map": {},
  "seo_map": {},
  "asset_map": {},
  "animation_map": {}
}
```

## TypeScript/Zod Schema Draft

```ts
import { z } from "zod";

export const PortalSchema = z.enum(["global", "rd"]);
export const LanguageSchema = z.enum(["en", "es", "es-DO", "no_text"]);
export const FormatSchema = z.enum(["16:9", "21:9", "4:5", "1:1", "9:16"]);

export const GenerateStitchUiInput = z.object({
  portal: PortalSchema,
  language: LanguageSchema.exclude(["no_text"]),
  page: z.string().min(1),
  section: z.string().min(1),
  design_system: z.record(z.unknown()).default({})
}).strict();

export const GenerateFlowAssetInput = z.object({
  asset_type: z.enum(["hero", "product", "background_loop", "case_study", "open_graph", "icon", "poster"]),
  portal: PortalSchema,
  format: FormatSchema,
  language: LanguageSchema,
  prompt: z.string().min(20)
}).strict();

export const GenerateI18nContentInput = z.object({
  source_language: LanguageSchema.exclude(["no_text"]),
  target_language: LanguageSchema.exclude(["no_text"]),
  portal: PortalSchema,
  page: z.string().min(1),
  content_blocks: z.record(z.unknown())
}).strict();

export const GenerateSeoPackageInput = z.object({
  portal: PortalSchema,
  page: z.string().min(1),
  language: LanguageSchema.exclude(["no_text"]),
  target_keywords: z.array(z.string().min(1)).default([])
}).strict();

export const GenerateAssetManifestInput = z.object({
  portal: PortalSchema,
  pages: z.array(z.string().min(1)).min(1),
  components: z.array(z.string().min(1)).default([])
}).strict();

export const ValidateBrandConsistencyInput = z.object({
  portal: PortalSchema,
  page: z.string().min(1),
  design_tokens: z.record(z.unknown()),
  copy: z.record(z.unknown()),
  assets: z.record(z.unknown())
}).strict();

export const ExportDevelopmentSpecInput = z.object({
  portal: PortalSchema,
  pages: z.array(z.string().min(1)).min(1),
  components: z.array(z.string().min(1)).min(1),
  assets: z.record(z.unknown()).default({})
}).strict();
```

## Implementation Roadmap

1. Create TypeScript MCP package under `mcp/getupsoft-design-orchestrator-mcp`.
2. Load design tokens, SEO map and asset manifest from JSON files.
3. Implement read-only generation tools.
4. Add deterministic validation for product naming and prohibited cases.
5. Add test fixtures for Global home, RD home, Global products and RD Odoo.
6. Add optional writers only after approval: export Stitch prompts, Flow prompts and frontend specs to repo files.

## Example MCP Config

```json
{
  "mcpServers": {
    "getupsoft-design-orchestrator-mcp": {
      "command": "node",
      "args": [
        "mcp/getupsoft-design-orchestrator-mcp/dist/index.js"
      ],
      "env": {
        "GETUPSOFT_DESIGN_ROOT": "C:/Users/yoeli/Documents/GetUpSoft_Workspace/01_Core_Platform/getupsoft-site"
      }
    }
  }
}
```
