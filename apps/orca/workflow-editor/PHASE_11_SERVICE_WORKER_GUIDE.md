# Phase 11 Step 1: Service Worker & Offline-First Caching Guide

**Based on:** 2026 PWA Offline-First Best Practices  
**Purpose:** Enable offline functionality and reduce bandwidth usage  
**Target:** Work offline, instant second visits (<200ms load)  
**Strategy:** Smart caching with stale-while-revalidate

---

## Executive Summary

Service Workers enable three critical capabilities:
1. **Offline Support:** App works when network unavailable
2. **Performance:** Static assets cached, instant second visits
3. **Bandwidth:** Reduce data usage and API calls

**Phase 11 Goal:** Implement intelligent caching that:
- Caches static assets (cache-first)
- Updates API data in background (stale-while-revalidate)
- Maintains fresh content while providing instant access

---

## Part 1: Service Worker Fundamentals

### Service Worker Lifecycle

```typescript
// src/serviceWorker.ts

const CACHE_VERSION = 'v1-2026-05-24';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Step 1: Install - Cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      
      // Cache critical assets (loaded immediately)
      await cache.addAll([
        '/',
        '/index.html',
        '/main.*.js',
        '/style.*.css',
        '/fonts/inter.woff2',
        '/icons/logo.svg',
        '/manifest.json'
      ]);

      // Tell browser: "This SW is ready now"
      self.skipWaiting();
    })()
  );
});

// Step 2: Activate - Clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      
      // Delete old cache versions
      await Promise.all(
        cacheNames
          .filter(name => !name.includes(CACHE_VERSION))
          .map(name => caches.delete(name))
      );

      // Claim all clients immediately
      await self.clients.claim();
    })()
  );
});

// Step 3: Fetch - Intercept network requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // Strategy selection
  if (request.destination === 'document') {
    // HTML: network-first (show new content, fallback to cache)
    event.respondWith(networkFirst(request));
  } else if (request.url.includes('/api/')) {
    // API: stale-while-revalidate (show cached, update in background)
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Assets (JS, CSS, images): cache-first (use cache, network as fallback)
    event.respondWith(cacheFirst(request));
  }
});
```

---

## Part 2: Caching Strategies

### Strategy 1: Cache-First (Static Assets)

Best for: CSS, JS, images, fonts that don't change often

```typescript
async function cacheFirst(request: Request): Promise<Response> {
  // Step 1: Check cache
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  // Step 2: If not cached, fetch from network
  try {
    const response = await fetch(request);
    
    // Step 3: Cache successful response
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Step 4: Fallback to offline version
    return new Response('Offline - asset not cached', { status: 503 });
  }
}

// Advantages:
// - Instant load (no network call)
// - Saves bandwidth
// Disadvantages:
// - Updates delayed until cache clears
```

---

### Strategy 2: Network-First (HTML)

Best for: HTML pages that change frequently

```typescript
async function networkFirst(request: Request, timeout: number = 3000): Promise<Response> {
  try {
    // Step 1: Try network with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(request, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    // Step 2: Cache successful response
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Step 3: Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Step 4: Offline fallback page
    return caches.match('/offline.html') || 
           new Response('Offline', { status: 503 });
  }
}

// Advantages:
// - Always shows latest content
// - Fallback to cache if network slow/offline
// Disadvantages:
// - Slower (always tries network first)
```

---

### Strategy 3: Stale-While-Revalidate (API)

Best for: API calls that can show slightly stale data while updating

```typescript
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);

  // Step 1: Return cached response immediately (if exists)
  const cached = await cache.match(request);

  // Step 2: Update cache in background (don't wait)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network error, keep using stale data
    return cached || new Response(
      JSON.stringify({ error: 'offline' }), 
      { status: 503 }
    );
  });

  // Step 3: Return cached data immediately (don't wait for network)
  return cached || fetchPromise;
}

// Advantages:
// - Instant response (cached data)
// - Background update (always fresh eventually)
// - Works offline
// Disadvantages:
// - Can show slightly stale data
// - Requires intelligent UI (show "updating..." indicator)

// Usage:
// 1. User sees cached analytics: "Revenue: $100"
// 2. Background: Fetch new data from API
// 3. New data arrives: UI updates to "Revenue: $105" with ✓ "Updated"
// 4. If offline: Shows "Revenue: $100" (cached)
```

---

## Part 3: Advanced Patterns

### Pattern 1: Cache Expiration (Time-Based)

```typescript
async function cacheFirstWithExpiry(
  request: Request,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Check if cache is still fresh
    const cacheTime = new Date(cached.headers.get('date') || 0).getTime();
    const now = Date.now();

    if (now - cacheTime < maxAge) {
      return cached; // Cache is fresh
    }
  }

  // Cache expired or doesn't exist - fetch new
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503 });
  }
}
```

### Pattern 2: Selective Caching (Only Important Assets)

```typescript
async function selectiveCacheFirst(request: Request): Promise<Response> {
  // Only cache assets we care about
  const cacheablePatterns = [
    /\.js$/,      // JavaScript files
    /\.css$/,     // CSS files
    /\.woff2$/,   // Fonts
    /\.svg$/,     // Icons
    /favicon/,    // Favicon
    /manifest/    // Web app manifest
  ];

  const shouldCache = cacheablePatterns.some(pattern =>
    pattern.test(request.url)
  );

  if (!shouldCache) {
    // Not cacheable, always use network
    return fetch(request);
  }

  // For cacheable assets, use cache-first strategy
  return cacheFirst(request);
}
```

