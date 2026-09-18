# Phase 11 Step 1: Performance Optimization & Bundle Splitting

**Status:** PLANNED (Phase 10 staging pending)  
**Duration:** 3-5 days | **Tests:** 8-12 new

## Objective
Reduce bundle from 901KB to <400KB gzip (50% reduction) via lazy-loading mode components and service worker caching.

## Implementation Steps

### 1. Analyze Bundle & Create Configuration
- Run webpack-bundle-analyzer
- Create `BUNDLE_ANALYSIS.md`
- Create `src/config/bundleConfig.ts`

### 2. Lazy-Load Mode Components
- Modify `src/App.tsx` to use `React.lazy()`
- Add `Suspense` boundaries
- Create mode loading spinner
- Expected: 901KB → 500KB initial bundle

### 3. Implement Code Splitting
- Create `src/utils/codeSplitting.ts`
- Monitor chunk sizes
- Validate splitting boundaries

### 4. Service Worker Caching
- Create `src/services/serviceWorker.ts`
- Implement cache strategies
- Add offline fallback support

### 5. Prefetch Critical Data
- Create `src/hooks/usePrefetch.ts`
- Prefetch mode components
- Batch network requests

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| Initial Bundle | 269KB gzip | <200KB |
| Mode Switch | 1000ms | <500ms |
| Initial Load | 3s | <2s |
| Time-to-Interactive | 3s | <2s |

## Files to Create/Modify

**New (5 files):**
- `src/utils/codeSplitting.ts`
- `src/services/serviceWorker.ts`
- `src/config/bundleConfig.ts`
- `src/hooks/usePrefetch.ts`
- `public/sw.js`

**Modified (1 file):**
- `src/App.tsx` - Add lazy imports + Suspense

**Tests (5 files, 8-12 tests):**
- `tests/phase11/bundleSize.test.ts` (3 tests)
- `tests/phase11/lazyLoading.test.ts` (2 tests)
- `tests/phase11/serviceWorker.test.ts` (3 tests)
- `tests/phase11/codeSplitting.test.ts` (2 tests)
- `tests/phase11/performance.test.ts` (2-4 tests)

## Success Criteria
- ✅ Initial bundle <200KB gzip
- ✅ Mode switch <500ms
- ✅ Load time <2s (4G throttle)
- ✅ 8-12 new tests passing
- ✅ 0 Phase 10 regressions
- ✅ Service worker offline mode working

## Timeline

**Day 1:** Bundle analysis & setup (4 hours)  
**Day 2:** Lazy-loading implementation (5 hours)  
**Day 3:** Service worker implementation (4 hours)  
**Day 4:** Optimization & testing (4 hours)  
**Day 5:** Validation & documentation (3 hours)

## Risk Assessment
- **Low Risk:** Lazy loading, service workers are standard patterns
- **Medium Risk:** Validate critical paths, multi-tenant cache isolation
- **Mitigation:** Comprehensive tests (8-12), gradual rollout, fallback available

## Ready for Execution
Post-Phase 10 staging deployment validation (2026-05-25+)

---
**Plan Version:** 1.0 | **Created:** 2026-05-24  
**Author:** Claude Haiku 4.5
