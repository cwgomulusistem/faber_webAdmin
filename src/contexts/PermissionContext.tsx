'use client';

// Permission Context (PBAC v2.0)
// Implements CASL-style can() function for permission checking
// Supports LocalStorage caching with version-based invalidation
// Listens for real-time PERMISSION_UPDATE events via WebSocket

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '@/hooks/useSocket';
import api from '@/services/api.service';
import { getActiveHomeId } from '@/lib/utils';
import { toast } from 'sonner';

// ==================== Types ====================

export type PermissionAction = 'view' | 'control' | 'manage' | 'delete';
export type PermissionSubject = 'menu' | 'device' | 'room' | 'scene' | 'member';

export interface HomePermission {
  id: string;
  name: string;
  memberRole: string; // OWNER | ADMIN | MEMBER | GUEST
  defaultPermission: string; // VIEW_ONLY | CONTROL | FULL
  menuPermissions: Record<string, boolean>;
  devicePermissions: Record<string, string>; // deviceId -> level
  roomPermissions: Record<string, string>; // roomId -> level
}

export interface PermissionBundle {
  role: string; // MASTER | SUB
  permissionVersion: number;
  homes: HomePermission[];
}

export interface PermissionContextType {
  bundle: PermissionBundle | null;
  isLoading: boolean;
  version: number;
  can: (action: PermissionAction, subject: PermissionSubject, target?: string) => boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  getHomePermission: (homeId?: string) => HomePermission | null;
}

// ==================== Constants ====================

const CACHE_KEY = 'faber_permissions';
const VERSION_KEY = 'faber_permissions_version';

// Default menu permissions for new users
export const DEFAULT_MENU_PERMISSIONS: Record<string, boolean> = {
  dashboard: true,
  devices: true,
  rooms: true,
  scenes: false,
  members: false,
  settings: false,
  logs: false,
};

// ==================== Context ====================

const PermissionContext = createContext<PermissionContextType | null>(null);

// ==================== Hook ====================

export function usePermission(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}

// ==================== Helper Functions ====================

/**
 * Check if current permission level meets the required level
 * Hierarchy: VIEW_ONLY (1) < CONTROL (2) < FULL (3)
 */
function checkPermissionLevel(currentLevel: string, action: PermissionAction): boolean {
  const levels: Record<string, number> = {
    'VIEW_ONLY': 1,
    'CONTROL': 2,
    'FULL': 3,
  };

  const required: Record<PermissionAction, number> = {
    'view': 1,
    'control': 2,
    'manage': 3,
    'delete': 3,
  };

  return (levels[currentLevel] || 0) >= (required[action] || 0);
}

/**
 * Get resource permission with wildcard (*) support
 * Priority: specific resource > wildcard (*) > default permission
 */
function getResourcePermission(
  perms: Record<string, string>,
  resourceId: string,
  defaultPerm: string
): string {
  // 1. Check specific resource permission
  if (perms[resourceId]) {
    return perms[resourceId];
  }
  // 2. Check wildcard permission
  if (perms['*']) {
    return perms['*'];
  }
  // 3. Return default permission
  return defaultPerm;
}

// ==================== Provider ====================

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { subscribeToEvent, isConnected } = useSocket();
  const [bundle, setBundle] = useState<PermissionBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch permissions from API with caching
  const fetchPermissions = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setBundle(null);
      setIsLoading(false);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh && typeof window !== 'undefined') {
      const cachedVersion = localStorage.getItem(VERSION_KEY);
      const cachedData = localStorage.getItem(CACHE_KEY);

      if (cachedVersion && cachedData) {
        try {
          // Try to use cached data while fetching fresh data
          const parsed = JSON.parse(cachedData) as PermissionBundle;
          setBundle(parsed);
        } catch {
          // Invalid cache, continue to fetch
        }
      }
    }

    try {
      const headers: Record<string, string> = {};
      
      // Send cached version for 304 Not Modified check
      if (!forceRefresh && typeof window !== 'undefined') {
        const cachedVersion = localStorage.getItem(VERSION_KEY);
        if (cachedVersion) {
          headers['X-Permission-Version'] = cachedVersion;
        }
      }

      const response = await api.get('/auth/permissions', { headers });

      // 304 Not Modified - use cached data
      if (response.status === 304) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setBundle(JSON.parse(cachedData));
        }
        return;
      }

      // Store new data
      const newBundle = response.data.data as PermissionBundle;
      setBundle(newBundle);

      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newBundle));
        localStorage.setItem(VERSION_KEY, String(newBundle.permissionVersion));
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      // Keep using cached data if available
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Listen for PERMISSION_UPDATE WebSocket events
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const unsubscribe = subscribeToEvent('PERMISSION_UPDATE', (event: any) => {
      console.log('[Permission] Received PERMISSION_UPDATE:', event);

      // Clear cache and refetch
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(VERSION_KEY);
      }

      fetchPermissions(true);

      // Show toast notification
      if (event.action === 'REVOKED') {
        toast.warning('Bazı izinleriniz güncellendi');
      } else if (event.action === 'UPDATED') {
        toast.info('İzinleriniz güncellendi');
      }
    });

    return unsubscribe;
  }, [isAuthenticated, isConnected, subscribeToEvent, fetchPermissions]);

  // Get permission for a specific home
  const getHomePermission = useCallback((homeId?: string): HomePermission | null => {
    if (!bundle) return null;

    const targetHomeId = homeId || getActiveHomeId();
    if (!targetHomeId) return null;

    return bundle.homes.find(h => h.id === targetHomeId) || null;
  }, [bundle]);

  // CASL-style can() function
  const can = useCallback((
    action: PermissionAction,
    subject: PermissionSubject,
    target?: string
  ): boolean => {
    if (!bundle) return false;

    // MASTER role can do everything
    if (bundle.role === 'MASTER') return true;

    const activeHome = getHomePermission();
    if (!activeHome) return false;

    // OWNER role has full access
    if (activeHome.memberRole === 'OWNER') return true;

    switch (subject) {
      case 'menu':
        // Check menu permission
        return target ? activeHome.menuPermissions[target] === true : false;

      case 'device':
        if (!target) return false;
        const deviceLevel = getResourcePermission(
          activeHome.devicePermissions,
          target,
          activeHome.defaultPermission
        );
        return checkPermissionLevel(deviceLevel, action);

      case 'room':
        if (!target) return false;
        const roomLevel = getResourcePermission(
          activeHome.roomPermissions,
          target,
          activeHome.defaultPermission
        );
        return checkPermissionLevel(roomLevel, action);

      case 'scene':
        // Scenes require menu permission + CONTROL level
        if (!activeHome.menuPermissions['scenes']) return false;
        if (action === 'view') return true;
        return checkPermissionLevel(activeHome.defaultPermission, action);

      case 'member':
        // Only OWNER and ADMIN can manage members
        return ['OWNER', 'ADMIN'].includes(activeHome.memberRole);

      default:
        return false;
    }
  }, [bundle, getHomePermission]);

  // Memoized context value
  const value = useMemo<PermissionContextType>(() => ({
    bundle,
    isLoading,
    version: bundle?.permissionVersion || 0,
    can,
    refetch: fetchPermissions,
    getHomePermission,
  }), [bundle, isLoading, can, fetchPermissions, getHomePermission]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export default PermissionContext;
