'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { usePermission } from '../../contexts/PermissionContext';
import { toast } from 'sonner';

// PBAC v2.0: Map routes to menu permission keys
const routePermissions: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/dashboard/devices': 'devices',
  '/dashboard/rooms': 'rooms',
  '/dashboard/scenes': 'scenes',
  '/dashboard/members': 'members',
  '/dashboard/permissions': 'members',
  '/dashboard/settings': 'settings',
  '/dashboard/logs': 'logs',
  '/dashboard/homes': 'homes',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { can, isLoading, bundle } = usePermission();

  // PBAC v2.0: Route-level permission guard
  useEffect(() => {
    if (isLoading || !bundle) return;

    // Find the matching route permission
    const menuKey = routePermissions[pathname];
    
    if (menuKey && !can('view', 'menu', menuKey)) {
      toast.error('Bu sayfaya erişim izniniz yok');
      router.replace('/dashboard');
    }
  }, [pathname, can, isLoading, bundle, router]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="font-display h-screen overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-display h-screen overflow-hidden flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        {children}
      </main>
    </div>
  );
}
