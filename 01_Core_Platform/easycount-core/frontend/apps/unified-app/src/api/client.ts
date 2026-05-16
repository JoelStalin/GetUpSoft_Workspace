import { createApiClient } from "@getupsoft/api-client";
import { useAuthStore } from "../store/auth-store";

export function resolveApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
}

export const api = createApiClient({
  baseURL: resolveApiBaseUrl(),
  getAccessToken: () => useAuthStore.getState().accessToken,
  getTenantId: () => useAuthStore.getState().user?.tenantId ?? undefined,
  onUnauthorized: () => useAuthStore.getState().clearSession(),
});
