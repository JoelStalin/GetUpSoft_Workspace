# Phase 11 Step 1: Lazy Loading & Code Splitting Implementation Guide

**Based on:** 2026 React Performance Best Practices  
**Purpose:** Achieve <200KB gzip bundle size through intelligent code splitting  
**Target Load Time:** FCP <1s, LCP <1.8s (from Phase 10: ~1.5s, ~2.8s)  
**Expected Improvement:** 25-40% reduction in initial load time

---

## Executive Summary

Modern React applications in 2026 ship 1.5-3MB of JavaScript on initial load (15-30 seconds on 3G). By implementing route-based and component-level lazy loading with proper prefetching, we can reduce initial bundle from 269KB gzip to **<200KB gzip** and cut load time by 40%.

**Key Strategy:**
- Route-based code splitting (automatic)
- Component-level splitting for large features
- Smart prefetching for next routes
- Suspense boundaries with skeleton loaders
- Bundle analysis and monitoring

---

## Part 1: Route-Based Code Splitting (Automatic Wins)

### Implementation Pattern

```typescript
// src/App.tsx - Route-based splitting
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Static imports for above-the-fold
import Toolbar from './components/Toolbar';
import LoadingShell from './components/LoadingShell';

// Lazy-loaded routes
const WorkflowMode = React.lazy(() => import('./modes/WorkflowMode'));
const WebDesignMode = React.lazy(() => import('./modes/WebDesignMode'));
const MobileDesignMode = React.lazy(() => import('./modes/MobileDesignMode'));
const AIMode = React.lazy(() => import('./modes/AIMode'));

export function App() {
  return (
    <>
      <Toolbar />
      <Suspense fallback={<LoadingShell />}>
        <Routes>
          <Route path="/" element={<WorkflowMode />} />
          <Route path="/web" element={<WebDesignMode />} />
          <Route path="/mobile" element={<MobileDesignMode />} />
          <Route path="/ai" element={<AIMode />} />
        </Routes>
      </Suspense>
    </>
  );
}
```

**Impact:** Each mode is a separate chunk (~60-100KB each), loaded only when needed.

---

### Loading State Best Practice

**DON'T:** Empty/blank loading state
```typescript
// ❌ Bad - shows blank screen
<Suspense fallback={<div />}>
  <WebDesignMode />
</Suspense>
```

**DO:** Meaningful skeleton/shell UI
```typescript
// ✅ Good - shows structure while loading
<Suspense fallback={<ComponentSkeleton />}>
  <WebDesignMode />
</Suspense>
```

