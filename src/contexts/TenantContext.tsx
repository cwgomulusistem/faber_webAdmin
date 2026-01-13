'use client';

// Tenant Context
// Multi-tenant state management for white-labeling

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  TenantConfig,
  defaultTenant,
  getTenantConfig,
  getTenantFromHostname,
} from '../config/tenant.config';

interface TenantContextType {
  tenant: TenantConfig;
  isLoading: boolean;
  updateTenant: (slug: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: defaultTenant,
  isLoading: true,
  updateTenant: () => {},
});

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenant);
  const [isLoading, setIsLoading] = useState(true);

  // Detect tenant from hostname on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const tenantSlug = getTenantFromHostname(hostname);
      const config = getTenantConfig(tenantSlug);
      setTenant(config);
      
      // Apply CSS variables for theming
      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
      if (config.backgroundColor) {
        document.documentElement.style.setProperty('--color-background', config.backgroundColor);
      }
    }
    setIsLoading(false);
  }, []);

  // Update tenant programmatically
  const updateTenant = (slug: string) => {
    const config = getTenantConfig(slug);
    setTenant(config);
  };

  const value = useMemo(() => ({
    tenant,
    isLoading,
    updateTenant,
  }), [tenant, isLoading]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantContext;
