(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Galantesjewelry/components/FeaturedCarousel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeaturedCarousel",
    ()=>FeaturedCarousel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function FeaturedCarousel({ items }) {
    _s();
    const [startIndex, setStartIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [fade, setFade] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Auto-rotate every 5 seconds if there are more than 3 items
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeaturedCarousel.useEffect": ()=>{
            if (items.length <= 3) return;
            const interval = setInterval({
                "FeaturedCarousel.useEffect.interval": ()=>{
                    setFade(false);
                    setTimeout({
                        "FeaturedCarousel.useEffect.interval": ()=>{
                            setStartIndex({
                                "FeaturedCarousel.useEffect.interval": (prev)=>(prev + 1) % items.length
                            }["FeaturedCarousel.useEffect.interval"]);
                            setFade(true);
                        }
                    }["FeaturedCarousel.useEffect.interval"], 300); // 300ms fade out
                }
            }["FeaturedCarousel.useEffect.interval"], 5000);
            return ({
                "FeaturedCarousel.useEffect": ()=>clearInterval(interval)
            })["FeaturedCarousel.useEffect"];
        }
    }["FeaturedCarousel.useEffect"], [
        items.length
    ]);
    if (!items || items.length === 0) return null;
    // Render a slice of up to 3 items circularly
    const visibleItems = [];
    for(let i = 0; i < Math.min(3, items.length); i++){
        visibleItems.push(items[(startIndex + i) % items.length]);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid grid-cols-1 md:grid-cols-3 gap-12 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`,
                children: visibleItems.map((feat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "data-testid": `featured-public-card-${feat.id}`,
                        "data-title": feat.title,
                        className: "flex flex-col items-center text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-80 bg-stone-100 mb-6 relative overflow-hidden group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-testid": `featured-public-image-${feat.id}`,
                                    "data-image-url": feat.image_url,
                                    className: "absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105",
                                    style: {
                                        backgroundImage: `url('${feat.image_url}')`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                                    lineNumber: 37,
                                    columnNumber: 20
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                                lineNumber: 36,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-2xl mb-3",
                                children: feat.title
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                                lineNumber: 44,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "opacity-70 text-sm mb-4",
                                children: feat.content_text
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                                lineNumber: 45,
                                columnNumber: 17
                            }, this),
                            feat.action_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: feat.action_link || "#",
                                className: "text-primary font-semibold uppercase tracking-wider text-xs border-b border-primary pb-1",
                                children: feat.action_text
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                                lineNumber: 47,
                                columnNumber: 20
                            }, this)
                        ]
                    }, `${feat.id}-${startIndex}-${i}`, true, {
                        fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                        lineNumber: 35,
                        columnNumber: 14
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                lineNumber: 33,
                columnNumber: 8
            }, this),
            items.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center gap-3 mt-12",
                children: items.map((_, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        "data-testid": `featured-dot-${idx}`,
                        onClick: ()=>{
                            setFade(false);
                            setTimeout(()=>{
                                setStartIndex(idx);
                                setFade(true);
                            }, 300);
                        },
                        className: `h-2 rounded-full transition-all duration-300 ${idx === startIndex ? 'bg-primary w-8' : 'bg-primary/20 w-2 hover:bg-primary/50'}`,
                        "aria-label": `Ver colección ${idx + 1}`
                    }, idx, false, {
                        fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                        lineNumber: 58,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
                lineNumber: 56,
                columnNumber: 10
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/components/FeaturedCarousel.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(FeaturedCarousel, "ScbfxGZvzAWx38Vr7pOx19OQAYw=");
_c = FeaturedCarousel;
var _c;
__turbopack_context__.k.register(_c, "FeaturedCarousel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Galantesjewelry/components/shop/ProductCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/context/shop/CartContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ProductCard({ product }) {
    _s();
    const { addItem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const isOutOfStock = product.availability === 'out_of_stock';
    const isPreorder = product.availability === 'preorder';
    const productHref = `/shop/${product.slug}`;
    const handleAddToCart = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.imageUrl
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "group relative h-full rounded-lg bg-white shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: productHref,
                "aria-label": product.name,
                className: "block h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative h-72 bg-gray-100 overflow-hidden flex-shrink-0",
                            children: [
                                product.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: product.imageUrl,
                                    alt: product.name,
                                    fill: true,
                                    unoptimized: true,
                                    className: "object-cover group-hover:scale-105 transition-transform duration-300",
                                    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-full flex items-center justify-center bg-gray-200 text-gray-400",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm select-none",
                                        children: "No image available"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                        lineNumber: 49,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 48,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-3 right-3 flex flex-col items-end gap-1.5",
                                    children: [
                                        product.isFeatured && !isOutOfStock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-accent text-primary-dark text-xs font-bold px-2.5 py-1 rounded",
                                            children: "Featured"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                            lineNumber: 56,
                                            columnNumber: 17
                                        }, this),
                                        isOutOfStock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded",
                                            children: "Out of Stock"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                            lineNumber: 61,
                                            columnNumber: 17
                                        }, this),
                                        isPreorder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded",
                                            children: "Pre-order"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                            lineNumber: 66,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 flex flex-col flex-1",
                            children: [
                                product.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs uppercase text-gray-500 font-semibold mb-1 tracking-wider",
                                    children: product.category
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-base font-serif font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug",
                                    children: product.name
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 81,
                                    columnNumber: 13
                                }, this),
                                (product.tagline || product.shortDescription) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed",
                                    children: product.tagline || product.shortDescription
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-auto text-lg font-bold text-gray-900 block mb-3",
                                    children: new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: product.currency || 'USD'
                                    }).format(product.price)
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleAddToCart,
                    disabled: isOutOfStock,
                    className: `w-full py-2.5 px-4 text-xs uppercase tracking-widest font-bold rounded transition-all duration-200 ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-accent hover:text-primary-dark shadow-sm hover:shadow-md'}`,
                    children: isOutOfStock ? 'Out of Stock' : 'Add to Cart'
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/components/shop/ProductCard.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(ProductCard, "3LNLw4tPbVBVCiFLdiRUbDVWYfc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"]
    ];
});
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Galantesjewelry/components/shop/ProductGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGrid",
    ()=>ProductGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/shop/ProductCard.tsx [app-client] (ecmascript)");
'use client';
;
;
function ProductGrid({ products, isLoading = false, columns = 3 }) {
    const colsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns];
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `grid ${colsClass} gap-6 auto-rows-max`,
            children: Array.from({
                length: 6
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-200 rounded-lg h-96 animate-pulse"
                }, i, false, {
                    fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
                    lineNumber: 28,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    if (products.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "No products found"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600",
                    children: "Try adjusting your filters or browse our other collections."
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `grid ${colsClass} gap-6 auto-rows-max`,
        children: products.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$shop$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
                product: product
            }, product.id, false, {
                fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/Galantesjewelry/components/shop/ProductGrid.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_c = ProductGrid;
var _c;
__turbopack_context__.k.register(_c, "ProductGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Galantesjewelry_components_102bbrn._.js.map