/**
 * Entity Store - Zustand-based atomic state management for IoT entities
 * 
 * WHY ZUSTAND OVER REACT CONTEXT?
 * - Atomic updates: Only widgets whose data changed will re-render
 * - No provider hell: Single store, no context nesting
 * - Selector subscriptions: Fine-grained subscriptions prevent cascade re-renders
 * - Performance: 50+ messages/second without UI lag
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DeviceEntity } from '@/types/entity.types';
import { socketService } from '@/services/socket.service';
import { getHomeEntities, type HomeEntityResponse } from '@/services/entity.service';

// ==================== TYPES ====================

export interface DeviceWithEntities {
  id: string;
  name: string;
  mac: string;
  isOnline: boolean;
  roomId?: string;
  roomName?: string;
  entities: DeviceEntity[];
}

export interface EntityValue {
  value: string | number | boolean | undefined;
  timestamp: number;
}

export interface PendingCommand {
  entityId: string;
  previousValue: string | number | boolean | undefined;
  sentAt: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

interface EntityState {
  // Device and entity data
  devices: Map<string, DeviceWithEntities>;
  entityValues: Map<string, EntityValue>;
  
  // Optimistic UI state
  pendingCommands: Map<string, PendingCommand>;
  
  // Connection state
  isConnected: boolean;
  lastSyncTime: number | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface EntityActions {
  // Data loading
  loadHomeEntities: (homeId: string) => Promise<void>;
  
  // Entity updates (from WebSocket)
  updateEntityValue: (entityId: string, value: string | number | boolean) => void;
  
  // Device updates
  updateDeviceEntities: (deviceId: string, entities: DeviceEntity[]) => void;
  setDeviceOnline: (deviceId: string, isOnline: boolean) => void;
  handleDeviceDiscovered: (deviceId: string, entities: DeviceEntity[], deviceName?: string) => void;
  
  // Commands with optimistic UI
  sendEntityCommand: (
    deviceId: string, 
    entityId: string, 
    command: string | number | boolean
  ) => void;
  
  // Command timeout handling
  handleCommandTimeout: (entityId: string) => void;
  handleCommandConfirmed: (entityId: string) => void;
  
  // Connection management
  setConnected: (connected: boolean) => void;
  
  // WebSocket subscriptions
  subscribeToWebSocket: () => () => void;
  
  // Reset
  reset: () => void;
}

type EntityStore = EntityState & EntityActions;

// ==================== INITIAL STATE ====================

const initialState: EntityState = {
  devices: new Map(),
  entityValues: new Map(),
  pendingCommands: new Map(),
  isConnected: false,
  lastSyncTime: null,
  isLoading: false,
  error: null,
};

// ==================== CONSTANTS ====================

const COMMAND_TIMEOUT_MS = 3000; // 3 seconds for device response

// ==================== STORE ====================

export const useEntityStore = create<EntityStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ==================== DATA LOADING ====================
      
      loadHomeEntities: async (homeId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await getHomeEntities(homeId);
          const newDevices = new Map<string, DeviceWithEntities>();

          response.forEach((item: HomeEntityResponse) => {
            const existing = newDevices.get(item.device_id);
            if (existing) {
              existing.entities.push(item.entity);
            } else {
              newDevices.set(item.device_id, {
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

          set((state) => {
            state.devices = newDevices;
            state.isLoading = false;
            state.lastSyncTime = Date.now();
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Failed to load entities';
          });
        }
      },

      // ==================== ENTITY UPDATES ====================
      
      updateEntityValue: (entityId: string, value: string | number | boolean) => {
        set((state) => {
          state.entityValues.set(entityId, {
            value,
            timestamp: Date.now(),
          });
        });
        
        // If this was a pending command, confirm it
        get().handleCommandConfirmed(entityId);
      },

      // ==================== DEVICE UPDATES ====================
      
      updateDeviceEntities: (deviceId: string, entities: DeviceEntity[]) => {
        set((state) => {
          const existing = state.devices.get(deviceId);
          if (existing) {
            state.devices.set(deviceId, { ...existing, entities });
          }
        });
      },

      setDeviceOnline: (deviceId: string, isOnline: boolean) => {
        set((state) => {
          const existing = state.devices.get(deviceId);
          if (existing) {
            state.devices.set(deviceId, { ...existing, isOnline });
          }
        });
      },

      handleDeviceDiscovered: (deviceId: string, entities: DeviceEntity[], deviceName?: string) => {
        set((state) => {
          const existing = state.devices.get(deviceId);
          if (existing) {
            state.devices.set(deviceId, { ...existing, entities, isOnline: true });
          } else {
            state.devices.set(deviceId, {
              id: deviceId,
              name: deviceName || 'Unknown Device',
              mac: '',
              isOnline: true,
              entities,
            });
          }
        });
      },

      // ==================== OPTIMISTIC COMMANDS ====================
      
      sendEntityCommand: (deviceId: string, entityId: string, command: string | number | boolean) => {
        const currentValue = get().entityValues.get(entityId)?.value;
        
        // Clear any existing timeout for this entity
        const existingPending = get().pendingCommands.get(entityId);
        if (existingPending?.timeoutId) {
          clearTimeout(existingPending.timeoutId);
        }

        // Set up timeout for rollback
        const timeoutId = setTimeout(() => {
          get().handleCommandTimeout(entityId);
        }, COMMAND_TIMEOUT_MS);

        set((state) => {
          // Store pending command for potential rollback
          state.pendingCommands.set(entityId, {
            entityId,
            previousValue: currentValue,
            sentAt: Date.now(),
            timeoutId,
          });
          
          // Optimistic update
          state.entityValues.set(entityId, {
            value: command,
            timestamp: Date.now(),
          });
        });

        // Send command via WebSocket
        socketService.sendEntityCommand(deviceId, entityId, command);
      },

      handleCommandTimeout: (entityId: string) => {
        const pending = get().pendingCommands.get(entityId);
        if (!pending) return;

        set((state) => {
          // Rollback to previous value
          state.entityValues.set(entityId, {
            value: pending.previousValue,
            timestamp: Date.now(),
          });
          
          // Remove from pending
          state.pendingCommands.delete(entityId);
        });

        // Show toast notification (handled by UI layer)
        console.warn(`[EntityStore] Command timeout for ${entityId}, rolled back`);
      },

      handleCommandConfirmed: (entityId: string) => {
        const pending = get().pendingCommands.get(entityId);
        if (!pending) return;

        // Clear timeout
        if (pending.timeoutId) {
          clearTimeout(pending.timeoutId);
        }

        set((state) => {
          state.pendingCommands.delete(entityId);
        });
      },

      // ==================== CONNECTION ====================
      
      setConnected: (connected: boolean) => {
        set((state) => {
          state.isConnected = connected;
        });
      },

      // ==================== WEBSOCKET SUBSCRIPTIONS ====================
      
      subscribeToWebSocket: () => {
        // Subscribe to entity value updates
        const unsubEntity = socketService.onAllEntityUpdates((data) => {
          get().updateEntityValue(data.entityId, data.value);
        });

        // Subscribe to device discovery
        const unsubDiscovery = socketService.onDeviceDiscovered((deviceId, entities) => {
          get().handleDeviceDiscovered(deviceId, entities);
        });

        // Subscribe to device offline (LWT)
        const unsubOffline = socketService.onDeviceOffline((deviceId) => {
          get().setDeviceOnline(deviceId, false);
        });

        // Subscribe to device online
        const unsubOnline = socketService.onDeviceOnline((deviceId) => {
          get().setDeviceOnline(deviceId, true);
        });

        // Return cleanup function
        return () => {
          unsubEntity();
          unsubDiscovery();
          unsubOffline();
          unsubOnline();
        };
      },

      // ==================== RESET ====================
      
      reset: () => {
        // Clear all timeouts
        get().pendingCommands.forEach((pending) => {
          if (pending.timeoutId) {
            clearTimeout(pending.timeoutId);
          }
        });

        set(initialState);
      },
    }))
  )
);

// ==================== SELECTORS ====================
// Use these for optimal performance - only re-render when specific data changes

/**
 * Select a single entity value by ID
 * @example const value = useEntityValue('relay_1');
 */
