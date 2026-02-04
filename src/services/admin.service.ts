import api from './api.service';

// Admin API Types
export interface AdminDevice {
  id: string;
  macAddress: string;
  name: string;
  type: string;
  firmwareVersion: string;
  isOnline: boolean;
  isBanned: boolean;
  lastSeen: string;
  homeId?: string;
  homeName?: string;
  roomId?: string;
  roomName?: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isActive: boolean;
  provider: string;
  homeCount: number;
  deviceCount: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminHome {
  id: string;
  name: string;
  userId: string;
  userEmail?: string;
  roomCount: number;
  deviceCount: number;
  sceneCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  bannedDevices: number;
  totalUsers: number;
  activeUsers: number;
  totalHomes: number;
  totalScenes: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

// Admin Service
class AdminService {
  // Dashboard
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  // Devices
  async getDevices(page = 1, limit = 20, filters?: { 
    type?: string; 
    isOnline?: boolean; 
    isBanned?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<AdminDevice>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isOnline !== undefined) params.append('isOnline', filters.isOnline.toString());
    if (filters?.isBanned !== undefined) params.append('isBanned', filters.isBanned.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/admin/devices?${params.toString()}`);
    return response.data;
  }

  async getDevice(deviceId: string): Promise<AdminDevice> {
    const response = await api.get(`/admin/devices/${deviceId}`);
    return response.data;
  }

  async banDevice(deviceId: string, banned: boolean, reason?: string): Promise<void> {
    await api.patch(`/admin/devices/${deviceId}/ban`, { banned, reason });
  }

  async controlDevice(deviceId: string, action: Record<string, any>): Promise<void> {
    await api.post(`/admin/devices/${deviceId}/control`, { action });
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await api.delete(`/admin/devices/${deviceId}`);
  }

  // Users
  async getUsers(page = 1, limit = 20, filters?: {
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async getUser(userId: string): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, data: { isActive?: boolean }): Promise<void> {
    await api.patch(`/admin/users/${userId}`, data);
  }

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }

  async resetUserPassword(userId: string): Promise<{ tempPassword: string }> {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  }

  // Homes
  async getHomes(page = 1, limit = 20): Promise<PaginatedResponse<AdminHome>> {
    const response = await api.get(`/admin/homes?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getHome(homeId: string): Promise<AdminHome & { rooms: any[]; devices: any[]; scenes: any[] }> {
    const response = await api.get(`/admin/homes/${homeId}`);
    return response.data;
  }

  // Scenes
  async getScenes(homeId?: string): Promise<any[]> {
    const url = homeId ? `/admin/scenes?homeId=${homeId}` : '/admin/scenes';
    const response = await api.get(url);
    return response.data;
  }

  async executeScene(sceneId: string): Promise<void> {
    await api.post(`/admin/scenes/${sceneId}/execute`);
  }

  /**
   * Toggle scene active status
   * Uses mobile endpoint - requires admin to have home access
   */
  async toggleScene(sceneId: string, isActive: boolean): Promise<any> {
    const response = await api.patch(`/mobile/scenes/${sceneId}`, { isActive });
    return response.data.data;
  }

  // Audit Logs
  async getAuditLogs(page = 1, limit = 50, filters?: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/admin/logs?${params.toString()}`);
    return response.data;
  }

  async exportAuditLogs(filters?: {
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/admin/logs/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
