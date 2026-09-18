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
"[project]/Galantesjewelry/app/collections/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CollectionsPage,
    "dynamic",
    ()=>dynamic,
    "metadata",
    ()=>metadata,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-rsc] (ecmascript)");
;
;
;
const metadata = {
    title: "Collections | Galante's Jewelry"
};
const revalidate = 3600;
const dynamic = 'force-dynamic';
async function CollectionsPage() {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOdooClient"])();
    let featuredProducts = [];
    let errorMessage = '';
    try {
        featuredProducts = await client.getFeaturedProducts(8);
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unable to load featured collections at this time.';
        console.error('Collections page error:', error);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto py-24 px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm uppercase tracking-[0.35em] text-accent mb-4",
                        children: "Collections"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl font-serif font-bold text-gray-900",
                        children: "Celebrate Timeless Design"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-lg text-gray-600 max-w-3xl mx-auto",
                        children: "Explore the most sought-after pieces from our Odoo-powered collection, selected for craftsmanship, heritage, and luminous appeal."
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            errorMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl border border-red-200 bg-red-50 px-8 py-10 text-center text-red-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-semibold mb-3",
                        children: "Unable to load collections"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: errorMessage
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this) : featuredProducts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductGrid"], {
                products: featuredProducts,
                columns: 3
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl border border-gray-200 bg-gray-50 px-8 py-10 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-semibold mb-3",
                        children: "No featured products available yet"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Our latest jewelry pieces are being prepared. Please check back soon or contact our concierge for help."
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-20 grid gap-16 md:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-3xl bg-stone-950 p-10 text-white",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-3xl font-semibold mb-4",
                                children: "Need help choosing?"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm leading-relaxed opacity-90 mb-6",
                                children: "Our team can guide you through custom orders, ring sizing, and special requests with a concierge experience aligned to the Galante's Jewelry aesthetic."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/contact",
                                className: "inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-primary-dark hover:bg-accent-light transition-colors",
                                children: "Contact Concierge"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-3xl border border-stone-200 p-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-3xl font-semibold mb-4",
                                children: "Odoo as source of truth"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm leading-relaxed text-gray-600",
                                children: "This page is powered by live product data from Odoo 19, including pricing, stock availability, and purchase links. There is no duplicated catalog in the CMS."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/collections/page.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/app/collections/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Galantesjewelry/app/collections/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0-921w1._.js.map