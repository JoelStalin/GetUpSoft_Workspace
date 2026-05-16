import * as esbuild from "esbuild";
import { argv } from "process";
import { cpSync, mkdirSync } from "fs";

const watch = argv.includes("--watch");

/** @type {esbuild.BuildOptions} */
const extensionConfig = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "out/extension.js",
  external: ["vscode", "better-sqlite3"],
  sourcemap: true,
  minify: false,
};

/** @type {esbuild.BuildOptions} */
const workerConfig = {
  entryPoints: ["src/workers/agentWorker.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "out/workers/agentWorker.js",
  sourcemap: true,
  minify: false,
};

function copyMigrations() {
  mkdirSync("out/migrations", { recursive: true });
  cpSync("src/storage/migrations", "out/migrations", { recursive: true });
  console.log("migrations copied → out/migrations/");
}

if (watch) {
  const extensionCtx = await esbuild.context(extensionConfig);
  const workerCtx = await esbuild.context(workerConfig);
  await extensionCtx.watch();
  await workerCtx.watch();
  copyMigrations();
  console.log("watching...");
} else {
  await esbuild.build(extensionConfig);
  await esbuild.build(workerConfig);
  copyMigrations();
  console.log("build complete → out/extension.js + out/workers/agentWorker.js");
}
