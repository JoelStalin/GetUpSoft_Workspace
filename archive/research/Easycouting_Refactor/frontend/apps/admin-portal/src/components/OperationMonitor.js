import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useOperation, useOperations, useOperationStream } from "../api/operations";
// ---------------------------------------------------------------------------
// SSE connection status badge
// ---------------------------------------------------------------------------
function ConnectionBadge({ status }) {
    const map = {
        connected: { label: "SSE en vivo", cls: "bg-emerald-900/40 text-emerald-400 border-emerald-700" },
        connecting: { label: "Conectando…", cls: "bg-yellow-900/40 text-yellow-400 border-yellow-700" },
        error: { label: "Polling", cls: "bg-orange-900/40 text-orange-400 border-orange-700" },
        closed: { label: "Inactivo", cls: "bg-slate-800 text-slate-400 border-slate-700" },
    };
    const { label, cls } = map[status] ?? map.closed;
    return (_jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`, children: label }));
}
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function OperationMonitor({ tenantId }) {
    const operationsQuery = useOperations(tenantId);
    const operations = operationsQuery.data?.items ?? [];
    const [selectedOperationId, setSelectedOperationId] = useState("");
    // Auto-select first operation
    useEffect(() => {
        if (!selectedOperationId && operations.length > 0) {
            setSelectedOperationId(operations[0].operation_id);
        }
    }, [operations, selectedOperationId]);
    // Polling fallback for operation detail
    const operationQuery = useOperation(selectedOperationId);
    const operation = operationQuery.data;
    // SSE real-time stream for events
    const { events: sseEvents, connection } = useOperationStream(selectedOperationId || undefined);
    // Merge SSE events with polled events (SSE takes priority for new events)
    const mergedEvents = useMemo(() => {
        const polled = operation?.events ?? [];
        if (sseEvents.length === 0)
            return polled;
        // Build a map from polled events, then overlay SSE events
        const byId = new Map();
        for (const ev of polled)
            byId.set(ev.id, ev);
        for (const ev of sseEvents)
            byId.set(ev.id, ev);
        return Array.from(byId.values()).sort((a, b) => a.id - b.id);
    }, [operation?.events, sseEvents]);
    return (_jsxs("section", { className: "space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Monitor t\u00E9cnico DGII / Odoo" }), _jsx("p", { className: "text-xs text-slate-400", children: "Eventos en tiempo real v\u00EDa SSE con fallback a polling controlado." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ConnectionBadge, { status: connection.status }), _jsxs("span", { className: "rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300", children: [operations.length, " operaciones"] })] })] }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-[300px,1fr]", children: [_jsxs("div", { className: "space-y-2", children: [operations.map((item) => (_jsxs("button", { type: "button", onClick: () => setSelectedOperationId(item.operation_id), className: `w-full rounded-xl border p-3 text-left transition ${selectedOperationId === item.operation_id
                                    ? "border-primary bg-primary/10"
                                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "font-mono text-xs text-slate-300", children: item.document_number ?? item.operation_id.slice(0, 12) }), _jsx("span", { className: "text-[10px] uppercase tracking-wide text-primary", children: item.state })] }), _jsxs("p", { className: "mt-1 text-sm text-slate-100", children: [item.document_type, " \u00B7 ", item.environment] }), _jsxs("p", { className: "mt-1 text-xs text-slate-400", children: ["TrackId: ", item.dgii_track_id ?? "pendiente"] })] }, item.operation_id))), operations.length === 0 && (_jsx("div", { className: "rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500", children: "Sin operaciones registradas." }))] }), _jsx("div", { className: "space-y-4", children: !operation ? (_jsx("div", { className: "rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-500", children: "Selecciona una operaci\u00F3n para ver el detalle." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [_jsx(Metric, { label: "Estado", value: operation.state }), _jsx(Metric, { label: "Ambiente", value: operation.environment }), _jsx(Metric, { label: "TrackId DGII", value: operation.dgii_track_id ?? "—", mono: true }), _jsx(Metric, { label: "Odoo Sync", value: operation.odoo_sync_state })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: [_jsx(Meta, { label: "Tipo", value: operation.document_type }), _jsx(Meta, { label: "N\u00FAmero", value: operation.document_number ?? "—", mono: true }), _jsx(Meta, { label: "Monto", value: `${operation.currency} ${operation.amount_total}`, mono: true }), _jsx(Meta, { label: "Reintentos", value: String(operation.retry_count) }), _jsx(Meta, { label: "Iniciado", value: new Date(operation.started_at).toLocaleString() }), operation.completed_at && (_jsx(Meta, { label: "Completado", value: new Date(operation.completed_at).toLocaleString() }))] }), connection.status === "error" && connection.error && (_jsxs("div", { className: "rounded-lg border border-orange-800 bg-orange-950/30 px-3 py-2 text-xs text-orange-300", children: ["\u26A0\uFE0F ", connection.error] })), _jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsxs("h4", { className: "text-sm font-semibold text-slate-100", children: ["Eventos (", mergedEvents.length, ")"] }), sseEvents.length > 0 && (_jsxs("span", { className: "text-[10px] text-emerald-400", children: ["+", sseEvents.length, " en vivo"] }))] }), _jsxs("div", { className: "space-y-2 max-h-72 overflow-y-auto pr-1", children: [mergedEvents.map((event) => (_jsx(EventRow, { event: event }, event.id))), mergedEvents.length === 0 && (_jsx("p", { className: "text-xs text-slate-500", children: "Sin eventos registrados a\u00FAn." }))] })] }), _jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsx("h4", { className: "mb-3 text-sm font-semibold text-slate-100", children: "Evidencia" }), _jsxs("div", { className: "space-y-2", children: [operation.evidence.map((item) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300", children: [_jsx("span", { children: item.artifact_type }), _jsx("span", { className: "font-mono text-slate-400 truncate max-w-[200px]", children: item.file_path })] }, item.id))), operation.evidence.length === 0 && (_jsx("p", { className: "text-xs text-slate-500", children: "A\u00FAn no hay archivos asociados." }))] })] })] })) })] })] }));
}
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function EventRow({ event }) {
    const stateColors = {
        ACCEPTED: "text-emerald-400",
        ACCEPTED_CONDITIONAL: "text-teal-400",
        REJECTED: "text-red-400",
        FAILED_TECHNICAL: "text-red-500",
        CANCELLED: "text-slate-500",
        QUEUED: "text-slate-400",
        SENDING_TO_DGII: "text-blue-400",
        DGII_RESPONSE_RECEIVED: "text-blue-300",
        TRACKID_REGISTERED: "text-cyan-400",
        SYNCING_TO_ODOO: "text-violet-400",
        SYNCED_TO_ODOO: "text-violet-300",
        RETRYING: "text-yellow-400",
    };
    const colorCls = stateColors[event.status] ?? "text-primary";
    return (_jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-950/60 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "text-sm font-medium text-slate-100", children: event.title }), _jsx("span", { className: `text-[10px] uppercase tracking-wide font-semibold ${colorCls}`, children: event.status })] }), _jsxs("p", { className: "mt-1 text-[10px] text-slate-500", children: [new Date(event.occurred_at).toLocaleString(), event.duration_ms != null && ` · ${event.duration_ms}ms`, event.stage && ` · ${event.stage}`] }), event.message && _jsx("p", { className: "mt-2 text-sm text-slate-300", children: event.message })] }));
}
function Metric({ label, value, mono = false }) {
    return (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-400", children: label }), _jsx("p", { className: `mt-2 text-sm ${mono ? "font-mono text-slate-200" : "font-semibold text-white"}`, children: value })] }));
}
function Meta({ label, value, mono = false }) {
    return (_jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2", children: [_jsx("p", { className: "text-[10px] uppercase tracking-wide text-slate-500", children: label }), _jsx("p", { className: `mt-1 text-sm ${mono ? "font-mono text-slate-300" : "text-slate-200"}`, children: value })] }));
}
