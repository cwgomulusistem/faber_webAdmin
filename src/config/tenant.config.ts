// Tenant Configuration
// Multi-tenant and white-labeling configuration system

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logo: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  features: {
    showScenes: boolean;
    showEnergy: boolean;
    showTelemetry: boolean;
    allowDeviceAdd: boolean;
    allowUserManagement: boolean;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

// Default tenant configuration (Everyone)
export const defaultTenant: TenantConfig = {
  id: 'everyone',
  name: 'Faber Smart Home',
  slug: 'everyone',
  logo: '/images/logo.svg',
  favicon: '/favicon.ico',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  backgroundColor: '#f8fafc',
  features: {
    showScenes: true,
    showEnergy: true,
    showTelemetry: true,
    allowDeviceAdd: true,
    allowUserManagement: true,
  },
};

// Tenant registry - add new tenants here
export const tenantRegistry: Record<string, TenantConfig> = {
  everyone: defaultTenant,
  // Example: Vadi İstanbul tenant
  // vadi: {
  //   id: 'vadi',
  //   name: 'Vadi İstanbul',
  //   slug: 'vadi',
  //   logo: '/tenants/vadi/logo.svg',
  //   primaryColor: '#16a34a',
  //   secondaryColor: '#15803d',
  //   features: {
  //     showScenes: true,
  //     showEnergy: true,
  //     showTelemetry: true,
  //     allowDeviceAdd: false,
  //     allowUserManagement: false,
  //   },
  // },
};

/**
 * Get tenant configuration from subdomain or slug
 * @param identifier - subdomain or tenant slug
 */
export function getTenantConfig(identifier?: string): TenantConfig {
  if (!identifier) return defaultTenant;
  
  const normalizedId = identifier.toLowerCase().trim();
  return tenantRegistry[normalizedId] || defaultTenant;
}

/**
 * Extract tenant from hostname
 * @param hostname - e.g., "vadi.faber.app"
 */
export function getTenantFromHostname(hostname: string): string {
  // localhost or IP address → default tenant
  if (hostname.includes('localhost') || /^\d/.test(hostname)) {
    return 'everyone';
  }
  
  // Extract subdomain: vadi.faber.app → vadi
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return 'everyone';
}
