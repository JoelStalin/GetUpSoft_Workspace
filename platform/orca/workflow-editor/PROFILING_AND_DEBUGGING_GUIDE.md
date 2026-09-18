# Phase 11: Profiling & Debugging Guide

**Purpose:** Comprehensive guide for performance profiling and debugging Phase 11 features  
**Audience:** Developers, Performance Engineers  
**Tools:** Chrome DevTools, Lighthouse, webpack-bundle-analyzer, Node.js Inspector  
**Status:** READY FOR USE

---

## Part 1: Browser Profiling (Chrome DevTools)

### 1.1 Performance Profiling

**Goal:** Identify bottlenecks in load time and rendering

**Steps:**

1. **Open DevTools** (F12 → Performance tab)
2. **Clear browser cache** (DevTools → Settings → Network → Disable cache)
3. **Set throttling** (DevTools → Network tab → Throttle to "Fast 3G")
4. **Record performance:**
   ```
   Click "Record" → Wait 5 seconds → Perform action (mode switch) → Stop
   ```

**What to Look For:**

- **Red lines:** Long JavaScript execution (>50ms is bad)
- **Yellow areas:** CSS recalculation/layout thrashing
- **Blue areas:** Rendering/painting
- **Green areas:** Idle time (good)

**Example: Mode Switch Analysis**

```
Recorded: Mode switch from Workflow → Web Design

Timeline breakdown:
- JavaScript: 120ms (parse + execute)
  → Look for: setState, useEffect, component rendering
- Rendering: 80ms (layout + paint)
  → Look for: Forced reflows, large paint areas
- Idle: 200ms (browser idle)
- Total: 400ms (GOOD - target <500ms)

Issues to investigate:
- Large DOM nodes being added?
- useEffect running multiple times?
- CSS classes causing reflows?
```

### 1.2 Memory Profiling

**Goal:** Detect memory leaks and excessive allocations

**Steps:**

1. **Open DevTools** (F12 → Memory tab)
2. **Take heap snapshot:** Click "Take snapshot" → Save as baseline
3. **Perform action:** Switch modes 10 times, interact with features
4. **Take second snapshot:** Compare to baseline
5. **Check difference:** Heap size should return to baseline (+/- 10%)

**Interpreting Results:**

```
Baseline heap: 45MB
After 10 mode switches: 48MB
Leaked: ~3MB = CONCERN (investigate)

Baseline heap: 45MB
After interactions: 45.5MB
Leaked: ~0.5MB = OK (normal variance)
```

**Common Leaks:**

```javascript
// ❌ LEAK: Event listeners not removed
useEffect(() => {
  window.addEventListener('click', handler);
  // Missing cleanup!
}, []);

// ✅ FIX: Remove listeners
useEffect(() => {
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, []);
```

### 1.3 CPU Profiling

**Goal:** Find CPU-intensive operations

**Steps:**

1. **DevTools → Performance tab**
2. **Enable "CPU throttling":** 4x slowdown
3. **Record while performing heavy operations**
4. **Look for:** Long JavaScript tasks (>50ms)

**What to Fix:**

```
If you see long JavaScript blocks:
- Break into smaller chunks using requestAnimationFrame
- Move expensive calculations to Web Workers
- Use debounce/throttle for high-frequency operations
```

---

## Part 2: Lighthouse Performance Audit

### 2.1 Running Lighthouse

**In Chrome DevTools:**

```
F12 → Lighthouse → Generate report
- Device: Mobile (tests on slow network)
- Throttling: Simulated 4G, 4x CPU slowdown
- Clear storage: Yes (fresh load)
```

**Key Metrics:**

| Metric | Phase 10 | Phase 11 Target |
|--------|----------|-----------------|
| FCP (First Contentful Paint) | 1.5s | <1.0s |
| LCP (Largest Contentful Paint) | 2.8s | <1.8s |
| TTI (Time to Interactive) | 3.2s | <2.0s |
| Cumulative Layout Shift (CLS) | 0.05 | <0.05 |
| Lighthouse Score | 75 | >85 |

### 2.2 Interpreting Results

```
If FCP is high (>1.5s):
→ Bundle size too large? (Check bundle analyzer)
→ Blocking CSS/JS? (Check waterfall)
→ Slow server? (Check backend)

If LCP is high (>3s):
→ Large image? (Lazy load or compress)
→ JavaScript blocking? (Defer or async)
→ Font loading? (Use font-display: swap)

If TTI is high (>3s):
→ JavaScript not minified?
→ Too many DOM nodes?
→ JavaScript parsing too slow?
```

