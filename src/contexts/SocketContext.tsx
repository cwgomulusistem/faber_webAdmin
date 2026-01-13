'use client';

// Socket Context
// WebSocket connection state management

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { socketService, DeviceUpdateCallback } from '../services/socket.service';
import { useAuth } from './AuthContext';

interface SocketContextType {
  isConnected: boolean;
  subscribeToDevice: (deviceId: string, callback: DeviceUpdateCallback) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  subscribeToDevice: () => () => {},
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
  const { isAuthenticated } = useAuth();

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      
      // Subscribe to connection status
      const unsubscribe = socketService.onConnectionChange(setIsConnected);
      
      return () => {
        unsubscribe();
        socketService.disconnect();
      };
    } else {
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated]);

  // Wrapper for device subscription
  const subscribeToDevice = useCallback((deviceId: string, callback: DeviceUpdateCallback) => {
    return socketService.subscribeToDevice(deviceId, callback);
  }, []);

  const value = useMemo(() => ({
    isConnected,
    subscribeToDevice,
  }), [isConnected, subscribeToDevice]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
