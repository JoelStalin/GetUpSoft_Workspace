module.exports = [
"[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CheckoutForm",
    ()=>CheckoutForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/@stripe/react-stripe-js/dist/react-stripe.esm.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function CheckoutForm({ customerData }) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStripe"])();
    const elements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useElements"])();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
                receipt_email: customerData.email
            }
        });
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }
        setIsLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        id: "payment-form",
        onSubmit: handleSubmit,
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PaymentElement"], {
                id: "payment-element",
                options: {
                    layout: 'tabs'
                }
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                disabled: isLoading || !stripe || !elements,
                id: "submit",
                className: "w-full bg-primary text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    id: "button-text",
                    children: isLoading ? "Processing..." : "Pay Now"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "payment-message",
                className: "text-red-600 text-sm mt-4 text-center font-semibold",
                children: message
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx",
                lineNumber: 59,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShippingSelector",
    ()=>ShippingSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function ShippingSelector({ address, orderValue, onRateSelect, excludePickup = false }) {
    const [rates, setRates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedRate, setSelectedRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchRates = async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/shipping/rates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address,
                        packageDetails: {
                            weightLbs: 1,
                            value: orderValue
                        }
                    })
                });
                const data = await res.json();
                if (data.success) {
                    const nextRates = excludePickup ? data.rates.filter((rate)=>rate.carrier !== 'pickup') : data.rates;
                    setRates(nextRates);
                    const defaultRate = nextRates.find((rate)=>rate.carrier !== 'pickup') || nextRates[0] || null;
                    if (defaultRate) {
                        setSelectedRate(defaultRate);
                        onRateSelect(defaultRate);
                    }
                } else {
                    setRates([]);
                    setSelectedRate(null);
                    setError(data.error || 'Unable to load shipping rates.');
                }
            } catch (error) {
                console.error('Failed to load shipping rates', error);
                setRates([]);
                setSelectedRate(null);
                setError('Unable to load shipping rates.');
            } finally{
                setLoading(false);
            }
        };
        if (address.zip && address.city) {
            fetchRates();
        }
    }, [
        address,
        orderValue,
        onRateSelect,
        excludePickup
    ]);
    const handleSelect = (rate)=>{
        setSelectedRate(rate);
        onRateSelect(rate);
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "animate-pulse space-y-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-12 bg-primary/5 rounded-lg w-full"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                    lineNumber: 70,
                    columnNumber: 53
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-12 bg-primary/5 rounded-lg w-full"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                    lineNumber: 70,
                    columnNumber: 112
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
            lineNumber: 70,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-bold uppercase tracking-widest text-primary",
                        children: "Delivery Method"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-bold text-accent uppercase tracking-tighter bg-accent/10 px-2 py-0.5 rounded",
                        children: "Insurance Included"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3",
                children: rates.map((rate)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>handleSelect(rate),
                        "data-testid": `shipping-rate-${rate.carrier}`,
                        className: `relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm ${selectedRate?.carrier === rate.carrier && selectedRate?.serviceName === rate.serviceName ? 'border-accent bg-accent/[0.03] ring-1 ring-accent' : 'border-primary/10 bg-white hover:border-primary/20'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-5 w-5 items-center justify-center rounded-full border border-primary/20 bg-white shadow-inner",
                                        children: selectedRate?.carrier === rate.carrier && selectedRate?.serviceName === rate.serviceName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-2.5 w-2.5 rounded-full bg-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                            lineNumber: 97,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                        lineNumber: 95,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-bold text-primary",
                                                children: rate.serviceName
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                                lineNumber: 101,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-muted-foreground",
                                                children: rate.carrier === 'pickup' ? 'Islamorada Boutique' : `Est. Delivery: ${rate.estimatedDays} business days`
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                                lineNumber: 102,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-serif font-bold text-primary",
                                        children: rate.price === 0 ? 'FREE' : `$${rate.price.toFixed(2)}`
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this),
                                    rate.price > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] uppercase tracking-tighter text-muted-foreground",
                                        children: [
                                            "Inc. $",
                                            rate.insuranceValue.toLocaleString(),
                                            " Coverage"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${rate.carrier}-${rate.serviceName}`, true, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-red-200 bg-red-50 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-widest text-red-700",
                        children: "Shipping unavailable"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-red-700",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this),
            selectedRate?.carrier === 'pickup' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-dashed border-accent/40 bg-accent/[0.02] p-4 animate-in fade-in slide-in-from-top-2 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-primary/70 leading-relaxed italic mb-3",
                        children: "For local pick-up, we require a scheduled security window to ensure your piece is ready and authenticated."
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 132,
                        columnNumber: 12
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/appointments?reason=pickup",
                        target: "_blank",
                        className: "inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-accent hover:underline",
                        children: "Schedule Collection Appointment →"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                        lineNumber: 135,
                        columnNumber: 12
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/lib/tax.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateTaxBreakdown",
    ()=>calculateTaxBreakdown
]);
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function normalizeState(value) {
    return (value || '').trim().toLowerCase();
}
function isDominicanRepublic(country) {
    return [
        'dominican republic',
        'republica dominicana',
        'república dominicana',
        'rd',
        'do'
    ].includes(country);
}
function isUnitedStates(country) {
    return [
        'united states',
        'united states of america',
        'usa',
        'us',
        'u.s.',
        'u.s.a.'
    ].includes(country);
}
function calculateTaxBreakdown({ subtotal, shippingTotal = 0, destination }) {
    const country = normalize(destination?.country);
    const state = normalizeState(destination?.state);
    const taxableAmount = subtotal + shippingTotal;
    let taxRate = 0;
    if (isDominicanRepublic(country)) {
        taxRate = 0.18;
    } else if (isUnitedStates(country) && (state === 'fl' || state === 'florida')) {
        taxRate = 0.07;
    }
    const taxTotal = Math.round(taxableAmount * taxRate * 100) / 100;
    const total = Math.round((taxableAmount + taxTotal) * 100) / 100;
    return {
        taxRate,
        taxTotal,
        total
    };
}
}),
"[project]/Galantesjewelry/lib/address-options.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "US_COUNTRY",
    ()=>US_COUNTRY,
    "US_STATE_OPTIONS",
    ()=>US_STATE_OPTIONS,
    "getCityOptions",
    ()=>getCityOptions,
    "getStateById",
    ()=>getStateById
]);
const US_COUNTRY = {
    id: 233,
    label: 'United States'
};
const US_STATE_OPTIONS = [
    {
        id: 10,
        code: 'FL',
        label: 'Florida',
        cities: [
            'Islamorada',
            'Miami',
            'Miami Beach',
            'Key Largo',
            'Marathon',
            'Orlando',
            'Tampa',
            'Key West'
        ]
    },
    {
        id: 33,
        code: 'NY',
        label: 'New York',
        cities: [
            'New York',
            'Brooklyn',
            'Queens',
            'Buffalo',
            'Rochester'
        ]
    },
    {
        id: 5,
        code: 'CA',
        label: 'California',
        cities: [
            'Los Angeles',
            'San Diego',
            'San Francisco',
            'Beverly Hills',
            'San Jose'
        ]
    },
    {
        id: 43,
        code: 'TX',
        label: 'Texas',
        cities: [
            'Houston',
            'Dallas',
            'Austin',
            'San Antonio',
            'Fort Worth'
        ]
    }
];
function getStateById(stateId) {
    return US_STATE_OPTIONS.find((state)=>state.id === stateId) || null;
}
function getCityOptions(stateId) {
    return getStateById(stateId)?.cities || [];
}
}),
"[project]/Galantesjewelry/app/checkout/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CheckoutPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$stripe$2d$js$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/@stripe/stripe-js/lib/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$stripe$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/@stripe/stripe-js/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/@stripe/react-stripe-js/dist/react-stripe.esm.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/context/shop/CartContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$checkout$2f$CheckoutForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/checkout/CheckoutForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$checkout$2f$ShippingSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/components/checkout/ShippingSelector.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$tax$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/tax.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/address-options.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
const stripePromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$stripe$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadStripe"])(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
const STORE_TAX_ADDRESS = {
    street: '82681 Overseas Highway',
    city: 'Islamorada',
    state: 'FL',
    zip: '33036',
    country: 'United States'
};
const PICKUP_RATE = {
    carrier: 'pickup',
    serviceName: 'Boutique Pick-up (Islamorada)',
    price: 0,
    currency: 'USD',
    estimatedDays: 0,
    insuranceIncluded: true,
    insuranceValue: 0
};
function addressLabel(address) {
    if (address.source === 'profile') return 'Default profile address';
    if (address.name) return address.name;
    if (address.type === 'delivery') return 'Shipping address';
    if (address.type === 'invoice') return 'Billing address';
    return 'Saved address';
}
function CheckoutPage() {
    const { items, totalCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$context$2f$shop$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCart"])();
    const [clientSecret, setClientSecret] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isReadyForPayment, setIsReadyForPayment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customerData, setCustomerData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        email: '',
        phone: '',
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].label,
        state_id: undefined,
        country_id: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].id
    });
    const [deliveryMethod, setDeliveryMethod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ship');
    const [savedAddresses, setSavedAddresses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedAddressId, setSelectedAddressId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('manual');
    const [accountStatus, setAccountStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('loading');
    const [selectedShippingRate, setSelectedShippingRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const subtotal = items.reduce((acc, item)=>acc + item.price * item.quantity, 0);
    const shippingAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            street: customerData.street,
            city: customerData.city,
            state: customerData.state,
            zip: customerData.zip,
            country: customerData.country
        }), [
        customerData.city,
        customerData.country,
        customerData.state,
        customerData.street,
        customerData.zip
    ]);
    const cityOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCityOptions"])(customerData.state_id), [
        customerData.state_id
    ]);
    const shippingTotal = selectedShippingRate?.price || 0;
    const tax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$tax$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTaxBreakdown"])({
        subtotal,
        shippingTotal,
        destination: deliveryMethod === 'pickup' ? STORE_TAX_ADDRESS : shippingAddress
    });
    const orderTotal = tax.total;
    const hasShippingAddress = Boolean(customerData.street && customerData.city && customerData.zip);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function loadCustomerCheckoutData() {
            try {
                const [profileResponse, addressesResponse] = await Promise.all([
                    fetch('/api/account/profile', {
                        cache: 'no-store'
                    }),
                    fetch('/api/account/addresses', {
                        cache: 'no-store'
                    })
                ]);
                if (cancelled) return;
                if (profileResponse.status === 401 && addressesResponse.status === 401) {
                    setAccountStatus('guest');
                    return;
                }
                setAccountStatus('signed-in');
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    const profile = profileData.profile || {};
                    const loadedState = profile.state_id?.[0] ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStateById"])(profile.state_id[0]) : null;
                    setCustomerData((current)=>({
                            ...current,
                            name: current.name || profile.name || '',
                            email: current.email || profile.email || '',
                            phone: current.phone || profile.phone || '',
                            street: current.street || profile.street || '',
                            street2: current.street2 || profile.street2 || '',
                            city: current.city || profile.city || '',
                            state: current.state || loadedState?.label || '',
                            zip: current.zip || profile.zip || '',
                            country: current.country || __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].label,
                            state_id: current.state_id || profile.state_id || undefined,
                            country_id: current.country_id || profile.country_id || __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].id
                        }));
                    if (profile.street && profile.city && profile.zip) {
                        setSavedAddresses((current)=>[
                                {
                                    id: 'profile',
                                    source: 'profile',
                                    name: 'Default profile address',
                                    phone: profile.phone,
                                    street: profile.street,
                                    street2: profile.street2,
                                    city: profile.city,
                                    zip: profile.zip,
                                    state_id: profile.state_id || undefined,
                                    country_id: profile.country_id || undefined
                                },
                                ...current.filter((address)=>address.id !== 'profile')
                            ]);
                        setSelectedAddressId((current)=>current === 'manual' ? 'profile' : current);
                    }
                }
                if (addressesResponse.ok) {
                    const addresses = await addressesResponse.json();
                    if (Array.isArray(addresses)) {
                        setSavedAddresses((current)=>{
                            const profileAddress = current.find((address)=>address.id === 'profile');
                            const nextAddresses = addresses.filter((address)=>address?.street && address?.city && address?.zip);
                            return profileAddress ? [
                                profileAddress,
                                ...nextAddresses
                            ] : nextAddresses;
                        });
                    }
                }
            } catch (error) {
                console.warn('Checkout account preload failed:', error);
                if (!cancelled) setAccountStatus('guest');
            }
        }
        void loadCustomerCheckoutData();
        return ()=>{
            cancelled = true;
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (deliveryMethod === 'pickup') {
            setSelectedShippingRate({
                ...PICKUP_RATE,
                insuranceValue: subtotal
            });
        } else {
            setSelectedShippingRate(null);
        }
    }, [
        deliveryMethod,
        subtotal
    ]);
    const handleRateSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((rate)=>{
        setSelectedShippingRate(rate);
    }, []);
    const applySavedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((address)=>{
        const loadedState = address.state_id?.[0] ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStateById"])(address.state_id[0]) : null;
        setSelectedAddressId(String(address.id));
        setCustomerData((current)=>({
                ...current,
                phone: current.phone || address.phone || '',
                street: address.street || '',
                street2: address.street2 || '',
                city: address.city || '',
                state: loadedState?.label || address.state_id?.[1] || '',
                state_id: address.state_id?.[0],
                zip: address.zip || '',
                country: address.country_id?.[1] || __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].label,
                country_id: address.country_id?.[0]
            }));
    }, []);
    const updateDeliveryMethod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((method)=>{
        setDeliveryMethod(method);
        setIsReadyForPayment(false);
    }, []);
    const useManualAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSelectedAddressId('manual');
        setCustomerData((current)=>({
                ...current,
                street: '',
                street2: '',
                city: '',
                state: '',
                zip: '',
                country: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].label,
                state_id: undefined,
                country_id: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].id
            }));
    }, []);
    const persistCheckoutAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (accountStatus !== 'signed-in' || deliveryMethod !== 'ship') {
            return;
        }
        const response = await fetch('/api/account/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: customerData.name,
                phone: customerData.phone,
                street: customerData.street,
                street2: customerData.street2,
                city: customerData.city,
                zip: customerData.zip,
                state_id: customerData.state_id,
                country_id: customerData.country_id || __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].id
            })
        });
        if (!response.ok) {
            const data = await response.json().catch(()=>({}));
            throw new Error(data.error || 'Unable to save the shipping address.');
        }
    }, [
        accountStatus,
        customerData.city,
        customerData.country_id,
        customerData.name,
        customerData.phone,
        customerData.state,
        customerData.state_id,
        customerData.street,
        customerData.street2,
        customerData.zip,
        deliveryMethod
    ]);
    const handleStartPayment = async (e)=>{
        e.preventDefault();
        if (!customerData.email || !customerData.name) {
            alert("Please provide at least name and email.");
            return;
        }
        if (deliveryMethod === 'ship' && !hasShippingAddress) {
            alert('Please choose or enter a shipping address.');
            return;
        }
        if (!selectedShippingRate) {
            alert(deliveryMethod === 'pickup' ? 'Please choose a fulfillment option.' : 'Please choose a shipping method.');
            return;
        }
        try {
            await persistCheckoutAddress();
            const response = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items,
                    customerData,
                    deliveryMethod,
                    shippingRate: selectedShippingRate
                })
            });
            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setIsReadyForPayment(true);
            } else {
                throw new Error(data.error || "Failed to initiate checkout");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to initiate checkout';
            console.error(error);
            alert(message);
        }
    };
    if (totalCount === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-4xl py-32 px-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-4xl font-serif mb-6",
                    children: "Your Cart is Empty"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                    lineNumber: 324,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/shop",
                    className: "underline",
                    children: "Go back to shop"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                    lineNumber: 325,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
            lineNumber: 323,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold uppercase tracking-[0.28em] text-accent",
                                children: "Secure Checkout"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 334,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "mt-2 text-4xl font-serif text-primary",
                                children: "Choose how you receive your jewelry"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 335,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 max-w-2xl text-sm leading-6 text-muted-foreground",
                                children: "Signed-in customers can reuse saved addresses. Local customers can choose boutique pickup and skip shipping details."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 336,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 333,
                        columnNumber: 9
                    }, this),
                    !isReadyForPayment ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleStartPayment,
                        className: "space-y-8 rounded-[2rem] border border-primary/10 bg-white p-6 shadow-sm md:p-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-xl font-serif text-primary",
                                                        children: "Contact Information"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 346,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-xs text-muted-foreground",
                                                        children: accountStatus === 'signed-in' ? 'We filled in what we know from your account. You can edit it for this order.' : accountStatus === 'loading' ? 'Checking for your saved account details...' : 'Checking out as guest. Sign in to reuse saved addresses.'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 347,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 345,
                                                columnNumber: 17
                                            }, this),
                                            accountStatus === 'guest' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/login?returnTo=/checkout",
                                                className: "text-xs font-bold uppercase tracking-widest text-accent hover:underline",
                                                children: "Sign in"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 356,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 344,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 gap-4 md:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Full Name",
                                                required: true,
                                                "data-testid": "checkout-name",
                                                className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                value: customerData.name,
                                                onChange: (e)=>setCustomerData({
                                                        ...customerData,
                                                        name: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 362,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "email",
                                                placeholder: "Email Address",
                                                required: true,
                                                "data-testid": "checkout-email",
                                                className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                value: customerData.email,
                                                onChange: (e)=>setCustomerData({
                                                        ...customerData,
                                                        email: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 368,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "tel",
                                                placeholder: "Phone Number",
                                                "data-testid": "checkout-phone",
                                                className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent md:col-span-2",
                                                value: customerData.phone,
                                                onChange: (e)=>setCustomerData({
                                                        ...customerData,
                                                        phone: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 374,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 361,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 343,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-serif text-primary",
                                        children: "Fulfillment"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 384,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-3 md:grid-cols-2",
                                        children: [
                                            [
                                                'ship',
                                                'Ship insured',
                                                'Secure carrier delivery with insured rates.'
                                            ],
                                            [
                                                'pickup',
                                                'Boutique pickup',
                                                'Pick up in Islamorada by appointment.'
                                            ]
                                        ].map(([method, title, description])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>updateDeliveryMethod(method),
                                                "data-testid": `delivery-method-${method}`,
                                                className: `rounded-2xl border p-4 text-left transition ${deliveryMethod === method ? 'border-accent bg-accent/[0.04] ring-1 ring-accent' : 'border-primary/10 bg-primary/[0.015] hover:border-primary/25'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold uppercase tracking-widest text-primary",
                                                        children: title
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 401,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-2 block text-xs leading-5 text-muted-foreground",
                                                        children: description
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, method, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 390,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 383,
                                columnNumber: 13
                            }, this),
                            deliveryMethod === 'ship' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "space-y-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-xl font-serif text-primary",
                                                children: "Shipping Address"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 411,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-muted-foreground",
                                                children: "Choose a saved address or enter a new one for this order."
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 410,
                                        columnNumber: 17
                                    }, this),
                                    savedAddresses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-3 md:grid-cols-2",
                                        children: [
                                            savedAddresses.map((address)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>applySavedAddress(address),
                                                    "data-testid": `checkout-address-${address.id}`,
                                                    className: `rounded-2xl border p-4 text-left transition ${selectedAddressId === String(address.id) ? 'border-accent bg-accent/[0.04] ring-1 ring-accent' : 'border-primary/10 bg-white hover:border-primary/25'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-bold uppercase tracking-widest text-primary",
                                                            children: addressLabel(address)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 429,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-2 block text-sm text-primary",
                                                            children: address.street
                                                        }, void 0, false, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 430,
                                                            columnNumber: 25
                                                        }, this),
                                                        address.street2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-xs text-muted-foreground",
                                                            children: address.street2
                                                        }, void 0, false, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 431,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-xs text-muted-foreground",
                                                            children: [
                                                                address.city,
                                                                ", ",
                                                                address.state_id?.[1] || '',
                                                                " ",
                                                                address.zip
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 432,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, address.id, true, {
                                                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 23
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: useManualAddress,
                                                className: `rounded-2xl border border-dashed p-4 text-left transition ${selectedAddressId === 'manual' ? 'border-accent bg-accent/[0.04] ring-1 ring-accent' : 'border-primary/10 hover:border-primary/25'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold uppercase tracking-widest text-primary",
                                                        children: "Use a new address"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 444,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-2 block text-xs text-muted-foreground",
                                                        children: "Enter or adjust the delivery address below."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 445,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 435,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 416,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Street Address",
                                                required: deliveryMethod === 'ship',
                                                "data-testid": "checkout-street",
                                                className: "w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                value: customerData.street,
                                                onChange: (e)=>setCustomerData({
                                                        ...customerData,
                                                        street: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 451,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Apt / Suite / Unit (optional)",
                                                "data-testid": "checkout-street2",
                                                className: "w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                value: customerData.street2,
                                                onChange: (e)=>setCustomerData({
                                                        ...customerData,
                                                        street2: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 460,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid gap-4 md:grid-cols-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground",
                                                                htmlFor: "checkout-state",
                                                                children: "State"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 471,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "checkout-state",
                                                                "data-testid": "checkout-state",
                                                                className: "w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                                value: customerData.state_id || '',
                                                                onChange: (e)=>{
                                                                    const nextStateId = Number.parseInt(e.target.value, 10);
                                                                    const nextState = Number.isFinite(nextStateId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStateById"])(nextStateId) : null;
                                                                    setCustomerData((current)=>({
                                                                            ...current,
                                                                            state_id: Number.isFinite(nextStateId) ? nextStateId : undefined,
                                                                            state: nextState?.label || '',
                                                                            city: nextState?.cities.includes(current.city) ? current.city : ''
                                                                        }));
                                                                },
                                                                required: deliveryMethod === 'ship',
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select State"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                        lineNumber: 491,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_STATE_OPTIONS"].map((state)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: state.id,
                                                                            children: state.label
                                                                        }, state.id, false, {
                                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                            lineNumber: 493,
                                                                            columnNumber: 27
                                                                        }, this))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 474,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 470,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground",
                                                                htmlFor: "checkout-city",
                                                                children: "City"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 499,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "checkout-city",
                                                                "data-testid": "checkout-city",
                                                                className: "w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-primary/[0.02]",
                                                                value: customerData.city,
                                                                onChange: (e)=>setCustomerData({
                                                                        ...customerData,
                                                                        city: e.target.value
                                                                    }),
                                                                required: deliveryMethod === 'ship',
                                                                disabled: !customerData.state_id,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: customerData.state_id ? 'Select City' : 'Select a state first'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                        lineNumber: 511,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    cityOptions.map((city)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: city,
                                                                            children: city
                                                                        }, city, false, {
                                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                            lineNumber: 513,
                                                                            columnNumber: 27
                                                                        }, this))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 502,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 498,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground",
                                                                htmlFor: "checkout-zip",
                                                                children: "ZIP Code"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 519,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                id: "checkout-zip",
                                                                type: "text",
                                                                placeholder: "33036",
                                                                required: deliveryMethod === 'ship',
                                                                "data-testid": "checkout-zip",
                                                                className: "w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                                value: customerData.zip,
                                                                onChange: (e)=>setCustomerData({
                                                                        ...customerData,
                                                                        zip: e.target.value
                                                                    })
                                                            }, void 0, false, {
                                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                                lineNumber: 522,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "rounded-xl border border-primary/10 bg-primary/[0.02] p-3 text-xs text-muted-foreground md:self-end",
                                                        children: [
                                                            "Country: ",
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$address$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["US_COUNTRY"].label
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 534,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 469,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 450,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$checkout$2f$ShippingSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShippingSelector"], {
                                            address: shippingAddress,
                                            orderValue: subtotal,
                                            onRateSelect: handleRateSelect,
                                            excludePickup: true
                                        }, void 0, false, {
                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                            lineNumber: 541,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 540,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 409,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-accent/30 bg-accent/[0.035] p-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-serif text-primary",
                                        children: "Boutique Pickup"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 551,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm leading-6 text-primary/70",
                                        children: "No shipping address needed. After payment, our team will prepare the piece and coordinate a secure pickup window at the Islamorada boutique."
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 552,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/contact",
                                        className: "mt-4 inline-flex text-xs font-bold uppercase tracking-widest text-accent hover:underline",
                                        children: "Need a specific pickup time?"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 555,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 550,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: !selectedShippingRate,
                                "data-testid": "checkout-continue",
                                className: "mt-2 w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/40",
                                children: !selectedShippingRate ? deliveryMethod === 'pickup' ? 'Choose Pickup' : 'Select Shipping Method' : 'Continue to Payment'
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 564,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 342,
                        columnNumber: 11
                    }, this) : clientSecret ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white p-8 border border-primary/10 rounded-lg shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-serif mb-8 text-primary",
                                children: "Payment Details"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 577,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$react$2d$stripe$2d$js$2f$dist$2f$react$2d$stripe$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Elements"], {
                                stripe: stripePromise,
                                options: {
                                    clientSecret
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$components$2f$checkout$2f$CheckoutForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CheckoutForm"], {
                                    customerData: customerData
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                    lineNumber: 579,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 578,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsReadyForPayment(false),
                                className: "mt-6 text-sm text-gray-500 underline",
                                children: "Edit shipping info"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 581,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 576,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                lineNumber: 332,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-primary/5 p-8 rounded-lg h-fit border border-primary/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-serif mb-6 text-primary",
                        children: "Order Summary"
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 593,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4",
                        children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-4 items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative h-12 w-12 overflow-hidden rounded bg-gray-100",
                                                children: (item.image_url || item.id) && // Product images are served through a local API query string; next/image localPatterns intentionally block broad query optimization.
                                                // eslint-disable-next-line @next/next/no-img-element
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: item.image_url || `/api/products/image?id=${item.id}`,
                                                    alt: item.name,
                                                    "data-testid": `checkout-product-image-${item.id}`,
                                                    className: "h-full w-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    item.name,
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-400",
                                                        children: [
                                                            "x",
                                                            item.quantity
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 610,
                                                        columnNumber: 35
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 610,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 597,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        children: [
                                            "$",
                                            (item.price * item.quantity).toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 612,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, item.id, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 596,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 594,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-primary/10 pt-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "Subtotal"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 618,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        children: [
                                            "$",
                                            subtotal.toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 619,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 617,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "Shipping"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 622,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        "data-testid": "checkout-shipping-total",
                                        children: selectedShippingRate ? shippingTotal === 0 ? 'FREE' : `$${shippingTotal.toFixed(2)}` : 'Choose at checkout'
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 623,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 621,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "Tax"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 628,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        "data-testid": "checkout-tax-total",
                                        children: [
                                            "$",
                                            tax.taxTotal.toFixed(2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 629,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 627,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-xl font-bold border-t border-primary/10 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Total (Estimated)"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 634,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-testid": "checkout-total",
                                        children: [
                                            "$",
                                            orderTotal.toLocaleString(undefined, {
                                                minimumFractionDigits: selectedShippingRate ? 2 : 0,
                                                maximumFractionDigits: 2
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 635,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 633,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 616,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                lineNumber: 592,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
        lineNumber: 331,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Galantesjewelry_02n1web._.js.map