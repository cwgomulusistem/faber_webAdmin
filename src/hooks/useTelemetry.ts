// useTelemetry Hook v2.0
// Real-time telemetry subscription for ESP32 devices
// Compatible with Faber Backend v2.0 Enterprise Architecture

import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketService } from '../services/websocket.service';

// Telemetry data structure from backend v2.0
interface TelemetryData {
  deviceId: string;
  topic: string;
  payload: Record<string, unknown>;
}

interface UseTelemetryOptions {
  // Only subscribe when enabled (default: true)
  enabled?: boolean;
  // Callback for each telemetry update
  onUpdate?: (data: TelemetryData) => void;
}

/**
 * Hook to subscribe to real-time telemetry for a specific device
 * NOTE: You must join the device's home room first to receive telemetry
 * 
 * @example
 * ```tsx
 * const { latestData, history } = useTelemetry(deviceId, {
 *   onUpdate: (data) => console.log('New telemetry:', data)
 * });
 * ```
 */
export function useTelemetry(deviceId: string | null, options: UseTelemetryOptions = {}) {
  const { enabled = true, onUpdate } = options;
  
  const [latestData, setLatestData] = useState<TelemetryData | null>(null);
  const [history, setHistory] = useState<TelemetryData[]>([]);
  const onUpdateRef = useRef(onUpdate);
  
  // Keep callback ref updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    if (!deviceId || !enabled) return;
    
    const unsubscribe = webSocketService.onDeviceTelemetry(deviceId, (data) => {
      setLatestData(data);
      setHistory(prev => [...prev.slice(-99), data]); // Keep last 100 entries
      onUpdateRef.current?.(data);
    });
    
    return () => {
      unsubscribe();
    };
  }, [deviceId, enabled]);
  
  // Clear history when device changes
  useEffect(() => {
    setLatestData(null);
    setHistory([]);
  }, [deviceId]);
  
  return {
    latestData,
    history,
    clearHistory: useCallback(() => setHistory([]), []),
  };
}

/**
 * Hook to subscribe to all telemetry from the joined home
 * NOTE: You must join a home room first to receive telemetry
 * 
 * @example
 * ```tsx
 * const { telemetryByDevice } = useAllTelemetry({
 *   onUpdate: (data) => console.log('Telemetry from', data.deviceId)
 * });
 * ```
 */
export function useAllTelemetry(options: UseTelemetryOptions = {}) {
  const { enabled = true, onUpdate } = options;
  
  const [telemetryByDevice, setTelemetryByDevice] = useState<Map<string, TelemetryData>>(new Map());
  const [allHistory, setAllHistory] = useState<TelemetryData[]>([]);
  const onUpdateRef = useRef(onUpdate);
  
  // Keep callback ref updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = webSocketService.onAllTelemetry((data) => {
      setTelemetryByDevice(prev => {
        const newMap = new Map(prev);
        newMap.set(data.deviceId, data);
        return newMap;
      });
      setAllHistory(prev => [...prev.slice(-999), data]); // Keep last 1000 entries
      onUpdateRef.current?.(data);
    });
    
    return () => {
      unsubscribe();
    };
  }, [enabled]);
  
  return {
    telemetryByDevice,
    allHistory,
    getDeviceTelemetry: useCallback((deviceId: string) => telemetryByDevice.get(deviceId) ?? null, [telemetryByDevice]),
    clearHistory: useCallback(() => {
      setTelemetryByDevice(new Map());
      setAllHistory([]);
    }, []),
  };
}

export default useTelemetry;
