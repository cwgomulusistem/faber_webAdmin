import type { HassEntity, HassContext } from '@/types/hass';

// ============================================
// Domain Utilities
// ============================================

export function computeDomain(entityId: string): string {
  return entityId.split('.')[0];
}

export function computeObjectId(entityId: string): string {
  return entityId.split('.')[1];
}

// ============================================
// State Helpers
// ============================================

export const UNAVAILABLE = 'unavailable';
export const UNKNOWN = 'unknown';

export const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN] as const;

export function isAvailable(stateObj: HassEntity): boolean {
  return !UNAVAILABLE_STATES.includes(stateObj.state as any);
}

export function isUnavailable(stateObj: HassEntity): boolean {
  return UNAVAILABLE_STATES.includes(stateObj.state as any);
}

// ============================================
// On/Off States
// ============================================

export const ON_STATES = ['on', 'open', 'unlocked', 'playing', 'home', 'active'] as const;
export const OFF_STATES = ['off', 'closed', 'locked', 'paused', 'not_home', 'standby', 'idle'] as const;

export function isOn(stateObj: HassEntity): boolean {
  return ON_STATES.includes(stateObj.state as any);
}

export function isOff(stateObj: HassEntity): boolean {
  return OFF_STATES.includes(stateObj.state as any);
}

// ============================================
// Domain Specific Helpers
// ============================================

export function isLightOn(stateObj: HassEntity): boolean {
  return stateObj.state === 'on';
}

export function isSwitchOn(stateObj: HassEntity): boolean {
  return stateObj.state === 'on';
}

export function isClimateActive(stateObj: HassEntity): boolean {
  return !['off', 'unavailable', 'unknown'].includes(stateObj.state);
}

export function isMediaPlayerPlaying(stateObj: HassEntity): boolean {
  return stateObj.state === 'playing';
}

export function isLockLocked(stateObj: HassEntity): boolean {
  return stateObj.state === 'locked';
}

export function isAlarmArmed(stateObj: HassEntity): boolean {
  return stateObj.state.includes('armed');
}

export function isAlarmPending(stateObj: HassEntity): boolean {
  return stateObj.state === 'pending' || stateObj.state === 'arming';
}

export function isPersonHome(stateObj: HassEntity): boolean {
  return stateObj.state === 'home';
}

// ============================================
// Binary Sensor Helpers
// ============================================

export function isBinarySensorOn(stateObj: HassEntity): boolean {
  return stateObj.state === 'on';
}

export function getBinarySensorDeviceClass(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.device_class;
}

// Dangerous device classes that should show red when on
export const BINARY_SENSOR_DANGER_CLASSES = [
  'battery',
  'gas',
  'problem',
  'safety',
  'smoke',
  'tamper',
] as const;

export function isBinarySensorDangerous(stateObj: HassEntity): boolean {
  const deviceClass = getBinarySensorDeviceClass(stateObj);
  return BINARY_SENSOR_DANGER_CLASSES.includes(deviceClass as any);
}

// ============================================
// Light Helpers
// ============================================

export function getLightBrightness(stateObj: HassEntity): number | undefined {
  return stateObj.attributes.brightness;
}

export function getLightBrightnessPercent(stateObj: HassEntity): number | undefined {
  const brightness = getLightBrightness(stateObj);
  if (brightness === undefined) return undefined;
  return Math.round((brightness / 255) * 100);
}

export function getLightRgbColor(stateObj: HassEntity): [number, number, number] | undefined {
  return stateObj.attributes.rgb_color;
}

export function getLightColorTemp(stateObj: HassEntity): number | undefined {
  return stateObj.attributes.color_temp;
}

// ============================================
// Climate Helpers
// ============================================

export function getClimateCurrentTemp(stateObj: HassEntity): number | undefined {
  return stateObj.attributes.current_temperature;
}

export function getClimateTargetTemp(stateObj: HassEntity): number | undefined {
  return stateObj.attributes.temperature;
}

export function getClimateHvacAction(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.hvac_action;
}

