'use client';

// Device Context
// Manages devices for the active home with race condition protection
// Provides centralized device data to prevent duplicate API requests

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useHome } from './HomeContext';
import api from '@/services/api.service';

interface Device {
  id: string;
  name: string;
  type: string;
  roomId?: string;
  homeId: string;
  attributes?: Record<string, any>;
  [key: string]: any;
}

interface DeviceContextType {
  devices: Device[];
  deviceCount: number;
  isLoading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType>({
  devices: [],
  deviceCount: 0,
  isLoading: true,
  error: null,
  refreshDevices: async () => {},
});

export function useDevice(): DeviceContextType {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const { activeHome, isLoading: homesLoading } = useHome();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRITICAL: Race Condition Protection
  // When user quickly switches homes, prevents stale data from overwriting new data
  useEffect(() => {
    let isMounted = true; // Cleanup flag
    
    const load = async () => {
      // Wait for homes to finish loading
      if (homesLoading) return;
      
      // Clear devices if no active home
      if (!activeHome?.id) {
        if (isMounted) {
          setDevices([]);
          setIsLoading(false);
          setError(null);
        }
        return;
      }
      
      if (isMounted) setIsLoading(true);
      
      try {
        const res = await api.get(`/homes/${activeHome.id}/devices`);
        // Only update state if component is still mounted and activeHome hasn't changed
        if (isMounted) {
          setDevices(res.data?.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Cihazlar yüklenemedi';
          setError(message);
          console.error('Error loading devices:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    load();
    
    // Cleanup: ignore stale requests when activeHome changes or component unmounts
    return () => { 
      isMounted = false; 
    };
  }, [activeHome?.id, homesLoading]);
  
  // Manual refresh function (for pull-to-refresh, add device, etc.)
  const refreshDevices = useCallback(async () => {
    if (!activeHome?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/homes/${activeHome.id}/devices`);
      setDevices(res.data?.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cihazlar yüklenemedi';
      setError(message);
      console.error('Error refreshing devices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeHome?.id]);

  const value = useMemo<DeviceContextType>(() => ({
    devices,
    deviceCount: devices.length,
    isLoading,
    error,
    refreshDevices,
  }), [devices, isLoading, error, refreshDevices]);

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

export default DeviceContext;
