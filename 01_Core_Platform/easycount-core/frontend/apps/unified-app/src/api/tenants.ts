import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export interface TenantItem {
  id: number;
  name: string;
  rnc: string;
  env: string;
  status: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await api.get<TenantItem[]>("/api/v1/admin/tenants");
      return data;
    },
  });
}