export function getClimateHvacModes(stateObj: HassEntity): string[] {
  return stateObj.attributes.hvac_modes || [];
}

export function getClimateMinTemp(stateObj: HassEntity): number {
  return stateObj.attributes.min_temp || 7;
}

export function getClimateMaxTemp(stateObj: HassEntity): number {
  return stateObj.attributes.max_temp || 35;
}

// ============================================
// Media Player Helpers
// ============================================

export function getMediaPlayerVolume(stateObj: HassEntity): number | undefined {
  return stateObj.attributes.volume_level;
}

export function getMediaPlayerVolumePercent(stateObj: HassEntity): number | undefined {
  const volume = getMediaPlayerVolume(stateObj);
  if (volume === undefined) return undefined;
  return Math.round(volume * 100);
}

export function getMediaPlayerSource(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.source;
}

export function getMediaPlayerMediaTitle(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.media_title;
}

export function getMediaPlayerMediaArtist(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.media_artist;
}

// ============================================
// Sensor Helpers
// ============================================

export function getSensorValue(stateObj: HassEntity): number | undefined {
  const value = parseFloat(stateObj.state);
  return isNaN(value) ? undefined : value;
}

export function getSensorUnit(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.unit_of_measurement;
}

export function getSensorDeviceClass(stateObj: HassEntity): string | undefined {
  return stateObj.attributes.device_class;
}

// ============================================
// Entity Sorting
// ============================================

export function sortEntitiesByName(entities: HassEntity[]): HassEntity[] {
  return [...entities].sort((a, b) => {
    const nameA = a.attributes.friendly_name || a.entity_id;
    const nameB = b.attributes.friendly_name || b.entity_id;
    return nameA.localeCompare(nameB);
  });
}

export function sortEntitiesByDomain(entities: HassEntity[]): HassEntity[] {
  return [...entities].sort((a, b) => {
    const domainA = computeDomain(a.entity_id);
    const domainB = computeDomain(b.entity_id);
    if (domainA !== domainB) {
      return domainA.localeCompare(domainB);
    }
    return a.entity_id.localeCompare(b.entity_id);
  });
}

export function sortEntitiesByState(entities: HassEntity[]): HassEntity[] {
  return [...entities].sort((a, b) => {
    // Active states first
    const aActive = isOn(a) ? 0 : 1;
    const bActive = isOn(b) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    
    // Then by name
    const nameA = a.attributes.friendly_name || a.entity_id;
    const nameB = b.attributes.friendly_name || b.entity_id;
    return nameA.localeCompare(nameB);
  });
}

// ============================================
// Entity Filtering
// ============================================

export function filterEntitiesByDomain(entities: HassEntity[], domain: string): HassEntity[] {
  return entities.filter(e => computeDomain(e.entity_id) === domain);
}

export function filterEntitiesByDomains(entities: HassEntity[], domains: string[]): HassEntity[] {
  return entities.filter(e => domains.includes(computeDomain(e.entity_id)));
}

export function filterActiveEntities(entities: HassEntity[]): HassEntity[] {
  return entities.filter(isOn);
}

export function filterAvailableEntities(entities: HassEntity[]): HassEntity[] {
  return entities.filter(isAvailable);
}

// ============================================
// Entity Name Computation
// ============================================

export function computeEntityName(
  hass: HassContext,
  stateObj: HassEntity | undefined,
  configName?: string
): string {
  if (configName) return configName;
  if (!stateObj) return '';
  
  // Check entity registry for custom name
  const entityEntry = hass.entities?.[stateObj.entity_id];
  if (entityEntry?.name) return entityEntry.name;
  
  // Fallback to friendly_name or entity_id
  return stateObj.attributes.friendly_name || stateObj.entity_id;
}

// ============================================
// State Display Formatting
// ============================================

export function formatEntityStateForDisplay(
  hass: HassContext,
  stateObj: HassEntity
): string {
  if (!isAvailable(stateObj)) {
    return stateObj.state.charAt(0).toUpperCase() + stateObj.state.slice(1);
  }
  
  return hass.formatEntityState?.(stateObj) || stateObj.state;
}
