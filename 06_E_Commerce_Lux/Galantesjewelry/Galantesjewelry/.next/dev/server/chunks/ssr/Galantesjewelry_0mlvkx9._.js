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
        country: 'United States'
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
                    setCustomerData((current)=>({
                            ...current,
                            name: current.name || profile.name || '',
                            email: current.email || profile.email || '',
                            phone: current.phone || profile.phone || '',
                            street: current.street || profile.street || '',
                            street2: current.street2 || profile.street2 || '',
                            city: current.city || profile.city || '',
                            state: current.state || profile.state_name || '',
                            zip: current.zip || profile.zip || '',
                            country: current.country || profile.country_name || 'United States'
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
                                    state_id: profile.state_id && profile.state_name ? [
                                        profile.state_id,
                                        profile.state_name
                                    ] : undefined,
                                    country_id: profile.country_id && profile.country_name ? [
                                        profile.country_id,
                                        profile.country_name
                                    ] : undefined
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
        setSelectedAddressId(String(address.id));
        setCustomerData((current)=>({
                ...current,
                phone: current.phone || address.phone || '',
                street: address.street || '',
                street2: address.street2 || '',
                city: address.city || '',
                state: address.state_id?.[1] || '',
                zip: address.zip || '',
                country: address.country_id?.[1] || 'United States'
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
                country: 'United States'
            }));
    }, []);
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
                    lineNumber: 271,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/shop",
                    className: "underline",
                    children: "Go back to shop"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                    lineNumber: 272,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
            lineNumber: 270,
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
                                lineNumber: 281,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "mt-2 text-4xl font-serif text-primary",
                                children: "Choose how you receive your jewelry"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 282,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 max-w-2xl text-sm leading-6 text-muted-foreground",
                                children: "Signed-in customers can reuse saved addresses. Local customers can choose boutique pickup and skip shipping details."
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 280,
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
                                                        lineNumber: 293,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-xs text-muted-foreground",
                                                        children: accountStatus === 'signed-in' ? 'We filled in what we know from your account. You can edit it for this order.' : accountStatus === 'loading' ? 'Checking for your saved account details...' : 'Checking out as guest. Sign in to reuse saved addresses.'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 292,
                                                columnNumber: 17
                                            }, this),
                                            accountStatus === 'guest' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/login?returnTo=/checkout",
                                                className: "text-xs font-bold uppercase tracking-widest text-accent hover:underline",
                                                children: "Sign in"
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 303,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 291,
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
                                                lineNumber: 309,
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
                                                lineNumber: 315,
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
                                                lineNumber: 321,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 308,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 290,
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
                                        lineNumber: 331,
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
                                                        lineNumber: 348,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-2 block text-xs leading-5 text-muted-foreground",
                                                        children: description
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, method, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 337,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 332,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 330,
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
                                                lineNumber: 358,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-muted-foreground",
                                                children: "Choose a saved address or enter a new one for this order."
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 359,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 357,
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
                                                            lineNumber: 376,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-2 block text-sm text-primary",
                                                            children: address.street
                                                        }, void 0, false, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 377,
                                                            columnNumber: 25
                                                        }, this),
                                                        address.street2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-xs text-muted-foreground",
                                                            children: address.street2
                                                        }, void 0, false, {
                                                            fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                            lineNumber: 378,
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
                                                            lineNumber: 379,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, address.id, true, {
                                                    fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                    lineNumber: 365,
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
                                                        lineNumber: 391,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-2 block text-xs text-muted-foreground",
                                                        children: "Enter or adjust the delivery address below."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 392,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 382,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 363,
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
                                                lineNumber: 398,
                                                columnNumber: 17
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
                                                lineNumber: 404,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "City",
                                                        required: deliveryMethod === 'ship',
                                                        "data-testid": "checkout-city",
                                                        className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                        value: customerData.city,
                                                        onChange: (e)=>setCustomerData({
                                                                ...customerData,
                                                                city: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 411,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Zip Code",
                                                        required: deliveryMethod === 'ship',
                                                        "data-testid": "checkout-zip",
                                                        className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                        value: customerData.zip,
                                                        onChange: (e)=>setCustomerData({
                                                                ...customerData,
                                                                zip: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "State",
                                                        "data-testid": "checkout-state",
                                                        className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                        value: customerData.state,
                                                        onChange: (e)=>setCustomerData({
                                                                ...customerData,
                                                                state: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Country",
                                                        "data-testid": "checkout-country",
                                                        className: "rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent",
                                                        value: customerData.country,
                                                        onChange: (e)=>setCustomerData({
                                                                ...customerData,
                                                                country: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                        lineNumber: 429,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 410,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 397,
                                        columnNumber: 15
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
                                            lineNumber: 439,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 438,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 356,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-accent/30 bg-accent/[0.035] p-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-serif text-primary",
                                        children: "Boutique Pickup"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 449,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm leading-6 text-primary/70",
                                        children: "No shipping address needed. After payment, our team will prepare the piece and coordinate a secure pickup window at the Islamorada boutique."
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 450,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/contact",
                                        className: "mt-4 inline-flex text-xs font-bold uppercase tracking-widest text-accent hover:underline",
                                        children: "Need a specific pickup time?"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 453,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 448,
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
                                lineNumber: 462,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 289,
                        columnNumber: 11
                    }, this) : clientSecret ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white p-8 border border-primary/10 rounded-lg shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-serif mb-8 text-primary",
                                children: "Payment Details"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 475,
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
                                    lineNumber: 477,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 476,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsReadyForPayment(false),
                                className: "mt-6 text-sm text-gray-500 underline",
                                children: "Edit shipping info"
                            }, void 0, false, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 479,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 474,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                lineNumber: 279,
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
                        lineNumber: 491,
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
                                                    lineNumber: 500,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 496,
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
                                                        lineNumber: 508,
                                                        columnNumber: 35
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                                lineNumber: 508,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 495,
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
                                        lineNumber: 510,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, item.id, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 494,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 492,
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
                                        lineNumber: 516,
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
                                        lineNumber: 517,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 515,
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
                                        lineNumber: 520,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        "data-testid": "checkout-shipping-total",
                                        children: selectedShippingRate ? shippingTotal === 0 ? 'FREE' : `$${shippingTotal.toFixed(2)}` : 'Choose at checkout'
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 521,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 519,
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
                                        lineNumber: 526,
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
                                        lineNumber: 527,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 525,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-xl font-bold border-t border-primary/10 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Total (Estimated)"
                                    }, void 0, false, {
                                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                        lineNumber: 532,
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
                                        lineNumber: 533,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                                lineNumber: 531,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                        lineNumber: 514,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
                lineNumber: 490,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Galantesjewelry/app/checkout/page.tsx",
        lineNumber: 278,
        columnNumber: 5
    }, this);
}
}),
"[project]/Galantesjewelry/node_modules/@stripe/stripe-js/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadStripe",
    ()=>loadStripe
]);
function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
var RELEASE_TRAIN = 'dahlia';
var runtimeVersionToUrlVersion = function runtimeVersionToUrlVersion(version) {
    return version === 3 ? 'v3' : version;
};
var ORIGIN = 'https://js.stripe.com';
var STRIPE_JS_URL = "".concat(ORIGIN, "/").concat(RELEASE_TRAIN, "/stripe.js");
var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
var STRIPE_JS_URL_REGEX = /^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;
var EXISTING_SCRIPT_MESSAGE = 'loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used';
var isStripeJSURL = function isStripeJSURL(url) {
    return V3_URL_REGEX.test(url) || STRIPE_JS_URL_REGEX.test(url);
};
var findScript = function findScript() {
    var scripts = document.querySelectorAll("script[src^=\"".concat(ORIGIN, "\"]"));
    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i];
        if (!isStripeJSURL(script.src)) {
            continue;
        }
        return script;
    }
    return null;
};
var injectScript = function injectScript(params) {
    var queryString = params && !params.advancedFraudSignals ? '?advancedFraudSignals=false' : '';
    var script = document.createElement('script');
    script.src = "".concat(STRIPE_JS_URL).concat(queryString);
    var headOrBody = document.head || document.body;
    if (!headOrBody) {
        throw new Error('Expected document.body not to be null. Stripe.js requires a <body> element.');
    }
    headOrBody.appendChild(script);
    return script;
};
var registerWrapper = function registerWrapper(stripe, startTime) {
    if (!stripe || !stripe._registerWrapper) {
        return;
    }
    stripe._registerWrapper({
        name: 'stripe-js',
        version: "9.2.0",
        startTime: startTime
    });
};
var stripePromise$1 = null;
var onErrorListener = null;
var onLoadListener = null;
var onError = function onError(reject) {
    return function(cause) {
        reject(new Error('Failed to load Stripe.js', {
            cause: cause
        }));
    };
};
var onLoad = function onLoad(resolve, reject) {
    return function() {
        if (window.Stripe) {
            resolve(window.Stripe);
        } else {
            reject(new Error('Stripe.js not available'));
        }
    };
};
var loadScript = function loadScript(params) {
    // Ensure that we only attempt to load Stripe.js at most once
    if (stripePromise$1 !== null) {
        return stripePromise$1;
    }
    stripePromise$1 = new Promise(function(resolve, reject) {
        if ("TURBOPACK compile-time truthy", 1) {
            // Resolve to null when imported server side. This makes the module
            // safe to import in an isomorphic code base.
            resolve(null);
            return;
        }
        //TURBOPACK unreachable
        ;
        var script;
        var _script$parentNode;
    }); // Resets stripePromise on error
    return stripePromise$1["catch"](function(error) {
        stripePromise$1 = null;
        return Promise.reject(error);
    });
};
var initStripe = function initStripe(maybeStripe, args, startTime) {
    if (maybeStripe === null) {
        return null;
    }
    var pk = args[0];
    if (typeof pk !== 'string') {
        throw new Error("Expected publishable key to be of type string, got type ".concat(_typeof(pk), " instead."));
    }
    var isTestKey = pk.match(/^pk_test/); // @ts-expect-error this is not publicly typed
    var version = runtimeVersionToUrlVersion(maybeStripe.version);
    var expectedVersion = RELEASE_TRAIN;
    if (isTestKey && version !== expectedVersion) {
        console.warn("Stripe.js@".concat(version, " was loaded on the page, but @stripe/stripe-js@").concat("9.2.0", " expected Stripe.js@").concat(expectedVersion, ". This may result in unexpected behavior. For more information, see https://docs.stripe.com/sdks/stripejs-versioning"));
    }
    var stripe = maybeStripe.apply(undefined, args);
    registerWrapper(stripe, startTime);
    return stripe;
}; // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
var stripePromise;
var loadCalled = false;
var getStripePromise = function getStripePromise() {
    if (stripePromise) {
        return stripePromise;
    }
    stripePromise = loadScript(null)["catch"](function(error) {
        // clear cache on error
        stripePromise = null;
        return Promise.reject(error);
    });
    return stripePromise;
}; // Execute our own script injection after a tick to give users time to do their
// own script injection.
Promise.resolve().then(function() {
    return getStripePromise();
})["catch"](function(error) {
    if (!loadCalled) {
        console.warn(error);
    }
});
var loadStripe = function loadStripe() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    loadCalled = true;
    var startTime = Date.now(); // if previous attempts are unsuccessful, will re-load script
    return getStripePromise().then(function(maybeStripe) {
        return initStripe(maybeStripe, args, startTime);
    });
};
;
}),
"[project]/Galantesjewelry/node_modules/@stripe/stripe-js/lib/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f40$stripe$2f$stripe$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/@stripe/stripe-js/dist/index.mjs [app-ssr] (ecmascript)");
;
}),
"[project]/Galantesjewelry/node_modules/react-is/cjs/react-is.development.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ if ("TURBOPACK compile-time truthy", 1) {
    (function() {
        'use strict';
        // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
        // nor polyfill, then a plain number is used for performance.
        var hasSymbol = typeof Symbol === 'function' && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
        // (unstable) APIs that have been removed. Can we remove the symbols?
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;
        function isValidElementType(type) {
            return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
            type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
            if (typeof object === 'object' && object !== null) {
                var $$typeof = object.$$typeof;
                switch($$typeof){
                    case REACT_ELEMENT_TYPE:
                        var type = object.type;
                        switch(type){
                            case REACT_ASYNC_MODE_TYPE:
                            case REACT_CONCURRENT_MODE_TYPE:
                            case REACT_FRAGMENT_TYPE:
                            case REACT_PROFILER_TYPE:
                            case REACT_STRICT_MODE_TYPE:
                            case REACT_SUSPENSE_TYPE:
                                return type;
                            default:
                                var $$typeofType = type && type.$$typeof;
                                switch($$typeofType){
                                    case REACT_CONTEXT_TYPE:
                                    case REACT_FORWARD_REF_TYPE:
                                    case REACT_LAZY_TYPE:
                                    case REACT_MEMO_TYPE:
                                    case REACT_PROVIDER_TYPE:
                                        return $$typeofType;
                                    default:
                                        return $$typeof;
                                }
                        }
                    case REACT_PORTAL_TYPE:
                        return $$typeof;
                }
            }
            return undefined;
        } // AsyncMode is deprecated along with isAsyncMode
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated
        function isAsyncMode(object) {
            {
                if (!hasWarnedAboutDeprecatedIsAsyncMode) {
                    hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint
                    console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
                }
            }
            return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
            return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
            return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
            return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
            return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
            return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
            return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
            return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
            return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
            return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
            return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
            return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
            return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
    })();
}
}),
"[project]/Galantesjewelry/node_modules/react-is/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/react-is/cjs/react-is.development.js [app-ssr] (ecmascript)");
}
}),
"[project]/Galantesjewelry/node_modules/object-assign/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/ /* eslint-disable no-unused-vars */ var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
}
function shouldUseNative() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Detect buggy property enumeration order in older V8 versions.
        // https://bugs.chromium.org/p/v8/issues/detail?id=4118
        var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
        test1[5] = 'de';
        if (Object.getOwnPropertyNames(test1)[0] === '5') {
            return false;
        }
        // https://bugs.chromium.org/p/v8/issues/detail?id=3056
        var test2 = {};
        for(var i = 0; i < 10; i++){
            test2['_' + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
            return test2[n];
        });
        if (order2.join('') !== '0123456789') {
            return false;
        }
        // https://bugs.chromium.org/p/v8/issues/detail?id=3056
        var test3 = {};
        'abcdefghijklmnopqrst'.split('').forEach(function(letter) {
            test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
            return false;
        }
        return true;
    } catch (err) {
        // We don't expect any of the above to throw, but better to be safe.
        return false;
    }
}
module.exports = shouldUseNative() ? Object.assign : function(target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for(var s = 1; s < arguments.length; s++){
        from = Object(arguments[s]);
        for(var key in from){
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
        if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for(var i = 0; i < symbols.length; i++){
                if (propIsEnumerable.call(from, symbols[i])) {
                    to[symbols[i]] = from[symbols[i]];
                }
            }
        }
    }
    return to;
};
}),
"[project]/Galantesjewelry/node_modules/prop-types/lib/ReactPropTypesSecret.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
module.exports = ReactPropTypesSecret;
}),
"[project]/Galantesjewelry/node_modules/prop-types/lib/has.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
}),
"[project]/Galantesjewelry/node_modules/prop-types/checkPropTypes.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var printWarning = function() {};
if ("TURBOPACK compile-time truthy", 1) {
    var ReactPropTypesSecret = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/lib/ReactPropTypesSecret.js [app-ssr] (ecmascript)");
    var loggedTypeFailures = {};
    var has = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/lib/has.js [app-ssr] (ecmascript)");
    printWarning = function(text) {
        var message = 'Warning: ' + text;
        if (typeof console !== 'undefined') {
            console.error(message);
        }
        try {
            // --- Welcome to debugging React ---
            // This error was thrown as a convenience so that you can use this stack
            // to find the callsite that caused this warning to fire.
            throw new Error(message);
        } catch (x) {}
    };
}
/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */ function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    if ("TURBOPACK compile-time truthy", 1) {
        for(var typeSpecName in typeSpecs){
            if (has(typeSpecs, typeSpecName)) {
                var error;
                // Prop type validation may throw. In case they do, we don't want to
                // fail the render phase where it didn't fail before. So we log it.
                // After these have been cleaned up, we'll let them throw.
                try {
                    // This is intentionally an invariant that gets caught. It's the same
                    // behavior as without this statement except with a better message.
                    if (typeof typeSpecs[typeSpecName] !== 'function') {
                        var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                        err.name = 'Invariant Violation';
                        throw err;
                    }
                    error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
                } catch (ex) {
                    error = ex;
                }
                if (error && !(error instanceof Error)) {
                    printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
                }
                if (error instanceof Error && !(error.message in loggedTypeFailures)) {
                    // Only monitor this failure once because there tends to be a lot of the
                    // same error.
                    loggedTypeFailures[error.message] = true;
                    var stack = getStack ? getStack() : '';
                    printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
                }
            }
        }
    }
}
/**
 * Resets warning cache when testing.
 *
 * @private
 */ checkPropTypes.resetWarningCache = function() {
    if (("TURBOPACK compile-time value", "development") !== 'production') {
        loggedTypeFailures = {};
    }
};
module.exports = checkPropTypes;
}),
"[project]/Galantesjewelry/node_modules/prop-types/factoryWithTypeCheckers.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ReactIs = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/react-is/index.js [app-ssr] (ecmascript)");
var assign = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/object-assign/index.js [app-ssr] (ecmascript)");
var ReactPropTypesSecret = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/lib/ReactPropTypesSecret.js [app-ssr] (ecmascript)");
var has = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/lib/has.js [app-ssr] (ecmascript)");
var checkPropTypes = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/checkPropTypes.js [app-ssr] (ecmascript)");
var printWarning = function() {};
if ("TURBOPACK compile-time truthy", 1) {
    printWarning = function(text) {
        var message = 'Warning: ' + text;
        if (typeof console !== 'undefined') {
            console.error(message);
        }
        try {
            // --- Welcome to debugging React ---
            // This error was thrown as a convenience so that you can use this stack
            // to find the callsite that caused this warning to fire.
            throw new Error(message);
        } catch (x) {}
    };
}
function emptyFunctionThatReturnsNull() {
    return null;
}
module.exports = function(isValidElement, throwOnDirectAccess) {
    /* global Symbol */ var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.
    /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */ function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === 'function') {
            return iteratorFn;
        }
    }
    /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */ var ANONYMOUS = '<<anonymous>>';
    // Important!
    // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
    var ReactPropTypes = {
        array: createPrimitiveTypeChecker('array'),
        bigint: createPrimitiveTypeChecker('bigint'),
        bool: createPrimitiveTypeChecker('boolean'),
        func: createPrimitiveTypeChecker('function'),
        number: createPrimitiveTypeChecker('number'),
        object: createPrimitiveTypeChecker('object'),
        string: createPrimitiveTypeChecker('string'),
        symbol: createPrimitiveTypeChecker('symbol'),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
    };
    /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */ /*eslint-disable no-self-compare*/ function is(x, y) {
        // SameValue algorithm
        if (x === y) {
            // Steps 1-5, 7-10
            // Steps 6.b-6.e: +0 != -0
            return x !== 0 || 1 / x === 1 / y;
        } else {
            // Step 6.a: NaN == NaN
            return x !== x && y !== y;
        }
    }
    /*eslint-enable no-self-compare*/ /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */ function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === 'object' ? data : {};
        this.stack = '';
    }
    // Make `instanceof Error` still work for returned errors.
    PropTypeError.prototype = Error.prototype;
    function createChainableTypeChecker(validate) {
        if (("TURBOPACK compile-time value", "development") !== 'production') {
            var manualPropTypeCallCache = {};
            var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
            componentName = componentName || ANONYMOUS;
            propFullName = propFullName || propName;
            if (secret !== ReactPropTypesSecret) {
                if (throwOnDirectAccess) {
                    // New behavior only for users of `prop-types` package
                    var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
                    err.name = 'Invariant Violation';
                    throw err;
                } else if (("TURBOPACK compile-time value", "development") !== 'production' && typeof console !== 'undefined') {
                    // Old behavior for people using React.PropTypes
                    var cacheKey = componentName + ':' + propName;
                    if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
                    manualPropTypeWarningCount < 3) {
                        printWarning('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
                        manualPropTypeCallCache[cacheKey] = true;
                        manualPropTypeWarningCount++;
                    }
                }
            }
            if (props[propName] == null) {
                if (isRequired) {
                    if (props[propName] === null) {
                        return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
                    }
                    return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
                }
                return null;
            } else {
                return validate(props, propName, componentName, location, propFullName);
            }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
    }
    function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== expectedType) {
                // `propValue` being instance of, say, date/regexp, pass the 'object'
                // check, but we can offer a more precise error message here rather than
                // 'of type `object`'.
                var preciseType = getPreciseType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'), {
                    expectedType: expectedType
                });
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }
    function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== 'function') {
                return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
            }
            var propValue = props[propName];
            if (!Array.isArray(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
            }
            for(var i = 0; i < propValue.length; i++){
                var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
                if (error instanceof Error) {
                    return error;
                }
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!isValidElement(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!ReactIs.isValidElementType(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
            if (!(props[propName] instanceof expectedClass)) {
                var expectedClassName = expectedClass.name || ANONYMOUS;
                var actualClassName = getClassName(props[propName]);
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
            if ("TURBOPACK compile-time truthy", 1) {
                if (arguments.length > 1) {
                    printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
                } else {
                    printWarning('Invalid argument supplied to oneOf, expected an array.');
                }
            }
            return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            for(var i = 0; i < expectedValues.length; i++){
                if (is(propValue, expectedValues[i])) {
                    return null;
                }
            }
            var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
                var type = getPreciseType(value);
                if (type === 'symbol') {
                    return String(value);
                }
                return value;
            });
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
        }
        return createChainableTypeChecker(validate);
    }
    function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== 'function') {
                return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
            }
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') {
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
            }
            for(var key in propValue){
                if (has(propValue, key)) {
                    var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                    if (error instanceof Error) {
                        return error;
                    }
                }
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
            ("TURBOPACK compile-time truthy", 1) ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : "TURBOPACK unreachable";
            return emptyFunctionThatReturnsNull;
        }
        for(var i = 0; i < arrayOfTypeCheckers.length; i++){
            var checker = arrayOfTypeCheckers[i];
            if (typeof checker !== 'function') {
                printWarning('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
                return emptyFunctionThatReturnsNull;
            }
        }
        function validate(props, propName, componentName, location, propFullName) {
            var expectedTypes = [];
            for(var i = 0; i < arrayOfTypeCheckers.length; i++){
                var checker = arrayOfTypeCheckers[i];
                var checkerResult = checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
                if (checkerResult == null) {
                    return null;
                }
                if (checkerResult.data && has(checkerResult.data, 'expectedType')) {
                    expectedTypes.push(checkerResult.data.expectedType);
                }
            }
            var expectedTypesMessage = expectedTypes.length > 0 ? ', expected one of type [' + expectedTypes.join(', ') + ']' : '';
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`' + expectedTypesMessage + '.'));
        }
        return createChainableTypeChecker(validate);
    }
    function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
            if (!isNode(props[propName])) {
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError((componentName || 'React class') + ': ' + location + ' type `' + propFullName + '.' + key + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + type + '`.');
    }
    function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') {
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
            }
            for(var key in shapeTypes){
                var checker = shapeTypes[key];
                if (typeof checker !== 'function') {
                    return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
                }
                var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                if (error) {
                    return error;
                }
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== 'object') {
                return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
            }
            // We need to check all keys in case some are required but missing from props.
            var allKeys = assign({}, props[propName], shapeTypes);
            for(var key in allKeys){
                var checker = shapeTypes[key];
                if (has(shapeTypes, key) && typeof checker !== 'function') {
                    return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
                }
                if (!checker) {
                    return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
                }
                var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                if (error) {
                    return error;
                }
            }
            return null;
        }
        return createChainableTypeChecker(validate);
    }
    function isNode(propValue) {
        switch(typeof propValue){
            case 'number':
            case 'string':
            case 'undefined':
                return true;
            case 'boolean':
                return !propValue;
            case 'object':
                if (Array.isArray(propValue)) {
                    return propValue.every(isNode);
                }
                if (propValue === null || isValidElement(propValue)) {
                    return true;
                }
                var iteratorFn = getIteratorFn(propValue);
                if (iteratorFn) {
                    var iterator = iteratorFn.call(propValue);
                    var step;
                    if (iteratorFn !== propValue.entries) {
                        while(!(step = iterator.next()).done){
                            if (!isNode(step.value)) {
                                return false;
                            }
                        }
                    } else {
                        // Iterator will provide entry [k,v] tuples rather than values.
                        while(!(step = iterator.next()).done){
                            var entry = step.value;
                            if (entry) {
                                if (!isNode(entry[1])) {
                                    return false;
                                }
                            }
                        }
                    }
                } else {
                    return false;
                }
                return true;
            default:
                return false;
        }
    }
    function isSymbol(propType, propValue) {
        // Native Symbol.
        if (propType === 'symbol') {
            return true;
        }
        // falsy value can't be a Symbol
        if (!propValue) {
            return false;
        }
        // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
        if (propValue['@@toStringTag'] === 'Symbol') {
            return true;
        }
        // Fallback for non-spec compliant Symbols which are polyfilled.
        if (typeof Symbol === 'function' && propValue instanceof Symbol) {
            return true;
        }
        return false;
    }
    // Equivalent of `typeof` but with special handling for array and regexp.
    function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
            return 'array';
        }
        if (propValue instanceof RegExp) {
            // Old webkits (at least until Android 4.0) return 'function' rather than
            // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
            // passes PropTypes.object.
            return 'object';
        }
        if (isSymbol(propType, propValue)) {
            return 'symbol';
        }
        return propType;
    }
    // This handles more types than `getPropType`. Only used for error messages.
    // See `createPrimitiveTypeChecker`.
    function getPreciseType(propValue) {
        if (typeof propValue === 'undefined' || propValue === null) {
            return '' + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === 'object') {
            if (propValue instanceof Date) {
                return 'date';
            } else if (propValue instanceof RegExp) {
                return 'regexp';
            }
        }
        return propType;
    }
    // Returns a string that is postfixed to a warning about an invalid type.
    // For example, "undefined" or "of type array"
    function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch(type){
            case 'array':
            case 'object':
                return 'an ' + type;
            case 'boolean':
            case 'date':
            case 'regexp':
                return 'a ' + type;
            default:
                return type;
        }
    }
    // Returns class name of the object, if any.
    function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
            return ANONYMOUS;
        }
        return propValue.constructor.name;
    }
    ReactPropTypes.checkPropTypes = checkPropTypes;
    ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
};
}),
"[project]/Galantesjewelry/node_modules/prop-types/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ if ("TURBOPACK compile-time truthy", 1) {
    var ReactIs = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/react-is/index.js [app-ssr] (ecmascript)");
    // By explicitly using `prop-types` you are opting into new development behavior.
    // http://fb.me/prop-types-in-prod
    var throwOnDirectAccess = true;
    module.exports = __turbopack_context__.r("[project]/Galantesjewelry/node_modules/prop-types/factoryWithTypeCheckers.js [app-ssr] (ecmascript)")(ReactIs.isElement, throwOnDirectAccess);
} else //TURBOPACK unreachable
;
}),
"[project]/Galantesjewelry/node_modules/@stripe/react-stripe-js/dist/react-stripe.esm.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AddressElement",
    ()=>AddressElement,
    "AuBankAccountElement",
    ()=>AuBankAccountElement,
    "CardCvcElement",
    ()=>CardCvcElement,
    "CardElement",
    ()=>CardElement,
    "CardExpiryElement",
    ()=>CardExpiryElement,
    "CardNumberElement",
    ()=>CardNumberElement,
    "ContactDetailsElement",
    ()=>ContactDetailsElement,
    "Elements",
    ()=>Elements,
    "ElementsConsumer",
    ()=>ElementsConsumer,
    "EmbeddedCheckout",
    ()=>EmbeddedCheckout,
    "EmbeddedCheckoutProvider",
    ()=>EmbeddedCheckoutProvider,
    "ExpressCheckoutElement",
    ()=>ExpressCheckoutElement,
    "FinancialAccountDisclosure",
    ()=>FinancialAccountDisclosure,
    "IbanElement",
    ()=>IbanElement,
    "IssuingCardCopyButtonElement",
    ()=>IssuingCardCopyButtonElement,
    "IssuingCardCvcDisplayElement",
    ()=>IssuingCardCvcDisplayElement,
    "IssuingCardExpiryDisplayElement",
    ()=>IssuingCardExpiryDisplayElement,
    "IssuingCardNumberDisplayElement",
    ()=>IssuingCardNumberDisplayElement,
    "IssuingCardPinDisplayElement",
    ()=>IssuingCardPinDisplayElement,
    "IssuingDisclosure",
    ()=>IssuingDisclosure,
    "LinkAuthenticationElement",
    ()=>LinkAuthenticationElement,
    "PaymentElement",
    ()=>PaymentElement,
    "PaymentMethodMessagingElement",
    ()=>PaymentMethodMessagingElement,
    "PaymentRequestButtonElement",
    ()=>PaymentRequestButtonElement,
    "ShippingAddressElement",
    ()=>ShippingAddressElement,
    "TaxIdElement",
    ()=>TaxIdElement,
    "useElements",
    ()=>useElements,
    "useStripe",
    ()=>useStripe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
;
;
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread2(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(Object(source), true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(Object(source)).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var useAttachEvent = function useAttachEvent(element, event, cb) {
    var cbDefined = !!cb;
    var cbRef = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(cb); // In many integrations the callback prop changes on each render.
    // Using a ref saves us from calling element.on/.off every render.
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        cbRef.current = cb;
    }, [
        cb
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (!cbDefined || !element) {
            return function() {};
        }
        var decoratedCb = function decoratedCb() {
            if (cbRef.current) {
                cbRef.current.apply(cbRef, arguments);
            }
        };
        element.on(event, decoratedCb);
        return function() {
            element.off(event, decoratedCb);
        };
    }, [
        cbDefined,
        event,
        element,
        cbRef
    ]);
};
var usePrevious = function usePrevious(value) {
    var ref = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(value);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        ref.current = value;
    }, [
        value
    ]);
    return ref.current;
};
var isUnknownObject = function isUnknownObject(raw) {
    return raw !== null && _typeof(raw) === 'object';
};
var isPromise = function isPromise(raw) {
    return isUnknownObject(raw) && typeof raw.then === 'function';
}; // We are using types to enforce the `stripe` prop in this lib,
// but in an untyped integration `stripe` could be anything, so we need
// to do some sanity validation to prevent type errors.
var isStripe = function isStripe(raw) {
    return isUnknownObject(raw) && typeof raw.elements === 'function' && typeof raw.createToken === 'function' && typeof raw.createPaymentMethod === 'function' && typeof raw.confirmCardPayment === 'function';
};
var PLAIN_OBJECT_STR = '[object Object]';
var isEqual = function isEqual(left, right) {
    if (!isUnknownObject(left) || !isUnknownObject(right)) {
        return left === right;
    }
    var leftArray = Array.isArray(left);
    var rightArray = Array.isArray(right);
    if (leftArray !== rightArray) return false;
    var leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
    var rightPlainObject = Object.prototype.toString.call(right) === PLAIN_OBJECT_STR;
    if (leftPlainObject !== rightPlainObject) return false; // not sure what sort of special object this is (regexp is one option), so
    // fallback to reference check.
    if (!leftPlainObject && !leftArray) return left === right;
    var leftKeys = Object.keys(left);
    var rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    var keySet = {};
    for(var i = 0; i < leftKeys.length; i += 1){
        keySet[leftKeys[i]] = true;
    }
    for(var _i = 0; _i < rightKeys.length; _i += 1){
        keySet[rightKeys[_i]] = true;
    }
    var allKeys = Object.keys(keySet);
    if (allKeys.length !== leftKeys.length) {
        return false;
    }
    var l = left;
    var r = right;
    var pred = function pred(key) {
        return isEqual(l[key], r[key]);
    };
    return allKeys.every(pred);
};
var extractAllowedOptionsUpdates = function extractAllowedOptionsUpdates(options, prevOptions, immutableKeys) {
    if (!isUnknownObject(options)) {
        return null;
    }
    return Object.keys(options).reduce(function(newOptions, key) {
        var isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);
        if (immutableKeys.includes(key)) {
            if (isUpdated) {
                console.warn("Unsupported prop change: options.".concat(key, " is not a mutable property."));
            }
            return newOptions;
        }
        if (!isUpdated) {
            return newOptions;
        }
        return _objectSpread2(_objectSpread2({}, newOptions || {}), {}, _defineProperty({}, key, options[key]));
    }, null);
};
var INVALID_STRIPE_ERROR$1 = 'Invalid prop `stripe` supplied to `Elements`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.'; // We are using types to enforce the `stripe` prop in this lib, but in a real
// integration `stripe` could be anything, so we need to do some sanity
// validation to prevent type errors.
var validateStripe = function validateStripe(maybeStripe) {
    var errorMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INVALID_STRIPE_ERROR$1;
    if (maybeStripe === null || isStripe(maybeStripe)) {
        return maybeStripe;
    }
    throw new Error(errorMsg);
};
var parseStripeProp = function parseStripeProp(raw) {
    var errorMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INVALID_STRIPE_ERROR$1;
    if (isPromise(raw)) {
        return {
            tag: 'async',
            stripePromise: Promise.resolve(raw).then(function(result) {
                return validateStripe(result, errorMsg);
            })
        };
    }
    var stripe = validateStripe(raw, errorMsg);
    if (stripe === null) {
        return {
            tag: 'empty'
        };
    }
    return {
        tag: 'sync',
        stripe: stripe
    };
};
var registerWithStripeJs = function registerWithStripeJs(stripe) {
    if (!stripe || !stripe._registerWrapper || !stripe.registerAppInfo) {
        return;
    }
    stripe._registerWrapper({
        name: 'react-stripe-js',
        version: "6.2.0"
    });
    stripe.registerAppInfo({
        name: 'react-stripe-js',
        version: "6.2.0",
        url: 'https://stripe.com/docs/stripe-js/react'
    });
};
var ElementsContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
ElementsContext.displayName = 'ElementsContext';
var parseElementsContext = function parseElementsContext(ctx, useCase) {
    if (!ctx) {
        throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(useCase, " in an <Elements> provider."));
    }
    return ctx;
};
/**
 * The `Elements` provider allows you to use [Element components](https://stripe.com/docs/stripe-js/react#element-components) and access the [Stripe object](https://stripe.com/docs/js/initializing) in any nested component.
 * Render an `Elements` provider at the root of your React app so that it is available everywhere you need it.
 *
 * To use the `Elements` provider, call `loadStripe` from `@stripe/stripe-js` with your publishable key.
 * The `loadStripe` function will asynchronously load the Stripe.js script and initialize a `Stripe` object.
 * Pass the returned `Promise` to `Elements`.
 *
 * @docs https://docs.stripe.com/sdks/stripejs-react?ui=elements#elements-provider
 */ var Elements = function Elements(_ref) {
    var rawStripeProp = _ref.stripe, options = _ref.options, children = _ref.children;
    var parsed = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(function() {
        return parseStripeProp(rawStripeProp);
    }, [
        rawStripeProp
    ]); // For a sync stripe instance, initialize into context
    var _React$useState = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(function() {
        return {
            stripe: parsed.tag === 'sync' ? parsed.stripe : null,
            elements: parsed.tag === 'sync' ? parsed.stripe.elements(options) : null
        };
    }), _React$useState2 = _slicedToArray(_React$useState, 2), ctx = _React$useState2[0], setContext = _React$useState2[1];
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        var isMounted = true;
        var safeSetContext = function safeSetContext(stripe) {
            setContext(function(ctx) {
                // no-op if we already have a stripe instance (https://github.com/stripe/react-stripe-js/issues/296)
                if (ctx.stripe) return ctx;
                return {
                    stripe: stripe,
                    elements: stripe.elements(options)
                };
            });
        }; // For an async stripePromise, store it in context once resolved
        if (parsed.tag === 'async' && !ctx.stripe) {
            parsed.stripePromise.then(function(stripe) {
                if (stripe && isMounted) {
                    // Only update Elements context if the component is still mounted
                    // and stripe is not null. We allow stripe to be null to make
                    // handling SSR easier.
                    safeSetContext(stripe);
                }
            });
        } else if (parsed.tag === 'sync' && !ctx.stripe) {
            // Or, handle a sync stripe instance going from null -> populated
            safeSetContext(parsed.stripe);
        }
        return function() {
            isMounted = false;
        };
    }, [
        parsed,
        ctx,
        options
    ]); // Warn on changes to stripe prop
    var prevStripe = usePrevious(rawStripeProp);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (prevStripe !== null && prevStripe !== rawStripeProp) {
            console.warn('Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.');
        }
    }, [
        prevStripe,
        rawStripeProp
    ]); // Apply updates to elements when options prop has relevant changes
    var prevOptions = usePrevious(options);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (!ctx.elements) {
            return;
        }
        var updates = extractAllowedOptionsUpdates(options, prevOptions, [
            'clientSecret',
            'fonts'
        ]);
        if (updates) {
            ctx.elements.update(updates);
        }
    }, [
        options,
        prevOptions,
        ctx.elements
    ]); // Attach react-stripe-js version to stripe.js instance
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        registerWithStripeJs(ctx.stripe);
    }, [
        ctx.stripe
    ]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(ElementsContext.Provider, {
        value: ctx
    }, children);
};
Elements.propTypes = {
    stripe: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].any,
    options: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
};
var useElementsContextWithUseCase = function useElementsContextWithUseCase(useCaseMessage) {
    var ctx = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(ElementsContext);
    return parseElementsContext(ctx, useCaseMessage);
};
/**
 * @docs https://stripe.com/docs/stripe-js/react#useelements-hook
 */ var useElements = function useElements() {
    var _useElementsContextWi = useElementsContextWithUseCase('calls useElements()'), elements = _useElementsContextWi.elements;
    return elements;
};
/**
 * @docs https://stripe.com/docs/stripe-js/react#elements-consumer
 */ var ElementsConsumer = function ElementsConsumer(_ref2) {
    var children = _ref2.children;
    var ctx = useElementsContextWithUseCase('mounts <ElementsConsumer>'); // Assert to satisfy the busted React.FC return type (it should be ReactNode)
    return children(ctx);
};
ElementsConsumer.propTypes = {
    children: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func.isRequired
};
var CheckoutContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
CheckoutContext.displayName = 'CheckoutContext';
var useElementsOrCheckoutContextWithUseCase = function useElementsOrCheckoutContextWithUseCase(useCaseString) {
    var checkout = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(CheckoutContext);
    var elements = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(ElementsContext);
    if (checkout) {
        if (elements) {
            throw new Error("You cannot wrap the part of your app that ".concat(useCaseString, " in both a checkout provider and <Elements> provider."));
        } else {
            return checkout;
        }
    } else {
        return parseElementsContext(elements, useCaseString);
    }
};
var _excluded = [
    "mode"
];
var capitalized = function capitalized(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var createElementComponent = function createElementComponent(type, isServer, customDisplayName) {
    var displayName = "".concat(capitalized(type), "Element");
    var ClientElement = function ClientElement(_ref) {
        var id = _ref.id, className = _ref.className, _ref$options = _ref.options, options = _ref$options === void 0 ? {} : _ref$options, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onReady = _ref.onReady, onChange = _ref.onChange, onEscape = _ref.onEscape, onClick = _ref.onClick, onLoadError = _ref.onLoadError, onLoaderStart = _ref.onLoaderStart, onNetworksChange = _ref.onNetworksChange, onConfirm = _ref.onConfirm, onCancel = _ref.onCancel, onShippingAddressChange = _ref.onShippingAddressChange, onShippingRateChange = _ref.onShippingRateChange, onSavedPaymentMethodRemove = _ref.onSavedPaymentMethodRemove, onSavedPaymentMethodUpdate = _ref.onSavedPaymentMethodUpdate;
        var ctx = useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
        var elements = 'elements' in ctx ? ctx.elements : null;
        var checkoutState = 'checkoutState' in ctx ? ctx.checkoutState : null;
        var checkoutSdk = (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === 'success' || (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === 'loading' ? checkoutState.sdk : null;
        var _React$useState = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null), _React$useState2 = _slicedToArray(_React$useState, 2), element = _React$useState2[0], setElement = _React$useState2[1];
        var elementRef = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
        var domNode = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null); // For every event where the merchant provides a callback, call element.on
        // with that callback. If the merchant ever changes the callback, removes
        // the old callback with element.off and then call element.on with the new one.
        useAttachEvent(element, 'blur', onBlur);
        useAttachEvent(element, 'focus', onFocus);
        useAttachEvent(element, 'escape', onEscape);
        useAttachEvent(element, 'click', onClick);
        useAttachEvent(element, 'loaderror', onLoadError);
        useAttachEvent(element, 'loaderstart', onLoaderStart);
        useAttachEvent(element, 'networkschange', onNetworksChange);
        useAttachEvent(element, 'confirm', onConfirm);
        useAttachEvent(element, 'cancel', onCancel);
        useAttachEvent(element, 'shippingaddresschange', onShippingAddressChange);
        useAttachEvent(element, 'shippingratechange', onShippingRateChange);
        useAttachEvent(element, 'savedpaymentmethodremove', onSavedPaymentMethodRemove);
        useAttachEvent(element, 'savedpaymentmethodupdate', onSavedPaymentMethodUpdate);
        useAttachEvent(element, 'change', onChange);
        var readyCallback;
        if (onReady) {
            if (type === 'expressCheckout') {
                // Passes through the event, which includes visible PM types
                readyCallback = onReady;
            } else {
                // For other Elements, pass through the Element itself.
                readyCallback = function readyCallback() {
                    onReady(element);
                };
            }
        }
        useAttachEvent(element, 'ready', readyCallback);
        __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useLayoutEffect(function() {
            if (elementRef.current === null && domNode.current !== null && (elements || checkoutSdk)) {
                var newElement = null;
                if (checkoutSdk) {
                    var elementsSdk = checkoutSdk;
                    var formSdk = checkoutSdk;
                    switch(type){
                        case 'paymentForm':
                            newElement = formSdk.createForm(options);
                            break;
                        case 'payment':
                            newElement = elementsSdk.createPaymentElement(options);
                            break;
                        case 'address':
                            if ('mode' in options) {
                                var mode = options.mode, restOptions = _objectWithoutProperties(options, _excluded);
                                if (mode === 'shipping') {
                                    newElement = elementsSdk.createShippingAddressElement(restOptions);
                                } else if (mode === 'billing') {
                                    newElement = elementsSdk.createBillingAddressElement(restOptions);
                                } else {
                                    throw new Error("Invalid options.mode. mode must be 'billing' or 'shipping'.");
                                }
                            } else {
                                throw new Error("You must supply options.mode. mode must be 'billing' or 'shipping'.");
                            }
                            break;
                        case 'expressCheckout':
                            newElement = elementsSdk.createExpressCheckoutElement(options);
                            break;
                        case 'currencySelector':
                            newElement = checkoutSdk.createCurrencySelectorElement();
                            break;
                        case 'taxId':
                            newElement = elementsSdk.createTaxIdElement(options);
                            break;
                        case 'contactDetails':
                            newElement = elementsSdk.createContactDetailsElement();
                            break;
                        default:
                            throw new Error("<".concat(displayName, "> is not supported inside a checkout provider. Use an <Elements> provider instead."));
                    }
                } else if (elements) {
                    newElement = elements.create(type, options);
                } // Store element in a ref to ensure it's _immediately_ available in cleanup hooks in StrictMode
                elementRef.current = newElement; // Store element in state to facilitate event listener attachment
                setElement(newElement);
                if (newElement) {
                    newElement.mount(domNode.current);
                }
            }
        }, [
            elements,
            checkoutSdk,
            options
        ]);
        var prevOptions = usePrevious(options);
        __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
            if (!elementRef.current) {
                return;
            }
            var updates = extractAllowedOptionsUpdates(options, prevOptions, [
                'paymentRequest'
            ]);
            if (updates && 'update' in elementRef.current) {
                elementRef.current.update(updates);
            }
        }, [
            options,
            prevOptions
        ]);
        __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useLayoutEffect(function() {
            return function() {
                if (elementRef.current && typeof elementRef.current.destroy === 'function') {
                    try {
                        elementRef.current.destroy();
                        elementRef.current = null;
                    } catch (error) {}
                }
            };
        }, []);
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
            id: id,
            className: className,
            ref: domNode
        });
    }; // Only render the Element wrapper in a server environment.
    var ServerElement = function ServerElement(props) {
        useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
        var id = props.id, className = props.className;
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
            id: id,
            className: className
        });
    };
    var Element = isServer ? ServerElement : ClientElement;
    Element.propTypes = {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        onChange: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onBlur: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onFocus: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onReady: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onEscape: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onClick: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onLoadError: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onLoaderStart: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onNetworksChange: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onConfirm: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onCancel: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onShippingAddressChange: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onShippingRateChange: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onSavedPaymentMethodRemove: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        onSavedPaymentMethodUpdate: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        options: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
    };
    Element.displayName = displayName;
    Element.__elementType = type;
    return Element;
};
var isServer = ("TURBOPACK compile-time value", "undefined") === 'undefined';
var EmbeddedCheckoutContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
EmbeddedCheckoutContext.displayName = 'EmbeddedCheckoutProviderContext';
var useEmbeddedCheckoutContext = function useEmbeddedCheckoutContext() {
    var ctx = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(EmbeddedCheckoutContext);
    if (!ctx) {
        throw new Error('<EmbeddedCheckout> must be used within <EmbeddedCheckoutProvider>');
    }
    return ctx;
};
var INVALID_STRIPE_ERROR = 'Invalid prop `stripe` supplied to `EmbeddedCheckoutProvider`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.';
var EmbeddedCheckoutProvider = function EmbeddedCheckoutProvider(_ref) {
    var rawStripeProp = _ref.stripe, options = _ref.options, children = _ref.children;
    var parsed = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(function() {
        return parseStripeProp(rawStripeProp, INVALID_STRIPE_ERROR);
    }, [
        rawStripeProp
    ]);
    var embeddedCheckoutPromise = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    var loadedStripe = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    var _React$useState = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({
        embeddedCheckout: null
    }), _React$useState2 = _slicedToArray(_React$useState, 2), ctx = _React$useState2[0], setContext = _React$useState2[1];
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        // Don't support any ctx updates once embeddedCheckout or stripe is set.
        if (loadedStripe.current || embeddedCheckoutPromise.current) {
            return;
        }
        var setStripeAndInitEmbeddedCheckout = function setStripeAndInitEmbeddedCheckout(stripe) {
            if (loadedStripe.current || embeddedCheckoutPromise.current) return;
            loadedStripe.current = stripe;
            embeddedCheckoutPromise.current = loadedStripe.current.createEmbeddedCheckoutPage(options).then(function(embeddedCheckout) {
                setContext({
                    embeddedCheckout: embeddedCheckout
                });
            });
        }; // For an async stripePromise, store it once resolved
        if (parsed.tag === 'async' && !loadedStripe.current && (options.clientSecret || options.fetchClientSecret)) {
            parsed.stripePromise.then(function(stripe) {
                if (stripe) {
                    setStripeAndInitEmbeddedCheckout(stripe);
                }
            });
        } else if (parsed.tag === 'sync' && !loadedStripe.current && (options.clientSecret || options.fetchClientSecret)) {
            // Or, handle a sync stripe instance going from null -> populated
            setStripeAndInitEmbeddedCheckout(parsed.stripe);
        }
    }, [
        parsed,
        options,
        ctx,
        loadedStripe
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        // cleanup on unmount
        return function() {
            // If embedded checkout is fully initialized, destroy it.
            if (ctx.embeddedCheckout) {
                embeddedCheckoutPromise.current = null;
                ctx.embeddedCheckout.destroy();
            } else if (embeddedCheckoutPromise.current) {
                // If embedded checkout is still initializing, destroy it once
                // it's done. This could be caused by unmounting very quickly
                // after mounting.
                embeddedCheckoutPromise.current.then(function() {
                    embeddedCheckoutPromise.current = null;
                    if (ctx.embeddedCheckout) {
                        ctx.embeddedCheckout.destroy();
                    }
                });
            }
        };
    }, [
        ctx.embeddedCheckout
    ]); // Attach react-stripe-js version to stripe.js instance
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        registerWithStripeJs(loadedStripe);
    }, [
        loadedStripe
    ]); // Warn on changes to stripe prop.
    // The stripe prop value can only go from null to non-null once and
    // can't be changed after that.
    var prevStripe = usePrevious(rawStripeProp);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (prevStripe !== null && prevStripe !== rawStripeProp) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the `stripe` prop after setting it.');
        }
    }, [
        prevStripe,
        rawStripeProp
    ]); // Warn on changes to options.
    var prevOptions = usePrevious(options);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (prevOptions == null) {
            return;
        }
        if (options == null) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot unset options after setting them.');
            return;
        }
        if (options.clientSecret === undefined && options.fetchClientSecret === undefined) {
            console.warn('Invalid props passed to EmbeddedCheckoutProvider: You must provide one of either `options.fetchClientSecret` or `options.clientSecret`.');
        }
        if (prevOptions.clientSecret != null && options.clientSecret !== prevOptions.clientSecret) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the client secret after setting it. Unmount and create a new instance of EmbeddedCheckoutProvider instead.');
        }
        if (prevOptions.fetchClientSecret != null && options.fetchClientSecret !== prevOptions.fetchClientSecret) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change fetchClientSecret after setting it. Unmount and create a new instance of EmbeddedCheckoutProvider instead.');
        }
        if (prevOptions.onComplete != null && options.onComplete !== prevOptions.onComplete) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onComplete option after setting it.');
        }
        if (prevOptions.onShippingDetailsChange != null && options.onShippingDetailsChange !== prevOptions.onShippingDetailsChange) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onShippingDetailsChange option after setting it.');
        }
        if (prevOptions.onLineItemsChange != null && options.onLineItemsChange !== prevOptions.onLineItemsChange) {
            console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onLineItemsChange option after setting it.');
        }
    }, [
        prevOptions,
        options
    ]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(EmbeddedCheckoutContext.Provider, {
        value: ctx
    }, children);
};
var EmbeddedCheckoutClientElement = function EmbeddedCheckoutClientElement(_ref) {
    var id = _ref.id, className = _ref.className;
    var _useEmbeddedCheckoutC = useEmbeddedCheckoutContext(), embeddedCheckout = _useEmbeddedCheckoutC.embeddedCheckout;
    var isMounted = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(false);
    var domNode = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useLayoutEffect(function() {
        if (!isMounted.current && embeddedCheckout && domNode.current !== null) {
            embeddedCheckout.mount(domNode.current);
            isMounted.current = true;
        } // Clean up on unmount
        return function() {
            if (isMounted.current && embeddedCheckout) {
                try {
                    embeddedCheckout.unmount();
                    isMounted.current = false;
                } catch (e) {
                // Parent effects are destroyed before child effects, so
                // in cases where both the EmbeddedCheckoutProvider and
                // the EmbeddedCheckout component are removed at the same
                // time, the embeddedCheckout instance will be destroyed,
                // which causes an error when calling unmount.
                }
            }
        };
    }, [
        embeddedCheckout
    ]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: domNode,
        id: id,
        className: className
    });
}; // Only render the wrapper in a server environment.
var EmbeddedCheckoutServerElement = function EmbeddedCheckoutServerElement(_ref2) {
    var id = _ref2.id, className = _ref2.className;
    // Validate that we are in the right context by calling useEmbeddedCheckoutContext.
    useEmbeddedCheckoutContext();
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        id: id,
        className: className
    });
};
var EmbeddedCheckout = ("TURBOPACK compile-time truthy", 1) ? EmbeddedCheckoutServerElement : "TURBOPACK unreachable";
var FinancialAccountDisclosure = function FinancialAccountDisclosure(_ref) {
    var rawStripeProp = _ref.stripe, onLoad = _ref.onLoad, onError = _ref.onError, options = _ref.options;
    var businessName = options === null || options === void 0 ? void 0 : options.businessName;
    var learnMoreLink = options === null || options === void 0 ? void 0 : options.learnMoreLink;
    var containerRef = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    var parsed = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(function() {
        return parseStripeProp(rawStripeProp);
    }, [
        rawStripeProp
    ]);
    var _React$useState = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(parsed.tag === 'sync' ? parsed.stripe : null), _React$useState2 = _slicedToArray(_React$useState, 2), stripeState = _React$useState2[0], setStripeState = _React$useState2[1];
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        var isMounted = true;
        if (parsed.tag === 'async') {
            parsed.stripePromise.then(function(stripePromise) {
                if (stripePromise && isMounted) {
                    setStripeState(stripePromise);
                }
            });
        } else if (parsed.tag === 'sync') {
            setStripeState(parsed.stripe);
        }
        return function() {
            isMounted = false;
        };
    }, [
        parsed
    ]); // Warn on changes to stripe prop
    var prevStripe = usePrevious(rawStripeProp);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (prevStripe !== null && prevStripe !== rawStripeProp) {
            console.warn('Unsupported prop change on FinancialAccountDisclosure: You cannot change the `stripe` prop after setting it.');
        }
    }, [
        prevStripe,
        rawStripeProp
    ]); // Attach react-stripe-js version to stripe.js instance
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        registerWithStripeJs(stripeState);
    }, [
        stripeState
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        var createDisclosure = /*#__PURE__*/ function() {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
                var _yield$stripeState$cr, disclosureContent, error, container;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while(1){
                        switch(_context.prev = _context.next){
                            case 0:
                                if (!(!stripeState || !containerRef.current)) {
                                    _context.next = 2;
                                    break;
                                }
                                return _context.abrupt("return");
                            case 2:
                                _context.next = 4;
                                return stripeState.createFinancialAccountDisclosure({
                                    businessName: businessName,
                                    learnMoreLink: learnMoreLink
                                });
                            case 4:
                                _yield$stripeState$cr = _context.sent;
                                disclosureContent = _yield$stripeState$cr.htmlElement;
                                error = _yield$stripeState$cr.error;
                                if (error && onError) {
                                    onError(error);
                                } else if (disclosureContent) {
                                    container = containerRef.current;
                                    container.innerHTML = '';
                                    container.appendChild(disclosureContent);
                                    if (onLoad) {
                                        onLoad();
                                    }
                                }
                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee);
            }));
            return function createDisclosure() {
                return _ref2.apply(this, arguments);
            };
        }();
        createDisclosure();
    }, [
        stripeState,
        businessName,
        learnMoreLink,
        onLoad,
        onError
    ]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        ref: containerRef
    });
};
var IssuingDisclosure = function IssuingDisclosure(_ref) {
    var rawStripeProp = _ref.stripe, onLoad = _ref.onLoad, onError = _ref.onError, options = _ref.options;
    var issuingProgramID = options === null || options === void 0 ? void 0 : options.issuingProgramID;
    var publicCardProgramName = options === null || options === void 0 ? void 0 : options.publicCardProgramName;
    var learnMoreLink = options === null || options === void 0 ? void 0 : options.learnMoreLink;
    var containerRef = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    var parsed = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(function() {
        return parseStripeProp(rawStripeProp);
    }, [
        rawStripeProp
    ]);
    var _React$useState = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(parsed.tag === 'sync' ? parsed.stripe : null), _React$useState2 = _slicedToArray(_React$useState, 2), stripeState = _React$useState2[0], setStripeState = _React$useState2[1];
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        var isMounted = true;
        if (parsed.tag === 'async') {
            parsed.stripePromise.then(function(stripePromise) {
                if (stripePromise && isMounted) {
                    setStripeState(stripePromise);
                }
            });
        } else if (parsed.tag === 'sync') {
            setStripeState(parsed.stripe);
        }
        return function() {
            isMounted = false;
        };
    }, [
        parsed
    ]); // Warn on changes to stripe prop
    var prevStripe = usePrevious(rawStripeProp);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        if (prevStripe !== null && prevStripe !== rawStripeProp) {
            console.warn('Unsupported prop change on IssuingDisclosure: You cannot change the `stripe` prop after setting it.');
        }
    }, [
        prevStripe,
        rawStripeProp
    ]); // Attach react-stripe-js version to stripe.js instance
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        registerWithStripeJs(stripeState);
    }, [
        stripeState
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(function() {
        var createDisclosure = /*#__PURE__*/ function() {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
                var _yield$stripeState$cr, disclosureContent, error, container;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while(1){
                        switch(_context.prev = _context.next){
                            case 0:
                                if (!(!stripeState || !containerRef.current)) {
                                    _context.next = 2;
                                    break;
                                }
                                return _context.abrupt("return");
                            case 2:
                                _context.next = 4;
                                return stripeState.createIssuingDisclosure({
                                    issuingProgramID: issuingProgramID,
                                    publicCardProgramName: publicCardProgramName,
                                    learnMoreLink: learnMoreLink
                                });
                            case 4:
                                _yield$stripeState$cr = _context.sent;
                                disclosureContent = _yield$stripeState$cr.htmlElement;
                                error = _yield$stripeState$cr.error;
                                if (error && onError) {
                                    onError(error);
                                } else if (disclosureContent) {
                                    container = containerRef.current;
                                    container.innerHTML = '';
                                    container.appendChild(disclosureContent);
                                    if (onLoad) {
                                        onLoad();
                                    }
                                }
                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee);
            }));
            return function createDisclosure() {
                return _ref2.apply(this, arguments);
            };
        }();
        createDisclosure();
    }, [
        stripeState,
        issuingProgramID,
        publicCardProgramName,
        learnMoreLink,
        onLoad,
        onError
    ]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        ref: containerRef
    });
};
/**
 * @docs https://stripe.com/docs/stripe-js/react#usestripe-hook
 */ var useStripe = function useStripe() {
    var _useElementsOrCheckou = useElementsOrCheckoutContextWithUseCase('calls useStripe()'), stripe = _useElementsOrCheckou.stripe;
    return stripe;
};
/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 *
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var AuBankAccountElement = createElementComponent('auBankAccount', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var CardElement = createElementComponent('card', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var CardNumberElement = createElementComponent('cardNumber', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var CardExpiryElement = createElementComponent('cardExpiry', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var CardCvcElement = createElementComponent('cardCvc', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var IbanElement = createElementComponent('iban', isServer);
var PaymentElement = createElementComponent('payment', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var ExpressCheckoutElement = createElementComponent('expressCheckout', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var PaymentRequestButtonElement = createElementComponent('paymentRequestButton', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var LinkAuthenticationElement = createElementComponent('linkAuthentication', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var ContactDetailsElement = createElementComponent('contactDetails', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var AddressElement = createElementComponent('address', isServer);
/**
 * @deprecated
 * Use `AddressElement` instead.
 *
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var ShippingAddressElement = createElementComponent('shippingAddress', isServer);
/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */ var PaymentMethodMessagingElement = createElementComponent('paymentMethodMessaging', isServer);
/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */ var TaxIdElement = createElementComponent('taxId', isServer);
/**
 * @docs https://stripe.com/docs/issuing/elements
 */ var IssuingCardNumberDisplayElement = createElementComponent('issuingCardNumberDisplay', isServer);
/**
 * @docs https://stripe.com/docs/issuing/elements
 */ var IssuingCardCvcDisplayElement = createElementComponent('issuingCardCvcDisplay', isServer);
/**
 * @docs https://stripe.com/docs/issuing/elements
 */ var IssuingCardExpiryDisplayElement = createElementComponent('issuingCardExpiryDisplay', isServer);
/**
 * @docs https://stripe.com/docs/issuing/elements
 */ var IssuingCardPinDisplayElement = createElementComponent('issuingCardPinDisplay', isServer);
/**
 * @docs https://stripe.com/docs/issuing/elements
 */ var IssuingCardCopyButtonElement = createElementComponent('issuingCardCopyButton', isServer);
;
}),
];

//# sourceMappingURL=Galantesjewelry_0mlvkx9._.js.map