#!/usr/bin/env node

/**
 * Sync Obsidian public vault to Quartz content directory
 *
 * Copies obsidian/vault/public/* to quartz/content/
 * Validates no private content is copied
 * Handles file conversions and front-matter
 *
 * Usage:
 *   node scripts/sync-vault-to-quartz.js
 *   npm run notes:sync
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = process.env.QUARTZ_SOURCE_VAULT || 'obsidian/vault/public';
const DEST_DIR = process.env.QUARTZ_DEST_CONTENT || 'quartz/content';
const DRY_RUN = process.env.DRY_RUN === 'true';

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(level, message) {
  const prefix = {
    error: `${colors.red}[ERROR]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    info: `${colors.cyan}[INFO]${colors.reset}`,
    success: `${colors.green}[✓]${colors.reset}`,
  };
  console.log(`${prefix[level]} ${message}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log('info', `Created directory: ${dir}`);
  }
}

function getFilesRecursive(dir, baseDir = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) {
        files.push(...getFilesRecursive(fullPath, relativePath));
      }
    } else {
      files.push({ fullPath, relativePath, filename: entry.name });
    }
  }

  return files;
}

function shouldCopy(file) {
  const excluded = [
    /\.obsidian/,
    /\.env/,
    /credentials/i,
    /secret/i,
    /password/i,
    /\.git/,
    /node_modules/,
    /\.DS_Store/,
  ];

  for (const pattern of excluded) {
    if (pattern.test(file.relativePath)) {
      return false;
    }
  }

  return true;
}

function processMarkdownFile(content, sourceFile) {
  // Add Quartz front-matter if not present
  if (!content.startsWith('---')) {
    const lines = content.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim() || 'Untitled';

    const frontMatter = `---
title: "${title}"
description: "Published from Obsidian"
tags: []
publish: true
---

`;
    return frontMatter + content;
  }

  // Ensure publish: true is set
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    const fm = match[1];
    if (!fm.includes('publish:')) {
      const updated = content.replace(
        /^---\n([\s\S]*?)\n---/,
        `---\n$1\npublish: true\n---`
      );
      return updated;
    }
  }

  return content;
}

function copyFile(source, dest, isMarkdown) {
  const dir = path.dirname(dest);
  ensureDir(dir);

  let content = fs.readFileSync(source, 'utf8');

  if (isMarkdown) {
    content = processMarkdownFile(content, source);
  }

  if (!DRY_RUN) {
    fs.writeFileSync(dest, content);
  }

  return true;
}

function main() {
  console.log('\n' + '='.repeat(60));
  log('info', `${colors.bold}OBSIDIAN → QUARTZ SYNC${colors.reset}`);
  console.log('='.repeat(60));

  if (DRY_RUN) {
    log('warn', 'DRY RUN MODE - no files will be modified');
  }

  // Check source directory
  if (!fs.existsSync(SOURCE_DIR)) {
    log('error', `Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  log('info', `Source: ${SOURCE_DIR}`);
  log('info', `Destination: ${DEST_DIR}`);

  // Get files from source
  const sourceFiles = getFilesRecursive(SOURCE_DIR);
  log('info', `Found ${sourceFiles.length} files`);

  // Filter files to copy
  const filesToCopy = sourceFiles.filter((f) => shouldCopy(f));
  log('info', `Will copy ${filesToCopy.length} files (${sourceFiles.length - filesToCopy.length} excluded)`);

  if (filesToCopy.length === 0) {
    log('warn', 'No files to copy');
    process.exit(1);
  }

  // Create destination directory
  ensureDir(DEST_DIR);

  // Copy files
  const stats = {
    total: filesToCopy.length,
    copied: 0,
    failed: 0,
    markdown: 0,
    other: 0,
  };

  console.log('\n' + 'Copying files:' + '\n');

  for (const file of filesToCopy) {
    const destPath = path.join(DEST_DIR, file.relativePath);
    const isMarkdown = file.filename.endsWith('.md');

    try {
      copyFile(file.fullPath, destPath, isMarkdown);

      if (isMarkdown) {
        log('success', `${file.relativePath} (markdown)`);
        stats.markdown++;
      } else {
        log('info', `${file.relativePath}`);
        stats.other++;
      }

      stats.copied++;
    } catch (error) {
      log('error', `${file.relativePath} - ${error.message}`);
      stats.failed++;
    }
  }

  // Clean up: remove files in destination that are no longer in source
  const destFiles = getFilesRecursive(DEST_DIR);
  const sourceRelativePaths = new Set(
    filesToCopy.map((f) => path.normalize(f.relativePath))
  );

  let cleanedCount = 0;
  for (const file of destFiles) {
    if (!sourceRelativePaths.has(path.normalize(file.relativePath))) {
      try {
        if (!DRY_RUN) {
          fs.unlinkSync(file.fullPath);
        }
        log('warn', `Removed: ${file.relativePath} (no longer in source)`);
        cleanedCount++;
      } catch (error) {
        log('error', `Failed to remove: ${file.relativePath}`);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  log('info', `${colors.bold}SYNC RESULTS${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Total files:       ${stats.total}`);
  console.log(`${colors.green}Copied:${colors.reset}           ${stats.copied}`);
  console.log(`  - Markdown:      ${stats.markdown}`);
  console.log(`  - Other:         ${stats.other}`);
  console.log(`${colors.red}Failed:${colors.reset}           ${stats.failed}`);
  console.log(`${colors.yellow}Cleaned up:${colors.reset}      ${cleanedCount}`);

  if (stats.failed > 0) {
    log('error', 'Sync completed with errors');
    process.exit(1);
  }

  if (DRY_RUN) {
    log('info', 'DRY RUN - no files were actually copied');
    log('info', 'Run with DRY_RUN=false to apply changes');
  } else {
    log('success', 'Sync completed successfully');
    log('info', `Destination ready for Quartz build: ${DEST_DIR}`);
  }

  console.log('\n' + '='.repeat(60));
  process.exit(stats.failed > 0 ? 1 : 0);
}

main();
