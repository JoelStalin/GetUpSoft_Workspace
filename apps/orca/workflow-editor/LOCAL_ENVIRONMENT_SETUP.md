# Phase 11: Local Development Environment Setup

**Purpose:** Complete guide for developers to set up local environment for Phase 11 development  
**Audience:** Developers, QA Engineers  
**Duration:** 30-45 minutes  
**Status:** READY FOR USE

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 8.x | 9.x+ |
| RAM | 8GB | 16GB |
| Disk | 5GB free | 10GB free |
| OS | Any | macOS/Linux |

### Required Tools

- [ ] Git (latest)
- [ ] Node.js 18+ (`node --version`)
- [ ] npm 8+ (`npm --version`)
- [ ] VS Code (recommended)
- [ ] Docker (optional, for API simulation)
- [ ] Postman (optional, for API testing)

---

## Step 1: Repository Setup (5 minutes)

### 1.1 Clone Repository

```bash
cd ~/dev  # Your development directory
git clone https://github.com/JoelStalin/GetUpSoft_Workspace.git
cd GetUpSoft_Workspace/apps/orca/workflow-editor
```

### 1.2 Verify Branch

```bash
git status
# Should show: On branch main
git log --oneline -3
# Should show recent Phase 11 commits
```

### 1.3 Create Local Branch

```bash
git checkout -b feature/phase11-[your-feature]
# Example: feature/phase11-bundle-optimization
```

---

## Step 2: Dependencies Installation (10 minutes)

### 2.1 Install Dependencies

```bash
npm install
# Wait for completion (should take 2-3 minutes)
```

### 2.2 Verify Installation

```bash
npm ls
# Check no errors (warnings OK)

node --version
# Should be 18.x or higher

npm --version
# Should be 8.x or higher
```

### 2.3 Post-Install Verification

```bash
# TypeScript compilation check
npm run type-check
# Should show: "✓ No TypeScript errors"

# Linting check
npm run lint
# Should show: "✓ No linting errors"

# Build check
npm run build
# Should show: "✓ Build successful"
# Files in dist/: index.html, main.*.js, style.*.css
```

---

## Step 3: Development Server Setup (5 minutes)

### 3.1 Start Development Server

```bash
npm run dev
# Should show:
# ➜  local:   http://localhost:5173/
# ➜  press h to show help
```

### 3.2 Verify in Browser

```
Open: http://localhost:5173
Expected:
✅ Page loads without errors
✅ All UI elements visible
✅ Logo displays
✅ Toolbar functional
✅ F12 Console: 0 errors
```

### 3.3 Test Mode Switching

```
With dev server running:
1. Press "1" → Workflow mode
2. Press "2" → Web Design mode
3. Press "3" → Mobile Design mode
4. Press "4" → AI mode

Expected:
✅ Each mode loads in <1000ms
✅ No console errors
✅ UI remains responsive
```

---

## Step 4: Test Environment Setup (10 minutes)

### 4.1 Run Unit Tests

```bash
npm test
# Runs all tests: Phase 10 (117) + Phase 11 (73) = 190 total

# Or specific test suites:
npm test -- tests/phase11/step1.performance.test.ts  # Just Step 1
npm test -- tests/phase10/  # Just Phase 10 (regression check)
```

### 4.2 Verify Test Results

```
Expected:
✅ Phase 10: 117/117 passing
✅ Phase 11: 73/73 passing
✅ Total: 190/190 passing (100%)
✅ Execution: <30 seconds
```

### 4.3 Watch Mode (for development)

```bash
npm test -- --watch
# Runs tests in watch mode, re-runs on file changes
# Press 'q' to exit watch mode
```

---

## Step 5: VS Code Configuration (5 minutes - Optional)

### 5.1 Install Extensions

Recommended VS Code extensions:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- TypeScript Vue Plugin (Vue.volar)
- Thunder Client (rangav.vscode-thunder-client) - for API testing

### 5.2 Create Workspace Settings

**Create `.vscode/settings.json`:**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "typescriptreact"],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "files.watcherExclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 5.3 Create Launch Configuration

**Create `.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Node Debugger",
      "program": "${workspaceFolder}/dist/service-worker.js",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### 5.4 Debug Shortcuts

```
F5 - Start debugging
Ctrl+Shift+D - Open debug panel
F9 - Set breakpoint
F10 - Step over
F11 - Step into
Shift+F11 - Step out
```

---

## Step 6: Git Workflow for Phase 11 Development

### 6.1 Create Feature Branch

```bash
git checkout -b feature/phase11-bundle-optimization
# Branch naming: feature/phase11-[short-description]
```

### 6.2 Make Changes

```bash
# Edit files as needed
# Example: Implement lazy loading in src/App.tsx
```

### 6.3 Commit Changes

```bash
git add apps/orca/workflow-editor/src/App.tsx
git commit -m "feat: implement lazy-loading for mode components"
# Commit messages: feat:, fix:, docs:, etc.
```

### 6.4 Push and Create PR

```bash
git push origin feature/phase11-bundle-optimization

