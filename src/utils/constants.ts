// Constants
// Application-wide constants

// Device Type Icons
export const DEVICE_TYPE_ICONS: Record<string, string> = {
  RELAY: '🔌',
  DIMMER: '💡',
  SENSOR: '📡',
  THERMOSTAT: '🌡️',
  CURTAIN: '🪟',
  RGB_LIGHT: '🌈',
  SWITCH: '⏻',
  OUTLET: '🔋',
  LOCK: '🔐',
  CAMERA: '📷',
  GATEWAY: '🌐',
};

// Device Source Labels
export const DEVICE_SOURCE_LABELS: Record<string, string> = {
  FABER: 'Faber',
  TUYA: 'Tuya',
  SONOFF: 'Sonoff',
  ZIGBEE: 'Zigbee',
  ZWAVE: 'Z-Wave',
  HUE: 'Philips Hue',
  SHELLY: 'Shelly',
  ESPHOME: 'ESPHome',
  SMARTTHINGS: 'SmartThings',
  KNX: 'KNX',
  GOOGLE_CAST: 'Google Cast',
  SONOS: 'Sonos',
  AMAZON: 'Amazon',
  CUSTOM: 'Özel',
};

// Scene Trigger Labels
export const SCENE_TRIGGER_LABELS: Record<string, string> = {
  MANUAL: 'Manuel',
  SCHEDULE: 'Zamanlanmış',
  SUNRISE: 'Gün Doğumu',
  SUNSET: 'Gün Batımı',
  DEVICE: 'Cihaz Tetiklemeli',
};

// Room Icons
export const ROOM_ICONS: string[] = [
  '🛋️', // Living Room
  '🛏️', // Bedroom
  '🍳', // Kitchen
  '🚿', // Bathroom
  '🏢', // Office
  '🚗', // Garage
  '🌳', // Garden
  '🏠', // General
  '📺', // Media Room
  '👶', // Kids Room
  '🍽️', // Dining Room
  '🧺', // Laundry
];

// API Error Codes
export const ERROR_CODES = {
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};
