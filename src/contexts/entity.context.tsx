'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { socketService } from '../services/socket.service';
import type { 
  DeviceEntity, 
  EntityUpdatePayload, 
  HomeEntityResponse 
} from '../types/entity.types';
import { getHomeEntities } from '../services/entity.service';

// --- Legacy Types (backward compatibility) ---
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

// --- v3.0 Types ---
export interface DeviceWithEntities {
  id: string;
  name: string;
  mac: string;
  isOnline: boolean;
  roomId?: string;
  roomName?: string;
  entities: DeviceEntity[];
}

interface EntityContextType {
  // Legacy
  entities: Record<string, Entity>;
  isConnected: boolean;
  callService: (domain: string, service: string, serviceData?: any, targetId?: string) => Promise<boolean>;
  
  // v3.0: Entity-based state
  deviceEntities: Map<string, DeviceWithEntities>;
  entityValues: Record<string, string | number | boolean | undefined>;
  pendingCommands: Set<string>;
  
  // v3.0: Actions
  loadHomeEntities: (homeId: string) => Promise<void>;
  sendEntityCommand: (deviceId: string, entityId: string, command: string | number | boolean) => void;
  updateDeviceEntities: (deviceId: string, entities: DeviceEntity[]) => void;
  setDeviceOnline: (deviceId: string, isOnline: boolean) => void;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useSocket();
  
  // Legacy state
  const [entities, setEntities] = useState<Record<string, Entity>>({});
  
  // v3.0: Entity-based state
  const [deviceEntities, setDeviceEntities] = useState<Map<string, DeviceWithEntities>>(new Map());
  const [entityValues, setEntityValues] = useState<Record<string, string | number | boolean | undefined>>({});
  const [pendingCommands, setPendingCommands] = useState<Set<string>>(new Set());

  // Legacy initialization
  useEffect(() => {
    if (!isConnected) return;

    socketService.getEntities().then((initialEntities) => {
      const entityMap: Record<string, Entity> = {};
      if (Array.isArray(initialEntities)) {
        (initialEntities as Entity[]).forEach((e) => entityMap[e.entityId] = e);
        setEntities(entityMap);
      }
    });

    const unsubscribe = socketService.subscribeToEntities((rawData: unknown) => {
      const data = rawData as { entityId: string; new_state: EntityState };
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

  // v3.0: Subscribe to entity updates
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to entity value updates
    const unsubEntity = socketService.onAllEntityUpdates((data: EntityUpdatePayload) => {
      setEntityValues((prev) => ({
        ...prev,
        [data.entityId]: data.value,
      }));
      // Remove from pending if it was a response to our command
      setPendingCommands((prev) => {
        const next = new Set(prev);
        next.delete(data.entityId);
        return next;
      });
    });

    // Subscribe to device discovery
    const unsubDiscovery = socketService.onDeviceDiscovered((deviceId, entities) => {
      setDeviceEntities((prev) => {
        const next = new Map(prev);
        const existing = next.get(deviceId);
        if (existing) {
          next.set(deviceId, { ...existing, entities });
        } else {
          next.set(deviceId, {
            id: deviceId,
            name: 'Unknown Device',
            mac: '',
            isOnline: true,
            entities,
          });
        }
        return next;
      });
    });

    // Subscribe to device offline (LWT)
    const unsubOffline = socketService.onDeviceOffline((deviceId) => {
      setDeviceEntities((prev) => {
        const next = new Map(prev);
        const existing = next.get(deviceId);
        if (existing) {
          next.set(deviceId, { ...existing, isOnline: false });
        }
        return next;
      });
    });

    // Subscribe to device online
    const unsubOnline = socketService.onDeviceOnline((deviceId) => {
      setDeviceEntities((prev) => {
        const next = new Map(prev);
        const existing = next.get(deviceId);
        if (existing) {
          next.set(deviceId, { ...existing, isOnline: true });
        }
        return next;
      });
    });

    return () => {
      unsubEntity();
      unsubDiscovery();
      unsubOffline();
      unsubOnline();
    };
  }, [isConnected]);

  // v3.0: Load entities for a home
  const loadHomeEntities = useCallback(async (homeId: string) => {
    try {
      const response = await getHomeEntities(homeId);
      const newMap = new Map<string, DeviceWithEntities>();

      response.forEach((item: HomeEntityResponse) => {
        const existing = newMap.get(item.device_id);
        if (existing) {
          existing.entities.push(item.entity);
        } else {
          newMap.set(item.device_id, {
            id: item.device_id,
            name: item.device_name,
            mac: item.device_mac,
            isOnline: item.is_online,
            roomId: item.room_id,
            roomName: item.room_name,
            entities: [item.entity],
          });
        }
      });

      setDeviceEntities(newMap);
    } catch (error) {
      console.error('Failed to load home entities:', error);
    }
  }, []);

  // v3.0: Send command with optimistic UI
  const sendEntityCommand = useCallback((deviceId: string, entityId: string, command: string | number | boolean) => {
    // Add to pending
    setPendingCommands((prev) => new Set(prev).add(entityId));
    
    // Optimistic update
    setEntityValues((prev) => ({
      ...prev,
      [entityId]: command,
    }));

    // Send command via WebSocket
    socketService.sendEntityCommand(deviceId, entityId, command);

    // Timeout - remove from pending after 5 seconds if no response
    setTimeout(() => {
      setPendingCommands((prev) => {
        const next = new Set(prev);
        next.delete(entityId);
        return next;
      });
    }, 5000);
  }, []);

  // v3.0: Update device entities (from discovery)
  const updateDeviceEntities = useCallback((deviceId: string, entities: DeviceEntity[]) => {
    setDeviceEntities((prev) => {
      const next = new Map(prev);
      const existing = next.get(deviceId);
      if (existing) {
        next.set(deviceId, { ...existing, entities });
      }
      return next;
    });
  }, []);

  // v3.0: Set device online/offline status
  const setDeviceOnline = useCallback((deviceId: string, isOnline: boolean) => {
    setDeviceEntities((prev) => {
      const next = new Map(prev);
      const existing = next.get(deviceId);
      if (existing) {
        next.set(deviceId, { ...existing, isOnline });
      }
      return next;
    });
  }, []);

  const callService = useCallback(async (domain: string, service: string, serviceData?: any, targetId?: string) => {
    return socketService.callService(domain, service, serviceData, targetId);
  }, []);

  return (
    <EntityContext.Provider 
      value={{ 
        // Legacy
        entities, 
        isConnected, 
        callService,
        // v3.0
        deviceEntities,
        entityValues,
        pendingCommands,
        loadHomeEntities,
        sendEntityCommand,
        updateDeviceEntities,
        setDeviceOnline,
      }}
    >
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