Implement `ComponentSkeleton` with actual page structure:
```typescript
export function ComponentSkeleton() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header" />
      <div className="skeleton-sidebar" />
      <div className="skeleton-canvas" />
      <style>{`
        .skeleton-header {
          height: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
```

---

## Part 2: Component-Level Code Splitting (Fine-Tuning)

### Strategy: Split Non-Critical Components

```typescript
// src/components/AnalyticsDashboard.tsx
// This is heavy (~120KB) and below the fold

import React from 'react';

export default function AnalyticsDashboard() {
  return (
    <div className="analytics">
      {/* 50+ charts, 100+ data points */}
    </div>
  );
}
```

**Lazy-load within the page:**
```typescript
// src/pages/Dashboard.tsx
import { Suspense, useState } from 'react';

const AnalyticsDashboard = React.lazy(() => 
  import('../components/AnalyticsDashboard')
);

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
```

**Guideline:** Only split components >50KB that aren't needed immediately.

---

## Part 3: Intelligent Prefetching (Predictive Loading)

### Route Prefetching on Hover

```typescript
// src/components/NavLink.tsx
import { useCallback } from 'react';

export function NavLink({ to, children, preloadRoute }) {
  const handleMouseEnter = useCallback(async () => {
    // Prefetch the lazy-loaded chunk before click
    if (preloadRoute) {
      try {
        // Dynamically import to trigger chunk download
        await preloadRoute();
      } catch (e) {
        // Prefetch failed, will load on click
      }
    }
  }, [preloadRoute]);

  return (
    <a 
      href={to}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
    >
      {children}
    </a>
  );
}
```

**Usage:**
```typescript
const preloadWebDesignMode = () => 
  import('./modes/WebDesignMode');

<NavLink 
  to="/web" 
  preloadRoute={preloadWebDesignMode}
>
  Web Design
</NavLink>
```

**Impact:** By the time user clicks, chunk is usually already downloaded (0-200ms saved).

---

## Part 4: Avoiding Common Pitfalls

### ❌ DON'T: Split Tiny Components

```typescript
// ❌ BAD - Component is only 5KB but splits:
const TinyButton = React.lazy(() => import('./TinyButton'));
// Cost: 1 network round-trip (~50-200ms)
// Savings: 5KB
// Trade-off: TERRIBLE
```

**Rule:** Only split components >50KB.

### ❌ DON'T: Lazy-load Above-the-Fold Content

```typescript
// ❌ BAD - Hero section seen immediately
export default function Page() {
  const HeroSection = React.lazy(() => import('./Hero'));
  return <HeroSection />; // User sees blank while loading
}
```

**Rule:** Static import everything users see first. Lazy-load below-the-fold.

### ❌ DON'T: Bad Suspense Boundary Placement

```typescript
// ❌ BAD - Whole page flashes
<Suspense fallback={<LoadingPage />}>
  <Header />
  <Sidebar />
  <Content /> {/* This 1 component delays everything */}
  <Footer />
</Suspense>
```

**DO:** Granular Suspense boundaries
```typescript
// ✅ GOOD - Only Content shows loading state
<>
  <Header />
  <Sidebar />
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
  <Footer />
</>
```

---

## Part 5: Measuring & Analysis

### Step 1: Generate Bundle Report

```bash
npm run build -- --report
# Opens: dist/report.html
# Interactive webpack-bundle-analyzer
```

**What to look for:**
- Any chunk >500KB (split it)
- Duplicated dependencies (move to vendor)
- Unused code (remove it)
- Tree-shaking effectiveness

### Step 2: Measure Initial Load

```bash
# Lighthouse in DevTools
F12 → Lighthouse → Analyze Page Load
# Record: FCP, LCP, TTI, total size
```

**Target Metrics:**
| Metric | Phase 10 | Phase 11 Target | Improvement |
|--------|----------|-----------------|------------|
| FCP | 1.5s | <1.0s | 33% ↓ |
| LCP | 2.8s | <1.8s | 35% ↓ |
| Bundle (gzip) | 269KB | <200KB | 25% ↓ |

### Step 3: Monitor Runtime Performance

```typescript
// src/utils/performanceMonitor.ts
export function monitorChunkLoad(chunkName: string) {
  const startTime = performance.now();
  
  // After chunk loads:
  const loadTime = performance.now() - startTime;
  
  // Alert if > 1000ms
  if (loadTime > 1000) {
    console.warn(`Chunk ${chunkName} took ${loadTime}ms`);
  }
}
```

---

## Part 6: Implementation Checklist for Phase 11 Step 1

### Week 1: Route-Based Splitting

- [ ] Implement React.lazy() for all 4 modes
- [ ] Add Suspense boundaries with LoadingShell
- [ ] Test: Each mode loads in separate chunk
- [ ] Measure: Bundle size after splitting
- [ ] Target: Initial bundle <250KB gzip

### Week 2: Component-Level Splitting

- [ ] Identify components >50KB
- [ ] Lazy-load analytics/heavy components
- [ ] Add Suspense boundaries at component level
- [ ] Create skeleton loaders for each
- [ ] Measure: Bundle reduction per component

### Week 3: Prefetching & Optimization

- [ ] Implement route prefetching on hover
- [ ] Add prefetch for predicted next routes
- [ ] Run final bundle analysis
- [ ] Verify target: <200KB gzip achieved
- [ ] Performance baseline: FCP <1s, LCP <1.8s

---

## Part 7: Advanced Patterns

### Conditional Imports (Feature Flags)

```typescript
// Only load enterprise features if enabled
const EnterpriseDashboard = 
  window.FEATURES.enterpriseDashboard
    ? React.lazy(() => import('./enterprise/Dashboard'))
    : null;

export function Dashboard() {
  if (!EnterpriseDashboard) {
    return <BasicDashboard />;
  }
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <EnterpriseDashboard />
    </Suspense>
  );
}
```

### Dynamic Imports (Runtime)

```typescript
// Load mode based on user preference
async function loadUserMode(modeType: string) {
  const module = await import(`./modes/${modeType}Mode`);
  return module.default;
}

const mode = await loadUserMode('WebDesign');
```

---

## Part 8: Troubleshooting

### Problem: Chunk Still Too Large

**Solution:**
1. Check what's in the chunk: `npm run build -- --report`
2. Look for large dependencies
3. Replace if possible:
   - `moment` → `date-fns` (smaller)
   - `lodash` → `lodash-es` (tree-shakable)
4. Consider dynamic import of dependencies

### Problem: Chunk Loading Slow

**Solution:**
1. Prefetch earlier (on route load, not hover)
2. Use network-first caching strategy
3. Consider splitting further

### Problem: Suspense Shows Too Often

**Solution:**
1. Adjust granularity of Suspense boundaries
2. Use stale-while-revalidate caching
3. Show cached version while loading new

---

## References & Sources

- [React Code Splitting Documentation](https://legacy.reactjs.org/docs/code-splitting.html)
- [Code Splitting in 2026: Lazy Loading Done Right | jsmanifest](https://jsmanifest.com/code-splitting-lazy-loading-2026)
- [Optimizing React Apps with Code Splitting and Lazy Loading | Medium](https://medium.com/@ignatovich.dm/optimizing-react-apps-with-code-splitting-and-lazy-loading-e8c8791006e3)
- [React Performance Course | Steve Kinney](https://stevekinney.com/courses/react-performance/code-splitting-and-lazy-loading)
- [GreatFrontend Code Splitting Guide](https://www.greatfrontend.com/blog/code-splitting-and-lazy-loading-in-react)

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** Development Team  
**Phase:** Phase 11 Step 1 Implementation  
**Target:** <200KB gzip, FCP <1s, LCP <1.8s
