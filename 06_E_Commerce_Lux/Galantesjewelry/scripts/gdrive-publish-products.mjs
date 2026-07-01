#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { createOdooClient } from '../src/config/odooClient.js';
import {
  buildProductPayload,
  buildScanReport,
  normalizeManifest,
  parseDriveFolderId,
  slugify,
} from '../Galantesjewelry/lib/products/gdrive-product-import.js';

dotenv.config();

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function parseArgs(argv) {
  const options = {
    folder: process.env.GALANTES_DRIVE_FOLDER_ID || '',
    manifest: '',
    out: path.join(ARTIFACTS_DIR, 'gdrive-product-scan.json'),
    mode: 'scan',
    dryRun: true,
    forceGenericLabels: false,
    enhanceCommand: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--folder' && argv[index + 1]) {
      options.folder = argv[index + 1];
      index += 1;
    } else if (current === '--manifest' && argv[index + 1]) {
      options.manifest = path.resolve(argv[index + 1]);
      index += 1;
    } else if (current === '--out' && argv[index + 1]) {
      options.out = path.resolve(argv[index + 1]);
      index += 1;
    } else if (current === '--mode' && argv[index + 1]) {
      options.mode = argv[index + 1];
      index += 1;
    } else if (current === '--publish') {
      options.mode = 'publish';
      options.dryRun = false;
    } else if (current === '--dry-run') {
      options.dryRun = true;
    } else if (current === '--accept-generic-labels') {
      options.forceGenericLabels = true;
    } else if (current === '--enhance-command' && argv[index + 1]) {
      options.enhanceCommand = argv[index + 1];
      index += 1;
    } else if (current === '-h' || current === '--help') {
      console.log([
        'Usage:',
        '  node scripts/gdrive-publish-products.mjs --folder <drive-folder> [--out <scan.json>]',
        '  node scripts/gdrive-publish-products.mjs --mode publish --manifest <manifest.json> [--dry-run]',
        '',
        'Environment:',
        '  GOOGLE_APPLICATION_CREDENTIALS  service account JSON for Drive readonly access',
        '  ODOO_BASE_URL / ODOO_DATABASE / ODOO_PASSWORD or ODOO_API_KEY',
        '  GALANTES_DRIVE_FOLDER_ID       default folder id when --folder is omitted',
      ].join('\n'));
      process.exit(0);
    }
  }

  return options;
}

async function ensureArtifactsDir() {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
}

function createDriveClient() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentials) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required for Drive scanning.');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentials,
    scopes: [DRIVE_SCOPE],
  });

  return google.drive({ version: 'v3', auth });
}

async function fetchChildren(drive, folderId) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,parents,modifiedTime,webViewLink,size)',
    pageSize: 1000,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'allDrives',
  });

  return response.data.files || [];
}

async function scanFolderRecursive(drive, folderId, pathParts = [], accumulator = []) {
  const children = await fetchChildren(drive, folderId);

  for (const child of children) {
    const nextPathParts = [...pathParts];
    if (child.mimeType === 'application/vnd.google-apps.folder') {
      nextPathParts.push(child.name || 'Untitled Folder');
      await scanFolderRecursive(drive, child.id, nextPathParts, accumulator);
      continue;
    }

    accumulator.push({
      id: child.id,
      name: child.name || child.id,
      mimeType: child.mimeType || 'application/octet-stream',
      parents: child.parents || [],
      modifiedTime: child.modifiedTime || null,
      webViewLink: child.webViewLink || null,
      size: child.size ? Number(child.size) : null,
      pathParts,
    });
  }

  return accumulator;
}

async function downloadDriveFile(drive, fileId) {
  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    { responseType: 'arraybuffer' },
  );

  return Buffer.from(response.data);
}

