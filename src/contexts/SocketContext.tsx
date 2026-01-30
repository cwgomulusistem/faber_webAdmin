'use client';

// Socket Context v2.0
// WebSocket connection state management
// Compatible with Faber Backend v2.0 Enterprise Architecture
// Features: Room-based broadcasting, Real-time telemetry, State restoration

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { socketService, DeviceUpdateCallback, TelemetryCallback } from '../services/socket.service';
import { useAuth } from './AuthContext';

// Telemetry data structure from backend v2.0
interface TelemetryData {
  deviceId: string;
  topic: string;
  payload: Record<string, unknown>;
}

interface SocketContextType {
  // Connection state
  isConnected: boolean;
  isInitializing: boolean; // True during initial connection attempt
  
  // Device subscriptions
  subscribeToDevice: (deviceId: string, callback: DeviceUpdateCallback) => () => void;
  
  // v2.0: Room-based home subscription (required for receiving telemetry)
  joinHome: (homeId: string) => void;
  leaveHome: (homeId: string) => void;
  currentHomeId: string | null;
  
  // v2.0: Real-time telemetry subscriptions
  onDeviceTelemetry: (deviceId: string, callback: TelemetryCallback) => () => void;
  onAllTelemetry: (callback: TelemetryCallback) => () => void;
  
  // v2.0: Dashboard updates (Server-Driven UI)
  onDashboardUpdate: (callback: (homeId: string) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  isInitializing: true,
  subscribeToDevice: () => () => {},
  joinHome: () => {},
  leaveHome: () => {},
  currentHomeId: null,
  onDeviceTelemetry: () => () => {},
  onAllTelemetry: () => () => {},
  onDashboardUpdate: () => () => {},
});

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentHomeId, setCurrentHomeId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      setIsInitializing(true);
      socketService.connect();
      
      // Subscribe to connection status
      const unsubscribe = socketService.onConnectionChange((connected) => {
        setIsConnected(connected);
        if (connected) {
          setIsInitializing(false);
        }
      });

      // Grace period: After 3 seconds, stop showing "initializing" state
      const initTimeout = setTimeout(() => {
        setIsInitializing(false);
      }, 3000);
      
      return () => {
        unsubscribe();
        clearTimeout(initTimeout);
        socketService.disconnect();
      };
    } else {
      socketService.disconnect();
      setIsConnected(false);
      setIsInitializing(false);
      setCurrentHomeId(null);
    }
  }, [isAuthenticated]);

  // Wrapper for device subscription
  const subscribeToDevice = useCallback((deviceId: string, callback: DeviceUpdateCallback) => {
    return socketService.subscribeToDevice(deviceId, callback);
  }, []);

  // v2.0: Join home room for room-based broadcasts
  const joinHome = useCallback((homeId: string) => {
    socketService.joinHome(homeId);
    setCurrentHomeId(homeId);
  }, []);

  // v2.0: Leave home room
  const leaveHome = useCallback((homeId: string) => {
    socketService.leaveHome(homeId);
    if (currentHomeId === homeId) {
      setCurrentHomeId(null);
    }
  }, [currentHomeId]);

  // v2.0: Subscribe to device telemetry
  const onDeviceTelemetry = useCallback((deviceId: string, callback: TelemetryCallback) => {
    return socketService.onDeviceTelemetry(deviceId, callback);
  }, []);

  // v2.0: Subscribe to all telemetry from joined home
  const onAllTelemetry = useCallback((callback: TelemetryCallback) => {
    return socketService.onAllTelemetry(callback);
  }, []);

  // v2.0: Subscribe to dashboard updates
  const onDashboardUpdate = useCallback((callback: (homeId: string) => void) => {
    return socketService.onDashboardUpdate(callback);
  }, []);

  const value = useMemo(() => ({
    isConnected,
    isInitializing,
    subscribeToDevice,
    joinHome,
    leaveHome,
    currentHomeId,
    onDeviceTelemetry,
    onAllTelemetry,
    onDashboardUpdate,
  }), [isConnected, isInitializing, subscribeToDevice, joinHome, leaveHome, currentHomeId, onDeviceTelemetry, onAllTelemetry, onDashboardUpdate]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
