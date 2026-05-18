/**
 * GetUpSoft Stitch UI Generator
 *
 * Generates all portal screens via @google/stitch-sdk.
 * Run: npx tsx stitch/generate.ts [--portal global|rd] [--screen <id>] [--dry-run]
 *
 * Auth: set STITCH_API_KEY env var (get from stitch.withgoogle.com/settings)
 */

import { stitch } from "@google/stitch-sdk";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { SCREENS, type ScreenDef } from "./screens";

const args = process.argv.slice(2);
const portalFilter = args.includes("--portal") ? args[args.indexOf("--portal") + 1] : null;
const screenFilter = args.includes("--screen") ? args[args.indexOf("--screen") + 1] : null;
const dryRun = args.includes("--dry-run");

const PROJECT_TITLE = "GetUpSoft Portal Redesign";
const OUTPUT_DIR = join(import.meta.dirname, "output");

interface GeneratedScreen {
  id: string;
  portal: string;
  name: string;
  device: string;
  htmlUrl?: string;
  imageUrl?: string;
  htmlPath?: string;
  imagePath?: string;
  error?: string;
}

async function downloadFile(url: string, destPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function resolveUrls(
  generated: Awaited<ReturnType<ReturnType<typeof stitch.project>["generate"]>>,
  project: ReturnType<typeof stitch.project>,
  retries = 4,
  delayMs = 5000,
): Promise<{ htmlUrl: string; imageUrl: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const htmlUrl = await generated.getHtml();
    const imageUrl = await generated.getImage();
    if (htmlUrl && imageUrl) return { htmlUrl, imageUrl };

    // URLs empty — Stitch may still be processing; try fetching from project screens list
    if (attempt < retries) {
      console.log(`  ⏳ URLs not ready (attempt ${attempt + 1}/${retries}), retrying in ${delayMs / 1000}s...`);
      await sleep(delayMs);

      // Try refreshing via project screens to get latest data
      try {
        const screens = await project.screens();
        const latest = screens[screens.length - 1];
        if (latest) {
          const freshHtml = await latest.getHtml();
          const freshImage = await latest.getImage();
          if (freshHtml && freshImage) return { htmlUrl: freshHtml, imageUrl: freshImage };
        }
      } catch {
        // ignore — fall through to retry
      }
    }
  }
  throw new Error("Stitch URLs remained empty after all retries");
}

async function generateScreen(
  projectId: string,
  screen: ScreenDef,
): Promise<GeneratedScreen> {
  console.log(`\n  Generating: ${screen.name} (${screen.device})`);

  const project = stitch.project(projectId);

  try {
    const generated = await project.generate(screen.prompt, screen.device);
    const { htmlUrl, imageUrl } = await resolveUrls(generated, project);

    const outDir = join(OUTPUT_DIR, screen.portal);
    mkdirSync(outDir, { recursive: true });

    const htmlPath = join(outDir, `${screen.id}.html`);
    const imagePath = join(outDir, `${screen.id}.png`);

    await downloadFile(htmlUrl, htmlPath);
    await downloadFile(imageUrl, imagePath);

    console.log(`  ✓ ${screen.id} — HTML: ${htmlPath}, PNG: ${imagePath}`);

    return { ...screen, htmlUrl, imageUrl, htmlPath, imagePath };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${screen.id} — ${msg}`);
    return { ...screen, error: msg };
  }
}

async function main() {
  if (!process.env.STITCH_API_KEY && !process.env.STITCH_ACCESS_TOKEN) {
    console.error(
      "\n❌ Missing auth. Set STITCH_API_KEY env var.\n" +
      "   Get your key at: https://stitch.withgoogle.com/settings\n",
    );
    process.exit(1);
  }

  const screens = SCREENS.filter((s) => {
    if (portalFilter && s.portal !== portalFilter) return false;
    if (screenFilter && s.id !== screenFilter) return false;
    return true;
  });

  console.log(`\nGetUpSoft Stitch Generator`);
  console.log(`Screens to generate: ${screens.length}`);
  console.log(`Dry run: ${dryRun}`);

  if (dryRun) {
    console.log("\n--- DRY RUN PROMPTS ---");
    for (const s of screens) {
      console.log(`\n[${s.id}] ${s.name} (${s.device})\n`);
      console.log(s.prompt.slice(0, 400) + "...\n");
    }
    return;
  }

  // Create or reuse a project
  let projectId: string;
  try {
    // Check existing projects first to avoid duplicates
    const existing = await stitch.projects();
    const found = existing.find((p) => (p as any).data?.title === PROJECT_TITLE || (p as any).data?.displayName === PROJECT_TITLE);
    if (found) {
      projectId = found.projectId;
      console.log(`\nReusing project: ${projectId}`);
    } else {
      const created = await stitch.createProject(PROJECT_TITLE);
      projectId = created.projectId;
      console.log(`\nProject created: ${projectId}`);
    }
  } catch (err) {
    console.error("Project setup error:", err);
    throw err;
  }

  const results: GeneratedScreen[] = [];

  // Generate sequentially to avoid rate limits
  for (const screen of screens) {
    const result = await generateScreen(projectId, screen);
    results.push(result);
    // Stitch rate limit buffer
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Write manifest
  const manifestPath = join(OUTPUT_DIR, "manifest.json");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        projectId,
        total: results.length,
        success: results.filter((r) => !r.error).length,
        failed: results.filter((r) => !!r.error).length,
        screens: results,
      },
      null,
      2,
    ),
  );

  console.log(`\n✓ Done. Manifest: ${manifestPath}`);
  console.log(`  Success: ${results.filter((r) => !r.error).length}/${results.length}`);

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    console.log(`  Failed: ${failed.map((r) => r.id).join(", ")}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
