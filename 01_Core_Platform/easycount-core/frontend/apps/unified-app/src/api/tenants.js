import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
export function useTenants() {
    return useQuery({
        queryKey: ["tenants"],
        queryFn: async () => {
            const { data } = await api.get("/api/v1/admin/tenants");
            return data;
        },
    });
}
