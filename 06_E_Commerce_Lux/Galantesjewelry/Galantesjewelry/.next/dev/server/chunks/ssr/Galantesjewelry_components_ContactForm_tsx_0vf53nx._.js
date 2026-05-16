module.exports = [
"[project]/Galantesjewelry/components/ContactForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContactForm",
    ()=>ContactForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const weekdayLabels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
const DEFAULT_AVAILABILITY = {
    availableSlots: [],
    availableWeekdays: [
        0,
        1,
        2,
        3,
        4,
        5,
        6
    ],
    timezone: "America/New_York",
    durationMinutes: 60,
    startTime: "09:00",
    endTime: "18:00",
    slotIntervalMinutes: 30,
    conflictBufferMinutes: 5
};
function getTodayForDateInput() {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}
function formatWeekdays(weekdays) {
    if (weekdays.length === 7) {
        return "Appointments are available every day.";
    }
    return `Appointments are offered on ${weekdays.map((day)=>weekdayLabels[day]).join(", ")}.`;
}
function ContactForm() {
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const queryParams = searchParams ?? new URLSearchParams();
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingAvailability, setLoadingAvailability] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [confirmation, setConfirmation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedTime, setSelectedTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [availabilityError, setAvailabilityError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [availability, setAvailability] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_AVAILABILITY);
    const reason = queryParams.get("reason");
    const orderId = queryParams.get("orderId");
    const carrier = queryParams.get("carrier");
    const scheduleSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const parts = [];
        if (availability.durationMinutes) {
            parts.push(`${availability.durationMinutes}-minute consultations`);
        }
        if (availability.startTime && availability.endTime) {
            parts.push(`${availability.startTime} to ${availability.endTime}`);
        }
        if (availability.timezone) {
            parts.push(availability.timezone);
        }
        if (availability.conflictBufferMinutes) {
            parts.push(`${availability.conflictBufferMinutes}-minute protection window`);
        }
        return parts.join(" | ");
    }, [
        availability.conflictBufferMinutes,
        availability.durationMinutes,
        availability.endTime,
        availability.startTime,
        availability.timezone
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function loadScheduleMetadata() {
            setLoadingAvailability(true);
            setAvailabilityError("");
            try {
                const response = await fetch("/api/contact/availability", {
                    cache: "no-store"
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || "Could not load appointment availability.");
                }
                if (cancelled) {
                    return;
                }
                setAvailability({
                    availableSlots: result.availableSlots || [],
                    timezone: result.timezone,
                    durationMinutes: result.durationMinutes,
                    startTime: result.startTime,
                    endTime: result.endTime,
                    slotIntervalMinutes: result.slotIntervalMinutes,
                    availableWeekdays: result.availableWeekdays || [],
                    conflictBufferMinutes: result.conflictBufferMinutes
                });
            } catch (caughtError) {
                if (!cancelled) {
                    setAvailabilityError(caughtError instanceof Error ? caughtError.message : "We could not load available appointment times.");
                }
            } finally{
                if (!cancelled) {
                    setLoadingAvailability(false);
                }
            }
        }
        void loadScheduleMetadata();
        return ()=>{
            cancelled = true;
        };
    }, []);
    const loadAvailability = async (appointmentDate)=>{
        setSelectedTime("");
        setAvailabilityError("");
        setAvailability((current)=>({
                ...current,
                availableSlots: []
            }));
        if (!appointmentDate) {
            return;
        }
        setLoadingAvailability(true);
        try {
            const response = await fetch(`/api/contact/availability?appointmentDate=${encodeURIComponent(appointmentDate)}`, {
                cache: "no-store"
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(response.status === 503 ? "Online booking is temporarily unavailable. Please contact the boutique directly and we will arrange your visit." : result.error || "Could not load appointment availability.");
            }
            setAvailability({
                availableSlots: result.availableSlots || [],
                timezone: result.timezone,
                durationMinutes: result.durationMinutes,
                startTime: result.startTime,
                endTime: result.endTime,
                slotIntervalMinutes: result.slotIntervalMinutes,
                availableWeekdays: result.availableWeekdays || [],
                conflictBufferMinutes: result.conflictBufferMinutes
            });
            if (!result.availableSlots?.length) {
                setAvailabilityError("No consultation times are currently available for that date. Please choose another day.");
            }
        } catch (caughtError) {
            setAvailabilityError(caughtError instanceof Error ? caughtError.message : "We could not load available appointment times.");
        } finally{
            setLoadingAvailability(false);
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError("");
        setConfirmation("");
        if (!selectedDate) {
            setError("Please choose a preferred date first.");
            setLoading(false);
            return;
        }
        if (!selectedTime) {
            setError("Please choose one of the available consultation times.");
            setLoading(false);
            return;
        }
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            inquiryType: formData.get("inquiryType"),
            message: formData.get("message"),
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            honeypot: formData.get("company")
        };
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setSubmitted(true);
                setConfirmation(result.message || "Appointment request created successfully.");
            } else {
                setError(res.status === 409 ? "That consultation time was just booked. Please choose another available time." : res.status === 503 ? "Online booking is temporarily unavailable. Please contact the boutique directly and we will arrange your visit." : result.error || "We could not submit your request right now. Please try again in a moment.");
                if (res.status === 409 && selectedDate) {
                    await loadAvailability(selectedDate);
                }
            }
        } catch  {
            setError("A connection error occurred. Please try again later.");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: submitted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-testid": "contact-success",
            className: "bg-stone-50 p-8 text-center border border-stone-200 animate-in fade-in duration-500",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-2xl font-serif mb-2 text-primary",
                    children: "Request Received"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 251,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "opacity-80 text-sm",
                    children: confirmation || "Our concierge will contact you shortly to confirm your appointment time. Warm regards from the Florida Keys."
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 252,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
            lineNumber: 250,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "flex flex-col gap-6",
            children: [
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-50 border border-red-200 text-red-600 p-3 text-sm mb-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "data-testid": "contact-error",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                        lineNumber: 258,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 257,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium text-stone-900",
                            children: "Choose a date and we will show you the times that are still open."
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 263,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-xs text-stone-500",
                            children: availability.availableWeekdays?.length ? formatWeekdays(availability.availableWeekdays) : "Available consultation times load after you choose a date."
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 264,
                            columnNumber: 13
                        }, this),
                        scheduleSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-xs text-stone-500",
                            children: scheduleSummary
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 267,
                            columnNumber: 33
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 262,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Name"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 271,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "data-testid": "contact-name",
                            required: true,
                            name: "name",
                            type: "text",
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent",
                            placeholder: "Your full name"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 272,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 270,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Email"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 275,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "data-testid": "contact-email",
                            required: true,
                            name: "email",
                            type: "email",
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent",
                            placeholder: "Your email address"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 276,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 274,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Phone"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 279,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "data-testid": "contact-phone",
                            name: "phone",
                            type: "tel",
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent",
                            placeholder: "Optional phone number"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 280,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 278,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Inquiry Type"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 283,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            "data-testid": "contact-inquiry-type",
                            name: "inquiryType",
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent appearance-none",
                            defaultValue: reason === "order_fulfillment" ? "Order Collection/Delivery" : "Bridal & Engagement",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Bridal & Engagement",
                                    children: "Bridal & Engagement"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 290,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Nautical Collections",
                                    children: "Nautical Collections"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 291,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Master Repair Service",
                                    children: "Master Repair Service"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 292,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Order Collection/Delivery",
                                    children: "Order Collection/Delivery"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 293,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "General Inquiry",
                                    children: "General Inquiry"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 294,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 284,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 282,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Preferred Date"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 299,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "data-testid": "contact-appointment-date",
                            required: true,
                            name: "appointmentDate",
                            type: "date",
                            value: selectedDate,
                            min: getTodayForDateInput(),
                            onChange: async (event)=>{
                                const nextDate = event.target.value;
                                setSelectedDate(nextDate);
                                await loadAvailability(nextDate);
                            },
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 300,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 298,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                                    children: "Available Times"
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 318,
                                    columnNumber: 15
                                }, this),
                                loadingAvailability && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "data-testid": "contact-availability-loading",
                                    className: "text-xs text-stone-500",
                                    children: "Checking calendar..."
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 319,
                                    columnNumber: 39
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 317,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "data-testid": "contact-appointment-time",
                            required: true,
                            name: "appointmentTime",
                            type: "hidden",
                            value: selectedTime,
                            readOnly: true
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 322,
                            columnNumber: 13
                        }, this),
                        !selectedDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500",
                            children: "Select a date to see the consultation times that are available."
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 325,
                            columnNumber: 15
                        }, this) : availabilityError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-testid": "contact-availability-error",
                            className: "rounded border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700",
                            children: availabilityError
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 329,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
                            children: (availability.availableSlots || []).map((slot)=>{
                                const isSelected = slot.time === selectedTime;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    "data-testid": `contact-slot-${slot.time.replace(":", "-")}`,
                                    onClick: ()=>setSelectedTime(slot.time),
                                    className: `rounded border px-3 py-3 text-sm transition-colors ${isSelected ? "border-primary bg-primary text-white" : "border-stone-300 bg-white text-stone-700 hover:border-primary hover:text-primary"}`,
                                    children: slot.label
                                }, slot.time, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 337,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 333,
                            columnNumber: 15
                        }, this),
                        selectedTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            "data-testid": "contact-selected-slot",
                            className: "text-sm text-stone-600",
                            children: [
                                "Selected consultation time: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-stone-900",
                                    children: availability.availableSlots?.find((slot)=>slot.time === selectedTime)?.label || selectedTime
                                }, void 0, false, {
                                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                                    lineNumber: 353,
                                    columnNumber: 45
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 352,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 316,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs uppercase tracking-widest font-semibold opacity-70",
                            children: "Message"
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 359,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            "data-testid": "contact-message",
                            required: true,
                            name: "message",
                            rows: 4,
                            className: "border-b border-stone-300 pb-2 focus:outline-none focus:border-primary bg-transparent",
                            placeholder: "Tell us what you would like to explore during your visit.",
                            defaultValue: reason === "order_fulfillment" ? `I would like to schedule a time to ${carrier === 'pickup' ? 'collect' : 'receive'} my order #${orderId}.` : ""
                        }, void 0, false, {
                            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                            lineNumber: 360,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 358,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    name: "company",
                    tabIndex: -1,
                    autoComplete: "off",
                    className: "hidden",
                    "aria-hidden": "true"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 370,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    "data-testid": "contact-submit",
                    type: "submit",
                    disabled: loading || loadingAvailability || !selectedTime,
                    className: "bg-primary text-white py-4 mt-4 text-xs uppercase tracking-widest font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50",
                    children: loading ? "Requesting Appointment..." : "Request Appointment"
                }, void 0, false, {
                    fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
                    lineNumber: 371,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
            lineNumber: 255,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/Galantesjewelry/components/ContactForm.tsx",
        lineNumber: 248,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Galantesjewelry_components_ContactForm_tsx_0vf53nx._.js.map