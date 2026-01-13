import api from './api.service';
import type { User, AdminUser } from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export interface UserListFilter {
  role?: string;
  search?: string;
}

export const userService = {
  /**
   * Get all users (Admin only)
   * GET /api/v1/admin/users
   */
  async getUsers(filter?: UserListFilter): Promise<(User | AdminUser)[]> {
    const response = await api.get<ApiResponse<(User | AdminUser)[]>>('/admin/users', {
      params: filter,
    });
    return response.data.data || [];
  },

  /**
   * Get all devices (Admin overview)
   * GET /api/v1/admin/devices
   */
  async getAllDevices(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/admin/devices');
    return response.data.data || [];
  },
  
  /**
   * Ban/Unban device
   * PATCH /api/v1/admin/devices/:id/ban
   */
  async toggleBanDevice(deviceId: string, isBanned: boolean): Promise<void> {
    await api.patch(`/admin/devices/${deviceId}/ban`, { isBanned });
  }
};

export default userService;
