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
  isExpired: boolean;
  accessExpiresAt?: string;
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
  isExpired: boolean;
  can: (action: PermissionAction, subject: PermissionSubject, target?: string) => boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  getHomePermission: (homeId?: string) => HomePermission | null;
  // PBAC v3.0 Helper Functions
  canManageDevices: () => boolean;
  canManageScenes: () => boolean;
  canManageMembers: () => boolean;
  isDeviceVisible: (deviceId: string, roomId?: string) => boolean;
  getEffectivePermission: (deviceId: string, roomId?: string) => string;
}

// ==================== Constants ====================

const CACHE_KEY = 'faber_permissions_v4';
const VERSION_KEY = 'faber_permissions_version_v4';

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

  // PBAC v3.0: Get effective permission for a device using conflict resolution
  // Priority: Specific Device > Specific Room > Wildcard Device > Wildcard Room > Default
  const getEffectivePermission = useCallback((deviceId: string, roomId?: string): string => {
    const homePermission = getHomePermission();
    if (!homePermission) return 'VIEW_ONLY';

    // OWNER/ADMIN has FULL access
    if (['OWNER', 'ADMIN'].includes(homePermission.memberRole)) return 'FULL';

    const devicePerms = homePermission.devicePermissions || {};
    const roomPerms = homePermission.roomPermissions || {};
    const defaultPerm = homePermission.defaultPermission || 'VIEW_ONLY';

    // Priority 1: Specific device permission
    if (devicePerms[deviceId]) {
      return devicePerms[deviceId];
    }

    // Priority 2: Specific room permission (if device is in a room)
    if (roomId && roomPerms[roomId]) {
      return roomPerms[roomId];
    }

    // Priority 3: Wildcard device permission (*)
    if (devicePerms['*']) {
      return devicePerms['*'];
    }

    // Priority 4: Wildcard room permission (*)
    if (roomPerms['*']) {
      return roomPerms['*'];
    }

    // Priority 5: Default permission
    return defaultPerm;
  }, [getHomePermission]);

  // PBAC v3.0: Check if device is visible to user
  const isDeviceVisible = useCallback((deviceId: string, roomId?: string): boolean => {
    const level = getEffectivePermission(deviceId, roomId);
    return level !== '' && level !== 'NONE';
  }, [getEffectivePermission]);

  // PBAC v3.0: Check if user can manage devices (add/delete/rename)
  const canManageDevices = useCallback((): boolean => {
    if (!bundle) return false;
    if (bundle.role === 'MASTER') return true;

    const homePermission = getHomePermission();
    if (!homePermission) return false;

    if (homePermission.memberRole === 'OWNER') return true;

    return homePermission.menuPermissions['devices_manage'] === true;
  }, [bundle, getHomePermission]);

  // PBAC v3.0: Check if user can manage scenes (create/edit/delete automations)
  const canManageScenes = useCallback((): boolean => {
    if (!bundle) return false;
    if (bundle.role === 'MASTER') return true;

    const homePermission = getHomePermission();
    if (!homePermission) return false;

    if (homePermission.memberRole === 'OWNER') return true;

    return homePermission.menuPermissions['scenes_manage'] === true;
  }, [bundle, getHomePermission]);

  // PBAC v3.0: Check if user can manage members (invite/remove/change permissions)
  const canManageMembers = useCallback((): boolean => {
    if (!bundle) return false;
    if (bundle.role === 'MASTER') return true;

    const homePermission = getHomePermission();
    if (!homePermission) return false;

    if (homePermission.memberRole === 'OWNER') return true;

    return homePermission.menuPermissions['members_manage'] === true;
  }, [bundle, getHomePermission]);

  // CASL-style can() function
  const can = useCallback((
    action: PermissionAction,
    subject: PermissionSubject,
    target?: string
  ): boolean => {
    if (!bundle) {
      console.log('[can] No bundle - returning false');
      return false;
    }

    // MASTER role can do everything
    if (bundle.role === 'MASTER') {
      console.log('[can] MASTER role - returning true');
      return true;
    }

    const activeHome = getHomePermission();
    if (!activeHome) {
      console.log('[can] No activeHome - returning false');
      return false;
    }

    // Debug: Log the active home details
    console.log('[can] ActiveHome:', {
      id: activeHome.id,
      name: activeHome.name,
      memberRole: activeHome.memberRole,
      isExpired: activeHome.isExpired,
      menuPermissions: activeHome.menuPermissions
    });

    // Check if access is expired (OWNER and ADMIN never expire)
    const isExpiredLocally = activeHome.accessExpiresAt && new Date(activeHome.accessExpiresAt) < new Date();
    const isActuallyExpired = (activeHome.isExpired || !!isExpiredLocally) && !['OWNER', 'ADMIN'].includes(activeHome.memberRole);

    if (isActuallyExpired) {
      // Whitelist 'dashboard' menu so user can see the "Access Expired" alert
      if (subject === 'menu' && target === 'dashboard' && action === 'view') {
        return true;
      }
      return false;
    }

    // OWNER role has full access
    if (activeHome.memberRole === 'OWNER') {
      console.log('[can] OWNER role - returning true for all');
      return true;
    }

    switch (subject) {
      case 'menu':
        // Check menu permission
        const hasMenuPerm = target ? activeHome.menuPermissions[target] === true : false;
        console.log(`[can] menu.${target} = ${hasMenuPerm} (value: ${activeHome.menuPermissions[target || '']})`);
        return hasMenuPerm;

      case 'device':
        if (!target) return false;
        // Use getEffectivePermission for proper conflict resolution
        const deviceLevel = getEffectivePermission(target);
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
        // For manage/delete actions, check scenes_manage
        if (action === 'manage' || action === 'delete') {
          return canManageScenes();
        }
        return checkPermissionLevel(activeHome.defaultPermission, action);

      case 'member':
        // Only OWNER can manage members, ADMIN can view
        if (action === 'view') {
          return ['OWNER', 'ADMIN'].includes(activeHome.memberRole);
        }
        return canManageMembers();

      default:
        return false;
    }
  }, [bundle, getHomePermission, getEffectivePermission, canManageScenes, canManageMembers]);

  // Memoized context value
  // Compute effective expiration state
  const isExpired = useMemo(() => {
    const homePerm = getHomePermission();
    if (!homePerm) return false;
    if (['OWNER', 'ADMIN'].includes(homePerm.memberRole)) return false;

    const isExpiredLocally = homePerm.accessExpiresAt && new Date(homePerm.accessExpiresAt) < new Date();
    return homePerm.isExpired || !!isExpiredLocally;
  }, [getHomePermission]);

  const version = bundle?.permissionVersion || 0;

  const value = useMemo<PermissionContextType>(() => ({
    bundle,
    isLoading,
    version,
    isExpired,
    can,
    refetch: fetchPermissions,
    getHomePermission,
    canManageDevices,
    canManageScenes,
    canManageMembers,
    isDeviceVisible,
    getEffectivePermission,
  }), [
    bundle,
    isLoading,
    version,
    isExpired,
    can,
    fetchPermissions,
    getHomePermission,
    canManageDevices,
    canManageScenes,
    canManageMembers,
    isDeviceVisible,
    getEffectivePermission,
  ]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export default PermissionContext;
