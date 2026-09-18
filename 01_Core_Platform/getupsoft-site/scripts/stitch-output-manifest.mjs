import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "stitch", "output");
const portals = ["global", "rd"];
const screens = [];

for (const portal of portals) {
  const dir = path.join(outputRoot, portal);
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir);
  const ids = new Set(files.map((file) => file.replace(/\.(html|png)$/i, "")));
  for (const id of [...ids].sort()) {
    const htmlPath = path.join(dir, `${id}.html`);
    const imagePath = path.join(dir, `${id}.png`);
    screens.push({
      id,
      portal,
      htmlPath: path.relative(root, htmlPath),
      imagePath: path.relative(root, imagePath),
      htmlExists: existsSync(htmlPath),
      imageExists: existsSync(imagePath),
      htmlBytes: existsSync(htmlPath) ? statSync(htmlPath).size : 0,
      imageBytes: existsSync(imagePath) ? statSync(imagePath).size : 0,
      qualityPass:
        existsSync(htmlPath) &&
        existsSync(imagePath) &&
        statSync(htmlPath).size > 1000 &&
        statSync(imagePath).size > 10000,
    });
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  outputRoot: path.relative(root, outputRoot),
  total: screens.length,
  complete: screens.filter((screen) => screen.htmlExists && screen.imageExists && screen.qualityPass).length,
  screens,
};

writeFileSync(path.join(outputRoot, "generated-screens.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Stitch outputs: ${manifest.complete}/${manifest.total} complete`);
