// useDevices hook
// Fetch and manage devices with real-time updates

import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '../services/device.service';
import { useSocket } from '../contexts/SocketContext';
import type { Device, DeviceFilter } from '../types/device.types';

interface UseDevicesOptions {
  homeId?: string;
  roomId?: string;
  filter?: DeviceFilter;
  autoRefresh?: boolean;
}

interface UseDevicesReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggleDevice: (device: Device) => Promise<void>;
  controlDevice: (deviceId: string, capability: string, value: unknown) => Promise<void>;
}

export function useDevices(options: UseDevicesOptions = {}): UseDevicesReturn {
  const { homeId, roomId, filter, autoRefresh = true } = options;
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToDevice, isConnected } = useSocket();

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: Device[];
      
      if (roomId) {
        result = await deviceService.getDevicesByRoom(roomId);
      } else if (homeId) {
        result = await deviceService.getDevices(homeId, filter);
      } else {
        result = await deviceService.getDevices(undefined, filter);
      }
      
      setDevices(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cihazlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [homeId, roomId, filter]);

  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const unsubscribers = devices.map((device) =>
      subscribeToDevice(device.id, (updatedDevice) => {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id ? { ...d, ...updatedDevice } : d
          )
        );
      })
    );
    
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [devices.length, autoRefresh, isConnected, subscribeToDevice]);

  // Toggle device on/off
  const toggleDevice = useCallback(async (device: Device) => {
    try {
      const updated = await deviceService.toggleDevice(device);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? updated : d))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cihaz kontrolü başarısız');
      throw err;
    }
  }, []);

  // Control device with specific capability
  const controlDevice = useCallback(
    async (deviceId: string, capability: string, value: unknown) => {
      try {
        const updated = await deviceService.controlDevice(deviceId, {
          capability: capability as Device['capabilities'] extends (infer U)[] ? U : never,
          value: value as boolean | number | string,
        });
        setDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? updated : d))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Cihaz kontrolü başarısız');
        throw err;
      }
    },
    []
  );

  return {
    devices,
    isLoading,
    error,
    refresh: fetchDevices,
    toggleDevice,
    controlDevice,
  };
}

export default useDevices;
