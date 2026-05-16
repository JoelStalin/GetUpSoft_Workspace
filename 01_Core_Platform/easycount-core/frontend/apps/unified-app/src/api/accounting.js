import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
export function useLedgerEntries(tenantId, page = 1, size = 20) {
    return useQuery({
        queryKey: ["ledger-entries", tenantId, page, size],
        enabled: Boolean(tenantId),
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/admin/tenants/${tenantId}/accounting/ledger`, {
                params: { page, size },
            });
            return data;
        },
    });
}
export function useTenantSettings(tenantId) {
    return useQuery({
        queryKey: ["tenant-settings", tenantId],
        enabled: Boolean(tenantId),
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/admin/tenants/${tenantId}/settings`);
            return data;
        },
    });
}
