// Entity Types for Faber IoT Platform v3.0
// Matches backend domain/device_entity.go

/**
 * Entity Type - Defines the type of entity/capability
 * Each type maps to a specific widget in the UI
 */
export type EntityType =
  | 'switch'        // On/Off toggle
  | 'sensor'        // Read-only sensor value
  | 'light'         // Dimmable light
  | 'cover'         // Blinds, curtains, garage doors
  | 'binary_sensor' // Binary state sensor (motion, door, etc.)
  | 'climate'       // Thermostat, AC control
  | 'fan'           // Fan with speed control
  | 'lock';         // Door lock

/**
 * Device Class - Sensor/Entity classification for UI hints
 * Based on Home Assistant device classes
 */
export type DeviceClass =
  | 'temperature'
  | 'humidity'
  | 'power'
  | 'energy'
  | 'voltage'
  | 'current'
  | 'battery'
  | 'illuminance'
  | 'motion'
  | 'door'
  | 'window'
  | 'signal_strength';

/**
 * DeviceEntity - Represents a single capability of a device
 * Compatible with Home Assistant discovery format
 */
export interface DeviceEntity {
  id: string;                    // Unique identifier: "relay_1", "sensor_temp"
  type: EntityType;              // Entity type for widget selection
  name: string;                  // Human readable name: "Salon Işık"
  state_topic?: string;          // MQTT topic for state
  command_topic?: string;        // MQTT topic for commands
  value_template?: string;       // JSON path template: "{{ value_json.temperature }}"
  unit?: string;                 // Unit of measurement: "°C", "%", "W"
  device_class?: DeviceClass;    // Device class for UI hints
  icon?: string;                 // Icon identifier: "mdi:lightbulb"
  min?: number;                  // Minimum value (for dimmers, thermostats)
  max?: number;                  // Maximum value
  step?: number;                 // Step value for controls
}

/**
 * Discovery Payload - Sent by devices when announcing capabilities
 */
export interface DiscoveryPayload {
  mac: string;                   // Device MAC address
  model?: string;                // Device model: "Faber-Pro-Relay-4CH"
  fw?: string;                   // Firmware version: "1.2.0"
  ip?: string;                   // Device IP address
  entities: DeviceEntity[];      // List of device entities/capabilities
}

/**
 * Home Entity Response - Entity with device context
 * Returned from GET /mobile/home/:homeId/entities
 */
export interface HomeEntityResponse {
  device_id: string;
  device_name: string;
  device_mac: string;
  room_id?: string;
  room_name?: string;
  is_online: boolean;
  entity: DeviceEntity;
}

/**
 * Entity Value - Real-time value for an entity
 */
export interface EntityValue {
  entityId: string;
  deviceId: string;
  value: string | number | boolean;
  timestamp: number;
}

/**
 * Entity Update Payload - WebSocket message for entity updates
 */
export interface EntityUpdatePayload {
  entityId: string;
  deviceId: string;
  value: string | number | boolean;
  timestamp: number;
}

/**
 * Device Discovered Payload - WebSocket message when device announces entities
 */
export interface DeviceDiscoveredPayload {
  deviceId: string;
  mac: string;
  entities: DeviceEntity[];
}

/**
 * Device Offline Payload - WebSocket message when device goes offline (LWT)
 */
export interface DeviceOfflinePayload {
  deviceId: string;
  mac: string;
}

/**
 * Format entity value based on type and unit
 * Handles floating point precision
 */
export function formatEntityValue(
  value: string | number | boolean,
  entity: DeviceEntity
): string {
  if (typeof value === 'boolean') {
    return value ? 'ON' : 'OFF';
  }

  if (typeof value === 'number') {
    // Format based on device class or default to 1 decimal
    const precision = entity.device_class === 'power' ? 0 : 1;
    return value.toFixed(precision);
  }

  return String(value);
}

/**
 * Get icon for entity based on type and device class
 */
export function getEntityIcon(entity: DeviceEntity): string {
  if (entity.icon) return entity.icon;

  // Default icons based on type
  const typeIcons: Record<EntityType, string> = {
    switch: 'mdi:toggle-switch',
    sensor: 'mdi:gauge',
    light: 'mdi:lightbulb',
    cover: 'mdi:blinds',
    binary_sensor: 'mdi:motion-sensor',
    climate: 'mdi:thermostat',
    fan: 'mdi:fan',
    lock: 'mdi:lock',
  };

  // Override based on device class
  if (entity.device_class) {
    const classIcons: Partial<Record<DeviceClass, string>> = {
      temperature: 'mdi:thermometer',
      humidity: 'mdi:water-percent',
      power: 'mdi:flash',
      battery: 'mdi:battery',
      motion: 'mdi:motion-sensor',
      door: 'mdi:door',
      window: 'mdi:window-closed',
    };
    return classIcons[entity.device_class] || typeIcons[entity.type];
  }

  return typeIcons[entity.type];
}
