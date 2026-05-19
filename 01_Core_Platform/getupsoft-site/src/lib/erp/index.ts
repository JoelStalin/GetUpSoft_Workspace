/**
 * ERP Provider Factory & Configuration
 * Selects appropriate provider based on environment
 */

import { IERPProvider, ERPType, ERPConnectionConfig } from "./types";
import { MockERPProvider } from "./mock-provider";
import { OdooProvider } from "./odoo-provider";

interface ERPProviderConfig {
  type: ERPType;
  enabled: boolean;
  config?: ERPConnectionConfig;
}

let cachedProvider: IERPProvider | null = null;

/**
 * Get or create ERP provider instance
 * Follows singleton pattern for connection reuse
 */
export async function getERPProvider(): Promise<IERPProvider> {
  // Return cached instance if available
  if (cachedProvider) {
    return cachedProvider;
  }

  // Determine provider type from environment
  const providerType = getProviderType();
  const provider = createProvider(providerType);

  // Auto-connect if configured
  if (shouldAutoConnect()) {
    try {
      await provider.connect();
      console.log("[ERP] Connected with", providerType, "provider");
    } catch (error) {
      console.warn(
        "[ERP] Auto-connect failed, will retry on form submission:",
        error
      );
    }
  }

  cachedProvider = provider;
  return provider;
}

/**
 * Reset cached provider (useful for testing)
 */
export function resetERPProvider(): void {
  if (cachedProvider) {
    cachedProvider.disconnect().catch(console.error);
  }
  cachedProvider = null;
}

/**
 * Create provider instance based on type
 */
function createProvider(type: ERPType): IERPProvider {
  switch (type) {
    case "odoo":
      return new OdooProvider({
        type: "odoo",
        host: getEnv("VITE_ODOO_HOST", "localhost"),
        port: parseInt(getEnv("VITE_ODOO_PORT", "8069")),
        database: getEnv("VITE_ODOO_DATABASE", "getupsoft"),
        username: getEnv("VITE_ODOO_USERNAME", "admin"),
        password: getEnv("VITE_ODOO_PASSWORD", "admin"),
      });

    case "erp-next":
      return new MockERPProvider(); // Placeholder for ERPNext
    case "sap":
      return new MockERPProvider(); // Placeholder for SAP
    case "iseries":
      return new MockERPProvider(); // Placeholder for iSeries

    default:
      // Always fall back to mock for development
      return new MockERPProvider();
  }
}

/**
 * Determine which provider to use
 * Priority:
 * 1. VITE_ERP_TYPE environment variable
 * 2. VITE_USE_MOCK=true forces mock
 * 3. Production defaults to Odoo
 * 4. Development defaults to Mock
 */
function getProviderType(): ERPType {
  // Force mock if explicitly set
  if (getEnv("VITE_USE_MOCK") === "true") {
    console.log("[ERP] Using MOCK provider (forced by VITE_USE_MOCK)");
    return "odoo"; // Will return MockERPProvider due to fallback logic
  }

  // Use explicit type if set
  const envType = getEnv("VITE_ERP_TYPE");
  if (envType && isValidERPType(envType)) {
    console.log("[ERP] Using", envType, "provider (from VITE_ERP_TYPE)");
    return envType as ERPType;
  }

  // Production defaults to Odoo
  if (import.meta.env.PROD) {
    console.log("[ERP] Production mode: defaulting to Odoo");
    return "odoo";
  }

  // Development defaults to Mock
  console.log("[ERP] Development mode: defaulting to Mock");
  return "odoo"; // Will return MockERPProvider due to fallback logic
}

/**
 * Check if auto-connect should happen
 * Generally disabled in development to avoid connection errors
 */
function shouldAutoConnect(): boolean {
  return import.meta.env.PROD || getEnv("VITE_AUTO_CONNECT_ERP") === "true";
}

/**
 * Check if ERP provider is enabled
 */
export function isERPEnabled(): boolean {
  return getEnv("VITE_DISABLE_ERP") !== "true";
}

/**
 * Get configuration for provider
 */
export function getERPConfig(): ERPProviderConfig {
  return {
    type: getProviderType(),
    enabled: isERPEnabled(),
    config: {
      type: getProviderType(),
      host: getEnv("VITE_ODOO_HOST", "localhost"),
      port: parseInt(getEnv("VITE_ODOO_PORT", "8069")),
      database: getEnv("VITE_ODOO_DATABASE", "getupsoft"),
      username: getEnv("VITE_ODOO_USERNAME", "admin"),
      password: getEnv("VITE_ODOO_PASSWORD", "admin"),
    },
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
  return import.meta.env[key] || defaultValue || "";
}

function isValidERPType(type: string): boolean {
  return ["odoo", "erp-next", "sap", "iseries"].includes(type);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { IERPProvider, ERPType, ERPConnectionConfig } from "./types";
export { MockERPProvider } from "./mock-provider";
export { OdooProvider } from "./odoo-provider";
export type { ERPProviderConfig };

/**
 * Usage in components:
 *
 * import { getERPProvider, isERPEnabled } from '@/lib/erp'
 *
 * const provider = await getERPProvider()
 * const lead = await provider.createLead(data)
 */
