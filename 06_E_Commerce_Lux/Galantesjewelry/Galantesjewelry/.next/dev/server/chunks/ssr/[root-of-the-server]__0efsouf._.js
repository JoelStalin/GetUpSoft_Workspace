module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Galantesjewelry/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.0x3dzn~oxb6tn.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/Galantesjewelry/app/favicon.ico.mjs { IMAGE => \"[project]/Galantesjewelry/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[project]/Galantesjewelry/lib/odoo/client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Odoo API Client
 *
 * Provides typed access to Galante's Jewelry product catalog via Odoo REST API.
 * Follows integration-contracts/shop-product.v1.ts schema.
 *
 * Usage:
 *   const client = getOdooClient();
 *   const products = await client.getProducts({ q: 'ring', sort: 'featured', page: 1 });
 *   const product  = await client.getProductBySlug('engagement-ring-14k-gold');
 *   const related  = await client.getRelatedProducts('engagement-ring-14k-gold', 4);
 *   const cats     = await client.getCategories();
 */ // ---------------------------------------------------------------------------
// Shared types (exported for use across the storefront)
// ---------------------------------------------------------------------------
__turbopack_context__.s([
    "createOdooClient",
    ()=>createOdooClient,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getOdooClient",
    ()=>getOdooClient
]);
// ---------------------------------------------------------------------------
// OdooClient class
// ---------------------------------------------------------------------------
class OdooClient {
    baseUrl;
    timeout;
    cache;
    cacheTTL;
    constructor(config = {}){
        this.baseUrl = config.baseUrl || process.env.ODOO_BASE_URL || 'http://localhost:8069';
        this.timeout = config.timeout || 10000;
        this.cache = new Map();
        this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes
    }
    // ── Public API ─────────────────────────────────────────────────────────────
    /**
   * Fetch a paginated, filtered, and sorted product list.
   *
   * Accepts either a ShopQuery object (new) or legacy (page, pageSize) numbers.
   */ async getProducts(queryOrPage = 1, legacyPageSize = 24) {
        const params = this._buildProductParams(queryOrPage, legacyPageSize);
        const cacheKey = `products-${JSON.stringify(params)}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await this.fetch('/api/products', {
                query: params
            });
            const data = (response.data || []).map((product)=>({
                    ...product,
                    imageUrl: `/api/products/image?id=${product.id}`
                }));
            const incomingPagination = response.pagination || {};
            const page = incomingPagination.page ?? (typeof params.page === 'number' ? params.page : 1);
            const pageSize = incomingPagination.pageSize ?? (typeof params.page_size === 'number' ? params.page_size : 24);
            const total = incomingPagination.total ?? data.length;
            const pages = incomingPagination.pages ?? Math.max(1, Math.ceil(total / pageSize));
            const paginatedResponse = {
                data,
                pagination: {
                    page,
                    pageSize,
                    total,
                    pages,
                    hasNext: incomingPagination.hasNext ?? page < pages,
                    hasPrev: incomingPagination.hasPrev ?? page > 1
                }
            };
            this.cache.set(cacheKey, {
                data: paginatedResponse,
                timestamp: Date.now()
            });
            return paginatedResponse;
        } catch (error) {
            console.warn('Odoo API unreachable, serving luxury masterpiece collection fallback.', error);
            const pageNum = typeof params.page === 'number' ? params.page : 1;
            const pageSizeNum = typeof params.page_size === 'number' ? params.page_size : 24;
            return {
                data: LUXURY_FALLBACK_PRODUCTS.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum),
                pagination: {
                    page: pageNum,
                    pageSize: pageSizeNum,
                    total: LUXURY_FALLBACK_PRODUCTS.length,
                    pages: Math.ceil(LUXURY_FALLBACK_PRODUCTS.length / pageSizeNum),
                    hasNext: pageNum * pageSizeNum < LUXURY_FALLBACK_PRODUCTS.length,
                    hasPrev: pageNum > 1
                }
            };
        }
    }
    /** Fetch a single product by its URL slug. */ async getProductBySlug(slug) {
        const cacheKey = `product-${slug}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await this.fetch(`/api/products/${slug}`);
            if (!response.data) return null;
            // Always use the local image proxy when we have a product id.
            // Some Odoo records omit imageUrl even when the image exists.
            if (response.data.id) {
                response.data.imageUrl = `/api/products/image?id=${response.data.id}`;
            }
            this.cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            return response.data;
        } catch  {
            console.warn(`Product slug ${slug} not found in Odoo, checking fallback collection...`);
            return LUXURY_FALLBACK_PRODUCTS.find((p)=>p.slug === slug) || null;
        }
    }
    /** Fetch related products for the detail page (by slug). */ async getRelatedProducts(slug, limit = 4) {
        const cacheKey = `related-${slug}-${limit}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await this.fetch(`/api/products/${slug}/related`, {
                query: {
                    limit
                }
            });
            let data = response.data || [];
            // Proxy images
            data = data.map((p)=>({
                    ...p,
                    imageUrl: `/api/products/image?id=${p.id}`
                }));
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error(`Failed to fetch related products for ${slug}:`, error);
            return [];
        }
    }
    /** Fetch all categories that have at least one published product. */ async getCategories() {
        const cacheKey = 'categories';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await this.fetch('/api/categories');
            const data = response.data || [];
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return [];
        }
    }
    /** Featured products for homepage / collections block. */ async getFeaturedProducts(limit = 6) {
        const cacheKey = `featured-${limit}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }
        try {
            const response = await this.fetch('/api/products/featured', {
                query: {
                    limit
                }
            });
            let data = response.data || [];
            // Proxy images
            data = data.map((p)=>({
                    ...p,
                    imageUrl: `/api/products/image?id=${p.id}`
                }));
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error('Failed to fetch featured products:', error);
            return [];
        }
    }
    /**
   * Fetch products by category (legacy helper – prefer getProducts({ category })).
   * @deprecated Use getProducts({ category, page, page_size }) instead.
   */ async getProductsByCategory(category, page = 1, pageSize = 24) {
        return this.getProducts({
            category,
            page,
            page_size: pageSize
        });
    }
    clearCache(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
    // ── Private helpers ────────────────────────────────────────────────────────
    /** Build the query-param object accepted by /api/products. */ _buildProductParams(queryOrPage, legacyPageSize) {
        if (typeof queryOrPage === 'number') {
            return {
                page: queryOrPage,
                page_size: legacyPageSize
            };
        }
        const q = queryOrPage;
        const params = {
            page: q.page ?? 1,
            page_size: q.page_size ?? legacyPageSize
        };
        if (q.q) params.q = q.q;
        if (q.category) params.category = q.category;
        if (q.material) params.material = q.material;
        if (q.sort) params.sort = q.sort;
        if (q.min_price != null) params.min_price = q.min_price;
        if (q.max_price != null) params.max_price = q.max_price;
        return params;
    }
    async fetch(endpoint, options = {}) {
        const url = new URL(endpoint, this.baseUrl);
        if (options.query) {
            Object.entries(options.query).forEach(([key, value])=>{
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), this.timeout);
        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`Odoo API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        } finally{
            clearTimeout(timeoutId);
        }
    }
    isCacheValid(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        return Date.now() - entry.timestamp < this.cacheTTL;
    }
}
// ---------------------------------------------------------------------------
// Singleton factory
// ---------------------------------------------------------------------------
let clientInstance = null;
function createOdooClient(config) {
    if (!clientInstance) clientInstance = new OdooClient(config);
    return clientInstance;
}
function getOdooClient() {
    if (!clientInstance) clientInstance = new OdooClient();
    return clientInstance;
}
const __TURBOPACK__default__export__ = OdooClient;
const LUXURY_FALLBACK_PRODUCTS = [
    {
        id: '1',
        slug: 'the-islamorada-solitaire',
        name: 'The Islamorada Solitaire',
        shortDescription: '2ct Diamond on Platinum with Coral Engravings',
        longDescription: 'A masterpiece of coastal elegance, featuring a brilliant 2-carat ethically sourced diamond set upon a hand-engraved platinum band with intricate coral patterns.',
        price: 18500,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=1',
        category: 'Bridal',
        buyUrl: '#',
        isFeatured: true
    },
    {
        id: '2',
        slug: 'mariners-bond-band',
        name: "Mariner's Bond Band",
        shortDescription: '18k Rose Gold Nautical Knot Band',
        longDescription: 'Symbolize your eternal bond with this 18k rose gold wedding band, featuring a continuous nautical knot motif representing strength and unity.',
        price: 2400,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=2',
        category: 'Bridal',
        buyUrl: '#'
    },
    {
        id: '3',
        slug: 'compass-rose-pendant',
        name: 'The Compass Rose Pendant',
        shortDescription: '18k Gold with Sapphire Center',
        longDescription: 'Never lose your way with this exquisite 18k yellow gold compass rose pendant, accented with a deep blue sapphire at its center.',
        price: 3200,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=3',
        category: 'Nautical',
        buyUrl: '#',
        isFeatured: true
    },
    {
        id: '4',
        slug: 'keys-azure-drop-earrings',
        name: 'Keys Azure Drop Earrings',
        shortDescription: 'Aquamarine and Diamond Drops',
        longDescription: 'Capturing the crystalline waters of the Florida Keys, these drop earrings feature pear-shaped aquamarines suspended from diamond-encrusted studs.',
        price: 5800,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=4',
        category: 'Coastal',
        buyUrl: '#'
    },
    {
        id: '5',
        slug: 'anchor-soul-bracelet',
        name: 'Anchor of the Soul Bracelet',
        shortDescription: 'Diamond Pavé Anchor Cuff',
        longDescription: 'A stunning solid gold cuff featuring a central anchor clasp adorned with brilliant-cut diamond pavé. A true statement of coastal luxury.',
        price: 8900,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=5',
        category: 'Nautical',
        buyUrl: '#',
        isFeatured: true
    },
    {
        id: '6',
        slug: 'coastal-tide-ring',
        name: 'Coastal Tide Ring',
        shortDescription: 'Blue Sapphire Gradient Wave Ring',
        longDescription: 'Five rows of graduated blue sapphires mimic the rolling waves of the Atlantic, set in high-polish white gold.',
        price: 4500,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=6',
        category: 'Coastal',
        buyUrl: '#'
    },
    {
        id: '7',
        slug: 'sirens-pearl-necklace',
        name: "Siren's Pearl Necklace",
        shortDescription: 'South Sea Pearl with White Gold Mermaid Tail',
        longDescription: 'A lustrous 12mm South Sea pearl cradled by a delicate white gold mermaid tail set with shimmering diamonds.',
        price: 7200,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=7',
        category: 'Nautical',
        buyUrl: '#'
    },
    {
        id: '8',
        slug: 'navigators-chrono-link',
        name: "Navigator's Chrono Link",
        shortDescription: 'Solid Heavy Link Bracelet',
        longDescription: 'Inspired by vintage ship anchor chains, this heavy-link bracelet is handcrafted in sterling silver and 18k yellow gold accents.',
        price: 1800,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=8',
        category: 'Coastal',
        buyUrl: '#'
    },
    {
        id: '9',
        slug: 'tritons-trident-tie-bar',
        name: "Triton's Trident Tie Bar",
        shortDescription: 'Sterling Silver and Gold Tie Bar',
        longDescription: 'A refined accessory for the coastal gentleman, featuring a hand-forged sterling silver trident with 18k gold detailing.',
        price: 650,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=9',
        category: 'Nautical',
        buyUrl: '#'
    },
    {
        id: '10',
        slug: 'lighthouse-guardian-charm',
        name: 'Lighthouse Guardian Charm',
        shortDescription: 'Gold and Ruby Lighthouse Charm',
        longDescription: 'A detailed 18k gold lighthouse charm featuring a tiny ruby crystal that catches the light like a true beacon.',
        price: 1200,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=10',
        category: 'Coastal',
        buyUrl: '#'
    },
    {
        id: '11',
        slug: 'shipping-calculation-demo-pendant',
        name: 'Shipping Calculation Demo Pendant',
        shortDescription: 'Ready-to-ship demo pendant for previewing shipping totals',
        longDescription: 'A ready-to-ship gold pendant published specifically for customer portal testing. Add it to the cart to preview live shipping totals before checkout.',
        price: 1250,
        currency: 'USD',
        availability: 'in_stock',
        imageUrl: '/api/products/image?id=11',
        category: 'Ready to Ship',
        buyUrl: '#',
        isFeatured: true
    }
];
}),
"[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeaturedCarousel",
    ()=>FeaturedCarousel
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FeaturedCarousel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FeaturedCarousel() from the server but FeaturedCarousel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/FeaturedCarousel.tsx <module evaluation>", "FeaturedCarousel");
}),
"[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeaturedCarousel",
    ()=>FeaturedCarousel
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FeaturedCarousel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FeaturedCarousel() from the server but FeaturedCarousel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/FeaturedCarousel.tsx", "FeaturedCarousel");
}),
"[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$FeaturedCarousel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$FeaturedCarousel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$FeaturedCarousel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGrid",
    ()=>ProductGrid
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductGrid() from the server but ProductGrid is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/ProductGrid.tsx <module evaluation>", "ProductGrid");
}),
"[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGrid",
    ()=>ProductGrid
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductGrid() from the server but ProductGrid is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/ProductGrid.tsx", "ProductGrid");
}),
"[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$FeaturedCarousel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
const dynamic = "force-dynamic";
async function Home() {
    const sections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllSections"])();
    const featured = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFeaturedItems"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOdooClient"])();
    const featuredProducts = await client.getFeaturedProducts(6);
    const getSection = (id)=>sections.find((s)=>s.section_identifier === id);
    const hero = getSection('hero');
    const philosophy = getSection('philosophy');
    const review = getSection('review');
    const cta = getSection('cta');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative w-full h-[80vh] min-h-[600px] flex flex-col justify-end text-white overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000",
                        style: {
                            backgroundImage: `url('${hero?.image_url || ""}')`
                        }
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-0 bg-gradient-to-tr from-black/75 via-black/30 to-transparent"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "z-10 w-full max-w-2xl px-8 md:px-16 pb-14 md:pb-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl md:text-5xl lg:text-6xl font-serif text-accent mb-4 leading-tight drop-shadow-lg",
                                children: hero?.title
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/page.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-base md:text-xl font-light tracking-wide mb-8 text-white/90 drop-shadow-md whitespace-pre-wrap",
                                children: hero?.content_text
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/page.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-4",
                                children: [
                                    hero?.action_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: hero.action_link || "#",
                                        className: "bg-accent text-primary-dark px-8 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-accent-light transition-colors",
                                        children: hero.action_text
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/collections",
                                        className: "border border-accent text-accent px-8 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-accent hover:text-primary-dark transition-colors backdrop-blur-sm bg-black/20",
                                        children: "Explore Collections"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/page.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-24 px-6 md:px-12 max-w-5xl mx-auto text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl md:text-4xl mb-6",
                        children: philosophy?.title
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg opacity-80 leading-relaxed max-w-3xl mx-auto whitespace-pre-wrap",
                        children: philosophy?.content_text
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "w-full bg-white py-24 px-6 md:px-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$FeaturedCarousel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FeaturedCarousel"], {
                    items: featured
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "w-full bg-stone-50 py-24 px-6 md:px-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-12 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm uppercase tracking-[0.35em] text-accent mb-4",
                                    children: "Featured Jewelry"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-4xl font-serif font-bold text-gray-900",
                                    children: "Live product collection from Odoo"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-gray-600 max-w-3xl mx-auto",
                                    children: "These products are pulled directly from the Odoo catalog, including real-time availability and buying links."
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        featuredProducts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductGrid"], {
                            products: featuredProducts,
                            columns: 3
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 75,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-3xl border border-gray-200 bg-white px-10 py-12 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-2xl font-semibold text-gray-900 mb-3",
                                    children: "Products are loading"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-600",
                                    children: "We're connecting to our Odoo shop. Please refresh if the products do not appear."
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                                    lineNumber: 79,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 77,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "w-full py-24 bg-stone-50 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-4xl mx-auto text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-3xl mb-12",
                            children: review?.title
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                            className: "text-xl md:text-2xl font-serif text-primary italic leading-relaxed mb-6",
                            children: review?.content_text
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("cite", {
                            className: "block text-sm uppercase tracking-widest font-semibold text-accent not-italic",
                            children: review?.subtitle
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/app/page.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/app/page.tsx",
                    lineNumber: 89,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "w-full py-32 px-6 flex flex-col items-center justify-center bg-primary text-white text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-4xl md:text-5xl text-accent mb-6",
                        children: cta?.title
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "max-w-2xl text-lg opacity-80 mb-10 whitespace-pre-wrap",
                        children: cta?.content_text
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: cta?.action_link || "/contact",
                        className: "bg-accent text-primary-dark px-10 py-5 text-sm uppercase tracking-widest font-bold hover:bg-accent-light transition-colors",
                        children: cta?.action_text
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/page.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/page.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/page.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Galantesjewelry/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0efsouf._.js.map