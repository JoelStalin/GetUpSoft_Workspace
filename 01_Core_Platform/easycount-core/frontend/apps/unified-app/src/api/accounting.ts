import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export interface LedgerEntryItem {
  id: number;
  invoice_id?: number | null;
  encf: string | null;
  referencia: string;
  cuenta: string;
  descripcion: string | null;
  debit: string;
  credit: string;
  fecha: string;
}

export interface LedgerPaginatedResponse {
  items: LedgerEntryItem[];
  total: number;
  page: number;
  size: number;
}

export interface TenantSettings {
  moneda: string;
  correo_facturacion: string | null;
  updated_at: string;
}

export function useLedgerEntries(tenantId?: string | null, page = 1, size = 20) {
  return useQuery({
    queryKey: ["ledger-entries", tenantId, page, size],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const { data } = await api.get<LedgerPaginatedResponse>(`/api/v1/admin/tenants/${tenantId}/accounting/ledger`, {
        params: { page, size },
      });
      return data;
    },
  });
}

export function useTenantSettings(tenantId?: string) {
  return useQuery({
    queryKey: ["tenant-settings", tenantId],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const { data } = await api.get<TenantSettings>(`/api/v1/admin/tenants/${tenantId}/settings`);
      return data;
    },
  });
}
