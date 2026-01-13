// Device Types
// Type definitions for IoT devices matching faber_backend schema

export enum DeviceType {
  RELAY = 'RELAY',
  DIMMER = 'DIMMER',
  SENSOR = 'SENSOR',
  THERMOSTAT = 'THERMOSTAT',
  CURTAIN = 'CURTAIN',
  RGB_LIGHT = 'RGB_LIGHT',
  SWITCH = 'SWITCH',
  OUTLET = 'OUTLET',
  LOCK = 'LOCK',
  CAMERA = 'CAMERA',
  GATEWAY = 'GATEWAY',
}

export enum DeviceSource {
  FABER = 'FABER',
  TUYA = 'TUYA',
  SONOFF = 'SONOFF',
  ZIGBEE = 'ZIGBEE',
  ZWAVE = 'ZWAVE',
  HUE = 'HUE',
  SHELLY = 'SHELLY',
  ESPHOME = 'ESPHOME',
  SMARTTHINGS = 'SMARTTHINGS',
  KNX = 'KNX',
  GOOGLE_CAST = 'GOOGLE_CAST',
  SONOS = 'SONOS',
  AMAZON = 'AMAZON',
  CUSTOM = 'CUSTOM',
}

export type DeviceCapability = 
  | 'ON_OFF'
  | 'DIM'
  | 'COLOR'
  | 'TEMPERATURE'
  | 'HUMIDITY'
  | 'MOTION'
  | 'DOOR'
  | 'POWER'
  | 'ENERGY'
  | 'CURTAIN_POSITION';

export interface DeviceAttributes {
  on?: boolean;
  brightness?: number;
  color?: { r: number; g: number; b: number };
  temperature?: number;
  humidity?: number;
  motion?: boolean;
  power?: number;
  energy?: number;
  position?: number;
}

export interface Device {
  id: string;
  macAddress: string;
  name: string;
  type: DeviceType;
  source: DeviceSource;
  externalId?: string;
  
  // Status
  isOnline: boolean;
  isBanned: boolean;
  lastSeen?: string;
  
  // Firmware
  firmwareVersion: string;
  hardwareVersion?: string;
  
  // Config
  config?: Record<string, unknown>;
  capabilities?: DeviceCapability[];
  attributes: DeviceAttributes;
  
  // Adapter
  adapterId: string;
  nativeId?: string;
  
  // Relations
  roomId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface DeviceControl {
  capability: DeviceCapability;
  value: boolean | number | string | { r: number; g: number; b: number };
}

export interface DeviceFilter {
  roomId?: string;
  type?: DeviceType;
  source?: DeviceSource;
  isOnline?: boolean;
}
