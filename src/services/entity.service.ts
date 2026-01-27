// Entity Service for Faber IoT Platform v3.0
// Handles entity API calls and real-time updates

import api from './api.service';
import type { 
  DeviceEntity, 
  HomeEntityResponse, 
  EntityValue 
} from '@/types/entity.types';

/**
 * Get all entities for a home
 * Includes device context and online status
 */
export async function getHomeEntities(homeId: string): Promise<HomeEntityResponse[]> {
  try {
    const response = await api.get(`/mobile/home/${homeId}/entities`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch home entities:', error);
    return [];
  }
}

/**
 * Get entities for a specific device
 */
export async function getDeviceEntities(deviceId: string): Promise<DeviceEntity[]> {
  try {
    const response = await api.get(`/mobile/devices/${deviceId}/entities`);
    return response.data?.entities || [];
  } catch (error) {
    console.error('Failed to fetch device entities:', error);
    return [];
  }
}

/**
 * Send command to an entity
 * @param entityId - Entity identifier (e.g., "relay_1")
 * @param command - Command to send (e.g., "ON", "OFF", or numeric value)
 */
export async function sendEntityCommand(
  deviceId: string,
  entityId: string,
  command: string | number | boolean
): Promise<boolean> {
  try {
    const response = await api.post(`/mobile/devices/${deviceId}/control`, {
      entity_id: entityId,
      command: command,
    });
    return response.data?.success || false;
  } catch (error) {
    console.error('Failed to send entity command:', error);
    return false;
  }
}

/**
 * Group entities by device
 */
export function groupEntitiesByDevice(
  entities: HomeEntityResponse[]
): Map<string, { device: { id: string; name: string; mac: string; isOnline: boolean; roomId?: string; roomName?: string }; entities: DeviceEntity[] }> {
  const grouped = new Map<string, { device: { id: string; name: string; mac: string; isOnline: boolean; roomId?: string; roomName?: string }; entities: DeviceEntity[] }>();

  entities.forEach((item) => {
    const existing = grouped.get(item.device_id);
    if (existing) {
      existing.entities.push(item.entity);
    } else {
      grouped.set(item.device_id, {
        device: {
          id: item.device_id,
          name: item.device_name,
          mac: item.device_mac,
          isOnline: item.is_online,
          roomId: item.room_id,
          roomName: item.room_name,
        },
        entities: [item.entity],
      });
    }
  });

  return grouped;
}

/**
 * Group entities by room
 */
export function groupEntitiesByRoom(
  entities: HomeEntityResponse[]
): Map<string, { room: { id: string; name: string }; entities: (HomeEntityResponse)[] }> {
  const grouped = new Map<string, { room: { id: string; name: string }; entities: (HomeEntityResponse)[] }>();

  entities.forEach((item) => {
    const roomId = item.room_id || 'unassigned';
    const roomName = item.room_name || 'Diğer Cihazlar';
    
    const existing = grouped.get(roomId);
    if (existing) {
      existing.entities.push(item);
    } else {
      grouped.set(roomId, {
        room: { id: roomId, name: roomName },
        entities: [item],
      });
    }
  });

  return grouped;
}

/**
 * Create entity value map from array
 */
export function createEntityValueMap(
  values: EntityValue[]
): Record<string, string | number | boolean> {
  const map: Record<string, string | number | boolean> = {};
  values.forEach((v) => {
    map[v.entityId] = v.value;
  });
  return map;
}

export default {
  getHomeEntities,
  getDeviceEntities,
  sendEntityCommand,
  groupEntitiesByDevice,
  groupEntitiesByRoom,
  createEntityValueMap,
};
