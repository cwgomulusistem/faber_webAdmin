// Device Service
// Device CRUD and control operations

import api from './api.service';
import type { Device, DeviceControl, DeviceFilter } from '../types/device.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/api.types';

export const deviceService = {
  /**
   * Get all devices
   * GET /api/v1/mobile/devices
   */
  async getDevices(
    homeId?: string,
    filter?: DeviceFilter,
    pagination?: PaginationParams
  ): Promise<Device[]> {
    const params: Record<string, unknown> = { ...pagination, ...filter };
    if (homeId) params.homeId = homeId;
    
    const response = await api.get<ApiResponse<Device[]>>('/mobile/devices', { params });
    return response.data.data || [];
  },
  
  /**
   * Get paginated devices
   */
  async getDevicesPaginated(
    homeId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Device>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Device>>>(
      '/mobile/devices',
      { params: { homeId, ...pagination } }
    );
    return response.data.data!;
  },
  
  /**
   * Get single device by ID
   * GET /api/v1/mobile/devices/:id
   */
  async getDevice(deviceId: string): Promise<Device> {
    const response = await api.get<ApiResponse<Device>>(`/mobile/devices/${deviceId}`);
    return response.data.data!;
  },
  
  /**
   * Control a device
   * POST /api/v1/mobile/devices/:id/control
   */
  async controlDevice(deviceId: string, action: DeviceControl): Promise<Device> {
    const response = await api.post<ApiResponse<Device>>(
      `/mobile/devices/${deviceId}/control`,
      action
    );
    return response.data.data!;
  },
  
  /**
   * Update device name or room assignment
   * PATCH /api/v1/mobile/devices/:id
   */
  async updateDevice(
    deviceId: string,
    updates: { name?: string; roomId?: string }
  ): Promise<Device> {
    const response = await api.patch<ApiResponse<Device>>(
      `/mobile/devices/${deviceId}`,
      updates
    );
    return response.data.data!;
  },
  
  /**
   * Get devices by room
   */
  async getDevicesByRoom(roomId: string): Promise<Device[]> {
    return this.getDevices(undefined, { roomId });
  },
  
  /**
   * Get online devices only
   */
  async getOnlineDevices(homeId: string): Promise<Device[]> {
    return this.getDevices(homeId, { isOnline: true });
  },
  
  /**
   * Quick toggle device on/off
   */
  async toggleDevice(device: Device): Promise<Device> {
    const newState = !device.attributes?.on;
    return this.controlDevice(device.id, {
      capability: 'ON_OFF',
      value: newState,
    });
  },
  
  /**
   * Set device brightness (for dimmable devices)
   */
  async setDeviceBrightness(deviceId: string, brightness: number): Promise<Device> {
    return this.controlDevice(deviceId, {
      capability: 'DIM',
      value: Math.max(0, Math.min(100, brightness)),
    });
  },
};

export default deviceService;
