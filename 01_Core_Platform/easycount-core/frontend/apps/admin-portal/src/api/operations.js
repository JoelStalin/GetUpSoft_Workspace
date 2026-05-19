import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
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
