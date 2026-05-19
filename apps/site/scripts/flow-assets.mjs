import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "docs", "manifests", "seo-i18n-asset-manifest.json");
const promptsPath = path.join(root, "stitch", "flow-prompts.md");
const outputDir = path.join(root, "docs", "manifests");
const assetRoot = path.join(root, "public", "assets");
const flowProjectUrl = "https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f";

const mode = process.argv[2] ?? "check";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function expectedFilesForAsset(asset, portal) {
  const baseDir = asset.type === "open_graph" ? "og" : asset.type === "hero" ? "hero" : asset.type;
  const extByOutput = {
    avif: "avif",
    webp: "webp",
    jpg: "jpg",
    mp4: "mp4",
    webm: "webm",
    "poster.avif": "poster.avif",
  };

  return asset.outputs.map((output) => {
    const suffix = output === "poster.avif" ? "-poster.avif" : `.${extByOutput[output] ?? output}`;
    return path.join("public", "assets", portal, baseDir, `${asset.id}${suffix}`);
  });
}

function parsePromptHeadings(markdown) {
  const headings = [];
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^###\s+(?:\[([^\]]+)\]\s+)?(.+)$/);
    if (match) {
      headings.push({
        id: match[1] ?? match[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title: match[2].trim(),
      });
    }
  }
  return headings;
}

function buildChecklist() {
  const manifest = readJson(manifestPath);
  const promptHeadings = parsePromptHeadings(readFileSync(promptsPath, "utf8"));
  const rows = [];

  for (const [portal, assets] of Object.entries(manifest.assets)) {
    for (const asset of assets) {
      rows.push({
        portal,
        id: asset.id,
        type: asset.type,
        priority: asset.priority,
        formats: asset.formats.join(", "),
        expectedFiles: expectedFilesForAsset(asset, portal),
        promptCandidates: promptHeadings.filter((heading) => heading.id.includes(asset.id) || asset.id.includes(heading.id)),
      });
    }
  }

  return rows;
}

function writeChecklist() {
  mkdirSync(outputDir, { recursive: true });
  const rows = buildChecklist();
  const lines = [
    "# Flow Export Checklist",
    "",
    `Flow project: ${flowProjectUrl}`,
    "",
    "Use this checklist after generating assets in Flow. Export files into the exact paths below.",
    "",
  ];

  for (const row of rows) {
    lines.push(`## ${row.portal.toUpperCase()} / ${row.id}`);
    lines.push("");
    lines.push(`- Type: ${row.type}`);
    lines.push(`- Priority: ${row.priority}`);
    lines.push(`- Formats: ${row.formats}`);
    lines.push(`- Prompt candidates: ${row.promptCandidates.map((p) => p.title).join(", ") || "Use canonical prompt in stitch/flow-prompts.md"}`);
    lines.push("- Expected files:");
    for (const file of row.expectedFiles) {
      lines.push(`  - [ ] \`${file}\``);
    }
    lines.push("");
  }

  writeFileSync(path.join(outputDir, "flow-export-checklist.md"), `${lines.join("\n")}\n`);
  writeFileSync(path.join(outputDir, "flow-export-checklist.json"), `${JSON.stringify(rows, null, 2)}\n`);
}

function checkFiles() {
  const rows = buildChecklist();
  let missing = 0;
  for (const row of rows) {
    for (const relativeFile of row.expectedFiles) {
      const absoluteFile = path.join(root, relativeFile.replace(/^public[\\/]/, "public/"));
      if (!existsSync(absoluteFile)) {
        missing += 1;
        console.log(`missing ${relativeFile}`);
      }
    }
  }

  if (missing > 0) {
    console.log(`\n${missing} Flow asset files are missing.`);
    process.exitCode = 1;
    return;
  }

  console.log("All expected Flow asset files are present.");
}

function ensureDirs() {
  const rows = buildChecklist();
  for (const row of rows) {
    for (const relativeFile of row.expectedFiles) {
      mkdirSync(path.dirname(path.join(root, relativeFile)), { recursive: true });
    }
  }
  console.log(`Prepared Flow asset directories under ${path.relative(root, assetRoot)}.`);
}

if (mode === "check") {
  checkFiles();
} else if (mode === "checklist") {
  writeChecklist();
  console.log("Wrote docs/manifests/flow-export-checklist.md and .json");
} else if (mode === "prepare") {
  ensureDirs();
  writeChecklist();
} else {
  console.error("Usage: node scripts/flow-assets.mjs [check|checklist|prepare]");
  process.exitCode = 2;
}
