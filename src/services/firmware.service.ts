import api from './api.service';

// Firmware Types
export interface FirmwareVersion {
  id: string;
  deviceType: string;
  version: string;
  fileName: string;
  fileSize: number;
  checksum: string;
  releaseNote?: string;
  isActive: boolean;
  isBeta: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirmwareRollout {
  id: string;
  firmwareId: string;
  firmware?: FirmwareVersion;
  deviceType: string;
  status: RolloutStatus;
  targetDevices: number;
  updatedDevices: number;
  failedDevices: number;
  targetPercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RolloutStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface DeviceUpdateStatus {
  id: string;
  rolloutId: string;
  deviceId: string;
  deviceMac: string;
  status: UpdateStatus;
  progress: number;
  errorMessage?: string;
  oldVersion?: string;
  newVersion?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateStatus = 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'skipped';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// OTA Update Types (Device-facing)
export interface CheckUpdateInput {
  deviceType: string;
  currentVersion: string;
  macAddress: string;
  includeBeta?: boolean;
}

export interface CheckUpdateResponse {
  updateAvailable: boolean;
  latestVersion?: string;
  currentVersion: string;
  downloadUrl?: string;
  fileSize?: number;
  checksum?: string;
  releaseNote?: string;
  firmwareId?: string;
}

export interface ReportUpdateStatusInput {
  macAddress: string;
  status: UpdateStatus;
  progress: number;
  errorMessage?: string;
  newVersion?: string;
}

// Firmware Service
class FirmwareService {
  // Firmware Versions
  async uploadFirmware(file: File, data: {
    deviceType: string;
    version: string;
    releaseNote?: string;
    isBeta?: boolean;
  }): Promise<FirmwareVersion> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceType', data.deviceType);
    formData.append('version', data.version);
    if (data.releaseNote) formData.append('releaseNote', data.releaseNote);
    if (data.isBeta !== undefined) formData.append('isBeta', data.isBeta.toString());

    const response = await api.post('/admin/firmware/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getFirmwares(page = 1, limit = 20, filters?: {
    deviceType?: string;
    isActive?: boolean;
    isBeta?: boolean;
  }): Promise<{ firmwares: FirmwareVersion[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.deviceType) params.append('deviceType', filters.deviceType);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.isBeta !== undefined) params.append('isBeta', filters.isBeta.toString());

    const response = await api.get(`/admin/firmware/versions?${params.toString()}`);
    return response.data;
  }

  async getFirmware(firmwareId: string): Promise<FirmwareVersion> {
    const response = await api.get(`/admin/firmware/versions/${firmwareId}`);
    return response.data;
  }

  async toggleFirmwareActive(firmwareId: string, isActive: boolean): Promise<void> {
    await api.patch(`/admin/firmware/versions/${firmwareId}/toggle`, { isActive });
  }

  async deleteFirmware(firmwareId: string): Promise<void> {
    await api.delete(`/admin/firmware/versions/${firmwareId}`);
  }

  // Rollouts
  async createRollout(data: {
    firmwareId: string;
    deviceType: string;
    targetPercentage?: number;
  }): Promise<FirmwareRollout> {
    const response = await api.post('/admin/firmware/rollouts', data);
    return response.data;
  }

  async getRollouts(page = 1, limit = 20, filters?: {
    deviceType?: string;
    status?: RolloutStatus;
  }): Promise<{ rollouts: FirmwareRollout[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.deviceType) params.append('deviceType', filters.deviceType);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/admin/firmware/rollouts?${params.toString()}`);
    return response.data;
  }

  async getRollout(rolloutId: string): Promise<FirmwareRollout> {
    const response = await api.get(`/admin/firmware/rollouts/${rolloutId}`);
    return response.data;
  }

  async startRollout(rolloutId: string): Promise<void> {
    await api.post(`/admin/firmware/rollouts/${rolloutId}/start`);
  }

  async updateRolloutStatus(rolloutId: string, status: RolloutStatus): Promise<void> {
    await api.patch(`/admin/firmware/rollouts/${rolloutId}/status`, { status });
  }

  async getRolloutDevices(rolloutId: string, page = 1, limit = 20): Promise<{
    updates: DeviceUpdateStatus[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(
      `/admin/firmware/rollouts/${rolloutId}/devices?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Device Status
  async getDeviceUpdateStatus(deviceId: string): Promise<DeviceUpdateStatus> {
    const response = await api.get(`/admin/firmware/status/${deviceId}`);
    return response.data;
  }

  // ============================================
  // OTA Update Methods (Device-facing, but can be used for testing in admin)
  // ============================================

  /**
   * Check for firmware update
   * Devices call this endpoint to check if a newer version is available
   */
  async checkForUpdate(input: CheckUpdateInput): Promise<CheckUpdateResponse> {
    const response = await api.post('/firmware/check-update', input);
    return response.data;
  }

  /**
   * Report update status
   * Devices call this endpoint to report their update progress
   */
  async reportUpdateStatus(input: ReportUpdateStatusInput): Promise<void> {
    await api.post('/firmware/report-status', input);
  }

  /**
   * Get latest firmware version for a device type
   */
  async getLatestVersion(deviceType: string, includeBeta = false): Promise<FirmwareVersion> {
    const params = new URLSearchParams();
    params.append('deviceType', deviceType);
    if (includeBeta) params.append('includeBeta', 'true');
    
    const response = await api.get(`/firmware/latest?${params.toString()}`);
    return response.data;
  }

  /**
   * Get firmware download URL
   */
  getDownloadUrl(firmwareId: string): string {
    return `${api.defaults.baseURL}/firmware/download/${firmwareId}`;
  }
}

export const firmwareService = new FirmwareService();
export default firmwareService;
