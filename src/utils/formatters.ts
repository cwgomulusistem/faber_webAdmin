// Formatters
// Data formatting utilities

import { DEVICE_TYPE_ICONS, DEVICE_SOURCE_LABELS, SCENE_TRIGGER_LABELS } from './constants';

/**
 * Format device type with icon
 */
export function formatDeviceType(type: string): string {
  const icon = DEVICE_TYPE_ICONS[type] || '📱';
  const label = type.replace(/_/g, ' ').toLowerCase();
  return `${icon} ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

/**
 * Get device type icon
 */
export function getDeviceIcon(type: string): string {
  return DEVICE_TYPE_ICONS[type] || '📱';
}

/**
 * Format device source
 */
export function formatDeviceSource(source: string): string {
  return DEVICE_SOURCE_LABELS[source] || source;
}

/**
 * Format scene trigger
 */
export function formatSceneTrigger(trigger: string): string {
  return SCENE_TRIGGER_LABELS[trigger] || trigger;
}

/**
 * Format temperature (Celsius)
 */
export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`;
}

/**
 * Format humidity (percentage)
 */
export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format power consumption (Watt)
 */
export function formatPower(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kW`;
  }
  return `${value.toFixed(1)} W`;
}

/**
 * Format energy (kWh)
 */
export function formatEnergy(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

/**
 * Format brightness (0-100)
 */
export function formatBrightness(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format device status
 */
export function formatDeviceStatus(isOnline: boolean): string {
  return isOnline ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with Turkish locale
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency (TRY)
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  });
}
