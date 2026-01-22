'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { HassEntity } from '@/types/hass';
import { isStateActive, getStateColor } from '@/contexts/ThemeContext';
import {
  Sun, SunDim, Lightbulb, LightbulbOff,
  Power, PowerOff,
  Thermometer, ThermometerSun, ThermometerSnowflake,
  CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets,
  Lock, LockOpen, Unlock,
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Home, MapPin, User, Users,
  Plug, PlugZap,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Wifi, WifiOff,
  Volume2, VolumeX, Play, Pause, SkipForward, SkipBack,
  Camera, Video,
  Fan, AirVent,
  Droplet, Waves,
  Flame,
  Gauge,
  Calendar, Clock,
  Bell, BellOff,
  Eye, EyeOff,
  Activity, Heart,
  AlertTriangle, AlertCircle, Info, CheckCircle,
  Settings, Cog,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';

// ============================================
// Icon Mapping
// ============================================

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  // Lighting
  light: Lightbulb,
  
  // Switches
  switch: Power,
  input_boolean: Power,
  
  // Climate
  climate: Thermometer,
  fan: Fan,
  humidifier: Droplet,
  water_heater: Flame,
  
  // Weather
  weather: CloudSun,
  
  // Security
  lock: Lock,
  alarm_control_panel: Shield,
  
  // Presence
  person: User,
  device_tracker: MapPin,
  zone: Home,
  
  // Media
  media_player: Volume2,
  camera: Camera,
  
  // Sensors
  sensor: Gauge,
  binary_sensor: Activity,
  
  // Input
  input_number: Settings,
  input_select: Settings,
  input_text: Settings,
  input_datetime: Calendar,
  input_button: Power,
  
  // Automation
  automation: Cog,
  script: Cog,
  scene: Home,
  
  // Misc
  button: Power,
  cover: Home,
  vacuum: Fan,
  
  // Default
  default: HelpCircle,
};

const STATE_ICONS: Record<string, Record<string, LucideIcon>> = {
  light: {
    on: Lightbulb,
    off: LightbulbOff,
  },
  switch: {
    on: Power,
    off: PowerOff,
  },
  lock: {
    locked: Lock,
    unlocked: Unlock,
    locking: Lock,
    unlocking: LockOpen,
  },
  alarm_control_panel: {
    disarmed: ShieldOff,
    armed_home: ShieldCheck,
    armed_away: ShieldCheck,
    armed_night: ShieldCheck,
    armed_vacation: ShieldCheck,
    armed_custom_bypass: ShieldCheck,
    pending: ShieldAlert,
    arming: ShieldAlert,
    triggered: ShieldAlert,
  },
  climate: {
    off: Thermometer,
    heat: ThermometerSun,
    cool: ThermometerSnowflake,
    heat_cool: Thermometer,
    auto: Thermometer,
    dry: AirVent,
    fan_only: Fan,
  },
  weather: {
    sunny: Sun,
    'clear-night': SunDim,
    partlycloudy: CloudSun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: CloudSnow,
    lightning: CloudLightning,
    windy: Wind,
    fog: Cloud,
    hail: CloudSnow,
  },
  person: {
    home: Home,
    not_home: MapPin,
  },
  device_tracker: {
    home: Home,
    not_home: MapPin,
  },
  media_player: {
    playing: Play,
    paused: Pause,
    idle: Volume2,
    off: VolumeX,
  },
};

const DEVICE_CLASS_ICONS: Record<string, LucideIcon> = {
  // Binary sensor device classes
  battery: BatteryLow,
  battery_charging: BatteryCharging,
  connectivity: Wifi,
  door: Home,
  garage_door: Home,
  gas: AlertTriangle,
  heat: Flame,
  light: Sun,
  lock: Lock,
  moisture: Droplet,
  motion: Activity,
  occupancy: Users,
  opening: Home,
  plug: Plug,
  power: PlugZap,
  presence: User,
  problem: AlertCircle,
  safety: ShieldAlert,
  smoke: AlertTriangle,
  sound: Volume2,
  tamper: AlertTriangle,
  vibration: Activity,
  window: Home,
  
  // Sensor device classes
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Gauge,
  illuminance: Sun,
  energy: PlugZap,
  power_factor: Gauge,
  voltage: Gauge,
  current: Gauge,
  frequency: Activity,
  signal_strength: Wifi,
  timestamp: Clock,
  date: Calendar,
  duration: Clock,
};

// ============================================
// Get Icon for Entity
// ============================================

