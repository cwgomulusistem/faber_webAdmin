// Home Service
// Home and Room CRUD operations

import api from './api.service';
import type {
  Home,
  Room,
  CreateHomePayload,
  CreateRoomPayload,
  UpdateHomePayload,
  UpdateRoomPayload,
} from '../types/home.types';
import type { ApiResponse } from '../types/api.types';

export const homeService = {
  /**
   * Get all homes for current user
   * GET /api/v1/mobile/homes
   */
  async getHomes(): Promise<Home[]> {
    const response = await api.get<ApiResponse<Home[]>>('/mobile/homes');
    return response.data.data || [];
  },
  
  /**
   * Get single home with rooms
   * GET /api/v1/mobile/homes/:id
   */
  async getHome(homeId: string): Promise<Home> {
    const response = await api.get<ApiResponse<Home>>(`/mobile/homes/${homeId}`);
    return response.data.data!;
  },
  
  /**
   * Create a new home
   * POST /api/v1/mobile/homes
   */
  async createHome(payload: CreateHomePayload): Promise<Home> {
    const response = await api.post<ApiResponse<Home>>('/mobile/homes', payload);
    return response.data.data!;
  },
  
  /**
   * Update a home
   * PATCH /api/v1/mobile/homes/:id
   */
  async updateHome(homeId: string, payload: UpdateHomePayload): Promise<Home> {
    const response = await api.patch<ApiResponse<Home>>(`/mobile/homes/${homeId}`, payload);
    return response.data.data!;
  },
  
  /**
   * Delete a home
   * DELETE /api/v1/mobile/homes/:id
   */
  async deleteHome(homeId: string): Promise<void> {
    await api.delete(`/mobile/homes/${homeId}`);
  },
  
  // ==================== Room Operations ====================
  
  /**
   * Get rooms for a home
   * GET /api/v1/mobile/homes/:homeId/rooms
   */
  async getRooms(homeId: string): Promise<Room[]> {
    const response = await api.get<ApiResponse<Room[]>>(`/mobile/homes/${homeId}/rooms`);
    return response.data.data || [];
  },
  
  /**
   * Create a new room
   * POST /api/v1/mobile/rooms
   */
  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    const response = await api.post<ApiResponse<Room>>('/mobile/rooms', payload);
    return response.data.data!;
  },
  
  /**
   * Update a room
   * PATCH /api/v1/mobile/rooms/:id
   */
  async updateRoom(roomId: string, payload: UpdateRoomPayload): Promise<Room> {
    const response = await api.patch<ApiResponse<Room>>(`/mobile/rooms/${roomId}`, payload);
    return response.data.data!;
  },
  
  /**
   * Delete a room
   * DELETE /api/v1/mobile/rooms/:id
   */
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/mobile/rooms/${roomId}`);
  },
  
  /**
   * Reorder rooms
   * POST /api/v1/mobile/homes/:homeId/rooms/reorder
   */
  async reorderRooms(homeId: string, roomIds: string[]): Promise<Room[]> {
    const response = await api.post<ApiResponse<Room[]>>(
      `/mobile/homes/${homeId}/rooms/reorder`,
      { roomIds }
    );
    return response.data.data || [];
  },
  
  /**
   * Get default home (or first home if no default)
   */
  async getDefaultHome(): Promise<Home | null> {
    const homes = await this.getHomes();
    return homes.find((h) => h.isDefault) || homes[0] || null;
  },
};

export default homeService;