---

## Part 3: Bundle Analysis

### 3.1 Webpack Bundle Analyzer

**Generate report:**

```bash
npm run build -- --report
# Opens: dist/report.html
```

**Analyze:**

1. **Look for large modules** (>50KB)
2. **Check for duplicates** (same library twice?)
3. **Verify code-splitting** (chunks properly split?)
4. **Remove unused code** (unused-exports warning)

**Example Report Analysis:**

```
Bundle breakdown:
├─ react: 40KB ✅ (expected)
├─ react-dom: 120KB ✅ (expected)
├─ webpack-runtime: 15KB ✅
├─ app-bundle: 450KB ⚠️ (too large? optimize)
│  ├─ modes/WebDesign: 150KB (could be lazy-loaded)
│  ├─ modes/Mobile: 140KB (could be lazy-loaded)
│  └─ services: 160KB ✅
└─ vendor: 90KB ✅

Issues:
1. WebDesign mode 150KB → Implement lazy loading
2. Mobile mode 140KB → Move to separate chunk
3. Result: Initial 269KB → ~180KB (save 89KB!)
```

### 3.2 Dependency Analysis

```bash
# Check unused dependencies
npm ls

# Check duplicate installations
npm dedupe

# Check security vulnerabilities
npm audit

# Check package sizes
npm ls --depth=0 | grep -E "package-size"
```

---

## Part 4: Network Profiling

### 4.1 Network Waterfall Analysis

**Steps:**

1. **DevTools → Network tab**
2. **Hard refresh** (Ctrl+Shift+R)
3. **Analyze waterfall** (scroll right to see request timeline)

**Timeline Interpretation:**

```
Request timeline:
[DNS lookup: 50ms] [TCP: 100ms] [TLS: 50ms] [Request: 10ms] [Waiting: 200ms] [Download: 50ms]

Total: 460ms

Optimization opportunities:
- DNS: Reduce domains (fewer lookups)
- TCP: Use HTTP/2 or HTTP/3
- TLS: Use session resumption
- Waiting: Backend optimization (caching, database, etc)
- Download: Gzip compression, minification
```

### 4.2 Critical Path Analysis

**Identify critical resources** (that block page rendering):

```
Critical path:
1. index.html (1ms, blocks everything)
2. main.css (60ms, blocks rendering)
3. main.js (180ms, blocks interactivity)
4. fonts (100ms, blocks text rendering)

Non-critical:
- images (can load after paint)
- analytics (async)
- third-party (async iframe)

Optimization:
- Preload: main.css, fonts
- Defer: non-critical-features.js
- Async: analytics, ads
```

---

## Part 5: Node.js Profiling (Backend/Service Worker)

### 5.1 CPU Profiling

**Using Node Inspector:**

```bash
# Start with inspect flag
node --inspect dist/service-worker.js

# In Chrome: chrome://inspect
# Click "inspect" to open DevTools
```

**Profiling in DevTools:**

1. **Profiler tab → Start profiling**
2. **Run operations** (generate recommendations, ML processing)
3. **Stop profiling**
4. **Analyze:** Which functions took the most time?

### 5.2 Heap Snapshots

```bash
# Take snapshot during execution
node --inspect dist/ml-optimizer.js
# Then in DevTools: Memory tab → Take snapshot
```

---

## Part 6: Phase 11 Debugging Scenarios

### Scenario 1: Mode Switch Slow

**Diagnosis:**

```
Symptom: Mode switch takes 2+ seconds

Steps:
1. Open DevTools Performance tab
2. Record mode switch
3. Look for long JavaScript blocks
4. Find the culprit:
   - App.tsx rendering?
   - Component mounting?
   - Data loading?
   - CSS animation?

Solution examples:
- Lazy load mode components (React.lazy)
- Memoize expensive computations (useMemo)
- Optimize CSS animations (will-change)
- Preload mode chunks on hover
```

### Scenario 2: Bundle Size Increasing

**Diagnosis:**

```
Symptom: Bundle size 250KB → 280KB (+12%)

Steps:
1. npm run build -- --report
2. Compare bundle visually
3. Find new/larger modules
4. Investigate:
   - New dependency added?
   - Old dependency not removed?
   - Component not code-split?

Solution:
npm ls | grep <suspected-package>
npm uninstall <unused-package>
OR
Move to lazy loading: React.lazy(() => import('./Heavy'))
```

