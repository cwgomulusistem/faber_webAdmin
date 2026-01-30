// Scene Service
// Scene (automation) operations

import api from './api.service';
import type { Scene, CreateScenePayload } from '../types/scene.types';
import type { ApiResponse } from '../types/api.types';

export const sceneService = {
  /**
   * Get all scenes for a home
   * GET /api/v1/mobile/scenes?homeId=xxx
   */
  async getScenes(homeId: string): Promise<Scene[]> {
    const response = await api.get<ApiResponse<Scene[]>>('/mobile/scenes', {
      params: { homeId },
    });
    return response.data.data || [];
  },
  
  /**
   * Get single scene with actions
   * GET /api/v1/mobile/scenes/:id
   */
  async getScene(sceneId: string): Promise<Scene> {
    const response = await api.get<ApiResponse<Scene>>(`/mobile/scenes/${sceneId}`);
    return response.data.data!;
  },
  
  /**
   * Create a new scene
   * POST /api/v1/mobile/scenes
   */
  async createScene(payload: CreateScenePayload): Promise<Scene> {
    const response = await api.post<ApiResponse<Scene>>('/mobile/scenes', payload);
    return response.data.data!;
  },
  
  /**
   * Update a scene
   * PATCH /api/v1/mobile/scenes/:id
   */
  async updateScene(sceneId: string, payload: Partial<CreateScenePayload>): Promise<Scene> {
    const response = await api.patch<ApiResponse<Scene>>(`/mobile/scenes/${sceneId}`, payload);
    return response.data.data!;
  },
  
  /**
   * Delete a scene
   * DELETE /api/v1/mobile/scenes/:id
   */
  async deleteScene(sceneId: string): Promise<void> {
    await api.delete(`/mobile/scenes/${sceneId}`);
  },
  
  /**
   * Execute a scene manually
   * POST /api/v1/mobile/scenes/:id/execute
   */
  async executeScene(sceneId: string): Promise<void> {
    await api.post(`/mobile/scenes/${sceneId}/execute`);
  },
  
  /**
   * Toggle scene active status
   * PATCH /api/v1/mobile/scenes/:id
   */
  async toggleScene(sceneId: string, isActive: boolean): Promise<Scene> {
    const response = await api.patch<ApiResponse<Scene>>(`/mobile/scenes/${sceneId}`, {
      isActive,
    });
    return response.data.data!;
  },
  
  /**
   * Get active scenes only
   */
  async getActiveScenes(homeId: string): Promise<Scene[]> {
    const scenes = await this.getScenes(homeId);
    return scenes.filter((s) => s.isActive);
  },
};

export default sceneService;
