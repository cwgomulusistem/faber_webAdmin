// Home Types
// Type definitions for Home and Room entities

import type { Scene } from './scene.types';

export interface Home {
  id: string;
  name: string;
  userId: string;
  address?: string;
  timezone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  rooms?: Room[];
  scenes?: Scene[];
}

export interface Room {
  id: string;
  name: string;
  icon?: string;
  homeId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional, loaded separately)
  deviceCount?: number;
}

export interface CreateHomePayload {
  name: string;
  address?: string;
  timezone?: string;
  isDefault?: boolean;
}

export interface CreateRoomPayload {
  name: string;
  icon?: string;
  homeId: string;
  order?: number;
}

export interface UpdateHomePayload {
  name?: string;
  address?: string;
  timezone?: string;
  isDefault?: boolean;
}

export interface UpdateRoomPayload {
  name?: string;
  icon?: string;
  order?: number;
}