export const useEntityValue = (entityId: string) => {
  return useEntityStore((state) => state.entityValues.get(entityId)?.value);
};

/**
 * Select whether an entity command is pending
 */
export const useIsEntityPending = (entityId: string) => {
  return useEntityStore((state) => state.pendingCommands.has(entityId));
};

/**
 * Select a device by ID
 */
export const useDevice = (deviceId: string) => {
  return useEntityStore((state) => state.devices.get(deviceId));
};

/**
 * Select all devices as array
 */
export const useDevicesArray = () => {
  return useEntityStore((state) => Array.from(state.devices.values()));
};

/**
 * Select device online status
 */
export const useDeviceOnline = (deviceId: string) => {
  return useEntityStore((state) => state.devices.get(deviceId)?.isOnline ?? false);
};

/**
 * Select devices grouped by room
 */
export const useDevicesByRoom = () => {
  return useEntityStore((state) => {
    const byRoom = new Map<string, DeviceWithEntities[]>();
    
    state.devices.forEach((device) => {
      const roomId = device.roomId || 'unassigned';
      const existing = byRoom.get(roomId) || [];
      byRoom.set(roomId, [...existing, device]);
    });
    
    return byRoom;
  });
};

/**
 * Select connection status
 */
export const useIsConnected = () => {
  return useEntityStore((state) => state.isConnected);
};

/**
 * Select loading state
 */
export const useIsLoading = () => {
  return useEntityStore((state) => state.isLoading);
};

/**
 * Select error state
 */
export const useError = () => {
  return useEntityStore((state) => state.error);
};

// ==================== ACTIONS (Direct access without hooks) ====================
// Use these when you need to call actions outside of React components

export const entityStoreActions = {
  loadHomeEntities: useEntityStore.getState().loadHomeEntities,
  sendEntityCommand: useEntityStore.getState().sendEntityCommand,
  updateEntityValue: useEntityStore.getState().updateEntityValue,
  setDeviceOnline: useEntityStore.getState().setDeviceOnline,
  setConnected: useEntityStore.getState().setConnected,
  subscribeToWebSocket: useEntityStore.getState().subscribeToWebSocket,
  reset: useEntityStore.getState().reset,
};
