'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// PBAC v3.0: Map routes to menu permission keys and role requirements
interface RoutePermission {
  pattern: string;
  menuKey: string;
  requiresMaster?: boolean;
  requiredMemberRoles?: string[];
}

const routePermissionPatterns: RoutePermission[] = [
  { pattern: '/dashboard/devices', menuKey: 'devices' },
  { pattern: '/dashboard/rooms', menuKey: 'rooms' },
  { pattern: '/dashboard/scenes', menuKey: 'scenes', requiresMaster: true },
  { pattern: '/dashboard/members', menuKey: 'members', requiredMemberRoles: ['OWNER', 'ADMIN'] },
  { pattern: '/dashboard/permissions', menuKey: 'members', requiredMemberRoles: ['OWNER', 'ADMIN'] },
  { pattern: '/dashboard/settings', menuKey: 'settings', requiredMemberRoles: ['OWNER', 'ADMIN'] },
  { pattern: '/dashboard/logs', menuKey: 'logs', requiresMaster: true },
  { pattern: '/dashboard/homes', menuKey: 'homes' },
  { pattern: '/dashboard', menuKey: 'dashboard' }, // Must be last (most general)
];

// Find the matching route permission for a given path
const getRoutePermission = (pathname: string): RoutePermission | null => {
  for (const routePerm of routePermissionPatterns) {
    if (pathname === routePerm.pattern || pathname.startsWith(`${routePerm.pattern}/`)) {
      return routePerm;
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

  // Get active home permission for role checking
  const { getHomePermission } = usePermission();

  // Guard 2: Route-level permission guard (supports sub-routes + role requirements)
  useEffect(() => {
    if (isLoading || !bundle || authLoading || !isAuthenticated) return;

    // Find the matching route permission (supports sub-routes like /members/[id])
    const routePerm = getRoutePermission(pathname);
    if (!routePerm) return;

    console.log('[Layout Guard] Checking route:', pathname, {
      routePerm,
      bundleRole: bundle.role,
      menuKey: routePerm.menuKey,
    });

    // Check 1: Menu permission
    const hasMenuPerm = can('view', 'menu', routePerm.menuKey);
    console.log('[Layout Guard] Menu permission check:', routePerm.menuKey, '=', hasMenuPerm);
    
    if (!hasMenuPerm) {
      console.log('[Layout Guard] BLOCKED - No menu permission');
      toast.error('Bu sayfaya erişim izniniz yok');
      router.replace('/dashboard');
      return;
    }

    // Check 2: MASTER role requirement
    if (routePerm.requiresMaster && bundle.role !== 'MASTER') {
      console.log('[Layout Guard] BLOCKED - Requires MASTER, user is', bundle.role);
      toast.error('Bu sayfa sadece sistem yöneticileri içindir');
      router.replace('/dashboard');
      return;
    }

    // Check 3: Member role requirement
    if (routePerm.requiredMemberRoles && bundle.role !== 'MASTER') {
      const homePermission = getHomePermission();
      console.log('[Layout Guard] Member role check:', {
        requiredRoles: routePerm.requiredMemberRoles,
        homePermission: homePermission ? { memberRole: homePermission.memberRole, id: homePermission.id } : null
      });
      
      if (homePermission) {
        const hasRequiredRole = routePerm.requiredMemberRoles.includes(homePermission.memberRole);
        console.log('[Layout Guard] Has required role:', hasRequiredRole);
        
        if (!hasRequiredRole) {
          console.log('[Layout Guard] BLOCKED - Requires', routePerm.requiredMemberRoles.join('/'), 'but user has', homePermission.memberRole);
          toast.error(`Bu sayfa için ${routePerm.requiredMemberRoles.join(' veya ')} rolü gerekli`);
          router.replace('/dashboard');
          return;
        }
      } else {
        console.log('[Layout Guard] No home permission found - skipping member role check');
      }
    }

    console.log('[Layout Guard] Access ALLOWED for', pathname);
  }, [pathname, can, isLoading, bundle, router, isAuthenticated, authLoading, getHomePermission]);

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
