import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
/**
 * useOperationStream — connects to the SSE stream for a given operation.
 * Falls back gracefully if EventSource is not supported.
 * New events are appended to the `events` array in real-time.
 */
export function useOperationStream(operationId) {
    const [events, setEvents] = useState([]);
    const [connection, setConnection] = useState({
        status: "closed",
        lastEventId: 0,
    });
    const esRef = useRef(null);
    useEffect(() => {
        if (!operationId)
            return;
        // Reset on operation change
        setEvents([]);
        setConnection({ status: "connecting", lastEventId: 0 });
        if (typeof EventSource === "undefined") {
            setConnection({ status: "error", lastEventId: 0, error: "EventSource not supported" });
            return;
        }
        const baseUrl = (api.defaults.baseURL ?? "").replace(/\/$/, "");
        const url = `${baseUrl}/api/v1/operations/${operationId}/stream`;
        const es = new EventSource(url, { withCredentials: true });
        esRef.current = es;
        es.addEventListener("open", () => {
            setConnection((prev) => ({ ...prev, status: "connected" }));
        });
        es.addEventListener("operation_event", (e) => {
            try {
                const data = JSON.parse(e.data);
                setEvents((prev) => {
                    // Deduplicate by id
                    if (prev.some((ev) => ev.id === data.id))
                        return prev;
                    return [...prev, data];
                });
                setConnection((prev) => ({
                    ...prev,
                    status: "connected",
                    lastEventId: Math.max(prev.lastEventId, data.id),
                }));
            }
            catch {
                // ignore parse errors
            }
        });
        es.addEventListener("error", () => {
            setConnection((prev) => ({
                ...prev,
                status: "error",
                error: "SSE connection error — falling back to polling",
            }));
            es.close();
        });
        return () => {
            es.close();
            esRef.current = null;
            setConnection({ status: "closed", lastEventId: 0 });
        };
    }, [operationId]);
    const closeStream = () => {
        esRef.current?.close();
        esRef.current = null;
        setConnection({ status: "closed", lastEventId: 0 });
    };
    return { events, connection, closeStream };
}
// ---------------------------------------------------------------------------
// Polling hooks (kept as fallback / primary for list view)
// ---------------------------------------------------------------------------
export function useOperations(tenantId) {
    return useQuery({
        queryKey: ["admin", "operations", tenantId],
        enabled: Boolean(tenantId),
        refetchInterval: 2500,
        queryFn: async () => {
            const { data } = await api.get("/api/v1/operations", {
                params: { tenant_id: tenantId, limit: 20 },
            });
            return data;
        },
    });
}
export function useOperation(operationId) {
    return useQuery({
        queryKey: ["admin", "operation", operationId],
        enabled: Boolean(operationId),
        refetchInterval: 1500,
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/operations/${operationId}`);
            return data;
        },
    });
}
