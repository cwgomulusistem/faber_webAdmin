'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { socketService } from '../services/socket.service';

// --- Types ---
export interface EntityState {
  state: string;
  lastUpdated: string;
  attributes: Record<string, any>;
}

export interface Entity {
  entityId: string;
  domain: string;
  platform: string;
  deviceId?: string;
  state: EntityState;
}

interface EntityContextType {
  entities: Record<string, Entity>;
  isConnected: boolean;
  callService: (domain: string, service: string, serviceData?: any, targetId?: string) => Promise<boolean>;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useSocket(); // Use existing SocketContext for connection status
  const [entities, setEntities] = useState<Record<string, Entity>>({});

  useEffect(() => {
    if (!isConnected) return;

    // Fetch initial state
    socketService.getEntities().then((initialEntities) => {
        const entityMap: Record<string, Entity> = {};
        if (Array.isArray(initialEntities)) {
             initialEntities.forEach((e: Entity) => entityMap[e.entityId] = e);
             setEntities(entityMap);
        }
    });

    // Subscribe to updates
    const unsubscribe = socketService.subscribeToEntities((data: { entityId: string; new_state: EntityState }) => {
      setEntities((prev) => ({
        ...prev,
        [data.entityId]: {
          ...prev[data.entityId],
          state: data.new_state,
        } as Entity,
      }));
    });

    return () => {
      unsubscribe?.();
    };
  }, [isConnected]);

  const callService = async (domain: string, service: string, serviceData?: any, targetId?: string) => {
    return socketService.callService(domain, service, serviceData, targetId);
  };

  return (
    <EntityContext.Provider value={{ entities, isConnected, callService }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntities must be used within an EntityProvider');
  }
  return context;
}
