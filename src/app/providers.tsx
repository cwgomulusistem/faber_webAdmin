'use client';

// Providers wrapper for client-side contexts

import { AuthProvider } from '../contexts/AuthContext';
import { TenantProvider } from '../contexts/TenantContext';
import { SocketProvider } from '../contexts/SocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default Providers;
