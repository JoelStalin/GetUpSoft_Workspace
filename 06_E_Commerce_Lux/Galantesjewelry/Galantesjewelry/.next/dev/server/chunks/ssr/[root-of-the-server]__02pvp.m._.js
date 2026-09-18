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
"[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShopControls",
    ()=>ShopControls
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ShopControls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ShopControls() from the server but ShopControls is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/ShopControls.tsx <module evaluation>", "ShopControls");
}),
"[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShopControls",
    ()=>ShopControls
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ShopControls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ShopControls() from the server but ShopControls is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/ShopControls.tsx", "ShopControls");
}),
"[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ShopControls$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ShopControls$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ShopControls$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Pagination",
    ()=>Pagination
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Pagination = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Pagination() from the server but Pagination is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/Pagination.tsx <module evaluation>", "Pagination");
}),
"[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Pagination",
    ()=>Pagination
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Pagination = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Pagination() from the server but Pagination is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Galantesjewelry/components/shop/Pagination.tsx", "Pagination");
}),
"[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$Pagination$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$Pagination$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$Pagination$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Galantesjewelry/app/shop/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShopPage,
    "dynamic",
    ()=>dynamic,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
/**
 * Shop Page – Premium Jewelry Catalog
 *
 * Full-featured listing page with search, category navigation,
 * material & price filters, sorting, and real pagination.
 * All search/filter state lives in the URL for shareable links.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ShopControls$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ShopControls.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$Pagination$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/Pagination.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const metadata = {
    title: "Shop Fine Jewelry | Galante's Jewelry",
    description: 'Discover bridal pieces, nautical-inspired designs, timeless gifts, and custom creations.'
};
const dynamic = 'force-dynamic';
const PAGE_SIZE = 24;
async function ShopPage({ searchParams }) {
    const params = await searchParams;
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOdooClient"])();
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSettings"])();
    const page = Math.max(1, parseInt(params.page || '1', 10));
    // Fetch products and categories in parallel; degrade gracefully on errors.
    const [productsResult, categoriesResult] = await Promise.allSettled([
        client.getProducts({
            q: params.q,
            category: params.category,
            material: params.material,
            sort: params.sort || 'featured',
            min_price: params.min_price ? parseFloat(params.min_price) : undefined,
            max_price: params.max_price ? parseFloat(params.max_price) : undefined,
            page,
            page_size: PAGE_SIZE
        }),
        client.getCategories()
    ]);
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data : [];
    const pagination = productsResult.status === 'fulfilled' ? productsResult.value.pagination : null;
    const fetchError = productsResult.status === 'rejected' ? productsResult.reason.message : null;
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    // Build active filter chips
    const activeFilters = [];
    if (params.q) activeFilters.push({
        label: `"${params.q}"`,
        key: 'q'
    });
    if (params.category) activeFilters.push({
        label: params.category,
        key: 'category'
    });
    if (params.material) activeFilters.push({
        label: params.material,
        key: 'material'
    });
    if (params.min_price || params.max_price) {
        const label = params.min_price && params.max_price ? `$${params.min_price} – $${params.max_price}` : params.min_price ? `From $${params.min_price}` : `Up to $${params.max_price}`;
        activeFilters.push({
            label,
            key: 'price'
        });
    }
    const totalCount = pagination?.total ?? products.length;
    const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);
    // currentParams passed to Pagination so it can preserve existing filters
    const currentParams = {
        q: params.q,
        category: params.category,
        material: params.material,
        sort: params.sort,
        min_price: params.min_price,
        max_price: params.max_price
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative w-full h-[40vh] min-h-[350px] flex items-center justify-center text-white overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[2000ms] scale-105 hover:scale-100",
                        style: {
                            backgroundImage: `url('${settings.shop_hero_image_url}')`
                        }
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "z-10 text-center px-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg tracking-tight",
                                children: "Shop Fine Jewelry"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-base md:text-xl opacity-90 max-w-2xl mx-auto font-light tracking-wide drop-shadow-md",
                                children: "Discover bridal pieces, nautical-inspired designs, and custom creations."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-6 py-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col lg:flex-row gap-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                            className: "w-full lg:w-72 shrink-0 space-y-10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Suspense"], {
                                fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-96 bg-gray-50 rounded-2xl animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                    lineNumber: 125,
                                    columnNumber: 33
                                }, this),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ShopControls$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ShopControls"], {
                                    categories: categories,
                                    currentFilters: {
                                        q: params.q,
                                        category: params.category,
                                        material: params.material,
                                        sort: params.sort || 'featured',
                                        min_price: params.min_price,
                                        max_price: params.max_price
                                    },
                                    totalCount: totalCount,
                                    startItem: startItem,
                                    endItem: endItem,
                                    activeFilters: activeFilters,
                                    layout: "sidebar"
                                }, params.q || '__empty__', false, {
                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                lineNumber: 125,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                            className: "flex-grow",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap items-center gap-2",
                                            children: [
                                                activeFilters.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/shop?${new URLSearchParams(Object.fromEntries(Object.entries(currentParams).filter(([k])=>(f.key === 'price' ? k !== 'min_price' && k !== 'max_price' : k !== f.key) && k !== 'page').filter(([, v])=>v !== undefined))).toString()}`,
                                                        className: "inline-flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-accent hover:text-primary-dark transition-all border border-primary/10",
                                                        children: [
                                                            f.label,
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-base leading-none",
                                                                children: "×"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                                lineNumber: 164,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, f.key, true, {
                                                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 19
                                                    }, this)),
                                                activeFilters.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/shop",
                                                    className: "text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors ml-2",
                                                    children: "Clear All"
                                                }, void 0, false, {
                                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                    lineNumber: 168,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                            lineNumber: 150,
                                            columnNumber: 15
                                        }, this),
                                        totalCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground",
                                            children: [
                                                "Showing ",
                                                startItem,
                                                "–",
                                                endItem,
                                                " of ",
                                                totalCount,
                                                " piece",
                                                totalCount !== 1 ? 's' : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                            lineNumber: 178,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                    lineNumber: 149,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-h-[400px]",
                                    children: fetchError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-red-50 border border-red-100 rounded-2xl p-12 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-xl font-serif text-red-900 mb-2",
                                                children: "Connectivity Interruption"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 188,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-red-700/80 text-sm",
                                                children: fetchError
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 17
                                    }, this) : products.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-32 bg-stone-50 rounded-3xl border border-dashed border-stone-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-5xl mb-6 opacity-30 select-none",
                                                children: "💎"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 196,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-serif text-stone-900 mb-3",
                                                children: "No results matched your search"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 197,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-stone-500 mb-8 max-w-md mx-auto",
                                                children: "We couldn't find any pieces with your current filters. Try broadening your criteria or browsing all collections."
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 200,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/shop",
                                                className: "inline-flex bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all rounded-full shadow-lg",
                                                children: "Reset All Filters"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                                lineNumber: 203,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductGrid"], {
                                        products: products,
                                        columns: 3
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                    lineNumber: 185,
                                    columnNumber: 13
                                }, this),
                                pagination && pagination.pages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-16 pt-8 border-t border-primary/5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$Pagination$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Pagination"], {
                                        currentPage: page,
                                        totalPages: pagination.pages,
                                        hasNext: pagination.hasNext,
                                        hasPrev: pagination.hasPrev,
                                        currentParams: currentParams
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                        lineNumber: 219,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                                    lineNumber: 218,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-accent py-14 px-6 md:px-12 text-primary-dark text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl font-serif font-bold mb-3",
                        children: "Can't Find What You're Looking For?"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg opacity-90 mb-6",
                        children: "Contact our concierge team for custom orders and personalized consultations."
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/contact",
                        className: "inline-block bg-primary-dark text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors rounded",
                        children: "Schedule Consultation"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/shop/page.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/app/shop/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Galantesjewelry/app/shop/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__02pvp.m._.js.map