async function maybeEnhanceImage(buffer, fileName, enhanceCommand) {
  if (!enhanceCommand) {
    return buffer;
  }

  const os = await import('os');
  const { spawn } = await import('child_process');
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'galantes-drive-'));
  const inputPath = path.join(tmpDir, fileName);
  const outputPath = path.join(tmpDir, `enhanced-${fileName}`);

  await fs.writeFile(inputPath, buffer);

  await new Promise((resolve, reject) => {
    const child = spawn(enhanceCommand, [inputPath, outputPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Enhancement command exited with code ${code}`));
      }
    });
  });

  return fs.readFile(outputPath);
}

function normalizePublishedManifest(manifest) {
  const normalized = normalizeManifest(manifest);
  return {
    ...normalized,
    products: normalized.products.map((product, index) => ({
      ...product,
      slug: product.slug || slugify(product.name || `drive-product-${index + 1}`),
    })),
  };
}

async function runScan(options) {
  const folderId = parseDriveFolderId(options.folder);
  if (!folderId) {
    throw new Error('A Google Drive folder id or URL is required.');
  }

  const drive = createDriveClient();
  const files = await scanFolderRecursive(drive, folderId);
  const report = buildScanReport(new Date().toISOString(), folderId, files);

  await ensureArtifactsDir();
  await fs.writeFile(options.out, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({
    ok: true,
    mode: 'scan',
    folderId,
    out: options.out,
    totalClusters: report.totalClusters,
    totalImages: report.totalImages,
  }, null, 2));
}

async function resolveCategoryId(odoo, categoryName) {
  const normalizedName = String(categoryName || '').trim();
  if (!normalizedName || normalizedName.toLowerCase() === 'other') {
    return null;
  }

  const categories = await odoo.searchRead('product.category', {
    domain: [['name', '=', normalizedName]],
    fields: ['id'],
    limit: 1,
  });

  if (categories?.[0]?.id) {
    return categories[0].id;
  }

  return null;
}

async function resolveExistingProductId(odoo, slug) {
  const products = await odoo.searchRead('product.template', {
    domain: [['slug', '=', slug]],
    fields: ['id'],
    limit: 1,
  });

  return products?.[0]?.id || null;
}

async function publishProducts(options) {
  if (!options.manifest) {
    throw new Error('--manifest is required when publishing.');
  }

  const rawManifest = JSON.parse(await fs.readFile(options.manifest, 'utf-8'));
  const manifest = normalizePublishedManifest(rawManifest);
  const odoo = createOdooClient();
  const drive = options.folder ? createDriveClient() : null;

  const summary = {
    mode: 'publish',
    manifest: options.manifest,
    dryRun: options.dryRun,
    created: [],
    updated: [],
    skipped: [],
  };

  for (const product of manifest.products) {
    if (!options.forceGenericLabels && product.sourceType === 'timestamp-bucket' && !product.name) {
      summary.skipped.push({ slug: product.slug, reason: 'generic_label_requires_review' });
      continue;
    }

    const existingId = await resolveExistingProductId(odoo, product.slug);
    const categoryId = await resolveCategoryId(odoo, product.category);
    const primary = product.files?.[0];

    let imageBuffer = null;
    if (primary && drive) {
      imageBuffer = await downloadDriveFile(drive, primary.id);
      imageBuffer = await maybeEnhanceImage(imageBuffer, primary.name || `${product.slug}.jpg`, options.enhanceCommand);
    }

    const payload = buildProductPayload(
      {
        ...product,
        available_on_website: true,
        is_featured: Boolean(product.isFeatured),
      },
      imageBuffer ? imageBuffer.toString('base64') : undefined,
    );

    if (categoryId) {
      payload.categ_id = categoryId;
    }

    if (options.dryRun) {
      summary.skipped.push({
        slug: product.slug,
        reason: existingId ? 'would_update' : 'would_create',
        name: product.name,
        images: product.files?.length || 0,
      });
      continue;
    }

    if (existingId) {
      await odoo.call('product.template', 'write', {
        ids: [existingId],
        vals: payload,
      });
      summary.updated.push({ slug: product.slug, id: existingId });
    } else {
      const createdId = await odoo.create('product.template', payload);
      summary.created.push({ slug: product.slug, id: createdId });
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await ensureArtifactsDir();
  const summaryPath = path.join(ARTIFACTS_DIR, `gdrive-publish-${timestamp}.json`);
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

  console.log(JSON.stringify({
    ok: true,
    summaryPath,
    ...summary,
  }, null, 2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.mode === 'scan') {
    await runScan(options);
    return;
  }

  if (options.mode === 'publish') {
    await publishProducts(options);
    return;
  }

  throw new Error(`Unknown mode: ${options.mode}`);
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exit(1);
});
