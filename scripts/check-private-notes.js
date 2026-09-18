#!/usr/bin/env node

/**
 * Check for private content in Obsidian public vault
 *
 * Prevents accidental publication of sensitive information
 * Exit code: 0 = safe, 1 = private content found
 *
 * Usage:
 *   node scripts/check-private-notes.js
 *   npm run notes:check
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PUBLIC_VAULT_PATH = process.env.PUBLIC_VAULT_PATH || 'obsidian/vault/public';
const PRIVATE_KEYWORDS = [
  'PRIVATE',
  'SECRET',
  'TOKEN=',
  'API_KEY=',
  'API_KEY:',
  'PASSWORD=',
  'PASSWORD:',
  'COUCHDB_PASSWORD',
  'ADMIN_PASSWORD',
  'PRIVATE:',
  'internal:',
  'draft:',
  'publish: false',
  'draft: true',
  'secret:',
];

const BLOCKED_FILE_PATTERNS = [
  /\.env/i,
  /credentials/i,
  /secret/i,
  /password/i,
  /token/i,
  /private\//i,
];

const BLOCKED_FOLDER_PATHS = [
  'private',
  'secrets',
  'drafts',
  '.env',
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(level, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    error: `${colors.red}[ERROR]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    info: `${colors.cyan}[INFO]${colors.reset}`,
    success: `${colors.green}[✓]${colors.reset}`,
  };
  console.log(`${prefix[level]} [${timestamp}] ${message}`);
}

function getFilesRecursive(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(PUBLIC_VAULT_PATH, fullPath);

    if (entry.isDirectory()) {
      // Skip .obsidian and other system directories
      if (!entry.name.startsWith('.')) {
        files.push(...getFilesRecursive(fullPath));
      }
    } else {
      files.push({
        fullPath,
        relativePath,
        filename: entry.name,
      });
    }
  }

  return files;
}

function checkPathSafety(relativePath) {
  for (const blocked of BLOCKED_FOLDER_PATHS) {
    if (relativePath.toLowerCase().includes(blocked)) {
      return { safe: false, reason: `Path contains blocked folder: ${blocked}` };
    }
  }
  return { safe: true };
}

function checkFilenameSafety(filename) {
  for (const pattern of BLOCKED_FILE_PATTERNS) {
    if (pattern.test(filename)) {
      return { safe: false, reason: `Filename matches blocked pattern: ${pattern}` };
    }
  }
  return { safe: true };
}

function checkContentSafety(content, filename) {
  // Skip binary files
  if (filename.match(/\.(jpg|jpeg|png|gif|pdf|zip|tar|gz|exe|bin)$/i)) {
    return { safe: true };
  }

  const issues = [];

  for (const keyword of PRIVATE_KEYWORDS) {
    // Case-insensitive search
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (regex.test(line)) {
        // Skip common false positives
        if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
          return; // Comment line, might be documentation
        }

        issues.push({
          keyword,
          line: index + 1,
          content: line.trim().substring(0, 60) + '...',
        });
      }
    });
  }

  if (issues.length > 0) {
    return {
      safe: false,
      reason: 'Contains private keywords',
      issues,
    };
  }

  return { safe: true };
}

function main() {
  log('info', `Checking public vault: ${PUBLIC_VAULT_PATH}`);

  if (!fs.existsSync(PUBLIC_VAULT_PATH)) {
    log('error', `Public vault path not found: ${PUBLIC_VAULT_PATH}`);
    process.exit(1);
  }

  const files = getFilesRecursive(PUBLIC_VAULT_PATH);
  log('info', `Found ${files.length} files`);

  let privateContentFound = false;
  const results = {
    total: files.length,
    scanned: 0,
    safe: 0,
    unsafe: 0,
    issues: [],
  };

  for (const file of files) {
    // Check path safety
    const pathCheck = checkPathSafety(file.relativePath);
    if (!pathCheck.safe) {
      log('warn', `UNSAFE PATH: ${file.relativePath} (${pathCheck.reason})`);
      results.unsafe++;
      results.issues.push({ file: file.relativePath, reason: pathCheck.reason });
      privateContentFound = true;
      continue;
    }

    // Check filename safety
    const filenameCheck = checkFilenameSafety(file.filename);
    if (!filenameCheck.safe) {
      log('warn', `UNSAFE FILENAME: ${file.relativePath} (${filenameCheck.reason})`);
      results.unsafe++;
      results.issues.push({ file: file.relativePath, reason: filenameCheck.reason });
      privateContentFound = true;
      continue;
    }

    // Check content safety
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const contentCheck = checkContentSafety(content, file.filename);

      if (!contentCheck.safe) {
        log('warn', `UNSAFE CONTENT: ${file.relativePath}`);
        if (contentCheck.issues) {
          contentCheck.issues.forEach((issue) => {
            log('warn', `  → Line ${issue.line}: "${issue.keyword}" detected`);
            log('warn', `     ${issue.content}`);
          });
        }
        results.unsafe++;
        results.issues.push({
          file: file.relativePath,
          reason: contentCheck.reason,
          details: contentCheck.issues,
        });
        privateContentFound = true;
      } else {
        results.safe++;
      }
      results.scanned++;
    } catch (error) {
      if (error.code !== 'EISDIR') {
        log('error', `Failed to read file: ${file.relativePath} (${error.message})`);
        results.unsafe++;
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  log('info', `${colors.bold}SCAN RESULTS${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Total files:    ${results.total}`);
  console.log(`Scanned:        ${results.scanned}`);
  console.log(`${colors.green}Safe:${colors.reset}            ${results.safe}`);
  console.log(`${colors.red}Unsafe:${colors.reset}          ${results.unsafe}`);

  if (privateContentFound) {
    console.log('\n' + '='.repeat(60));
    log('error', `${colors.bold}PRIVATE CONTENT DETECTED${colors.reset}`);
    console.log('='.repeat(60));
    log('error', 'Cannot publish! Remove private content before publishing:');
    console.log('\nIssues found:');
    results.issues.slice(0, 10).forEach((issue) => {
      console.log(`\n  📄 ${issue.file}`);
      console.log(`     Reason: ${issue.reason}`);
      if (issue.details) {
        issue.details.forEach((detail) => {
          console.log(`     Line ${detail.line}: ${detail.keyword}`);
        });
      }
    });

    if (results.issues.length > 10) {
      console.log(`\n  ... and ${results.issues.length - 10} more`);
    }

    console.log('\n' + colors.red + 'FIX:' + colors.reset);
    console.log('  1. Review flagged files');
    console.log('  2. Move private content to obsidian/vault/private/');
    console.log('  3. Or mark files as "publish: false"');
    console.log('  4. Re-run: npm run notes:check');
    process.exit(1);
  } else {
    console.log('\n' + '='.repeat(60));
    log('success', `${colors.bold}ALL CLEAR - SAFE TO PUBLISH${colors.reset}`);
    console.log('='.repeat(60));
    log('success', 'No private content detected in public vault');
    log('info', 'Ready to run: npm run notes:build');
    process.exit(0);
  }
}

// Run
main();