### Pattern 3: API Caching with Offline Indicators

```typescript
// UI Component: Show when data is stale
export function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch with background update
    (async () => {
      const response = await fetch('/api/analytics');
      const newData = await response.json();
      
      setData(newData);
      setLastUpdate(new Date());
      setIsUpdating(false);
    })();

    // Start background update
    setIsUpdating(true);
  }, []);

  return (
    <div>
      <div>Revenue: ${data?.revenue}</div>
      
      {lastUpdate && (
        <small>
          Last update: {lastUpdate.toLocaleTimeString()}
          {isUpdating && ' (updating...)'}
        </small>
      )}
    </div>
  );
}
```

---

## Part 4: Testing Offline Functionality

### Test 1: Enable Service Worker Locally

```bash
# Development with service worker
npm run dev -- --host  # Make accessible to network

# Or use production build
npm run build
npx http-server dist/
```

**In browser DevTools:**
```
F12 → Application tab → Service Workers
- Show the registered service worker
- Offline checkbox to test offline behavior
- Cache Storage to inspect cached assets
```

### Test 2: Simulating Offline

```javascript
// In DevTools Console
navigator.serviceWorker.controller.postMessage({
  type: 'SIMULATE_OFFLINE',
  offline: true
});

// Or use DevTools Network tab:
// Click throttle dropdown → Select "Offline"
```

### Test 3: Automated Offline Testing

```typescript
// test/offline.spec.ts
import { render, screen } from '@testing-library/react';

describe('Offline Functionality', () => {
  it('should show cached data when offline', async () => {
    // Step 1: Load app normally
    render(<App />);
    
    // Step 2: Verify data loaded
    expect(screen.getByText(/Revenue/)).toBeInTheDocument();
    
    // Step 3: Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Trigger offline event
    window.dispatchEvent(new Event('offline'));
    
    // Step 4: Verify app still works
    expect(screen.getByText(/Revenue/)).toBeInTheDocument();
    
    // Step 5: Restore online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  it('should update data when back online', async () => {
    // Go online → fetch new data
    window.dispatchEvent(new Event('online'));
    
    // Wait for background update
    await waitFor(() => {
      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });
  });
});
```

---

## Part 5: Cache Invalidation & Updates

### Strategy: Version-Based Cache Names

```typescript
// Automatic cache busting when code changes
const CACHE_VERSION = 'v' + __BUILD_HASH__; // From build system

// When you deploy new code:
// - New build hash generates new cache name
// - Old caches remain (don't break existing users)
// - Service worker activate event cleans up old caches
// - Users gradually get new version

// Example versions:
// v1-abc123-static (old - gets deleted)
// v1-def456-static (old - gets deleted)
// v1-2026-05-24-static (current - kept)
```

### Force Update During Session

```typescript
// Prompt user if new version available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      
      // Show notification: "New version available"
      showNotification('New features available', {
        body: 'Refresh to update',
        actions: [
          { title: 'Refresh', action: 'refresh' }
        ]
      });
    });
  });
}
```

---

## Part 6: Phase 11 Step 1 Implementation Checklist

### Week 1: Basic Service Worker

- [ ] Register service worker in main.ts
- [ ] Implement install event (cache static assets)
- [ ] Implement activate event (cleanup old caches)
- [ ] Test: Assets load from cache
- [ ] Test: Offline page loads correctly

### Week 2: Fetch Strategies

- [ ] Implement cache-first (assets)
- [ ] Implement network-first (HTML)
- [ ] Implement stale-while-revalidate (API)
- [ ] Test: Each strategy works correctly
- [ ] Test: Offline scenarios

### Week 3: Optimization & Monitoring

- [ ] Add cache expiration logic
- [ ] Add offline indicators in UI
- [ ] Monitor cache size
- [ ] Set up cache size limits (50-100MB max)
- [ ] Measure: Second visit load time <200ms

---

## Part 7: Monitoring & Debugging

### Check Cache Size

```typescript
async function getCacheSize(): Promise<number> {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const req of keys) {
      const res = await cache.match(req);
      if (res) {
        totalSize += res.headers.get('content-length') || 0;
      }
    }
  }

  return totalSize; // bytes
}

// Usage:
const sizeInMB = (await getCacheSize()) / (1024 * 1024);
console.log(`Cache size: ${sizeInMB.toFixed(2)}MB`);
```

### Clear Cache Programmatically

```typescript
async function clearCache(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
}

// Or: User clicks "Clear Cache" button
<button onClick={() => clearCache()}>
  Clear Cache ({cacheSize} MB)
</button>
```

---

## References & Sources

- [Offline-First PWAs: Service Worker Caching | MagicBell](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)
- [Caching - Progressive Web Apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [Caching Strategies Overview | Workbox/Chrome](https://developer.chrome.com/docs/workbox/caching-strategies-overview)
- [PWA Offline-First Strategies | Medium](https://tianyaschool.medium.com/pwa-offline-first-strategies-key-steps-to-enhance-user-experience-4c10de780446)
- [Best Practices for PWA Offline Caching | PixelFreeStudio](https://blog.pixelfreestudio.com/best-practices-for-pwa-offline-caching-strategies/)

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** Development Team  
**Phase:** Phase 11 Step 1 Implementation  
**Target:** Offline support, <200ms second visit, 50-100MB cache limit
