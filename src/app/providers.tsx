'use client';

// Providers wrapper for client-side contexts

import { AuthProvider } from '../contexts/AuthContext';
import { HomeProvider } from '../contexts/HomeContext';
import { SocketProvider } from '../contexts/SocketContext';
import { EntityProvider } from '../contexts/entity.context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HomeProvider>
        <SocketProvider>
          <EntityProvider>
            {children}
          </EntityProvider>
        </SocketProvider>
      </HomeProvider>
    </AuthProvider>
  );
}

export default Providers;
