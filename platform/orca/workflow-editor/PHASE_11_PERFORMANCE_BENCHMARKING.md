# Phase 11: Performance Benchmarking Guide

**Purpose:** Measure and track performance improvements across Phase 11  
**Target Audience:** Developers, QA, DevOps  
**Frequency:** Daily during development, weekly in production  
**Baseline:** Phase 10 metrics

---

## Baseline Metrics (Phase 10)

### Bundle Size
```
Initial bundle: 269KB gzip, 901KB uncompressed
Mode components (lazy-loaded): Not yet split
Service Worker: Not implemented
Total: 901KB
```

### Load Performance
```
Lighthouse Score: ~75 (Good)
First Contentful Paint (FCP): ~1.5s
Largest Contentful Paint (LCP): ~2.8s
Time to Interactive (TTI): ~3.2s
Cumulative Layout Shift (CLS): 0.05
Total Blocking Time (TBT): ~150ms
```

### Mode Switching
```
Average mode switch time: ~1000ms (1.0s)
Max mode switch time: ~1200ms
Range: 800ms - 1200ms
```

### ML Performance
```
EMA calculation: <1ms
Anomaly detection: <10ms
Recommendation scoring: 50-200ms
Total ML pipeline: <300ms
```

### API Response Times
```
Analytics API: <200ms p50, <500ms p95
Cost optimization API: <100ms p50, <300ms p95
User preferences API: <50ms p50, <150ms p95
Overall avg: ~150ms
```

---

## Phase 11 Performance Targets

### Bundle Size Targets

| Component | Phase 10 | Target | Reduction |
|-----------|----------|--------|-----------|
| Initial bundle | 269KB gzip | **<200KB** | 25% |
| Web Design mode | N/A | <150KB | N/A |
| Mobile Design mode | N/A | <150KB | N/A |
| AI mode | N/A | <150KB | N/A |
| Service Worker | N/A | <50KB | N/A |
| **Total uncompressed** | 901KB | **<400KB** | 55% |

### Load Performance Targets

| Metric | Phase 10 | Target | Improvement |
|--------|----------|--------|-------------|
| FCP | ~1.5s | **<1.0s** | 33% faster |
| LCP | ~2.8s | **<1.8s** | 35% faster |
| TTI | ~3.2s | **<2.0s** | 37% faster |
| Lighthouse | 75 | **>85** | +10 points |
| CLS | 0.05 | **<0.05** | Maintain |

### Mode Switching Targets

| Metric | Phase 10 | Target | Improvement |
|--------|----------|--------|-------------|
| Average | ~1000ms | **<500ms** | 50% faster |
| Max | ~1200ms | **<700ms** | 42% faster |
| P95 | ~1100ms | **<550ms** | 50% faster |

### ML Performance Targets

| Component | Phase 10 | Target | Notes |
|-----------|----------|--------|-------|
| EMA calculation | <1ms | **<1ms** | Maintain |
| Anomaly detection | <10ms | **<20ms** | +200% capacity |
| Time-series forecasting | N/A | **<100ms** | New feature |
| Recommendation scoring | 50-200ms | **<100ms** | 50% faster |
| Total pipeline | <300ms | **<300ms** | Maintain |

---

## Measurement Procedures

### 1. Bundle Size Analysis

**Using webpack-bundle-analyzer:**

```bash
# Build with analysis
npm run build -- --report

# Generates: dist/report.html
# Open in browser to inspect module sizes

# Key metrics to track:
# - Initial bundle size (gzipped)
# - Code splitting chunk sizes
# - Library sizes (React, Vitest, etc.)
# - Unused code detection
```

**Script for automated measurement:**

```bash
# scripts/measure-bundle-size.js
const gzipSize = require('gzip-size');
const fs = require('fs');

const bundleFile = 'dist/main.*.js';
const gzipped = gzipSize.fileSync(bundleFile);
const original = fs.statSync(bundleFile).size;

console.log(`Bundle: ${original / 1024}KB → ${gzipped / 1024}KB gzip`);
```

**Daily tracking:**

```bash
# Add to CI/CD pipeline
npm run build && npm run measure-bundle
```

### 2. Load Performance Measurement

**Using Lighthouse in Chrome DevTools:**

```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Desktop" or "Mobile"
4. Check "Throttling" (4G, 4x CPU)
5. Click "Analyze page load"
6. Wait ~1-2 minutes
7. Review scores and metrics
```

**Key metrics to record:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Lighthouse Score

