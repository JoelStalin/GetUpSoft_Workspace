#!/usr/bin/env node

import fs from 'node:fs/promises';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error('Usage: node noop-enhance.mjs <input-image> <output-image>');
  process.exit(1);
}

await fs.copyFile(inputPath, outputPath);
console.log(JSON.stringify({ ok: true, inputPath, outputPath }));
