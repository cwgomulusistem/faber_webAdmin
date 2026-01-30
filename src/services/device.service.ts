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
  /**
   * Get all devices (Admin)
   * GET /api/v1/admin/devices
   */
  async getDevices(
    homeId?: string,
    filter?: DeviceFilter,
    pagination?: PaginationParams
  ): Promise<Device[]> {
    const params: Record<string, unknown> = { ...pagination, ...filter };
    if (homeId) params.homeId = homeId;
    
    // Admin Endpoint for listing devices
    const response = await api.get<ApiResponse<any>>('/admin/devices', { params });
    return response.data.data?.data || response.data.data || [];
  },
  
  /**
   * Get paginated devices
   */
  async getDevicesPaginated(
    homeId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Device>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Device>>>(
      '/admin/devices',
      { params: { homeId, ...pagination } }
    );
    return response.data.data!;
  },
  
  /**
   * Get single device by ID
   * GET /api/v1/mobile/devices/:id (Fallback to mobile or need admin endpoint)
   * Currently backend listDevices returns full object so getDevices is enough.
   * If detailed view needed, we might need /admin/devices/:id in backend
   */
  async getDevice(deviceId: string): Promise<Device> {
    // Fallback to searching in list for now as /admin/devices/:id is not implemented yet
    const devices = await this.getDevices();
    const device = devices.find(d => d.id === deviceId);
    if (!device) throw new Error('Device not found');
    return device;
  },
  
  /**
   * Control a device (Admin Override)
   * POST /api/v1/admin/devices/:id/control
   */
  async controlDevice(deviceId: string, action: DeviceControl): Promise<Device> {
    const response = await api.post<ApiResponse<Device>>(
      `/admin/devices/${deviceId}/control`,
      action
    );
    return response.data.data!;
  },
  
  /**
   * Update device room assignment
   * PUT /api/v1/mobile/devices/:id/room
   * Note: Name update is not supported yet in backend
   */
  async updateDevice(
    deviceId: string,
    updates: { name?: string; roomId?: string }
  ): Promise<Device> {
    // Only room update is supported in backend
    if (updates.roomId !== undefined) {
      await api.put(`/mobile/devices/${deviceId}/room`, {
        roomId: updates.roomId,
      });
    }
    // Name update not supported yet - would need backend endpoint
    // Return updated device
    return this.getDevice(deviceId);
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
