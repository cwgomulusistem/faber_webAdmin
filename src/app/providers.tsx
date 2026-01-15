'use client';

// Providers wrapper for client-side contexts

import { AuthProvider } from '../contexts/AuthContext';
import { TenantProvider } from '../contexts/TenantContext';
import { SocketProvider } from '../contexts/SocketContext';
import { EntityProvider } from '../contexts/entity.context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>
        <SocketProvider>
          <EntityProvider>
            {children}
          </EntityProvider>
        </SocketProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default Providers;