**For consistent baseline, use:**
```bash
npm install -D lighthouse
npm run lighthouse -- --output-path=./reports/lighthouse.json
```

**WebPageTest (production use):**

```bash
# For production monitoring
curl -X POST https://www.webpagetest.org/runtest.php \
  -d "url=https://staging-orca.getupsoft.com&f=json"
```

### 3. Mode Switching Performance

**Manual measurement using DevTools:**

```
1. Open page in browser (F12 → Performance tab)
2. Press "Record" button
3. Press keyboard shortcut to switch mode (1-4)
4. Press "Stop" recording
5. Analyze timeline:
   - Look for FPS drops
   - Check JavaScript execution time
   - Verify CSS rendering
   - Measure total duration
```

**Automated measurement script:**

```javascript
// Measure mode switching time
const measureModeSwitch = async (targetMode) => {
  const start = performance.now();
  
  // Simulate mode switch
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: targetMode })
  );
  
  // Wait for mode to load
  await new Promise(r => setTimeout(r, 1500));
  
  const end = performance.now();
  console.log(`Mode switch: ${end - start}ms`);
};

// Run measurement
for (let i = 1; i <= 4; i++) {
  await measureModeSwitch(i);
}
```

### 4. ML Algorithm Performance

**Benchmark script:**

```typescript
import { MLOptimizer } from './services/mlOptimizer';

const benchmark = () => {
  const optimizer = new MLOptimizer();
  
  // Test data
  const costData = Array.from({ length: 100 }, (_, i) => ({
    timestamp: Date.now() + i * 60000,
    cost: Math.random() * 10
  }));
  
  // EMA calculation
  console.time('EMA');
  optimizer.calculateEMA(costData, 0.2);
  console.timeEnd('EMA');
  
  // Anomaly detection
  console.time('Anomaly Detection');
  optimizer.detectAnomalies(costData, 2.5);
  console.timeEnd('Anomaly Detection');
  
  // Forecasting
  console.time('Forecasting');
  optimizer.forecast(costData, 7);
  console.timeEnd('Forecasting');
  
  // Recommendation scoring
  console.time('Recommendation Scoring');
  optimizer.scoreRecommendation(costData);
  console.timeEnd('Recommendation Scoring');
};

benchmark();
```

### 5. API Response Times

**Using Network tab in DevTools:**

```
1. Open page (F12 → Network tab)
2. Clear existing requests
3. Interact with app (trigger API calls)
4. Review each request:
   - Time column shows total duration
   - Check "Response time" in request details
   - Note "Latency" (TTFB) vs "Download"
```

**For automated monitoring:**

```bash
npm install -D api-insights

# Wrap API calls for monitoring
import { monitorAPI } from 'api-insights';

const response = await monitorAPI(
  () => fetch('/api/analytics/stats'),
  { timeout: 500, threshold: 1000 }
);
```

---

## Performance Dashboard

### Daily Check Template

```markdown
## Phase 11 Performance Report - [Date]

**Bundle Size:**
- Initial: XXXkb (gzip)
- Reduction: -XXkb (-XX%)
- Target: <200kb ✅/❌

**Load Performance (Lighthouse):**
- FCP: XXms (target <1000ms) ✅/❌
- LCP: XXms (target <1800ms) ✅/❌
- TTI: XXms (target <2000ms) ✅/❌
- Score: XX/100 (target >85) ✅/❌

**Mode Switching:**
- Average: XXms (target <500ms) ✅/❌
- P95: XXms (target <550ms) ✅/❌

**ML Performance:**
- EMA: Xms (target <1ms) ✅/❌
- Anomaly: Xms (target <20ms) ✅/❌
- Forecasting: Xms (target <100ms) ✅/❌
- Scoring: Xms (target <100ms) ✅/❌

**Test Results:**
- Phase 11: XX/73 passing
- Phase 10: 347/347 passing
- Regressions: 0 ✅

**Status:** 🟢 ON TRACK / 🟡 AT RISK / 🔴 BLOCKED
```

---

## Continuous Monitoring (Post-Deployment)

### Production Metrics

**Weekly monitoring (Fridays 4:00pm UTC):**

1. **Bundle metrics:**
   - Actual gzipped size served
   - Cache hit rates
   - Chunk loading times

2. **User experience:**
   - Real-world FCP/LCP (using RUM)
   - User-reported load times
   - Mode switching satisfaction

3. **Backend performance:**
   - API p50/p95/p99 response times
   - ML pipeline latency
   - Error rates