### Scenario 3: ML Pipeline Slow

**Diagnosis:**

```
Symptom: ML calculations taking 500ms (target 300ms)

Steps:
1. Add console.time() around each algorithm:
   console.time('EMA');
   const ema = calculateEMA(data);
   console.timeEnd('EMA');

2. Identify slow algorithm:
   - EMA: 1ms ✅
   - Anomaly detection: 5ms ✅
   - Forecasting: 200ms ⚠️ (the culprit!)

Solution:
- Reduce data set size (use last 100 points not 1000)
- Move to Web Worker (off main thread)
- Use typed arrays (Float32Array)
- Implement caching
```

### Scenario 4: Memory Leak in Mode Switching

**Diagnosis:**

```
Symptom: After switching modes 20 times, memory grows from 50MB → 80MB

Steps:
1. Memory tab → Take baseline snapshot
2. Switch modes 10 times
3. Take snapshot → Compare
4. Check diff → Find growing objects

Look for:
- Event listeners (not removed?)
- Timers (not cleared?)
- DOM references (detached nodes?)
- Closures (holding references?)

Solution:
useEffect(() => {
  const timer = setTimeout(...);
  return () => clearTimeout(timer); // ← Cleanup!
}, []);
```

---

## Part 7: Common Performance Issues & Fixes

### Issue: Long JavaScript Tasks

```javascript
// ❌ BAD: Blocks rendering for 100ms
function processData() {
  for (let i = 0; i < 1000000; i++) {
    heavyCalculation(i);
  }
}

// ✅ GOOD: Break into chunks
function processDataChunked() {
  let index = 0;
  function processChunk() {
    const end = Math.min(index + 100, 1000000);
    for (let i = index; i < end; i++) {
      heavyCalculation(i);
    }
    index = end;
    if (index < 1000000) {
      requestAnimationFrame(processChunk);
    }
  }
  processChunk();
}
```

### Issue: Forced Reflows

```javascript
// ❌ BAD: Causes 3 reflows (read-write-read-write-read)
element.style.width = '100px';
console.log(element.offsetWidth); // Forces reflow #1
element.style.height = '100px';
console.log(element.offsetHeight); // Forces reflow #2

// ✅ GOOD: Batch reads, then writes
const width = element.offsetWidth; // Read #1
const height = element.offsetHeight; // Read #2
element.style.width = '100px';
element.style.height = '100px';
```

### Issue: Memory Retention

```javascript
// ❌ BAD: Global reference persists
let largeData = [];
function load() {
  largeData = new Array(1000000).fill(0);
}
// Memory never released!

// ✅ GOOD: Scoped reference
function load() {
  const largeData = new Array(1000000).fill(0);
  // Use largeData...
  // Memory released when function returns
}
```

---

## Part 8: Debugging Tools Checklist

| Tool | Purpose | Command/Access |
|------|---------|-----------------|
| Chrome DevTools | Frontend profiling | F12 |
| Lighthouse | Performance audit | F12 → Lighthouse |
| webpack-bundle-analyzer | Bundle analysis | npm run build -- --report |
| Node Inspector | Backend profiling | node --inspect |
| VS Code Debugger | Code debugging | Debug → Start Debugging |
| Network Waterfall | Request analysis | F12 → Network |
| React DevTools | Component inspection | Browser extension |
| Redux DevTools | State inspection | Browser extension |

---

## Part 9: CI/CD Integration

### Continuous Performance Monitoring

```yaml
# .github/workflows/performance.yml
name: Performance Check

on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build -- --report
      - run: npm run lighthouse
      - run: npm run performance-test
      - uses: actions/upload-artifact@v3
        with:
          name: reports
          path: dist/report.html
```

---

## Quick Reference Commands

```bash
# Performance
npm run build -- --report         # Bundle analysis
npm run lighthouse                # Lighthouse audit
npm test -- --performance        # Performance tests

# Debugging
node --inspect dist/file.js       # Node inspector
npm run dev                       # Dev server with source maps

# Profiling
# F12 → Performance tab → Record
# F12 → Memory tab → Heap snapshots
# DevTools → Lighthouse

# Analysis
npm audit                         # Security & size
npm ls                           # Dependency tree
npm dedupe                       # Remove duplicates
```

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** Development Team  
**Reference:** PHASE_11_PERFORMANCE_BENCHMARKING.md