# Go to GitHub and create Pull Request
# Title: "Phase 11: Implement lazy-loading for mode components"
# Description: Include what changed, why, and testing done
```

---

## Step 7: Build & Bundle Analysis

### 7.1 Production Build

```bash
npm run build
# Creates: dist/ directory with optimized bundle
```

### 7.2 Bundle Analysis

```bash
npm run build -- --report
# Opens: dist/report.html in browser
# Shows: Module breakdown, sizes, tree-shaking effectiveness
```

### 7.3 Verify Bundle Size

```bash
du -sh dist/
# macOS/Linux: disk usage
# Should be ~400KB for Phase 11 optimization

ls -lah dist/ | grep main
# Check main.*.js size (should be <250KB gzip)
```

---

## Step 8: Performance Testing (Optional)

### 8.1 Run Lighthouse Locally

```bash
# Via Chrome DevTools:
# 1. npm run dev
# 2. Open http://localhost:5173
# 3. F12 → Lighthouse → Generate report

# Or via CLI:
npm install -g lighthouse
lighthouse http://localhost:5173 --output-path=report.html
```

### 8.2 Performance Benchmarks

```bash
npm test -- tests/phase11/step1.performance.test.ts
# Tests bundle size, load time, mode switching performance
```

---

## Step 9: Common Development Tasks

### Task: Running Specific Tests

```bash
# Single test file
npm test -- tests/phase11/step1.bundleSize.test.ts

# Multiple files
npm test -- tests/phase11/step1.*.test.ts

# Watch mode for one file
npm test -- tests/phase11/step1.bundleSize.test.ts --watch
```

### Task: Debugging a Test

```bash
# Add to your test:
it('should work', () => {
  debugger;  // ← Breakpoint
  // ... test code
});

# Then run in Node debugger:
node --inspect-brk ./node_modules/.bin/vitest tests/mytest.ts
# Open: chrome://inspect → click URL
```

### Task: Checking Code Quality

```bash
# TypeScript
npm run type-check

# Linting
npm run lint
npm run lint -- --fix  # Auto-fix issues

# Format code
npx prettier --write src/**/*.ts
```

### Task: Viewing Dependencies

```bash
# See dependency tree
npm ls

# See only top-level
npm ls --depth=0

# Find where a package is used
npm ls lodash

# Check for updates
npm outdated
```

---

## Step 10: Troubleshooting

### Issue: Dependencies Won't Install

```bash
# Solution 1: Clear cache
npm cache clean --force
npm install

# Solution 2: Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 3: Use npm ci (cleaner install)
npm ci
```

### Issue: TypeScript Errors

```bash
# Check all errors
npm run type-check

# Fix common issues
npm install --save-dev @types/[missing-package]
```

### Issue: Port 5173 Already in Use

```bash
# Kill existing process
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

### Issue: Test Failures

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run single test
npm test -- tests/phase11/step1.performance.test.ts --reporter=verbose

# Update snapshots (if needed)
npm test -- --update
```

### Issue: Build Errors

```bash
# Clear dist and rebuild
rm -rf dist
npm run build

# Check for missing types
npm run type-check

# Check for linting issues
npm run lint
```

---

## Step 11: Daily Development Workflow

### Morning Checklist

```bash
# 1. Update from remote
git fetch origin
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Run tests to verify nothing broke
npm test

# 4. Start dev server
npm run dev
```

### During Development

```bash
# Keep watching:
npm test -- --watch         # Terminal 1: Tests
npm run dev                 # Terminal 2: Dev server

# In VS Code:
# - Edit files
# - See tests run automatically
# - See page reload automatically
# - Check console for errors
```

### Before Commit

```bash
# 1. Run all tests
npm test

# 2. Check TypeScript
npm run type-check

# 3. Lint code
npm run lint -- --fix

# 4. Build and verify
npm run build

# 5. Commit with clear message
git add .
git commit -m "feat: ..."
```

---

## Step 12: Reference Documentation

- **Phase 11 Overview:** PHASE_11_ROADMAP.md
- **Implementation Plan:** PHASE_11_IMPLEMENTATION_GUIDE.md
- **Performance Targets:** PHASE_11_PERFORMANCE_BENCHMARKING.md
- **Code Standards:** PHASE_11_CODE_REVIEW_STANDARDS.md
- **Profiling Guide:** PROFILING_AND_DEBUGGING_GUIDE.md
- **Monitoring Setup:** MONITORING_DASHBOARD_SETUP.md

---

## Quick Reference Commands

```bash
# Setup
npm install                          # Install dependencies
npm run type-check                   # Check TypeScript

# Development
npm run dev                          # Start dev server
npm test                            # Run all tests
npm test -- --watch                # Watch mode

# Build & Verify
npm run build                       # Production build
npm run build -- --report           # Bundle analysis
npm run lint                        # Lint code
npm run lint -- --fix              # Auto-fix linting

# Debugging
F12                                # Chrome DevTools
Ctrl+Shift+I                       # Open inspector
npm test -- --reporter=verbose     # Verbose test output
```

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** Development Team  
**Next Step:** Read PHASE_11_STEP1_PLAN.md for implementation details
