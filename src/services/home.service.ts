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
   * GET /api/v1/homes
   */
  async getHomes(): Promise<Home[]> {
    const response = await api.get<ApiResponse<Home[]>>('/homes');
    return response.data.data || [];
  },

  /**
   * Get single home with rooms
   * GET /api/v1/homes/:homeId
   */
  async getHome(homeId: string): Promise<Home> {
    const response = await api.get<ApiResponse<Home>>(`/homes/${homeId}`);
    return response.data.data!;
  },

  /**
   * Create a new home
   * POST /api/v1/homes
   */
  async createHome(payload: CreateHomePayload): Promise<Home> {
    const response = await api.post<ApiResponse<Home>>('/homes', payload);
    return response.data.data!;
  },

  /**
   * Update a home
   * PATCH /api/v1/homes/:homeId
   */
  async updateHome(homeId: string, payload: UpdateHomePayload): Promise<Home> {
    const response = await api.patch<ApiResponse<Home>>(`/homes/${homeId}`, payload);
    return response.data.data!;
  },

  /**
   * Delete a home
   * DELETE /api/v1/homes/:id
   */
  async deleteHome(homeId: string): Promise<void> {
    await api.delete(`/homes/${homeId}`);
  },

  // ==================== Room Operations ====================

  /**
   * Get rooms for a home
   * GET /api/v1/homes/:homeId/rooms
   */
  async getRooms(homeId: string): Promise<Room[]> {
    const response = await api.get<ApiResponse<Room[]>>(`/homes/${homeId}/rooms`);
    return response.data.data || [];
  },

  /**
   * Create a new room
   * POST /api/v1/homes/rooms
   */
  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    const response = await api.post<ApiResponse<Room>>('/homes/rooms', payload);
    return response.data.data!;
  },

  /**
   * Update a room
   * PATCH /api/v1/homes/rooms/:roomId
   */
  async updateRoom(roomId: string, payload: UpdateRoomPayload): Promise<Room> {
    const response = await api.patch<ApiResponse<Room>>(`/homes/rooms/${roomId}`, payload);
    return response.data.data!;
  },

  /**
   * Delete a room
   * DELETE /api/v1/homes/rooms/:roomId
   */
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/homes/rooms/${roomId}`);
  },

  /**
   * Reorder rooms (update order field for each room)
   * Note: Backend doesn't have bulk reorder, update individually
   */
  async reorderRooms(homeId: string, roomIds: string[]): Promise<Room[]> {
    // Update each room's order
    await Promise.all(
      roomIds.map((roomId, index) => 
        this.updateRoom(roomId, { order: index })
      )
    );
    // Return updated rooms
    return this.getRooms(homeId);
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