4. **Business metrics:**
   - User engagement (time in app)
   - Feature adoption (mode usage)
   - Performance impact on conversion

### Alert Thresholds

```
Bundle size exceeds 210kb gzip → ALERT
Load time exceeds 2.5s → ALERT
Mode switch exceeds 600ms → ALERT
ML pipeline exceeds 350ms → ALERT
Error rate exceeds 0.1% → CRITICAL
API p95 latency exceeds 600ms → ALERT
```

---

## Benchmarking Tools & Commands

### Quick Reference

```bash
# Full performance analysis
npm run build && npm run lighthouse && npm run measure-bundle

# Bundle analysis only
npm run build -- --report

# Load testing
npm test -- tests/phase11/step1.performance.test.ts

# ML benchmarking
npm test -- tests/phase11/step4.enhancedML.test.ts --benchmark

# Continuous monitoring (production)
npm run monitor:performance  # Runs in background
```

### Tool Versions

```json
{
  "webpack": "^5.x",
  "webpack-bundle-analyzer": "^4.x",
  "lighthouse": "^9.x",
  "vitest": "^0.x",
  "gzip-size": "^6.x"
}
```

---

## Reporting Template

### Weekly Performance Report

```markdown
# Week X Performance Report (Date Range)

## Summary
[Overall progress vs targets - is performance on track?]

## Metrics Achieved
- Bundle size: XXXkb (↓XX% from Phase 10)
- Load time: XXms (↓XX% from Phase 10)
- Mode switching: XXms (↓XX% from Phase 10)
- ML pipeline: XXms (maintained)

## Targets Status
- [XX%] Complete (Green/Yellow/Red)
- [XX%] Bundle size target
- [XX%] Load performance target
- [XX%] Mode switching target
- [XX%] ML performance target

## Blockers
[Any performance issues preventing progress]

## Next Week Focus
[What's being optimized next]

## Appendix: Detailed Metrics
[Full table of all measurements]
```

---

## Performance Optimization Tips

### Bundle Size Optimization

```javascript
// ❌ DON'T: Import entire library
import * as moment from 'moment';

// ✅ DO: Import only what you need
import moment from 'moment';

// ❌ DON'T: Dynamic import without code-splitting
const module = import('./large-module');

// ✅ DO: Use code-splitting
const LargeModule = React.lazy(() => import('./large-module'));
```

### Load Performance Optimization

```javascript
// ✅ Prefetch critical assets
<link rel="prefetch" href="/fonts/main.woff2">

// ✅ Defer non-critical JavaScript
<script defer src="non-critical.js"></script>

// ✅ Use service worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Mode Switching Optimization

```javascript
// ✅ Preload mode chunks on hover
const preloadModeChunk = (mode) => {
  import(`./modes/${mode}Mode`);
};

// ✅ Cache loaded mode components
const modeCache = new Map();
const loadMode = async (mode) => {
  if (modeCache.has(mode)) return modeCache.get(mode);
  const module = await import(`./modes/${mode}Mode`);
  modeCache.set(mode, module);
  return module;
};
```

---

## Troubleshooting Performance

### Issue: Bundle size not decreasing

**Diagnosis:**
```bash
# Check what's taking up space
npm run build -- --report

# Look for:
# - Duplicate packages
# - Large dependencies
# - Non-minified code
```

**Solutions:**
- Remove unused dependencies
- Replace heavy libraries with lighter alternatives
- Implement code splitting
- Enable minification and tree-shaking

### Issue: Mode switching still slow

**Diagnosis:**
```javascript
// Add timing to mode switch
console.time('Mode switch');
// ... mode switch logic ...
console.timeEnd('Mode switch');

// Check for blocking operations
// Look in Performance tab for long tasks
```

**Solutions:**
- Reduce component complexity
- Memoize expensive calculations
- Use requestAnimationFrame for animations
- Offload to Web Workers

### Issue: ML pipeline slow

**Diagnosis:**
```typescript
// Add timing to each step
console.time('EMA');
const ema = optimizer.calculateEMA(data);
console.timeEnd('EMA');
```

**Solutions:**
- Use typed arrays (Float32Array)
- Implement caching
- Reduce data set size
- Move to Web Worker

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-24 | Claude Haiku 4.5 | Initial guide creation |
| (TBD) | Dev Team | Updates after Phase 11 implementation |

---

**Document Status:** READY FOR USE  
**Last Updated:** 2026-05-24  
**Owner:** Development Team
