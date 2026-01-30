'use client';

// Providers wrapper for client-side contexts

import { AuthProvider } from '../contexts/AuthContext';
import { HomeProvider } from '../contexts/HomeContext';
import { SocketProvider } from '../contexts/SocketContext';
import { EntityProvider } from '../contexts/entity.context';
import { PermissionProvider } from '../contexts/PermissionContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HomeProvider>
        <SocketProvider>
          <PermissionProvider>
            <EntityProvider>
              {children}
              <Toaster position="top-right" richColors />
            </EntityProvider>
          </PermissionProvider>
        </SocketProvider>
      </HomeProvider>
    </AuthProvider>
  );
}

export default Providers;