function getIconForEntity(stateObj: HassEntity): LucideIcon {
  const domain = stateObj.entity_id.split('.')[0];
  const state = stateObj.state;
  const deviceClass = stateObj.attributes.device_class;
  
  // Check for custom icon in attributes
  // (We'll return our best match instead)
  
  // Check device class first
  if (deviceClass && DEVICE_CLASS_ICONS[deviceClass]) {
    return DEVICE_CLASS_ICONS[deviceClass];
  }
  
  // Check state-specific icons
  if (STATE_ICONS[domain]?.[state]) {
    return STATE_ICONS[domain][state];
  }
  
  // Fallback to domain icon
  return DOMAIN_ICONS[domain] || DOMAIN_ICONS.default;
}

// ============================================
// HaStateIcon Props
// ============================================

export interface HaStateIconProps {
  stateObj?: HassEntity;
  icon?: string;
  state?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  stateColor?: boolean;
  color?: string;
}

// ============================================
// Size Mapping
// ============================================

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
};

// ============================================
// HaStateIcon Component
// ============================================

export function HaStateIcon({
  stateObj,
  icon,
  state,
  size = 'md',
  className,
  stateColor = true,
  color,
}: HaStateIconProps) {
  // Get the icon component
  let IconComponent: LucideIcon = HelpCircle;
  
  if (stateObj) {
    IconComponent = getIconForEntity(stateObj);
  }
  
  // Compute color
  let iconColor = color;
  if (!iconColor && stateColor && stateObj) {
    const domain = stateObj.entity_id.split('.')[0];
    const active = isStateActive(stateObj.state, domain);
    
    if (active) {
      iconColor = getStateColor(stateObj.state, domain, stateObj.attributes);
    } else {
      iconColor = 'var(--state-inactive-color)';
    }
  }
  
  const iconSize = SIZE_MAP[size];
  
  return (
    <IconComponent
      size={iconSize}
      className={cn('transition-colors duration-200', className)}
      style={{ color: iconColor }}
    />
  );
}

// ============================================
// Preset Icon Components
// ============================================

export function LightIcon({ on = false, size = 24, className }: { on?: boolean; size?: number; className?: string }) {
  const Icon = on ? Lightbulb : LightbulbOff;
  return (
    <Icon 
      size={size} 
      className={cn(
        on ? 'text-[var(--state-light-active-color)]' : 'text-[var(--state-inactive-color)]',
        className
      )}
    />
  );
}

export function SwitchIcon({ on = false, size = 24, className }: { on?: boolean; size?: number; className?: string }) {
  const Icon = on ? Power : PowerOff;
  return (
    <Icon 
      size={size} 
      className={cn(
        on ? 'text-[var(--state-switch-active-color)]' : 'text-[var(--state-inactive-color)]',
        className
      )}
    />
  );
}

export function ClimateIcon({ hvacAction, size = 24, className }: { hvacAction?: string; size?: number; className?: string }) {
  let Icon = Thermometer;
  let colorClass = 'text-[var(--state-icon-color)]';
  
  switch (hvacAction) {
    case 'heating':
      Icon = ThermometerSun;
      colorClass = 'text-[var(--state-climate-heat-color)]';
      break;
    case 'cooling':
      Icon = ThermometerSnowflake;
      colorClass = 'text-[var(--state-climate-cool-color)]';
      break;
    case 'idle':
      colorClass = 'text-[var(--state-climate-idle-color)]';
      break;
  }
  
  return <Icon size={size} className={cn(colorClass, className)} />;
}

export function BatteryIcon({ level = 100, charging = false, size = 24, className }: { level?: number; charging?: boolean; size?: number; className?: string }) {
  let Icon = BatteryFull;
  let colorClass = 'text-[var(--success-color)]';
  
  if (charging) {
    Icon = BatteryCharging;
    colorClass = 'text-[var(--primary-color)]';
  } else if (level <= 10) {
    Icon = BatteryLow;
    colorClass = 'text-[var(--error-color)]';
  } else if (level <= 30) {
    Icon = BatteryLow;
    colorClass = 'text-[var(--warning-color)]';
  } else if (level <= 70) {
    Icon = BatteryMedium;
    colorClass = 'text-[var(--info-color)]';
  }
  
  return <Icon size={size} className={cn(colorClass, className)} />;
}

export function WeatherIcon({ condition, size = 24, className }: { condition?: string; size?: number; className?: string }) {
  const Icon = STATE_ICONS.weather[condition || 'sunny'] || CloudSun;
  return <Icon size={size} className={cn('text-[var(--state-icon-color)]', className)} />;
}

export default HaStateIcon;
