'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// PBAC v3.0: Map routes to menu permission keys (includes sub-routes)
const routePermissionPatterns: Array<{ pattern: string; menuKey: string }> = [
  { pattern: '/dashboard/devices', menuKey: 'devices' },
  { pattern: '/dashboard/rooms', menuKey: 'rooms' },
  { pattern: '/dashboard/scenes', menuKey: 'scenes' },
  { pattern: '/dashboard/members', menuKey: 'members' },
  { pattern: '/dashboard/permissions', menuKey: 'members' },
  { pattern: '/dashboard/settings', menuKey: 'settings' },
  { pattern: '/dashboard/logs', menuKey: 'logs' },
  { pattern: '/dashboard/homes', menuKey: 'homes' },
  { pattern: '/dashboard', menuKey: 'dashboard' }, // Must be last (most general)
];

// Find the matching menu key for a given path
const getMenuKeyForPath = (pathname: string): string | null => {
  for (const { pattern, menuKey } of routePermissionPatterns) {
    if (pathname === pattern || pathname.startsWith(`${pattern}/`)) {
      return menuKey;
    }
  }
  return null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { can, isLoading, bundle } = usePermission();
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Add auth check

  // Guard 1: Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Guard 2: Route-level permission guard (supports sub-routes)
  useEffect(() => {
    if (isLoading || !bundle || authLoading || !isAuthenticated) return;

    // Find the matching route permission (supports sub-routes like /members/[id])
    const menuKey = getMenuKeyForPath(pathname);

    if (menuKey && !can('view', 'menu', menuKey)) {
      toast.error('Bu sayfaya erişim izniniz yok');
      router.replace('/dashboard');
    }
  }, [pathname, can, isLoading, bundle, router, isAuthenticated, authLoading]);

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
