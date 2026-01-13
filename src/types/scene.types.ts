// Scene Types
// Type definitions for Scene (automation) entities

import type { DeviceControl } from './device.types';

export enum SceneTrigger {
  MANUAL = 'MANUAL',
  SCHEDULE = 'SCHEDULE',
  SUNRISE = 'SUNRISE',
  SUNSET = 'SUNSET',
  DEVICE = 'DEVICE',
}

export interface SceneTriggerData {
  time?: string; // HH:mm format
  days?: number[]; // 0-6 (Sunday-Saturday)
  cronExpression?: string;
  deviceId?: string;
  deviceCondition?: Record<string, unknown>;
}

export interface SceneAction {
  id: string;
  sceneId: string;
  deviceId: string;
  action: DeviceControl;
  delay: number; // seconds
  order: number;
  
  // Relation (optional)
  device?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface Scene {
  id: string;
  name: string;
  icon?: string;
  homeId: string;
  isActive: boolean;
  
  // Trigger
  triggerType: SceneTrigger;
  triggerData?: SceneTriggerData;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  actions?: SceneAction[];
}

export interface CreateScenePayload {
  name: string;
  icon?: string;
  homeId: string;
  triggerType: SceneTrigger;
  triggerData?: SceneTriggerData;
  actions: Array<{
    deviceId: string;
    action: DeviceControl;
    delay?: number;
    order?: number;
  }>;
}

export interface ExecuteScenePayload {
  sceneId: string;
}
